import { Router } from 'express';
import { db } from '../db/index.js';
import { calculateNextReview } from '../srs/sm2.js';
import { xpForReview, STREAK_BONUS_XP, calculateLevel } from '../xp/calculate.js';

export const cardsRouter = Router();

const VALID_LANGUAGES = new Set(['kz', 'en']);

function validateCardInput(body, { partial = false } = {}) {
  const errors = [];
  const fields = ['language', 'term', 'translation_ru', 'theme'];

  for (const field of fields) {
    if (!partial && !body[field]) errors.push(`${field} is required`);
  }
  if (body.language !== undefined && !VALID_LANGUAGES.has(body.language)) {
    errors.push('language must be "kz" or "en"');
  }
  return errors;
}

function cardWithProgress(row) {
  return {
    id: row.id,
    language: row.language,
    term: row.term,
    translation_ru: row.translation_ru,
    transcription: row.transcription,
    theme: row.theme,
    example_sentence: row.example_sentence,
    created_at: row.created_at,
    progress: {
      easiness_factor: row.easiness_factor,
      interval_days: row.interval_days,
      repetitions: row.repetitions,
      due_date: row.due_date,
      last_reviewed: row.last_reviewed
    }
  };
}

const SELECT_WITH_PROGRESS = `
  SELECT c.*, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed
  FROM cards c
  JOIN progress p ON p.card_id = c.id
`;

cardsRouter.get('/due', (req, res) => {
  const { language } = req.query;
  const today = new Date().toISOString().slice(0, 10);
  const conditions = ['p.due_date <= ?'];
  const params = [today];

  if (language) {
    conditions.push('c.language = ?');
    params.push(language);
  }

  const rows = db
    .prepare(`${SELECT_WITH_PROGRESS} WHERE ${conditions.join(' AND ')} ORDER BY p.due_date ASC`)
    .all(...params);
  res.json(rows.map(cardWithProgress));
});

cardsRouter.get('/', (req, res) => {
  const { theme, language } = req.query;
  const conditions = [];
  const params = [];

  if (theme) {
    conditions.push('c.theme = ?');
    params.push(theme);
  }
  if (language) {
    conditions.push('c.language = ?');
    params.push(language);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`${SELECT_WITH_PROGRESS} ${where} ORDER BY c.created_at DESC`).all(...params);
  res.json(rows.map(cardWithProgress));
});

cardsRouter.post('/', (req, res) => {
  const errors = validateCardInput(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { language, term, translation_ru, transcription, theme, example_sentence } = req.body;

  const insertCard = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(language, term, translation_ru, transcription ?? null, theme, example_sentence ?? null);

    db.prepare(`INSERT INTO progress (card_id) VALUES (?)`).run(info.lastInsertRowid);
    return info.lastInsertRowid;
  });

  const id = insertCard();
  const row = db.prepare(`${SELECT_WITH_PROGRESS} WHERE c.id = ?`).get(id);
  res.status(201).json(cardWithProgress(row));
});

cardsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });

  const errors = validateCardInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const merged = { ...existing, ...req.body };
  db.prepare(
    `UPDATE cards SET language = ?, term = ?, translation_ru = ?, transcription = ?, theme = ?, example_sentence = ?
     WHERE id = ?`
  ).run(
    merged.language,
    merged.term,
    merged.translation_ru,
    merged.transcription ?? null,
    merged.theme,
    merged.example_sentence ?? null,
    id
  );

  const row = db.prepare(`${SELECT_WITH_PROGRESS} WHERE c.id = ?`).get(id);
  res.json(cardWithProgress(row));
});

cardsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM cards WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Card not found' });
  res.status(204).end();
});

cardsRouter.post('/:id/review', (req, res) => {
  const { id } = req.params;
  const { quality } = req.body;

  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    return res.status(400).json({ error: 'quality must be an integer between 0 and 5' });
  }

  const progress = db.prepare('SELECT * FROM progress WHERE card_id = ?').get(id);
  if (!progress) return res.status(404).json({ error: 'Card not found' });

  const next = calculateNextReview(progress, quality);
  const today = new Date().toISOString().slice(0, 10);

  const result = db.transaction(() => {
    const reviewedAlreadyToday = db
      .prepare('SELECT 1 FROM progress WHERE last_reviewed = ? LIMIT 1')
      .get(today);

    db.prepare(
      `UPDATE progress SET easiness_factor = ?, interval_days = ?, repetitions = ?, due_date = ?, last_reviewed = ?
       WHERE card_id = ?`
    ).run(next.easiness_factor, next.interval_days, next.repetitions, next.due_date, next.last_reviewed, id);

    const xpGained = xpForReview(quality) + (reviewedAlreadyToday ? 0 : STREAK_BONUS_XP);

    const stats = db.prepare('SELECT total_xp, current_level FROM user_stats WHERE id = 1').get();
    const newTotalXp = stats.total_xp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > stats.current_level;

    db.prepare('UPDATE user_stats SET total_xp = ?, current_level = ? WHERE id = 1').run(newTotalXp, newLevel);

    return { xpGained, leveledUp, totalXp: newTotalXp, currentLevel: newLevel };
  })();

  res.json({
    card_id: Number(id),
    ...next,
    xp_gained: result.xpGained,
    leveled_up: result.leveledUp,
    total_xp: result.totalXp,
    current_level: result.currentLevel
  });
});
