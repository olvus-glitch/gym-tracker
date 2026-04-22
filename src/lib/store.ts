'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Ejercicio,
  EjercicioPlantilla,
  SesionEntrenamiento,
  RegistroPeso,
  RutinaCompartida,
  Plantilla,
  DiaSemana,
} from './types';
import {
  fechaAString,
  obtenerDiaDelAnio,
  obtenerSemanaISO,
  obtenerAnioISO,
  obtenerDiasSemana,
} from './fechas';

// ─── Plantillas predefinidas (Splits) ───────────────────────────

const PECHO_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Press banca', grupoMuscular: 'Pecho', series: 5, repeticiones: 7, peso: 60, unidad: 'kg' },
  { nombre: 'Press inclinado máquina', grupoMuscular: 'Pecho', series: 5, repeticiones: 7, peso: 50, unidad: 'kg' },
  { nombre: 'Empuje de pectoral', grupoMuscular: 'Pecho', series: 3, repeticiones: 6, peso: 80, unidad: 'kg' },
  { nombre: 'Fondos', grupoMuscular: 'Pecho', series: 5, repeticiones: 7, unidad: 'kg', notas: 'Con ayuda 54kg' },
];

const HOMBROS_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Militar', grupoMuscular: 'Hombros', series: 5, repeticiones: 9, peso: 10, unidad: 'kg' },
  { nombre: 'Elevaciones laterales', grupoMuscular: 'Hombros', series: 5, repeticiones: 9, peso: 7.5, unidad: 'kg' },
  { nombre: 'Hombro posterior', grupoMuscular: 'Hombros', series: 3, repeticiones: 8, peso: 80, unidad: 'kg' },
];

const TRICEPS_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Rompe cráneos', grupoMuscular: 'Tríceps', series: 5, repeticiones: 8, unidad: 'kg', notas: 'Solo barra' },
  { nombre: 'Extensión de polea', grupoMuscular: 'Tríceps', series: 5, repeticiones: 8, peso: 40, unidad: 'lbs', notas: '40-50lbs' },
];

const PIERNA_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Prensa', grupoMuscular: 'Pierna', series: 5, repeticiones: 6, peso: 110, unidad: 'kg' },
  { nombre: 'Extensión cuádriceps', grupoMuscular: 'Pierna', series: 5, repeticiones: 10, peso: 130, unidad: 'lbs' },
  { nombre: 'Extensión femoral', grupoMuscular: 'Pierna', series: 5, repeticiones: 7, peso: 85, unidad: 'lbs' },
  { nombre: 'Apertura de glúteos', grupoMuscular: 'Pierna', series: 5, repeticiones: 15, peso: 115, unidad: 'lbs' },
  { nombre: 'Abductores', grupoMuscular: 'Pierna', series: 5, repeticiones: 12, peso: 90, unidad: 'lbs' },
];

const ABDOMEN_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Rodillo', grupoMuscular: 'Abdomen', series: 5, repeticiones: 8, unidad: 'kg' },
];

const BICEPS_EJERCICIOS: EjercicioPlantilla[] = [
  { nombre: 'Predicador', grupoMuscular: 'Bíceps', series: 5, repeticiones: 10, peso: 20, unidad: 'kg' },
  { nombre: 'Martillo', grupoMuscular: 'Bíceps', series: 5, repeticiones: 7, peso: 10, unidad: 'kg', notas: '10-8kg' },
];

const ESPALDA_AMPLITUD: EjercicioPlantilla[] = [
  { nombre: 'Jalón al pecho', grupoMuscular: 'Espalda', series: 5, repeticiones: 8, peso: 38, unidad: 'kg', notas: 'Amplitud' },
  { nombre: 'Pull over (polea)', grupoMuscular: 'Espalda', series: 5, repeticiones: 10, peso: 90, unidad: 'lbs', notas: 'Amplitud' },
  { nombre: 'Jalón en polea (máquina)', grupoMuscular: 'Espalda', series: 5, repeticiones: 10, peso: 96, unidad: 'lbs', notas: 'Amplitud · 96lbs/41kg' },
];

