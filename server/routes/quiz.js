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

function selectQuizCards({ theme, language, count, includeMastered, includeBacklog }) {
  // fsrs_due NULL means "never reviewed since the FSRS switch (Stage D)"
  // -- stays immediately reviewable, same as due_date used to default
  // to today. Backlog cards never have a progress row (see
  // backlog/introduce.js), so this query only ever matches active cards
  // regardless of includeBacklog -- that flag only widens the filler pool.
  const now = new Date().toISOString();
  const { clause, params } = buildFilterClause(theme, language);
  const masteredClause = includeMastered ? '' : 'AND c.mastered_at IS NULL';
  const statusClause = includeBacklog ? "c.status IN ('active', 'backlog')" : "c.status = 'active'";

  // Cap how much of the quiz comes from "due" cards at half the request.
  // Quizzes never advance FSRS scheduling (only Study's rate() does), so
  // a due pool >= count used to hand back the exact same set on every
  // single call -- those cards can't leave "due" through quizzing alone.
  const dueLimit = Math.ceil(count / 2);
  const due = db
    .prepare(
      `SELECT c.* FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE (p.fsrs_due IS NULL OR p.fsrs_due <= ?) ${masteredClause} ${clause}
       ORDER BY COALESCE(p.fsrs_due, ?) ASC LIMIT ?`
    )
    .all(now, ...params, now, dueLimit);

  const excludeIds = due.map((c) => c.id);
  const placeholders = excludeIds.length ? excludeIds.map(() => '?').join(',') : null;
  const excludeClause = placeholders ? `AND c.id NOT IN (${placeholders})` : '';

  const filler = db
    .prepare(
      `SELECT c.* FROM cards c
       WHERE ${statusClause} ${masteredClause} ${clause} ${excludeClause}
       ORDER BY RANDOM() LIMIT ?`
    )
    .all(...params, ...excludeIds, count - due.length);

  const cards = [...due, ...filler];

  // Quiz sessions don't touch FSRS scheduling, so the "due" portion above
  // would otherwise come back in the exact same fsrs_due order every time
  // -- shuffle so repeat quizzes actually feel different.
  return shuffle(cards);
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

// The Russian side of a card sometimes lists multiple accepted answers
// ("вариант1 / вариант2" or "вариант1, вариант2") with a parenthetical
// note, e.g. "идти, ехать (куда-то)". When ru->kz shows that as the
// PROMPT (not just as one of several accepted answers, like the kz->ru
// direction does client-side), it needs to be a single clean phrase.
function primaryRuText(translation) {
  const first = translation
    .replace(/\([^)]*\)/g, '')
    .split(/[,/]/)[0]
    .trim();
  return first || translation;
}

function buildTypingQuestions(cards, direction) {
  if (direction === 'ru_to_lang') {
    return cards.map((card) => ({
      card_id: card.id,
      language: card.language,
      term: primaryRuText(card.translation_ru),
      transcription: null,
      theme: card.theme,
      expected_answer: card.term,
      prompt_language: 'ru'
    }));
  }
  return cards.map((card) => ({
    card_id: card.id,
    language: card.language,
    term: card.term,
    transcription: card.transcription,
    theme: card.theme,
    expected_answer: card.translation_ru,
    prompt_language: card.language
  }));
}

// "Собери предложение": only cards with a real example sentence; backlog
// cards are included only if includeBacklog is set, and (unless
// includeMastered) mastered ("уже знаю") cards are excluded by default,
// see cardsRouter POST /:id/master.
function selectSentenceCards({ theme, language, count, includeMastered, includeBacklog }) {
  const { clause, params } = buildFilterClause(theme, language);
  const masteredClause = includeMastered ? '' : 'AND c.mastered_at IS NULL';
  const statusClause = includeBacklog ? "c.status IN ('active', 'backlog')" : "c.status = 'active'";
  return db
    .prepare(
      `SELECT c.* FROM cards c
       WHERE ${statusClause} ${masteredClause} AND c.example_sentence IS NOT NULL
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
  const includeBacklog = req.query.includeBacklog === 'true' || req.query.includeBacklog === '1';
  const direction = req.query.direction === 'ru_to_lang' ? 'ru_to_lang' : 'lang_to_ru';

  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
  }

  if (type === 'sentence') {
    const sentenceCards = selectSentenceCards({ theme, language, count, includeMastered, includeBacklog });
    return res.json({ type, questions: buildSentenceQuestions(sentenceCards) });
  }

  const cards = selectQuizCards({ theme, language, count, includeMastered, includeBacklog });

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
    return res.json({ type, questions: buildTypingQuestions(cards, direction) });
  }
  return res.json({ type, rounds: buildMatchingRounds(cards) });
});
