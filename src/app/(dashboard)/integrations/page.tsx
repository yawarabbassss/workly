'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { INTEGRATIONS_REGISTRY } from '@/lib/integrations/registry';
import { Integration } from '@/lib/types/integration';
import {
  Webhook,
  Sparkles,
  Globe,
  Mail,
  MessageSquare,
  Code2,
  Table,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  Key,
  Lock,
  ExternalLink,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Webhook,
  Sparkles,
  Globe,
  Mail,
  MessageSquare,
  Github: Code2,
  Table,
  Building2,
};

export default function IntegrationsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [keyName, setKeyName] = useState('');
  const [secretVal, setSecretVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      if (data.success) {
        setCredentials(data.data);
      }
    } catch (err) {
      console.error('Fetch credentials error:', err);
    }
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration || !secretVal.trim()) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName.trim() || `${selectedIntegration.name} Key`,
          type: selectedIntegration.id,
          secretValue: secretVal.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(prev => [...prev, data.data]);
        setSelectedIntegration(null);
        setKeyName('');
        setSecretVal('');
      }
    } catch (err) {
      console.error('Save credential error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCredentials(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete credential error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Connected Integrations & Tools"
        subtitle="Manage credentials, API connections, and external service bindings"
      />

      <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* Security Notice */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              All API keys and authentication tokens are encrypted at rest using AES-256-GCM and never exposed to the frontend.
            </span>
          </div>
        </div>

        {/* Available Core Integrations */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">V1 Production Integrations</h2>
            <p className="text-xs text-slate-400">Standardized, fully functional workflow components ready to execute</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {INTEGRATIONS_REGISTRY.filter(i => i.isImplemented).map(item => {
              const Icon = ICON_MAP[item.icon] || Globe;
              const hasCred = credentials.some(c => c.type === item.id);

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="success" size="sm">
                        Live & Ready
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {item.authMethod === 'none' ? 'No Auth Required' : hasCred ? 'Key Configured' : 'Optional Key'}
                    </span>

                    {item.authMethod !== 'none' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedIntegration(item)}
                        className="text-xs py-1 px-2.5"
                      >
                        <Key className="w-3 h-3 mr-1 text-indigo-400" />
                        <span>{hasCred ? 'Update Key' : 'Configure'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Future Integrations Roadmap */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Upcoming Ecosystem Connectors</h2>
            <p className="text-xs text-slate-400">Architected modules scheduled for ecosystem expansion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-75">
            {INTEGRATIONS_REGISTRY.filter(i => !i.isImplemented).map(item => {
              const Icon = ICON_MAP[item.icon] || Globe;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" size="sm">
                        Roadmap
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-slate-200 leading-tight">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-500">
                    Extensible integration module
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Encrypted Credentials List */}
        {credentials.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Vault Credentials</h2>
              <p className="text-xs text-slate-400">Secure tokens referenced in workflow nodes without exposing plain secrets</p>
            </div>

            <div className="space-y-2">
              {credentials.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Type: {c.type} • ID: {c.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCredential(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Connect / Update Key Modal */}
      <Modal
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        title={`Configure ${selectedIntegration?.name}`}
        description="Encrypted server-side key storage."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCredential} className="space-y-4">
          <Input
            label="Credential Identifier Name"
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            placeholder="e.g. Production Grok Key"
          />
          <Input
            label="Secret Key / Auth Token"
            type="password"
            value={secretVal}
            onChange={e => setSecretVal(e.target.value)}
            placeholder="Paste your secret API key..."
            required
          />
          <p className="text-[11px] text-slate-400">
            Keys are encrypted using AES-256-GCM. We never log or return plain credentials over API responses.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedIntegration(null)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={isSaving} disabled={!secretVal.trim()}>
              Save Encrypted Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
