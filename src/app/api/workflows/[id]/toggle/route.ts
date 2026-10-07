import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const existing = db.getWorkflowById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    const nextState = !existing.isActive;
    const updated = db.updateWorkflow(params.id, {
      isActive: nextState,
      status: nextState ? 'active' : 'paused',
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