const ESPALDA_DENSIDAD: EjercicioPlantilla[] = [
  { nombre: 'Máquina agarre (rojo)', grupoMuscular: 'Espalda', series: 5, repeticiones: 8, peso: 80, unidad: 'kg', notas: 'Densidad' },
  { nombre: 'Remo en máquina', grupoMuscular: 'Espalda', series: 5, repeticiones: 8, peso: 40, unidad: 'kg', notas: 'Densidad' },
  { nombre: 'Remo con mancuerna', grupoMuscular: 'Espalda', series: 4, repeticiones: 10, peso: 20, unidad: 'kg', notas: 'Densidad' },
];

const ESPALDA_COMPLETA: EjercicioPlantilla[] = [
  { nombre: 'Jalón al pecho', grupoMuscular: 'Espalda', series: 5, repeticiones: 8, peso: 38, unidad: 'kg' },
  { nombre: 'Máquina agarre (rojo)', grupoMuscular: 'Espalda', series: 5, repeticiones: 8, peso: 80, unidad: 'kg' },
  { nombre: 'Pull over (polea)', grupoMuscular: 'Espalda', series: 5, repeticiones: 10, peso: 90, unidad: 'lbs' },
  { nombre: 'Jalón en polea (máquina)', grupoMuscular: 'Espalda', series: 5, repeticiones: 10, peso: 96, unidad: 'lbs', notas: '96lbs/41kg' },
];

