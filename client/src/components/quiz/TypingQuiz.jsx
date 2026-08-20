import { useState } from 'react';
import { isCloseEnough } from '../../utils/levenshtein';

export default function TypingQuiz({ questions, onFinish }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(null); // null | 'correct' | 'incorrect'
  const [score, setScore] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function submit(e) {
    e.preventDefault();
    if (checked || !value.trim()) return;
    const correct = isCloseEnough(value, question.expected_answer, 1);
    setChecked(correct ? 'correct' : 'incorrect');
    if (correct) setScore((s) => s + 1);
  }

  function next() {
    if (isLast) {
      onFinish(score);
      return;
    }
    setValue('');
    setChecked(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Вопрос {index + 1} из {questions.length}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Переведите на русский</div>
        <div className="text-2xl font-semibold">{question.term}</div>
        {question.transcription && <div className="text-sm text-neutral-500 mt-1">[{question.transcription}]</div>}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          autoFocus
          value={value}
          disabled={Boolean(checked)}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ваш ответ…"
          className={`w-full rounded-xl border px-4 py-3 bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            checked === 'correct'
              ? 'border-emerald-500'
              : checked === 'incorrect'
              ? 'border-red-500'
              : 'border-neutral-800'
          }`}
        />

        {checked === 'incorrect' && (
          <div className="text-sm text-red-400">Правильный ответ: {question.expected_answer}</div>
        )}
        {checked === 'correct' && <div className="text-sm text-emerald-400">Верно!</div>}

        {!checked ? (
          <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
            Проверить
          </button>
        ) : (
          <button type="button" onClick={next} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
            {isLast ? 'Завершить' : 'Далее'}
          </button>
        )}
      </form>
    </div>
  );
}
