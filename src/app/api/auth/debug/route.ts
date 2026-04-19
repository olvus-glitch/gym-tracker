import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const users = await db.execute('SELECT id, email, rol FROM users');
    return NextResponse.json({ ok: true, users, tables: 'initialized' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 });
  }
}
