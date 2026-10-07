'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Zap,
  Webhook,
  Clock,
  Globe,
  Sparkles,
  GitFork,
  Hourglass,
  Repeat,
  Mail,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { NodeType } from '@/lib/types/workflow';

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  manual_trigger: Zap,
  webhook_trigger: Webhook,
  schedule_trigger: Clock,
  http_request: Globe,
  grok_ai: Sparkles,
  condition: GitFork,
  delay: Hourglass,
  loop: Repeat,
  send_email: Mail,
  webhook_response: ArrowRightLeft,
};

const NODE_COLORS: Record<NodeType, { border: string; bg: string; iconBg: string; text: string; badgeBg: string }> = {
  manual_trigger: {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-amber-500/20 text-amber-400',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  webhook_trigger: {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
    text: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
  schedule_trigger: {
    border: 'border-blue-500/40 hover:border-blue-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-blue-500/20 text-blue-400',
    text: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  http_request: {
    border: 'border-indigo-500/40 hover:border-indigo-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    text: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  },
  grok_ai: {
    border: 'border-purple-500/50 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30 text-purple-300',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  condition: {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  delay: {
    border: 'border-orange-500/40 hover:border-orange-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-orange-500/20 text-orange-400',
    text: 'text-orange-400',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  },
  loop: {
    border: 'border-teal-500/40 hover:border-teal-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-teal-500/20 text-teal-400',
    text: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  },
  send_email: {
    border: 'border-pink-500/40 hover:border-pink-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-pink-500/20 text-pink-400',
    text: 'text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  },
  webhook_response: {
    border: 'border-slate-500/40 hover:border-slate-400',
    bg: 'bg-slate-900/95',
    iconBg: 'bg-slate-500/20 text-slate-300',
    text: 'text-slate-300',
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  },
};

export const UnifiedCustomNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  const nodeType: NodeType = nodeData.type || 'manual_trigger';
  const isTrigger = nodeType.endsWith('_trigger');
  const isCondition = nodeType === 'condition';

  const config = nodeData.config || {};
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.manual_trigger;
  const Icon = NODE_ICONS[nodeType] || Zap;

  // Render node summary subtitle based on config
  const getNodeSummary = () => {
    switch (nodeType) {
      case 'webhook_trigger':
        return 'Webhook endpoint listener';
      case 'schedule_trigger':
        return config.cron ? `Cron: ${config.cron}` : 'Daily at 09:00';
      case 'http_request':
        return config.url ? `${config.method || 'GET'} ${config.url.slice(0, 24)}...` : 'Configure URL';
      case 'grok_ai':
        return config.model ? `${config.model}` : 'Grok-2 Latest';
      case 'condition':
        return config.field ? `IF ${config.field}` : 'Configure expression';
      case 'delay':
        return `${config.duration || 1} ${config.unit || 'seconds'}`;
      case 'loop':
        return config.itemsField ? `For each in ${config.itemsField}` : 'Iterate list';
      case 'send_email':
        return config.to ? `To: ${config.to}` : 'Configure recipient';
      case 'webhook_response':
        return `Status ${config.statusCode || 200}`;
      default:
        return 'Manual Execution';
    }
  };

  return (
    <div
      className={`w-72 rounded-2xl border ${colors.border} ${colors.bg} p-4 shadow-xl backdrop-blur-md transition-all duration-200 select-none ${
        selected ? 'ring-2 ring-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)] scale-[1.02]' : ''
      }`}
    >
      {/* Target input handle (unless it's a trigger) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !-top-1.5 !bg-indigo-500 !border-2 !border-slate-900 transition-transform"
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
              {nodeData.label || 'Workflow Node'}
            </h4>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5 ${colors.badgeBg}`}>
              {nodeType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Execution Status indicator if node was run */}
        {nodeData.executionState && (
          <div className="shrink-0">
            {nodeData.executionState === 'running' && (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            )}
            {nodeData.executionState === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {nodeData.executionState === 'failed' && (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
        )}
      </div>

      {/* Node Body / Summary */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate pr-2">{getNodeSummary()}</span>
      </div>

      {/* Output Handles */}
      {isCondition ? (
        <div className="relative mt-2 pt-2 flex justify-between text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <span>TRUE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              style={{ left: '25%' }}
              className="!w-3 !h-3 !-bottom-1.5 !bg-emerald-500 !border-2 !border-slate-900"
            />
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span>FALSE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              style={{ left: '75%' }}
              className="!w-3 !h-3 !-bottom-1.5 !bg-rose-500 !border-2 !border-slate-900"
            />
          </div>
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !-bottom-1.5 !bg-indigo-500 !border-2 !border-slate-900 transition-transform"
        />
      )}
    </div>
  );
});

UnifiedCustomNode.displayName = 'UnifiedCustomNode';
