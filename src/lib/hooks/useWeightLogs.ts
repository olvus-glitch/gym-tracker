'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WeightLog } from '@/lib/types';

export function useWeightLogs() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch('/api/weight');
    const data = await res.json();
    setWeightLogs(data.logs || []);
    setCargado(true);
  }, []);

  useEffect(() => {
    cargar().catch(() => setCargado(true));
  }, [cargar]);

  const guardarPeso = useCallback(async (date: string, weight: number) => {
    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weight }),
    });
    const data = await res.json();
    setWeightLogs((prev) => {
      const filtered = prev.filter((w) => w.date !== data.log.date);
      return [...filtered, data.log].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  return { weightLogs, cargado, guardarPeso };
}
