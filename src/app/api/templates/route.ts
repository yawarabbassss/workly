import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function GET() {
  try {
    const templates = db.getTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
