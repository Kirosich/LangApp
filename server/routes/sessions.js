import { Router } from 'express';
import { db } from '../db/index.js';
import { onSessionEnd } from '../gamification/onSessionEnd.js';

export const sessionsRouter = Router();

const VALID_SESSION_TYPES = new Set(['study', 'quiz_choice', 'quiz_typing', 'quiz_matching']);

sessionsRouter.post('/start', (req, res) => {
  const { session_type } = req.body;
  if (!VALID_SESSION_TYPES.has(session_type)) {
    return res.status(400).json({ error: `session_type must be one of: ${[...VALID_SESSION_TYPES].join(', ')}` });
  }

  const info = db.prepare('INSERT INTO study_sessions (session_type) VALUES (?)').run(session_type);
  res.status(201).json({ id: info.lastInsertRowid });
});

sessionsRouter.post('/:id/end', (req, res) => {
  const { id } = req.params;
  const cardsReviewed = Number.isInteger(req.body.cards_reviewed) ? req.body.cards_reviewed : 0;
  const correctCount = Number.isInteger(req.body.correct_count) ? req.body.correct_count : null;

  const updateAndCheck = db.transaction(() => {
    const info = db
      .prepare(`UPDATE study_sessions SET ended_at = datetime('now'), cards_reviewed = ?, correct_count = ? WHERE id = ?`)
      .run(cardsReviewed, correctCount, id);

    if (info.changes === 0) return false;

    const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(id);
    onSessionEnd(db, session);
    return true;
  });

  const found = updateAndCheck();
  if (!found) return res.status(404).json({ error: 'Session not found' });
  res.status(204).end();
});
