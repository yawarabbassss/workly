'use client';

import React, { useState } from 'react';
import { NodeType } from '@/lib/types/workflow';
import { Button } from '../ui/Button';
import {
  Plus,
  Sparkles,
  Play,
  Save,
  Check,
  Zap,
  Webhook,
  Globe,
  GitFork,
  Hourglass,
  Repeat,
  Mail,
  ChevronDown,
} from 'lucide-react';

interface CanvasToolbarProps {
  onAddNode: (type: NodeType, label: string) => void;
  onOpenAiModal: () => void;
  onSave: () => void;
  onRunTest: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  isActive: boolean;
  onToggleActive: () => void;
}

export function CanvasToolbar({
  onAddNode,
  onOpenAiModal,
  onSave,
  onRunTest,
  isSaving,
  hasUnsavedChanges,
  isActive,
  onToggleActive,
}: CanvasToolbarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const availableNodes: Array<{ type: NodeType; label: string; icon: React.ElementType; color: string; desc: string }> = [
    { type: 'manual_trigger', label: 'Manual Trigger', icon: Zap, color: 'text-amber-400', desc: 'Trigger manually with payload' },
    { type: 'webhook_trigger', label: 'Webhook Trigger', icon: Webhook, color: 'text-cyan-400', desc: 'Receive real-time HTTP webhooks' },
    { type: 'grok_ai', label: 'Grok AI Node', icon: Sparkles, color: 'text-purple-400', desc: 'xAI Grok reasoning & extraction' },
    { type: 'http_request', label: 'HTTP Request', icon: Globe, color: 'text-indigo-400', desc: 'Send API requests (SSRF protected)' },
    { type: 'condition', label: 'Condition (If/Else)', icon: GitFork, color: 'text-emerald-400', desc: 'Branch execution paths' },
    { type: 'delay', label: 'Delay', icon: Hourglass, color: 'text-orange-400', desc: 'Pause execution for a duration' },
    { type: 'loop', label: 'Loop Iterator', icon: Repeat, color: 'text-teal-400', desc: 'Process items in an array' },
    { type: 'send_email', label: 'Send Email', icon: Mail, color: 'text-pink-400', desc: 'Send email notification' },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Left actions: Add Node & AI Builder */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="bg-slate-900/90 backdrop-blur-md border-slate-700/80 shadow-lg text-slate-100"
          >
            <Plus className="w-4 h-4 mr-1.5 text-indigo-400" />
            <span>Add Step</span>
            <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${paletteOpen ? 'rotate-180' : ''}`} />
          </Button>

          {paletteOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setPaletteOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-40 backdrop-blur-md animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 border-b border-slate-800">
                  Node Palette
                </div>
                <div className="py-1 space-y-0.5 max-h-80 overflow-y-auto">
                  {availableNodes.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onAddNode(item.type, item.label);
                          setPaletteOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer group"
                      >
                        <div className={`p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-slate-700 ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold leading-tight">{item.label}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Co-Pilot Button */}
        <Button
          size="sm"
          onClick={onOpenAiModal}
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-600/20 backdrop-blur-md border border-purple-400/30"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-200 animate-pulse" />
          <span>Grok AI Co-Pilot</span>
        </Button>
      </div>

      {/* Right actions: Status Toggle, Test Run, Save */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Active Toggle Switch */}
        <button
          onClick={onToggleActive}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-md shadow-lg cursor-pointer ${
            isActive
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{isActive ? 'Workflow Active' : 'Workflow Paused'}</span>
        </button>

        {/* Test Run */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onRunTest}
          className="bg-slate-900/90 backdrop-blur-md border-indigo-500/30 text-indigo-300 hover:text-white shadow-lg"
        >
          <Play className="w-3.5 h-3.5 mr-1 fill-current" />
          <span>Test Run</span>
        </Button>

        {/* Save */}
        <Button
          size="sm"
          onClick={onSave}
          loading={isSaving}
          className={`shadow-lg transition-all ${
            hasUnsavedChanges
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isSaving ? null : hasUnsavedChanges ? (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          )}
          <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
        </Button>
      </div>
    </div>
  );
}
