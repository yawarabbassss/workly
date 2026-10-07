import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';
import { WorkflowExecution, NodeExecutionRecord } from '../types/execution';
import { db } from '../db/storage';
import { interpolateDeep, interpolateString, evaluateCondition, ExecutionContext } from './evaluator';
import { validateSafeUrl } from './ssrf';
import { callGrokAI } from '../ai/grokClient';
import { redactSecrets } from './crypto';

export interface ExecuteWorkflowParams {
  workflow: Workflow;
  triggerType: 'manual' | 'webhook' | 'schedule';
  triggerPayload?: Record<string, any>;
  userId?: string;
  retryOfExecutionId?: string;
}

export class WorkflowEngine {
  /**
   * Executes a workflow end-to-end
   */
  async execute({
    workflow,
    triggerType,
    triggerPayload = {},
    userId,
    retryOfExecutionId,
  }: ExecuteWorkflowParams): Promise<WorkflowExecution> {
    const execution = db.createExecution({
      workflowId: workflow.id,
      workflowName: workflow.name,
      userId: userId || workflow.userId,
      triggerType,
      triggerPayload: redactSecrets(triggerPayload),
      status: 'RUNNING',
      retryOf: retryOfExecutionId,
    });

    const context: ExecutionContext = {
      trigger: triggerPayload,
      workflow: { id: workflow.id, name: workflow.name },
      nodes: {},
      variables: {},
    };

    const startTime = Date.now();

    try {
      const nodes = workflow.definition.nodes;
      const edges = workflow.definition.edges;

      // Find the trigger node
      const triggerNode = nodes.find(
        n =>
          n.data?.type === 'manual_trigger' ||
          n.data?.type === 'webhook_trigger' ||
          n.data?.type === 'schedule_trigger'
      );

      if (!triggerNode) {
        throw new Error('Workflow has no valid trigger node configured.');
      }

      // Graph traversal / execution queue
      const executedNodeIds = new Set<string>();
      const queue: Array<{ node: WorkflowNode; incomingBranch?: string }> = [
        { node: triggerNode },
      ];

      while (queue.length > 0) {
        const { node } = queue.shift()!;
        if (executedNodeIds.has(node.id)) {
          continue;
        }

        const nodeStartTime = Date.now();
        let nodeStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
        let nodeOutput: any = null;
        let nodeError: string | undefined;

        try {
          // Execute specific node type
          nodeOutput = await this.executeNode(node, context);
          
          // Store output in context
          context.nodes![node.id] = {
            output: nodeOutput,
            status: 'SUCCESS',
          };
        } catch (err: any) {
          nodeStatus = 'FAILED';
          nodeError = err.message || 'Execution error';
          nodeOutput = { error: nodeError };
          
          context.nodes![node.id] = {
            output: nodeOutput,
            status: 'FAILED',
          };
        }

        const nodeDuration = Date.now() - nodeStartTime;

        // Record node execution in DB
        db.addNodeExecution(execution.id, {
          executionId: execution.id,
          workflowId: workflow.id,
          nodeId: node.id,
          nodeName: node.data?.label || node.id,
          nodeType: node.data?.type || 'manual_trigger',
          status: nodeStatus,
          inputData: redactSecrets(node.data?.config || {}),
          outputData: redactSecrets(nodeOutput),
          errorMessage: nodeError,
          startedAt: new Date(nodeStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: nodeDuration,
          retryCount: 0,
        });

        executedNodeIds.add(node.id);

        if (nodeStatus === 'FAILED') {
          throw new Error(`Node "${node.data?.label || node.id}" failed: ${nodeError}`);
        }

        // Determine next nodes to execute based on edges and conditions
        const outgoingEdges = edges.filter(e => e.source === node.id);

        for (const edge of outgoingEdges) {
          const nextNode = nodes.find(n => n.id === edge.target);
          if (!nextNode) continue;

          // If current node was a condition node, check matching branch handle
          if (node.data?.type === 'condition') {
            const conditionResult = !!nodeOutput?.matched;
            const branch = edge.sourceHandle || edge.label?.toLowerCase();

            if (conditionResult && (branch === 'true' || branch?.includes('true') || !branch)) {
              queue.push({ node: nextNode, incomingBranch: 'true' });
            } else if (!conditionResult && (branch === 'false' || branch?.includes('false'))) {
              queue.push({ node: nextNode, incomingBranch: 'false' });
            }
          } else {
            queue.push({ node: nextNode });
          }
        }
      }

      // Workflow completed successfully
      const durationMs = Date.now() - startTime;
      return db.updateExecution(execution.id, {
        status: 'SUCCESS',
        completedAt: new Date().toISOString(),
        durationMs,
      })!;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      return db.updateExecution(execution.id, {
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date().toISOString(),
        durationMs,
      })!;
    }
  }

  /**
   * Executes a single node based on its type
   */
  private async executeNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const nodeType = node.data?.type;
    const config = node.data?.config || {};

    switch (nodeType) {
      case 'manual_trigger':
      case 'webhook_trigger':
      case 'schedule_trigger': {
        return context.trigger || {};
      }

      case 'http_request': {
        const rawUrl = interpolateString(config.url || '', context);
        if (!rawUrl) {
          throw new Error('HTTP Request node requires a valid URL.');
        }

        // SSRF Safety Check
        const ssrfCheck = await validateSafeUrl(rawUrl);
        if (!ssrfCheck.safe) {
          throw new Error(`SSRF Protection Blocked Request: ${ssrfCheck.error}`);
        }

        const method = (config.method || 'GET').toUpperCase();
        const headers = interpolateDeep(config.headers || {}, context);
        
        let body: any = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method) && config.body) {
          const interpolatedBody = interpolateDeep(config.body, context);
          body = typeof interpolatedBody === 'string' ? interpolatedBody : JSON.stringify(interpolatedBody);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout limit

        try {
          const response = await fetch(rawUrl, {
            method,
            headers: {
              'User-Agent': 'Workly-Automation-Engine/1.0',
              ...(headers || {}),
            },
            body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeout);

          let responseData: any;
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}: ${typeof responseData === 'string' ? responseData.slice(0, 200) : JSON.stringify(responseData)}`);
          }

          return {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          };
        } catch (err: any) {
          clearTimeout(timeout);
          throw new Error(`HTTP request failed: ${err.message}`);
        }
      }

      case 'grok_ai': {
        const promptTemplate = config.prompt || '';
        const interpolatedPrompt = interpolateString(promptTemplate, context);
        const model = config.model || 'grok-2-latest';
        const temperature = config.temperature !== undefined ? Number(config.temperature) : 0.2;

        const aiResponse = await callGrokAI({
          prompt: interpolatedPrompt,
          model,
          temperature,
        });

        // Try parsing JSON if AI returned JSON
        let parsedOutput: any = aiResponse;
        try {
          const trimmed = aiResponse.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            parsedOutput = JSON.parse(trimmed);
          }
        } catch {
          // Keep raw text
        }

        if (typeof parsedOutput === 'object' && parsedOutput !== null) {
          return {
            ...parsedOutput,
            rawText: aiResponse,
            model,
          };
        }

        return {
          response: aiResponse,
          model,
        };
      }

      case 'condition': {
        const matched = evaluateCondition(config, context);
        return {
          matched,
          branch: matched ? 'true' : 'false',
        };
      }

      case 'delay': {
        const duration = Number(config.duration) || 1;
        const unit = config.unit || 'seconds';
        let ms = duration * 1000;
        if (unit === 'minutes') ms = duration * 60 * 1000;
        if (unit === 'hours') ms = duration * 3600 * 1000;
        if (unit === 'days') ms = duration * 86400 * 1000;

        // Cap runtime execution delay for sync requests (max 5s in direct loop, remainder simulated/logged)
        const activeDelay = Math.min(ms, 3000);
        await new Promise(resolve => setTimeout(resolve, activeDelay));

        return {
          delayedMs: ms,
          unit,
          duration,
          resumedAt: new Date().toISOString(),
        };
      }

      case 'loop': {
        const items = interpolateDeep(config.itemsField || config.items || [], context);
        const arrayToIterate = Array.isArray(items) ? items : [];
        const maxLimit = 50; // Safeguard against infinite loops
        const safeItems = arrayToIterate.slice(0, maxLimit);

        return {
          totalItems: arrayToIterate.length,
          processedItems: safeItems.length,
          items: safeItems,
        };
      }

      case 'send_email': {
        const to = interpolateString(config.to || '', context);
        const subject = interpolateString(config.subject || 'Workly Notification', context);
        const body = interpolateString(config.body || '', context);

        if (!to) {
          throw new Error('Send Email requires a valid recipient address (To).');
        }

        // Email dispatch simulation / provider hook
        return {
          dispatched: true,
          recipient: to,
          subject,
          bodySnippet: body.slice(0, 150),
          sentAt: new Date().toISOString(),
        };
      }

      case 'webhook_response': {
        const status = Number(config.statusCode) || 200;
        const responseBody = interpolateDeep(config.body || { success: true }, context);

        return {
          statusCode: status,
          body: responseBody,
        };
      }

      default:
        throw new Error(`Unsupported node type: "${nodeType}"`);
    }
  }
}

export const workflowEngine = new WorkflowEngine();
