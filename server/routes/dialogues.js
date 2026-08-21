import { Router } from 'express';
import { db } from '../db/index.js';
import { calculateLevel } from '../xp/calculate.js';
import { notifyLevelUp } from '../telegram/bot.js';

export const dialoguesRouter = Router();

const READ_XP_BONUS = 5;

dialoguesRouter.get('/', (req, res) => {
  const { language } = req.query;
  const conditions = [];
  const params = [];
  if (language) {
    conditions.push('d.language = ?');
    params.push(language);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT d.id, d.language, d.slug, d.title, d.scenario, d.level, d.order_index, p.read_at
       FROM dialogues d
       LEFT JOIN dialogue_progress p ON p.dialogue_id = d.id
       ${where}
       ORDER BY d.order_index ASC`
    )
    .all(...params);

  res.json(
    rows.map((r) => ({
      id: r.id,
      language: r.language,
      slug: r.slug,
      title: r.title,
      scenario: r.scenario,
      level: r.level,
      read: Boolean(r.read_at)
    }))
  );
});

dialoguesRouter.get('/:slug', (req, res) => {
  const dialogue = db
    .prepare(
      `SELECT d.*, p.read_at, p.read_count
       FROM dialogues d
       LEFT JOIN dialogue_progress p ON p.dialogue_id = d.id
       WHERE d.slug = ?`
    )
    .get(req.params.slug);

  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found' });

  const lines = db
    .prepare('SELECT speaker, text, translation_ru FROM dialogue_lines WHERE dialogue_id = ? ORDER BY position ASC')
    .all(dialogue.id);
  const newWords = db
    .prepare('SELECT term, translation_ru FROM dialogue_new_words WHERE dialogue_id = ? ORDER BY position ASC')
    .all(dialogue.id);

  res.json({
    id: dialogue.id,
    language: dialogue.language,
    slug: dialogue.slug,
    title: dialogue.title,
    scenario: dialogue.scenario,
    level: dialogue.level,
    read: Boolean(dialogue.read_at),
    read_count: dialogue.read_count ?? 0,
    lines,
    new_words: newWords
  });
});

dialoguesRouter.post('/:slug/read', (req, res) => {
  const dialogue = db.prepare('SELECT id FROM dialogues WHERE slug = ?').get(req.params.slug);
  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found' });

  const result = db.transaction(() => {
    const existing = db.prepare('SELECT * FROM dialogue_progress WHERE dialogue_id = ?').get(dialogue.id);
    const isFirstRead = !existing?.read_at;

    if (existing) {
      db.prepare(`UPDATE dialogue_progress SET read_at = datetime('now'), read_count = read_count + 1 WHERE dialogue_id = ?`).run(
        dialogue.id
      );
    } else {
      db.prepare(`INSERT INTO dialogue_progress (dialogue_id, read_at, read_count) VALUES (?, datetime('now'), 1)`).run(dialogue.id);
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
