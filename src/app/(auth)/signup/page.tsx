'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorklyLogo } from '@/components/branding/WorklyLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ArrowRight, Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: email.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create account');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] light:bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <WorklyLogo size="lg" />
          </div>
          <h2 className="text-xl font-extrabold text-white light:text-slate-900 tracking-tight">Create your Workly account</h2>
          <p className="text-xs text-slate-400 light:text-slate-600">
            Start automating real workflows in minutes
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 light:bg-rose-50 border border-rose-500/30 text-rose-300 light:text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Alex Vance"
            required
          />

          <Input
            label="Work Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="•••••••• (Min 6 characters)"
            minLength={6}
            required
          />

          <div className="p-3 rounded-xl bg-indigo-950/40 light:bg-indigo-50 border border-indigo-500/20 text-[11px] text-indigo-300 light:text-indigo-700 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Full Platform Access Included:</span>
            </p>
            <p className="text-slate-400 light:text-slate-600">
              Visual Canvas, Multi-LLM Reasoning, Webhook Triggers, HTTP & Email Actions.
            </p>
          </div>

          <Button size="md" type="submit" loading={loading} className="w-full">
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 light:text-slate-600 pt-2 border-t border-slate-800/80 light:border-slate-200">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 light:text-indigo-600 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
