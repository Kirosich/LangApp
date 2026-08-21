import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const LANGUAGE_TABS = [
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

// Groups a flat topic list into { category, levelRange, topics } — the
// category's own level range is derived from its topics rather than
// stored anywhere, so it can't drift out of sync with the data.
function groupByCategory(topics) {
  const groups = new Map();
  for (const topic of topics) {
    const key = topic.category || 'Другое';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(topic);
  }
  return [...groups.entries()].map(([category, categoryTopics]) => {
    const levels = [...new Set(categoryTopics.map((t) => t.level))].sort(
      (a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b)
    );
    const levelRange = levels.length > 1 ? `${levels[0]}–${levels[levels.length - 1]}` : levels[0] || '';
    return { category, levelRange, topics: categoryTopics };
  });
}

export default function TheoryReferenceList() {
  const [language, setLanguage] = useState('kz');
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setTopics(null);
    api.getTheoryTopics(language).then(setTopics).catch((e) => setError(e.message));
  }, [language]);

  const groups = topics ? groupByCategory(topics) : null;

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

      <div className="space-y-5">
        {groups?.map((group) => (
          <div key={group.category}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-300">{group.category}</h3>
              {group.levelRange && (
                <span className="text-[10px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5">
                  {group.levelRange}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {group.topics.map((topic) => (
                <Link
                  key={topic.slug}
                  to={`/theory/topics/${topic.slug}`}
                  className="block rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium">{topic.title}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-[10px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5">
                        {topic.level}
                      </span>
                      {topic.read ? (
                        <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">
                          прочитано
                        </span>
                      ) : (
                        <span className="text-[10px] rounded-full bg-indigo-500/20 text-indigo-400 px-2 py-0.5">
                          новое
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">{topic.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {topics?.length === 0 && <p className="text-sm text-neutral-500">Тем для этого языка пока нет.</p>}
      </div>
    </div>
  );
}
