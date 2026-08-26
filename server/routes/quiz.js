import { Router } from 'express';
import { db } from '../db/index.js';
import { shuffle } from '../utils/shuffle.js';

export const quizRouter = Router();

const VALID_TYPES = new Set(['choice', 'typing', 'matching', 'sentence', 'listening']);

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

function selectQuizCards({ theme, language, count, includeMastered }) {
  // fsrs_due NULL means "never reviewed since the FSRS switch (Stage D)"
  // -- stays immediately reviewable, same as due_date used to default
  // to today.
  const now = new Date().toISOString();
  const { clause, params } = buildFilterClause(theme, language);
  const masteredClause = includeMastered ? '' : 'AND c.mastered_at IS NULL';

  const due = db
    .prepare(
      `SELECT c.* FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE (p.fsrs_due IS NULL OR p.fsrs_due <= ?) ${masteredClause} ${clause}
       ORDER BY COALESCE(p.fsrs_due, ?) ASC LIMIT ?`
    )
    .all(now, ...params, now, count);

  if (due.length >= count) return due;

  const excludeIds = due.map((c) => c.id);
  const placeholders = excludeIds.length ? excludeIds.map(() => '?').join(',') : null;
  const excludeClause = placeholders ? `AND c.id NOT IN (${placeholders})` : '';

  const filler = db
    .prepare(
      `SELECT c.* FROM cards c
       WHERE c.status = 'active' ${masteredClause} ${clause} ${excludeClause}
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

// "Собери предложение": only cards with a real example sentence, never
// from the backlog, and (unless includeMastered) never mastered --
// "уже знаю" cards are excluded from all quizzes by default, see
// cardsRouter POST /:id/master.
function selectSentenceCards({ theme, language, count, includeMastered }) {
  const { clause, params } = buildFilterClause(theme, language);
  const masteredClause = includeMastered ? '' : 'AND c.mastered_at IS NULL';
  return db
    .prepare(
      `SELECT c.* FROM cards c
       WHERE c.status = 'active' ${masteredClause} AND c.example_sentence IS NOT NULL
         AND instr(trim(c.example_sentence), ' ') > 0 ${clause}
       ORDER BY RANDOM() LIMIT ?`
    )
    .all(...params, count);
}

function buildSentenceQuestions(cards) {
  return cards.map((card) => {
    // Splitting on whitespace keeps punctuation glued to its word
    // (e.g. "Bread," "wait!") instead of turning it into a separate tile.
    const words = card.example_sentence.trim().split(/\s+/);
    const tokens = words.map((text, position) => ({ id: position, text }));

    return {
      card_id: card.id,
      language: card.language,
      theme: card.theme,
      term: card.term,
      translation_ru: card.translation_ru,
      sentence: card.example_sentence,
      word_count: tokens.length,
      words: shuffle(tokens)
    };
  });
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
  const includeMastered = req.query.includeMastered === 'true' || req.query.includeMastered === '1';

  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
  }

  if (type === 'sentence') {
    const sentenceCards = selectSentenceCards({ theme, language, count, includeMastered });
    return res.json({ type, questions: buildSentenceQuestions(sentenceCards) });
  }

  const cards = selectQuizCards({ theme, language, count, includeMastered });

  if (cards.length === 0) {
    return res.json({ type, questions: [] });
  }

  if (type === 'choice' || type === 'listening') {
    // Listening reuses the exact same question shape as choice (term +
    // translation options) -- the only difference is client-side: the
    // term is spoken via TTS instead of shown as text until answered.
    return res.json({ type, questions: buildChoiceQuestions(cards) });
  }
  if (type === 'typing') {
    return res.json({ type, questions: buildTypingQuestions(cards) });
  }
  return res.json({ type, rounds: buildMatchingRounds(cards) });
});
