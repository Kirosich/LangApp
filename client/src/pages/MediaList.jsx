import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const TYPE_LABEL = { movie: 'фильм', series: 'сериал' };

export default function MediaList() {
  const { language } = useLanguage();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEntries(null);
    api.getMediaList(language).then(setEntries).catch((e) => setError(e.message));
  }, [language]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Фильмы и сериалы</h1>
      <p className="text-xs text-neutral-500">
        Фильм/сериал — тематический якорь для словаря и текста, не источник материала: весь текст оригинальный,
        по мотивам жанра и темы, без пересказа сюжета.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!entries && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {entries?.length === 0 && <p className="text-sm text-neutral-500">Пока нет тайтлов для этого языка.</p>}

      <div className="space-y-2">
        {entries?.map((m) => (
          <Link
            key={m.id}
            to={`/media/${m.id}`}
            className="block rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium">
                {m.title} {m.year ? `(${m.year})` : ''}
              </span>
              {m.exam_passed && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 shrink-0">экзамен сдан</span>}
            </div>
            <div className="text-xs text-neutral-500 mb-1">
              {TYPE_LABEL[m.type] || m.type}
              {m.genre ? ` · ${m.genre}` : ''}
            </div>
            <p className="text-xs text-neutral-400">{m.one_line_theme}</p>
            <div className="text-[10px] text-neutral-600 mt-1.5">
              {m.vocab_count} слов · {m.text_count} текст{m.text_count === 1 ? '' : m.text_count < 5 ? 'а' : 'ов'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
