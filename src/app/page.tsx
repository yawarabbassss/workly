'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Webhook,
  Globe,
  GitFork,
  Hourglass,
  Repeat,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Play,
  Layers,
  Lock,
  ChevronDown,
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does Workly work in real production for our clients?',
      a: 'When you build and activate a workflow in Workly, our server-side engine registers unique webhook endpoints and background triggers. When your client or app sends data to the webhook, Workly executes every step automatically 24/7 (AI reasoning, conditional filters, REST HTTP requests, emails) without needing your browser open, and logs every step to the live audit history.',
    },
    {
      q: 'Which AI models can I use inside my workflows?',
      a: 'Workly natively supports xAI Grok-2, Anthropic Claude 3.7 & 3.5 Sonnet, OpenAI GPT-4o & o3-mini, and Google Gemini 2.5 Pro & Flash. You can configure your keys in settings or use default intelligent orchestration.',
    },
    {
      q: 'How are sensitive credentials and internal networks protected?',
      a: 'All outbound HTTP actions pass through an automated SSRF firewall blocking private subnets (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, cloud metadata). Stored API keys are encrypted at rest with AES-256-GCM and automatically redacted from execution logs.',
    },
    {
      q: 'Can I pass dynamic data between different steps?',
      a: 'Yes. Workly features an interactive variable picker. You can reference any previous node output or webhook trigger payload using variables like {{trigger.email}}, {{node_ai.score}}, or {{node_http.data.id}} seamlessly.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] light:bg-slate-50 text-slate-100 light:text-slate-900 selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 light:bg-indigo-50 border border-indigo-500/25 light:border-indigo-200 text-indigo-300 light:text-indigo-700 text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>AI Workflow Automation with Real Execution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white light:text-slate-900 leading-[1.1]">
            Build AI workflows that{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 light:from-indigo-600 light:via-purple-600 light:to-cyan-600">
              actually get things done.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 light:text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tell it what you want automated → build visually or with Multi-Provider AI (Grok, Claude, OpenAI, Gemini) → execute real server-side actions → monitor live telemetry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25">
                <span>Start Building Workflows</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto border-slate-700 light:border-slate-300">
                <span>See How It Works</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Interactive Canvas Preview Mockup */}
        <div className="relative z-10 mt-14 w-full max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-transparent shadow-2xl">
          <div className="rounded-[22px] bg-slate-950/90 light:bg-white border border-slate-800/90 light:border-slate-200 overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Window header */}
            <div className="px-4 py-3 bg-slate-900/80 light:bg-slate-100 border-b border-slate-800 light:border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 light:text-slate-600 ml-2">
                  AI Lead Qualification & CRM Sync • Live Pipeline
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">● Live Engine</Badge>
              </div>
            </div>

            {/* Visual Nodes Simulation Canvas */}
            <div className="p-8 bg-[#090d16] light:bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] light:bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-5 w-full max-w-4xl">
                {/* Node 1: Webhook */}
                <div className="w-56 p-4 rounded-2xl bg-slate-900/90 light:bg-white border border-cyan-500/40 shadow-lg text-left">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Webhook className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white light:text-slate-900">Webhook Intake</h4>
                      <p className="text-[10px] text-cyan-400 font-mono">/api/webhooks/lead</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 light:text-slate-600 font-mono bg-slate-950 light:bg-slate-100 p-2 rounded-lg mt-2">
                    {"{ name, email, score }"}
                  </div>
                </div>

                <div className="text-indigo-400 font-bold hidden md:block">→</div>

                {/* Node 2: Grok AI */}
                <div className="w-56 p-4 rounded-2xl bg-slate-900/90 light:bg-white border border-purple-500/50 shadow-lg text-left ring-1 ring-purple-500/30">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 light:text-purple-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white light:text-slate-900">Multi-Model AI</h4>
                      <p className="text-[10px] text-purple-300 light:text-purple-600">Grok / Claude / GPT</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 light:text-slate-600 bg-slate-950 light:bg-slate-100 p-2 rounded-lg mt-2">
                    Score: 92/100 (Qualified)
                  </div>
                </div>

                <div className="text-indigo-400 font-bold hidden md:block">→</div>

                {/* Node 3: Condition */}
                <div className="w-56 p-4 rounded-2xl bg-slate-900/90 light:bg-white border border-emerald-500/40 shadow-lg text-left">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white light:text-slate-900">Score &gt; 70</h4>
                      <p className="text-[10px] text-emerald-400">Branch True</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 light:bg-emerald-50 p-2 rounded-lg mt-2 font-semibold">
                    ✓ Condition Passed
                  </div>
                </div>

                <div className="text-indigo-400 font-bold hidden md:block">→</div>

                {/* Node 4: Action */}
                <div className="w-56 p-4 rounded-2xl bg-slate-900/90 light:bg-white border border-indigo-500/40 shadow-lg text-left">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white light:text-slate-900">Sync to CRM</h4>
                      <p className="text-[10px] text-indigo-400">POST /api/leads</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-indigo-300 light:text-indigo-600 bg-slate-950 light:bg-slate-100 p-2 rounded-lg mt-2">
                    HTTP 200 OK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80 light:border-slate-200">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="primary">Seamless Orchestration</Badge>
          <h2 className="text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            How Workly executes real work
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 max-w-md mx-auto">
            From natural language prompt to live production execution in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Describe or Design',
              desc: 'Use AI natural language prompt or drag-and-drop nodes on the visual React Flow canvas.',
              icon: Sparkles,
            },
            {
              step: '02',
              title: 'Bind Live Variables',
              desc: 'Pass data seamlessly with {{trigger.email}} or prior node output variables into downstream actions.',
              icon: Layers,
            },
            {
              step: '03',
              title: 'Real-World Execution',
              desc: 'Execute real HTTP requests, send emails, run LLM queries, and evaluate conditions with SSRF safety.',
              icon: Zap,
            },
            {
              step: '04',
              title: 'Audit & Telemetry',
              desc: 'Inspect step-by-step inputs, outputs, execution latencies, and retry failed steps with one click.',
              icon: Activity,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 hover:border-indigo-500/40 transition-all space-y-3 relative shadow-sm"
              >
                <span className="text-2xl font-black text-slate-700 light:text-slate-300 font-mono">{item.step}</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 light:bg-indigo-50 text-indigo-400 light:text-indigo-600 flex items-center justify-center border border-indigo-500/20 light:border-indigo-200">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Features & Guarantee */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80 light:border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <Badge variant="ai">Zero Fake Execution</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight leading-tight">
              Enterprise reliability and strict execution safety.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 leading-relaxed">
              Every action in Workly connects to real server-side infrastructure. There are no placeholder simulations, no fake dashboards, and no mock success states.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'SSRF-safe HTTP client blocking access to internal private IP ranges & cloud metadata',
                'AES-256-GCM encrypted credential vault with automatic secret log redaction',
                'Multi-Provider AI reasoning nodes (Grok, Claude, OpenAI, Gemini)',
                'Conditional branching with AND/OR logic & iteration safety caps',
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 light:text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/signup">
                <Button size="md">
                  <span>Explore Visual Builder</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Sample AI Lead Pipeline
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 font-mono text-xs text-indigo-300 light:text-indigo-700 space-y-1">
              <p className="text-slate-500">// Natural Language Prompt:</p>
              <p className="text-white light:text-slate-900">
                &ldquo;Whenever I receive a lead through webhook, analyze lead quality with AI. If score &gt; 70, send an email and post to CRM.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 font-mono text-[11px] text-cyan-300 light:text-cyan-700 overflow-x-auto max-h-48">
              <p className="text-emerald-400 light:text-emerald-600">✓ Schema Validated: 5 Nodes, 4 Edges</p>
              <p className="text-slate-400 light:text-slate-600">✓ Webhook token generated</p>
              <p className="text-slate-400 light:text-slate-600">✓ Prompt synthesized</p>
              <p className="text-slate-400 light:text-slate-600">✓ SSRF URL checks verified</p>
              <p className="text-purple-400 light:text-purple-600">Ready for real-time execution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto border-t border-slate-800/80 light:border-slate-200">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="neutral">FAQ</Badge>
          <h2 className="text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 light:text-slate-800 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-400 light:text-slate-600 leading-relaxed border-t border-slate-800/50 light:border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to automate real work with AI?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create workflows in minutes, test them on the visual canvas, and deploy with confidence.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25">
                <span>Start Building Workflows</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
