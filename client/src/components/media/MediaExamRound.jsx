import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useStudySession } from '../../hooks/useStudySession';
import { celebrateBadge } from '../../utils/confetti';

// Same shape as LevelExamRound: no per-question reveal, score/pass only
// at the end, server re-checks every answer -- this is a graded record
// (media_exam_results), not a practice round.
export default function MediaExamRound({ entryId, language, onExit }) {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { recordCard, endNow } = useStudySession('media_exam', language);

  useEffect(() => {
    api
      .getMediaExamQuestions(entryId)
      .then((data) => setQuestions(data.questions))
      .catch((e) => setError(e.message));
  }, [entryId]);

  function choose(option) {
    if (selected) return;
    setSelected(option);
    recordCard();
  }

  async function next() {
    const updatedAnswers = [...answers, { ref: questions[index].ref, selected }];
    setAnswers(updatedAnswers);

    if (index + 1 >= questions.length) {
      setSubmitting(true);
      try {
        const res = await api.submitMediaExamAttempt(entryId, updatedAnswers);
        const sessionResult = await endNow();
        if (res.passed || sessionResult?.newly_earned_badges?.length) celebrateBadge();
        setResult(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (error) return <div className="text-sm text-red-400">{error}</div>;
  if (!questions) return <div className="text-sm text-neutral-400">Загрузка…</div>;

  if (result) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center space-y-3">
        <div className="text-2xl">{result.passed ? '🏆' : '📚'}</div>
        <div className="text-lg font-semibold">
          {result.score} / {result.total}
        </div>
        <div className={`text-sm ${result.passed ? 'text-emerald-400' : 'text-neutral-400'}`}>
          {result.passed ? 'Экзамен по теме сдан!' : 'Нужно 100% правильных ответов — попробуй ещё раз.'}
        </div>
        <button onClick={onExit} className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
          Назад
        </button>
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-neutral-500 text-center">
        Вопрос {index + 1} из {questions.length}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">{question.prompt}</div>

      <div className="grid grid-cols-1 gap-2">
        {question.options.map((option) => {
          const isThisSelected = option === selected;
          const cls = isThisSelected
            ? 'border-indigo-500 bg-indigo-500/20'
            : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800';
          return (
            <button key={option} onClick={() => choose(option)} className={`rounded-xl border px-4 py-3 text-left transition-colors ${cls}`}>
              {option}
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={next}
          disabled={submitting}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
        >
          {submitting ? 'Проверяю…' : index + 1 >= questions.length ? 'Завершить экзамен' : 'Далее'}
        </button>
      )}
    </div>
  );
}
