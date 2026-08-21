import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import QuestsWidget from '../components/progress/QuestsWidget';

const LANGUAGE_TABS = [
  { value: '', label: 'Все' },
  { value: 'kz', label: 'Казахский' },
  { value: 'en', label: 'English' }
];
const LANGUAGE_LABEL = { kz: 'Казахский', en: 'English' };

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${minutes} мин`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('');
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
  // Only populated on the "Все" tab -- {kz: {...}, en: {...}} pairs for
  // the explicit side-by-side comparison, instead of one blurred number.
  const [compareSummary, setCompareSummary] = useState(null);
  const [compareQuests, setCompareQuests] = useState(null);

  function loadBacklogSummary() {
    api.getBacklogSummary().then(setBacklogSummary).catch(() => {});
  }

  async function handleBoost(lang, count) {
    await api.boostBacklog(lang, count);
    loadBacklogSummary();
  }

  // Everything that depends on which language tab is active -- refetches
  // whenever it changes. On a specific language, each widget gets that
  // language's own numbers. On "Все", nothing here is a blurred mix
  // anymore: the combined fetch stays (for problem-cards/badges, which
  // stay app-wide by design) and a separate kz/en pair loads for the
  // side-by-side comparison blocks.
  useEffect(() => {
    api.getStats({ language }).then(setStats).catch((e) => setError(e.message));
    api.getGamificationSummary(language || undefined).then(setSummary).catch(() => {});
    api.getBadges(language || undefined).then(setBadges).catch(() => {});
    api.getProblemCards(language || undefined).then(setProblemCards).catch(() => {});

    if (language) {
      api.getQuests(language).then(setQuests).catch(() => {});
      setCompareSummary(null);
      setCompareQuests(null);
    } else {
      setQuests(null);
      Promise.all([api.getGamificationSummary('kz'), api.getGamificationSummary('en')])
        .then(([kz, en]) => setCompareSummary({ kz, en }))
        .catch(() => {});
      Promise.all([api.getQuests('kz'), api.getQuests('en')])
        .then(([kz, en]) => setCompareQuests({ kz, en }))
        .catch(() => {});
    }
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

  const actionSuffix = language ? `?language=${language}` : '';
  const practiceSuffix = language ? `?language=${language}&practice=100` : '?practice=100';
  const sentenceSuffix = language ? `?language=${language}&type=sentence` : '?type=sentence';

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
        {language ? <QuestsWidget quests={quests} /> : <QuestsCompare compare={compareQuests} />}
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
        <ActionButton to={`/study${practiceSuffix}`} label="Тренировка · 100 слов" icon="🔁" className="col-span-2" />
        <ActionButton to={`/quiz${sentenceSuffix}`} label="Собери предложение" icon="🧩" className="col-span-2" />
        <ActionButton to="/proficiency-test" label="Тест на уровень" icon="📋" className="col-span-2" />
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

      {stats && <TimeTable stats={stats} />}

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

        {language ? (
          <>
            <LevelCard summary={summary} />
            <div>
              <h3 className="text-xs text-neutral-500 mb-2">Личные рекорды</h3>
              <RecordsWidget summary={summary} />
            </div>
          </>
        ) : (
          <LevelRecordsCompare compare={compareSummary} />
        )}

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
          <ProblemCards cards={problemCards} onChange={() => api.getProblemCards(language || undefined).then(setProblemCards).catch(() => {})} />
        </div>
      </div>
    </div>
  );
}

// "Все" tab: two mini level/records blocks side by side instead of one
// number that used to silently mix both languages.
function LevelRecordsCompare({ compare }) {
  if (!compare) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {['kz', 'en'].map((lang) => (
        <div key={lang} className="space-y-2">
          <div className="text-xs text-neutral-500 text-center">{LANGUAGE_LABEL[lang]}</div>
          <LevelCard summary={compare[lang]} />
          <RecordsCompact summary={compare[lang]} />
        </div>
      ))}
    </div>
  );
}

function RecordsCompact({ summary }) {
  if (!summary) return null;
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-center text-[11px] text-neutral-400 space-y-0.5">
      <div>Streak: {summary.longest_streak} дн.</div>
      <div>Карточек/день: {summary.best_day_cards}</div>
    </div>
  );
}

// "Все" tab: both languages' quests stacked with labels, rather than
// dropping quests entirely -- goals are short enough that two sets
// aren't much more cluttered than one.
function QuestsCompare({ compare }) {
  if (!compare) return <p className="text-sm text-neutral-500">Загрузка…</p>;

  return (
    <div className="space-y-4">
      {['kz', 'en'].map((lang) => (
        <div key={lang}>
          <div className="text-xs text-neutral-500 mb-2">{LANGUAGE_LABEL[lang]}</div>
          <QuestsWidget quests={compare[lang]} />
        </div>
      ))}
    </div>
  );
}

// One compact table instead of 9 separate StatCards -- rows are
// languages (kz/en/combined), columns are periods, with a small header
// row instead of a label per number.
function TimeTable({ stats }) {
  const rows = [
    { label: 'Казахский', minutes: stats.minutes_by_language.kz },
    { label: 'English', minutes: stats.minutes_by_language.en },
    {
      label: 'Всего*',
      minutes: { today: stats.total_minutes_today, this_week: stats.total_minutes_this_week, all_time: stats.total_minutes_all_time }
    }
  ];

  return (
    <div>
      <h2 className="text-sm text-neutral-400 mb-2">Время</h2>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="grid grid-cols-4 text-[11px] text-neutral-500 px-3 py-2 border-b border-neutral-800">
          <span></span>
          <span className="text-right">Сегодня</span>
          <span className="text-right">Неделя</span>
          <span className="text-right">Всего</span>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-4 text-sm px-3 py-2 border-b border-neutral-800 last:border-0">
            <span className="text-neutral-300">{row.label}</span>
            <span className="text-right">{formatMinutes(row.minutes.today)}</span>
            <span className="text-right">{formatMinutes(row.minutes.this_week)}</span>
            <span className="text-right">{formatMinutes(row.minutes.all_time)}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-600 mt-1">* включает сессии без выбранного языка</p>
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
