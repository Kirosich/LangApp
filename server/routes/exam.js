// "Level exam": prove mastery of a CEFR level by answering every one of
// up to 50 randomly-drawn drill questions correctly (no partial credit
// -- 100% or it doesn't count). The pool is just "all drills belonging
// to topics at that language+level" -- no separate question bank, so it
// grows automatically as more topics/drills get added over time. When
// the pool has fewer than 50, the exam uses whatever's there; there's
// no artificial minimum beyond "at least one topic with drills exists".
import { Router } from 'express';
import { db } from '../db/index.js';
import { shuffle } from '../utils/shuffle.js';

export const examRouter = Router();

const EXAM_SIZE = 50;

export function poolFor(language, level) {
  return db
    .prepare(
      `SELECT d.id, d.prompt, d.correct_answer, d.distractors
       FROM theory_drills d
       JOIN theory_topics t ON t.id = d.topic_id
       WHERE t.language = ? AND t.level = ?`
    )
    .all(language, level);
}

examRouter.get('/levels', (req, res) => {
  const { language } = req.query;
  if (language !== 'kz' && language !== 'en') {
    return res.status(400).json({ error: 'language must be kz or en' });
  }

  const pools = db
    .prepare(
      `SELECT t.level, COUNT(d.id) AS pool_size
       FROM theory_topics t
       JOIN theory_drills d ON d.topic_id = t.id
       WHERE t.language = ?
       GROUP BY t.level`
    )
    .all(language);

  const best = db
    .prepare(
      `SELECT level, MAX(passed) AS passed, COUNT(*) AS attempts
       FROM level_exam_attempts
       WHERE language = ?
       GROUP BY level`
    )
    .all(language);
  const bestByLevel = new Map(best.map((b) => [b.level, b]));

  res.json(
    pools.map((p) => ({
      level: p.level,
      pool_size: p.pool_size,
      exam_size: Math.min(EXAM_SIZE, p.pool_size),
      passed: Boolean(bestByLevel.get(p.level)?.passed),
      attempts: bestByLevel.get(p.level)?.attempts ?? 0
    }))
  );
});

examRouter.get('/questions', (req, res) => {
  const { language, level } = req.query;
  if (language !== 'kz' && language !== 'en') {
    return res.status(400).json({ error: 'language must be kz or en' });
  }
  if (!level) return res.status(400).json({ error: 'level is required' });

  const pool = poolFor(language, level);
  if (pool.length === 0) return res.status(404).json({ error: 'No drills for this language/level yet' });

  const drawn = shuffle(pool).slice(0, EXAM_SIZE);
  res.json({
    language,
    level,
    total: drawn.length,
    questions: drawn.map((d) => ({
      id: d.id,
      prompt: d.prompt,
      options: shuffle([d.correct_answer, ...JSON.parse(d.distractors)])
    }))
  });
});

examRouter.post('/attempts', (req, res) => {
  const { language, level, answers } = req.body;
  if (language !== 'kz' && language !== 'en') {
    return res.status(400).json({ error: 'language must be kz or en' });
  }
  if (!level || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'level and a non-empty answers array are required' });
  }

  // Re-check against the DB's own correct_answer rather than trusting a
  // client-reported score -- this is a certification record, not a
  // practice quiz, so it's worth the extra round trip.
  const ids = answers.map((a) => a.drill_id);
  const placeholders = ids.map(() => '?').join(',');
  const drills = db
    .prepare(`SELECT id, correct_answer FROM theory_drills WHERE id IN (${placeholders})`)
    .all(...ids);
  const correctById = new Map(drills.map((d) => [d.id, d.correct_answer]));

  let score = 0;
  for (const a of answers) {
    if (correctById.get(a.drill_id) === a.selected) score += 1;
  }
  const total = answers.length;
  const passed = score === total && total > 0 ? 1 : 0;

  const info = db
    .prepare('INSERT INTO level_exam_attempts (language, level, score, total, passed) VALUES (?, ?, ?, ?, ?)')
    .run(language, level, score, total, passed);

  res.status(201).json({ id: info.lastInsertRowid, score, total, passed: Boolean(passed) });
});
