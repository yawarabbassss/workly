import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const deleted = db.deleteCredential(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Credential not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Credential deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
