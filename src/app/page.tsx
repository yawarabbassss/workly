'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PLAN_LIMITS } from '@/lib/types/user';
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
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does Workly work in real production for our clients?',
      a: 'When you build and activate a workflow in Workly, our server-side engine registers unique webhook endpoints and background triggers. When your client or app sends data to the webhook, Workly executes every step automatically 24/7 (AI reasoning, conditional filters, REST HTTP requests, emails) without needing your browser open, and logs every step to the live audit history.',
    },
    {
      q: 'What is the difference between the Free, Pro, and Premium plans?',
      a: 'Free ($0/mo) includes 3 workflows and 100 runs for manual automations without AI. Pro ($10/mo) allows you to Bring Your Own Key (BYOK) for Grok, OpenAI, Claude, and Gemini with 50 workflows. Premium ($50/mo) includes fully managed cloud AI with 1,000 monthly credits where no API keys are required.',
    },
    {
      q: 'How do the AI model credits work on the Premium plan?',
      a: 'On Premium, different AI models consume credits proportionally based on provider computation: Google Gemini (1 credit/run), xAI Grok (2 credits/run), OpenAI GPT-4o (4 credits/run), and Anthropic Claude 3.7 (5 credits/run). You can also switch to BYOK anytime in settings.',
    },
    {
      q: 'How are sensitive credentials and internal networks protected?',
      a: 'All outbound HTTP actions pass through an automated SSRF firewall blocking private subnets (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, cloud metadata). Stored API keys are encrypted at rest with AES-256-GCM and automatically redacted from execution logs.',
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
                <span>Start Free Starter Plan</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <a href="#pricing">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto border-slate-700 light:border-slate-300">
                <span>View Pricing & Plans</span>
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

      {/* Section: Pricing & Plans */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80 light:border-slate-200">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="primary">Transparent SaaS Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Flexible plans for every stage
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 max-w-md mx-auto">
            Start for free with manual automations, or supercharge with BYOK keys and managed cloud AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Starter */}
          <div className="p-7 rounded-3xl bg-slate-900/70 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Starter</span>
              <h3 className="text-xl font-bold text-white light:text-slate-900 mt-1">Free Starter</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">For basic manual and webhook automations.</p>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-4xl font-black text-white light:text-slate-900">$0</span>
                <span className="text-xs text-slate-400 light:text-slate-600">/ month forever</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800/80 light:border-slate-200 text-xs">
                {PLAN_LIMITS.free.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 light:text-slate-700">
                    <span className={f.startsWith('❌') ? 'text-rose-400' : 'text-emerald-400'}>
                      {f.startsWith('❌') ? '✕' : '✓'}
                    </span>
                    <span>{f.replace('❌ ', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link href="/signup">
                <Button size="md" variant="secondary" className="w-full">
                  <span>Sign Up Free</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro BYOK */}
          <div className="p-7 rounded-3xl bg-indigo-950/40 light:bg-indigo-50/70 border-2 border-indigo-500/60 shadow-2xl flex flex-col justify-between relative ring-1 ring-indigo-500/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 light:text-indigo-600">BYOK API Keys</span>
              <h3 className="text-xl font-bold text-white light:text-slate-900 mt-1">Pro Plan</h3>
              <p className="text-xs text-slate-300 light:text-slate-600 mt-1">Add your own API keys for unlimited AI workflows.</p>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-4xl font-black text-white light:text-slate-900">$10</span>
                <span className="text-xs text-slate-400 light:text-slate-600">/ month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-indigo-500/20 text-xs">
                {PLAN_LIMITS.pro.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-200 light:text-slate-800">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-500/20">
              <Link href="/signup">
                <Button size="md" className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30">
                  <span>Get Started with Pro</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan 3: Premium Managed AI */}
          <div className="p-7 rounded-3xl bg-slate-900/70 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">All-Inclusive AI</span>
              <h3 className="text-xl font-bold text-white light:text-slate-900 mt-1">Premium Plan</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">Managed AI cloud without requiring your own keys.</p>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-4xl font-black text-white light:text-slate-900">$50</span>
                <span className="text-xs text-slate-400 light:text-slate-600">/ month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800/80 light:border-slate-200 text-xs">
                {PLAN_LIMITS.premium.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 light:text-slate-700">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link href="/signup">
                <Button size="md" variant="secondary" className="w-full">
                  <span>Get Premium Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
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

      <Footer />
    </div>
  );
}
