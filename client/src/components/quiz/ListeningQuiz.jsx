import { useEffect, useMemo, useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

// Same question shape as ChoiceQuiz (term + options), but the term is
// heard, not read: it stays hidden until the question is answered, and
// is spoken via TTS instead. Any question whose language has no voice on
// this device is filtered out automatically -- per the plan, listening
// must gracefully skip rather than show a silent, unplayable question.
export default function ListeningQuiz({ questions, onFinish, onProgress }) {
  const speechByLanguage = {
    kz: useSpeech('kz'),
    en: useSpeech('en')
  };

  const playable = useMemo(
    () => questions.filter((q) => speechByLanguage[q.language]?.supported),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, speechByLanguage.kz.supported, speechByLanguage.en.supported]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const question = playable[index];
  const isLast = index === playable.length - 1;

  useEffect(() => {
    if (question) speechByLanguage[question.language]?.speak(question.term);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  function replay() {
    if (question) speechByLanguage[question.language]?.speak(question.term);
  }

  function choose(option) {
    if (selected) return;
    setSelected(option);
    const correct = option === question.correct_answer;
    if (correct) setScore((s) => s + 1);
    onProgress?.(correct);
  }

  function next() {
    if (isLast) {
      onFinish(score, playable.length);
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (playable.length === 0) {
    return (
      <div className="text-center text-neutral-400 text-sm py-8">
        На этом устройстве нет голоса для озвучки этих карточек — аудирование недоступно. Попробуйте другой язык или другой браузер.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400 text-center">
        Вопрос {index + 1} из {playable.length}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center flex flex-col items-center gap-3">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Прослушай и выбери перевод</div>
        <button
          onClick={replay}
          className="text-5xl hover:scale-110 transition-transform"
          aria-label="Повторить произношение"
          title="Повторить"
        >
          🔊
        </button>
        {selected && <div className="text-2xl font-semibold mt-1">{question.term}</div>}
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
            <button key={option} onClick={() => choose(option)} className={`rounded-xl border px-4 py-3 text-left transition-colors ${cls}`}>
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
