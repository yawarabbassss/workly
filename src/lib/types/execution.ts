import { NodeType } from './workflow';

export type ExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export type NodeExecutionStatus =
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED'
  | 'WAITING';

export interface NodeExecutionRecord {
  id: string;
  executionId: string;
  workflowId: string;
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: NodeExecutionStatus;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  retryCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName?: string;
  userId: string;
  status: ExecutionStatus;
  triggerType: 'manual' | 'webhook' | 'schedule';
  triggerPayload: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  retryOf?: string;
  nodeExecutions: NodeExecutionRecord[];
}

export interface ExecutionFilter {
  workflowId?: string;
  status?: ExecutionStatus;
  limit?: number;
  offset?: number;
}
