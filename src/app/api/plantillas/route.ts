import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const rows = await db.execute(
    'SELECT * FROM plantillas WHERE user_id = ?',
    [session.userId]
  );

  const plantillas = rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion || undefined,
    dias: JSON.parse(r.dias as string),
    esPredefinida: Boolean(r.es_predefinida),
  }));

  return NextResponse.json({ plantillas });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = body.id || uuidv4();

  await db.run(
    'INSERT INTO plantillas (id, user_id, nombre, descripcion, dias, es_predefinida) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre, descripcion = excluded.descripcion, dias = excluded.dias',
    [id, session.userId, body.nombre, body.descripcion || null, JSON.stringify(body.dias || {}), body.esPredefinida ? 1 : 0]
  );

  return NextResponse.json({
    plantilla: {
      id,
      nombre: body.nombre,
      descripcion: body.descripcion || undefined,
      dias: body.dias || {},
      esPredefinida: Boolean(body.esPredefinida),
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await req.json();
  const db = await getDb();

  await db.run('DELETE FROM plantillas WHERE id = ? AND user_id = ?', [id, session.userId]);

  return NextResponse.json({ ok: true });
}