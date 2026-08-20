import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AccuracyChart({ data }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">Пройдите квиз, чтобы увидеть тренд точности.</p>;
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="week_start" tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            width={30}
            unit="%"
          />
          <Tooltip
            contentStyle={{ background: '#171717', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value) => [`${value}%`, 'Точность']}
          />
          <Bar dataKey="accuracy_percent" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
