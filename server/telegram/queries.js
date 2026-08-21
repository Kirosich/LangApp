import { computeStreak } from '../db/streak.js';
import { calculateLevel } from '../xp/calculate.js';
import { levelName } from '../xp/levelNames.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';
import { almatyDayBoundsUtc } from './almatyTime.js';

const LANGUAGES = ['kz', 'en'];

function sessionMinutesBetween(db, start, end) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM((julianday(ended_at) - julianday(started_at)) * 1440), 0) AS minutes
       FROM study_sessions WHERE ended_at IS NOT NULL AND started_at >= ? AND started_at < ?`
    )
    .get(start, end);
  return Math.round(row.minutes);
}

// "Did the user study today" for the evening reminder -- Almaty calendar
// day, per the plan (a session at 23:50 Almaty must count as today even
// if the server's own UTC clock has already rolled to the next day).
export function hadSessionToday(db, date = new Date()) {
  const { start, end } = almatyDayBoundsUtc(date);
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM study_sessions WHERE ended_at IS NOT NULL AND started_at >= ? AND started_at < ?`)
    .get(start, end);
  return row.c > 0;
}

export function getStatsSnapshot(db) {
  const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get();
  const level = calculateLevel(stats.total_xp);

  const learnedRows = db
    .prepare(
      `SELECT c.language, COUNT(*) AS count FROM cards c LEFT JOIN progress p ON p.card_id = c.id
       WHERE ${LEARNED_CONDITION_SQL} GROUP BY c.language`
    )
    .all();
  const learnedByLanguage = Object.fromEntries(LANGUAGES.map((l) => [l, 0]));
  for (const row of learnedRows) learnedByLanguage[row.language] = row.count;

  const today = almatyDayBoundsUtc();
  const weekStart = almatyDayBoundsUtc(new Date(Date.now() - 6 * 86400000)).start;

  return {
    total_xp: stats.total_xp,
    level,
    level_name: levelName(level),
    streak: computeStreak(db),
    learned_by_language: learnedByLanguage,
    minutes_today: sessionMinutesBetween(db, today.start, today.end),
    minutes_week: sessionMinutesBetween(db, weekStart, today.end)
  };
}

// Due count uses the same UTC "today" as the SRS due_date column itself
// (set by srs/sm2.js), not Almaty -- it has to agree with what Study
// actually shows, which is computed against due_date, not wall-clock
// local time.
export function getDueSnapshot(db) {
  const todayUtc = new Date().toISOString().slice(0, 10);

  const dueByLanguage = Object.fromEntries(LANGUAGES.map((l) => [l, 0]));
  const dueRows = db
    .prepare(
      `SELECT c.language, COUNT(*) AS count FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE p.due_date <= ? AND c.mastered_at IS NULL GROUP BY c.language`
    )
    .all(todayUtc);
  for (const row of dueRows) dueByLanguage[row.language] = row.count;

  const newRemainingByLanguage = {};
  for (const lang of LANGUAGES) {
    const perDay = db.prepare('SELECT new_cards_per_day FROM intro_settings WHERE language = ?').get(lang)?.new_cards_per_day ?? 8;
    const introducedToday = db.prepare('SELECT count FROM daily_intro_log WHERE date = ? AND language = ?').get(todayUtc, lang)?.count ?? 0;
    newRemainingByLanguage[lang] = Math.max(perDay - introducedToday, 0);
  }

  return { due_by_language: dueByLanguage, new_remaining_by_language: newRemainingByLanguage };
}

export function getWeeklyRecapSnapshot(db) {
  const now = new Date();
  const weekStart = almatyDayBoundsUtc(new Date(now.getTime() - 6 * 86400000)).start;
  const weekEnd = almatyDayBoundsUtc(now).end;

  const cardsRow = db
    .prepare(
      `SELECT COALESCE(SUM(cards_reviewed), 0) AS cards FROM study_sessions
       WHERE ended_at IS NOT NULL AND started_at >= ? AND started_at < ?`
    )
    .get(weekStart, weekEnd);

  const minutes = sessionMinutesBetween(db, weekStart, weekEnd);

  const daysActiveRow = db
    .prepare(
      `SELECT COUNT(DISTINCT date(started_at)) AS days FROM study_sessions
       WHERE ended_at IS NOT NULL AND started_at >= ? AND started_at < ?`
    )
    .get(weekStart, weekEnd);

  return {
    cards_reviewed: cardsRow.cards,
    minutes,
    days_active: daysActiveRow.days,
    streak: computeStreak(db)
  };
}
