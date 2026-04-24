import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const rows = await db.execute('SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY date DESC', [session.userId]);

  const logs = rows.map((r) => ({
    id: r.id,
    date: r.date,
    hours: r.hours,
    quality: r.quality,
    notes: r.notes || undefined,
  }));

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = uuidv4();

  await db.run(
    'INSERT INTO sleep_logs (id, user_id, date, hours, quality, notes) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET hours = excluded.hours, quality = excluded.quality, notes = excluded.notes',
    [id, session.userId, body.date, body.hours, body.quality, body.notes || null]
  );

  return NextResponse.json({
    log: { id, date: body.date, hours: body.hours, quality: body.quality, notes: body.notes || undefined },
  });
}
