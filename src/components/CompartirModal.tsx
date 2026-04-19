'use client';

import { useState } from 'react';
import type { Ejercicio, RutinaCompartida } from '../lib/types';

interface CompartirModalProps {
  ejercicios: Ejercicio[];
  onCerrar: () => void;
  crearEnlace: (ejercicios: Ejercicio[], nombre: string) => Promise<RutinaCompartida>;
}

export default function CompartirModal({
  ejercicios,
  onCerrar,
  crearEnlace,
}: CompartirModalProps) {
  const [enlace, setEnlace] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [nombre, setNombre] = useState('Mi rutina');

  const handleGenerar = async () => {
    const compartida = await crearEnlace(ejercicios, nombre);
    const url = `${window.location.origin}/compartido/${compartida.token}`;
    setEnlace(url);
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback para iOS
      const input = document.createElement('input');
      input.value = enlace;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card-bg rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Compartir rutina</h3>
          <button
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-hover-bg"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-text-muted">
          Genera un enlace de solo lectura para compartir los {ejercicios.length} ejercicios de este día.
        </p>

        <div>
          <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Nombre de la rutina
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {!enlace ? (
          <button
            onClick={handleGenerar}
            className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            🔗 Generar enlace
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-hover-bg rounded-lg p-3 text-xs text-foreground break-all font-mono">
              {enlace}
            </div>
            <button
              onClick={handleCopiar}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                copiado
                  ? 'bg-success text-white'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {copiado ? '✓ Copiado' : 'Copiar enlace'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
