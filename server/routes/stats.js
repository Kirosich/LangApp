import { Router } from 'express';
import { db } from '../db/index.js';
import { computeStreak } from '../db/streak.js';

export const statsRouter = Router();

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function sumMinutes(whereClause, params = []) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM((julianday(ended_at) - julianday(started_at)) * 24 * 60), 0) AS minutes
       FROM study_sessions
       WHERE ended_at IS NOT NULL ${whereClause}`
    )
    .get(...params);
  return Math.round(row.minutes);
}

statsRouter.get('/', (req, res) => {
  const { language } = req.query;
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = addDays(today, -6);

  const cardConditions = [];
  const cardParams = [];
  if (language) {
    cardConditions.push('language = ?');
    cardParams.push(language);
  }
  const cardWhere = cardConditions.length ? `WHERE ${cardConditions.join(' AND ')}` : '';

  const totalCards = db.prepare(`SELECT COUNT(*) AS count FROM cards ${cardWhere}`).get(...cardParams).count;

  const dueConditions = ['p.due_date <= ?'];
  const dueParams = [today];
  if (language) {
    dueConditions.push('c.language = ?');
    dueParams.push(language);
  }
  const dueToday = db
    .prepare(`SELECT COUNT(*) AS count FROM progress p JOIN cards c ON c.id = p.card_id WHERE ${dueConditions.join(' AND ')}`)
    .get(...dueParams).count;

  const byTheme = db
    .prepare(`SELECT theme, COUNT(*) AS count FROM cards ${cardWhere} GROUP BY theme ORDER BY count DESC`)
    .all(...cardParams);

  res.json({
    total_cards: totalCards,
    due_today: dueToday,
    streak_days: computeStreak(db),
    by_theme: byTheme,
    total_minutes_today: sumMinutes('AND date(started_at) = ?', [today]),
    total_minutes_this_week: sumMinutes('AND date(started_at) >= ?', [weekAgo]),
    total_minutes_all_time: sumMinutes('')
  });
});
