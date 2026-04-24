interface Props {
  volumen: number;
  cardioMin: number;
  suenoProm: number;
  pesoActual?: number;
}

export default function WeeklyDashboardCards({ volumen, cardioMin, suenoProm, pesoActual }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      <Card title="Volumen" value={`${volumen}`} sub="kg*reps" />
      <Card title="Cardio" value={`${cardioMin}`} sub="min/semana" />
      <Card title="Sueno" value={`${suenoProm.toFixed(1)}`} sub="h promedio" />
      <Card title="Peso" value={pesoActual ? `${pesoActual}` : '-'} sub="kg actual" />
    </div>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-3">
      <p className="text-[11px] text-text-muted uppercase tracking-wide">{title}</p>
      <p className="text-xl font-black text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-text-muted">{sub}</p>
    </div>
  );
}
