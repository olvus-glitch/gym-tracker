import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const rows = await db.execute(
    'SELECT * FROM registros_peso WHERE user_id = ? ORDER BY fecha ASC',
    [session.userId]
  );

  const registros = rows.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    peso: r.peso,
    unidad: r.unidad,
  }));

  return NextResponse.json({ registros });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = uuidv4();

  await db.run(
    'INSERT INTO registros_peso (id, user_id, fecha, peso, unidad) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, fecha) DO UPDATE SET peso = excluded.peso, unidad = excluded.unidad',
    [id, session.userId, body.fecha, body.peso, body.unidad]
  );

  return NextResponse.json({
    registro: { id, fecha: body.fecha, peso: body.peso, unidad: body.unidad },
  });
}