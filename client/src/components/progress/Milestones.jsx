export default function Milestones({ milestones }) {
  if (!milestones) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  const unlocked = milestones.filter((m) => m.unlocked);
  const locked = milestones.filter((m) => !m.unlocked);

  return (
    <div className="space-y-2">
      {unlocked.map((m) => (
        <div key={m.theme} className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <span className="text-emerald-400">✓</span>
          <div>
            <div className="text-sm">{m.ability}</div>
            <div className="text-[10px] text-neutral-500">{m.theme}</div>
          </div>
        </div>
      ))}

      {locked.map((m) => (
        <div key={m.theme} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>{m.theme}</span>
            <span>{m.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div className="h-full bg-neutral-600" style={{ width: `${m.percent}%` }} />
          </div>
        </div>
      ))}

      {milestones.length === 0 && <p className="text-sm text-neutral-500">Тем пока нет.</p>}
    </div>
  );
}
