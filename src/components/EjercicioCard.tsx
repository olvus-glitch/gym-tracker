import type { Ejercicio } from '../lib/types';

interface EjercicioCardProps {
  ejercicio: Ejercicio;
  esPR?: boolean;
  onEditar: (ejercicio: Ejercicio) => void;
  onEliminar: (id: string) => void;
  onToggleRealizado?: (ejercicio: Ejercicio) => void;
}

const COLORES_GRUPO: Record<string, string> = {
  Pierna: 'border-l-blue-500',
  Abdomen: 'border-l-orange-500',
  Espalda: 'border-l-green-500',
  Bíceps: 'border-l-pink-500',
  Pecho: 'border-l-red-500',
  Hombros: 'border-l-yellow-500',
  Tríceps: 'border-l-purple-500',
  Cardio: 'border-l-cyan-500',
  Otro: 'border-l-gray-500',
};

export default function EjercicioCard({
  ejercicio,
  esPR,
  onEditar,
  onEliminar,
  onToggleRealizado,
}: EjercicioCardProps) {
  const colorBorde = COLORES_GRUPO[ejercicio.grupoMuscular] || 'border-l-gray-400';
  const esCardio = ejercicio.grupoMuscular === 'Cardio';
  const principal = esCardio
    ? `${ejercicio.maquinaCardio || 'Cardio'} • ${ejercicio.distanciaKm ?? 0} km • ${ejercicio.calorias ?? 0} kcal • ${ejercicio.tiempoMin ?? 0} min`
    : `${ejercicio.series}x${ejercicio.repeticiones}${ejercicio.peso ? ` • ${ejercicio.peso}${ejercicio.unidad}` : ''}`;

  return (
    <div
      className={`bg-card-bg rounded-lg shadow-sm border border-border border-l-4 ${colorBorde} p-4 flex items-center justify-between gap-3 ${
        ejercicio.realizado ? 'ring-1 ring-emerald-500/40 bg-emerald-500/5' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-semibold text-foreground text-sm truncate">
            {ejercicio.nombre}
          </h4>
          {esPR && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold shrink-0" title="Record Personal">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              PR
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{principal}</p>
        {ejercicio.notas && (
          <p className="text-xs text-text-muted/70 italic mt-0.5 truncate">
            {ejercicio.notas}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onToggleRealizado && (
          <button
            onClick={() => onToggleRealizado(ejercicio)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
              ejercicio.realizado
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40'
                : 'bg-card-bg text-text-muted border-border hover:bg-hover-bg'
            }`}
            aria-label="Marcar ejercicio realizado"
            title="Checklist del ejercicio"
          >
            {ejercicio.realizado ? 'Hecho' : 'Pendiente'}
          </button>
        )}
        <button
          onClick={() => onEditar(ejercicio)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-accent hover:bg-accent/10 transition-colors"
          aria-label="Editar ejercicio"
        >
          ✏️
        </button>
        <button
          onClick={() => onEliminar(ejercicio.id)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
          aria-label="Eliminar ejercicio"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
