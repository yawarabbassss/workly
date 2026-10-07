import React from 'react';
import Link from 'next/link';
import { WorklyLogo } from '../branding/WorklyLogo';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <WorklyLogo size="sm" />
          <p className="text-[11px] text-slate-500 max-w-sm text-center md:text-left">
            Production-ready AI Workflow Automation SaaS. Design with Grok-2, connect external tools, and execute automated actions with real-time auditability.
          </p>
        </div>

        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/workflows" className="hover:text-white transition-colors">Workflows</Link>
          <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
          <Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link>
          <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
        </div>

        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} Workly AI Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
