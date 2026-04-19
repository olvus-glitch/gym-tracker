'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    let err: string | null;
    if (modo === 'login') {
      err = await login(email, password);
    } else {
      if (!nombre.trim()) {
        setError('El nombre es requerido');
        setCargando(false);
        return;
      }
      err = await register(nombre, email, password);
    }

    setCargando(false);
    if (err) {
      setError(err);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] text-white py-10 px-4 text-center shadow-[0_4px_20px_rgba(124,58,237,0.3)]">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-[0.25em]">FORJA</h1>
        </div>
        <p className="text-sm text-white/70 font-medium">
          Forja tu mejor version
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Toggle login/registro */}
          <div className="flex rounded-xl overflow-hidden border border-border mb-6">
            <button
              onClick={() => { setModo('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                modo === 'login'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted hover:bg-hover-bg'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setModo('registro'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                modo === 'registro'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted hover:bg-hover-bg'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-card-bg rounded-xl shadow-sm border border-border p-5 space-y-4">
            <h2 className="text-lg font-bold text-foreground text-center">
              {modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h2>

            {modo === 'registro' && (
              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
                minLength={modo === 'registro' ? 6 : undefined}
              />
            </div>

            {error && (
              <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
            >
              {cargando
                ? 'Cargando...'
                : modo === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-4">
            {modo === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button onClick={() => setModo('registro')} className="text-primary font-semibold">
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => setModo('login')} className="text-primary font-semibold">
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