export function crearPlantillasPredefinidas(): Plantilla[] {
  return [
    {
      id: 'split-pecho',
      nombre: 'Split 1 — Pecho (2x semana)',
      descripcion: 'Pecho lunes y jueves · Pierna martes y viernes · Espalda miércoles',
      esPredefinida: true,
      dias: {
        1: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS],
        2: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS],
        3: [...ESPALDA_COMPLETA, ...BICEPS_EJERCICIOS],
        4: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS],
        5: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS],
      },
    },
    {
      id: 'split-espalda',
      nombre: 'Split 2 — Espalda (Amplitud + Densidad)',
      descripcion: 'Espalda amplitud lunes · Espalda densidad jueves · Pecho miércoles',
      esPredefinida: true,
      dias: {
        1: [...ESPALDA_AMPLITUD, ...BICEPS_EJERCICIOS],
        2: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS],
        3: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS],
        4: [...ESPALDA_DENSIDAD, ...BICEPS_EJERCICIOS],
        5: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS],
      },
    },
    {
      id: 'split-pecho-vacio',
      nombre: 'Split 1 — Pecho (sin pesos)',
      descripcion: 'Mismo split de Pecho pero sin pesos pre-cargados',
      esPredefinida: true,
      dias: {
        1: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        2: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        3: [...ESPALDA_COMPLETA, ...BICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        4: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        5: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
      },
    },
    {
      id: 'split-espalda-vacio',
      nombre: 'Split 2 — Espalda (sin pesos)',
      descripcion: 'Mismo split de Espalda pero sin pesos pre-cargados',
      esPredefinida: true,
      dias: {
        1: [...ESPALDA_AMPLITUD, ...BICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        2: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        3: [...PECHO_EJERCICIOS, ...HOMBROS_EJERCICIOS, ...TRICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        4: [...ESPALDA_DENSIDAD, ...BICEPS_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
        5: [...PIERNA_EJERCICIOS, ...ABDOMEN_EJERCICIOS].map(e => ({ ...e, peso: undefined })),
      },
    },
  ];
}

// ─── Hook de plantillas ─────────────────────────────────────────

export function usePlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/plantillas');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const predefinidas = crearPlantillasPredefinidas();
      const customIds = new Set((data.plantillas as Plantilla[]).map((p) => p.id));
      const custom = (data.plantillas as Plantilla[]).filter((p) => !p.esPredefinida);
      // Avoid duplicating predefined ones that came from DB
      const preds = predefinidas.filter((p) => !customIds.has(p.id));
      setPlantillas([...preds, ...predefinidas.filter((p) => customIds.has(p.id)), ...custom]);
    } catch {
      // Fallback to predefined only
      setPlantillas(crearPlantillasPredefinidas());
    }
    setCargado(true);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarPlantilla = useCallback(
    async (plantilla: Omit<Plantilla, 'id'> & { id?: string }): Promise<Plantilla> => {
      const res = await fetch('/api/plantillas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plantilla),
      });
      const data = await res.json();
      const nueva = data.plantilla as Plantilla;
      setPlantillas((prev) => [...prev, nueva]);
      return nueva;
    },
    []
  );

  const editarPlantilla = useCallback(
    async (plantilla: Plantilla) => {
      await fetch('/api/plantillas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plantilla),
      });
      setPlantillas((prev) =>
        prev.map((p) => (p.id === plantilla.id ? plantilla : p))
      );
    },
    []
  );

  const eliminarPlantilla = useCallback(
    async (id: string) => {
      await fetch('/api/plantillas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPlantillas((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  return { plantillas, cargado, agregarPlantilla, editarPlantilla, eliminarPlantilla };
}

// ─── Hook de sesiones ───────────────────────────────────────────

export function useSesiones() {
  const [sesiones, setSesiones] = useState<SesionEntrenamiento[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    fetch('/api/sesiones')
      .then((r) => r.json())
      .then((data) => {
        setSesiones(data.sesiones || []);
      })
      .catch(() => setSesiones([]))
      .finally(() => setCargado(true));
  }, []);

  const obtenerSesionPorFecha = useCallback(
    (fecha: Date): SesionEntrenamiento | undefined => {
      const str = fechaAString(fecha);
      return sesiones.find((s) => s.fecha === str);
    },
    [sesiones]
  );

  const guardarSesion = useCallback(
    async (sesion: SesionEntrenamiento) => {
      await fetch('/api/sesiones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sesion),
      });
      setSesiones((prev) => {
        const idx = prev.findIndex((s) => s.id === sesion.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = sesion;
          return copy;
        }
        return [...prev, sesion];
      });
      return sesion;
    },
    []
  );

  const crearSesionParaFecha = useCallback(
    async (fecha: Date): Promise<SesionEntrenamiento> => {
      const str = fechaAString(fecha);
      const existente = sesiones.find((s) => s.fecha === str);
      if (existente) return existente;
      const nueva: SesionEntrenamiento = {
        id: uuidv4(),
        fecha: str,
        diaDelAnio: obtenerDiaDelAnio(fecha),
        semanaISO: obtenerSemanaISO(fecha),
        anioISO: obtenerAnioISO(fecha),
        ejercicios: [],
        completada: false,
      };
      await guardarSesion(nueva);
      return nueva;
    },
    [sesiones, guardarSesion]
  );

  const agregarEjercicio = useCallback(
    async (fecha: Date, ejercicio: Omit<Ejercicio, 'id'>): Promise<Ejercicio> => {
      const str = fechaAString(fecha);
      let sesion = sesiones.find((s) => s.fecha === str);
      if (!sesion) {
        sesion = {
          id: uuidv4(),
          fecha: str,
          diaDelAnio: obtenerDiaDelAnio(fecha),
          semanaISO: obtenerSemanaISO(fecha),
          anioISO: obtenerAnioISO(fecha),
          ejercicios: [],
          completada: false,
        };
      }
      const nuevoEj: Ejercicio = {
        ...ejercicio,
        id: uuidv4(),
        realizado: ejercicio.realizado ?? false,
      };
      const actualizada = {
        ...sesion,
        ejercicios: [...sesion.ejercicios, nuevoEj],
      };
      await guardarSesion(actualizada);
      return nuevoEj;
    },
    [sesiones, guardarSesion]
  );

  const editarEjercicio = useCallback(
    async (fecha: Date, ejercicio: Ejercicio) => {
      const str = fechaAString(fecha);
      const sesion = sesiones.find((s) => s.fecha === str);
      if (!sesion) return;
      const actualizada = {
        ...sesion,
        ejercicios: sesion.ejercicios.map((e) =>
          e.id === ejercicio.id ? ejercicio : e
        ),
      };
      await guardarSesion(actualizada);
    },
    [sesiones, guardarSesion]
  );

  const eliminarEjercicio = useCallback(
    async (fecha: Date, ejercicioId: string) => {
      const str = fechaAString(fecha);
      const sesion = sesiones.find((s) => s.fecha === str);
      if (!sesion) return;
      const actualizada = {
        ...sesion,
        ejercicios: sesion.ejercicios.filter((e) => e.id !== ejercicioId),
      };
      await guardarSesion(actualizada);
    },
    [sesiones, guardarSesion]
  );

  const aplicarPlantillaASemana = useCallback(
    async (plantilla: Plantilla, fechaReferencia: Date) => {
      const diasSemana = obtenerDiasSemana(fechaReferencia);
      const nuevasSesiones: SesionEntrenamiento[] = [];

      for (let i = 0; i < 7; i++) {
        const dia = diasSemana[i];
        const diaSemana = (i + 1) as DiaSemana;
        const ejerciciosPlantilla = plantilla.dias[diaSemana];
        const strFecha = fechaAString(dia);
        const existente = sesiones.find((s) => s.fecha === strFecha);

        if (ejerciciosPlantilla && ejerciciosPlantilla.length > 0) {
          nuevasSesiones.push({
            id: existente?.id || uuidv4(),
            fecha: strFecha,
            diaDelAnio: obtenerDiaDelAnio(dia),
            semanaISO: obtenerSemanaISO(dia),
            anioISO: obtenerAnioISO(dia),
            ejercicios: ejerciciosPlantilla.map((ep) => ({
              ...ep,
              id: uuidv4(),
              realizado: ep.realizado ?? false,
            })),
            completada: false,
          });
        } else if (existente) {
          nuevasSesiones.push({
            ...existente,
            ejercicios: [],
          });
        }
      }

      // Bulk upsert
      await fetch('/api/sesiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesiones: nuevasSesiones }),
      });

      // Update local state
      setSesiones((prev) => {
        const copy = [...prev];
        for (const ns of nuevasSesiones) {
          const idx = copy.findIndex((s) => s.fecha === ns.fecha);
          if (idx >= 0) {
            copy[idx] = ns;
          } else {
            copy.push(ns);
          }
        }
        return copy;
      });
    },
    [sesiones]
  );

  const obtenerSesionesSemana = useCallback(
    (semana: number, anio: number): SesionEntrenamiento[] => {
      return sesiones.filter(
        (s) => s.semanaISO === semana && s.anioISO === anio
      );
    },
    [sesiones]
  );

  const limpiarSemana = useCallback(
    async (fechaReferencia: Date) => {
      const diasSemana = obtenerDiasSemana(fechaReferencia);
      const fechasABorrar: string[] = [];

      for (const dia of diasSemana) {
        const strFecha = fechaAString(dia);
        const existente = sesiones.find((s) => s.fecha === strFecha);
        if (existente && existente.ejercicios.length > 0) {
          fechasABorrar.push(strFecha);
        }
      }

      if (fechasABorrar.length === 0) return;

      await fetch('/api/sesiones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechas: fechasABorrar }),
      });

      setSesiones((prev) =>
        prev.filter((s) => !fechasABorrar.includes(s.fecha))
      );
    },
    [sesiones]
  );

  const obtenerSesionesMes = useCallback(
    (mes: number, anio: number): SesionEntrenamiento[] => {
      return sesiones.filter((s) => {
        const fecha = new Date(s.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      });
    },
    [sesiones]
  );

  const toggleCompletada = useCallback(
    async (fecha: Date) => {
      const str = fechaAString(fecha);
      let sesion = sesiones.find((s) => s.fecha === str);
      if (!sesion) {
        sesion = {
          id: uuidv4(),
          fecha: str,
          diaDelAnio: obtenerDiaDelAnio(fecha),
          semanaISO: obtenerSemanaISO(fecha),
          anioISO: obtenerAnioISO(fecha),
          ejercicios: [],
          completada: false,
        };
      }
      const actualizada = { ...sesion, completada: !sesion.completada };
      await guardarSesion(actualizada);
    },
    [sesiones, guardarSesion]
  );

  return {
    sesiones,
    cargado,
    obtenerSesionPorFecha,
    guardarSesion,
    crearSesionParaFecha,
    agregarEjercicio,
    editarEjercicio,
    eliminarEjercicio,
    aplicarPlantillaASemana,
    limpiarSemana,
    obtenerSesionesSemana,
    obtenerSesionesMes,
    toggleCompletada,
  };
}

