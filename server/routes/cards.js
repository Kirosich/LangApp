import { Router } from 'express';
import { db } from '../db/index.js';
import { qualityToGrade, cardFromProgress, nextReview } from '../srs/fsrs.js';
import { xpForReview, STREAK_BONUS_XP, MASTER_XP, calculateLevel } from '../xp/calculate.js';
import { introduceDailyBacklog } from '../backlog/introduce.js';
import { shuffle } from '../utils/shuffle.js';
import { LEARNED_CONDITION_SQL } from '../db/learned.js';
import { notifyLevelUp } from '../telegram/bot.js';
import { LEECH_CONDITION_SQL, LEECH_ORDER_SQL } from './gamification.js';
import { creditLanguageXp } from '../xp/perLanguage.js';

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
            last_reviewed: row.last_reviewed,
            fsrs_stability: row.fsrs_stability,
            fsrs_difficulty: row.fsrs_difficulty,
            fsrs_state: row.fsrs_state,
            fsrs_due: row.fsrs_due
          }
        : null
  };
}

// LEFT JOIN: backlog cards have no progress row. Queries that filter on
// p.<column> (like /due's due-ness check) still naturally exclude them,
// since comparisons against NULL are false.
const SELECT_WITH_PROGRESS = `
  SELECT c.*, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed,
         p.fsrs_stability, p.fsrs_difficulty, p.fsrs_state, p.fsrs_due
  FROM cards c
  LEFT JOIN progress p ON p.card_id = c.id
`;

// A card is due once its FSRS-scheduled due timestamp has passed, or
// (Stage D) it has never been through FSRS yet -- fsrs_due is NULL for
// any card not yet reviewed since the switch, which must stay
// immediately reviewable, same as due_date used to default to today.
//
// BUG FIXED: "fsrs_due IS NULL" is also true for backlog cards, which
// have no progress row at all -- under SELECT_WITH_PROGRESS's LEFT JOIN,
// a missing row means every p.* column (including p.card_id) reads as
// NULL. Without the p.card_id IS NOT NULL guard, backlog cards leaked
// into /due, and rating one 404'd ("Card not found") since /review looks
// up a real progress row that doesn't exist for them. The old due_date
// condition never had this problem because NULL <= today is false, not
// true -- fsrs_due's NULL-means-due semantics inverted that safety net.
const FSRS_DUE_CONDITION_SQL = '(p.card_id IS NOT NULL AND (p.fsrs_due IS NULL OR p.fsrs_due <= ?))';

cardsRouter.get('/due', (req, res) => {
  const { language, theme } = req.query;

  // Top up today's backlog quota (capped by daily_intro_log) before
  // computing the due queue, so freshly-introduced cards are included.
  introduceDailyBacklog(db, 'kz');
  introduceDailyBacklog(db, 'en');

  const now = new Date().toISOString();
  const conditions = [FSRS_DUE_CONDITION_SQL, 'c.mastered_at IS NULL'];
  const params = [now];

  if (language) {
    conditions.push('c.language = ?');
    params.push(language);
  }
  if (theme) {
    conditions.push('c.theme = ?');
    params.push(theme);
  }

  const rows = db.prepare(`${SELECT_WITH_PROGRESS} WHERE ${conditions.join(' AND ')}`).all(...params);
  // Shuffle so newly-introduced cards blend into the regular review queue
  // instead of forming a separate block.
  res.json(shuffle(rows).map(cardWithProgress));
});

