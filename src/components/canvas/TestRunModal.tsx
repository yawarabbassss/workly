'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Workflow } from '@/lib/types/workflow';
import { WorkflowExecution } from '@/lib/types/execution';
import { Play, CheckCircle2, AlertCircle, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface TestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  onExecutionComplete?: (execution: WorkflowExecution) => void;
}

export function TestRunModal({
  isOpen,
  onClose,
  workflow,
  onExecutionComplete,
}: TestRunModalProps) {
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne-sys.com',
        company: 'Cyberdyne Systems',
        message: 'We want to automate multi-branch lead operations across 50 locations.',
      },
      null,
      2
    )
  );
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setExecutionResult(null);

    let parsedPayload = {};
    try {
      if (payloadText.trim()) {
        parsedPayload = JSON.parse(payloadText);
      }
    } catch {
      setError('Payload is not valid JSON format.');
      setIsRunning(false);
      return;
    }

    try {
      const res = await fetch(`/api/workflows/${workflow.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsedPayload }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Execution failed');
      }

      setExecutionResult(data.data);
      if (onExecutionComplete) {
        onExecutionComplete(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Run Test: ${workflow.name}`}
      description="Executes all nodes and integrations through the server-side engine in real-time."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Payload Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Trigger Input Payload (JSON)
          </label>
          <textarea
            rows={5}
            value={payloadText}
            onChange={e => setPayloadText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            loading={isRunning}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>Execute Workflow Now</span>
          </Button>
        </div>

        {/* Live Execution Output Timeline */}
        {executionResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">Execution Result:</span>
                <Badge
                  variant={executionResult.status === 'SUCCESS' ? 'success' : 'danger'}
                  size="sm"
                >
                  {executionResult.status}
                </Badge>
                {executionResult.durationMs !== undefined && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {executionResult.durationMs}ms
                  </span>
                )}
              </div>

              <Link
                href={`/executions/${executionResult.id}`}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Full Audit Log</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Steps executed list */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {executionResult.nodeExecutions?.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      {step.status === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{step.nodeName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {step.durationMs}ms
                    </span>
                  </div>

                  {step.errorMessage && (
                    <p className="text-xs text-rose-400 pl-6">{step.errorMessage}</p>
                  )}

                  {step.outputData && Object.keys(step.outputData).length > 0 && (
                    <div className="pl-6 pt-1">
                      <pre className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24">
                        {JSON.stringify(step.outputData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
