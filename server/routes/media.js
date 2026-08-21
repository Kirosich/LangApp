// Movies/series section: a title is a thematic anchor for vocab + text +
// a mini-exam, never a content source. See CLAUDE.md's copyright
// constraint -- media_texts.body and comprehension_questions are always
// original writing "in the spirit of" the genre/setting, never a
// retelling of the actual plot, and media_entries only stores factual
// metadata (title/year/genre/one-line theme), never scene-by-scene
// summaries or quoted dialogue.
import { Router } from 'express';
import { db } from '../db/index.js';
import { shuffle } from '../utils/shuffle.js';

export const mediaRouter = Router();

const EXAM_SIZE = 50;

function parseQuestions(text) {
  return JSON.parse(text.comprehension_questions).map((q, i) => ({
    ref: `${text.id}:${i}`,
    prompt: q.prompt,
    correct_answer: q.correct_answer,
    distractors: q.distractors
  }));
}

mediaRouter.get('/', (req, res) => {
  const { language_focus } = req.query;
  const conditions = [];
  const params = [];
  if (language_focus) {
    conditions.push('m.language_focus = ?');
    params.push(language_focus);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const entries = db
    .prepare(
      `SELECT m.*,
              (SELECT COUNT(*) FROM media_vocab_links v WHERE v.media_entry_id = m.id) AS vocab_count,
              (SELECT COUNT(*) FROM media_texts t WHERE t.media_entry_id = m.id) AS text_count
       FROM media_entries m
       ${where}
       ORDER BY m.created_at DESC`
    )
    .all(...params);

  const bestByEntry = new Map(
    db
      .prepare(`SELECT media_entry_id, MAX(passed) AS passed, COUNT(*) AS attempts FROM media_exam_results GROUP BY media_entry_id`)
      .all()
      .map((r) => [r.media_entry_id, r])
  );

  res.json(
    entries.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      year: m.year,
      genre: m.genre,
      language_focus: m.language_focus,
      one_line_theme: m.one_line_theme,
      vocab_count: m.vocab_count,
      text_count: m.text_count,
      exam_passed: Boolean(bestByEntry.get(m.id)?.passed),
      exam_attempts: bestByEntry.get(m.id)?.attempts ?? 0
    }))
  );
});

mediaRouter.get('/:id', (req, res) => {
  const entry = db.prepare('SELECT * FROM media_entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Media entry not found' });

  const vocab = db
    .prepare(
      `SELECT c.id, c.term, c.translation_ru, c.theme, c.status
       FROM media_vocab_links v
       JOIN cards c ON c.id = v.card_id
       WHERE v.media_entry_id = ?
       ORDER BY c.theme, c.id`
    )
    .all(entry.id);

  const texts = db
    .prepare('SELECT * FROM media_texts WHERE media_entry_id = ? ORDER BY order_index ASC')
    .all(entry.id);

  const examPoolSize = texts.reduce((sum, t) => sum + JSON.parse(t.comprehension_questions).length, 0);
  const best = db
    .prepare('SELECT MAX(passed) AS passed, COUNT(*) AS attempts FROM media_exam_results WHERE media_entry_id = ?')
    .get(entry.id);

  res.json({
    id: entry.id,
    title: entry.title,
    type: entry.type,
    year: entry.year,
    genre: entry.genre,
    language_focus: entry.language_focus,
    one_line_theme: entry.one_line_theme,
    vocab,
    texts: texts.map((t) => ({
      id: t.id,
      title: t.title,
      level: t.level,
      body: t.body,
      questions: parseQuestions(t).map((q) => ({
        ref: q.ref,
        prompt: q.prompt,
        options: shuffle([q.correct_answer, ...q.distractors]),
        correct_answer: q.correct_answer
      }))
    })),
    exam: {
      pool_size: examPoolSize,
      exam_size: Math.min(EXAM_SIZE, examPoolSize),
      passed: Boolean(best?.passed),
      attempts: best?.attempts ?? 0
    }
  });
});

mediaRouter.get('/:id/exam/questions', (req, res) => {
  const entry = db.prepare('SELECT id FROM media_entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Media entry not found' });

  const texts = db.prepare('SELECT * FROM media_texts WHERE media_entry_id = ?').all(entry.id);
  const pool = texts.flatMap(parseQuestions);
  if (pool.length === 0) return res.status(404).json({ error: 'No exam questions for this title yet' });

  const drawn = shuffle(pool).slice(0, EXAM_SIZE);
  res.json({
    total: drawn.length,
    questions: drawn.map((q) => ({ ref: q.ref, prompt: q.prompt, options: shuffle([q.correct_answer, ...q.distractors]) }))
  });
});

mediaRouter.post('/:id/exam/attempts', (req, res) => {
  const entry = db.prepare('SELECT id FROM media_entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Media entry not found' });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  // Re-check against the DB's own questions, same rigor as the level
  // exam -- not trusting a client-reported score for a graded record.
  const texts = db.prepare('SELECT * FROM media_texts WHERE media_entry_id = ?').all(entry.id);
  const correctByRef = new Map(texts.flatMap(parseQuestions).map((q) => [q.ref, q.correct_answer]));

  let score = 0;
  for (const a of answers) {
    if (correctByRef.get(a.ref) === a.selected) score += 1;
  }
  const total = answers.length;
  const passed = score === total && total > 0 ? 1 : 0;

  const info = db
    .prepare('INSERT INTO media_exam_results (media_entry_id, score, total, passed) VALUES (?, ?, ?, ?)')
    .run(entry.id, score, total, passed);

  res.status(201).json({ id: info.lastInsertRowid, score, total, passed: Boolean(passed) });
});
