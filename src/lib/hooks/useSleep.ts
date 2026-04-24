'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SleepLog } from '@/lib/types';

export function useSleep() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch('/api/sueno');
    const data = await res.json();
    setSleepLogs(data.logs || []);
    setCargado(true);
  }, []);

  useEffect(() => {
    cargar().catch(() => setCargado(true));
  }, [cargar]);

  const guardarSueno = useCallback(async (log: Omit<SleepLog, 'id'>) => {
    const res = await fetch('/api/sueno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    const data = await res.json();
    setSleepLogs((prev) => {
      const filtered = prev.filter((s) => s.date !== data.log.date);
      return [data.log, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, []);

  return { sleepLogs, cargado, guardarSueno };
}
