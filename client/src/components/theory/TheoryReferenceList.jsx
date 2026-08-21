import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

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
    const readCount = categoryTopics.filter((t) => t.read).length;
    return { category, levelRange, topics: categoryTopics, readCount };
  });
}

export default function TheoryReferenceList() {
  const { language } = useLanguage();
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState('');
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    setTopics(null);
    setOpenCategory(null);
    api.getTheoryTopics(language).then(setTopics).catch((e) => setError(e.message));
  }, [language]);

  const groups = topics ? groupByCategory(topics) : null;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!topics && !error && <p className="text-sm text-neutral-400">Загрузка…</p>}

      <div className="space-y-2">
        {groups?.map((group) => {
          const isOpen = openCategory === group.category;
          return (
            <div key={group.category} className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
              <button
                onClick={() => setOpenCategory(isOpen ? null : group.category)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neutral-800 transition-colors"
              >
                <span className="text-sm font-semibold text-neutral-200">{group.category}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-neutral-500">
                    {group.readCount}/{group.topics.length}
                  </span>
                  {group.levelRange && (
                    <span className="text-[10px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5">
                      {group.levelRange}
                    </span>
                  )}
                  <span className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-neutral-800 divide-y divide-neutral-800">
                  {group.topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      to={`/theory/topics/${topic.slug}`}
                      className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-sm text-neutral-300 truncate">{topic.title}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[10px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5">
                          {topic.level}
                        </span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${topic.read ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          title={topic.read ? 'прочитано' : 'новое'}
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {topics?.length === 0 && <p className="text-sm text-neutral-500">Тем для этого языка пока нет.</p>}
      </div>
    </div>
  );
}
