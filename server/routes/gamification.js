import { Router } from 'express';
import { db } from '../db/index.js';
import { xpThresholdForLevel, xpToNextLevel, progressPercentToNextLevel } from '../xp/calculate.js';
import { levelName } from '../xp/levelNames.js';
import { BADGE_DEFINITIONS } from '../gamification/badgeDefinitions.js';
import { milestoneForTheme, UNLOCK_THRESHOLD_PERCENT } from '../config/milestones.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';

export const gamificationRouter = Router();

export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// language omitted -> exact old behavior, reading the app-wide
// user_stats(id=1) row and every badge regardless of language. Passed
// -> reads user_stats_by_language instead, and badges scoped to that
// language OR language-independent ones (night_owl, marathon_30min,
// and any legacy pre-migration badge -- see migrate.js's
// ensureBadgesAllowPerLanguage for why those exist).
gamificationRouter.get('/summary', (req, res) => {
  const { language } = req.query;
  const stats = language
    ? db.prepare('SELECT * FROM user_stats_by_language WHERE language = ?').get(language)
    : db.prepare('SELECT * FROM user_stats WHERE id = 1').get();
  const badges = language
    ? db.prepare('SELECT code, earned_at FROM badges WHERE language = ? OR language IS NULL ORDER BY earned_at DESC').all(language)
    : db.prepare('SELECT code, earned_at FROM badges ORDER BY earned_at DESC').all();

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
  const { language } = req.query;
  const earned = language
    ? db.prepare('SELECT code, earned_at FROM badges WHERE language = ? OR language IS NULL').all(language)
    : db.prepare('SELECT code, earned_at FROM badges').all();
  const earnedMap = new Map(earned.map((b) => [b.code, b.earned_at]));

  res.json(
    BADGE_DEFINITIONS.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.code),
      earned_at: earnedMap.get(badge.code) ?? null
    }))
  );
});

