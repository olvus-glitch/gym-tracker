'use client';

import { useState } from 'react';
import type { Plantilla, DiaSemana } from '../lib/types';
import { NOMBRES_DIA } from '../lib/types';

interface Props {
  plantillas: Plantilla[];
  onAplicar: (plantilla: Plantilla) => void;
  onEliminar: (id: string) => void;
  onCerrar: () => void;
  onIrEditor: () => void;
}

export default function PlantillaSelector({
  plantillas,
  onAplicar,
  onEliminar,
  onCerrar,
  onIrEditor,
}: Props) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null);

  const plantillaActual = plantillas.find((p) => p.id === seleccionada);

  const handleAplicar = () => {
    if (!plantillaActual) return;
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    onAplicar(plantillaActual);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-text">📋 Plantillas / Splits</h2>
          <button
            onClick={onCerrar}
            className="text-text-muted text-xl leading-none px-2"
          >
            ✕
          </button>
        </div>

        {/* Lista de plantillas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {plantillas.map((p) => (
            <div key={p.id} className="relative">
              <button
                onClick={() => {
                  setSeleccionada(p.id);
                  setConfirmar(false);
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  seleccionada === p.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card-bg hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-text">{p.nombre}</span>
                  {p.esPredefinida && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      Predefinida
                    </span>
                  )}
                </div>
                {p.descripcion && (
                  <p className="text-xs text-text-muted mb-2">{p.descripcion}</p>
                )}
                {/* Mini resumen de dias */}
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5, 6, 7] as DiaSemana[]).map((d) => {
                    const tiene = p.dias[d] && p.dias[d]!.length > 0;
                    return (
                      <div
                        key={d}
                        className={`text-[10px] w-8 text-center py-0.5 rounded ${
                          tiene
                            ? 'bg-primary/15 text-primary font-bold'
                            : 'bg-hover-bg text-text-muted'
                        }`}
                      >
                        {NOMBRES_DIA[d].slice(0, 3)}
                      </div>
                    );
                  })}
                </div>
              </button>
              {/* Boton borrar plantilla (solo no predefinidas) */}
              {!p.esPredefinida && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmBorrar === p.id) {
                      onEliminar(p.id);
                      setConfirmBorrar(null);
                      if (seleccionada === p.id) setSeleccionada(null);
                    } else {
                      setConfirmBorrar(p.id);
                      setTimeout(() => setConfirmBorrar(null), 3000);
                    }
                  }}
                  className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    confirmBorrar === p.id
                      ? 'bg-danger text-white'
                      : 'bg-danger/10 text-danger hover:bg-danger/20'
                  }`}
                >
                  {confirmBorrar === p.id ? 'Confirmar' : 'Borrar'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Detalle de plantilla seleccionada */}
        {plantillaActual && (
          <div className="px-4 py-2 border-t border-border bg-hover-bg max-h-40 overflow-y-auto">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Resumen
            </p>
            {([1, 2, 3, 4, 5] as DiaSemana[]).map((d) => {
              const ejercicios = plantillaActual.dias[d];
              if (!ejercicios || ejercicios.length === 0) return null;
              const grupos = [...new Set(ejercicios.map((e) => e.grupoMuscular))];
              return (
                <div key={d} className="text-xs text-text py-0.5">
                  <span className="font-semibold">{NOMBRES_DIA[d]}:</span>{' '}
                  <span className="text-text-muted">{grupos.join(' + ')}</span>
                  <span className="text-text-muted/60"> ({ejercicios.length} ej.)</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex gap-2">
          <button
            onClick={onIrEditor}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted hover:bg-hover-bg transition-colors"
          >
            + Nueva plantilla
          </button>
          <button
            onClick={handleAplicar}
            disabled={!seleccionada}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
              seleccionada
                ? confirmar
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-primary hover:bg-primary-dark'
                : 'bg-border cursor-not-allowed'
            }`}
          >
            {confirmar ? '¿Reemplazar semana?' : 'Aplicar a esta semana'}
          </button>
        </div>
      </div>
    </div>
  );
}
