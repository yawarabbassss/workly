import fs from 'fs';
import path from 'path';
import { Workflow, Template, WorkflowDefinition } from '../types/workflow';
import { WorkflowExecution, NodeExecutionRecord, ExecutionFilter } from '../types/execution';
import { Credential } from '../types/integration';
import { generateWebhookToken } from '../engine/crypto';

interface StorageData {
  users: Array<{ id: string; email: string; fullName: string; createdAt: string }>;
  workflows: Workflow[];
  executions: WorkflowExecution[];
  credentials: Credential[];
  templates: Template[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'workly.json');

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl_lead_qualification',
    name: 'AI Lead Qualification & CRM Sync',
    description: 'Receives new leads via Webhook, analyzes buyer intent with Grok AI, evaluates qualification score, and routes high-value prospects.',
    category: 'Sales & Marketing',
    icon: 'Sparkles',
    tags: ['Webhook', 'Grok AI', 'Condition', 'Email', 'CRM'],
    definition: {
      nodes: [
        {
          id: 'node_trigger',
          type: 'customNode',
          position: { x: 300, y: 40 },
          data: {
            label: 'Webhook Lead Ingestion',
            type: 'webhook_trigger',
            description: 'Receives POST payload with name, email, company, and message',
            config: {}
          }
        },
        {
          id: 'node_ai_analyze',
          type: 'customNode',
          position: { x: 300, y: 180 },
          data: {
            label: 'Grok Lead Intelligence',
            type: 'grok_ai',
            description: 'Analyzes intent, budget, and readiness to buy',
            config: {
              model: 'grok-2-latest',
              prompt: 'Analyze this sales lead:\nName: {{trigger.name}}\nEmail: {{trigger.email}}\nCompany: {{trigger.company}}\nMessage: {{trigger.message}}\n\nAssess if this lead is high-priority qualified. Return JSON with fields:\n- qualified (boolean)\n- score (0 to 100)\n- priority ("high"|"medium"|"low")\n- reason (string summary)',
              temperature: 0.1
            }
          }
        },
        {
          id: 'node_condition',
          type: 'customNode',
          position: { x: 300, y: 320 },
          data: {
            label: 'Check If Qualified',
            type: 'condition',
            description: 'Branches based on AI score > 70 or qualified == true',
            config: {
              field: '{{node_ai_analyze.qualified}}',
              conditionOperator: 'equals',
              value: 'true'
            }
          }
        },
        {
          id: 'node_email_notify',
          type: 'customNode',
          position: { x: 120, y: 480 },
          data: {
            label: 'Notify Sales Team',
            type: 'send_email',
            description: 'Sends instant alert for qualified opportunity',
            config: {
              to: 'sales@yourcompany.com',
              subject: '🔥 Qualified Enterprise Lead: {{trigger.name}} (Score: {{node_ai_analyze.score}})',
              body: 'A high-value lead was qualified by Grok AI!\n\nLead Name: {{trigger.name}}\nEmail: {{trigger.email}}\nCompany: {{trigger.company}}\nAI Reasoning: {{node_ai_analyze.reason}}\nScore: {{node_ai_analyze.score}}/100'
            }
          }
        },
        {
          id: 'node_sync_crm',
          type: 'customNode',
          position: { x: 480, y: 480 },
          data: {
            label: 'Sync to CRM Webhook',
            type: 'http_request',
            description: 'Posts qualified lead to external CRM endpoint',
            config: {
              method: 'POST',
              url: 'https://httpbin.org/post',
              headers: { 'Content-Type': 'application/json' },
              body: '{\n  "leadName": "{{trigger.name}}",\n  "email": "{{trigger.email}}",\n  "score": "{{node_ai_analyze.score}}",\n  "qualified": true,\n  "source": "Workly Automation"\n}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_trigger', target: 'node_ai_analyze' },
        { id: 'e2', source: 'node_ai_analyze', target: 'node_condition' },
        { id: 'e3', source: 'node_condition', target: 'node_email_notify', label: 'True / Qualified', sourceHandle: 'true' },
        { id: 'e4', source: 'node_condition', target: 'node_sync_crm', label: 'True / Qualified', sourceHandle: 'true' }
      ]
    }
  },
  {
    id: 'tpl_support_router',
    name: 'Customer Support AI Classifier',
    description: 'Classifies customer support tickets into Urgent, Technical, or Billing categories and triggers appropriate escalations.',
    category: 'Support & Ops',
    icon: 'Headphones',
    tags: ['Grok AI', 'HTTP Action', 'Condition', 'Routing'],
    definition: {
      nodes: [
        {
          id: 'node_trigger',
          type: 'customNode',
          position: { x: 300, y: 50 },
          data: {
            label: 'Support Ticket Ingest',
            type: 'webhook_trigger',
            description: 'Receives ticket subject, customer email, and issue description',
            config: {}
          }
        },
        {
          id: 'node_ai_classify',
          type: 'customNode',
          position: { x: 300, y: 190 },
          data: {
            label: 'Grok Urgency Classifier',
            type: 'grok_ai',
            description: 'Categorizes issue urgency (Urgent / Standard / Low)',
            config: {
              model: 'grok-2-latest',
              prompt: 'Classify this ticket:\nSubject: {{trigger.subject}}\nBody: {{trigger.body}}\nCustomer: {{trigger.customer}}\n\nOutput JSON: { "urgency": "urgent"|"standard"|"low", "department": "billing"|"tech"|"general", "summary": string }',
              temperature: 0.1
            }
          }
        },
        {
          id: 'node_cond_urgent',
          type: 'customNode',
          position: { x: 300, y: 330 },
          data: {
            label: 'Is Urgent Issue?',
            type: 'condition',
            description: 'Check if urgency == "urgent"',
            config: {
              field: '{{node_ai_classify.urgency}}',
              conditionOperator: 'equals',
              value: 'urgent'
            }
          }
        },
        {
          id: 'node_email_pager',
          type: 'customNode',
          position: { x: 150, y: 480 },
          data: {
            label: 'PagerDuty / On-Call Alert',
            type: 'send_email',
            description: 'Alert on-call engineers immediately',
            config: {
              to: 'oncall-urgent@yourcompany.com',
              subject: '🚨 URGENT Customer Issue: {{trigger.subject}}',
              body: 'Urgent ticket detected by Grok AI!\n\nCustomer: {{trigger.customer}}\nCategory: {{node_ai_classify.department}}\nSummary: {{node_ai_classify.summary}}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_trigger', target: 'node_ai_classify' },
        { id: 'e2', source: 'node_ai_classify', target: 'node_cond_urgent' },
        { id: 'e3', source: 'node_cond_urgent', target: 'node_email_pager', label: 'Urgent', sourceHandle: 'true' }
      ]
    }
  },
  {
    id: 'tpl_content_distributor',
    name: 'AI Content Repurposer & Publisher',
    description: 'Takes a blog post or release announcement, generates social summaries via Grok, and pushes to external webhook endpoints.',
    category: 'Marketing',
    icon: 'Share2',
    tags: ['Grok AI', 'HTTP Request', 'Content'],
    definition: {
      nodes: [
        {
          id: 'node_trigger',
          type: 'customNode',
          position: { x: 300, y: 50 },
          data: {
            label: 'Manual / Scheduled Trigger',
            type: 'manual_trigger',
            description: 'Trigger manually with new article text',
            config: {}
          }
        },
        {
          id: 'node_ai_draft',
          type: 'customNode',
          position: { x: 300, y: 190 },
          data: {
            label: 'Grok Social Generator',
            type: 'grok_ai',
            description: 'Generates concise LinkedIn & X posts with hashtags',
            config: {
              model: 'grok-2-latest',
              prompt: 'Generate 3 social media snippets for this article:\nTitle: {{trigger.title}}\nContent: {{trigger.content}}\n\nOutput JSON with fields: tweet, linkedin_post, key_takeaway',
              temperature: 0.7
            }
          }
        },
        {
          id: 'node_http_publish',
          type: 'customNode',
          position: { x: 300, y: 340 },
          data: {
            label: 'Publish Webhook Broadcast',
            type: 'http_request',
            description: 'Sends generated snippets to publishing buffer',
            config: {
              method: 'POST',
              url: 'https://httpbin.org/post',
              headers: { 'Content-Type': 'application/json' },
              body: '{\n  "tweet": "{{node_ai_draft.tweet}}",\n  "linkedin": "{{node_ai_draft.linkedin_post}}",\n  "status": "ready"\n}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_trigger', target: 'node_ai_draft' },
        { id: 'e2', source: 'node_ai_draft', target: 'node_http_publish' }
      ]
    }
  }
];

const DEMO_USER = {
  id: 'usr_demo_workly_001',
  email: 'demo@workly.ai',
  fullName: 'Alex Vance',
  createdAt: new Date().toISOString()
};

class StorageEngine {
  private inMemoryCache: StorageData | null = null;

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DATA_FILE)) {
        const initialData: StorageData = {
          users: [DEMO_USER],
          workflows: [
            {
              id: 'wf_lead_qualifier_demo',
              userId: DEMO_USER.id,
              name: 'AI Lead Qualification & Outreach',
              description: 'Processes incoming leads, evaluates with Grok 2, and sends personalized responses.',
              isActive: true,
              status: 'active',
              webhookToken: 'wh_lead_demo_sample_token_8899',
              definition: DEFAULT_TEMPLATES[0].definition,
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              updatedAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'wf_support_triage_demo',
              userId: DEMO_USER.id,
              name: 'VIP Ticket Escalation Engine',
              description: 'Classifies urgent customer requests and triggers immediate on-call dispatch.',
              isActive: true,
              status: 'active',
              webhookToken: 'wh_support_triage_token_1234',
              definition: DEFAULT_TEMPLATES[1].definition,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 7200000).toISOString(),
            }
          ],
          executions: [
            {
              id: 'exec_sample_01',
              workflowId: 'wf_lead_qualifier_demo',
              workflowName: 'AI Lead Qualification & Outreach',
              userId: DEMO_USER.id,
              status: 'SUCCESS',
              triggerType: 'webhook',
              triggerPayload: {
                name: 'Sarah Connor',
                email: 'sarah@cyberdyne-sys.com',
                company: 'Cyberdyne Systems',
                message: 'We are looking to automate our fleet operations across 50 locations.'
              },
              startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              completedAt: new Date(Date.now() - 3600000 * 2 + 1850).toISOString(),
              durationMs: 1850,
              nodeExecutions: [
                {
                  id: 'nexec_01',
                  executionId: 'exec_sample_01',
                  workflowId: 'wf_lead_qualifier_demo',
                  nodeId: 'node_trigger',
                  nodeName: 'Webhook Lead Ingestion',
                  nodeType: 'webhook_trigger',
                  status: 'SUCCESS',
                  inputData: {},
                  outputData: {
                    name: 'Sarah Connor',
                    email: 'sarah@cyberdyne-sys.com',
                    company: 'Cyberdyne Systems',
                    message: 'We are looking to automate our fleet operations across 50 locations.'
                  },
                  startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                  completedAt: new Date(Date.now() - 3600000 * 2 + 50).toISOString(),
                  durationMs: 50,
                  retryCount: 0
                },
                {
                  id: 'nexec_02',
                  executionId: 'exec_sample_01',
                  workflowId: 'wf_lead_qualifier_demo',
                  nodeId: 'node_ai_analyze',
                  nodeName: 'Grok Lead Intelligence',
                  nodeType: 'grok_ai',
                  status: 'SUCCESS',
                  inputData: { prompt: 'Analyze this sales lead: Sarah Connor...' },
                  outputData: {
                    score: 95,
                    qualified: true,
                    priority: 'high',
                    reason: 'Enterprise prospect requesting multi-location automation rollout with high purchasing intent.'
                  },
                  startedAt: new Date(Date.now() - 3600000 * 2 + 55).toISOString(),
                  completedAt: new Date(Date.now() - 3600000 * 2 + 1200).toISOString(),
                  durationMs: 1145,
                  retryCount: 0
                },
                {
                  id: 'nexec_03',
                  executionId: 'exec_sample_01',
                  workflowId: 'wf_lead_qualifier_demo',
                  nodeId: 'node_condition',
                  nodeName: 'Check If Qualified',
                  nodeType: 'condition',
                  status: 'SUCCESS',
                  inputData: { field: true, target: true },
                  outputData: { matched: true, branch: 'true' },
                  startedAt: new Date(Date.now() - 3600000 * 2 + 1205).toISOString(),
                  completedAt: new Date(Date.now() - 3600000 * 2 + 1210).toISOString(),
                  durationMs: 5,
                  retryCount: 0
                },
                {
                  id: 'nexec_04',
                  executionId: 'exec_sample_01',
                  workflowId: 'wf_lead_qualifier_demo',
                  nodeId: 'node_email_notify',
                  nodeName: 'Notify Sales Team',
                  nodeType: 'send_email',
                  status: 'SUCCESS',
                  inputData: { to: 'sales@yourcompany.com', subject: '🔥 Qualified Enterprise Lead: Sarah Connor' },
                  outputData: { dispatched: true, recipient: 'sales@yourcompany.com', timestamp: new Date().toISOString() },
                  startedAt: new Date(Date.now() - 3600000 * 2 + 1215).toISOString(),
                  completedAt: new Date(Date.now() - 3600000 * 2 + 1550).toISOString(),
                  durationMs: 335,
                  retryCount: 0
                },
                {
                  id: 'nexec_05',
                  executionId: 'exec_sample_01',
                  workflowId: 'wf_lead_qualifier_demo',
                  nodeId: 'node_sync_crm',
                  nodeName: 'Sync to CRM Webhook',
                  nodeType: 'http_request',
                  status: 'SUCCESS',
                  inputData: { method: 'POST', url: 'https://httpbin.org/post' },
                  outputData: { status: 200, statusText: 'OK', data: { success: true } },
                  startedAt: new Date(Date.now() - 3600000 * 2 + 1555).toISOString(),
                  completedAt: new Date(Date.now() - 3600000 * 2 + 1850).toISOString(),
                  durationMs: 295,
                  retryCount: 0
                }
              ]
            }
          ],
          credentials: [
            {
              id: 'cred_grok_default',
              userId: DEMO_USER.id,
              name: 'xAI Grok Default Server Key',
              type: 'grok',
              encryptedData: 'internal_configured',
              isValid: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          templates: DEFAULT_TEMPLATES
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('Local FS storage initialization fallback:', e);
    }
  }

  private readData(): StorageData {
    this.ensureDataDir();
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.inMemoryCache = JSON.parse(raw);
        return this.inMemoryCache!;
      }
    } catch (err) {
      console.error('Error reading data file:', err);
    }
    
    if (!this.inMemoryCache) {
      this.inMemoryCache = {
        users: [DEMO_USER],
        workflows: [],
        executions: [],
        credentials: [],
        templates: DEFAULT_TEMPLATES,
      };
    }
    return this.inMemoryCache;
  }

  private writeData(data: StorageData) {
    this.inMemoryCache = data;
    this.ensureDataDir();
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing data file:', err);
    }
  }

  // USER / AUTH
  getUsers() {
    return this.readData().users;
  }

  getUserById(id: string) {
    return this.readData().users.find(u => u.id === id) || null;
  }

  getUserByEmail(email: string) {
    return this.readData().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(user: { id?: string; email: string; fullName: string }) {
    const data = this.readData();
    const newUser = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: user.email,
      fullName: user.fullName || user.email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    this.writeData(data);
    return newUser;
  }

  // WORKFLOWS
  getWorkflows(userId?: string): Workflow[] {
    const list = this.readData().workflows;
    if (userId) {
      return list.filter(w => w.userId === userId || w.userId === DEMO_USER.id);
    }
    return list;
  }

  getWorkflowById(id: string): Workflow | null {
    return this.readData().workflows.find(w => w.id === id) || null;
  }

  getWorkflowByWebhookToken(token: string): Workflow | null {
    return this.readData().workflows.find(w => w.webhookToken === token) || null;
  }

  createWorkflow(workflowData: {
    userId: string;
    name: string;
    description?: string;
    isActive?: boolean;
    definition?: WorkflowDefinition;
  }): Workflow {
    const data = this.readData();
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: workflowData.userId || DEMO_USER.id,
      name: workflowData.name,
      description: workflowData.description || '',
      isActive: workflowData.isActive ?? false,
      status: workflowData.isActive ? 'active' : 'draft',
      webhookToken: generateWebhookToken(),
      definition: workflowData.definition || {
        nodes: [
          {
            id: 'trigger_1',
            type: 'customNode',
            position: { x: 250, y: 100 },
            data: {
              label: 'Manual Trigger',
              type: 'manual_trigger',
              description: 'Starts the workflow when manually triggered',
              config: {},
            },
          },
        ],
        edges: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.workflows.unshift(newWorkflow);
    this.writeData(data);
    return newWorkflow;
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const data = this.readData();
    const index = data.workflows.findIndex(w => w.id === id);
    if (index === -1) return null;

    data.workflows[index] = {
      ...data.workflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.writeData(data);
    return data.workflows[index];
  }

  deleteWorkflow(id: string): boolean {
    const data = this.readData();
    const initialLen = data.workflows.length;
    data.workflows = data.workflows.filter(w => w.id !== id);
    if (data.workflows.length !== initialLen) {
      this.writeData(data);
      return true;
    }
    return false;
  }

  duplicateWorkflow(id: string, userId: string): Workflow | null {
    const original = this.getWorkflowById(id);
    if (!original) return null;

    return this.createWorkflow({
      userId,
      name: `${original.name} (Copy)`,
      description: original.description,
      isActive: false,
      definition: JSON.parse(JSON.stringify(original.definition)),
    });
  }

  // EXECUTIONS
  getExecutions(filter?: ExecutionFilter): { executions: WorkflowExecution[]; total: number } {
    const data = this.readData();
    let list = [...data.executions];

    if (filter?.workflowId) {
      list = list.filter(e => e.workflowId === filter.workflowId);
    }
    if (filter?.status) {
      list = list.filter(e => e.status === filter.status);
    }

    // Sort descending by startedAt
    list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const total = list.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { executions: paginated, total };
  }

  getExecutionById(id: string): WorkflowExecution | null {
    return this.readData().executions.find(e => e.id === id) || null;
  }

  createExecution(execution: {
    workflowId: string;
    workflowName?: string;
    userId: string;
    triggerType: 'manual' | 'webhook' | 'schedule';
    triggerPayload?: Record<string, any>;
    status?: 'QUEUED' | 'RUNNING' | 'WAITING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    retryOf?: string;
  }): WorkflowExecution {
    const data = this.readData();
    const newExec: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workflowId: execution.workflowId,
      workflowName: execution.workflowName || 'Workflow Execution',
      userId: execution.userId,
      status: execution.status || 'RUNNING',
      triggerType: execution.triggerType,
      triggerPayload: execution.triggerPayload || {},
      startedAt: new Date().toISOString(),
      retryOf: execution.retryOf,
      nodeExecutions: [],
    };

    data.executions.unshift(newExec);
    this.writeData(data);
    return newExec;
  }

  updateExecution(id: string, updates: Partial<WorkflowExecution>): WorkflowExecution | null {
    const data = this.readData();
    const index = data.executions.findIndex(e => e.id === id);
    if (index === -1) return null;

    data.executions[index] = {
      ...data.executions[index],
      ...updates,
    };

    this.writeData(data);
    return data.executions[index];
  }

  addNodeExecution(executionId: string, nodeExecution: Omit<NodeExecutionRecord, 'id'>): NodeExecutionRecord {
    const data = this.readData();
    const execIndex = data.executions.findIndex(e => e.id === executionId);
    
    const record: NodeExecutionRecord = {
      ...nodeExecution,
      id: `nexec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    if (execIndex !== -1) {
      data.executions[execIndex].nodeExecutions.push(record);
      this.writeData(data);
    }

    return record;
  }

  // CREDENTIALS
  getCredentials(userId: string): Credential[] {
    return this.readData().credentials.filter(c => c.userId === userId || c.userId === DEMO_USER.id);
  }

  saveCredential(cred: { userId: string; name: string; type: string; encryptedData: string }): Credential {
    const data = this.readData();
    const newCred: Credential = {
      id: `cred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: cred.userId,
      name: cred.name,
      type: cred.type,
      encryptedData: cred.encryptedData,
      isValid: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.credentials.push(newCred);
    this.writeData(data);
    return newCred;
  }

  deleteCredential(id: string): boolean {
    const data = this.readData();
    const len = data.credentials.length;
    data.credentials = data.credentials.filter(c => c.id !== id);
    if (data.credentials.length !== len) {
      this.writeData(data);
      return true;
    }
    return false;
  }

  // TEMPLATES
  getTemplates(): Template[] {
    return this.readData().templates;
  }

  getTemplateById(id: string): Template | null {
    return this.readData().templates.find(t => t.id === id) || null;
  }

  // DASHBOARD STATS
  getDashboardStats(userId?: string) {
    const data = this.readData();
    const workflows = userId ? data.workflows.filter(w => w.userId === userId || w.userId === DEMO_USER.id) : data.workflows;
    const executions = userId ? data.executions.filter(e => e.userId === userId || e.userId === DEMO_USER.id) : data.executions;

    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive).length;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todayExecutions = executions.filter(e => new Date(e.startedAt).getTime() >= startOfDay);
    const successfulExecutions = executions.filter(e => e.status === 'SUCCESS').length;
    const failedExecutions = executions.filter(e => e.status === 'FAILED').length;
    const successRate = executions.length > 0 ? Math.round((successfulExecutions / executions.length) * 100) : 100;

    return {
      totalWorkflows,
      activeWorkflows,
      executionsToday: todayExecutions.length,
      successfulExecutions,
      failedExecutions,
      successRate,
      recentExecutions: executions.slice(0, 8),
      recentWorkflows: workflows.slice(0, 6),
    };
  }
}

export const db = new StorageEngine();
