'use client';

import React from 'react';
import Link from 'next/link';
import { WorkflowExecution } from '@/lib/types/execution';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertCircle, Clock, ArrowUpRight, Zap, Webhook } from 'lucide-react';

interface RecentExecutionsTableProps {
  executions: WorkflowExecution[];
}

export function RecentExecutionsTable({ executions }: RecentExecutionsTableProps) {
  if (!executions || executions.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
        <p className="text-sm font-semibold text-slate-300">No executions recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Run a workflow test or send a webhook request to view live executions.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
          <tr>
            <th className="py-3 px-4">Workflow</th>
            <th className="py-3 px-4">Trigger</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Duration</th>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-slate-300">
          {executions.map(exec => (
            <tr key={exec.id} className="hover:bg-slate-850/50 transition-colors">
              <td className="py-3.5 px-4 font-semibold text-white">
                {exec.workflowName || exec.workflowId}
              </td>
              <td className="py-3.5 px-4">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  {exec.triggerType === 'webhook' ? (
                    <Webhook className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="capitalize">{exec.triggerType}</span>
                </span>
              </td>
              <td className="py-3.5 px-4">
                <Badge
                  variant={
                    exec.status === 'SUCCESS'
                      ? 'success'
                      : exec.status === 'FAILED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {exec.status}
                </Badge>
              </td>
              <td className="py-3.5 px-4 font-mono text-slate-400">
                {exec.durationMs !== undefined ? `${exec.durationMs}ms` : '-'}
              </td>
              <td className="py-3.5 px-4 text-slate-400">
                {new Date(exec.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </td>
              <td className="py-3.5 px-4 text-right">
                <Link
                  href={`/executions/${exec.id}`}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
