'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Workflow,
  Activity,
  Blocks,
  LayoutTemplate,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { WorklyLogo } from '../branding/WorklyLogo';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: Workflow },
    { name: 'Executions', href: '/executions', icon: Activity },
    { name: 'Integrations', href: '/integrations', icon: Blocks },
    { name: 'Templates', href: '/templates', icon: LayoutTemplate },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="transition-transform active:scale-95">
          <WorklyLogo size="md" />
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Supercharge Banner in Sidebar */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Grok-2 AI Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
          Build & optimize automations instantly with conversational prompts.
        </p>
        <Link
          href="/workflows?createWithAi=true"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white"
        >
          Prompt to Workflow <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800">
            AV
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">Alex Vance</p>
            <p className="text-[10px] text-slate-400 truncate">demo@workly.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
