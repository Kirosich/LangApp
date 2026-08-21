import { Router } from 'express';
import { db } from '../db/index.js';
import { sumMinutes } from './stats.js';
import { mondayOf, weekTotals } from './gamification.js';

export const questsRouter = Router();

// Quests are computed on the fly from study_sessions/cards/xp_events --
// the same tables and aggregate patterns every other stats endpoint
// already uses (weekTotals, sumMinutes). No new progress-tracking table:
// there's nothing to get out of sync, and nothing to migrate later.
const DAILY_CARDS_GOAL = 15;
const DAILY_MINUTES_GOAL = 15;
const WEEKLY_DAYS_GOAL = 5;
const WEEKLY_CARDS_GOAL = 80;
const WEEKLY_WORDS_GOAL = 10;

function quest(code, title, progress, goal) {
  return { code, title, progress: Math.min(progress, goal), goal, done: progress >= goal };
}

questsRouter.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const thisWeekMonday = mondayOf(today);

  const cardsToday = db
    .prepare(`SELECT COALESCE(SUM(cards_reviewed), 0) AS c FROM study_sessions WHERE ended_at IS NOT NULL AND date(started_at) = ?`)
    .get(today).c;
  const minutesToday = sumMinutes('AND date(started_at) = ?', [today]);
  const sessionsToday = db
    .prepare(`SELECT COUNT(*) AS c FROM study_sessions WHERE ended_at IS NOT NULL AND date(started_at) = ?`)
    .get(today).c;

  const week = weekTotals(db, thisWeekMonday, today);
  const cardsThisWeek = db
    .prepare(`SELECT COALESCE(SUM(cards_reviewed), 0) AS c FROM study_sessions WHERE ended_at IS NOT NULL AND date(started_at) BETWEEN ? AND ?`)
    .get(thisWeekMonday, today).c;
  const daysActiveThisWeek = db
    .prepare(`SELECT COUNT(DISTINCT date(started_at)) AS c FROM study_sessions WHERE ended_at IS NOT NULL AND date(started_at) BETWEEN ? AND ?`)
    .get(thisWeekMonday, today).c;

  res.json({
    daily: [
      quest('daily_cards', `Повторить ${DAILY_CARDS_GOAL} карточек сегодня`, cardsToday, DAILY_CARDS_GOAL),
      quest('daily_minutes', `Позаниматься ${DAILY_MINUTES_GOAL} минут сегодня`, minutesToday, DAILY_MINUTES_GOAL),
      quest('daily_session', 'Завершить хотя бы одно занятие сегодня', sessionsToday, 1)
    ],
    weekly: [
      quest('weekly_days', `Заниматься ${WEEKLY_DAYS_GOAL} дней на этой неделе`, daysActiveThisWeek, WEEKLY_DAYS_GOAL),
      quest('weekly_cards', `Повторить ${WEEKLY_CARDS_GOAL} карточек на этой неделе`, cardsThisWeek, WEEKLY_CARDS_GOAL),
      quest('weekly_words', `Выучить ${WEEKLY_WORDS_GOAL} новых слов на этой неделе`, week.words_learned, WEEKLY_WORDS_GOAL)
    ]
  });
});
