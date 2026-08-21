// "Тест на уровень" -- a broader diagnostic than the grammar-only level
// exam (server/routes/exam.js, unchanged, stays as the narrow 100%
// grammar certification). This test profiles vocabulary + grammar (Этап
// A; listening and writing land in later stages) and reports a verdict
// per section, not just one score, since the whole point is showing
// *where* a level is shaky, not just *whether* it is.
//
// Only 4 fixed test definitions exist. Enforced here at the route layer
// (not a DB CHECK) so a 5th test can be added later without a schema
// change.
import { Router } from 'express';
import { db } from '../db/index.js';
import { shuffle } from '../utils/shuffle.js';
import { isCloseEnough } from '../utils/levenshtein.js';
import { acceptableAnswers } from '../utils/acceptableAnswers.js';
import { poolFor as grammarPoolFor } from './exam.js';

export const proficiencyTestRouter = Router();

const TEST_DEFINITIONS = [
  { language: 'kz', target_level: 'A1' },
  { language: 'kz', target_level: 'A2' },
  { language: 'en', target_level: 'B1' },
  { language: 'en', target_level: 'B2' }
];

const VOCAB_QUESTION_COUNT = 18;
const GRAMMAR_QUESTION_COUNT = 12;
const LISTENING_CHOICE_COUNT = 4;
const LISTENING_DICTATION_COUNT = 4;
const LISTENING_PAIR_COUNT = 3;

function isValidDefinition(language, targetLevel) {
  return TEST_DEFINITIONS.some((d) => d.language === language && d.target_level === targetLevel);
}

function vocabPoolFor(language, level) {
  return db
    .prepare(`SELECT id, term, translation_ru FROM cards WHERE language = ? AND level = ? AND status != 'backlog'`)
    .all(language, level);
}

function buildVocabQuestions(language, level) {
  const pool = vocabPoolFor(language, level);
  if (pool.length === 0) return [];

  const chosen = shuffle(pool).slice(0, Math.min(VOCAB_QUESTION_COUNT, pool.length));
  return chosen.map((card, i) => {
    const type = i % 2 === 0 ? 'choice' : 'typing';
    if (type === 'choice') {
      const distractorPool = pool.filter((c) => c.id !== card.id);
      const distractors = shuffle(distractorPool).slice(0, 3).map((c) => c.translation_ru);
      return { card_id: card.id, term: card.term, type: 'choice', options: shuffle([card.translation_ru, ...distractors]) };
    }
    return { card_id: card.id, term: card.term, type: 'typing' };
  });
}

function buildGrammarQuestions(language, level) {
  const pool = grammarPoolFor(language, level);
  if (pool.length === 0) return [];

  const drawn = shuffle(pool).slice(0, Math.min(GRAMMAR_QUESTION_COUNT, pool.length));
  return drawn.map((d) => ({ drill_id: d.id, prompt: d.prompt, options: shuffle([d.correct_answer, ...JSON.parse(d.distractors)]) }));
}

function scoreVocabAnswers(answers) {
  const cardIds = answers.map((a) => a.card_id);
  const placeholders = cardIds.map(() => '?').join(',');
  const cards = db.prepare(`SELECT id, translation_ru FROM cards WHERE id IN (${placeholders})`).all(...cardIds);
  const byId = new Map(cards.map((c) => [c.id, c.translation_ru]));

  const graded = answers.map((a) => {
    const translationRu = byId.get(a.card_id);
    const correct =
      a.type === 'choice'
        ? a.response === translationRu
        : acceptableAnswers(translationRu ?? '').some((alt) => isCloseEnough(a.response ?? '', alt, 1));
    return { card_id: a.card_id, type: a.type, response: a.response, correct };
  });

  const scorePercent = Math.round((graded.filter((g) => g.correct).length / graded.length) * 100);
  return { scorePercent, details: graded };
}

