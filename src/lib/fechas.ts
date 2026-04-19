import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  subDays,
  getISOWeek,
  getISOWeekYear,
  getDayOfYear,
  parseISO,
  isToday,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function obtenerDiaDelAnio(fecha: Date): number {
  return getDayOfYear(fecha);
}

export function obtenerSemanaISO(fecha: Date): number {
  return getISOWeek(fecha);
}

export function obtenerAnioISO(fecha: Date): number {
  return getISOWeekYear(fecha);
}

export function formatearFechaCorta(fecha: Date): string {
  return format(fecha, "EEE, d 'de' MMM", { locale: es });
}

export function formatearFechaCompleta(fecha: Date): string {
  return format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es });
}

export function obtenerNombreDia(fecha: Date): string {
  const nombre = format(fecha, 'EEEE', { locale: es });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function fechaAString(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

export function stringAFecha(str: string): Date {
  return parseISO(str);
}

export function obtenerDiasSemana(fecha: Date): Date[] {
  const inicio = startOfWeek(fecha, { weekStartsOn: 1 });
  const fin = endOfWeek(fecha, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: inicio, end: fin });
}

export function obtenerDiasMes(fecha: Date): Date[] {
  const inicio = startOfMonth(fecha);
  const fin = endOfMonth(fecha);
  return eachDayOfInterval({ start: inicio, end: fin });
}

export { addDays, subDays, isToday, isSameDay, format, parseISO };
