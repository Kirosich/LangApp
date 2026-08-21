import { computeStreak } from '../db/streak.js';
import { isQuizSession } from './badgeDefinitions.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';

function toUtcDate(sqliteDatetime) {
  return new Date(`${sqliteDatetime.replace(' ', 'T')}Z`);
}

function sessionDurationMinutes(session) {
  return (toUtcDate(session.ended_at) - toUtcDate(session.started_at)) / 60000;
}

// language = null for the original app-wide badges (night_owl,
// marathon_30min -- about *when*/*how long*, not *what language*).
// Explicit existence check rather than relying on the UNIQUE(code,
// language) index/INSERT OR IGNORE: SQL treats NULL != NULL in unique
// constraints, so two language=NULL rows for the same code wouldn't
// actually collide there.
function awardBadge(db, code, language, newlyEarned) {
  const existing = language
    ? db.prepare('SELECT id FROM badges WHERE code = ? AND language = ?').get(code, language)
    : db.prepare('SELECT id FROM badges WHERE code = ? AND language IS NULL').get(code);
  if (existing) return;
  db.prepare('INSERT INTO badges (code, language) VALUES (?, ?)').run(code, language ?? null);
  newlyEarned.push(code);
}

function checkBadges(db, session) {
  const newlyEarned = [];

  const streak = computeStreak(db);
  if (streak >= 7) awardBadge(db, 'streak_7', null, newlyEarned);
  if (streak >= 30) awardBadge(db, 'streak_30', null, newlyEarned);

  const learned = db
    .prepare(`SELECT COUNT(*) AS count FROM cards c LEFT JOIN progress p ON p.card_id = c.id WHERE ${LEARNED_CONDITION_SQL}`)
    .get().count;
  if (learned >= 100) awardBadge(db, 'words_100', null, newlyEarned);
  if (learned >= 250) awardBadge(db, 'words_250', null, newlyEarned);

  if (isQuizSession(session.session_type) && session.cards_reviewed > 0 && session.correct_count === session.cards_reviewed) {
    awardBadge(db, 'perfect_quiz', null, newlyEarned);
  }

  const startHourUtc = toUtcDate(session.started_at).getUTCHours();
  if (startHourUtc >= 0 && startHourUtc < 4) awardBadge(db, 'night_owl', null, newlyEarned);

  if (sessionDurationMinutes(session) > 30) awardBadge(db, 'marathon_30min', null, newlyEarned);

  // Per-language versions of the content-based badges, additive
  // alongside the app-wide ones above -- only runs when this session
  // has a known language (see study_sessions.language; sessions from
  // before that column existed, or the mixed "Все" tab, stay
  // unattributed and only feed the app-wide badges).
  if (session.language) {
    const langStreak = computeStreak(db, session.language);
    if (langStreak >= 7) awardBadge(db, 'streak_7', session.language, newlyEarned);
    if (langStreak >= 30) awardBadge(db, 'streak_30', session.language, newlyEarned);

    const langLearned = db
      .prepare(
        `SELECT COUNT(*) AS count FROM cards c LEFT JOIN progress p ON p.card_id = c.id
         WHERE c.language = ? AND ${LEARNED_CONDITION_SQL}`
      )
      .get(session.language).count;
    if (langLearned >= 100) awardBadge(db, 'words_100', session.language, newlyEarned);
    if (langLearned >= 250) awardBadge(db, 'words_250', session.language, newlyEarned);

    if (isQuizSession(session.session_type) && session.cards_reviewed > 0 && session.correct_count === session.cards_reviewed) {
      awardBadge(db, 'perfect_quiz', session.language, newlyEarned);
    }
  }

  return newlyEarned;
}

function updateRecords(db, session) {
  const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get();
  const streak = computeStreak(db);

  const today = new Date().toISOString().slice(0, 10);
  const todayCards = db
    .prepare(`SELECT COALESCE(SUM(cards_reviewed), 0) AS total FROM study_sessions WHERE ended_at IS NOT NULL AND date(started_at) = ?`)
    .get(today).total;

  const sessionMinutes = Math.round(sessionDurationMinutes(session));

  db.prepare('UPDATE user_stats SET longest_streak = ?, best_day_cards = ?, best_session_minutes = ? WHERE id = 1').run(
    Math.max(stats.longest_streak, streak),
    Math.max(stats.best_day_cards, todayCards),
    Math.max(stats.best_session_minutes, sessionMinutes)
  );

  if (!session.language) return;

  const langStats = db.prepare('SELECT * FROM user_stats_by_language WHERE language = ?').get(session.language);
  const langStreak = computeStreak(db, session.language);
  const langTodayCards = db
    .prepare(
      `SELECT COALESCE(SUM(cards_reviewed), 0) AS total FROM study_sessions
       WHERE ended_at IS NOT NULL AND date(started_at) = ? AND language = ?`
    )
    .get(today, session.language).total;

  db.prepare(
    'UPDATE user_stats_by_language SET longest_streak = ?, best_day_cards = ?, best_session_minutes = ? WHERE language = ?'
  ).run(
    Math.max(langStats.longest_streak, langStreak),
    Math.max(langStats.best_day_cards, langTodayCards),
    Math.max(langStats.best_session_minutes, sessionMinutes),
    session.language
  );
}

export function onSessionEnd(db, session) {
  updateRecords(db, session);
  return checkBadges(db, session);
}
