'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Ejercicio, GrupoMuscular, RutinaCompartida } from '../../../lib/types';

const COLORES_GRUPO: Record<string, string> = {
  Pierna: 'border-l-blue-500',
  Abdomen: 'border-l-orange-500',
  Espalda: 'border-l-green-500',
  Bíceps: 'border-l-pink-500',
  Pecho: 'border-l-red-500',
  Hombros: 'border-l-yellow-500',
  Tríceps: 'border-l-purple-500',
  Otro: 'border-l-gray-500',
};

export default function CompartidoPage() {
  const params = useParams();
  const token = params.token as string;
  const [rutina, setRutina] = useState<RutinaCompartida | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    fetch(`/api/compartidas?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (data.rutina) {
          setRutina(data.rutina);
        } else {
          setNoEncontrada(true);
        }
      })
      .catch(() => {
        setNoEncontrada(true);
      });
  }, [token]);

  if (noEncontrada) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white py-6 px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">💪</span>
            <h1 className="text-2xl font-extrabold tracking-wide">GYM TRACKER</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-4xl mb-4">🔗</p>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Rutina no encontrada
            </h2>
            <p className="text-sm text-text-muted">
              Este enlace no existe o ha expirado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!rutina) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const agrupados: Partial<Record<GrupoMuscular, Ejercicio[]>> = {};
  for (const ej of rutina.ejercicios) {
    if (!agrupados[ej.grupoMuscular]) agrupados[ej.grupoMuscular] = [];
    agrupados[ej.grupoMuscular]!.push(ej);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">💪</span>
          <h1 className="text-2xl font-extrabold tracking-wide">GYM TRACKER</h1>
        </div>
        <p className="text-sm text-purple-100 opacity-90">Rutina compartida</p>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4 text-center">
          <h2 className="text-lg font-bold">{rutina.nombreRutina}</h2>
          <p className="text-xs text-text-muted mt-1">
            {rutina.ejercicios.length} ejercicios • Solo lectura
          </p>
        </div>

        {Object.entries(agrupados).map(([grupo, ejercicios]) => (
          <div key={grupo}>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 px-1">
              {grupo}
            </h3>
            <div className="space-y-2">
              {ejercicios!.map((ej) => {
                const color = COLORES_GRUPO[ej.grupoMuscular] || 'border-l-gray-400';
                return (
                  <div
                    key={ej.id}
                    className={`bg-card-bg rounded-lg shadow-sm border border-border border-l-4 ${color} p-4`}
                  >
                    <h4 className="font-semibold text-foreground text-sm">
                      {ej.nombre}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {ej.series}x{ej.repeticiones}
                      {ej.peso ? ` • ${ej.peso}${ej.unidad}` : ''}
                    </p>
                    {ej.notas && (
                      <p className="text-xs text-text-muted/70 italic mt-0.5">
                        {ej.notas}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
