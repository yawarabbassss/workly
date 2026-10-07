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

    const duplicated = db.duplicateWorkflow(params.id, userId);
    if (!duplicated) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: duplicated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
