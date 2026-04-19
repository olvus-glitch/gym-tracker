'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import type { Ejercicio, SesionEntrenamiento } from '@/lib/types';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
  total_sesiones: number;
  total_plantillas: number;
  ultima_sesion: string | null;
}

interface Stats {
  total_usuarios: number;
  total_sesiones: number;
  total_plantillas: number;
  total_registros_peso: number;
}

interface DetalleUsuario {
  user: { id: string; nombre: string; email: string; rol: string };
  sesiones: SesionEntrenamiento[];
  plantillas: Array<{ id: string; nombre: string; descripcion?: string }>;
  registrosPeso: Array<{ id: string; fecha: string; peso: number; unidad: string }>;
}

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState<DetalleUsuario | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUsuarios(data.usuarios);
      setStats(data.stats);
    } catch {
      router.push('/');
    }
    setCargando(false);
  }, [router]);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.push('/');
      return;
    }
    cargarDatos();
  }, [loading, user, router, cargarDatos]);

  const verDetalle = async (userId: string) => {
    const res = await fetch(`/api/admin/usuario?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setDetalle(data);
    }
  };

  const accionUsuario = async (userId: string, action: string) => {
    if (confirmAction !== `${userId}-${action}`) {
      setConfirmAction(`${userId}-${action}`);
      setTimeout(() => setConfirmAction(null), 3000);
      return;
    }
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    setConfirmAction(null);
    cargarDatos();
    if (detalle?.user.id === userId) setDetalle(null);
  };

  if (loading || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-extrabold tracking-wide">PANEL ADMIN</h1>
            </div>
            <p className="text-sm text-red-100 opacity-90">
              Bienvenido, {user?.nombre}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 rounded-lg bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors"
            >
              ← App
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card-bg rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_usuarios}</p>
              <p className="text-xs text-text-muted mt-1">Usuarios</p>
            </div>
            <div className="bg-card-bg rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.total_sesiones}</p>
              <p className="text-xs text-text-muted mt-1">Sesiones</p>
            </div>
            <div className="bg-card-bg rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.total_plantillas}</p>
              <p className="text-xs text-text-muted mt-1">Plantillas</p>
            </div>
            <div className="bg-card-bg rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total_registros_peso}</p>
              <p className="text-xs text-text-muted mt-1">Registros peso</p>
            </div>
          </div>
        )}

        {/* Lista de usuarios */}
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-hover-bg">
            <h2 className="text-sm font-bold text-foreground">Usuarios registrados</h2>
          </div>
          <div className="divide-y divide-border">
            {usuarios.map((u) => (
              <div key={u.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{u.nombre}</span>
                      {u.rol === 'admin' && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{u.email}</p>
                    <div className="flex gap-3 mt-1 text-xs text-text-muted">
                      <span>{u.total_sesiones} sesiones</span>
                      <span>{u.total_plantillas} plantillas</span>
                      {u.ultima_sesion && (
                        <span>Última: {u.ultima_sesion}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => verDetalle(u.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Ver
                    </button>
                    {u.id !== user?.id && (
                      <>
                        {u.rol === 'user' ? (
                          <button
                            onClick={() => accionUsuario(u.id, 'make-admin')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              confirmAction === `${u.id}-make-admin`
                                ? 'bg-orange-500 text-white'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          >
                            {confirmAction === `${u.id}-make-admin` ? '¿Confirmar?' : '→ Admin'}
                          </button>
                        ) : (
                          <button
                            onClick={() => accionUsuario(u.id, 'make-user')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              confirmAction === `${u.id}-make-user`
                                ? 'bg-orange-500 text-white'
                                : 'bg-hover-bg text-gray-700 hover:bg-border'
                            }`}
                          >
                            {confirmAction === `${u.id}-make-user` ? '¿Confirmar?' : '→ User'}
                          </button>
                        )}
                        <button
                          onClick={() => accionUsuario(u.id, 'delete')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            confirmAction === `${u.id}-delete`
                              ? 'bg-danger text-white'
                              : 'bg-danger/10 text-danger hover:bg-danger/20'
                          }`}
                        >
                          {confirmAction === `${u.id}-delete` ? '¿Eliminar?' : '🗑️'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle de usuario */}
        {detalle && (
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-hover-bg flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">
                Detalle: {detalle.user.nombre} ({detalle.user.email})
              </h2>
              <button
                onClick={() => setDetalle(null)}
                className="text-text-muted hover:text-foreground text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Sesiones */}
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Sesiones ({detalle.sesiones.length})
                </h3>
                {detalle.sesiones.length === 0 ? (
                  <p className="text-xs text-text-muted">Sin sesiones</p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {detalle.sesiones.slice(0, 20).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-hover-bg rounded-lg px-3 py-2 text-xs"
                      >
                        <span className="font-medium">{s.fecha}</span>
                        <span className="text-text-muted">
                          {s.ejercicios.length} ejercicios
                        </span>
                        <div className="flex gap-1">
                          {[...new Set(s.ejercicios.map((e: Ejercicio) => e.grupoMuscular))].map(
                            (g) => (
                              <span
                                key={g}
                                className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium"
                              >
                                {g}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                    {detalle.sesiones.length > 20 && (
                      <p className="text-xs text-text-muted text-center">
                        ...y {detalle.sesiones.length - 20} más
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Plantillas custom */}
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Plantillas ({detalle.plantillas.length})
                </h3>
                {detalle.plantillas.length === 0 ? (
                  <p className="text-xs text-text-muted">Sin plantillas custom</p>
                ) : (
                  <div className="space-y-1">
                    {detalle.plantillas.map((p) => (
                      <div key={p.id} className="bg-hover-bg rounded-lg px-3 py-2 text-xs">
                        <span className="font-medium">{p.nombre}</span>
                        {p.descripcion && (
                          <span className="text-text-muted ml-2">— {p.descripcion}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registros peso */}
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Peso corporal ({detalle.registrosPeso.length} registros)
                </h3>
                {detalle.registrosPeso.length === 0 ? (
                  <p className="text-xs text-text-muted">Sin registros</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detalle.registrosPeso.slice(0, 10).map((r) => (
                      <span
                        key={r.id}
                        className="bg-hover-bg rounded-lg px-2 py-1 text-xs"
                      >
                        {r.fecha}: <strong>{r.peso}{r.unidad}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
