export type AuthMethod = 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'none';

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface IntegrationTrigger {
  id: string;
  name: string;
  description: string;
  outputSchema: Record<string, any>;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'ai' | 'communication' | 'productivity' | 'crm' | 'developer';
  authMethod: AuthMethod;
  isImplemented: boolean;
  triggers: IntegrationTrigger[];
  actions: IntegrationAction[];
  docsUrl?: string;
}

export interface Credential {
  id: string;
  userId: string;
  name: string;
  type: string; // e.g., 'grok', 'email', 'custom_header'
  encryptedData: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}
