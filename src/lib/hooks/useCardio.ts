'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CardioSession } from '@/lib/types';

export function useCardio() {
  const [cardio, setCardio] = useState<CardioSession[]>([]);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch('/api/cardio');
    const data = await res.json();
    setCardio(data.sessions || []);
    setCargado(true);
  }, []);

  useEffect(() => {
    cargar().catch(() => setCargado(true));
  }, [cargar]);

  const agregarCardio = useCallback(async (input: Omit<CardioSession, 'id'>) => {
    const payload = { ...input, id: uuidv4() };
    const res = await fetch('/api/cardio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setCardio((prev) => [data.session, ...prev]);
  }, []);

  const eliminarCardio = useCallback(async (id: string) => {
    await fetch('/api/cardio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCardio((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { cardio, cargado, agregarCardio, eliminarCardio };
}
