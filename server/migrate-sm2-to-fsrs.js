import { db } from './db/index.js';

// One-time data migration, Stage C of the FSRS switch. Only touches
// cards that are status='active', not mastered, and have actually been
// reviewed at least once (last_reviewed IS NOT NULL) -- backlog and
// mastered cards deliberately keep fsrs_* NULL (backlog gets FSRS state
// naturally when introduce.js promotes it; mastered cards are out of
// rotation entirely either way). Guarded by "fsrs_state IS NULL" so
// re-running is a no-op for anything already migrated.
//
// This is a *rough starting estimate*, not an exact SM-2->FSRS
// conversion (no such exact mapping exists -- the two models don't
// share a memory representation). It self-corrects from real answers
// after this point, same as the plan calls for.

// FSRS difficulty is 1 (easiest) .. 10 (hardest) -- the opposite
// direction from SM-2's easiness_factor (higher = easier). Anchors:
// EF 1.3 (SM-2 floor, maximally struggled) -> difficulty 10
// EF 2.5 (SM-2 default, never struggled)   -> difficulty 5 (close to
//   FSRS's own typical init_difficulty for a first "Good" rating)
// Linear between/beyond those two points, clamped to FSRS's valid range.
function difficultyFromEasinessFactor(ef) {
  const raw = 10 - ((ef - 1.3) / 1.2) * 5;
  return Math.round(Math.min(10, Math.max(1, raw)) * 100) / 100;
}

// FSRS stability is roughly "days until retrievability drops to the
// target retention" -- similar enough in spirit to SM-2's interval_days
// (the plan's own suggested approximation) to use directly, floored at
// 1 since FSRS stability must be positive.
function stabilityFromIntervalDays(intervalDays) {
  return Math.max(intervalDays, 1);
}

function toIsoMidnightUtc(dateStr) {
  return `${dateStr}T00:00:00.000Z`;
}

function migrate() {
  const rows = db
    .prepare(
      `SELECT c.id AS card_id, p.easiness_factor, p.interval_days, p.repetitions, p.due_date, p.last_reviewed
       FROM cards c
       JOIN progress p ON p.card_id = c.id
       WHERE c.status = 'active' AND c.mastered_at IS NULL AND p.last_reviewed IS NOT NULL AND p.fsrs_state IS NULL`
    )
    .all();

  const update = db.prepare(`
    UPDATE progress SET
      fsrs_stability = @fsrs_stability,
      fsrs_difficulty = @fsrs_difficulty,
      fsrs_state = @fsrs_state,
      fsrs_due = @fsrs_due,
      fsrs_reps = @fsrs_reps,
      fsrs_lapses = @fsrs_lapses,
      fsrs_learning_steps = 0,
      fsrs_elapsed_days = @fsrs_elapsed_days,
      fsrs_scheduled_days = @fsrs_scheduled_days,
      fsrs_last_review = @fsrs_last_review
    WHERE card_id = @card_id
  `);

  const run = db.transaction((items) => {
    for (const row of items) {
      // repetitions resets to 0 in SM-2 on the most recent failure --
      // treat that as "just lapsed, relearning it" rather than "Review".
      const justLapsed = row.repetitions === 0;

      update.run({
        card_id: row.card_id,
        fsrs_stability: stabilityFromIntervalDays(row.interval_days),
        fsrs_difficulty: difficultyFromEasinessFactor(row.easiness_factor),
        fsrs_state: justLapsed ? 'Relearning' : 'Review',
        fsrs_due: toIsoMidnightUtc(row.due_date), // preserve the existing schedule -- do NOT reset due dates
        fsrs_reps: Math.max(row.repetitions, 1), // last_reviewed is set, so at least one review really happened
        fsrs_lapses: justLapsed ? 1 : 0,
        fsrs_elapsed_days: row.interval_days,
        fsrs_scheduled_days: row.interval_days,
        fsrs_last_review: toIsoMidnightUtc(row.last_reviewed)
      });
    }
  });

  run(rows);

  const totalCards = db.prepare('SELECT COUNT(*) AS c FROM cards').get().c;
  const migratedCount = db.prepare(`SELECT COUNT(*) AS c FROM progress WHERE fsrs_state IS NOT NULL`).get().c;
  const backlogUntouched = db
    .prepare(`SELECT COUNT(*) AS c FROM cards WHERE status = 'backlog' AND mastered_at IS NULL`)
    .get().c;

  console.log(`Migrated ${rows.length} active reviewed card(s) to FSRS state.`);
  console.log(`Total cards: ${totalCards} (should be unchanged).`);
  console.log(`Cards with FSRS state set: ${migratedCount}.`);
  console.log(`Backlog cards (untouched, no FSRS state expected): ${backlogUntouched}.`);
}

migrate();
