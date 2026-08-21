import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useStudySession } from '../../hooks/useStudySession';
import { celebrateBadge } from '../../utils/confetti';

// One drill round for a theory topic: multiple choice, explanation shown
// right after answering (the point is to learn the mechanism, not just
// get scored), tracked as its own session_type so it counts toward
// streak/time like everything else.
export default function TheoryDrillRound({ slug, onExit }) {
  const [drills, setDrills] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const { recordCard, endNow } = useStudySession('theory_drill');

  useEffect(() => {
    api
      .getTheoryDrills(slug)
      .then((data) => setDrills(data.drills))
      .catch((e) => setError(e.message));
  }, [slug]);

  function choose(option) {
    if (selected) return;
    setSelected(option);
    const correct = option === drills[index].correct_answer;
    if (correct) setScore((s) => s + 1);
    recordCard();
  }

  async function next() {
    if (index + 1 >= drills.length) {
      const result = await endNow();
      if (result?.newly_earned_badges?.length) celebrateBadge();
      setDone(true);
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (error) return <div className="text-sm text-red-400">{error}</div>;
  if (!drills) return <div className="text-sm text-neutral-400">Загрузка…</div>;

  if (drills.length === 0) {
    return (
      <div className="text-sm text-neutral-500">
        Для этой темы пока нет дриллов.{' '}
        <button onClick={onExit} className="text-indigo-400 hover:text-indigo-300">
          Назад
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center space-y-3">
        <div className="text-lg font-semibold">
          {score} / {drills.length}
        </div>
        <button onClick={onExit} className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
          К теме
        </button>
      </div>
    );
  }

  const drill = drills[index];
  const isCorrect = selected === drill.correct_answer;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-neutral-500 text-center">
        Дрилл {index + 1} из {drills.length}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">{drill.prompt}</div>

      <div className="grid grid-cols-1 gap-2">
        {drill.options.map((option) => {
          const isThisCorrect = option === drill.correct_answer;
          const isThisSelected = option === selected;
          let cls = 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800';
          if (selected) {
            if (isThisCorrect) cls = 'border-emerald-500 bg-emerald-500/20';
            else if (isThisSelected) cls = 'border-red-500 bg-red-500/20';
          }
          return (
            <button key={option} onClick={() => choose(option)} className={`rounded-xl border px-4 py-3 text-left transition-colors ${cls}`}>
              {option}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            isCorrect ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          }`}
        >
          {drill.explanation}
        </div>
      )}

      {selected && (
        <button onClick={next} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
          {index + 1 >= drills.length ? 'Завершить' : 'Далее'}
        </button>
      )}
    </div>
  );
}
