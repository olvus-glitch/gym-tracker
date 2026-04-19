import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
  }

  const db = await getDb();

  const user = await db.executeOne('SELECT id, nombre, email, rol FROM users WHERE id = ?', [userId]);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const sesiones = await db.execute(
    'SELECT * FROM sesiones WHERE user_id = ? ORDER BY fecha DESC',
    [userId]
  );

  const plantillas = await db.execute(
    'SELECT * FROM plantillas WHERE user_id = ?',
    [userId]
  );

  const registrosPeso = await db.execute(
    'SELECT * FROM registros_peso WHERE user_id = ? ORDER BY fecha DESC',
    [userId]
  );

  return NextResponse.json({
    user,
    sesiones: sesiones.map((s) => ({
      id: s.id,
      fecha: s.fecha,
      diaDelAnio: s.dia_del_anio,
      semanaISO: s.semana_iso,
      anioISO: s.anio_iso,
      ejercicios: JSON.parse(s.ejercicios as string),
      completada: Boolean(s.completada),
    })),
    plantillas: plantillas.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      dias: JSON.parse(p.dias as string),
      esPredefinida: Boolean(p.es_predefinida),
    })),
    registrosPeso: registrosPeso.map((r) => ({
      id: r.id,
      fecha: r.fecha,
      peso: r.peso,
      unidad: r.unidad,
    })),
  });
}