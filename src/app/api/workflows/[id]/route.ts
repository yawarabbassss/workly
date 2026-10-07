import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { validateWorkflowDefinition } from '@/lib/engine/validator';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const workflow = db.getWorkflowById(params.id);
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: workflow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const existing = db.getWorkflowById(params.id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    if (body.definition) {
      const validation = validateWorkflowDefinition(body.definition);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Workflow validation failed',
            validationErrors: validation.errors,
          },
          { status: 400 }
        );
      }
    }

    const updated = db.updateWorkflow(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const deleted = db.deleteWorkflow(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
