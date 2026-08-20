import { Router } from 'express';
import { db } from '../db/index.js';
import { xpThresholdForLevel, xpToNextLevel, progressPercentToNextLevel } from '../xp/calculate.js';
import { levelName } from '../xp/levelNames.js';
import { BADGE_DEFINITIONS } from '../gamification/badgeDefinitions.js';
import { milestoneForTheme, UNLOCK_THRESHOLD_PERCENT } from '../config/milestones.js';

export const gamificationRouter = Router();

const LEARNED_CONDITION = 'p.repetitions >= 2 AND p.easiness_factor >= 2.5';

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

gamificationRouter.get('/summary', (req, res) => {
  const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get();
  const badges = db.prepare('SELECT code, earned_at FROM badges ORDER BY earned_at DESC').all();

  res.json({
    total_xp: stats.total_xp,
    current_level: stats.current_level,
    level_name: levelName(stats.current_level),
    xp_to_next_level: xpToNextLevel(stats.total_xp),
    progress_percent_to_next_level: progressPercentToNextLevel(stats.total_xp),
    next_level_threshold: xpThresholdForLevel(stats.current_level + 1),
    longest_streak: stats.longest_streak,
    best_day_cards: stats.best_day_cards,
    best_session_minutes: stats.best_session_minutes,
    badges
  });
});

gamificationRouter.get('/badges', (req, res) => {
  const earned = db.prepare('SELECT code, earned_at FROM badges').all();
  const earnedMap = new Map(earned.map((b) => [b.code, b.earned_at]));

  res.json(
    BADGE_DEFINITIONS.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.code),
      earned_at: earnedMap.get(badge.code) ?? null
    }))
  );
});

gamificationRouter.get('/accuracy-trend', (req, res) => {
  const rows = db
    .prepare(
      `SELECT strftime('%Y-%W', started_at) AS week,
              MIN(date(started_at)) AS week_start,
              SUM(correct_count) AS correct,
              SUM(cards_reviewed) AS total
       FROM study_sessions
       WHERE ended_at IS NOT NULL AND correct_count IS NOT NULL AND session_type IN ('quiz_choice', 'quiz_typing', 'quiz_matching')
       GROUP BY week
       ORDER BY week ASC`
    )
    .all();

  res.json(
    rows.map((r) => ({
      week_start: r.week_start,
      accuracy_percent: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
      total_questions: r.total
    }))
  );
});

gamificationRouter.get('/problem-cards', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       WHERE p.last_reviewed IS NOT NULL
       ORDER BY p.easiness_factor ASC
       LIMIT 5`
    )
    .all();

  res.json(
    rows.map((r) => ({
      id: r.id,
      language: r.language,
      term: r.term,
      translation_ru: r.translation_ru,
      theme: r.theme,
      easiness_factor: r.easiness_factor,
      repetitions: r.repetitions
    }))
  );
});

gamificationRouter.get('/heatmap', (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 90, 1), 365);
  const today = new Date().toISOString().slice(0, 10);
  const startDate = addDays(today, -(days - 1));

  const rows = db
    .prepare(
      `SELECT date(started_at) AS date,
              SUM(cards_reviewed) AS cards_reviewed,
              COALESCE(SUM((julianday(ended_at) - julianday(started_at)) * 24 * 60), 0) AS minutes
       FROM study_sessions
       WHERE ended_at IS NOT NULL AND date(started_at) >= ?
       GROUP BY date(started_at)`
    )
    .all(startDate);

  const byDate = new Map(rows.map((r) => [r.date, { cards_reviewed: r.cards_reviewed, minutes: Math.round(r.minutes) }]));

  const result = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const entry = byDate.get(date);
    result.push({ date, cards_reviewed: entry?.cards_reviewed ?? 0, minutes: entry?.minutes ?? 0 });
  }

  res.json(result);
});

gamificationRouter.get('/cumulative', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.last_reviewed AS date
       FROM progress p
       WHERE ${LEARNED_CONDITION} AND p.last_reviewed IS NOT NULL
       ORDER BY p.last_reviewed ASC`
    )
    .all();

  const result = [];
  let cumulative = 0;
  for (const row of rows) {
    cumulative += 1;
    const last = result[result.length - 1];
    if (last && last.date === row.date) {
      last.total_words_learned = cumulative;
    } else {
      result.push({ date: row.date, total_words_learned: cumulative });
    }
  }

  res.json(result);
});

gamificationRouter.get('/topics-breakdown', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.theme,
              COUNT(*) AS total_cards,
              SUM(CASE WHEN ${LEARNED_CONDITION} THEN 1 ELSE 0 END) AS learned_cards
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       GROUP BY c.theme
       ORDER BY total_cards DESC`
    )
    .all();

  res.json(rows);
});

gamificationRouter.get('/milestones', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.theme,
              COUNT(*) AS total_cards,
              SUM(CASE WHEN ${LEARNED_CONDITION} THEN 1 ELSE 0 END) AS learned_cards
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       GROUP BY c.theme
       ORDER BY total_cards DESC`
    )
    .all();

  res.json(
    rows.map((r) => {
      const percent = r.total_cards > 0 ? Math.round((r.learned_cards / r.total_cards) * 100) : 0;
      return {
        theme: r.theme,
        total_cards: r.total_cards,
        learned_cards: r.learned_cards,
        percent,
        unlocked: percent >= UNLOCK_THRESHOLD_PERCENT,
        ability: milestoneForTheme(r.theme)
      };
    })
  );
});

function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function weekTotals(db, startDate, endDate) {
  const minutes = db
    .prepare(
      `SELECT COALESCE(SUM((julianday(ended_at) - julianday(started_at)) * 24 * 60), 0) AS minutes
       FROM study_sessions
       WHERE ended_at IS NOT NULL AND date(started_at) BETWEEN ? AND ?`
    )
    .get(startDate, endDate).minutes;

  const wordsLearned = db
    .prepare(
      `SELECT COUNT(*) AS count FROM progress p
       WHERE ${LEARNED_CONDITION} AND p.last_reviewed BETWEEN ? AND ?`
    )
    .get(startDate, endDate).count;

  const xp = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) AS xp FROM xp_events WHERE date(created_at) BETWEEN ? AND ?`)
    .get(startDate, endDate).xp;

  return { minutes: Math.round(minutes), words_learned: wordsLearned, xp };
}

gamificationRouter.get('/weekly-recap', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const thisWeekMonday = mondayOf(today);

  const recentStart = addDays(thisWeekMonday, -7);
  const recentEnd = addDays(thisWeekMonday, -1);
  const previousStart = addDays(thisWeekMonday, -14);
  const previousEnd = addDays(thisWeekMonday, -8);

  res.json({
    recent_week: { start: recentStart, end: recentEnd, ...weekTotals(db, recentStart, recentEnd) },
    previous_week: { start: previousStart, end: previousEnd, ...weekTotals(db, previousStart, previousEnd) }
  });
});
