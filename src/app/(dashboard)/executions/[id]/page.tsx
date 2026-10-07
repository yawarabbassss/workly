'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkflowExecution, NodeExecutionRecord } from '@/lib/types/execution';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Workflow as WorkflowIcon,
  Zap,
  Webhook,
} from 'lucide-react';

export default function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const executionId = resolvedParams.id;

  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [selectedNodeExecution, setSelectedNodeExecution] = useState<NodeExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    fetchExecution();
  }, [executionId]);

  const fetchExecution = async () => {
    try {
      const res = await fetch(`/api/executions/${executionId}`);
      const data = await res.json();
      if (data.success) {
        setExecution(data.data);
        if (data.data.nodeExecutions?.length > 0) {
          setSelectedNodeExecution(data.data.nodeExecutions[0]);
        }
      }
    } catch (err) {
      console.error('Fetch execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!execution) return;
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/executions/${execution.id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(`/executions/${data.data.id}`);
      }
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading execution trace...</div>;
  }

  if (!execution) {
    return (
      <div className="p-8 text-center text-slate-100">
        <h2 className="text-base font-bold text-rose-400">Execution Not Found</h2>
        <Link href="/executions" className="mt-4 inline-block">
          <Button size="sm">Back to Executions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={`Execution Trace: ${execution.id}`}
        subtitle={`Workflow: ${execution.workflowName || execution.workflowId}`}
      >
        <Link href="/executions">
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Audit Logs</span>
          </Button>
        </Link>
        <Link href={`/workflows/${execution.workflowId}`}>
          <Button size="sm" variant="secondary">
            <WorkflowIcon className="w-3.5 h-3.5 mr-1.5" />
            <span>Edit Workflow</span>
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={handleRetry}
          loading={isRetrying}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry Execution</span>
        </Button>
      </Header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Summary Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <div className="mt-1">
              <Badge
                variant={execution.status === 'SUCCESS' ? 'success' : execution.status === 'FAILED' ? 'danger' : 'warning'}
                size="md"
              >
                {execution.status}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trigger Type</span>
            <p className="text-sm font-semibold text-slate-200 mt-1 capitalize flex items-center gap-1.5">
              {execution.triggerType === 'webhook' ? <Webhook className="w-4 h-4 text-cyan-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
              <span>{execution.triggerType}</span>
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Duration</span>
            <p className="text-sm font-mono font-semibold text-slate-200 mt-1">
              {execution.durationMs !== undefined ? `${execution.durationMs} ms` : '-'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trigger Timestamp</span>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(execution.startedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Node Step Flow & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Steps Executed */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Executed Nodes ({execution.nodeExecutions.length})
            </h3>
            <div className="space-y-2">
              {execution.nodeExecutions.map((step, idx) => {
                const isSelected = selectedNodeExecution?.id === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedNodeExecution(step)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0">
                        {step.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-100 truncate">
                          {idx + 1}. {step.nodeName}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {step.nodeType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {step.durationMs}ms
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Inspector Details */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            {selectedNodeExecution ? (
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Step Detail
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {selectedNodeExecution.nodeName}
                    </h3>
                  </div>
                  <Badge
                    variant={selectedNodeExecution.status === 'SUCCESS' ? 'success' : 'danger'}
                    size="sm"
                  >
                    {selectedNodeExecution.status}
                  </Badge>
                </div>

                {selectedNodeExecution.errorMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Error: {selectedNodeExecution.errorMessage}</span>
                  </div>
                )}

                {/* Node Output Payload */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Node Output (Downstream Variables)</span>
                    <span className="text-[10px] font-mono text-slate-400">JSON Payload</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-72">
                    {JSON.stringify(selectedNodeExecution.outputData, null, 2)}
                  </pre>
                </div>

                {/* Node Input Config */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Step Input Configuration</span>
                    <span className="text-[10px] font-mono text-slate-400">Sanitized / Redacted</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedNodeExecution.inputData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a node from the left column to view its inputs and outputs.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
