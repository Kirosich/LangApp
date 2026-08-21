import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import MediaExamRound from '../components/media/MediaExamRound';

const TYPE_LABEL = { movie: 'фильм', series: 'сериал' };

export default function MediaDetail() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const [showExam, setShowExam] = useState(false);

  function load() {
    api.getMediaEntry(id).then(setEntry).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!entry) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  if (showExam) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <MediaExamRound
          entryId={entry.id}
          language={entry.language_focus}
          onExit={() => {
            setShowExam(false);
            load();
          }}
        />
      </div>
    );
  }

  const cardIds = entry.vocab.map((c) => c.id).join(',');

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/media" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← К списку
      </Link>

      <div>
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
          {TYPE_LABEL[entry.type] || entry.type}
          {entry.year ? ` · ${entry.year}` : ''}
          {entry.genre ? ` · ${entry.genre}` : ''}
        </div>
        <h1 className="text-xl font-semibold">{entry.title}</h1>
        <p className="text-sm text-neutral-400 mt-1">{entry.one_line_theme}</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex items-center justify-between">
        <div>
          <div className="font-medium">{entry.vocab.length} слов по теме</div>
          <div className="text-xs text-neutral-500">
            {entry.vocab.filter((c) => c.status === 'active').length} активных ·{' '}
            {entry.vocab.filter((c) => c.status === 'backlog').length} в складе
          </div>
        </div>
        {cardIds && (
          <Link to={`/study?cards=${cardIds}`} className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium">
            Учить
          </Link>
        )}
      </div>

      {entry.texts.map((text) => (
        <MediaTextBlock key={text.id} text={text} />
      ))}

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">Экзамен по теме</div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {entry.exam.exam_size} вопрос{entry.exam.exam_size === 1 ? '' : entry.exam.exam_size < 5 ? 'а' : 'ов'} из пула{' '}
              {entry.exam.pool_size}
              {entry.exam.attempts > 0 && ` · попыток: ${entry.exam.attempts}`}
              {entry.exam.passed && ' · сдан'}
            </div>
          </div>
          <button
            onClick={() => setShowExam(true)}
            disabled={entry.exam.pool_size === 0}
            className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-3 py-2 text-sm font-medium"
          >
            {entry.exam.passed ? 'Пересдать' : 'Сдать'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaTextBlock({ text }) {
  const [answers, setAnswers] = useState({});

  function choose(ref, option) {
    setAnswers((prev) => ({ ...prev, [ref]: option }));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
          {text.title} · {text.level}
        </div>
        <div className="whitespace-pre-line leading-relaxed text-[15px]">{text.body}</div>
      </div>

      {text.questions.length > 0 && (
        <div className="space-y-3">
          {text.questions.map((q, i) => {
            const selected = answers[q.ref];
            return (
              <div key={q.ref} className="space-y-1.5">
                <div className="text-sm text-neutral-300">
                  {i + 1}. {q.prompt}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((option) => {
                    const isCorrect = option === q.correct_answer;
                    const isSelected = option === selected;
                    let cls = 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800';
                    if (selected) {
                      if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/20';
                      else if (isSelected) cls = 'border-red-500 bg-red-500/20';
                    }
                    return (
                      <button
                        key={option}
                        onClick={() => choose(q.ref, option)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
