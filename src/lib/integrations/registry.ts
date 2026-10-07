import { Integration } from '../types/integration';

export const INTEGRATIONS_REGISTRY: Integration[] = [
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Trigger workflows and receive real-time HTTP payloads from any third-party app or backend.',
    icon: 'Webhook',
    category: 'core',
    authMethod: 'none',
    isImplemented: true,
    triggers: [
      {
        id: 'catch_hook',
        name: 'Catch Webhook',
        description: 'Receives incoming JSON, form-data, or raw payloads at a dedicated endpoint URL.',
        outputSchema: {
          payload: 'Record<string, any>',
          headers: 'Record<string, string>',
        },
      },
    ],
    actions: [
      {
        id: 'webhook_response',
        name: 'Return Webhook Response',
        description: 'Sends custom HTTP status code and response body back to the caller.',
        inputSchema: {
          statusCode: 'number',
          body: 'Record<string, any>',
        },
        outputSchema: {
          status: 'number',
        },
      },
    ],
  },
  {
    id: 'grok_ai',
    name: 'xAI Grok Intelligence',
    description: 'Power your automations with Grok-2 real-time reasoning, document analysis, and natural language synthesis.',
    icon: 'Sparkles',
    category: 'ai',
    authMethod: 'api_key',
    isImplemented: true,
    triggers: [],
    actions: [
      {
        id: 'generate_completion',
        name: 'Generate Grok Reasoning',
        description: 'Executes advanced prompt with dynamic variable bindings.',
        inputSchema: {
          prompt: 'string',
          model: 'string',
          temperature: 'number',
        },
        outputSchema: {
          response: 'string',
          parsed: 'any',
        },
      },
    ],
  },
  {
    id: 'http_api',
    name: 'HTTP & Custom APIs',
    description: 'Connect to any REST API endpoint with GET, POST, PUT, PATCH, DELETE and SSRF safety protection.',
    icon: 'Globe',
    category: 'developer',
    authMethod: 'bearer_token',
    isImplemented: true,
    triggers: [],
    actions: [
      {
        id: 'send_request',
        name: 'Send HTTP Request',
        description: 'Performs HTTP call with dynamic headers, query params, and body.',
        inputSchema: {
          method: 'string',
          url: 'string',
          headers: 'Record<string, string>',
          body: 'any',
        },
        outputSchema: {
          status: 'number',
          data: 'any',
        },
      },
    ],
  },
  {
    id: 'email',
    name: 'Email & Notifications',
    description: 'Send transactional emails, qualified lead notifications, and operational alerts to any recipient.',
    icon: 'Mail',
    category: 'communication',
    authMethod: 'api_key',
    isImplemented: true,
    triggers: [],
    actions: [
      {
        id: 'send_email_action',
        name: 'Send Email Notification',
        description: 'Dispatches rich formatted email with dynamic variables.',
        inputSchema: {
          to: 'string',
          subject: 'string',
          body: 'string',
        },
        outputSchema: {
          dispatched: 'boolean',
          sentAt: 'string',
        },
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Post messages, trigger channel alerts, and collaborate in Slack workspaces.',
    icon: 'MessageSquare',
    category: 'communication',
    authMethod: 'oauth2',
    isImplemented: false,
    triggers: [],
    actions: [
      {
        id: 'post_message',
        name: 'Send Channel Message',
        description: 'Post a notification into a designated Slack channel.',
        inputSchema: { channel: 'string', message: 'string' },
        outputSchema: { ok: 'boolean' },
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automate pull requests, issue triage, and repository webhook events.',
    icon: 'Github',
    category: 'developer',
    authMethod: 'bearer_token',
    isImplemented: false,
    triggers: [],
    actions: [],
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Append rows, update records, and read spreadsheets automatically.',
    icon: 'Table',
    category: 'productivity',
    authMethod: 'oauth2',
    isImplemented: false,
    triggers: [],
    actions: [],
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Create and update contacts, deals, and sales pipelines.',
    icon: 'Building2',
    category: 'crm',
    authMethod: 'api_key',
    isImplemented: false,
    triggers: [],
    actions: [],
  },
];
