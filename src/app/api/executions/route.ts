import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { ExecutionStatus } from '@/lib/types/execution';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId') || undefined;
    const status = (searchParams.get('status') as ExecutionStatus) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = db.getExecutions({
      workflowId,
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.executions,
      total: result.total,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
