import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const rows = date
    ? await db.execute('SELECT * FROM cardio_sessions WHERE user_id = ? AND date = ? ORDER BY date DESC', [session.userId, date])
    : await db.execute('SELECT * FROM cardio_sessions WHERE user_id = ? ORDER BY date DESC', [session.userId]);

  const sessions = rows.map((r) => ({
    id: r.id,
    date: r.date,
    type: r.type,
    machine: r.machine,
    duration: r.duration,
    distance: r.distance,
    calories: r.calories,
    intensity: r.intensity,
  }));

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = body.id || uuidv4();

  await db.run(
    'INSERT INTO cardio_sessions (id, user_id, date, type, machine, duration, distance, calories, intensity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, session.userId, body.date, body.type, body.machine || null, body.duration, body.distance, body.calories, body.intensity]
  );

  return NextResponse.json({
    session: {
      id,
      date: body.date,
      type: body.type,
      machine: body.machine,
      duration: body.duration,
      distance: body.distance,
      calories: body.calories,
      intensity: body.intensity,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const db = await getDb();
  await db.run('DELETE FROM cardio_sessions WHERE id = ? AND user_id = ?', [id, session.userId]);

  return NextResponse.json({ ok: true });
}
