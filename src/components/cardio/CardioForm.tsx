'use client';

import { useState } from 'react';
import type { CardioIntensity, CardioType } from '@/lib/types';

interface Props {
  date: string;
  onGuardar: (payload: {
    date: string;
    type: CardioType;
    machine?: string;
    duration: number;
    distance: number;
    calories: number;
    intensity: CardioIntensity;
  }) => void;
  onCancelar: () => void;
}

export default function CardioForm({ date, onGuardar, onCancelar }: Props) {
  const [type, setType] = useState<CardioType>('caminar');
  const [machine, setMachine] = useState('');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('3');
  const [calories, setCalories] = useState('200');
  const [intensity, setIntensity] = useState<CardioIntensity>('media');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      date,
      type,
      machine: machine.trim() || undefined,
      duration: Number(duration),
      distance: Number(distance),
      calories: Number(calories),
      intensity,
    });
  };

  return (
    <form onSubmit={submit} className="bg-card-bg border border-border rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Agregar cardio</h3>
      <div className="grid grid-cols-2 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as CardioType)} className="px-3 py-2 rounded-lg border border-border bg-input-bg text-sm">
          <option value="caminar">Caminar</option>
          <option value="correr">Correr</option>
          <option value="bici">Bici</option>
          <option value="hiit">HIIT</option>
          <option value="remo">Remo</option>
          <option value="eliptica">Elíptica</option>
          <option value="otro">Otro</option>
        </select>
        <input value={machine} onChange={(e) => setMachine(e.target.value)} placeholder="Máquina (opcional)" className="px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] text-text-muted mb-1">Tiempo (min)</label>
          <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Min" className="w-full px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" required />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1">Distancia (km)</label>
          <input type="number" min="0" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Km" className="w-full px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" required />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1">Calorías (kcal)</label>
          <input type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Kcal" className="w-full px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" required />
        </div>
      </div>
      <div className="flex gap-2">
        {(['baja', 'media', 'alta'] as CardioIntensity[]).map((i) => (
          <button key={i} type="button" onClick={() => setIntensity(i)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${intensity === i ? 'bg-primary text-white' : 'bg-hover-bg text-text-muted'}`}>
            {i}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="flex-1 py-2 rounded-lg border border-border text-sm">Cancelar</button>
        <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Guardar cardio</button>
      </div>
    </form>
  );
}
