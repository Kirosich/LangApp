import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const STYLE_LABEL = { textbook: 'учебный', genre: 'жанровый' };

export default function ReadingList() {
  const { language } = useLanguage();
  const [texts, setTexts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setTexts(null);
    api.getReadingTexts(language).then(setTexts).catch((e) => setError(e.message));
  }, [language]);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!texts && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}
      {texts?.length === 0 && <p className="text-sm text-neutral-500">Пока нет текстов для этого языка.</p>}

      <div className="space-y-2">
        {texts?.map((t) => (
          <Link
            key={t.slug}
            to={`/theory/reading/${t.slug}`}
            className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{t.title}</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {t.theme} · {t.level} · {STYLE_LABEL[t.style] || t.style}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {t.best_score !== null && t.best_score !== undefined && (
                <span className="text-[10px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5">
                  {t.best_score}/{t.best_score_total}
                </span>
              )}
              {t.read && <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">прочитано</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
