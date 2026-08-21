import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CumulativeChart({ data }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">Пока недостаточно данных.</p>;
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={false} width={30} />
          <Tooltip
            contentStyle={{ background: '#171717', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value) => [value, 'Слов выучено']}
          />
          <Line type="monotone" dataKey="total_words_learned" stroke="#818cf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
