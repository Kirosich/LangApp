// Shared "is this card learned" condition — used everywhere progress
// stats are computed. A card counts as learned either through normal SRS
// practice (repetitions/easiness_factor) or via an explicit "уже знаю"
// mark, so mastering a card never makes theme/overall progress look
// worse. Assumes `cards c LEFT JOIN progress p ON p.card_id = c.id`.
export const LEARNED_CONDITION_SQL = '((p.repetitions >= 2 AND p.easiness_factor >= 2.5) OR c.mastered_at IS NOT NULL)';