// "Тренировка дня" (Stage 12): one button that assembles a balanced
// session from whatever's weakest right now -- leeches (struggling
// cards, regardless of whether they happen to be due yet) first, then
// today's regular due queue, deduplicated. Reuses the exact leech
// definition from the problem-cards endpoint (same threshold constant)
// instead of inventing a second one.
cardsRouter.get('/workout', (req, res) => {
  const { language } = req.query;
  const count = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 5), 50);
  const now = new Date().toISOString();

  const langClause = language ? 'AND c.language = ?' : '';
  const langParams = language ? [language] : [];

  const leeches = db
    .prepare(
      `SELECT c.id FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE (p.last_reviewed IS NOT NULL OR p.fsrs_last_review IS NOT NULL)
         AND c.mastered_at IS NULL AND ${LEECH_CONDITION_SQL} ${langClause}
       ORDER BY ${LEECH_ORDER_SQL}`
    )
    .all(...langParams);

  const due = db
    .prepare(
      `SELECT c.id FROM cards c JOIN progress p ON p.card_id = c.id
       WHERE ${FSRS_DUE_CONDITION_SQL} AND c.mastered_at IS NULL ${langClause}
       ORDER BY COALESCE(p.fsrs_due, ?) ASC`
    )
    .all(now, ...langParams, now);

  const seen = new Set();
  const ids = [];
  for (const row of [...leeches, ...due]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    ids.push(row.id);
    if (ids.length >= count) break;
  }

  res.json({ card_ids: ids });
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
  const { language: cardLanguage } = db.prepare('SELECT language FROM cards WHERE id = ?').get(id);

  try {
    qualityToGrade(quality); // validates the mapping exists; nextReview() derives it again internally
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const now = new Date();
  const requestRetention = db.prepare('SELECT request_retention FROM fsrs_settings WHERE id = 1').get()?.request_retention ?? 0.9;
  const existingCard = cardFromProgress(progress);
  const { progressFields, reviewLog } = nextReview({ existingCard, quality, requestRetention, now });

  const result = db.transaction(() => {
    // Stage D: SM-2's easiness_factor/interval_days/repetitions/due_date/
    // last_reviewed are no longer written -- they stay frozen at whatever
    // value they had when this card's first FSRS review happens, kept in
    // the schema only for comparison/rollback, per the plan. review_log
    // (new in Stage A) is now the source of truth for "did I review
    // anything today", replacing the old last_reviewed-based check.
    const reviewedAlreadyToday = db.prepare(`SELECT 1 FROM review_log WHERE date(reviewed_at) = date(?) LIMIT 1`).get(now.toISOString());
    // Per-language streak bonus is independent of the global one above --
    // "did I review THIS language today", not "did I review anything".
    const reviewedThisLanguageAlreadyToday = db
      .prepare(
        `SELECT 1 FROM review_log r JOIN cards c ON c.id = r.card_id
         WHERE c.language = ? AND date(r.reviewed_at) = date(?) LIMIT 1`
      )
      .get(cardLanguage, now.toISOString());

    db.prepare(
      `UPDATE progress SET
         fsrs_stability = @fsrs_stability, fsrs_difficulty = @fsrs_difficulty, fsrs_state = @fsrs_state,
         fsrs_due = @fsrs_due, fsrs_reps = @fsrs_reps, fsrs_lapses = @fsrs_lapses,
         fsrs_learning_steps = @fsrs_learning_steps, fsrs_elapsed_days = @fsrs_elapsed_days,
         fsrs_scheduled_days = @fsrs_scheduled_days, fsrs_last_review = @fsrs_last_review
       WHERE card_id = @card_id`
    ).run({ ...progressFields, card_id: id });

    db.prepare(`INSERT INTO review_log (card_id, rating, reviewed_at, elapsed_days, scheduled_days) VALUES (?, ?, ?, ?, ?)`).run(
      id,
      reviewLog.rating,
      now.toISOString(),
      reviewLog.elapsed_days,
      reviewLog.scheduled_days
    );

    const xpGained = xpForReview(quality) + (reviewedAlreadyToday ? 0 : STREAK_BONUS_XP);

    const stats = db.prepare('SELECT total_xp, current_level FROM user_stats WHERE id = 1').get();
    const newTotalXp = stats.total_xp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > stats.current_level;

    db.prepare('UPDATE user_stats SET total_xp = ?, current_level = ? WHERE id = 1').run(newTotalXp, newLevel);
    db.prepare('INSERT INTO xp_events (amount) VALUES (?)').run(xpGained);

    // Per-language tracking (additive, see user_stats_by_language in
    // migrate.js).
    const languageXpGained = xpForReview(quality) + (reviewedThisLanguageAlreadyToday ? 0 : STREAK_BONUS_XP);
    creditLanguageXp(db, cardLanguage, languageXpGained);

    return { xpGained, leveledUp, totalXp: newTotalXp, currentLevel: newLevel };
  })();

  if (result.leveledUp) notifyLevelUp(result.currentLevel);

  res.json({
    card_id: Number(id),
    fsrs_due: progressFields.fsrs_due,
    fsrs_stability: progressFields.fsrs_stability,
    fsrs_difficulty: progressFields.fsrs_difficulty,
    fsrs_state: progressFields.fsrs_state,
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

    creditLanguageXp(db, card.language, MASTER_XP);

    return { leveledUp, currentLevel: newLevel };
  })();

  if (result.leveledUp) notifyLevelUp(result.currentLevel);

  res.json({ xp_gained: MASTER_XP, leveled_up: result.leveledUp });
});

cardsRouter.post('/:id/unmaster', (req, res) => {
  const { id } = req.params;
  const info = db.prepare(`UPDATE cards SET mastered_at = NULL WHERE id = ?`).run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Card not found' });
  res.status(204).end();
});

// A real action for a leech card (Stage 12): give up on the current SRS
// state and send it back to the backlog, where it'll be reintroduced
// fresh via the normal dosed daily intro rather than kept circling at a
// rock-bottom easiness factor.
cardsRouter.post('/:id/demote', (req, res) => {
  const { id } = req.params;
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  if (card.status === 'backlog') return res.status(400).json({ error: 'Card is already in the backlog' });

  db.transaction(() => {
    db.prepare(`UPDATE cards SET status = 'backlog', activated_at = NULL WHERE id = ?`).run(id);
    db.prepare('DELETE FROM progress WHERE card_id = ?').run(id);
  })();

  res.status(204).end();
});
