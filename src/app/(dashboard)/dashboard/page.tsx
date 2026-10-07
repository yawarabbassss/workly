'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentExecutionsTable } from '@/components/dashboard/RecentExecutionsTable';
import { RecentWorkflowsList } from '@/components/dashboard/RecentWorkflowsList';
import { Button } from '@/components/ui/Button';
import { Sparkles, Plus, LayoutTemplate, ArrowRight } from 'lucide-react';
import { AiWorkflowModal } from '@/components/canvas/AiWorkflowModal';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiWorkflow = async (generated: any) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generated.name,
          description: generated.description,
          definition: generated.definition,
          isActive: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/workflows/${data.data.id}`);
      }
    } catch (err) {
      console.error('Failed to save AI workflow:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Automation Overview" subtitle="Real-time execution analytics & workflow orchestration">
        <Button
          size="sm"
          onClick={() => setIsAiModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          <span>Create with AI</span>
        </Button>
        <Link href="/workflows?new=true">
          <Button size="sm" variant="secondary">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New Workflow</span>
          </Button>
        </Link>
      </Header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Workly Automation Engine v1.0
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2 tracking-tight">
              Design workflows with Grok AI, connect real services, and monitor executions.
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every workflow executes real HTTP requests, Webhooks, Grok-2 LLM nodes, and conditional branches with live observability.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/templates">
              <Button size="sm" variant="secondary">
                <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
                <span>Pre-built Templates</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Grid: Executions + Workflows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Executions */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Live Execution Stream</h3>
                <p className="text-xs text-slate-400">Audited executions triggered via manual runs & webhooks</p>
              </div>
              <Link
                href="/executions"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <RecentExecutionsTable executions={stats?.recentExecutions || []} />
          </div>

          {/* Right Col: Active Workflows */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Your Workflows</h3>
                <p className="text-xs text-slate-400">Deployed pipelines</p>
              </div>
              <Link
                href="/workflows"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <RecentWorkflowsList workflows={stats?.recentWorkflows || []} />
          </div>
        </div>
      </main>

      <AiWorkflowModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyWorkflow={handleApplyAiWorkflow}
      />
    </div>
  );
}
