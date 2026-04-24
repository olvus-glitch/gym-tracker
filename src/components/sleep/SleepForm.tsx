'use client';

import { useState } from 'react';

interface Props {
  date: string;
  onGuardar: (data: { date: string; hours: number; quality: 1 | 2 | 3 | 4 | 5; notes?: string }) => void;
}

export default function SleepForm({ date, onGuardar }: Props) {
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Registro de sueno</h3>
      <div>
        <label className="text-xs text-text-muted">Horas</label>
        <input type="number" min="0" max="14" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" />
      </div>
      <div>
        <label className="text-xs text-text-muted">Calidad: {quality}/5</label>
        <input type="range" min="1" max="5" value={quality} onChange={(e) => setQuality(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} className="w-full" />
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas de sueno (opcional)" rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-input-bg text-sm" />
      <button
        onClick={() => onGuardar({ date, hours: Number(hours), quality, notes: notes.trim() || undefined })}
        className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold"
      >
        Guardar sueno
      </button>
    </div>
  );
}
