export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  subscriptionPlan: SubscriptionPlan;
  aiCreditsUsed: number;
  aiCreditsTotal: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export const PLAN_LIMITS = {
  free: {
    name: 'Free Starter',
    price: 0,
    priceId: '',
    maxWorkflows: 3,
    maxExecutionsPerMonth: 100,
    aiEnabled: false, // NO AI help on free plan
    byokEnabled: false,
    managedCredits: 0,
    features: [
      '3 Active Workflows',
      '100 Executions / month',
      'Manual & Webhook Triggers',
      'HTTP & Email Actions',
      'Community Templates',
      '❌ No AI Workflow Builder',
      '❌ No BYOK API Keys',
    ],
  },
  pro: {
    name: 'Pro (Bring Your Own Key)',
    price: 10,
    priceId: 'price_workly_pro_monthly',
    maxWorkflows: 50,
    maxExecutionsPerMonth: 5000,
    aiEnabled: true,
    byokEnabled: true, // Use your own Grok, OpenAI, Claude, Gemini keys
    managedCredits: 0,
    features: [
      '50 Active Workflows',
      '5,000 Executions / month',
      'Bring Your Own Keys (BYOK)',
      'Unlimited AI Workflow Generation with your keys',
      'Support for Grok, Claude 3.7, GPT-4o, Gemini 2.5',
      'SSRF Protection & Secret Vault',
      'Priority Execution Queue',
    ],
  },
  premium: {
    name: 'Premium (Managed Cloud AI)',
    price: 50,
    priceId: 'price_workly_premium_monthly',
    maxWorkflows: 200,
    maxExecutionsPerMonth: 50000,
    aiEnabled: true,
    byokEnabled: true,
    managedCredits: 1000, // Monthly managed cloud credits
    features: [
      '200 Active Workflows',
      '50,000 Executions / month',
      '1,000 Workly AI Managed Credits/mo (No key required)',
      'Weighted Model Consumption (Gemini 1x, Grok 2x, GPT-4o 4x, Claude 5x)',
      'Option to switch to BYOK anytime',
      'Advanced Condition & Loop Safeguards',
      'Live Execution Telemetry & Retries',
      'Dedicated 24/7 SLA Support',
    ],
  },
};

export const MODEL_CREDIT_COSTS: Record<string, number> = {
  // Google Gemini (Most efficient: 1 credit)
  'gemini-2.0-flash': 1,
  'gemini-2.5-flash': 1,
  'gemini-2.5-pro': 2,

  // xAI Grok (High efficiency: 2 credits)
  'grok-2-latest': 2,
  'grok-2-vision-latest': 2,
  'grok-beta': 2,

  // OpenAI (Standard: 4 credits)
  'gpt-4o-mini': 1,
  'gpt-4o': 4,
  'o3-mini': 4,

  // Anthropic Claude (Premium reasoning: 5 credits)
  'claude-3-5-haiku-20241022': 2,
  'claude-3-5-sonnet-20241022': 5,
  'claude-3-7-sonnet-20250219': 5,
};
