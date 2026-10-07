'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowNode, NodeType } from '@/lib/types/workflow';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { VariablePicker } from './VariablePicker';
import {
  X,
  Trash2,
  Copy,
  Check,
  Globe,
  Sparkles,
  GitFork,
  Hourglass,
  Repeat,
  Mail,
  Zap,
  Webhook,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  allNodes: WorkflowNode[];
  webhookToken?: string;
  onUpdateNode: (nodeId: string, updatedData: Partial<WorkflowNode['data']>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({
  node,
  allNodes,
  webhookToken,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: NodeConfigPanelProps) {
  if (!node) return null;

  const nodeType: NodeType = node.data.type || 'manual_trigger';
  const config = node.data.config || {};
  const [label, setLabel] = useState(node.data.label || '');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setLabel(node.data.label || '');
  }, [node]);

  const updateConfig = (key: string, value: any) => {
    onUpdateNode(node.id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onUpdateNode(node.id, { label: newLabel });
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/webhooks/${webhookToken || 'wh_sample_token'}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <aside className="w-96 bg-slate-950 border-l border-slate-800/90 h-full flex flex-col shrink-0 shadow-2xl z-30 animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {nodeType.replace('_', ' ')}
          </span>
          <h3 className="text-sm font-bold text-white mt-1">Node Configuration</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(node.id)}
            title="Delete node"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Node Label */}
        <Input
          label="Node Display Name"
          value={label}
          onChange={e => handleLabelChange(e.target.value)}
          placeholder="Enter a recognizable step title"
        />

        {/* Dynamic Config Fields based on Node Type */}
        {nodeType === 'webhook_trigger' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Unique Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={webhookUrl}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 select-all"
              />
              <Button size="sm" variant="secondary" onClick={copyWebhookUrl} className="shrink-0">
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Send an HTTP POST request with a JSON payload to this endpoint to trigger the workflow automatically.
            </p>
          </div>
        )}

        {nodeType === 'schedule_trigger' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Cron Schedule Expression
            </label>
            <Input
              value={config.cron || '0 9 * * *'}
              onChange={e => updateConfig('cron', e.target.value)}
              placeholder="e.g. 0 9 * * * (Daily 9am)"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'Every hour', val: '0 * * * *' },
                { label: 'Daily at 9am', val: '0 9 * * *' },
                { label: 'Every Monday', val: '0 9 * * 1' },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateConfig('cron', preset.val)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {nodeType === 'http_request' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Method</label>
                <select
                  value={config.method || 'GET'}
                  onChange={e => updateConfig('method', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Endpoint URL</label>
                  <VariablePicker
                    nodes={allNodes}
                    currentNodeId={node.id}
                    onSelectVariable={tag => updateConfig('url', `${config.url || ''}${tag}`)}
                  />
                </div>
                <input
                  value={config.url || ''}
                  onChange={e => updateConfig('url', e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            {['POST', 'PUT', 'PATCH'].includes(config.method || 'GET') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">JSON Request Body</label>
                  <VariablePicker
                    nodes={allNodes}
                    currentNodeId={node.id}
                    onSelectVariable={tag => updateConfig('body', `${config.body || ''}${tag}`)}
                  />
                </div>
                <textarea
                  rows={5}
                  value={config.body || ''}
                  onChange={e => updateConfig('body', e.target.value)}
                  placeholder='{\n  "lead": "{{trigger.name}}",\n  "email": "{{trigger.email}}"\n}'
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {nodeType === 'grok_ai' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">AI Provider & Model</label>
              <select
                value={config.model || 'grok-2-latest'}
                onChange={e => updateConfig('model', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-purple-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <optgroup label="xAI Grok">
                  <option value="grok-2-latest">xAI Grok-2 Latest (Recommended)</option>
                  <option value="grok-2-vision-latest">xAI Grok-2 Vision</option>
                  <option value="grok-beta">xAI Grok Beta</option>
                </optgroup>
                <optgroup label="Anthropic Claude">
                  <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Hybrid Reasoning)</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast)</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                  <option value="o3-mini">OpenAI o3-mini (Reasoning)</option>
                </optgroup>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Prompt & Instructions</label>
                <VariablePicker
                  nodes={allNodes}
                  currentNodeId={node.id}
                  onSelectVariable={tag => updateConfig('prompt', `${config.prompt || ''}${tag}`)}
                />
              </div>
              <textarea
                rows={6}
                value={config.prompt || ''}
                onChange={e => updateConfig('prompt', e.target.value)}
                placeholder="Analyze this sales inquiry: {{trigger.message}} and output a JSON decision with fields: score, qualified, reason."
                className="w-full bg-slate-900 border border-purple-500/30 focus:border-purple-500 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Creativity / Temperature</span>
                <span className="font-mono text-purple-400">{config.temperature ?? 0.2}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature ?? 0.2}
                onChange={e => updateConfig('temperature', parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {nodeType === 'condition' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Field Variable to Test</label>
                <VariablePicker
                  nodes={allNodes}
                  currentNodeId={node.id}
                  onSelectVariable={tag => updateConfig('field', tag)}
                />
              </div>
              <Input
                value={config.field || ''}
                onChange={e => updateConfig('field', e.target.value)}
                placeholder="e.g. {{node_ai_analyze.score}} or {{trigger.email}}"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operator</label>
              <select
                value={config.conditionOperator || 'equals'}
                onChange={e => updateConfig('conditionOperator', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none"
              >
                <option value="equals">Equals (==)</option>
                <option value="not_equals">Does Not Equal (!=)</option>
                <option value="contains">Contains Substring</option>
                <option value="does_not_contain">Does Not Contain</option>
                <option value="greater_than">Greater Than (&gt;)</option>
                <option value="less_than">Less Than (&lt;)</option>
                <option value="greater_equal">Greater Than or Equal (&gt;=)</option>
                <option value="less_equal">Less Than or Equal (&lt;=)</option>
                <option value="exists">Exists / Is Set</option>
                <option value="does_not_exist">Does Not Exist</option>
              </select>
            </div>

            <Input
              label="Target Comparison Value"
              value={config.value || ''}
              onChange={e => updateConfig('value', e.target.value)}
              placeholder="e.g. 70 or true or enterprise"
            />
          </div>
        )}

        {nodeType === 'delay' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Duration"
                type="number"
                min="1"
                value={config.duration || 5}
                onChange={e => updateConfig('duration', parseInt(e.target.value, 10))}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Unit</label>
                <select
                  value={config.unit || 'seconds'}
                  onChange={e => updateConfig('unit', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {nodeType === 'loop' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">Array / Items Variable</label>
              <VariablePicker
                nodes={allNodes}
                currentNodeId={node.id}
                onSelectVariable={tag => updateConfig('itemsField', tag)}
              />
            </div>
            <Input
              value={config.itemsField || ''}
              onChange={e => updateConfig('itemsField', e.target.value)}
              placeholder="e.g. {{trigger.items}} or {{node_http.data}}"
            />
          </div>
        )}

        {nodeType === 'send_email' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Recipient Email (To)</label>
                <VariablePicker
                  nodes={allNodes}
                  currentNodeId={node.id}
                  onSelectVariable={tag => updateConfig('to', tag)}
                />
              </div>
              <Input
                value={config.to || ''}
                onChange={e => updateConfig('to', e.target.value)}
                placeholder="sales@company.com or {{trigger.email}}"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Subject</label>
                <VariablePicker
                  nodes={allNodes}
                  currentNodeId={node.id}
                  onSelectVariable={tag => updateConfig('subject', `${config.subject || ''}${tag}`)}
                />
              </div>
              <Input
                value={config.subject || ''}
                onChange={e => updateConfig('subject', e.target.value)}
                placeholder="Qualified Lead: {{trigger.name}}"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Message Body</label>
                <VariablePicker
                  nodes={allNodes}
                  currentNodeId={node.id}
                  onSelectVariable={tag => updateConfig('body', `${config.body || ''}${tag}`)}
                />
              </div>
              <textarea
                rows={5}
                value={config.body || ''}
                onChange={e => updateConfig('body', e.target.value)}
                placeholder="Hello {{trigger.name}},\n\nYour score is {{node_ai_analyze.score}}."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
