'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WorkflowExecution } from '@/lib/types/execution';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Webhook,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

function ExecutionsContent() {
  const searchParams = useSearchParams();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  const fetchExecutions = async () => {
    try {
      const url = statusFilter !== 'ALL' ? `/api/executions?status=${statusFilter}` : '/api/executions';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setExecutions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRetryingId(id);
    try {
      const res = await fetch(`/api/executions/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchExecutions();
      }
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredExecutions = executions.filter(e => {
    const term = searchQuery.toLowerCase();
    return (
      (e.workflowName && e.workflowName.toLowerCase().includes(term)) ||
      e.id.toLowerCase().includes(term) ||
      (e.errorMessage && e.errorMessage.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Execution History & Audit Log"
        subtitle="End-to-end trace of every triggered run, step timings, and error diagnostics"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by workflow or execution ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {['ALL', 'SUCCESS', 'FAILED', 'RUNNING'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Executions Table */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading execution logs...</div>
          ) : filteredExecutions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Activity className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No execution runs matching this filter</p>
              <p className="text-xs text-slate-500">Trigger a manual run or webhook to see live telemetry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Execution ID</th>
                    <th className="py-3.5 px-4">Workflow</th>
                    <th className="py-3.5 px-4">Trigger</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Started At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredExecutions.map(exec => (
                    <tr key={exec.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-[11px] text-indigo-300">
                        {exec.id}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {exec.workflowName || exec.workflowId}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1">
                          {exec.triggerType === 'webhook' ? (
                            <Webhook className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="capitalize">{exec.triggerType}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {exec.durationMs !== undefined ? `${exec.durationMs}ms` : '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(exec.startedAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {exec.status === 'FAILED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={e => handleRetry(exec.id, e)}
                              loading={retryingId === exec.id}
                              className="text-xs py-1 px-2.5 text-rose-300 border-rose-500/30 hover:bg-rose-950/40"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span>Retry</span>
                            </Button>
                          )}
                          <Link href={`/executions/${exec.id}`}>
                            <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                              <span>Inspect Step Logs</span>
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ExecutionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading executions...</div>}>
      <ExecutionsContent />
    </Suspense>
  );
}
