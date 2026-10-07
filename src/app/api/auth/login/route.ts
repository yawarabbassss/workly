import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    let user = db.getUserByEmail(email);
    if (!user) {
      // Auto-create or authenticate demo user for frictionless testing
      user = db.createUser({
        email,
        fullName: email.split('@')[0],
      });
    }

    const response = NextResponse.json({
      success: true,
      user,
      token: `workly_jwt_${user.id}`,
    });

    response.cookies.set('workly_user_id', user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 30,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
