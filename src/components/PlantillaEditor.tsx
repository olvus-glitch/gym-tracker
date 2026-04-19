'use client';

import { useState } from 'react';
import type { Plantilla, EjercicioPlantilla, DiaSemana, GrupoMuscular } from '../lib/types';
import { NOMBRES_DIA, GRUPOS_MUSCULARES } from '../lib/types';

interface Props {
  plantillaExistente?: Plantilla;
  onGuardar: (plantilla: Omit<Plantilla, 'id'> & { id?: string }) => void;
  onCerrar: () => void;
}

const DIAS_LABORALES: DiaSemana[] = [1, 2, 3, 4, 5];

const ejercicioVacio: EjercicioPlantilla = {
  nombre: '',
  grupoMuscular: 'Otro',
  series: 4,
  repeticiones: 10,
  unidad: 'kg',
};

export default function PlantillaEditor({
  plantillaExistente,
  onGuardar,
  onCerrar,
}: Props) {
  const [nombre, setNombre] = useState(plantillaExistente?.nombre || '');
  const [descripcion, setDescripcion] = useState(plantillaExistente?.descripcion || '');
  const [diaActivo, setDiaActivo] = useState<DiaSemana>(1);
  const [dias, setDias] = useState<Partial<Record<DiaSemana, EjercicioPlantilla[]>>>(
    plantillaExistente?.dias || {}
  );

  const ejerciciosDia = dias[diaActivo] || [];

  const agregarEjercicio = () => {
    setDias({
      ...dias,
      [diaActivo]: [...ejerciciosDia, { ...ejercicioVacio }],
    });
  };

  const actualizarEjercicio = (idx: number, campo: string, valor: string | number) => {
    const nuevos = [...ejerciciosDia];
    nuevos[idx] = { ...nuevos[idx], [campo]: valor };
    setDias({ ...dias, [diaActivo]: nuevos });
  };

  const eliminarEjercicio = (idx: number) => {
    const nuevos = ejerciciosDia.filter((_, i) => i !== idx);
    setDias({ ...dias, [diaActivo]: nuevos });
  };

  const handleGuardar = () => {
    if (!nombre.trim()) return;
    onGuardar({
      ...(plantillaExistente?.id ? { id: plantillaExistente.id } : {}),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      dias,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-text">
            {plantillaExistente ? '✏️ Editar plantilla' : '➕ Nueva plantilla'}
          </h2>
          <button onClick={onCerrar} className="text-text-muted text-xl leading-none px-2">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Nombre y descripción */}
          <div className="space-y-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la plantilla"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/30 text-text-muted"
            />
          </div>

          {/* Selector de día */}
          <div className="flex gap-1">
            {DIAS_LABORALES.map((d) => {
              const count = (dias[d] || []).length;
              return (
                <button
                  key={d}
                  onClick={() => setDiaActivo(d)}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                    diaActivo === d
                      ? 'bg-primary text-white'
                      : 'bg-hover-bg text-text-muted hover:bg-border'
                  }`}
                >
                  {NOMBRES_DIA[d].slice(0, 3)}
                  {count > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] rounded-full flex items-center justify-center font-bold ${
                        diaActivo === d ? 'bg-card-bg text-primary' : 'bg-primary text-white'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ejercicios del día */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {NOMBRES_DIA[diaActivo]} — {ejerciciosDia.length} ejercicios
            </h3>

            {ejerciciosDia.map((ej, idx) => (
              <div
                key={idx}
                className="bg-card-bg border border-border rounded-lg p-2.5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ej.nombre}
                    onChange={(e) => actualizarEjercicio(idx, 'nombre', e.target.value)}
                    placeholder="Nombre del ejercicio"
                    className="flex-1 px-2 py-1 rounded border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => eliminarEjercicio(idx)}
                    className="text-danger text-xs px-1.5"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={ej.grupoMuscular}
                    onChange={(e) =>
                      actualizarEjercicio(idx, 'grupoMuscular', e.target.value as GrupoMuscular)
                    }
                    className="px-2 py-1 rounded border border-border text-[11px] bg-card-bg"
                  >
                    {GRUPOS_MUSCULARES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={ej.series}
                      onChange={(e) => actualizarEjercicio(idx, 'series', Number(e.target.value))}
                      className="w-10 px-1 py-1 rounded border border-border text-[11px] text-center"
                      min={1}
                    />
                    <span className="text-[10px] text-text-muted">×</span>
                    <input
                      type="number"
                      value={ej.repeticiones}
                      onChange={(e) => actualizarEjercicio(idx, 'repeticiones', Number(e.target.value))}
                      className="w-10 px-1 py-1 rounded border border-border text-[11px] text-center"
                      min={1}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={ej.peso ?? ''}
                      onChange={(e) =>
                        actualizarEjercicio(
                          idx,
                          'peso',
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                      placeholder="Peso"
                      className="w-14 px-1 py-1 rounded border border-border text-[11px] text-center"
                      min={0}
                      step={0.5}
                    />
                    <select
                      value={ej.unidad}
                      onChange={(e) => actualizarEjercicio(idx, 'unidad', e.target.value)}
                      className="px-1 py-1 rounded border border-border text-[10px] bg-card-bg"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={agregarEjercicio}
              className="w-full py-2 rounded-lg border-2 border-dashed border-border text-xs text-text-muted hover:border-primary hover:text-primary transition-colors"
            >
              + Agregar ejercicio al {NOMBRES_DIA[diaActivo].toLowerCase()}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted hover:bg-hover-bg"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!nombre.trim()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
              nombre.trim()
                ? 'bg-primary hover:bg-primary-dark'
                : 'bg-border cursor-not-allowed'
            }`}
          >
            Guardar plantilla
          </button>
        </div>
      </div>
    </div>
  );
}
