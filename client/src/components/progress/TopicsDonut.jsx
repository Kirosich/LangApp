import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#818cf8', '#27272a'];

function DonutRing({ theme, total, learned }) {
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
  const data = [
    { name: 'learned', value: learned },
    { name: 'remaining', value: total - learned }
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} stroke="none">
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{pct}%</div>
      </div>
      <span className="text-xs text-neutral-400 text-center leading-tight">{theme}</span>
      <span className="text-[10px] text-neutral-600">
        {learned}/{total}
      </span>
    </div>
  );
}

export default function TopicsDonut({ data }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">Тем пока нет.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {data.map((t) => (
        <DonutRing key={t.theme} theme={t.theme} total={t.total_cards} learned={t.learned_cards} />
      ))}
    </div>
  );
}
