'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Sparkles, Play, Plus, Bell, LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onRunTest?: () => void;
  isRunning?: boolean;
}

export function Header({ title, subtitle, children, onRunTest, isRunning }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {children}

        {onRunTest && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRunTest}
            loading={isRunning}
            className="border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-950/40"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-current" />
            <span>Test Run</span>
          </Button>
        )}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={handleLogout}
          title="Log out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
