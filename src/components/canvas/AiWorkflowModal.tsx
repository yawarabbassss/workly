import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Bot, Wand2, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { WorkflowDefinition } from '@/lib/types/workflow';

interface AiWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDefinition?: WorkflowDefinition;
  currentName?: string;
  onApplyWorkflow: (generated: { name: string; description: string; definition: WorkflowDefinition }) => void;
}

export function AiWorkflowModal({
  isOpen,
  onClose,
  currentDefinition,
  currentName,
  onApplyWorkflow,
}: AiWorkflowModalProps) {
  const [activeTab, setActiveTab] = useState<'build' | 'edit' | 'assistant'>('build');
  const [prompt, setPrompt] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [assistantChat, setAssistantChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your Workly AI Assistant. I can help you design automation workflows, modify node connections, or explain how to connect external APIs.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/me')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.user) {
            setUserProfile(data.user);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const plan = userProfile?.subscriptionPlan || 'free';
  const isFreePlan = plan === 'free';
  const isPremium = plan === 'premium';
  const creditsRemaining = userProfile ? (userProfile.aiCreditsTotal || 0) - (userProfile.aiCreditsUsed || 0) : 0;

  const samplePrompts = [
    'When a lead submits a webhook form, evaluate intent with AI. If score > 70, send an email alert to sales and sync to CRM.',
    'Ingest customer support ticket via webhook, classify urgency with AI, and trigger email to on-call team if urgent.',
    'Generate social media snippets from release announcement and publish to webhook buffer.',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: userProfile?.id }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      onApplyWorkflow({
        name: data.data.name,
        description: data.data.description,
        definition: data.data.definition,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editInstruction.trim() || !currentDefinition) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/edit-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: editInstruction,
          currentDefinition,
          currentName,
          userId: userProfile?.id,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to edit workflow');
      }

      onApplyWorkflow({
        name: data.data.name,
        description: data.data.description,
        definition: data.data.definition,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAssistant = async () => {
    if (!assistantMessage.trim()) return;
    const userMsg = assistantMessage;
    setAssistantMessage('');
    setAssistantChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          workflowContext: { name: currentName, definition: currentDefinition },
          userId: userProfile?.id,
        }),
      });
      const data = await res.json();

      if (data.success && data.reply) {
        setAssistantChat(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setAssistantChat(prev => [...prev, { role: 'assistant', text: data.error || 'Could not process request.' }]);
      }
    } catch (err: any) {
      setAssistantChat(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workly AI Workflow Co-Pilot"
      description="Multi-Provider AI Intelligence (Grok-2, Claude 3.7, GPT-4o, Gemini 2.5)"
      maxWidth="2xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-4">
        <button
          onClick={() => setActiveTab('build')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'build'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Generate New Workflow
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'edit'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Modify Existing Canvas
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'assistant'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Co-Pilot Chat
        </button>
      </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Build */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Describe the automation workflow you want to build in plain English:
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. When a webhook receives a new lead with name, email and message, evaluate buyer intent with AI. If qualified, send an email notification to sales and push data to CRM."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-2">Or try a pre-made prompt:</p>
                <div className="space-y-1.5">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(s)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <span className="truncate pr-2">{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  loading={loading}
                  disabled={!prompt.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Generate Workflow</span>
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Edit */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  What changes would you like AI to make to this workflow?
                </label>
                <textarea
                  rows={4}
                  value={editInstruction}
                  onChange={e => setEditInstruction(e.target.value)}
                  placeholder='e.g. "Add a 2-day delay before sending the email", or "Change the condition to check score > 80", or "Add an HTTP request to sync data to CRM after the condition"'
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  loading={loading}
                  disabled={!editInstruction.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>Apply Modification</span>
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Assistant */}
          {activeTab === 'assistant' && (
            <div className="space-y-3 flex flex-col h-80">
              <div className="flex-1 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                {assistantChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={assistantMessage}
                  onChange={e => setAssistantMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskAssistant()}
                  placeholder="Ask anything about workflow nodes, variables, or error resolution..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button size="sm" onClick={handleAskAssistant} loading={loading} disabled={!assistantMessage.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
    </Modal>
  );
}
