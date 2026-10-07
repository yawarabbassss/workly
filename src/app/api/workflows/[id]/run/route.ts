import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { workflowEngine } from '@/lib/engine/workflowEngine';
import { validateWorkflowDefinition } from '@/lib/engine/validator';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const workflow = db.getWorkflowById(params.id);
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    let payload = {};
    try {
      const body = await request.json();
      payload = body.payload || body;
    } catch {
      // Empty payload is allowed for manual trigger
    }

    // Validate workflow definition
    const validation = validateWorkflowDefinition(workflow.definition);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow cannot execute because definition has errors',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Execute through the real server-side engine
    const execution = await workflowEngine.execute({
      workflow,
      triggerType: 'manual',
      triggerPayload: payload,
    });

    return NextResponse.json({
      success: true,
      data: execution,
      message: execution.status === 'SUCCESS' ? 'Workflow executed successfully' : 'Workflow execution completed with errors',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
