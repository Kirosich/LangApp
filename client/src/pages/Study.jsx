import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const RATINGS = [
  { label: 'Заново', quality: 1, className: 'bg-red-600 hover:bg-red-500' },
  { label: 'Трудно', quality: 3, className: 'bg-amber-600 hover:bg-amber-500' },
  { label: 'Хорошо', quality: 4, className: 'bg-emerald-600 hover:bg-emerald-500' },
  { label: 'Легко', quality: 5, className: 'bg-sky-600 hover:bg-sky-500' }
];

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

export default function Study() {
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDueCards().then(setCards).catch((e) => setError(e.message));
  }, []);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        flip();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip]);

  async function rate(quality) {
    const card = cards[index];
    setSubmitting(true);
    try {
      await api.reviewCard(card.id, quality);
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!cards) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  if (cards.length === 0) {
    return (
      <EmptyState
        title="Нет карточек к повторению"
        subtitle="Все выучено на сегодня — загляните позже, или добавьте новые карточки."
      />
    );
  }

  if (index >= cards.length) {
    return <EmptyState title="Сессия завершена 🎉" subtitle={`Повторено карточек: ${cards.length}`} />;
  }

  const card = cards[index];

  return (
    <div className="p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Карточка {index + 1} из {cards.length}
      </div>

      <button
        onClick={flip}
        className="w-full min-h-[220px] rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col items-center justify-center gap-3 text-center"
      >
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          {LANGUAGE_LABEL[card.language]} · {card.theme}
        </span>
        <span className="text-3xl font-semibold">{card.term}</span>

        {flipped && (
          <div className="mt-2 space-y-1 text-neutral-300">
            <div className="text-xl">{card.translation_ru}</div>
            {card.transcription && <div className="text-sm text-neutral-500">[{card.transcription}]</div>}
            {card.example_sentence && <div className="text-sm italic text-neutral-400 mt-2">{card.example_sentence}</div>}
          </div>
        )}
        {!flipped && <span className="text-xs text-neutral-600 mt-4">нажмите или Space, чтобы перевернуть</span>}
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.quality}
              disabled={submitting}
              onClick={() => rate(r.quality)}
              className={`rounded-xl py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 ${r.className}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-4 max-w-lg mx-auto text-center flex flex-col items-center gap-3 mt-16">
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-neutral-400">{subtitle}</div>
      <Link to="/" className="mt-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
        На дашборд
      </Link>
    </div>
  );
}
