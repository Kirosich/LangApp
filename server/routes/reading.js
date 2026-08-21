import { Router } from 'express';
import { db } from '../db/index.js';
import { calculateLevel } from '../xp/calculate.js';
import { notifyLevelUp } from '../telegram/bot.js';
import { shuffle } from '../utils/shuffle.js';

export const readingRouter = Router();

const READ_XP_BONUS = 5;

readingRouter.get('/', (req, res) => {
  const { language, theme, level } = req.query;
  const conditions = [];
  const params = [];
  if (language) {
    conditions.push('r.language = ?');
    params.push(language);
  }
  if (theme) {
    conditions.push('r.theme = ?');
    params.push(theme);
  }
  if (level) {
    conditions.push('r.level = ?');
    params.push(level);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT r.id, r.language, r.slug, r.title, r.theme, r.level, r.style, r.order_index,
              p.read_at, p.best_score, p.best_score_total
       FROM reading_texts r
       LEFT JOIN reading_progress p ON p.text_id = r.id
       ${where}
       ORDER BY r.order_index ASC`
    )
    .all(...params);

  res.json(
    rows.map((r) => ({
      id: r.id,
      language: r.language,
      slug: r.slug,
      title: r.title,
      theme: r.theme,
      level: r.level,
      style: r.style,
      read: Boolean(r.read_at),
      best_score: r.best_score,
      best_score_total: r.best_score_total
    }))
  );
});

readingRouter.get('/:slug', (req, res) => {
  const text = db
    .prepare(
      `SELECT r.*, p.read_at, p.read_count, p.best_score, p.best_score_total
       FROM reading_texts r
       LEFT JOIN reading_progress p ON p.text_id = r.id
       WHERE r.slug = ?`
    )
    .get(req.params.slug);

  if (!text) return res.status(404).json({ error: 'Reading text not found' });

  const newWords = db
    .prepare('SELECT term, translation_ru FROM reading_new_words WHERE text_id = ? ORDER BY position ASC')
    .all(text.id);
  const exercises = db
    .prepare('SELECT id, prompt, correct_answer, distractors FROM reading_exercises WHERE text_id = ? ORDER BY position ASC')
    .all(text.id);

  res.json({
    id: text.id,
    language: text.language,
    slug: text.slug,
    title: text.title,
    theme: text.theme,
    level: text.level,
    style: text.style,
    body: text.body,
    read: Boolean(text.read_at),
    read_count: text.read_count ?? 0,
    best_score: text.best_score,
    best_score_total: text.best_score_total,
    new_words: newWords,
    exercises: exercises.map((e) => ({
      id: e.id,
      prompt: e.prompt,
      options: shuffle([e.correct_answer, ...JSON.parse(e.distractors)]),
      correct_answer: e.correct_answer
    }))
  });
});

readingRouter.post('/:slug/read', (req, res) => {
  const text = db.prepare('SELECT id FROM reading_texts WHERE slug = ?').get(req.params.slug);
  if (!text) return res.status(404).json({ error: 'Reading text not found' });

  const result = db.transaction(() => {
    const existing = db.prepare('SELECT * FROM reading_progress WHERE text_id = ?').get(text.id);
    const isFirstRead = !existing?.read_at;

    if (existing) {
      db.prepare(`UPDATE reading_progress SET read_at = datetime('now'), read_count = read_count + 1 WHERE text_id = ?`).run(text.id);
    } else {
      db.prepare(`INSERT INTO reading_progress (text_id, read_at, read_count) VALUES (?, datetime('now'), 1)`).run(text.id);
    }

    if (!isFirstRead) return { xp_gained: 0, leveled_up: false, current_level: null };

    const stats = db.prepare('SELECT total_xp, current_level FROM user_stats WHERE id = 1').get();
    const newTotalXp = stats.total_xp + READ_XP_BONUS;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > stats.current_level;

    db.prepare('UPDATE user_stats SET total_xp = ?, current_level = ? WHERE id = 1').run(newTotalXp, newLevel);
    db.prepare('INSERT INTO xp_events (amount) VALUES (?)').run(READ_XP_BONUS);

    return { xp_gained: READ_XP_BONUS, leveled_up: leveledUp, current_level: newLevel };
  })();

  if (result.leveled_up) notifyLevelUp(result.current_level);

  res.json(result);
});

// Score is server-computed from the DB's correct_answer, same rigor as
// the level exam -- this feeds best_score, which is shown as a record,
// not just a one-off practice tally.
readingRouter.post('/:slug/exercises', (req, res) => {
  const text = db.prepare('SELECT id FROM reading_texts WHERE slug = ?').get(req.params.slug);
  if (!text) return res.status(404).json({ error: 'Reading text not found' });

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  const ids = answers.map((a) => a.exercise_id);
  const placeholders = ids.map(() => '?').join(',');
  const exercises = db
    .prepare(`SELECT id, correct_answer FROM reading_exercises WHERE id IN (${placeholders}) AND text_id = ?`)
    .all(...ids, text.id);
  const correctById = new Map(exercises.map((e) => [e.id, e.correct_answer]));

  let score = 0;
  for (const a of answers) {
    if (correctById.get(a.exercise_id) === a.selected) score += 1;
  }
  const total = answers.length;

  const existing = db.prepare('SELECT best_score FROM reading_progress WHERE text_id = ?').get(text.id);
  if (existing) {
    if (existing.best_score === null || score > existing.best_score) {
      db.prepare('UPDATE reading_progress SET best_score = ?, best_score_total = ? WHERE text_id = ?').run(score, total, text.id);
    }
  } else {
    db.prepare('INSERT INTO reading_progress (text_id, best_score, best_score_total) VALUES (?, ?, ?)').run(text.id, score, total);
  }

  res.json({ score, total });
});
