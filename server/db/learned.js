// Shared "is this card learned" condition — used everywhere progress
// stats are computed. A card counts as learned through old SM-2 signals
// (frozen after the FSRS switch, Stage D of the FSRS migration — still
// valid for anything that reached this state before the switch), the
// FSRS-native equivalent (state='Review' with at least 2 reps, for
// everything reviewed after the switch), or an explicit "уже знаю" mark.
// Mastering a card never makes theme/overall progress look worse.
// Assumes `cards c LEFT JOIN progress p ON p.card_id = c.id`.
export const LEARNED_CONDITION_SQL = `(
  (p.repetitions >= 2 AND p.easiness_factor >= 2.5) OR
  (p.fsrs_state = 'Review' AND p.fsrs_reps >= 2) OR
  c.mastered_at IS NOT NULL
)`;