function scoreGrammarAnswers(answers) {
  const drillIds = answers.map((a) => a.drill_id);
  const placeholders = drillIds.map(() => '?').join(',');
  const drills = db.prepare(`SELECT id, correct_answer FROM theory_drills WHERE id IN (${placeholders})`).all(...drillIds);
  const byId = new Map(drills.map((d) => [d.id, d.correct_answer]));

  const graded = answers.map((a) => ({
    drill_id: a.drill_id,
    response: a.response,
    correct: byId.get(a.drill_id) === a.response
  }));

  const scorePercent = Math.round((graded.filter((g) => g.correct).length / graded.length) * 100);
  return { scorePercent, details: graded };
}

// Listening reuses the same active+mastered card pool as vocabulary,
// just spoken instead of read. Sub-types are mixed into one question
// list (all tagged `subtype`), scored together into one section score
// -- the schema only has one row per section_type per test.
function buildListeningQuestions(language, level) {
  const pool = vocabPoolFor(language, level);
  const questions = [];

  if (pool.length > 0) {
    const choiceCards = shuffle(pool).slice(0, Math.min(LISTENING_CHOICE_COUNT, pool.length));
    for (const card of choiceCards) {
      const distractors = shuffle(pool.filter((c) => c.id !== card.id)).slice(0, 3).map((c) => c.translation_ru);
      questions.push({
        subtype: 'choice',
        card_id: card.id,
        speak: card.term,
        options: shuffle([card.translation_ru, ...distractors])
      });
    }

    // Multi-form terms ("Қалайсың? / Қалайсыз?") are fine for choice --
    // TTS just needs to be recognizable, not typed back -- but they make
    // bad dictation material: spoken aloud, the "/" and second form just
    // sound like confusing extra words, and there's no single "the"
    // spelling to grade against cleanly.
    const usedIds = new Set(choiceCards.map((c) => c.id));
    const dictationPool = pool.filter((c) => !usedIds.has(c.id) && !c.term.includes('/') && !c.term.includes(','));
    const dictationCards = shuffle(dictationPool).slice(0, Math.min(LISTENING_DICTATION_COUNT, dictationPool.length));
    for (const card of dictationCards) {
      questions.push({ subtype: 'dictation', card_id: card.id, speak: card.term });
    }
  }

  const text = shuffle(db.prepare('SELECT * FROM proficiency_listening_texts WHERE language = ? AND level = ?').all(language, level)).at(0);
  if (text) {
    JSON.parse(text.comprehension_questions).forEach((q, i) => {
      questions.push({
        subtype: 'text',
        ref: `${text.id}:${i}`,
        // Only the first text question carries the passage to speak --
        // the client plays it once before showing any of that text's
        // questions.
        speak: i === 0 ? text.body : null,
        prompt: q.prompt,
        options: shuffle([q.correct_answer, ...q.distractors])
      });
    });
  }

  const pairs = shuffle(db.prepare('SELECT * FROM proficiency_minimal_pairs WHERE language = ?').all(language)).slice(0, LISTENING_PAIR_COUNT);
  for (const pair of pairs) {
    const speakA = Math.random() < 0.5;
    questions.push({
      subtype: 'minimal_pair',
      ref: `${pair.id}:${speakA ? 'a' : 'b'}`,
      speak: speakA ? pair.word_a : pair.word_b,
      options: shuffle([pair.word_a, pair.word_b])
    });
  }

  return questions;
}

