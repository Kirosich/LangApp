import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const LANGUAGE_TABS = [
  { value: '', label: 'Все' },
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    api.getStats({ language }).then(setStats).catch((e) => setError(e.message));
  }, [language]);

  const actionSuffix = language ? `?language=${language}` : '';

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
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

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="К повторению сегодня" value={stats?.due_today ?? '—'} accent />
        <StatCard label="Streak" value={stats ? `${stats.streak_days} 🔥` : '—'} />
        <StatCard label="Всего карточек" value={stats?.total_cards ?? '—'} />
        <StatCard label="Тем" value={stats?.by_theme?.length ?? '—'} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <ActionButton to={`/study${actionSuffix}`} label="Учить" icon="📚" />
        <ActionButton to={`/quiz${actionSuffix}`} label="Квиз" icon="🎯" />
        <ActionButton to="/cards/new" label="Добавить карточку" icon="➕" />
        <ActionButton to="/browse" label="Все карточки" icon="🗂️" />
      </div>

      {stats?.by_theme?.length > 0 && (
        <div>
          <h2 className="text-sm text-neutral-400 mb-2">По темам</h2>
          <div className="space-y-1">
            {stats.by_theme.map((t) => (
              <div key={t.theme} className="flex justify-between text-sm bg-neutral-900 rounded-lg px-3 py-2">
                <span>{t.theme}</span>
                <span className="text-neutral-400">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-neutral-800 bg-neutral-900'}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-400 mt-1">{label}</div>
    </div>
  );
}

function ActionButton({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 py-5 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-neutral-200">{label}</span>
    </Link>
  );
}
