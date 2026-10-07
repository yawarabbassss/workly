import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { validateWorkflowDefinition } from '@/lib/engine/validator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const workflows = db.getWorkflows(userId);
    return NextResponse.json({ success: true, data: workflows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, definition, isActive, userId } = body;

    if (!name || String(name).trim() === '') {
      return NextResponse.json({ success: false, error: 'Workflow name is required' }, { status: 400 });
    }

    if (definition) {
      const validation = validateWorkflowDefinition(definition);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid workflow definition',
            validationErrors: validation.errors,
          },
          { status: 400 }
        );
      }
    }

    const workflow = db.createWorkflow({
      userId: userId || 'usr_demo_workly_001',
      name: name.trim(),
      description,
      isActive,
      definition,
    });

    return NextResponse.json({ success: true, data: workflow }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
