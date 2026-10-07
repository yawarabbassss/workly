import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { encryptCredential } from '@/lib/engine/crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_demo_workly_001';
    
    // Return sanitized credentials list without raw secrets
    const credentials = db.getCredentials(userId).map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      isValid: c.isValid,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      isConfigured: true,
    }));

    return NextResponse.json({ success: true, data: credentials });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, secretValue, userId } = body;

    if (!name || !type || !secretValue) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and secretValue are required' },
        { status: 400 }
      );
    }

    const encrypted = encryptCredential(secretValue);
    const cred = db.saveCredential({
      userId: userId || 'usr_demo_workly_001',
      name,
      type,
      encryptedData: encrypted,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: cred.id,
        name: cred.name,
        type: cred.type,
        isValid: cred.isValid,
        createdAt: cred.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
