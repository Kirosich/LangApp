export default function BadgesGrid({ badges }) {
  if (!badges || badges.length === 0) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  return (
    <div className="grid grid-cols-4 gap-2">
      {badges.map((badge) => (
        <div
          key={badge.code}
          title={badge.description}
          className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center ${
            badge.earned ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-neutral-800 bg-neutral-900 opacity-40 grayscale'
          }`}
        >
          <span className="text-2xl">{badge.icon}</span>
          <span className="text-[10px] text-neutral-300 leading-tight">{badge.title}</span>
          {badge.earned && <span className="text-[9px] text-neutral-600">{badge.earned_at.slice(0, 10)}</span>}
        </div>
      ))}
    </div>
  );
}
