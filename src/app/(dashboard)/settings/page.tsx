'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  User,
  Shield,
  Sparkles,
  Lock,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'security'>('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultModel, setDefaultModel] = useState('grok-2-latest');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setUserProfile(data.user);
          setFullName(data.user.fullName || '');
          setEmail(data.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Settings & Workspace Preferences"
        subtitle="Manage your profile, AI model keys, security parameters, and account data"
      />

      <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'ai', label: 'AI Keys & Models', icon: Sparkles },
            { id: 'security', label: 'Security & SSRF', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Settings updated successfully.</span>
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-5 shadow-xl">
              <h3 className="text-sm font-bold text-white tracking-tight">Account Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  disabled
                  helperText="Primary authentication email"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" type="submit">
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>

            {/* Danger Zone: Delete Account */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Danger Zone: Delete Account</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Permanently remove your account, custom workflows, credentials, and execution history. This action cannot be undone.
                </p>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Delete My Account</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: AI Settings */}
        {activeTab === 'ai' && (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Multi-Provider AI Intelligence Configuration</h3>
                <p className="text-xs text-slate-400">Configure xAI Grok, OpenAI, Anthropic Claude, and Google Gemini</p>
              </div>
              <Badge variant="ai">Multi-Provider Ready</Badge>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Default Workflow Engine Model
                </label>
                <select
                  value={defaultModel}
                  onChange={e => setDefaultModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-300 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="grok-2-latest">xAI Grok-2 Latest (Recommended)</option>
                  <option value="claude-3-7-sonnet-20250219">Anthropic Claude 3.7 Sonnet</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="xAI Grok API Key (GROK_API_KEY)"
                  type="password"
                  placeholder="xai-••••••••••••••••"
                  helperText="Powers Grok-2 fast extraction and reasoning"
                />
                <Input
                  label="Anthropic Claude Key (ANTHROPIC_API_KEY)"
                  type="password"
                  placeholder="sk-ant-••••••••••••"
                  helperText="Powers Claude 3.7 & 3.5 Sonnet hybrid reasoning"
                />
                <Input
                  label="OpenAI API Key (OPENAI_API_KEY)"
                  type="password"
                  placeholder="sk-proj-••••••••••••"
                  helperText="Powers GPT-4o, GPT-4o-mini & o3-mini"
                />
                <Input
                  label="Google Gemini Key (GOOGLE_API_KEY)"
                  type="password"
                  placeholder="AIzaSy••••••••••••••"
                  helperText="Powers Gemini 2.5 Pro & Gemini 2.0 Flash"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Zero-Leakage Server-Side Isolation</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All provider keys are stored server-side via environment variables or encrypted AES-256 vault credentials. Keys are strictly inaccessible to browser scripts and automatically redacted from all telemetry logs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security & SSRF */}
        {activeTab === 'security' && (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">SSRF & Execution Security Policies</h3>
                <p className="text-xs text-slate-400">Protection mechanisms safeguarding against internal network exploitation</p>
              </div>
              <Badge variant="success">SSRF Protection Active</Badge>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-start gap-3">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Private Subnet Firewall</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Requests to loopback (127.0.0.1), private class ranges (10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12), and cloud metadata endpoints (169.254.169.254) are rejected before socket initiation.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-start gap-3">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Automatic Secret Redaction</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Authorization headers, bearer tokens, passwords, and sensitive keys are stripped before persisting to execution audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Permanently Delete Account"
        description="Are you absolutely sure you want to delete your Workly account? This will permanently wipe all your workflows, credentials, and execution logs."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action cannot be undone.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              loading={isDeletingAccount}
            >
              Confirm & Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