// ─── Hook de peso corporal ──────────────────────────────────────

export function useRegistrosPeso() {
  const [registros, setRegistros] = useState<RegistroPeso[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    fetch('/api/peso')
      .then((r) => r.json())
      .then((data) => setRegistros(data.registros || []))
      .catch(() => setRegistros([]))
      .finally(() => setCargado(true));
  }, []);

  const agregarRegistro = useCallback(
    async (peso: number, unidad: 'kg' | 'lbs', fecha?: Date) => {
      const f = fecha || new Date();
      const str = fechaAString(f);

      await fetch('/api/peso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: str, peso, unidad }),
      });

      setRegistros((prev) => {
        const filtrados = prev.filter((r) => r.fecha !== str);
        const nuevo: RegistroPeso = { id: uuidv4(), fecha: str, peso, unidad };
        return [...filtrados, nuevo].sort((a, b) =>
          a.fecha.localeCompare(b.fecha)
        );
      });
    },
    []
  );

  const obtenerRegistrosSemana = useCallback(
    (semana: number, anio: number): RegistroPeso[] => {
      return registros.filter((r) => {
        const fecha = new Date(r.fecha);
        return (
          obtenerSemanaISO(fecha) === semana && obtenerAnioISO(fecha) === anio
        );
      });
    },
    [registros]
  );

  const obtenerRegistrosMes = useCallback(
    (mes: number, anio: number): RegistroPeso[] => {
      return registros.filter((r) => {
        const fecha = new Date(r.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      });
    },
    [registros]
  );

  return {
    registros,
    cargado,
    agregarRegistro,
    obtenerRegistrosSemana,
    obtenerRegistrosMes,
  };
}

// ─── Hook de compartidas ────────────────────────────────────────

export function useCompartidas() {
  const [compartidas, setCompartidas] = useState<RutinaCompartida[]>([]);

  useEffect(() => {
    fetch('/api/compartidas')
      .then((r) => r.json())
      .then((data) => setCompartidas(data.compartidas || []))
      .catch(() => setCompartidas([]));
  }, []);

  const crearEnlace = useCallback(
    async (ejercicios: Ejercicio[], nombreRutina: string): Promise<RutinaCompartida> => {
      const res = await fetch('/api/compartidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ejercicios, nombreRutina }),
      });
      const data = await res.json();
      const nueva = data.compartida as RutinaCompartida;
      setCompartidas((prev) => [...prev, nueva]);
      return nueva;
    },
    []
  );

  const obtenerPorToken = useCallback(
    (token: string): RutinaCompartida | undefined => {
      return compartidas.find((c) => c.token === token);
    },
    [compartidas]
  );

  return { compartidas, crearEnlace, obtenerPorToken };
}
