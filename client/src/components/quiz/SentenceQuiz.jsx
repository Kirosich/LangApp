import { useState } from 'react';

// Tap words in the right order to rebuild the example sentence. Each
// word's `id` is its correct position in the sentence, so a fully
// correct answer is exactly placed[i].id === i for every i.
export default function SentenceQuiz({ questions, onFinish, onProgress }) {
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const remaining = question.words.filter((w) => !placed.some((p) => p.id === w.id));
  const isCorrect = answered && placed.every((t, i) => t.id === i);

  function place(token) {
    if (answered) return;
    const next = [...placed, token];
    setPlaced(next);
    if (next.length === question.words.length) {
      const correct = next.every((t, i) => t.id === i);
      setAnswered(true);
      if (correct) setScore((s) => s + 1);
      onProgress?.(correct);
    }
  }

  function unplace(token) {
    if (answered) return;
    setPlaced((prev) => prev.filter((p) => p.id !== token.id));
  }

  function next() {
    if (isLast) {
      onFinish(score);
      return;
    }
    setPlaced([]);
    setAnswered(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Вопрос {index + 1} из {questions.length}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Собери предложение</div>
        <div className="text-lg font-semibold">{question.term}</div>
      </div>

      <div className="min-h-[64px] rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex flex-wrap gap-2 items-start content-start">
        {placed.length === 0 && <span className="text-sm text-neutral-600 py-1.5">Тапни слова снизу по порядку…</span>}
        {placed.map((token, i) => {
          let cls = 'border-neutral-700 bg-neutral-800';
          if (answered) cls = token.id === i ? 'border-emerald-500 bg-emerald-500/20' : 'border-red-500 bg-red-500/20';
          return (
            <button
              key={token.id}
              onClick={() => unplace(token)}
              disabled={answered}
              className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-100 ${cls}`}
            >
              {token.text}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {remaining.map((token) => (
          <button
            key={token.id}
            onClick={() => place(token)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-sm"
          >
            {token.text}
          </button>
        ))}
      </div>

      {answered && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-1 text-center">
          <div className={`text-sm font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? 'Верно!' : 'Не совсем — вот правильный порядок:'}
          </div>
          <div className="text-base">{question.sentence}</div>
          <div className="text-sm text-neutral-500">
            {question.term} — {question.translation_ru}
          </div>
        </div>
      )}

      {answered && (
        <button onClick={next} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
          {isLast ? 'Завершить' : 'Далее'}
        </button>
      )}
    </div>
  );
}
