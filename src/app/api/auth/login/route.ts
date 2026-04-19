import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contrasena son requeridos' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.executeOne(
      'SELECT id, nombre, email, password_hash, rol FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Email o contrasena incorrectos' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email o contrasena incorrectos' },
        { status: 401 }
      );
    }

    await setSessionCookie({
      userId: user.id as string,
      email: user.email as string,
      rol: user.rol as string,
    });

    return NextResponse.json({
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesion' },
      { status: 500 }
    );
  }
}
