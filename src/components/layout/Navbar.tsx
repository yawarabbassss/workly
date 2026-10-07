'use client';

import React from 'react';
import Link from 'next/link';
import { WorklyLogo } from '../branding/WorklyLogo';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 light:border-slate-200 bg-slate-950/80 light:bg-white/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="transition-transform active:scale-95">
          <WorklyLogo size="md" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300 light:text-slate-600">
          <a href="#how-it-works" className="hover:text-white light:hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white light:hover:text-slate-900 transition-colors">Visual Engine</a>
          <a href="#faq" className="hover:text-white light:hover:text-slate-900 transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button size="sm" variant="ghost" className="text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
