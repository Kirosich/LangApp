import { Router } from 'express';
import { db } from '../db/index.js';
import { shuffle } from '../utils/shuffle.js';

export const quizRouter = Router();

const VALID_TYPES = new Set(['choice', 'typing', 'matching']);

function buildFilterClause(theme, language, alias = 'c') {
  const conditions = [];
  const params = [];
  if (theme) {
    conditions.push(`${alias}.theme = ?`);
    params.push(theme);
  }
  if (language) {
    conditions.push(`${alias}.language = ?`);
    params.push(language);
  }
  return { clause: conditions.length ? `AND ${conditions.join(' AND ')}` : '', params };
}

function selectQuizCards({ theme, language, count }) {
  const today = new Date().toISOString().slice(0, 10);
  const { clause, params } = buildFilterClause(theme, language);

  const due = db
    .prepare(
      `SELECT c.* FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE p.due_date <= ? AND c.mastered_at IS NULL ${clause} ORDER BY p.due_date ASC LIMIT ?`
    )
    .all(today, ...params, count);

  if (due.length >= count) return due;

  const excludeIds = due.map((c) => c.id);
  const placeholders = excludeIds.length ? excludeIds.map(() => '?').join(',') : null;
  const excludeClause = placeholders ? `AND c.id NOT IN (${placeholders})` : '';

  const filler = db
    .prepare(
      `SELECT c.* FROM cards c
       WHERE c.status = 'active' AND c.mastered_at IS NULL ${clause} ${excludeClause}
       ORDER BY RANDOM() LIMIT ?`
    )
    .all(...params, ...excludeIds, count - due.length);

  return [...due, ...filler];
}

function buildChoiceQuestions(cards) {
  const allCards = db.prepare('SELECT id, language, translation_ru FROM cards').all();

  return cards.map((card) => {
    const distractorPool = allCards.filter((c) => c.id !== card.id && c.language === card.language);
    const pool = distractorPool.length >= 3 ? distractorPool : allCards.filter((c) => c.id !== card.id);
    const distractors = shuffle(pool).slice(0, 3).map((c) => c.translation_ru);
    const options = shuffle([card.translation_ru, ...distractors]);

    return {
      card_id: card.id,
      language: card.language,
      term: card.term,
      theme: card.theme,
      options,
      correct_answer: card.translation_ru
    };
  });
}

function buildTypingQuestions(cards) {
  return cards.map((card) => ({
    card_id: card.id,
    language: card.language,
    term: card.term,
    transcription: card.transcription,
    theme: card.theme,
    expected_answer: card.translation_ru
  }));
}

function buildMatchingRounds(cards) {
  const rounds = [];
  for (let i = 0; i < cards.length; i += 6) {
    const chunk = cards.slice(i, i + 6);
    if (chunk.length < 2) continue; // not enough pairs to make a matching round
    rounds.push(
      chunk.map((card) => ({
        card_id: card.id,
        term: card.term,
        translation_ru: card.translation_ru
      }))
    );
  }
  return rounds;
}

quizRouter.get('/', (req, res) => {
  const { type = 'choice', theme, language } = req.query;
  const count = Math.min(Math.max(parseInt(req.query.count, 10) || 10, 1), 50);

  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
  }

  const cards = selectQuizCards({ theme, language, count });

  if (cards.length === 0) {
    return res.json({ type, questions: [] });
  }

  if (type === 'choice') {
    return res.json({ type, questions: buildChoiceQuestions(cards) });
  }
  if (type === 'typing') {
    return res.json({ type, questions: buildTypingQuestions(cards) });
  }
  return res.json({ type, rounds: buildMatchingRounds(cards) });
});
