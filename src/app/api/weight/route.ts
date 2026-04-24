import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const rows = await db.execute('SELECT id, fecha, peso FROM registros_peso WHERE user_id = ? ORDER BY fecha ASC', [session.userId]);
  const logs = rows.map((r) => ({ id: r.id, date: r.fecha, weight: r.peso }));

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = uuidv4();

  await db.run(
    'INSERT INTO registros_peso (id, user_id, fecha, peso, unidad) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, fecha) DO UPDATE SET peso = excluded.peso',
    [id, session.userId, body.date, body.weight, 'kg']
  );

  return NextResponse.json({ log: { id, date: body.date, weight: body.weight } });
}
