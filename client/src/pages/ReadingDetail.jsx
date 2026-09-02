import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { celebrateLevelUp, celebrateBadge } from '../utils/confetti';
import { useStudySession } from '../hooks/useStudySession';
import SpeakButton from '../components/SpeakButton';

export default function ReadingDetail() {
  const { slug } = useParams();
  const [text, setText] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.getReadingText(slug).then(setText).catch((e) => setError(e.message));
  }

  useEffect(load, [slug]);

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!text) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  // Split out so useStudySession only mounts once `text` (and its
  // language) is known -- its start-session effect runs once on mount
  // and closes over whatever `language` was at that point, so it can't
  // just be called with text?.language directly up here while text is
  // still null.
  return <ReadingDetailBody key={slug} text={text} onReload={load} />;
}

function ReadingDetailBody({ text, onReload }) {
  const [marking, setMarking] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { endNow } = useStudySession('reading', text.language);

  async function markRead() {
    setMarking(true);
    try {
      const res = await api.markReadingRead(text.slug);
      if (res.leveled_up) celebrateLevelUp();
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setMarking(false);
    }
  }

  function choose(exerciseId, option) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [exerciseId]: option }));
  }

  async function submitExercises() {
    setSubmitting(true);
    try {
      const payload = text.exercises.map((e) => ({ exercise_id: e.id, selected: answers[e.id] ?? null }));
      const res = await api.submitReadingExercises(text.slug, payload);
      await endNow();
      if (res.score === res.total) celebrateBadge();
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = text.exercises.every((e) => answers[e.id]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/theory?tab=reading" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← К списку чтения
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {text.theme} · {text.level}
          </span>
          {text.read && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">прочитано</span>}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{text.title}</h1>
          <SpeakButton text={text.body} language={text.language} />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 whitespace-pre-line leading-relaxed text-[15px]">
        {text.body}
      </div>

      {text.new_words.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Новые слова в этом тексте</div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 space-y-1">
            {text.new_words.map((w) => (
              <div key={w.term} className="flex justify-between text-sm">
                <span>{w.term}</span>
                <span className="text-neutral-500">{w.translation_ru}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={markRead}
        disabled={marking}
        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
      >
        {text.read ? 'Понятно, прочитать ещё раз ✓' : 'Понятно, отметить как изученное'}
      </button>

      {text.exercises.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-300 pt-2">Проверь понимание</h2>

          {text.exercises.map((ex, i) => (
            <div key={ex.id} className="space-y-2">
              <div className="text-sm text-neutral-300">
                {i + 1}. {ex.prompt}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ex.options.map((option) => {
                  const isSelected = answers[ex.id] === option;
                  const isCorrect = option === ex.correct_answer;
                  let cls = 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800';
                  if (result) {
                    if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/20';
                    else if (isSelected) cls = 'border-red-500 bg-red-500/20';
                  } else if (isSelected) {
                    cls = 'border-indigo-500 bg-indigo-500/20';
                  }
                  return (
                    <button
                      key={option}
                      onClick={() => choose(ex.id, option)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!result ? (
            <button
              onClick={submitExercises}
              disabled={!allAnswered || submitting}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
            >
              {submitting ? 'Проверяю…' : 'Проверить'}
            </button>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
              <div className="text-lg font-semibold">
                {result.score} / {result.total}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
