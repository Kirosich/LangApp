// Aggregates existing progress signals into one summary, meant to be
// pasted into a conversation with an AI (Claude, ChatGPT, whatever) to
// ask for personalized study advice. Not an AI integration itself --
// just a single place to read "where am I weak/strong" instead of
// piecing it together from five different endpoints. No new source of
// truth: every number here is already computed elsewhere (leech
// detection, topics-breakdown, accuracy trends, streak) and just
// reassembled here.
import { Router } from 'express';
import { db } from '../db/index.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';
import { LEECH_CONDITION_SQL, LEECH_ORDER_SQL, accuracyTrendFor } from './gamification.js';
import { computeStreak } from '../db/streak.js';
import { sumMinutes } from './stats.js';

export const coachingRouter = Router();

function levelProgressFor(language) {
  return db
    .prepare(
      `SELECT c.level,
              COUNT(*) AS total_cards,
              SUM(CASE WHEN ${LEARNED_CONDITION_SQL} THEN 1 ELSE 0 END) AS learned_cards
       FROM cards c
       LEFT JOIN progress p ON p.card_id = c.id
       WHERE c.language = ? AND c.level IS NOT NULL
       GROUP BY c.level
       ORDER BY CASE c.level WHEN 'A1' THEN 1 WHEN 'A2' THEN 2 WHEN 'B1' THEN 3 WHEN 'B2' THEN 4 WHEN 'C1' THEN 5 ELSE 6 END`
    )
    .all(language);
}

function weakThemesFor(language, limit = 5) {
  return db
    .prepare(
      `SELECT c.theme,
              COUNT(*) AS total_cards,
              SUM(CASE WHEN ${LEARNED_CONDITION_SQL} THEN 1 ELSE 0 END) AS learned_cards,
              ROUND(100.0 * SUM(CASE WHEN ${LEARNED_CONDITION_SQL} THEN 1 ELSE 0 END) / COUNT(*)) AS learned_percent
       FROM cards c
       LEFT JOIN progress p ON p.card_id = c.id
       WHERE c.language = ? AND c.status != 'backlog'
       GROUP BY c.theme
       HAVING total_cards >= 3
       ORDER BY learned_percent ASC
       LIMIT ?`
    )
    .all(language, limit);
}

function problemCardsFor(language, limit = 10) {
  return db
    .prepare(
      `SELECT c.term, c.translation_ru, c.theme, c.level, p.easiness_factor, p.fsrs_difficulty
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       WHERE c.language = ?
         AND (p.last_reviewed IS NOT NULL OR p.fsrs_last_review IS NOT NULL)
         AND c.mastered_at IS NULL AND ${LEECH_CONDITION_SQL}
       ORDER BY ${LEECH_ORDER_SQL}
       LIMIT ?`
    )
    .all(language, limit);
}

function recentAccuracy(sessionTypes, weeks = 4) {
  const trend = accuracyTrendFor(sessionTypes);
  return trend.slice(-weeks);
}

coachingRouter.get('/summary', (req, res) => {
  const { language } = req.query;
  const languages = language ? [language] : ['kz', 'en'];
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  res.json({
    generated_at: new Date().toISOString(),
    streak_days: computeStreak(db),
    minutes_this_week: sumMinutes('AND date(started_at) >= ?', [weekAgo]),
    reading_vs_listening_accuracy_last_4_weeks: {
      reading: recentAccuracy(['quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence']),
      listening: recentAccuracy(['quiz_listening'])
    },
    by_language: languages.map((lang) => ({
      language: lang,
      level_progress: levelProgressFor(lang),
      weakest_themes: weakThemesFor(lang),
      problem_cards: problemCardsFor(lang)
    }))
  });
});
