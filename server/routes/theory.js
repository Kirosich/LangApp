import { Router } from 'express';
import { db } from '../db/index.js';

export const theoryRouter = Router();

function courseWithProgress(course) {
  const { total, done } = db
    .prepare(
      `SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN i.done THEN 1 ELSE 0 END), 0) AS done
       FROM theory_items i
       JOIN theory_blocks b ON b.id = i.block_id
       WHERE b.course_id = ?`
    )
    .get(course.id);

  return { ...course, items_total: total, items_done: done };
}

function blockWithProgress(block) {
  const { total, done } = db
    .prepare(`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN done THEN 1 ELSE 0 END), 0) AS done FROM theory_items WHERE block_id = ?`)
    .get(block.id);

  return { ...block, items_total: total, items_done: done };
}

// --- Courses ---

theoryRouter.get('/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM theory_courses ORDER BY position ASC, id ASC').all();
  res.json(courses.map(courseWithProgress));
});

theoryRouter.post('/courses', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const position = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM theory_courses').get().next;
  const info = db
    .prepare('INSERT INTO theory_courses (title, description, position) VALUES (?, ?, ?)')
    .run(title, description ?? null, position);

  const course = db.prepare('SELECT * FROM theory_courses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(courseWithProgress(course));
});

theoryRouter.get('/courses/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM theory_courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const blocks = db
    .prepare('SELECT * FROM theory_blocks WHERE course_id = ? ORDER BY position ASC, id ASC')
    .all(req.params.id)
    .map(blockWithProgress);

  res.json({ ...courseWithProgress(course), blocks });
});

theoryRouter.put('/courses/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM theory_courses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Course not found' });

  const merged = { ...existing, ...req.body };
  db.prepare('UPDATE theory_courses SET title = ?, description = ? WHERE id = ?').run(
    merged.title,
    merged.description ?? null,
    req.params.id
  );
  res.json(courseWithProgress(db.prepare('SELECT * FROM theory_courses WHERE id = ?').get(req.params.id)));
});

theoryRouter.delete('/courses/:id', (req, res) => {
  const info = db.prepare('DELETE FROM theory_courses WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Course not found' });
  res.status(204).end();
});

// --- Blocks ---

theoryRouter.post('/courses/:courseId/blocks', (req, res) => {
  const { title, description, planned_minutes } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const course = db.prepare('SELECT id FROM theory_courses WHERE id = ?').get(req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const position = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM theory_blocks WHERE course_id = ?')
    .get(req.params.courseId).next;

  const info = db
    .prepare('INSERT INTO theory_blocks (course_id, position, title, description, planned_minutes) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.courseId, position, title, description ?? null, planned_minutes ?? null);

  const block = db.prepare('SELECT * FROM theory_blocks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(blockWithProgress(block));
});

theoryRouter.get('/blocks/:id', (req, res) => {
  const block = db.prepare('SELECT * FROM theory_blocks WHERE id = ?').get(req.params.id);
  if (!block) return res.status(404).json({ error: 'Block not found' });

  const items = db.prepare('SELECT * FROM theory_items WHERE block_id = ? ORDER BY position ASC, id ASC').all(req.params.id);
  res.json({ ...blockWithProgress(block), items });
});

theoryRouter.put('/blocks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM theory_blocks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Block not found' });

  const VALID_STATUSES = new Set(['not_started', 'in_progress', 'done']);
  if (req.body.status !== undefined && !VALID_STATUSES.has(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${[...VALID_STATUSES].join(', ')}` });
  }

  const merged = { ...existing, ...req.body };
  db.prepare(
    `UPDATE theory_blocks SET title = ?, description = ?, status = ?, planned_minutes = ?, logged_minutes = ? WHERE id = ?`
  ).run(merged.title, merged.description ?? null, merged.status, merged.planned_minutes ?? null, merged.logged_minutes, req.params.id);

  res.json(blockWithProgress(db.prepare('SELECT * FROM theory_blocks WHERE id = ?').get(req.params.id)));
});

theoryRouter.delete('/blocks/:id', (req, res) => {
  const info = db.prepare('DELETE FROM theory_blocks WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Block not found' });
  res.status(204).end();
});

// --- Items ---

theoryRouter.post('/blocks/:blockId/items', (req, res) => {
  const { label, notes } = req.body;
  if (!label) return res.status(400).json({ error: 'label is required' });

  const block = db.prepare('SELECT id FROM theory_blocks WHERE id = ?').get(req.params.blockId);
  if (!block) return res.status(404).json({ error: 'Block not found' });

  const position = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM theory_items WHERE block_id = ?')
    .get(req.params.blockId).next;

  const info = db
    .prepare('INSERT INTO theory_items (block_id, position, label, notes) VALUES (?, ?, ?, ?)')
    .run(req.params.blockId, position, label, notes ?? null);

  const item = db.prepare('SELECT * FROM theory_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(item);
});

theoryRouter.put('/items/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM theory_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const merged = { ...existing, ...req.body };
  db.prepare('UPDATE theory_items SET label = ?, done = ?, notes = ? WHERE id = ?').run(
    merged.label,
    merged.done ? 1 : 0,
    merged.notes ?? null,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM theory_items WHERE id = ?').get(req.params.id));
});

theoryRouter.delete('/items/:id', (req, res) => {
  const info = db.prepare('DELETE FROM theory_items WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});
