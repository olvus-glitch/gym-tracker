import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Row { date: string; weight: number; cardioCalories: number }

export default function CardioWeightChart({ data }: { data: Row[] }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Cardio vs Peso corporal</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" dataKey="weight" name="Peso" stroke="#0ea5e9" strokeWidth={2} />
            <Bar yAxisId="right" dataKey="cardioCalories" name="Kcal cardio" fill="#f97316" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
