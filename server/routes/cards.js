import { Router } from 'express';
import { db } from '../db/index.js';
import { calculateNextReview } from '../srs/sm2.js';
import { xpForReview, STREAK_BONUS_XP, MASTER_XP, calculateLevel } from '../xp/calculate.js';
import { introduceDailyBacklog } from '../backlog/introduce.js';
import { shuffle } from '../utils/shuffle.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';

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
    status: row.status,
    mastered_at: row.mastered_at,
    progress:
      row.easiness_factor != null
        ? {
            easiness_factor: row.easiness_factor,
            interval_days: row.interval_days,
            repetitions: row.repetitions,
            due_date: row.due_date,
            last_reviewed: row.last_reviewed
          }
        : null
  };
}

// LEFT JOIN: backlog cards have no progress row. Queries that filter on
// p.<column> (like /due's due_date <= ?) still naturally exclude them,
// since comparisons against NULL are false.
const SELECT_WITH_PROGRESS = `
  SELECT c.*, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed
  FROM cards c
  LEFT JOIN progress p ON p.card_id = c.id
`;

cardsRouter.get('/due', (req, res) => {
  const { language } = req.query;

  // Top up today's backlog quota (capped by daily_intro_log) before
  // computing the due queue, so freshly-introduced cards are included.
  introduceDailyBacklog(db, 'kz');
  introduceDailyBacklog(db, 'en');

  const today = new Date().toISOString().slice(0, 10);
  const conditions = ['p.due_date <= ?', 'c.mastered_at IS NULL'];
  const params = [today];

  if (language) {
    conditions.push('c.language = ?');
    params.push(language);
  }

  const rows = db.prepare(`${SELECT_WITH_PROGRESS} WHERE ${conditions.join(' AND ')}`).all(...params);
  // Shuffle so newly-introduced cards blend into the regular review queue
  // instead of forming a separate block.
  res.json(shuffle(rows).map(cardWithProgress));
});

cardsRouter.get('/known', (req, res) => {
  const { language } = req.query;
  const conditions = [LEARNED_CONDITION_SQL];
  const params = [];

  if (language) {
    conditions.push('c.language = ?');
    params.push(language);
  }

  const rows = db
    .prepare(`${SELECT_WITH_PROGRESS} WHERE ${conditions.join(' AND ')} ORDER BY c.theme ASC, c.term ASC`)
    .all(...params);
  res.json(rows.map(cardWithProgress));
});

cardsRouter.get('/', (req, res) => {
  const { theme, language, ids, status } = req.query;
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
  if (ids) {
    const idList = ids
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter(Number.isInteger);
    if (idList.length > 0) {
      conditions.push(`c.id IN (${idList.map(() => '?').join(',')})`);
      params.push(...idList);
    }
  }
  if (status === 'active') {
    conditions.push(`c.status = 'active' AND c.mastered_at IS NULL`);
  } else if (status === 'backlog') {
    conditions.push(`c.status = 'backlog' AND c.mastered_at IS NULL`);
  } else if (status === 'mastered') {
    conditions.push('c.mastered_at IS NOT NULL');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`${SELECT_WITH_PROGRESS} ${where} ORDER BY c.created_at DESC`).all(...params);
  res.json(rows.map(cardWithProgress));
});

cardsRouter.post('/', (req, res) => {
  const errors = validateCardInput(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { language, term, translation_ru, transcription, theme, example_sentence } = req.body;

  // Manually adding one card through the form always means "I want to
  // study this now" — it goes straight to active, unlike a bulk import.
  const insertCard = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence, status, activated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'))`
      )
      .run(language, term, translation_ru, transcription ?? null, theme, example_sentence ?? null);

    db.prepare(`INSERT INTO progress (card_id) VALUES (?)`).run(info.lastInsertRowid);
    return info.lastInsertRowid;
  });

  const id = insertCard();
  const row = db.prepare(`${SELECT_WITH_PROGRESS} WHERE c.id = ?`).get(id);
  res.status(201).json(cardWithProgress(row));
});

cardsRouter.post('/import', (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'cards must be a non-empty array' });
  }

  const errors = [];
  cards.forEach((card, i) => {
    const cardErrors = validateCardInput(card);
    if (cardErrors.length) errors.push({ index: i, errors: cardErrors });
  });
  if (errors.length) return res.status(400).json({ errors });

  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence, status, activated_at)
     VALUES (@language, @term, @translation_ru, @transcription, @theme, @example_sentence, @status, @activated_at)`
  );
  const insertProgress = db.prepare('INSERT INTO progress (card_id) VALUES (?)');

  const result = db.transaction(() => {
    let imported = 0;
    let activated = 0;
    for (const card of cards) {
      const status = card.status === 'active' ? 'active' : 'backlog';
      const info = insertCard.run({
        language: card.language,
        term: card.term,
        translation_ru: card.translation_ru,
        transcription: card.transcription ?? null,
        theme: card.theme,
        example_sentence: card.example_sentence ?? null,
        status,
        activated_at: status === 'active' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
      });
      if (status === 'active') {
        insertProgress.run(info.lastInsertRowid);
        activated += 1;
      }
      imported += 1;
    }
    return { imported, activated };
  })();

  res.status(201).json({ imported: result.imported, activated: result.activated, backlogged: result.imported - result.activated });
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
    db.prepare('INSERT INTO xp_events (amount) VALUES (?)').run(xpGained);

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

cardsRouter.post('/:id/master', (req, res) => {
  const { id } = req.params;
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  if (card.mastered_at) return res.status(400).json({ error: 'Card is already mastered' });

  const result = db.transaction(() => {
    db.prepare(`UPDATE cards SET mastered_at = datetime('now') WHERE id = ?`).run(id);

    const stats = db.prepare('SELECT total_xp, current_level FROM user_stats WHERE id = 1').get();
    const newTotalXp = stats.total_xp + MASTER_XP;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > stats.current_level;

    db.prepare('UPDATE user_stats SET total_xp = ?, current_level = ? WHERE id = 1').run(newTotalXp, newLevel);
    db.prepare('INSERT INTO xp_events (amount) VALUES (?)').run(MASTER_XP);

    return { leveledUp };
  })();

  res.json({ xp_gained: MASTER_XP, leveled_up: result.leveledUp });
});

cardsRouter.post('/:id/unmaster', (req, res) => {
  const { id } = req.params;
  const info = db.prepare(`UPDATE cards SET mastered_at = NULL WHERE id = ?`).run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Card not found' });
  res.status(204).end();
});
