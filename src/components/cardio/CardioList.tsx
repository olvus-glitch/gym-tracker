import type { CardioSession } from '@/lib/types';

interface Props {
  sessions: CardioSession[];
  onDelete: (id: string) => void;
}

export default function CardioList({ sessions, onDelete }: Props) {
  if (!sessions.length) {
    return <p className="text-xs text-text-muted">No hay cardio registrado para este dia.</p>;
  }

  return (
    <div className="space-y-2">
      {sessions.map((c) => (
        <div key={c.id} className="bg-card-bg border border-border rounded-lg p-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{c.type} {c.machine ? `• ${c.machine}` : ''}</p>
            <p className="text-xs text-text-muted">{c.duration} min • {c.distance} km • {c.calories} kcal • Intensidad {c.intensity}</p>
          </div>
          <button onClick={() => onDelete(c.id)} className="text-danger text-xs px-2 py-1 rounded border border-danger/30 hover:bg-danger/10">Eliminar</button>
        </div>
      ))}
    </div>
  );
}
