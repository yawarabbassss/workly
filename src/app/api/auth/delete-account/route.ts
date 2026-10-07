import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('workly_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    db.deleteUser(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Account and all associated workflows and executions deleted successfully.',
    });

    response.cookies.delete('workly_user_id');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
