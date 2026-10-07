'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Workflow } from '@/lib/types/workflow';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const workflowId = resolvedParams.id;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Workflow not found');
      }
      setWorkflow(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (updated: Partial<Workflow>) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setWorkflow(data.data);
      }
    } catch (err) {
      console.error('Save workflow error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading visual workflow canvas...</span>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex-1 p-8 text-center bg-slate-950 text-slate-100 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Workflow Error</h2>
        <p className="text-xs text-slate-400 mb-4">{error || 'Could not load workflow'}</p>
        <Link href="/workflows">
          <Button size="sm">Back to Workflows</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* Editor Header */}
      <Header
        title={workflow.name}
        subtitle={workflow.description || 'Visual workflow canvas'}
      >
        <Link href="/workflows">
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Workflows</span>
          </Button>
        </Link>
      </Header>

      {/* Main Canvas */}
      <main className="flex-1 relative">
        <WorkflowCanvas
          initialWorkflow={workflow}
          onSaveWorkflow={handleSaveWorkflow}
        />
      </main>
    </div>
  );
}
