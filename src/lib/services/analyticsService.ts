import type { CardioSession, SesionEntrenamiento, SleepLog } from '@/lib/types';

export function getWeeklyVolume(sesiones: SesionEntrenamiento[]): number {
  return Math.round(
    sesiones.reduce(
      (acc, s) =>
        acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
      0
    )
  );
}

export function getStrengthProgress(sesiones: SesionEntrenamiento[]): { avgLoad: number; prCount: number } {
  const lifts = sesiones.flatMap((s) => s.ejercicios.filter((e) => e.peso && e.peso > 0));
  const avgLoad = lifts.length ? lifts.reduce((a, e) => a + (e.peso || 0), 0) / lifts.length : 0;

  const byExercise = new Map<string, number>();
  let prCount = 0;
  for (const e of lifts) {
    const prev = byExercise.get(e.nombre) || 0;
    const current = e.peso || 0;
    if (current > prev) {
      if (prev > 0) prCount++;
      byExercise.set(e.nombre, current);
    }
  }

  return { avgLoad: Math.round(avgLoad * 10) / 10, prCount };
}

export function getCardioSummary(cardio: CardioSession[]): { minutes: number; calories: number; distance: number } {
  return {
    minutes: cardio.reduce((a, c) => a + c.duration, 0),
    calories: cardio.reduce((a, c) => a + c.calories, 0),
    distance: Math.round(cardio.reduce((a, c) => a + c.distance, 0) * 100) / 100,
  };
}

export function getSleepAverage(sleep: SleepLog[]): { hours: number; quality: number } {
  if (!sleep.length) return { hours: 0, quality: 0 };
  const hours = sleep.reduce((a, s) => a + s.hours, 0) / sleep.length;
  const quality = sleep.reduce((a, s) => a + s.quality, 0) / sleep.length;
  return {
    hours: Math.round(hours * 10) / 10,
    quality: Math.round(quality * 10) / 10,
  };
}

export function getAnalysisAlerts(
  current: { volume: number; strength: number; cardioCalories: number; weight: number | null },
  previous: { volume: number; strength: number; cardioCalories: number; weight: number | null }
): string[] {
  const alerts: string[] = [];

  if (current.volume > previous.volume * 1.08 && current.strength <= previous.strength * 1.02) {
    alerts.push('Subió el volumen pero no la fuerza. Revisa descanso y técnica.');
  }

  if (
    previous.weight !== null &&
    current.weight !== null &&
    current.cardioCalories > previous.cardioCalories &&
    current.weight < previous.weight
  ) {
    alerts.push('Aumentó tu cardio y bajó el peso corporal: correlación positiva.');
  }

  return alerts;
}
