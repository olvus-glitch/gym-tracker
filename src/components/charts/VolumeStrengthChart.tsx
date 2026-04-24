import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Row { week: string; volume: number; avgStrength: number }

export default function VolumeStrengthChart({ data }: { data: Row[] }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Volumen vs Fuerza</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="volume" name="Volumen" fill="#7c3aed" />
            <Line yAxisId="right" type="monotone" dataKey="avgStrength" name="Fuerza media" stroke="#22c55e" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
