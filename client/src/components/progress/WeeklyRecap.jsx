function Delta({ label, recent, previous, unit }) {
  const diff = recent - previous;
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
  const color = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-neutral-500';

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span>
        <span className="font-semibold">
          {recent}
          {unit}
        </span>{' '}
        <span className={color}>
          {arrow} {Math.abs(diff)}
          {unit}
        </span>
      </span>
    </div>
  );
}

export default function WeeklyRecap({ recap }) {
  const isMonday = new Date().getDay() === 1;
  if (!isMonday || !recap) return null;

  const { recent_week: recent, previous_week: previous } = recap;

  return (
    <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 space-y-2">
      <div className="text-sm font-semibold mb-1">Неделя в цифрах</div>
      <Delta label="Время" recent={recent.minutes} previous={previous.minutes} unit=" мин" />
      <Delta label="Слов выучено" recent={recent.words_learned} previous={previous.words_learned} unit="" />
      <Delta label="XP" recent={recent.xp} previous={previous.xp} unit="" />
    </div>
  );
}
