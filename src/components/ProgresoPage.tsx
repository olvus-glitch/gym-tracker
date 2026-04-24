'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { useRegistrosPeso, useSesiones } from '../lib/store';
import {
  obtenerSemanaISO,
  obtenerAnioISO,
  obtenerDiasSemana,
  obtenerDiasMes,
  fechaAString,
  format,
  subDays,
} from '../lib/fechas';
import { useTheme } from '../lib/theme-context';
import { useCardio } from '@/lib/hooks/useCardio';
import { useSleep } from '@/lib/hooks/useSleep';
import { useWeightLogs } from '@/lib/hooks/useWeightLogs';
import {
  getAnalysisAlerts,
  getCardioSummary,
  getSleepAverage,
  getStrengthProgress,
  getWeeklyVolume,
} from '@/lib/services/analyticsService';
import WeeklyDashboardCards from '@/components/charts/WeeklyDashboardCards';
import VolumeStrengthChart from '@/components/charts/VolumeStrengthChart';
import CardioWeightChart from '@/components/charts/CardioWeightChart';
import SleepForm from '@/components/sleep/SleepForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card-bg border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function IndicadorProgreso({ actual, anterior, label, unidad }: { actual: number; anterior: number; label: string; unidad?: string }) {
  if (anterior === 0 && actual === 0) return null;
  const diff = actual - anterior;
  const pct = anterior > 0 ? Math.round((diff / anterior) * 100) : actual > 0 ? 100 : 0;
  const positivo = diff > 0;
  const neutro = diff === 0;

  return (
    <div className="flex items-center justify-between bg-card-bg rounded-lg border border-border p-3">
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-bold text-foreground">
          {actual}{unidad ? ` ${unidad}` : ''}
        </p>
      </div>
      <div className={`text-right ${neutro ? 'text-text-muted' : positivo ? 'text-success' : 'text-danger'}`}>
        <span className="text-xl">{neutro ? '=' : positivo ? '+' : '-'}</span>
        <p className="text-xs font-semibold">
          {neutro ? 'Sin cambio' : `${positivo ? '+' : ''}${pct}%`}
        </p>
      </div>
    </div>
  );
}

