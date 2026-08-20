import { Router } from 'express';
import { db } from '../db/index.js';
import { calculateLevel } from '../xp/calculate.js';

export const theoryReferenceRouter = Router();

const READ_XP_BONUS = 5;

theoryReferenceRouter.get('/', (req, res) => {
  const { language } = req.query;
  const conditions = [];
  const params = [];
  if (language) {
    conditions.push('t.language = ?');
    params.push(language);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT t.id, t.language, t.slug, t.title, t.level, t.order_index, t.summary, p.read_at, p.read_count
       FROM theory_topics t
       LEFT JOIN theory_progress p ON p.topic_id = t.id
       ${where}
       ORDER BY t.order_index ASC`
    )
    .all(...params);

  res.json(
    rows.map((r) => ({
      id: r.id,
      language: r.language,
      slug: r.slug,
      title: r.title,
      level: r.level,
      summary: r.summary,
      read: Boolean(r.read_at),
      read_count: r.read_count ?? 0
    }))
  );
});

theoryReferenceRouter.get('/:slug', (req, res) => {
  const topic = db
    .prepare(
      `SELECT t.*, p.read_at, p.read_count
       FROM theory_topics t
       LEFT JOIN theory_progress p ON p.topic_id = t.id
       WHERE t.slug = ?`
    )
    .get(req.params.slug);

  if (!topic) return res.status(404).json({ error: 'Topic not found' });

  const sections = db
    .prepare('SELECT section_type, content, order_index FROM theory_sections WHERE topic_id = ? ORDER BY order_index ASC')
    .all(topic.id);

  res.json({
    id: topic.id,
    language: topic.language,
    slug: topic.slug,
    title: topic.title,
    level: topic.level,
    summary: topic.summary,
    read: Boolean(topic.read_at),
    read_count: topic.read_count ?? 0,
    sections
  });
});

theoryReferenceRouter.post('/:slug/read', (req, res) => {
  const topic = db.prepare('SELECT id FROM theory_topics WHERE slug = ?').get(req.params.slug);
  if (!topic) return res.status(404).json({ error: 'Topic not found' });

  const result = db.transaction(() => {
    const existing = db.prepare('SELECT * FROM theory_progress WHERE topic_id = ?').get(topic.id);
    const isFirstRead = !existing?.read_at;

    if (existing) {
      db.prepare(`UPDATE theory_progress SET read_at = datetime('now'), read_count = read_count + 1 WHERE topic_id = ?`).run(
        topic.id
      );
    } else {
      db.prepare(`INSERT INTO theory_progress (topic_id, read_at, read_count) VALUES (?, datetime('now'), 1)`).run(topic.id);
    }

    if (!isFirstRead) return { xp_gained: 0, leveled_up: false };

    const stats = db.prepare('SELECT total_xp, current_level FROM user_stats WHERE id = 1').get();
    const newTotalXp = stats.total_xp + READ_XP_BONUS;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > stats.current_level;

    db.prepare('UPDATE user_stats SET total_xp = ?, current_level = ? WHERE id = 1').run(newTotalXp, newLevel);
    db.prepare('INSERT INTO xp_events (amount) VALUES (?)').run(READ_XP_BONUS);

    return { xp_gained: READ_XP_BONUS, leveled_up: leveledUp };
  })();

  res.json(result);
});
