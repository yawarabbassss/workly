'use client';

import React from 'react';
import Link from 'next/link';
import { Workflow } from '@/lib/types/workflow';
import { Badge } from '../ui/Badge';
import { ArrowRight, Sparkles, Workflow as WorkflowIcon } from 'lucide-react';

interface RecentWorkflowsListProps {
  workflows: Workflow[];
}

export function RecentWorkflowsList({ workflows }: RecentWorkflowsListProps) {
  if (!workflows || workflows.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
        <p className="text-sm font-semibold text-slate-300">No workflows found</p>
        <p className="text-xs text-slate-400 mt-1">Create your first automated workflow using AI or visual builder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workflows.map(wf => (
        <Link
          key={wf.id}
          href={`/workflows/${wf.id}`}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <WorkflowIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                {wf.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {wf.description || `${wf.definition.nodes.length} steps configured`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={wf.isActive ? 'success' : 'neutral'} size="sm">
              {wf.isActive ? 'Active' : 'Draft'}
            </Badge>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
