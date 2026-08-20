export default function LevelCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold">
          {summary.current_level}. {summary.level_name?.kz}
          {summary.level_name?.ru && <span className="text-xs text-neutral-500 font-normal"> ({summary.level_name.ru})</span>}
        </span>
        <span className="text-sm text-neutral-400 shrink-0">{summary.total_xp} XP</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${summary.progress_percent_to_next_level}%` }}
        />
      </div>
      <div className="text-xs text-neutral-500 mt-1">Ещё {summary.xp_to_next_level} XP до след. уровня</div>
    </div>
  );
}
