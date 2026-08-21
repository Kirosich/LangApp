import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const LANGUAGE_LABEL = { kz: 'KZ', en: 'EN' };

export default function ProblemCards({ cards, onChange }) {
  const [busyId, setBusyId] = useState(null);

  if (!cards) return <p className="text-sm text-neutral-500">Загрузка…</p>;
  if (cards.length === 0) return <p className="text-sm text-neutral-500">Застрявших карточек не найдено.</p>;

  const ids = cards.map((c) => c.id).join(',');

  async function demote(id) {
    if (!window.confirm('Убрать карточку в склад и сбросить прогресс? Она вернётся позже свежей.')) return;
    setBusyId(id);
    try {
      await api.demoteCard(id);
      onChange?.();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <div key={card.id} className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-neutral-500 mr-2">{LANGUAGE_LABEL[card.language]}</span>
              <span>{card.term}</span>
              <span className="text-neutral-500"> — {card.translation_ru}</span>
            </div>
            <span className="text-xs text-red-400 shrink-0 ml-2">EF {card.easiness_factor.toFixed(2)}</span>
          </div>
          <div className="flex gap-3 text-xs">
            <Link to={`/cards/${card.id}/edit`} className="text-indigo-400 hover:text-indigo-300">
              ✏️ Переписать пример
            </Link>
            <button onClick={() => demote(card.id)} disabled={busyId === card.id} className="text-amber-400 hover:text-amber-300 disabled:opacity-50">
              ↩ В склад (сбросить прогресс)
            </button>
          </div>
        </div>
      ))}
      <Link
        to={`/study?cards=${ids}`}
        className="block text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-sm font-medium"
      >
        Потренировать отдельно
      </Link>
    </div>
  );
}
