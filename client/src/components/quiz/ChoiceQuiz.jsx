import { useState } from 'react';

export default function ChoiceQuiz({ questions, onFinish, onProgress }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function choose(option) {
    if (selected) return;
    setSelected(option);
    const correct = option === question.correct_answer;
    if (correct) setScore((s) => s + 1);
    onProgress?.(correct);
  }

  function next() {
    if (isLast) {
      onFinish(score + (selected === question.correct_answer ? 0 : 0));
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Вопрос {index + 1} из {questions.length}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Как переводится?</div>
        <div className="text-2xl font-semibold">{question.term}</div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {question.options.map((option) => {
          const isCorrect = option === question.correct_answer;
          const isSelected = option === selected;
          let cls = 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800';
          if (selected) {
            if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/20';
            else if (isSelected) cls = 'border-red-500 bg-red-500/20';
          }
          return (
            <button
              key={option}
              onClick={() => choose(option)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${cls}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected && (
        <button onClick={next} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-medium">
          {isLast ? 'Завершить' : 'Далее'}
        </button>
      )}
    </div>
  );
}
