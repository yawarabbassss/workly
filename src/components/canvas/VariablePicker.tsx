'use client';

import React, { useState } from 'react';
import { WorkflowNode } from '@/lib/types/workflow';
import { Variable, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface VariablePickerProps {
  nodes: WorkflowNode[];
  currentNodeId: string;
  onSelectVariable: (variableTag: string) => void;
}

export function VariablePicker({ nodes, currentNodeId, onSelectVariable }: VariablePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Collect previous available nodes
  const availableNodes = nodes.filter(n => n.id !== currentNodeId);

  const handleSelect = (tag: string) => {
    onSelectVariable(tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
      >
        <Variable className="w-3.5 h-3.5" />
        <span>Insert Variable</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown panel */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto text-left animate-in fade-in zoom-in-95">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Available Data Variables
            </div>

            {/* Trigger Data Group */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-cyan-400 px-1 mb-1 flex items-center gap-1">
                <span>Webhook / Trigger Data</span>
              </div>
              <div className="space-y-1">
                {['{{trigger.name}}', '{{trigger.email}}', '{{trigger.company}}', '{{trigger.message}}', '{{trigger.payload}}'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleSelect(v)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <span className="truncate">{v}</span>
                    {copiedVar === v ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 text-slate-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Node Outputs Group */}
            {availableNodes.map(n => (
              <div key={n.id} className="mb-2">
                <div className="text-xs font-semibold text-purple-400 px-1 mb-1">
                  {n.data.label || n.id}
                </div>
                <div className="space-y-1">
                  {[`{{${n.id}.response}}`, `{{${n.id}.score}}`, `{{${n.id}.data}}`, `{{${n.id}.status}}`].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelect(v)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <span className="truncate">{v}</span>
                      {copiedVar === v ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 text-slate-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
