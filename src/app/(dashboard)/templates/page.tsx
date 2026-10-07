'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Template } from '@/lib/types/workflow';
import {
  Sparkles,
  Headphones,
  Share2,
  ArrowRight,
  CheckCircle2,
  Workflow as WorkflowIcon,
  Play,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Headphones,
  Share2,
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setActivatingId(templateId);
    try {
      const res = await fetch(`/api/templates/${templateId}/use`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(`/workflows/${data.data.id}`);
      }
    } catch (err) {
      console.error('Use template error:', err);
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Workflow Templates Gallery"
        subtitle="Production-tested automation blueprints with pre-configured Grok prompts and node pipelines"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => {
            const Icon = ICON_MAP[tpl.icon] || Sparkles;
            const isUsing = activatingId === tpl.id;

            return (
              <div
                key={tpl.id}
                className="rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 transition-all p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="primary" size="sm">
                      {tpl.category}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Flow Steps Preview */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Pipeline Architecture ({tpl.definition.nodes.length} Steps)
                    </p>
                    <div className="space-y-1">
                      {tpl.definition.nodes.map((n, i) => (
                        <div key={n.id} className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400 shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-semibold">{n.data.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({n.data.type.replace('_', ' ')})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/60">
                    {tpl.tags.map(t => (
                      <span
                        key={t}
                        className="text-[10px] font-medium bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tested & Ready</span>
                  </span>

                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(tpl.id)}
                    loading={isUsing}
                    className="bg-indigo-600 hover:bg-indigo-500 shadow-md"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
