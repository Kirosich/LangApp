import { useMemo, useState } from 'react';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MatchingQuiz({ rounds, onFinish, onProgress }) {
  const totalPairs = useMemo(() => rounds.reduce((sum, r) => sum + r.length, 0), [rounds]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [wrongPair, setWrongPair] = useState(null); // { termId, translationText }
  const [mistakes, setMistakes] = useState(0);

  const round = rounds[roundIndex];
  const terms = useMemo(() => shuffle(round), [round]);
  const translations = useMemo(() => shuffle(round), [round]);

  const roundComplete = matchedIds.size === round.length;

  function selectTerm(cardId) {
    if (matchedIds.has(cardId) || wrongPair) return;
    setSelectedTermId(cardId === selectedTermId ? null : cardId);
  }

  function selectTranslation(cardId, text) {
    if (!selectedTermId || wrongPair) return;
    const termCard = round.find((c) => c.card_id === selectedTermId);
    if (termCard.translation_ru === text && termCard.card_id === cardId) {
      setMatchedIds((prev) => new Set(prev).add(cardId));
      setSelectedTermId(null);
      onProgress?.();
    } else {
      setMistakes((m) => m + 1);
      setWrongPair({ termId: selectedTermId, cardId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTermId(null);
      }, 500);
    }
  }

  function nextRound() {
    if (roundIndex + 1 >= rounds.length) {
      onFinish(Math.max(totalPairs - mistakes, 0));
      return;
    }
    setRoundIndex((i) => i + 1);
    setMatchedIds(new Set());
    setSelectedTermId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Раунд {roundIndex + 1} из {rounds.length} · Сопоставьте пары
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {terms.map((card) => {
            const matched = matchedIds.has(card.card_id);
            const selected = selectedTermId === card.card_id;
            const wrong = wrongPair?.termId === card.card_id;
            return (
              <button
                key={`term-${card.card_id}`}
                disabled={matched}
                onClick={() => selectTerm(card.card_id)}
                className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                  matched
                    ? 'border-emerald-600 bg-emerald-600/10 text-neutral-500'
                    : wrong
                    ? 'border-red-500 bg-red-500/20'
                    : selected
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {card.term}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {translations.map((card) => {
            const matched = matchedIds.has(card.card_id);
            const wrong = wrongPair?.cardId === card.card_id;
            return (
              <button
                key={`tr-${card.card_id}`}
                disabled={matched}
                onClick={() => selectTranslation(card.card_id, card.translation_ru)}
                className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                  matched
                    ? 'border-emerald-600 bg-emerald-600/10 text-neutral-500'
                    : wrong
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {card.translation_ru}
              </button>
            );
          })}
        </div>
      </div>

      {roundComplete && (
        <button onClick={nextRound} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
          {roundIndex + 1 >= rounds.length ? 'Завершить' : 'Следующий раунд'}
        </button>
      )}
    </div>
  );
}
