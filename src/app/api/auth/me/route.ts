import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workly_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
