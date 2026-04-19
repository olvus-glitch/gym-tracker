'use client';

import {
  obtenerDiaDelAnio,
  obtenerSemanaISO,
  obtenerNombreDia,
  formatearFechaCorta,
  addDays,
  subDays,
  isToday,
  fechaAString,
} from '../lib/fechas';

interface CalendarioDiaProps {
  fecha: Date;
  onCambiarFecha: (fecha: Date) => void;
  diasEntrenados?: Set<string>;
  completada?: boolean;
  onToggleCompletada?: () => void;
}

export default function CalendarioDia({ fecha, onCambiarFecha, diasEntrenados, completada, onToggleCompletada }: CalendarioDiaProps) {
  const dia = obtenerDiaDelAnio(fecha);
  const semana = obtenerSemanaISO(fecha);
  const nombreDia = obtenerNombreDia(fecha);
  const fechaCorta = formatearFechaCorta(fecha);
  const esHoy = isToday(fecha);

  return (
    <div className="bg-card-bg rounded-xl shadow-sm border border-border p-4 mt-4">
      {/* Navegación por semana */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onCambiarFecha(subDays(fecha, 7))}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          aria-label="Semana anterior"
        >
          « Sem. anterior
        </button>
        {!esHoy && (
          <button
            onClick={() => onCambiarFecha(new Date())}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-hover-bg text-text-muted hover:bg-border transition-colors"
          >
            Ir a hoy
          </button>
        )}
        <button
          onClick={() => onCambiarFecha(addDays(fecha, 7))}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          aria-label="Semana siguiente"
        >
          Sem. siguiente »
        </button>
      </div>

      {/* Navegación por día */}
      <div className="flex items-center justify-between">
        {/* Flecha izquierda */}
        <button
          onClick={() => onCambiarFecha(subDays(fecha, 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-hover-bg hover:bg-border transition-colors text-lg"
          aria-label="Día anterior"
        >
          ‹
        </button>

        {/* Info del día */}
        <div className="text-center flex-1 mx-2">
          <h2 className="text-xl font-bold text-foreground">{nombreDia}</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {fechaCorta} • Día {dia} • Semana {semana} • {fecha.getFullYear()}
          </p>
          {esHoy && (
            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Hoy
            </span>
          )}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() => onCambiarFecha(addDays(fecha, 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-hover-bg hover:bg-border transition-colors text-lg"
          aria-label="Día siguiente"
        >
          ›
        </button>
      </div>

      {/* Navegación por año */}
      <div className="flex items-center justify-center gap-4 mt-3 mb-1">
        <button
          onClick={() => {
            const nueva = new Date(fecha);
            nueva.setFullYear(nueva.getFullYear() - 1);
            onCambiarFecha(nueva);
          }}
          className="px-2 py-0.5 rounded text-xs font-medium text-text-muted hover:text-foreground hover:bg-hover-bg transition-colors"
        >
          ‹ {fecha.getFullYear() - 1}
        </button>
        <span className="text-sm font-bold text-primary">{fecha.getFullYear()}</span>
        <button
          onClick={() => {
            const nueva = new Date(fecha);
            nueva.setFullYear(nueva.getFullYear() + 1);
            onCambiarFecha(nueva);
          }}
          className="px-2 py-0.5 rounded text-xs font-medium text-text-muted hover:text-foreground hover:bg-hover-bg transition-colors"
        >
          {fecha.getFullYear() + 1} ›
        </button>
      </div>

      {/* Mini calendario de la semana */}
      <div className="flex justify-between mt-2 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(
            subDays(fecha, (fecha.getDay() === 0 ? 7 : fecha.getDay()) - 1),
            i
          );
          const esMismoDia =
            d.toDateString() === fecha.toDateString();
          const esHoyMini = isToday(d);
          const label = ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i];
          const tieneEjercicios = diasEntrenados?.has(fechaAString(d)) ?? false;
          return (
            <button
              key={i}
              onClick={() => onCambiarFecha(d)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg text-xs transition-colors ${
                esMismoDia
                  ? 'bg-primary text-white font-bold'
                  : esHoyMini
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-muted hover:bg-hover-bg'
              }`}
            >
              <span>{label}</span>
              <span className="text-[11px] mt-0.5">{d.getDate()}</span>
              {tieneEjercicios && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  esMismoDia ? 'bg-white' : 'bg-emerald-500'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Toggle día entrenado */}
      {onToggleCompletada && (
        <button
          onClick={onToggleCompletada}
          className={`w-full mt-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            completada
              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              : 'bg-hover-bg text-text-muted border border-border hover:bg-border'
          }`}
        >
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            completada
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-text-muted/40'
          }`}>
            {completada && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          {completada ? 'Día entrenado ✓' : 'Marcar como entrenado'}
        </button>
      )}
    </div>
  );
}
