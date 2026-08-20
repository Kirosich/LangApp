import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import LevelCard from '../components/progress/LevelCard';
import Heatmap from '../components/progress/Heatmap';
import CumulativeChart from '../components/progress/CumulativeChart';
import TopicsDonut from '../components/progress/TopicsDonut';
import BadgesGrid from '../components/progress/BadgesGrid';
import RecordsWidget from '../components/progress/RecordsWidget';
import AccuracyChart from '../components/progress/AccuracyChart';
import ProblemCards from '../components/progress/ProblemCards';
import Milestones from '../components/progress/Milestones';
import WeeklyRecap from '../components/progress/WeeklyRecap';
import BacklogWidget from '../components/progress/BacklogWidget';

const LANGUAGE_TABS = [
  { value: '', label: 'Все' },
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${minutes} мин`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('');

  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [cumulative, setCumulative] = useState(null);
  const [topics, setTopics] = useState(null);
  const [badges, setBadges] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [problemCards, setProblemCards] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [weeklyRecap, setWeeklyRecap] = useState(null);
  const [backlogSummary, setBacklogSummary] = useState(null);

  function loadBacklogSummary() {
    api.getBacklogSummary().then(setBacklogSummary).catch(() => {});
  }

  async function handleBoost(lang, count) {
    await api.boostBacklog(lang, count);
    loadBacklogSummary();
  }

  useEffect(() => {
    api.getStats({ language }).then(setStats).catch((e) => setError(e.message));
  }, [language]);

  useEffect(() => {
    api.getGamificationSummary().then(setSummary).catch(() => {});
    api.getHeatmap(90).then(setHeatmap).catch(() => {});
    api.getCumulative().then(setCumulative).catch(() => {});
    api.getTopicsBreakdown().then(setTopics).catch(() => {});
    api.getBadges().then(setBadges).catch(() => {});
    api.getAccuracyTrend().then(setAccuracy).catch(() => {});
    api.getProblemCards().then(setProblemCards).catch(() => {});
    api.getMilestones().then(setMilestones).catch(() => {});
    api.getWeeklyRecap().then(setWeeklyRecap).catch(() => {});
    loadBacklogSummary();
  }, []);

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

      <WeeklyRecap recap={weeklyRecap} />

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

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm text-neutral-400">Склад</h2>
          <Link to="/settings" className="text-xs text-indigo-400 hover:text-indigo-300">
            Настройки
          </Link>
        </div>
        <BacklogWidget summary={backlogSummary} onBoost={handleBoost} />
      </div>

      {stats && (
        <div>
          <h2 className="text-sm text-neutral-400 mb-2">Время в этом месяце</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Сегодня" value={formatMinutes(stats.total_minutes_today)} />
            <StatCard label="За неделю" value={formatMinutes(stats.total_minutes_this_week)} />
            <StatCard label="Всего" value={formatMinutes(stats.total_minutes_all_time)} />
          </div>
        </div>
      )}

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

      <div className="space-y-4 pt-2 border-t border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-300 pt-2">Прогресс</h2>

        <LevelCard summary={summary} />

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Что ты уже можешь</h3>
          <Milestones milestones={milestones} />
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Активность за 90 дней</h3>
          {heatmap ? <Heatmap data={heatmap} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Выучено слов (нарастающим итогом)</h3>
          {cumulative ? <CumulativeChart data={cumulative} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Прогресс по темам</h3>
          {topics ? <TopicsDonut data={topics} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Бейджи</h3>
          <BadgesGrid badges={badges} />
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Личные рекорды</h3>
          <RecordsWidget summary={summary} />
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Точность в квизах по неделям</h3>
          {accuracy ? <AccuracyChart data={accuracy} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Проблемные карточки</h3>
          <ProblemCards cards={problemCards} />
        </div>
      </div>
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
