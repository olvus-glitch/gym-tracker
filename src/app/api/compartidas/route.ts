import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token) {
    const db = await getDb();
    const row = await db.executeOne(
      'SELECT * FROM rutinas_compartidas WHERE token = ?',
      [token]
    );

    if (!row) {
      return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      rutina: {
        id: row.id,
        token: row.token,
        ejercicios: JSON.parse(row.ejercicios as string),
        nombreRutina: row.nombre_rutina,
        creadaEn: row.creada_en,
        expiraEn: row.expira_en,
      },
    });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = await getDb();
  const rows = await db.execute(
    'SELECT * FROM rutinas_compartidas WHERE user_id = ? ORDER BY creada_en DESC',
    [session.userId]
  );

  const compartidas = rows.map((r) => ({
    id: r.id,
    token: r.token,
    ejercicios: JSON.parse(r.ejercicios as string),
    nombreRutina: r.nombre_rutina,
    creadaEn: r.creada_en,
    expiraEn: r.expira_en,
  }));

  return NextResponse.json({ compartidas });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();

  const id = uuidv4();
  const token = uuidv4();

  await db.run(
    'INSERT INTO rutinas_compartidas (id, user_id, token, ejercicios, nombre_rutina, creada_en) VALUES (?, ?, ?, ?, ?, ?)',
    [id, session.userId, token, JSON.stringify(body.ejercicios), body.nombreRutina, new Date().toISOString()]
  );

  return NextResponse.json({
    compartida: {
      id,
      token,
      ejercicios: body.ejercicios,
      nombreRutina: body.nombreRutina,
      creadaEn: new Date().toISOString(),
    },
  });
}