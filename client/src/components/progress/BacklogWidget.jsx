import { useState } from 'react';

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

function LanguageRow({ row, onBoost }) {
  const [boosting, setBoosting] = useState(false);
  const pct = row.new_cards_per_day > 0 ? Math.min(100, Math.round((row.introduced_today / row.new_cards_per_day) * 100)) : 0;

  async function boost() {
    setBoosting(true);
    try {
      await onBoost(row.language, 5);
    } finally {
      setBoosting(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{LANGUAGE_LABEL[row.language]}</span>
        <span className="text-xs text-neutral-500">
          Введено сегодня: {row.introduced_today}/{row.new_cards_per_day}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden mb-2">
        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          На складе: {row.backlog_count} · Уже знаю: {row.mastered_count}
        </span>
        <button
          onClick={boost}
          disabled={boosting || row.backlog_count === 0}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-2 py-1 text-xs font-medium"
        >
          Учить больше сегодня
        </button>
      </div>
    </div>
  );
}

export default function BacklogWidget({ summary, onBoost }) {
  if (!summary) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  return (
    <div className="space-y-2">
      {summary.map((row) => (
        <LanguageRow key={row.language} row={row} onBoost={onBoost} />
      ))}
    </div>
  );
}
