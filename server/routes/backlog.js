import { Router } from 'express';
import { db } from '../db/index.js';
import { boostIntroduceCards } from '../backlog/introduce.js';

export const backlogRouter = Router();

const LANGUAGES = ['kz', 'en'];

backlogRouter.get('/summary', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const summary = LANGUAGES.map((language) => {
    const backlogCount = db
      .prepare(`SELECT COUNT(*) AS count FROM cards WHERE language = ? AND status = 'backlog' AND mastered_at IS NULL`)
      .get(language).count;
    const activeCount = db
      .prepare(`SELECT COUNT(*) AS count FROM cards WHERE language = ? AND status = 'active' AND mastered_at IS NULL`)
      .get(language).count;
    const masteredCount = db
      .prepare(`SELECT COUNT(*) AS count FROM cards WHERE language = ? AND mastered_at IS NOT NULL`)
      .get(language).count;
    // Sourced from daily_intro_log (the regular-quota counter), not from
    // activated_at — on the very day a big batch of cards is first seeded,
    // their activated_at is backfilled to "today" too, which would
    // otherwise make this look like the daily cap had been blown way past.
    const introducedToday = db
      .prepare('SELECT count FROM daily_intro_log WHERE date = ? AND language = ?')
      .get(today, language)?.count ?? 0;
    const settings = db.prepare('SELECT new_cards_per_day FROM intro_settings WHERE language = ?').get(language);

    return {
      language,
      backlog_count: backlogCount,
      active_count: activeCount,
      mastered_count: masteredCount,
      introduced_today: introducedToday,
      new_cards_per_day: settings?.new_cards_per_day ?? 8
    };
  });

  res.json(summary);
});

backlogRouter.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT language, new_cards_per_day FROM intro_settings ORDER BY language').all();
  res.json(rows);
});

backlogRouter.put('/settings', (req, res) => {
  const { language, new_cards_per_day } = req.body;
  if (!LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `language must be one of: ${LANGUAGES.join(', ')}` });
  }
  if (!Number.isInteger(new_cards_per_day) || new_cards_per_day < 0) {
    return res.status(400).json({ error: 'new_cards_per_day must be a non-negative integer' });
  }

  db.prepare(
    `INSERT INTO intro_settings (language, new_cards_per_day) VALUES (?, ?)
     ON CONFLICT(language) DO UPDATE SET new_cards_per_day = excluded.new_cards_per_day`
  ).run(language, new_cards_per_day);

  res.json({ language, new_cards_per_day });
});

backlogRouter.post('/boost', (req, res) => {
  const { language, count } = req.body;
  if (!LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `language must be one of: ${LANGUAGES.join(', ')}` });
  }
  if (!Number.isInteger(count) || count <= 0) {
    return res.status(400).json({ error: 'count must be a positive integer' });
  }

  const introduced = boostIntroduceCards(db, language, count);
  res.json({ introduced });
});
