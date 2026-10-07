import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    let userId = 'usr_demo_workly_001';
    try {
      const body = await request.json();
      if (body.userId) userId = body.userId;
    } catch {
      // default demo user
    }

    const template = db.getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const workflow = db.createWorkflow({
      userId,
      name: template.name,
      description: template.description,
      isActive: false,
      definition: JSON.parse(JSON.stringify(template.definition)),
    });

    return NextResponse.json({ success: true, data: workflow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
