import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workly_user_id')?.value || 'usr_demo_workly_001';
    let user = db.getUserById(userId);

    if (!user) {
      user = db.getUserById('usr_demo_workly_001');
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
