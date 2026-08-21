function QuestRow({ quest }) {
  const percent = quest.goal > 0 ? Math.round((quest.progress / quest.goal) * 100) : 0;
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className={quest.done ? 'text-emerald-400' : 'text-neutral-300'}>
          {quest.done && '✓ '}
          {quest.title}
        </span>
        <span className="text-neutral-500 text-xs shrink-0 ml-2">
          {quest.progress}/{quest.goal}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${quest.done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function QuestsWidget({ quests }) {
  if (!quests) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-neutral-500 mb-2">Сегодня</div>
        <div className="space-y-2">
          {quests.daily.map((q) => (
            <QuestRow key={q.code} quest={q} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-neutral-500 mb-2">На этой неделе</div>
        <div className="space-y-2">
          {quests.weekly.map((q) => (
            <QuestRow key={q.code} quest={q} />
          ))}
        </div>
      </div>
    </div>
  );
}
