import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
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
import QuestsWidget from '../components/progress/QuestsWidget';

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${minutes} мин`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [startingWorkout, setStartingWorkout] = useState(false);

  async function startWorkout() {
    setStartingWorkout(true);
    try {
      const { card_ids } = await api.getWorkout({ language });
      if (card_ids.length === 0) {
        setError('Пока нечего тренировать — ни просевших, ни карточек к повторению.');
        return;
      }
      navigate(`/study?cards=${card_ids.join(',')}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setStartingWorkout(false);
    }
  }

  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [cumulative, setCumulative] = useState(null);
  const [topics, setTopics] = useState(null);
  const [badges, setBadges] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [listeningAccuracy, setListeningAccuracy] = useState(null);
  const [problemCards, setProblemCards] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [weeklyRecap, setWeeklyRecap] = useState(null);
  const [backlogSummary, setBacklogSummary] = useState(null);
  const [quests, setQuests] = useState(null);

  function loadBacklogSummary() {
    api.getBacklogSummary().then(setBacklogSummary).catch(() => {});
  }

  async function handleBoost(lang, count) {
    await api.boostBacklog(lang, count);
    loadBacklogSummary();
  }

  // Everything here is scoped to the one active language -- no more
  // "Все" tab, no more blended numbers to unblend on this page.
  useEffect(() => {
    api.getStats({ language }).then(setStats).catch((e) => setError(e.message));
    api.getGamificationSummary(language).then(setSummary).catch(() => {});
    api.getBadges(language).then(setBadges).catch(() => {});
    api.getProblemCards(language).then(setProblemCards).catch(() => {});
    api.getQuests(language).then(setQuests).catch(() => {});
  }, [language]);

  useEffect(() => {
    api.getHeatmap(90).then(setHeatmap).catch(() => {});
    api.getCumulative().then(setCumulative).catch(() => {});
    api.getTopicsBreakdown().then(setTopics).catch(() => {});
    api.getAccuracyTrend().then(setAccuracy).catch(() => {});
    api.getListeningAccuracyTrend().then(setListeningAccuracy).catch(() => {});
    api.getMilestones().then(setMilestones).catch(() => {});
    api.getWeeklyRecap().then(setWeeklyRecap).catch(() => {});
    loadBacklogSummary();
  }, []);

  const backlogRow = backlogSummary?.find((r) => r.language === language) ?? null;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <button
        onClick={startWorkout}
        disabled={startingWorkout}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 py-4 font-semibold text-center"
      >
        {startingWorkout ? 'Собираю…' : '🎯 Тренировка дня'}
      </button>

      <WeeklyRecap recap={weeklyRecap} />

      <div>
        <h2 className="text-sm text-neutral-400 mb-2">Квесты</h2>
        <QuestsWidget quests={quests} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="К повторению сегодня" value={stats?.due_today ?? '—'} accent />
        <StatCard label="Streak" value={stats ? `${stats.streak_days} 🔥` : '—'} />
        <StatCard label="Всего карточек" value={stats?.total_cards ?? '—'} />
        <StatCard label="Тем" value={stats?.by_theme?.length ?? '—'} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <ActionButton to="/study" label="Учить" icon="📚" />
        <ActionButton to="/quiz" label="Квиз" icon="🎯" />
        <ActionButton to="/cards/new" label="Добавить карточку" icon="➕" />
        <ActionButton to="/browse" label="Все карточки" icon="🗂️" />
        <ActionButton to="/study?practice=100" label="Тренировка · 100 слов" icon="🔁" className="col-span-2" />
        <ActionButton to="/quiz?type=sentence" label="Собери предложение" icon="🧩" className="col-span-2" />
        <ActionButton to="/proficiency-test" label="Тест на уровень" icon="📋" className="col-span-2" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm text-neutral-400">Склад</h2>
          <Link to="/settings" className="text-xs text-indigo-400 hover:text-indigo-300">
            Настройки
          </Link>
        </div>
        {backlogRow ? <BacklogWidget summary={[backlogRow]} onBoost={handleBoost} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
      </div>

      {stats && <TimeCard stats={stats} language={language} />}

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
          <h3 className="text-xs text-neutral-500 mb-2">Личные рекорды</h3>
          <RecordsWidget summary={summary} />
        </div>

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
          <h3 className="text-xs text-neutral-500 mb-2">Точность в квизах по неделям</h3>
          {accuracy ? <AccuracyChart data={accuracy} /> : <p className="text-sm text-neutral-500">Загрузка…</p>}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Точность аудирования по неделям</h3>
          {listeningAccuracy ? (
            <AccuracyChart data={listeningAccuracy} />
          ) : (
            <p className="text-sm text-neutral-500">Загрузка…</p>
          )}
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 mb-2">Проблемные карточки</h3>
          <ProblemCards cards={problemCards} onChange={() => api.getProblemCards(language).then(setProblemCards).catch(() => {})} />
        </div>
      </div>
    </div>
  );
}

function TimeCard({ stats, language }) {
  const minutes = stats.minutes_by_language[language];
  return (
    <div>
      <h2 className="text-sm text-neutral-400 mb-2">Время</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Сегодня" value={formatMinutes(minutes.today)} />
        <StatCard label="За неделю" value={formatMinutes(minutes.this_week)} />
        <StatCard label="Всего" value={formatMinutes(minutes.all_time)} />
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

function ActionButton({ to, label, icon, className = '' }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 py-5 transition-colors ${className}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-neutral-200">{label}</span>
    </Link>
  );
}
