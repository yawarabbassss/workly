import { WorkflowDefinition, NodeType } from '../types/workflow';

export const ALLOWED_NODE_TYPES: NodeType[] = [
  'manual_trigger',
  'webhook_trigger',
  'schedule_trigger',
  'http_request',
  'grok_ai',
  'condition',
  'delay',
  'loop',
  'send_email',
  'webhook_response',
];

export interface ValidationError {
  nodeId?: string;
  field?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a complete workflow definition before saving or executing
 */
export function validateWorkflowDefinition(definition: WorkflowDefinition): ValidationResult {
  const errors: ValidationError[] = [];

  if (!definition || !Array.isArray(definition.nodes)) {
    return {
      isValid: false,
      errors: [{ message: 'Workflow definition must contain a valid nodes array.' }],
    };
  }

  if (definition.nodes.length === 0) {
    return {
      isValid: false,
      errors: [{ message: 'Workflow must have at least one trigger node.' }],
    };
  }

  // 1. Check for Trigger
  const triggerNodes = definition.nodes.filter(n =>
    n.data && (n.data.type === 'manual_trigger' || n.data.type === 'webhook_trigger' || n.data.type === 'schedule_trigger')
  );

  if (triggerNodes.length === 0) {
    errors.push({
      message: 'Workflow must contain at least one trigger node (Manual, Webhook, or Schedule).',
    });
  }

  const nodeIds = new Set<string>();

  // 2. Validate individual nodes
  for (const node of definition.nodes) {
    const nodeName = node.data?.label || node.id;

    if (!node.id) {
      errors.push({ message: 'Every node must have a unique ID.' });
      continue;
    }

    if (nodeIds.has(node.id)) {
      errors.push({ nodeId: node.id, message: `Duplicate node ID: "${node.id}".` });
    }
    nodeIds.add(node.id);

    if (!node.data || !node.data.type) {
      errors.push({ nodeId: node.id, message: `Node "${nodeName}" is missing a type definition.` });
      continue;
    }

    if (!ALLOWED_NODE_TYPES.includes(node.data.type)) {
      errors.push({
        nodeId: node.id,
        message: `Node "${nodeName}" has unknown or disallowed type "${node.data.type}".`,
      });
      continue;
    }

    const config = node.data.config || {};

    // Validate type-specific requirements
    switch (node.data.type) {
      case 'http_request':
        if (!config.url || String(config.url).trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'url',
            message: `HTTP Request node "${nodeName}" is missing a URL.`,
          });
        }
        break;

      case 'grok_ai':
        if (!config.prompt || String(config.prompt).trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'prompt',
            message: `Grok AI node "${nodeName}" requires a prompt.`,
          });
        }
        break;

      case 'send_email':
        if (!config.to || String(config.to).trim() === '') {
          errors.push({
            nodeId: node.id,
            field: 'to',
            message: `Send Email node "${nodeName}" is missing a recipient (To) address.`,
          });
        }
        break;

      case 'delay':
        if (config.duration === undefined || Number(config.duration) <= 0) {
          errors.push({
            nodeId: node.id,
            field: 'duration',
            message: `Delay node "${nodeName}" must have a duration greater than 0.`,
          });
        }
        break;

      case 'loop':
        if (!config.itemsField && !config.arrayPath) {
          errors.push({
            nodeId: node.id,
            field: 'itemsField',
            message: `Loop node "${nodeName}" must specify an array or list variable to iterate over.`,
          });
        }
        break;

      case 'condition':
        if (!config.field && (!config.rules || config.rules.length === 0)) {
          errors.push({
            nodeId: node.id,
            field: 'field',
            message: `Condition node "${nodeName}" must specify a field to evaluate.`,
          });
        }
        break;
    }
  }

  // 3. Validate edges
  if (Array.isArray(definition.edges)) {
    for (const edge of definition.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          message: `Connection references non-existent source node "${edge.source}".`,
        });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({
          message: `Connection references non-existent target node "${edge.target}".`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
