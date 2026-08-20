export default function RecordsWidget({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Record label="Рекорд streak" value={`${summary.longest_streak} дн.`} />
      <Record label="Карточек за день" value={summary.best_day_cards} />
      <Record label="Долгая сессия" value={`${summary.best_session_minutes} мин`} />
    </div>
  );
}

function Record({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
