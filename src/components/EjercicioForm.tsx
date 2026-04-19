'use client';

import { useState, useEffect } from 'react';
import type { Ejercicio, GrupoMuscular } from '../lib/types';
import { GRUPOS_MUSCULARES } from '../lib/types';

interface EjercicioFormProps {
  ejercicio?: Ejercicio | null;
  onGuardar: (data: Omit<Ejercicio, 'id'> & { id?: string }) => void;
  onCancelar: () => void;
}

export default function EjercicioForm({
  ejercicio,
  onGuardar,
  onCancelar,
}: EjercicioFormProps) {
  const [nombre, setNombre] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState<GrupoMuscular>('Otro');
  const [series, setSeries] = useState('');
  const [repeticiones, setRepeticiones] = useState('');
  const [peso, setPeso] = useState('');
  const [unidad, setUnidad] = useState<'kg' | 'lbs'>('kg');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (ejercicio) {
      setNombre(ejercicio.nombre);
      setGrupoMuscular(ejercicio.grupoMuscular);
      setSeries(String(ejercicio.series));
      setRepeticiones(String(ejercicio.repeticiones));
      setPeso(ejercicio.peso ? String(ejercicio.peso) : '');
      setUnidad(ejercicio.unidad);
      setNotas(ejercicio.notas || '');
    }
  }, [ejercicio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !series || !repeticiones) return;

    onGuardar({
      ...(ejercicio?.id ? { id: ejercicio.id } : {}),
      nombre: nombre.trim(),
      grupoMuscular,
      series: parseInt(series, 10),
      repeticiones: parseInt(repeticiones, 10),
      peso: peso ? parseFloat(peso) : undefined,
      unidad,
      notas: notas.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card-bg rounded-xl shadow-sm border border-border p-5 space-y-4"
    >
      <h3 className="text-lg font-bold text-foreground">
        {ejercicio ? 'Editar ejercicio' : 'Agregar ejercicio'}
      </h3>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          Nombre del ejercicio
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Press banca"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          required
        />
      </div>

      {/* Grupo muscular */}
      <div>
        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          Grupo muscular
        </label>
        <select
          value={grupoMuscular}
          onChange={(e) => setGrupoMuscular(e.target.value as GrupoMuscular)}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          {GRUPOS_MUSCULARES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Series y Repeticiones */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Series
          </label>
          <input
            type="number"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            placeholder="5"
            min="1"
            max="99"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Repeticiones
          </label>
          <input
            type="number"
            value={repeticiones}
            onChange={(e) => setRepeticiones(e.target.value)}
            placeholder="10"
            min="1"
            max="999"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Peso y unidad */}
      <div>
        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          Peso (opcional)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="0"
            step="0.5"
            min="0"
            className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setUnidad('kg')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                unidad === 'kg'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted hover:bg-hover-bg'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnidad('lbs')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                unidad === 'lbs'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted hover:bg-hover-bg'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: Con ayuda, usar agarre cerrado..."
          rows={2}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-muted hover:bg-hover-bg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
