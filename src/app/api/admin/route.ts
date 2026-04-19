import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.rol !== 'admin') return null;
  return session;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const db = await getDb();

  const usuarios = await db.execute(
    'SELECT u.id, u.nombre, u.email, u.rol, u.created_at, (SELECT COUNT(*) FROM sesiones WHERE user_id = u.id) as total_sesiones, (SELECT COUNT(*) FROM plantillas WHERE user_id = u.id AND es_predefinida = 0) as total_plantillas, (SELECT MAX(fecha) FROM sesiones WHERE user_id = u.id) as ultima_sesion FROM users u ORDER BY u.created_at DESC'
  );

  const stats = await db.executeOne(
    'SELECT (SELECT COUNT(*) FROM users) as total_usuarios, (SELECT COUNT(*) FROM sesiones) as total_sesiones, (SELECT COUNT(*) FROM plantillas WHERE es_predefinida = 0) as total_plantillas, (SELECT COUNT(*) FROM registros_peso) as total_registros_peso'
  );

  return NextResponse.json({ usuarios, stats });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { userId, action } = await req.json();

  if (!userId || !action) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  if (userId === admin.userId) {
    return NextResponse.json({ error: 'No puedes modificar tu propia cuenta' }, { status: 400 });
  }

  const db = await getDb();

  if (action === 'make-admin') {
    await db.run('UPDATE users SET rol = ? WHERE id = ?', ['admin', userId]);
  } else if (action === 'make-user') {
    await db.run('UPDATE users SET rol = ? WHERE id = ?', ['user', userId]);
  } else if (action === 'delete') {
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
  }

  return NextResponse.json({ ok: true });
}