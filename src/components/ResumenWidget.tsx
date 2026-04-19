'use client';

import { useMemo } from 'react';
import { useSesiones } from '../lib/store';
import type { SesionEntrenamiento } from '../lib/types';

function calcularRacha(sesiones: SesionEntrenamiento[]): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechasConEjercicios = new Set(
    sesiones
      .filter((s) => s.completada)
      .map((s) => s.fecha)
  );

  let racha = 0;
  const dia = new Date(hoy);

  // Si hoy no tiene ejercicios, empezar desde ayer
  const hoyStr = dia.toISOString().split('T')[0];
  if (!fechasConEjercicios.has(hoyStr)) {
    dia.setDate(dia.getDate() - 1);
  }

  while (true) {
    const str = dia.toISOString().split('T')[0];
    if (fechasConEjercicios.has(str)) {
      racha++;
      dia.setDate(dia.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
}

export default function ResumenWidget() {
  const { sesiones, cargado } = useSesiones();

  const stats = useMemo(() => {
    if (!cargado || sesiones.length === 0) return null;

    const racha = calcularRacha(sesiones);

    // Ultimo entreno
    const conEjercicios = sesiones
      .filter((s) => s.completada)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const ultimo = conEjercicios[0] || null;

    // Volumen semanal (semana actual)
    const hoy = new Date();
    const diaActual = hoy.getDay() || 7; // 1=Lun...7=Dom
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaActual - 1));
    lunes.setHours(0, 0, 0, 0);

    let volumenSemanal = 0;
    let diasEntrenadosSemana = 0;

    for (const s of sesiones) {
      const f = new Date(s.fecha + 'T00:00:00');
      if (f >= lunes && f <= hoy && s.completada) {
        diasEntrenadosSemana++;
        for (const ej of s.ejercicios) {
          volumenSemanal += (ej.peso || 0) * ej.series * ej.repeticiones;
        }
      }
    }

    // Ejercicios de hoy
    const hoyStr = hoy.toISOString().split('T')[0];
    const sesionHoy = sesiones.find((s) => s.fecha === hoyStr);
    const ejerciciosHoy = sesionHoy?.ejercicios.length || 0;

    return {
      racha,
      ultimo,
      volumenSemanal,
      diasEntrenadosSemana,
      ejerciciosHoy,
    };
  }, [sesiones, cargado]);

  if (!cargado || !stats) return null;

  const formatVolumen = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(v);
  };

  const diasDesdeUltimo = () => {
    if (!stats.ultimo) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ultimo = new Date(stats.ultimo.fecha + 'T00:00:00');
    const diff = Math.floor((hoy.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} dias`;
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      {/* Racha */}
      <div className="bg-card-bg rounded-xl border border-border p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
            <path d="M12 5.5c-3.11 2.75-5 5.77-5 8.3 0 3.08 2.19 5.2 5 5.2s5-2.12 5-5.2c0-2.53-1.89-5.55-5-8.3z" opacity="0.6"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-black text-foreground leading-none">{stats.racha}</p>
          <p className="text-[10px] text-text-muted font-medium mt-0.5">
            {stats.racha === 1 ? 'dia seguido' : 'dias seguidos'}
          </p>
        </div>
      </div>

      {/* Ultimo entreno */}
      <div className="bg-card-bg rounded-xl border border-border p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">{diasDesdeUltimo() || 'Sin datos'}</p>
          <p className="text-[10px] text-text-muted font-medium mt-0.5">ultimo entreno</p>
        </div>
      </div>

      {/* Volumen semanal */}
      <div className="bg-card-bg rounded-xl border border-border p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-black text-foreground leading-none">{formatVolumen(stats.volumenSemanal)}</p>
          <p className="text-[10px] text-text-muted font-medium mt-0.5">kg esta semana</p>
        </div>
      </div>

      {/* Dias esta semana */}
      <div className="bg-card-bg rounded-xl border border-border p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-black text-foreground leading-none">{stats.diasEntrenadosSemana}<span className="text-sm font-medium text-text-muted">/7</span></p>
          <p className="text-[10px] text-text-muted font-medium mt-0.5">dias esta semana</p>
        </div>
      </div>
    </div>
  );
}
