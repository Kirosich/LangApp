import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const LANGUAGE_TABS = [
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

export default function TheoryReferenceList() {
  const [language, setLanguage] = useState('kz');
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setTopics(null);
    api.getTheoryTopics(language).then(setTopics).catch((e) => setError(e.message));
  }, [language]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {LANGUAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setLanguage(tab.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              language === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!topics && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}

      <div className="space-y-2">
        {topics?.map((topic) => (
          <Link
            key={topic.slug}
            to={`/theory/topics/${topic.slug}`}
            className="block rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium">{topic.title}</span>
              {topic.read ? (
                <span className="shrink-0 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">
                  прочитано
                </span>
              ) : (
                <span className="shrink-0 text-[10px] rounded-full bg-indigo-500/20 text-indigo-400 px-2 py-0.5">новое</span>
              )}
            </div>
            <p className="text-xs text-neutral-500">{topic.summary}</p>
          </Link>
        ))}
        {topics?.length === 0 && <p className="text-sm text-neutral-500">Тем для этого языка пока нет.</p>}
      </div>
    </div>
  );
}
