import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const db = await getDb();
  const user = await db.executeOne(
    'SELECT id, nombre, email, rol FROM users WHERE id = ?',
    [session.userId]
  );

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}