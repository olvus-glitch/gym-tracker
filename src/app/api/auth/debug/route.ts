import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;
  const hasJwt = !!process.env.JWT_SECRET;
  
  return NextResponse.json({
    env: {
      TURSO_DATABASE_URL: url || 'NOT SET',
      TURSO_AUTH_TOKEN: hasToken ? 'SET (hidden)' : 'NOT SET',
      JWT_SECRET: hasJwt ? 'SET (hidden)' : 'NOT SET',
    },
  });
}
