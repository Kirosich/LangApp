function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Standard SM-2 algorithm (as used by SuperMemo/Anki).
 * @param {{easiness_factor: number, interval_days: number, repetitions: number}} progress
 * @param {number} quality 0-5 (0-2 = forgot, 3 = hard, 4 = good, 5 = easy)
 * @param {Date} [now] reference date, defaults to current time (for testability)
 * @returns {{easiness_factor: number, interval_days: number, repetitions: number, due_date: string, last_reviewed: string}}
 */
export function calculateNextReview(progress, quality, now = new Date()) {
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new Error('quality must be an integer between 0 and 5');
  }

  let { easiness_factor: ef, repetitions } = progress;
  let interval;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(progress.interval_days * ef);
    }
    repetitions += 1;
  }

  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const last_reviewed = formatDate(now);
  const due_date = formatDate(addDays(now, interval));

  return {
    easiness_factor: Math.round(ef * 100) / 100,
    interval_days: interval,
    repetitions,
    due_date,
    last_reviewed
  };
}
