import { Link } from 'react-router-dom';

const LANGUAGE_LABEL = { kz: 'KZ', en: 'EN' };

export default function ProblemCards({ cards }) {
  if (!cards) return <p className="text-sm text-neutral-500">Загрузка…</p>;
  if (cards.length === 0) return <p className="text-sm text-neutral-500">Пока нет данных — начните заниматься.</p>;

  const ids = cards.map((c) => c.id).join(',');

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <div key={card.id} className="flex items-center justify-between rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm">
          <div>
            <span className="text-neutral-500 mr-2">{LANGUAGE_LABEL[card.language]}</span>
            <span>{card.term}</span>
            <span className="text-neutral-500"> — {card.translation_ru}</span>
          </div>
          <span className="text-xs text-red-400">EF {card.easiness_factor.toFixed(2)}</span>
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
