import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useStudySession } from '../hooks/useStudySession';
import { celebrateLevelUp, celebrateBadge } from '../utils/confetti';

const RATINGS = [
  { label: 'Заново', quality: 1, className: 'bg-red-600 hover:bg-red-500' },
  { label: 'Трудно', quality: 3, className: 'bg-amber-600 hover:bg-amber-500' },
  { label: 'Хорошо', quality: 4, className: 'bg-emerald-600 hover:bg-emerald-500' },
  { label: 'Легко', quality: 5, className: 'bg-sky-600 hover:bg-sky-500' }
];

const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Study() {
  const [searchParams] = useSearchParams();
  const language = searchParams.get('language') || '';
  const cardIds = searchParams.get('cards') || '';

  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { recordCard, endNow } = useStudySession('study');
  const sessionEndedForUiRef = useRef(false);

  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceCards, setPracticeCards] = useState([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceFlipped, setPracticeFlipped] = useState(false);

  useEffect(() => {
    const request = cardIds ? api.getCards({ ids: cardIds }) : api.getDueCards({ language });
    request.then(setCards).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, cardIds]);

  useEffect(() => {
    if (!cards || cards.length === 0 || index < cards.length || sessionEndedForUiRef.current) return;
    sessionEndedForUiRef.current = true;
    endNow().then((result) => {
      if (result?.newly_earned_badges?.length) celebrateBadge();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, index]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (practiceMode) {
          setPracticeFlipped((f) => !f);
        } else {
          flip();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, practiceMode]);

  function startPractice() {
    setPracticeCards(shuffle(cards));
    setPracticeIndex(0);
    setPracticeFlipped(false);
    setPracticeMode(true);
  }

  function nextPractice() {
    setPracticeFlipped(false);
    setPracticeIndex((i) => {
      const next = i + 1;
      if (next >= practiceCards.length) {
        // loop back around with a fresh shuffle so the drill never runs out
        setPracticeCards(shuffle(cards));
        return 0;
      }
      return next;
    });
  }

  async function rate(quality) {
    const card = cards[index];
    setSubmitting(true);
    try {
      const result = await api.reviewCard(card.id, quality);
      recordCard();
      if (result.leveled_up) celebrateLevelUp();
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function master() {
    const card = cards[index];
    setSubmitting(true);
    try {
      const result = await api.masterCard(card.id);
      recordCard();
      if (result.leveled_up) celebrateLevelUp();
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
    if (practiceMode) {
      const pCard = practiceCards[practiceIndex];
      return (
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-4">
          <div className="text-sm text-neutral-400 text-center">
            Тренировка · карточка {practiceIndex + 1} из {practiceCards.length}
          </div>

          <button
            onClick={() => setPracticeFlipped((f) => !f)}
            className="w-full min-h-[220px] rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col items-center justify-center gap-3 text-center"
          >
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              {LANGUAGE_LABEL[pCard.language]} · {pCard.theme}
            </span>
            <span className="text-3xl font-semibold">{pCard.term}</span>

            {practiceFlipped && (
              <div className="mt-2 space-y-1 text-neutral-300">
                <div className="text-xl">{pCard.translation_ru}</div>
                {pCard.transcription && <div className="text-sm text-neutral-500">[{pCard.transcription}]</div>}
                {pCard.example_sentence && (
                  <div className="text-sm italic text-neutral-400 mt-2">{pCard.example_sentence}</div>
                )}
              </div>
            )}
            {!practiceFlipped && <span className="text-xs text-neutral-600 mt-4">нажмите или Space, чтобы перевернуть</span>}
          </button>

          {practiceFlipped && (
            <button
              onClick={nextPractice}
              className="rounded-xl py-3 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700"
            >
              Дальше
            </button>
          )}

          <button
            onClick={() => setPracticeMode(false)}
            className="text-xs text-neutral-600 hover:text-neutral-400 self-center"
          >
            Закончить тренировку
          </button>
        </div>
      );
    }

    return (
      <EmptyState
        title="Сессия завершена 🎉"
        subtitle={`Повторено карточек: ${cards.length}`}
        actions={
          <button
            onClick={startPractice}
            className="rounded-lg bg-sky-700 hover:bg-sky-600 px-4 py-2 text-sm text-white"
          >
            Ещё раз (тренировка, без влияния на расписание)
          </button>
        }
      />
    );
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
        <>
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
          <button
            onClick={master}
            disabled={submitting}
            className="text-xs text-neutral-600 hover:text-emerald-500 disabled:opacity-50 self-center"
          >
            Знаю досконально, больше не показывать
          </button>
        </>
      )}
    </div>
  );
}

function EmptyState({ title, subtitle, actions }) {
  return (
    <div className="p-4 max-w-lg mx-auto text-center flex flex-col items-center gap-3 mt-16">
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-neutral-400">{subtitle}</div>
      {actions && <div className="mt-4">{actions}</div>}
      <Link to="/" className="mt-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
        На дашборд
      </Link>
    </div>
  );
}
