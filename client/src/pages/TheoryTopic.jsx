import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { celebrateLevelUp } from '../utils/confetti';
import { useStudySession } from '../hooks/useStudySession';
import TheoryDrillRound from '../components/theory/TheoryDrillRound';

const SECTION_LABEL = {
  explanation: 'Объяснение',
  example: 'Примеры',
  common_mistake: 'Частая ошибка',
  exercise_hint: 'Подсказка для практики'
};

export default function TheoryTopic() {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.getTheoryTopic(slug).then(setTopic).catch((e) => setError(e.message));
  }

  useEffect(load, [slug]);

  if (error) return <div className="p-4 text-red-400">{error}</div>;
  if (!topic) return <div className="p-4 text-neutral-400">Загрузка…</div>;

  // Split out so useStudySession only mounts once `topic` (and its
  // language) is known -- same pattern as ReadingDetailBody.
  return <TheoryTopicBody key={slug} slug={slug} topic={topic} onReload={load} />;
}

function TheoryTopicBody({ slug, topic, onReload }) {
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [drillMode, setDrillMode] = useState(false);

  useStudySession('theory_read', topic.language);

  async function markRead() {
    setMarking(true);
    try {
      const result = await api.markTheoryTopicRead(slug);
      if (result.leveled_up) celebrateLevelUp();
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <Link to="/theory" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← К справочнику
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wide text-neutral-500">{topic.level}</span>
          {topic.read && (
            <span className="text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">прочитано</span>
          )}
        </div>
        <h1 className="text-xl font-semibold">{topic.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{topic.summary}</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {drillMode ? (
        <TheoryDrillRound slug={slug} onExit={() => setDrillMode(false)} />
      ) : (
        <>
          <div className="space-y-3">
            {topic.sections.map((section, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 whitespace-pre-line text-sm leading-relaxed ${
                  section.section_type === 'common_mistake'
                    ? 'border border-amber-500/40 bg-amber-500/10'
                    : 'border border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  {SECTION_LABEL[section.section_type] ?? section.section_type}
                </div>
                {section.content}
              </div>
            ))}
          </div>

          <button
            onClick={markRead}
            disabled={marking}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-medium"
          >
            {topic.read ? 'Понятно, прочитать ещё раз ✓' : 'Понятно, отметить как изученное'}
          </button>

          {topic.drill_count > 0 && (
            <button
              onClick={() => setDrillMode(true)}
              className="w-full rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 py-3 font-medium"
            >
              🧠 Начать дриллы
            </button>
          )}
        </>
      )}

      {!drillMode && topic.practice?.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Практика</div>
          {topic.practice.map((p) => (
            <div key={p.theme} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-neutral-300">{p.theme}</div>
                <div className="text-xs text-neutral-500">
                  выучено {p.learned} / {p.total}
                </div>
              </div>
              <Link
                to={`/study?language=${topic.language}&theme=${encodeURIComponent(p.theme)}`}
                className="shrink-0 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-sm"
              >
                Учить эти слова
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
