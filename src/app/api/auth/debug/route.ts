import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;
  const hasJwt = !!process.env.JWT_SECRET;
  
  try {
    const db = await getDb();
    const users = await db.execute('SELECT id, email, rol FROM users');
    return NextResponse.json({
      env: {
        TURSO_DATABASE_URL: url || 'NOT SET',
        TURSO_AUTH_TOKEN: hasToken ? 'SET' : 'NOT SET',
        JWT_SECRET: hasJwt ? 'SET' : 'NOT SET',
      },
      db: 'connected',
      users,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      env: {
        TURSO_DATABASE_URL: url || 'NOT SET',
        TURSO_AUTH_TOKEN: hasToken ? 'SET' : 'NOT SET',
        JWT_SECRET: hasJwt ? 'SET' : 'NOT SET',
      },
      db: 'error',
      error: message,
    }, { status: 500 });
  }
}