export default function ProgresoPage() {
  const [vista, setVista] = useState<'semanal' | 'mensual'>('semanal');
  const [pesoInput, setPesoInput] = useState('');
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lbs'>('kg');
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string | null>(null);
  const { theme } = useTheme();

  const { registros, cargado: cargadoPeso, agregarRegistro } = useRegistrosPeso();
  const { sesiones, cargado: cargadoSesiones } = useSesiones();
  const { cardio, cargado: cargadoCardio } = useCardio();
  const { sleepLogs, cargado: cargadoSueno, guardarSueno } = useSleep();
  const { weightLogs, cargado: cargadoWeight } = useWeightLogs();

  const hoy = new Date();
  const semanaActual = obtenerSemanaISO(hoy);
  const anioActual = obtenerAnioISO(hoy);
  const mesActual = hoy.getMonth();

  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const primaryColor = theme === 'dark' ? '#818cf8' : '#6c5ce7';
  const secondaryColor = theme === 'dark' ? '#c084fc' : '#a855f7';

  const semanaCardio = useMemo(
    () => cardio.filter((c) => {
      const d = new Date(c.date);
      return obtenerSemanaISO(d) === semanaActual && obtenerAnioISO(d) === anioActual;
    }),
    [cardio, semanaActual, anioActual]
  );

  const semanaSueno = useMemo(
    () => sleepLogs.filter((s) => {
      const d = new Date(s.date);
      return obtenerSemanaISO(d) === semanaActual && obtenerAnioISO(d) === anioActual;
    }),
    [sleepLogs, semanaActual, anioActual]
  );

  const semanaSesiones = useMemo(
    () => sesiones.filter((s) => s.semanaISO === semanaActual && s.anioISO === anioActual),
    [sesiones, semanaActual, anioActual]
  );

  const semanaAnteriorSesiones = useMemo(() => {
    const semanaAnterior = semanaActual - 1 > 0 ? semanaActual - 1 : 52;
    const anioAnterior = semanaActual - 1 > 0 ? anioActual : anioActual - 1;
    return sesiones.filter((s) => s.semanaISO === semanaAnterior && s.anioISO === anioAnterior);
  }, [sesiones, semanaActual, anioActual]);

  const semanaAnteriorCardio = useMemo(() => {
    const semanaAnterior = semanaActual - 1 > 0 ? semanaActual - 1 : 52;
    const anioAnterior = semanaActual - 1 > 0 ? anioActual : anioActual - 1;
    return cardio.filter((c) => {
      const d = new Date(c.date);
      return obtenerSemanaISO(d) === semanaAnterior && obtenerAnioISO(d) === anioAnterior;
    });
  }, [cardio, semanaActual, anioActual]);

  const weeklyDashboard = useMemo(() => {
    const volume = getWeeklyVolume(semanaSesiones);
    const cardioSummary = getCardioSummary(semanaCardio);
    const sleepAvg = getSleepAverage(semanaSueno);
    const currentWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : undefined;
    return { volume, cardioSummary, sleepAvg, currentWeight };
  }, [semanaSesiones, semanaCardio, semanaSueno, weightLogs]);

  const analysisAlerts = useMemo(() => {
    const currentStrength = getStrengthProgress(semanaSesiones).avgLoad;
    const previousStrength = getStrengthProgress(semanaAnteriorSesiones).avgLoad;
    const prevWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : null;
    const currWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;
    return getAnalysisAlerts(
      {
        volume: getWeeklyVolume(semanaSesiones),
        strength: currentStrength,
        cardioCalories: getCardioSummary(semanaCardio).calories,
        weight: currWeight,
      },
      {
        volume: getWeeklyVolume(semanaAnteriorSesiones),
        strength: previousStrength,
        cardioCalories: getCardioSummary(semanaAnteriorCardio).calories,
        weight: prevWeight,
      }
    );
  }, [semanaSesiones, semanaAnteriorSesiones, semanaCardio, semanaAnteriorCardio, weightLogs]);

  const volumenFuerzaData = useMemo(() => {
    const map = new Map<string, { week: string; volume: number; avgStrength: number }>();
    for (const s of sesiones) {
      const key = `${s.anioISO}-S${s.semanaISO}`;
      const prev = map.get(key) || { week: key, volume: 0, avgStrength: 0 };
      const vol = s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0);
      const pesos = s.ejercicios.filter((e) => e.peso && e.peso > 0).map((e) => e.peso as number);
      const avg = pesos.length ? pesos.reduce((a, b) => a + b, 0) / pesos.length : 0;
      map.set(key, {
        week: key,
        volume: prev.volume + Math.round(vol),
        avgStrength: Math.round(((prev.avgStrength + avg) / 2) * 10) / 10,
      });
    }
    return Array.from(map.values()).slice(-8);
  }, [sesiones]);

  const cardioPesoData = useMemo(() => {
    const cardioByDate = new Map<string, number>();
    for (const c of cardio) {
      cardioByDate.set(c.date, (cardioByDate.get(c.date) || 0) + c.calories);
    }
    return weightLogs.map((w) => ({
      date: w.date.slice(5),
      weight: w.weight,
      cardioCalories: cardioByDate.get(w.date) || 0,
    }));
  }, [weightLogs, cardio]);

  // Peso semanal
  const datosPesoSemanal = useMemo(() => {
    const dias = obtenerDiasSemana(hoy);
    return dias.map((d) => {
      const str = fechaAString(d);
      const reg = registros.find((r) => r.fecha === str);
      return {
        dia: format(d, 'EEE'),
        fecha: str,
        peso: reg ? reg.peso : null,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros]);

  // Peso mensual
  const datosPesoMensual = useMemo(() => {
    const dias = obtenerDiasMes(hoy);
    const porSemana: Record<number, number[]> = {};
    for (const d of dias) {
      const sem = obtenerSemanaISO(d);
      const str = fechaAString(d);
      const reg = registros.find((r) => r.fecha === str);
      if (reg) {
        if (!porSemana[sem]) porSemana[sem] = [];
        porSemana[sem].push(reg.peso);
      }
    }
    return Object.entries(porSemana).map(([sem, pesos]) => ({
      semana: `Sem ${sem}`,
      promedio: Math.round((pesos.reduce((a, b) => a + b, 0) / pesos.length) * 10) / 10,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros]);

  // Resumen semanal
  const resumenSemanal = useMemo(() => {
    const sessSemana = sesiones.filter(
      (s) => s.semanaISO === semanaActual && s.anioISO === anioActual
    );
    const diasCompletados = sessSemana.filter((s) => s.completada).length;
    const totalEjercicios = sessSemana.reduce((acc, s) => acc + s.ejercicios.length, 0);
    const totalSeries = sessSemana.reduce(
      (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series, 0),
      0
    );
    const volumenTotal = sessSemana.reduce(
      (acc, s) =>
        acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
      0
    );
    return { dias: diasCompletados, ejercicios: totalEjercicios, series: totalSeries, volumen: Math.round(volumenTotal) };
  }, [sesiones, semanaActual, anioActual]);

  // Resumen semana anterior (para comparacion)
  const resumenSemanaAnterior = useMemo(() => {
    const semanaAnterior = semanaActual - 1 > 0 ? semanaActual - 1 : 52;
    const anioAnterior = semanaActual - 1 > 0 ? anioActual : anioActual - 1;
    const sessSemana = sesiones.filter(
      (s) => s.semanaISO === semanaAnterior && s.anioISO === anioAnterior
    );
    const diasCompletados = sessSemana.filter((s) => s.completada).length;
    const totalEjercicios = sessSemana.reduce((acc, s) => acc + s.ejercicios.length, 0);
    const totalSeries = sessSemana.reduce(
      (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series, 0),
      0
    );
    const volumenTotal = sessSemana.reduce(
      (acc, s) =>
        acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
      0
    );
    return { dias: diasCompletados, ejercicios: totalEjercicios, series: totalSeries, volumen: Math.round(volumenTotal) };
  }, [sesiones, semanaActual, anioActual]);

  // Resumen mensual
  const resumenMensual = useMemo(() => {
    const sessMes = sesiones.filter((s) => {
      const f = new Date(s.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === hoy.getFullYear();
    });
    const totalEjercicios = sessMes.reduce((acc, s) => acc + s.ejercicios.length, 0);
    const totalSeries = sessMes.reduce(
      (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series, 0),
      0
    );
    const volumenTotal = sessMes.reduce(
      (acc, s) =>
        acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
      0
    );
    const porSemana: Record<number, { ejercicios: number; volumen: number }> = {};
    for (const s of sessMes) {
      if (!porSemana[s.semanaISO]) porSemana[s.semanaISO] = { ejercicios: 0, volumen: 0 };
      porSemana[s.semanaISO].ejercicios += s.ejercicios.length;
      porSemana[s.semanaISO].volumen += s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0);
    }
    const barras = Object.entries(porSemana).map(([sem, data]) => ({
      semana: `Sem ${sem}`,
      ejercicios: data.ejercicios,
      volumen: Math.round(data.volumen),
    }));
    const diasCompletados = sessMes.filter((s) => s.completada).length;
    return { dias: diasCompletados, ejercicios: totalEjercicios, series: totalSeries, volumen: Math.round(volumenTotal), barras };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesiones, mesActual]);

  // Resumen mes anterior
  const resumenMesAnterior = useMemo(() => {
    const mesAnt = mesActual - 1 >= 0 ? mesActual - 1 : 11;
    const anioAnt = mesActual - 1 >= 0 ? hoy.getFullYear() : hoy.getFullYear() - 1;
    const sessMes = sesiones.filter((s) => {
      const f = new Date(s.fecha);
      return f.getMonth() === mesAnt && f.getFullYear() === anioAnt;
    });
    const totalEjercicios = sessMes.reduce((acc, s) => acc + s.ejercicios.length, 0);
    const totalSeries = sessMes.reduce(
      (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series, 0),
      0
    );
    const volumenTotal = sessMes.reduce(
      (acc, s) =>
        acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
      0
    );
    return { dias: sessMes.filter((s) => s.completada).length, ejercicios: totalEjercicios, series: totalSeries, volumen: Math.round(volumenTotal) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesiones, mesActual]);

  // Progresion de ejercicios (peso maximo por ejercicio por semana)
  const progresionEjercicios = useMemo(() => {
    const ejercicioMap: Record<string, Record<string, number>> = {};
    for (const s of sesiones) {
      const semKey = `S${s.semanaISO}`;
      for (const e of s.ejercicios) {
        if (!e.peso) continue;
        if (!ejercicioMap[e.nombre]) ejercicioMap[e.nombre] = {};
        if (!ejercicioMap[e.nombre][semKey] || e.peso > ejercicioMap[e.nombre][semKey]) {
          ejercicioMap[e.nombre][semKey] = e.peso;
        }
      }
    }

    return Object.entries(ejercicioMap)
      .filter(([, semanas]) => Object.keys(semanas).length >= 1)
      .map(([nombre, semanas]) => {
        const entries = Object.entries(semanas).sort((a, b) => {
          const numA = parseInt(a[0].slice(1));
          const numB = parseInt(b[0].slice(1));
          return numA - numB;
        });
        const datos = entries.map(([sem, peso]) => ({ semana: sem, peso }));
        const ultimo = datos[datos.length - 1]?.peso || 0;
        const penultimo = datos.length >= 2 ? datos[datos.length - 2].peso : ultimo;
        const tendencia = ultimo > penultimo ? 'up' : ultimo < penultimo ? 'down' : 'same';
        return { nombre, datos, tendencia, ultimo, penultimo };
      });
  }, [sesiones]);

  // Volumen semanal historico (ultimas 8 semanas)
  const volumenSemanalHistorico = useMemo(() => {
    const semanas: { semana: string; volumen: number; series: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = subDays(hoy, i * 7);
      const sem = obtenerSemanaISO(d);
      const anio = obtenerAnioISO(d);
      const key = `S${sem}`;
      if (semanas.some((s) => s.semana === key)) continue;
      const sessSem = sesiones.filter((s) => s.semanaISO === sem && s.anioISO === anio);
      const vol = sessSem.reduce(
        (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series * e.repeticiones * (e.peso || 0), 0),
        0
      );
      const series = sessSem.reduce(
        (acc, s) => acc + s.ejercicios.reduce((a, e) => a + e.series, 0),
        0
      );
      semanas.push({ semana: key, volumen: Math.round(vol), series });
    }
    return semanas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesiones]);

  // Records personales (PR por ejercicio)
  const recordsPersonales = useMemo(() => {
    const prs: Record<string, { peso: number; unidad: string; fecha: string; series: number; reps: number }> = {};
    for (const s of sesiones) {
      for (const e of s.ejercicios) {
        if (!e.peso) continue;
        const pesoKg = e.unidad === 'lbs' ? e.peso * 0.4536 : e.peso;
        const existing = prs[e.nombre];
        const existingKg = existing ? (existing.unidad === 'lbs' ? existing.peso * 0.4536 : existing.peso) : 0;
        if (!existing || pesoKg > existingKg) {
          prs[e.nombre] = { peso: e.peso, unidad: e.unidad, fecha: s.fecha, series: e.series, reps: e.repeticiones };
        }
      }
    }
    return prs;
  }, [sesiones]);

  // Historial de un ejercicio seleccionado
  const historialEjercicio = useMemo(() => {
    if (!ejercicioSeleccionado) return [];
    const registros: { fecha: string; peso: number; unidad: string; series: number; reps: number; volumen: number }[] = [];
    for (const s of sesiones) {
      for (const e of s.ejercicios) {
        if (e.nombre === ejercicioSeleccionado) {
          registros.push({
            fecha: s.fecha,
            peso: e.peso || 0,
            unidad: e.unidad,
            series: e.series,
            reps: e.repeticiones,
            volumen: (e.peso || 0) * e.series * e.repeticiones,
          });
        }
      }
    }
    return registros.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesiones, ejercicioSeleccionado]);

  // Lista unica de ejercicios para seleccionar
  const listaEjercicios = useMemo(() => {
    const nombres = new Set<string>();
    for (const s of sesiones) {
      for (const e of s.ejercicios) {
        nombres.add(e.nombre);
      }
    }
    return Array.from(nombres).sort();
  }, [sesiones]);

  const handleRegistrarPeso = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(pesoInput);
    if (isNaN(valor) || valor <= 0) return;
    agregarRegistro(valor, unidadPeso);
    setPesoInput('');
  };

  if (!cargadoPeso || !cargadoSesiones || !cargadoCardio || !cargadoSueno || !cargadoWeight) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const anterior = vista === 'semanal' ? resumenSemanaAnterior : resumenMesAnterior;
  const actual = vista === 'semanal' ? resumenSemanal : resumenMensual;

  return (
    <div className="space-y-4 mt-4">
      <WeeklyDashboardCards
        volumen={weeklyDashboard.volume}
        cardioMin={weeklyDashboard.cardioSummary.minutes}
        suenoProm={weeklyDashboard.sleepAvg.hours}
        pesoActual={weeklyDashboard.currentWeight}
      />

      <SleepForm
        date={fechaAString(hoy)}
        onGuardar={(data) => {
          guardarSueno(data);
        }}
      />

      {analysisAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Alertas de analitica</p>
          {analysisAlerts.map((a) => (
            <p key={a} className="text-sm text-foreground">⚠ {a}</p>
          ))}
        </div>
      )}

      {volumenFuerzaData.length > 0 && <VolumeStrengthChart data={volumenFuerzaData} />}
      {cardioPesoData.length > 0 && <CardioWeightChart data={cardioPesoData} />}

      {/* Selector semanal/mensual */}
      <div className="flex rounded-xl overflow-hidden border border-border">
        <button
          onClick={() => setVista('semanal')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            vista === 'semanal'
              ? 'bg-primary text-white'
              : 'bg-card-bg text-text-muted hover:bg-hover-bg'
          }`}
        >
          Semanal
        </button>
        <button
          onClick={() => setVista('mensual')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            vista === 'mensual'
              ? 'bg-primary text-white'
              : 'bg-card-bg text-text-muted hover:bg-hover-bg'
          }`}
        >
          Mensual
        </button>
      </div>

      {/* Registrar peso */}
      <form
        onSubmit={handleRegistrarPeso}
        className="bg-card-bg rounded-xl shadow-sm border border-border p-4"
      >
        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          Registrar peso de hoy
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={pesoInput}
            onChange={(e) => setPesoInput(e.target.value)}
            placeholder="Ej: 75"
            step="0.1"
            min="0"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setUnidadPeso('kg')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                unidadPeso === 'kg'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnidadPeso('lbs')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                unidadPeso === 'lbs'
                  ? 'bg-primary text-white'
                  : 'bg-card-bg text-text-muted'
              }`}
            >
              lbs
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>

      {/* Grafico de peso */}
      <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">
          Peso corporal - {vista === 'semanal' ? `Semana ${semanaActual}, ${anioActual}` : format(hoy, 'MMMM yyyy')}
        </h3>
        {vista === 'semanal' ? (
          datosPesoSemanal.some((d) => d.peso !== null) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={datosPesoSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: tickColor }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: tickColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="peso" stroke={primaryColor} strokeWidth={2} dot={{ fill: primaryColor, r: 4 }} connectNulls name="Peso" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted text-center py-8">Registra tu peso para ver el grafico</p>
          )
        ) : datosPesoMensual.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={datosPesoMensual}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: tickColor }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: tickColor }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="promedio" stroke={secondaryColor} fill="url(#colorPeso)" strokeWidth={2} name="Promedio" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">Registra peso durante el mes para ver la tendencia</p>
        )}
      </div>

      {/* Indicadores de progresion */}
      <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">
          {vista === 'semanal' ? 'Progresion vs semana anterior' : 'Progresion vs mes anterior'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <IndicadorProgreso
            actual={actual.dias}
            anterior={anterior.dias}
            label="Dias entrenados"
          />
          <IndicadorProgreso
            actual={actual.ejercicios}
            anterior={anterior.ejercicios}
            label="Ejercicios totales"
          />
          <IndicadorProgreso
            actual={actual.series}
            anterior={anterior.series}
            label="Series totales"
          />
          <IndicadorProgreso
            actual={actual.volumen}
            anterior={anterior.volumen}
            label="Volumen total"
            unidad="kg"
          />
        </div>
      </div>

      {/* Volumen historico */}
      {volumenSemanalHistorico.some((s) => s.volumen > 0) && (
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">
            Volumen semanal - Ultimas 8 semanas ({anioActual})
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumenSemanalHistorico}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="volumen" stroke={primaryColor} fill="url(#colorVol)" strokeWidth={2} name="Volumen (kg)" />
              <ReferenceLine y={0} stroke={gridColor} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Resumen de entrenamiento */}
      <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">
          Resumen - {vista === 'semanal' ? `Semana ${semanaActual}, ${anioActual}` : format(hoy, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-2xl font-bold text-primary">{actual.dias}</p>
            <p className="text-xs text-text-muted mt-1">Dias</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-2xl font-bold text-primary">{actual.ejercicios}</p>
            <p className="text-xs text-text-muted mt-1">Ejercicios</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-2xl font-bold text-primary">{actual.series}</p>
            <p className="text-xs text-text-muted mt-1">Series</p>
          </div>
        </div>

        {vista === 'mensual' && resumenMensual.barras.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={resumenMensual.barras}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="semana" tick={{ fontSize: 12, fill: tickColor }} />
                <YAxis tick={{ fontSize: 12, fill: tickColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ejercicios" fill={primaryColor} radius={[4, 4, 0, 0]} name="Ejercicios" />
                <Bar dataKey="volumen" fill={secondaryColor} radius={[4, 4, 0, 0]} name="Volumen (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Progresion por ejercicio */}
      {progresionEjercicios.length > 0 && (
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">
            Progresion por ejercicio
          </h3>
          <div className="space-y-3">
            {progresionEjercicios.map((ej) => (
              <div key={ej.nombre} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{ej.nombre}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ej.tendencia === 'up'
                      ? 'bg-success/15 text-success'
                      : ej.tendencia === 'down'
                      ? 'bg-danger/15 text-danger'
                      : 'bg-border text-text-muted'
                  }`}>
                    {ej.tendencia === 'up' ? 'Subiendo' : ej.tendencia === 'down' ? 'Bajando' : 'Estable'}
                  </span>
                </div>
                {ej.datos.length > 1 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={ej.datos}>
                      <XAxis dataKey="semana" tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke={ej.tendencia === 'up' ? (theme === 'dark' ? '#4ade80' : '#27ae60') : ej.tendencia === 'down' ? (theme === 'dark' ? '#f87171' : '#e74c3c') : primaryColor}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Peso max."
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-text-muted">
                    Peso actual: <span className="font-bold text-foreground">{ej.ultimo} kg</span> - Necesitas mas semanas para ver la tendencia
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Personales */}
      {Object.keys(recordsPersonales).length > 0 && (
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Records Personales (PRs)
          </h3>
          <div className="space-y-2">
            {Object.entries(recordsPersonales)
              .sort((a, b) => b[1].peso - a[1].peso)
              .map(([nombre, pr]) => (
                <button
                  key={nombre}
                  onClick={() => setEjercicioSeleccionado(ejercicioSeleccionado === nombre ? null : nombre)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    ejercicioSeleccionado === nombre
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{nombre}</p>
                    <p className="text-[11px] text-text-muted">{pr.series}x{pr.reps} &middot; {pr.fecha}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-lg font-black text-accent">{pr.peso}</span>
                    <span className="text-xs text-text-muted">{pr.unidad}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Historial de ejercicio seleccionado */}
      {ejercicioSeleccionado && historialEjercicio.length > 0 && (
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">
              Historial: {ejercicioSeleccionado}
            </h3>
            <button
              onClick={() => setEjercicioSeleccionado(null)}
              className="text-xs text-text-muted hover:text-foreground px-2 py-1"
            >
              Cerrar
            </button>
          </div>

          {/* Grafico de peso del ejercicio */}
          {historialEjercicio.length > 1 && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={[...historialEjercicio].reverse()}>
                  <defs>
                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: tickColor }} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10, fill: tickColor }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="peso" stroke={primaryColor} fill="url(#colorHist)" strokeWidth={2} name="Peso" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Lista de registros */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {historialEjercicio.map((reg, i) => {
              const esPR = recordsPersonales[ejercicioSeleccionado]?.fecha === reg.fecha
                && recordsPersonales[ejercicioSeleccionado]?.peso === reg.peso;
              return (
                <div key={`${reg.fecha}-${i}`} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                  esPR ? 'bg-accent/10 border border-accent/30' : 'bg-hover-bg'
                }`}>
                  <div className="flex items-center gap-2">
                    {esPR && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-accent shrink-0">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                    <span className="text-text-muted">{reg.fecha}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted text-xs">{reg.series}x{reg.reps}</span>
                    <span className={`font-bold ${esPR ? 'text-accent' : 'text-foreground'}`}>
                      {reg.peso} {reg.unidad}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selector de ejercicio para ver historial */}
      {listaEjercicios.length > 0 && !ejercicioSeleccionado && (
        <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">
            Ver historial de ejercicio
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {listaEjercicios.map((nombre) => (
              <button
                key={nombre}
                onClick={() => setEjercicioSeleccionado(nombre)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-muted hover:border-primary hover:text-primary transition-colors"
              >
                {nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
