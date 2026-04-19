import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contrasena son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const existing = await db.executeOne('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email' },
        { status: 409 }
      );
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    const rol = 'user';

    await db.run(
      'INSERT INTO users (id, nombre, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [id, nombre.trim(), email.trim().toLowerCase(), passwordHash, rol]
    );

    await setSessionCookie({ userId: id, email: email.trim().toLowerCase(), rol });

    return NextResponse.json({
      user: { id, nombre: nombre.trim(), email: email.trim().toLowerCase(), rol },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}