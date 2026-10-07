import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { workflowEngine } from '@/lib/engine/workflowEngine';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const previousExecution = db.getExecutionById(params.id);
    if (!previousExecution) {
      return NextResponse.json({ success: false, error: 'Execution record not found' }, { status: 404 });
    }

    const workflow = db.getWorkflowById(previousExecution.workflowId);
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Parent workflow does not exist' }, { status: 404 });
    }

    // Re-run with the same trigger payload and record retry linkage
    const newExecution = await workflowEngine.execute({
      workflow,
      triggerType: previousExecution.triggerType,
      triggerPayload: previousExecution.triggerPayload,
      retryOfExecutionId: previousExecution.id,
    });

    return NextResponse.json({
      success: true,
      data: newExecution,
      message: 'Execution retried successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