function scoreListeningAnswers(answers) {
  const cardIds = answers.filter((a) => a.subtype === 'choice' || a.subtype === 'dictation').map((a) => a.card_id);
  const cardsById = new Map();
  if (cardIds.length > 0) {
    const placeholders = cardIds.map(() => '?').join(',');
    for (const c of db.prepare(`SELECT id, term, translation_ru FROM cards WHERE id IN (${placeholders})`).all(...cardIds)) {
      cardsById.set(c.id, c);
    }
  }

  const textRefs = answers.filter((a) => a.subtype === 'text').map((a) => Number(a.ref.split(':')[0]));
  const textsById = new Map();
  if (textRefs.length > 0) {
    const placeholders = [...new Set(textRefs)].map(() => '?').join(',');
    for (const t of db.prepare(`SELECT id, comprehension_questions FROM proficiency_listening_texts WHERE id IN (${placeholders})`).all(...new Set(textRefs))) {
      textsById.set(t.id, JSON.parse(t.comprehension_questions));
    }
  }

  const pairRefs = answers.filter((a) => a.subtype === 'minimal_pair').map((a) => Number(a.ref.split(':')[0]));
  const pairsById = new Map();
  if (pairRefs.length > 0) {
    const placeholders = [...new Set(pairRefs)].map(() => '?').join(',');
    for (const p of db.prepare(`SELECT id, word_a, word_b FROM proficiency_minimal_pairs WHERE id IN (${placeholders})`).all(...new Set(pairRefs))) {
      pairsById.set(p.id, p);
    }
  }

  const graded = answers.map((a) => {
    if (a.subtype === 'choice') {
      const card = cardsById.get(a.card_id);
      return { ...a, correct: card && a.response === card.translation_ru };
    }
    if (a.subtype === 'dictation') {
      const card = cardsById.get(a.card_id);
      return { ...a, correct: Boolean(card) && acceptableAnswers(card.term).some((alt) => isCloseEnough(a.response ?? '', alt, 1)) };
    }
    if (a.subtype === 'text') {
      const [textId, qIndex] = a.ref.split(':');
      const questionsForText = textsById.get(Number(textId));
      const correctAnswer = questionsForText?.[Number(qIndex)]?.correct_answer;
      return { ...a, correct: a.response === correctAnswer };
    }
    // minimal_pair
    const [pairId, key] = a.ref.split(':');
    const pair = pairsById.get(Number(pairId));
    const correctAnswer = pair ? (key === 'a' ? pair.word_a : pair.word_b) : null;
    return { ...a, correct: a.response === correctAnswer };
  });

  const scorePercent = Math.round((graded.filter((g) => g.correct).length / graded.length) * 100);
  return { scorePercent, details: graded };
}

// "прочно" needs every completed section at 85%+; "шатко" needs every
// section at 70%+ (least one below 85%); anything with a section under
// 70% is "не дотягивает" -- the weakest section decides, not the
// average, since the whole point is surfacing where it's shaky.
function verdictFor(sectionScores) {
  if (sectionScores.length === 0) return null;
  const min = Math.min(...sectionScores);
  if (min >= 85) return 'прочно';
  if (min >= 70) return 'шатко';
  return 'не дотягивает';
}

proficiencyTestRouter.get('/', (req, res) => {
  const rows = TEST_DEFINITIONS.map((def) => {
    const last = db
      .prepare(
        `SELECT id, completed_at, overall_verdict FROM proficiency_tests
         WHERE language = ? AND target_level = ? AND completed_at IS NOT NULL
         ORDER BY completed_at DESC LIMIT 1`
      )
      .get(def.language, def.target_level);
    const inProgress = db
      .prepare(
        `SELECT id FROM proficiency_tests WHERE language = ? AND target_level = ? AND completed_at IS NULL ORDER BY started_at DESC LIMIT 1`
      )
      .get(def.language, def.target_level);

    return {
      language: def.language,
      target_level: def.target_level,
      vocab_pool_size: vocabPoolFor(def.language, def.target_level).length,
      grammar_pool_size: grammarPoolFor(def.language, def.target_level).length,
      listening_pool_size: buildListeningQuestions(def.language, def.target_level).length,
      last_result: last ? { test_id: last.id, completed_at: last.completed_at, overall_verdict: last.overall_verdict } : null,
      in_progress_test_id: inProgress?.id ?? null
    };
  });

  res.json(rows);
});

proficiencyTestRouter.post('/', (req, res) => {
  const { language, target_level } = req.body;
  if (!isValidDefinition(language, target_level)) {
    return res.status(400).json({ error: 'Not a valid test definition (kz-A1, kz-A2, en-B1, en-B2 only)' });
  }

  const info = db.prepare('INSERT INTO proficiency_tests (language, target_level) VALUES (?, ?)').run(language, target_level);
  res.status(201).json({ id: info.lastInsertRowid });
});

