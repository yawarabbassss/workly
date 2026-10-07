import fs from 'fs';
import path from 'path';
import { Workflow, Template, WorkflowDefinition } from '../types/workflow';
import { WorkflowExecution, NodeExecutionRecord, ExecutionFilter } from '../types/execution';
import { Credential } from '../types/integration';
import { UserProfile, SubscriptionPlan, MODEL_CREDIT_COSTS, PLAN_LIMITS } from '../types/user';
import { generateWebhookToken } from '../engine/crypto';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';

interface StorageData {
  users: UserProfile[];
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
    description: 'Receives new leads via Webhook, analyzes buyer intent with Grok/Claude/GPT AI, evaluates score, and routes high-value prospects.',
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
            label: 'AI Lead Intelligence',
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
              body: 'A high-value lead was qualified by AI!\n\nLead Name: {{trigger.name}}\nEmail: {{trigger.email}}\nCompany: {{trigger.company}}\nAI Reasoning: {{node_ai_analyze.reason}}\nScore: {{node_ai_analyze.score}}/100'
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
    tags: ['AI Node', 'HTTP Action', 'Condition', 'Routing'],
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
            label: 'AI Urgency Classifier',
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
              body: 'Urgent ticket detected by AI!\n\nCustomer: {{trigger.customer}}\nCategory: {{node_ai_classify.department}}\nSummary: {{node_ai_classify.summary}}'
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
  }
];

