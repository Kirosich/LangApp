import { computeStreak } from '../db/streak.js';
import { isQuizSession } from './badgeDefinitions.js';

function toUtcDate(sqliteDatetime) {
  return new Date(`${sqliteDatetime.replace(' ', 'T')}Z`);
}

function sessionDurationMinutes(session) {
  return (toUtcDate(session.ended_at) - toUtcDate(session.started_at)) / 60000;
}

function awardBadge(db, code) {
  db.prepare('INSERT OR IGNORE INTO badges (code) VALUES (?)').run(code);
}

function checkBadges(db, session) {
  const streak = computeStreak(db);
  if (streak >= 7) awardBadge(db, 'streak_7');
  if (streak >= 30) awardBadge(db, 'streak_30');

  const learned = db
    .prepare('SELECT COUNT(*) AS count FROM progress WHERE repetitions >= 2 AND easiness_factor >= 2.5')
    .get().count;
  if (learned >= 100) awardBadge(db, 'words_100');
  if (learned >= 250) awardBadge(db, 'words_250');

  if (isQuizSession(session.session_type) && session.cards_reviewed > 0 && session.correct_count === session.cards_reviewed) {
    awardBadge(db, 'perfect_quiz');
  }

  const startHourUtc = toUtcDate(session.started_at).getUTCHours();
  if (startHourUtc >= 0 && startHourUtc < 4) awardBadge(db, 'night_owl');

  if (sessionDurationMinutes(session) > 30) awardBadge(db, 'marathon_30min');
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
}

export function onSessionEnd(db, session) {
  updateRecords(db, session);
  checkBadges(db, session);
}
