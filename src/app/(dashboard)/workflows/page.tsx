'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AiWorkflowModal } from '@/components/canvas/AiWorkflowModal';
import { Workflow } from '@/lib/types/workflow';
import {
  Sparkles,
  Plus,
  Search,
  Play,
  Copy,
  Trash2,
  Workflow as WorkflowIcon,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';

function WorkflowsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'paused'>('all');

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('createWithAi') === 'true') {
      setIsAiModalOpen(true);
    }
    if (searchParams.get('new') === 'true') {
      setIsNewModalOpen(true);
    }
    fetchWorkflows();
  }, [searchParams]);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (data.success) {
        setWorkflows(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          isActive: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/workflows/${data.data.id}`);
      }
    } catch (err) {
      console.error('Create workflow error:', err);
    } finally {
      setIsSubmitting(false);
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

  const handleToggle = async (wf: Workflow, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/workflows/${wf.id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWorkflows(prev => prev.map(w => (w.id === wf.id ? data.data : w)));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/workflows/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWorkflows(prev => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Duplicate error:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteWorkflowId) return;
    try {
      const res = await fetch(`/api/workflows/${deleteWorkflowId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWorkflows(prev => prev.filter(w => w.id !== deleteWorkflowId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteWorkflowId(null);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'active') return matchesSearch && w.isActive;
    if (statusFilter === 'draft') return matchesSearch && !w.isActive && w.status === 'draft';
    if (statusFilter === 'paused') return matchesSearch && !w.isActive && w.status === 'paused';
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Automation Workflows" subtitle="Design, configure triggers, and deploy automated pipelines">
        <Button
          size="sm"
          onClick={() => setIsAiModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          <span>Build with Grok AI</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          <span>New Workflow</span>
        </Button>
      </Header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search workflows by title or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['all', 'active', 'draft', 'paused'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
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

        {/* Workflows Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <WorkflowIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">You haven&apos;t created a matching workflow yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start building by describing your requirements in plain English or configuring steps visually on the canvas.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button size="sm" onClick={() => setIsAiModalOpen(true)}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Create with AI</span>
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsNewModalOpen(true)}>
                <span>Blank Workflow</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkflows.map(wf => (
              <div
                key={wf.id}
                className="group rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850/80 transition-all duration-200 p-5 flex flex-col justify-between shadow-lg relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      {wf.definition.nodes.length} Steps
                    </span>
                    <button
                      onClick={e => handleToggle(wf, e)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                        wf.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {wf.isActive ? '● Active' : '○ Paused'}
                    </button>
                  </div>

                  <Link href={`/workflows/${wf.id}`} className="block">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>
                  </Link>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Updated {new Date(wf.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={e => handleDuplicate(wf.id, e)}
                      title="Duplicate workflow"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteWorkflowId(wf.id);
                      }}
                      title="Delete workflow"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/workflows/${wf.id}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                        <span>Edit Canvas</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Blank Workflow Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Workflow"
        description="Initialize a blank visual orchestration canvas."
      >
        <form onSubmit={handleCreateNew} className="space-y-4">
          <Input
            label="Workflow Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Lead Ingestion & Qualification"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="What does this automation accomplish?"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={isSubmitting} disabled={!newName.trim()}>
              Create Workflow
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteWorkflowId}
        onClose={() => setDeleteWorkflowId(null)}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? All execution history will be preserved."
        maxWidth="sm"
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteWorkflowId(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Workflow
          </Button>
        </div>
      </Modal>

      {/* AI Generator Modal */}
      <AiWorkflowModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyWorkflow={handleApplyAiWorkflow}
      />
    </div>
  );
}

export default function WorkflowsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading workflows...</div>}>
      <WorkflowsContent />
    </Suspense>
  );
}
