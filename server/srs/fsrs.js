import { fsrs, generatorParameters, createEmptyCard, Rating } from 'ts-fsrs';

// Matches ts-fsrs's State enum order exactly (New=0, Learning=1,
// Review=2, Relearning=3) -- used to store/restore fsrs_state as a
// readable string instead of a bare integer.
const STATE_NAMES = ['New', 'Learning', 'Review', 'Relearning'];

// The app's 4 existing rating buttons keep sending the SM-2-flavored
// quality values they always have (1/3/4/5 -- see client RATINGS in
// Study.jsx). This is the one-time translation into FSRS's 4 grades;
// the UI itself never changes.
const QUALITY_TO_GRADE = {
  1: Rating.Again, // 'Заново'
  3: Rating.Hard, // 'Трудно'
  4: Rating.Good, // 'Хорошо'
  5: Rating.Easy // 'Легко'
};

export function qualityToGrade(quality) {
  const grade = QUALITY_TO_GRADE[quality];
  if (grade === undefined) {
    throw new Error(`quality ${quality} has no FSRS grade mapping (expected 1, 3, 4, or 5)`);
  }
  return grade;
}

// Rebuilds a ts-fsrs Card from a progress row's fsrs_* columns. Returns
// null for a row that's never been through FSRS yet (fsrs_state is
// null) -- callers should createEmptyCard() in that case instead.
export function cardFromProgress(row) {
  if (!row || !row.fsrs_state) return null;
  return {
    due: new Date(row.fsrs_due),
    stability: row.fsrs_stability,
    difficulty: row.fsrs_difficulty,
    elapsed_days: row.fsrs_elapsed_days ?? 0,
    scheduled_days: row.fsrs_scheduled_days ?? 0,
    learning_steps: row.fsrs_learning_steps ?? 0,
    reps: row.fsrs_reps ?? 0,
    lapses: row.fsrs_lapses ?? 0,
    state: STATE_NAMES.indexOf(row.fsrs_state),
    last_review: row.fsrs_last_review ? new Date(row.fsrs_last_review) : undefined
  };
}

// Inverse of cardFromProgress -- flattens a ts-fsrs Card into the column
// names on progress, ready for an UPDATE.
export function progressFieldsFromCard(card) {
  return {
    fsrs_stability: card.stability,
    fsrs_difficulty: card.difficulty,
    fsrs_state: STATE_NAMES[card.state],
    fsrs_due: card.due.toISOString(),
    fsrs_reps: card.reps,
    fsrs_lapses: card.lapses,
    fsrs_learning_steps: card.learning_steps,
    fsrs_elapsed_days: card.elapsed_days,
    fsrs_scheduled_days: card.scheduled_days,
    fsrs_last_review: card.last_review ? card.last_review.toISOString() : null
  };
}

/**
 * Pure FSRS scheduling step -- no DB access. Callers own reading the
 * current state and persisting the result (progress columns + a
 * review_log row).
 * @param {object} params
 * @param {object|null} params.existingCard - result of cardFromProgress(), or null for a card that has never been scheduled by FSRS
 * @param {number} params.quality - the app's existing 1/3/4/5 rating
 * @param {number} [params.requestRetention] - target retention, from fsrs_settings
 * @param {Date} [params.now]
 */
export function nextReview({ existingCard, quality, requestRetention = 0.9, now = new Date() }) {
  const grade = qualityToGrade(quality);
  const card = existingCard ?? createEmptyCard(now);
  const scheduler = fsrs(generatorParameters({ request_retention: requestRetention }));
  const { card: nextCard, log } = scheduler.next(card, now, grade);

  return {
    card: nextCard,
    progressFields: progressFieldsFromCard(nextCard),
    reviewLog: {
      rating: grade,
      elapsed_days: log.elapsed_days,
      scheduled_days: log.scheduled_days
    }
  };
}