proficiencyTestRouter.get('/:id', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const sections = db
    .prepare('SELECT section_type, score_percent, skipped, skip_reason FROM proficiency_test_sections WHERE test_id = ?')
    .all(test.id);

  res.json({
    id: test.id,
    language: test.language,
    target_level: test.target_level,
    started_at: test.started_at,
    completed_at: test.completed_at,
    overall_verdict: test.overall_verdict,
    sections
  });
});

proficiencyTestRouter.get('/:id/sections/vocabulary/questions', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const questions = buildVocabQuestions(test.language, test.target_level);
  if (questions.length === 0) return res.status(404).json({ error: 'No vocabulary pool for this level yet' });
  res.json({ questions });
});

proficiencyTestRouter.post('/:id/sections/vocabulary', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ error: 'answers array is required' });

  const { scorePercent, details } = scoreVocabAnswers(answers);
  db.prepare(
    `INSERT INTO proficiency_test_sections (test_id, section_type, score_percent, details) VALUES (?, 'vocabulary', ?, ?)`
  ).run(test.id, scorePercent, JSON.stringify(details));

  res.status(201).json({ score_percent: scorePercent });
});

proficiencyTestRouter.get('/:id/sections/grammar/questions', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const questions = buildGrammarQuestions(test.language, test.target_level);
  if (questions.length === 0) return res.status(404).json({ error: 'No grammar pool for this level yet' });
  res.json({ questions });
});

proficiencyTestRouter.post('/:id/sections/grammar', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ error: 'answers array is required' });

  const { scorePercent, details } = scoreGrammarAnswers(answers);
  db.prepare(
    `INSERT INTO proficiency_test_sections (test_id, section_type, score_percent, details) VALUES (?, 'grammar', ?, ?)`
  ).run(test.id, scorePercent, JSON.stringify(details));

  res.status(201).json({ score_percent: scorePercent });
});

proficiencyTestRouter.get('/:id/sections/listening/questions', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const questions = buildListeningQuestions(test.language, test.target_level);
  if (questions.length === 0) return res.status(404).json({ error: 'No listening material for this level yet' });
  res.json({ questions });
});

proficiencyTestRouter.post('/:id/sections/listening', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ error: 'answers array is required' });

  const { scorePercent, details } = scoreListeningAnswers(answers);
  db.prepare(
    `INSERT INTO proficiency_test_sections (test_id, section_type, score_percent, details) VALUES (?, 'listening', ?, ?)`
  ).run(test.id, scorePercent, JSON.stringify(details));

  res.status(201).json({ score_percent: scorePercent });
});

// The client feature-detects TTS voice availability BEFORE starting the
// listening section (not mid-section) and calls this instead of the
// questions endpoint when there's no voice for the test's language --
// mainly iOS, which has no Kazakh voice in any browser (see CLAUDE.md).
// A skipped section is excluded from the verdict automatically, since
// verdictFor() only looks at non-skipped scores.
proficiencyTestRouter.post('/:id/sections/listening/skip', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const reason = typeof req.body?.reason === 'string' && req.body.reason ? req.body.reason : 'No TTS voice available on this device';
  db.prepare(
    `INSERT INTO proficiency_test_sections (test_id, section_type, skipped, skip_reason) VALUES (?, 'listening', 1, ?)`
  ).run(test.id, reason);

  res.status(201).json({ skipped: true, reason });
});

proficiencyTestRouter.post('/:id/complete', (req, res) => {
  const test = db.prepare('SELECT * FROM proficiency_tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const sections = db
    .prepare('SELECT section_type, score_percent, skipped FROM proficiency_test_sections WHERE test_id = ?')
    .all(test.id);
  const countedScores = sections.filter((s) => !s.skipped && s.score_percent !== null).map((s) => s.score_percent);
  const verdict = verdictFor(countedScores);

  db.prepare(`UPDATE proficiency_tests SET completed_at = datetime('now'), overall_verdict = ? WHERE id = ?`).run(verdict, test.id);

  res.json({ id: test.id, overall_verdict: verdict, sections });
});
