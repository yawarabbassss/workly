import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const execution = db.getExecutionById(params.id);
    if (!execution) {
      return NextResponse.json({ success: false, error: 'Execution not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: execution });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
