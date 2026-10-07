export type NodeType =
  | 'manual_trigger'
  | 'webhook_trigger'
  | 'schedule_trigger'
  | 'http_request'
  | 'grok_ai'
  | 'condition'
  | 'delay'
  | 'loop'
  | 'send_email'
  | 'webhook_response';

export type NodeCategory = 'trigger' | 'action' | 'ai' | 'logic';

export interface WorkflowNodeData extends Record<string, any> {
  label: string;
  type: NodeType;
  description?: string;
  config: Record<string, any>;
  isValid?: boolean;
  errors?: string[];
  executionState?: 'idle' | 'running' | 'success' | 'failed' | 'waiting';
}

export interface WorkflowNode {
  id: string;
  type: string; // custom node type name in React Flow
  position: { x: number; y: number };
  data: WorkflowNodeData;
  [key: string]: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  animated?: boolean;
  [key: string]: any;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  isActive: boolean;
  status: WorkflowStatus;
  webhookToken?: string;
  scheduleCron?: string;
  definition: WorkflowDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  definition: WorkflowDefinition;
}
