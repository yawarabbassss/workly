# Workly - Production-Ready AI Workflow Automation SaaS

![Workly Banner](public/banner.png)

> **Build AI workflows that actually get things done.**
> Tell it what you want automated → build the workflow visually or with AI → execute real actions automatically through connected services → monitor the live audit trail.

---

## ⚡ Highlights & Core Promise

Workly is a full-stack, enterprise-grade workflow automation SaaS built from scratch. It is **NOT** an AI chatbot that merely suggests steps—every workflow triggers real server-side execution, evaluates live conditions, queries multi-provider LLMs, and dispatches HTTP/email actions with comprehensive observability.

- **🤖 Multi-Provider AI Engine**: Native support for **xAI Grok-2**, **Anthropic Claude 3.7 / 3.5 Sonnet**, **OpenAI GPT-4o / o3-mini**, and **Google Gemini 2.5 Pro / Flash**.
- **🎨 Visual Node Canvas**: Powered by React Flow (`@xyflow/react`) with dynamic side config panels, interactive variable pickers, auto-layout, and drag-and-drop connections.
- **🪄 Natural Language AI Workflow Architect**: Conversational prompt-to-workflow synthesis with strict JSON schema validation.
- **🛡️ Enterprise Security & SSRF Protection**: Automated blocking of private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, cloud metadata endpoints), AES-256-GCM credential vault, and automated secret redaction from execution logs.
- **📊 Real-time Execution Telemetry**: Node-by-node execution inspector, inputs/outputs trace, latency breakdowns, and one-click execution retries.
- **📦 Zero-Config Local Persistence & Supabase Ready**: Works immediately out-of-the-box with embedded atomic JSON persistence and full PostgreSQL Supabase schema with Row Level Security (RLS).

---

## 🏗️ Architecture Overview

```
Frontend (Next.js 15 App Router + React Flow + Tailwind CSS)
   │
   ├── AI Co-Pilot & Workflow Builder (Prompt → Grok/Claude/GPT/Gemini → Validated Schema)
   │
Application API Layer (Auth, Workflow CRUD, Encrypted Vault, Webhooks, Telemetry)
   │
Workflow Execution Engine
   ├── SSRF-Safe HTTP Client (GET, POST, PUT, PATCH, DELETE)
   ├── Multi-LLM Intelligence Nodes (Grok, Claude, GPT, Gemini)
   ├── Logic Evaluator (AND/OR Groups, Operators: equals, contains, >, <, exists)
   ├── Delay Timer & Loop Iteration Safeguards
   ├── Email Notification Dispatch
   └── Webhook Response Return
   │
Storage Layer (Supabase PostgreSQL + RLS / Persistent Local Storage)
```

---

## 🚀 Core Node Types

| Node Type | Category | Description |
| :--- | :--- | :--- |
| **Manual Trigger** | Trigger | Execute workflows manually with custom JSON payloads |
| **Webhook Trigger** | Trigger | Ingest real-time webhooks at unique cryptographically secured endpoints |
| **Schedule Trigger** | Trigger | Cron-based periodic execution (hourly, daily, weekly, custom) |
| **AI / LLM Node** | AI | Multi-model reasoning & data extraction (Grok-2, Claude 3.7, GPT-4o, Gemini 2.5) |
| **HTTP Request** | Action | SSRF-protected REST API client with variable interpolation and custom headers |
| **Condition (If/Else)** | Logic | Multi-branch routing with AND/OR groups and comparison operators |
| **Delay** | Logic | Execution pausing with unit resolution (seconds, minutes, hours, days) |
| **Loop Iterator** | Logic | Array iteration with infinite loop prevention limits |
| **Send Email** | Action | Transactional email notification delivery with dynamic templates |
| **Webhook Response** | Action | Custom HTTP status and response payload returned to webhook callers |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & API Routes)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Workflow Canvas**: React Flow (`@xyflow/react`)
- **AI Models**: xAI Grok, Anthropic Claude, OpenAI, Google Gemini
- **Database**: PostgreSQL (Supabase) + Persistent Storage Adapter
- **Security**: AES-256-GCM Encryption, SSRF Firewall, Automated Secret Redaction

---

## ⚙️ Quickstart & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/yawarabbassss/workly.git
cd workly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Add your preferred AI API keys (e.g. `GROK_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the End-to-End Critical Flow

1. **Sign Up / Quick Demo**: Click **Quick Demo Login** on the login screen or register an account.
2. **AI Workflow Builder**: Click **Build with Grok AI** and enter:
   > *"Whenever I receive a lead through webhook, analyze lead quality with Grok. If score > 70, send an email alert and sync to CRM."*
3. **Inspect Canvas**: View the generated nodes and connection edges on the interactive canvas.
4. **Copy Webhook URL**: Select the Webhook Trigger node and copy your unique webhook URL.
5. **Send Webhook Request**:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/YOUR_TOKEN \
     -H "Content-Type: application/json" \
     -d '{"name": "Sarah Connor", "email": "sarah@cyberdyne-sys.com", "message": "Enterprise automation rollout for 50 locations"}'
   ```
6. **Audit Execution**: Open the **Executions** tab to view the live node-by-node execution trail, duration latencies, and output variables.

---

## 🔒 Security & Privacy

- **Zero Secret Leakage**: Private API keys and auth headers are stripped before storing execution logs.
- **SSRF Shield**: All outbound HTTP nodes resolve DNS and block private subnet targets (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`, etc.).
- **Safe AI Execution**: AI generates strictly validated JSON workflow specifications—arbitrary code execution is blocked.

---

## 📄 License

MIT © [Workly AI](https://workly.ai)
