import React from 'react';
import { Workflow, Activity, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalWorkflows: number;
    activeWorkflows: number;
    executionsToday: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows,
      subtitle: `${stats.activeWorkflows} active live`,
      icon: Workflow,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Executions Today',
      value: stats.executionsToday,
      subtitle: 'Real automated runs',
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      subtitle: `${stats.successfulExecutions} completed runs`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Failed Runs',
      value: stats.failedExecutions,
      subtitle: stats.failedExecutions > 0 ? 'Action required' : 'All systems healthy',
      icon: AlertTriangle,
      color: stats.failedExecutions > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: stats.failedExecutions > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-800/40 border-slate-700/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm shadow-lg flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl border ${card.bg} ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
