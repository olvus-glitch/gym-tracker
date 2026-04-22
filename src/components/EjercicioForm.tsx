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
  const [maquinaCardio, setMaquinaCardio] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [calorias, setCalorias] = useState('');
  const [tiempoMin, setTiempoMin] = useState('');
  const [error, setError] = useState('');

  const esCardio = grupoMuscular === 'Cardio';

  useEffect(() => {
    if (ejercicio) {
      setNombre(ejercicio.nombre);
      setGrupoMuscular(ejercicio.grupoMuscular);
      setSeries(String(ejercicio.series));
      setRepeticiones(String(ejercicio.repeticiones));
      setPeso(ejercicio.peso ? String(ejercicio.peso) : '');
      setUnidad(ejercicio.unidad);
      setNotas(ejercicio.notas || '');
      setMaquinaCardio(ejercicio.maquinaCardio || '');
      setDistanciaKm(ejercicio.distanciaKm ? String(ejercicio.distanciaKm) : '');
      setCalorias(ejercicio.calorias ? String(ejercicio.calorias) : '');
      setTiempoMin(ejercicio.tiempoMin ? String(ejercicio.tiempoMin) : '');
    } else {
      setNombre('');
      setGrupoMuscular('Otro');
      setSeries('');
      setRepeticiones('');
      setPeso('');
      setUnidad('kg');
      setNotas('');
      setMaquinaCardio('');
      setDistanciaKm('');
      setCalorias('');
      setTiempoMin('');
    }
  }, [ejercicio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del ejercicio es obligatorio.');
      return;
    }

    if (!esCardio && (!series || !repeticiones)) {
      setError('Series y repeticiones son obligatorias.');
      return;
    }

    if (!esCardio && !peso) {
      setError('El peso es obligatorio para ejercicios de fuerza.');
      return;
    }

    if (esCardio && (!maquinaCardio.trim() || !distanciaKm || !calorias || !tiempoMin)) {
      setError('Para cardio debes completar maquina, distancia, calorias y tiempo.');
      return;
    }

    onGuardar({
      ...(ejercicio?.id ? { id: ejercicio.id } : {}),
      nombre: nombre.trim(),
      grupoMuscular,
      series: esCardio ? 1 : parseInt(series, 10),
      repeticiones: esCardio ? 1 : parseInt(repeticiones, 10),
      peso: esCardio ? undefined : parseFloat(peso),
      unidad,
      notas: notas.trim() || undefined,
      realizado: ejercicio?.realizado ?? false,
      maquinaCardio: esCardio ? maquinaCardio.trim() : undefined,
      distanciaKm: esCardio ? parseFloat(distanciaKm) : undefined,
      calorias: esCardio ? parseFloat(calorias) : undefined,
      tiempoMin: esCardio ? parseFloat(tiempoMin) : undefined,
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
      <p className="text-xs text-text-muted">
        Tip: para fuerza el peso es obligatorio. Si eliges Cardio, se habilita el formulario especifico.
      </p>

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

      {!esCardio && (
        <>
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
              Peso (obligatorio)
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
                required
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
        </>
      )}

      {esCardio && (
        <div className="space-y-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
          <p className="text-xs font-semibold text-cyan-600">Datos de cardio</p>
          <input
            type="text"
            value={maquinaCardio}
            onChange={(e) => setMaquinaCardio(e.target.value)}
            placeholder="Tipo de maquina (ej: Caminadora)"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={distanciaKm}
              onChange={(e) => setDistanciaKm(e.target.value)}
              placeholder="Distancia (km)"
              min="0"
              step="0.01"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              required
            />
            <input
              type="number"
              value={calorias}
              onChange={(e) => setCalorias(e.target.value)}
              placeholder="Calorias"
              min="0"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              required
            />
          </div>
          <input
            type="number"
            value={tiempoMin}
            onChange={(e) => setTiempoMin(e.target.value)}
            placeholder="Tiempo (minutos)"
            min="1"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            required
          />
        </div>
      )}

      {error && (
        <div className="text-xs rounded-lg border border-danger/40 bg-danger/10 text-danger px-3 py-2">
          {error}
        </div>
      )}

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
