import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gym-tracker-secret-key-change-in-production-2024'
);

const PUBLIC_PATHS = ['/login', '/compartido', '/api/auth', '/api/debug'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    (pathname.startsWith('/api/compartidas') && req.method === 'GET' && req.nextUrl.searchParams.has('token')) ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|webmanifest)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('gym-session')?.value;

  if (!token) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // Pages redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin routes require admin role
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (payload.rol !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('gym-session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json).*)'],
};