// Shared by both accuracy-trend endpoints below -- callers pass which
// session_types to fold into the weekly average. Kept as two separate
// routes/charts rather than one merged one: reading/typing/matching a
// word and *hearing* it are different skills, so their accuracy numbers
// stay on separate lines instead of diluting each other.
export function accuracyTrendFor(sessionTypes) {
  const placeholders = sessionTypes.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT strftime('%Y-%W', started_at) AS week,
              MIN(date(started_at)) AS week_start,
              SUM(correct_count) AS correct,
              SUM(cards_reviewed) AS total
       FROM study_sessions
       WHERE ended_at IS NOT NULL AND correct_count IS NOT NULL AND session_type IN (${placeholders})
       GROUP BY week
       ORDER BY week ASC`
    )
    .all(...sessionTypes);

  return rows.map((r) => ({
    week_start: r.week_start,
    accuracy_percent: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
    total_questions: r.total
  }));
}

gamificationRouter.get('/accuracy-trend', (req, res) => {
  res.json(accuracyTrendFor(['quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence']));
});

gamificationRouter.get('/listening-accuracy-trend', (req, res) => {
  res.json(accuracyTrendFor(['quiz_listening']));
});

// "Leeches" in the Anki sense: cards that keep getting forgotten. There's
// no per-review history table (review_log was dropped), so easiness_factor
// itself is the signal -- it only drops on a forgotten review (quality < 3,
// srs/sm2.js), floor 1.3. A meaningfully depressed EF after at least one
// real review is as close to "repeat offender" as the current schema can
// tell without adding a parallel lapse-count log.
export const LEECH_EF_THRESHOLD = 2.0;
// FSRS difficulty is 1 (easiest) .. 10 (hardest) -- the equivalent
// "struggling" signal for anything reviewed after the FSRS switch
// (Stage D), since easiness_factor freezes the moment a card's first
// FSRS-driven review happens.
export const FSRS_LEECH_DIFFICULTY_THRESHOLD = 7;
// Either signal counts as a leech. Cards untouched by FSRS have
// fsrs_difficulty NULL, so that half of the OR is simply false for them
// -- no special-casing needed.
export const LEECH_CONDITION_SQL = `(p.easiness_factor <= ${LEECH_EF_THRESHOLD} OR p.fsrs_difficulty >= ${FSRS_LEECH_DIFFICULTY_THRESHOLD})`;
// FSRS-tracked difficult cards first (worst difficulty first), then
// EF-only legacy leeches after. Two incompatible scales (low EF vs high
// difficulty = bad) so they can't share one ORDER BY column directly.
export const LEECH_ORDER_SQL = `(CASE WHEN p.fsrs_difficulty IS NOT NULL THEN 1 ELSE 0 END) DESC, p.fsrs_difficulty DESC, p.easiness_factor ASC`;

gamificationRouter.get('/problem-cards', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed, p.fsrs_difficulty
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       WHERE (p.last_reviewed IS NOT NULL OR p.fsrs_last_review IS NOT NULL)
         AND c.mastered_at IS NULL AND ${LEECH_CONDITION_SQL}
       ORDER BY ${LEECH_ORDER_SQL}
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
      repetitions: r.repetitions,
      fsrs_difficulty: r.fsrs_difficulty
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
  // date() normalizes both formats to plain 'YYYY-MM-DD' -- fsrs_last_review
  // is a full ISO timestamp, last_reviewed/mastered_at are already dates.
  // Prefer fsrs_last_review (set for anything reviewed after the FSRS
  // switch); fall back to the frozen SM-2 column for cards last touched
  // before it.
  const dateExpr = `date(COALESCE(p.fsrs_last_review, p.last_reviewed, c.mastered_at))`;
  const rows = db
    .prepare(
      `SELECT ${dateExpr} AS date
       FROM cards c
       LEFT JOIN progress p ON p.card_id = c.id
       WHERE ${LEARNED_CONDITION_SQL} AND ${dateExpr} IS NOT NULL
       ORDER BY date ASC`
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
              SUM(CASE WHEN ${LEARNED_CONDITION_SQL} THEN 1 ELSE 0 END) AS learned_cards
       FROM cards c
       LEFT JOIN progress p ON p.card_id = c.id
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
              SUM(CASE WHEN ${LEARNED_CONDITION_SQL} THEN 1 ELSE 0 END) AS learned_cards
       FROM cards c
       LEFT JOIN progress p ON p.card_id = c.id
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

export function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

// language omitted -> exact old behavior (mixed). Passed -> minutes and
// words_learned are scoped (study_sessions.language and cards.language
// respectively, both real per-row facts); `xp` stays app-wide always --
// xp_events has no card/session/language link at all (just amount +
// timestamp), so it can't be split by language, not even going forward
// without changing what gets logged there.
export function weekTotals(db, startDate, endDate, language) {
  const sessionLangClause = language ? 'AND language = ?' : '';
  const sessionLangParam = language ? [language] : [];
  const cardLangClause = language ? 'AND c.language = ?' : '';
  const cardLangParam = language ? [language] : [];

  const minutes = db
    .prepare(
      `SELECT COALESCE(SUM((julianday(ended_at) - julianday(started_at)) * 24 * 60), 0) AS minutes
       FROM study_sessions
       WHERE ended_at IS NOT NULL AND date(started_at) BETWEEN ? AND ? ${sessionLangClause}`
    )
    .get(startDate, endDate, ...sessionLangParam).minutes;

  const wordsLearned = db
    .prepare(
      `SELECT COUNT(*) AS count FROM (
         SELECT c.id FROM cards c JOIN progress p ON p.card_id = c.id
         WHERE p.repetitions >= 2 AND p.easiness_factor >= 2.5 AND p.last_reviewed BETWEEN ? AND ? ${cardLangClause}
         UNION
         SELECT c.id FROM cards c JOIN progress p ON p.card_id = c.id
         WHERE p.fsrs_state = 'Review' AND p.fsrs_reps >= 2 AND date(p.fsrs_last_review) BETWEEN ? AND ? ${cardLangClause}
         UNION
         SELECT c.id FROM cards c
         WHERE c.mastered_at IS NOT NULL AND date(c.mastered_at) BETWEEN ? AND ? ${cardLangClause}
       )`
    )
    .get(
      startDate,
      endDate,
      ...cardLangParam,
      startDate,
      endDate,
      ...cardLangParam,
      startDate,
      endDate,
      ...cardLangParam
    ).count;

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