class StorageEngine {
  private inMemoryCache: StorageData | null = null;

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DATA_FILE)) {
        const initialData: StorageData = {
          users: [],
          workflows: [],
          executions: [],
          credentials: [],
          templates: DEFAULT_TEMPLATES,
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
        users: [],
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

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================
  getUsers(): UserProfile[] {
    return this.readData().users;
  }

  getUserById(id: string): UserProfile | null {
    return this.readData().users.find(u => u.id === id) || null;
  }

  getUserByEmail(email: string): UserProfile | null {
    return this.readData().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(user: { id?: string; email: string; fullName?: string; subscriptionPlan?: SubscriptionPlan }): UserProfile {
    const data = this.readData();
    const plan = user.subscriptionPlan || 'free';
    const newUser: UserProfile = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: user.email,
      fullName: user.fullName || user.email.split('@')[0],
      subscriptionPlan: plan,
      aiCreditsUsed: 0,
      aiCreditsTotal: plan === 'premium' ? 1000 : 0,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    this.writeData(data);

    // Sync to Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      Promise.resolve(
        supabaseAdmin.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.fullName,
          subscription_plan: newUser.subscriptionPlan,
          ai_credits_used: newUser.aiCreditsUsed,
          ai_credits_total: newUser.aiCreditsTotal,
        })
      ).catch(err => console.warn('Supabase profile sync error:', err));
    }

    return newUser;
  }

  updateUserSubscription(userId: string, plan: SubscriptionPlan, stripeData?: { customerId?: string; subscriptionId?: string }): UserProfile | null {
    const data = this.readData();
    const index = data.users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    data.users[index].subscriptionPlan = plan;
    data.users[index].aiCreditsTotal = plan === 'premium' ? 1000 : 0;
    if (stripeData?.customerId) data.users[index].stripeCustomerId = stripeData.customerId;
    if (stripeData?.subscriptionId) data.users[index].stripeSubscriptionId = stripeData.subscriptionId;

    this.writeData(data);
    return data.users[index];
  }

  consumeAICredits(userId: string, model: string): { allowed: boolean; remaining: number; consumed: number; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { allowed: false, remaining: 0, consumed: 0, error: 'User not found' };

    // 1. Free plan has NO AI capabilities
    if (user.subscriptionPlan === 'free') {
      return {
        allowed: false,
        remaining: 0,
        consumed: 0,
        error: 'AI automations and AI Workflow Builder are not available on the Free plan. Please upgrade to Pro or Premium.',
      };
    }

    // 2. Pro plan uses their own BYOK keys (unlimited managed credits)
    if (user.subscriptionPlan === 'pro') {
      return { allowed: true, remaining: 999999, consumed: 0 };
    }

    // 3. Premium plan uses Workly managed keys with credit limits
    const cost = MODEL_CREDIT_COSTS[model] || 2;
    const remaining = user.aiCreditsTotal - user.aiCreditsUsed;

    if (remaining < cost) {
      return {
        allowed: false,
        remaining,
        consumed: 0,
        error: `Insufficient AI credits (${remaining} left, ${cost} required for ${model}). Reset or add your own API key in Pro plan.`,
      };
    }

    const data = this.readData();
    const index = data.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      data.users[index].aiCreditsUsed += cost;
      this.writeData(data);
    }

    return {
      allowed: true,
      remaining: remaining - cost,
      consumed: cost,
    };
  }

  deleteUser(userId: string): boolean {
    const data = this.readData();
    data.users = data.users.filter(u => u.id !== userId);
    data.workflows = data.workflows.filter(w => w.userId !== userId);
    data.executions = data.executions.filter(e => e.userId !== userId);
    data.credentials = data.credentials.filter(c => c.userId !== userId);
    this.writeData(data);

    if (isSupabaseConfigured() && supabaseAdmin) {
      Promise.resolve(
        supabaseAdmin.from('profiles').delete().eq('id', userId)
      ).catch(err => console.warn('Supabase user delete error:', err));
    }
    return true;
  }

  // ==========================================
  // WORKFLOWS
  // ==========================================
  getWorkflows(userId?: string): Workflow[] {
    const list = this.readData().workflows;
    if (userId) {
      return list.filter(w => w.userId === userId);
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
    const user = this.getUserById(workflowData.userId);
    const plan = user?.subscriptionPlan || 'free';
    const limit = PLAN_LIMITS[plan].maxWorkflows;

    const userWorkflows = this.getWorkflows(workflowData.userId);
    if (userWorkflows.length >= limit) {
      throw new Error(`Plan limit reached: ${PLAN_LIMITS[plan].name} plan allows up to ${limit} active workflows. Please upgrade to create more.`);
    }

    const data = this.readData();
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: workflowData.userId,
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

  // ==========================================
  // EXECUTIONS
  // ==========================================
  getExecutions(filter?: ExecutionFilter): { executions: WorkflowExecution[]; total: number } {
    const data = this.readData();
    let list = [...data.executions];

    if (filter?.workflowId) {
      list = list.filter(e => e.workflowId === filter.workflowId);
    }
    if (filter?.status) {
      list = list.filter(e => e.status === filter.status);
    }

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

  // ==========================================
  // CREDENTIALS (BYOK)
  // ==========================================
  getCredentials(userId: string): Credential[] {
    return this.readData().credentials.filter(c => c.userId === userId);
  }

  saveCredential(cred: { userId: string; name: string; type: string; encryptedData: string }): Credential {
    const user = this.getUserById(cred.userId);
    if (user?.subscriptionPlan === 'free') {
      throw new Error('Custom API keys (BYOK) require a Pro or Premium subscription.');
    }

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

  // ==========================================
  // TEMPLATES
  // ==========================================
  getTemplates(): Template[] {
    return this.readData().templates;
  }

  getTemplateById(id: string): Template | null {
    return this.readData().templates.find(t => t.id === id) || null;
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  getDashboardStats(userId?: string) {
    const data = this.readData();
    const workflows = userId ? data.workflows.filter(w => w.userId === userId) : data.workflows;
    const executions = userId ? data.executions.filter(e => e.userId === userId) : data.executions;
    const user = userId ? this.getUserById(userId) : null;

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
      subscriptionPlan: user?.subscriptionPlan || 'free',
      aiCreditsUsed: user?.aiCreditsUsed || 0,
      aiCreditsTotal: user?.aiCreditsTotal || 0,
      recentExecutions: executions.slice(0, 8),
      recentWorkflows: workflows.slice(0, 6),
    };
  }
}

export const db = new StorageEngine();
