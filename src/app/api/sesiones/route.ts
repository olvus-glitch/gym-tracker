import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get('fecha');
  const semana = searchParams.get('semana');
  const anio = searchParams.get('anio');
  const mes = searchParams.get('mes');

  const db = await getDb();

  let rows;
  if (fecha) {
    rows = await db.execute(
      'SELECT * FROM sesiones WHERE user_id = ? AND fecha = ?',
      [session.userId, fecha]
    );
  } else if (semana && anio) {
    rows = await db.execute(
      'SELECT * FROM sesiones WHERE user_id = ? AND semana_iso = ? AND anio_iso = ?',
      [session.userId, Number(semana), Number(anio)]
    );
  } else if (mes !== null && anio) {
    const start = anio + '-' + String(Number(mes) + 1).padStart(2, '0') + '-01';
    const endMonth = Number(mes) + 2;
    const endYear = endMonth > 12 ? Number(anio) + 1 : Number(anio);
    const endM = endMonth > 12 ? 1 : endMonth;
    const end = endYear + '-' + String(endM).padStart(2, '0') + '-01';
    rows = await db.execute(
      'SELECT * FROM sesiones WHERE user_id = ? AND fecha >= ? AND fecha < ?',
      [session.userId, start, end]
    );
  } else {
    rows = await db.execute(
      'SELECT * FROM sesiones WHERE user_id = ? ORDER BY fecha DESC',
      [session.userId]
    );
  }

  const sesiones = rows.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    diaDelAnio: r.dia_del_anio,
    semanaISO: r.semana_iso,
    anioISO: r.anio_iso,
    ejercicios: JSON.parse(r.ejercicios as string),
    completada: Boolean(r.completada),
  }));

  return NextResponse.json({ sesiones });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const db = await getDb();

  const id = body.id || uuidv4();
  const ejercicios = JSON.stringify(body.ejercicios || []);

  await db.run(
    'INSERT INTO sesiones (id, user_id, fecha, dia_del_anio, semana_iso, anio_iso, ejercicios, completada) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, fecha) DO UPDATE SET ejercicios = excluded.ejercicios, completada = excluded.completada',
    [id, session.userId, body.fecha, body.diaDelAnio, body.semanaISO, body.anioISO, ejercicios, body.completada ? 1 : 0]
  );

  return NextResponse.json({
    sesion: {
      id,
      fecha: body.fecha,
      diaDelAnio: body.diaDelAnio,
      semanaISO: body.semanaISO,
      anioISO: body.anioISO,
      ejercicios: body.ejercicios || [],
      completada: Boolean(body.completada),
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { fechas } = await req.json();
  if (!fechas || !Array.isArray(fechas) || fechas.length === 0) {
    return NextResponse.json({ error: 'fechas requeridas' }, { status: 400 });
  }

  const db = await getDb();
  const placeholders = fechas.map(() => '?').join(',');
  await db.run(
    'DELETE FROM sesiones WHERE user_id = ? AND fecha IN (' + placeholders + ')',
    [session.userId, ...fechas]
  );

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { sesiones } = await req.json();
  const db = await getDb();

  const statements = (sesiones as Array<Record<string, unknown>>).map((s) => ({
    sql: 'INSERT INTO sesiones (id, user_id, fecha, dia_del_anio, semana_iso, anio_iso, ejercicios, completada) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, fecha) DO UPDATE SET id = excluded.id, ejercicios = excluded.ejercicios, completada = excluded.completada',
    args: [
      (s.id || uuidv4()) as string,
      session.userId,
      s.fecha as string,
      s.diaDelAnio as number,
      s.semanaISO as number,
      s.anioISO as number,
      JSON.stringify(s.ejercicios || []),
      s.completada ? 1 : 0,
    ],
  }));

  await db.batch(statements);

  return NextResponse.json({ ok: true });
}