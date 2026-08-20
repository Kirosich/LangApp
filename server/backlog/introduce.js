const DEFAULT_PER_DAY = 8;

// Backlog cards are picked one theme at a time — ordered by the earliest
// created_at within each theme, so a theme is fully drained before the
// next one starts, rather than interleaving multiple themes at once.
const CANDIDATES_QUERY = `
  SELECT c.id FROM cards c
  WHERE c.status = 'backlog' AND c.language = ? AND c.mastered_at IS NULL
  ORDER BY (
    SELECT MIN(created_at) FROM cards c2
    WHERE c2.theme = c.theme AND c2.language = c.language AND c2.status = 'backlog' AND c2.mastered_at IS NULL
  ) ASC, c.created_at ASC
  LIMIT ?
`;

function promoteCards(db, cardIds) {
  const promote = db.prepare(`UPDATE cards SET status = 'active', activated_at = datetime('now') WHERE id = ?`);
  const addProgress = db.prepare('INSERT INTO progress (card_id) VALUES (?)');
  for (const id of cardIds) {
    promote.run(id);
    addProgress.run(id);
  }
}

function getPerDay(db, language) {
  const row = db.prepare('SELECT new_cards_per_day FROM intro_settings WHERE language = ?').get(language);
  return row?.new_cards_per_day ?? DEFAULT_PER_DAY;
}

/**
 * Introduces up to the remaining daily quota of backlog cards for a
 * language, respecting daily_intro_log so repeated calls in the same day
 * (e.g. multiple Study sessions) never exceed new_cards_per_day.
 * @returns {number} how many cards were introduced by this call
 */
export function introduceDailyBacklog(db, language) {
  const today = new Date().toISOString().slice(0, 10);
  const perDay = getPerDay(db, language);

  const logRow = db.prepare('SELECT count FROM daily_intro_log WHERE date = ? AND language = ?').get(today, language);
  const alreadyIntroduced = logRow?.count ?? 0;
  const remaining = perDay - alreadyIntroduced;
  if (remaining <= 0) return 0;

  const candidates = db.prepare(CANDIDATES_QUERY).all(language, remaining);
  if (candidates.length === 0) return 0;

  const run = db.transaction(() => {
    promoteCards(db, candidates.map((c) => c.id));
    db.prepare(
      `INSERT INTO daily_intro_log (date, language, count) VALUES (?, ?, ?)
       ON CONFLICT(date, language) DO UPDATE SET count = count + excluded.count`
    ).run(today, language, candidates.length);
  });
  run();

  return candidates.length;
}

/**
 * Promotes `count` extra backlog cards immediately, on top of (without
 * counting against) the regular daily quota.
 * @returns {number} how many cards were actually promoted (may be fewer
 *   than requested if the backlog runs out)
 */
export function boostIntroduceCards(db, language, count) {
  const candidates = db.prepare(CANDIDATES_QUERY).all(language, count);
  if (candidates.length === 0) return 0;

  const run = db.transaction(() => promoteCards(db, candidates.map((c) => c.id)));
  run();

  return candidates.length;
}
