import React from 'react';
import Link from 'next/link';
import { WorklyLogo } from '../branding/WorklyLogo';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 light:border-slate-200 bg-slate-950 light:bg-slate-100 py-12 text-slate-400 light:text-slate-600 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <WorklyLogo size="sm" />
          <p className="text-[11px] text-slate-500 light:text-slate-600 max-w-sm text-center md:text-left">
            Production-ready AI Workflow Automation SaaS. Design with Multi-Provider AI (Grok, Claude, OpenAI, Gemini), connect external tools, and execute automated actions with real-time auditability.
          </p>
        </div>

        {/* Public Landing Navigation Links Only */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 light:text-slate-600 font-medium">
          <a href="#how-it-works" className="hover:text-white light:hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white light:hover:text-slate-900 transition-colors">Visual Engine</a>
          <a href="#pricing" className="hover:text-white light:hover:text-slate-900 transition-colors">Pricing & Plans</a>
          <a href="#faq" className="hover:text-white light:hover:text-slate-900 transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-white light:hover:text-slate-900 transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-indigo-400 light:hover:text-indigo-600 font-semibold transition-colors">Create Account</Link>
        </div>

        <p className="text-[11px] text-slate-600 light:text-slate-500">
          © {new Date().getFullYear()} Workly AI Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
