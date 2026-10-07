import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    const newUser = db.createUser({
      email,
      fullName: fullName || email.split('@')[0],
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
      token: `workly_jwt_${newUser.id}`,
    }, { status: 201 });

    response.cookies.set('workly_user_id', newUser.id, {
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
