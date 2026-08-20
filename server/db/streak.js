function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(db) {
  const rows = db
    .prepare(`SELECT DISTINCT date(started_at) AS day FROM study_sessions WHERE ended_at IS NOT NULL`)
    .all();
  const days = new Set(rows.map((r) => r.day));

  const today = new Date().toISOString().slice(0, 10);
  let cursor = today;

  if (!days.has(cursor)) {
    cursor = addDays(today, -1);
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
