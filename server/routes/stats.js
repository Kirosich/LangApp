import { Router } from 'express';
import { db } from '../db/index.js';

export const statsRouter = Router();

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function computeStreak() {
  const rows = db.prepare('SELECT DISTINCT reviewed_at FROM review_log ORDER BY reviewed_at DESC').all();
  const days = new Set(rows.map((r) => r.reviewed_at));

  const today = new Date().toISOString().slice(0, 10);
  let cursor = today;

  if (!days.has(cursor)) {
    cursor = addDays(today, -1);
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

statsRouter.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const totalCards = db.prepare('SELECT COUNT(*) AS count FROM cards').get().count;
  const dueToday = db.prepare('SELECT COUNT(*) AS count FROM progress WHERE due_date <= ?').get(today).count;
  const byTheme = db
    .prepare('SELECT theme, COUNT(*) AS count FROM cards GROUP BY theme ORDER BY count DESC')
    .all();

  res.json({
    total_cards: totalCards,
    due_today: dueToday,
    streak_days: computeStreak(),
    by_theme: byTheme
  });
});
