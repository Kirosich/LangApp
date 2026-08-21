function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// language omitted (undefined) -> exact old behavior, every session
// counts regardless of language. Passed -> only sessions tagged with
// that language count (most historical sessions predate the `language`
// column and won't match either way, so a language-specific streak
// is only as long as real history since that column started being set).
export function computeStreak(db, language) {
  const languageClause = language ? 'AND language = ?' : '';
  const params = language ? [language] : [];
  const rows = db
    .prepare(`SELECT DISTINCT date(started_at) AS day FROM study_sessions WHERE ended_at IS NOT NULL ${languageClause}`)
    .all(...params);
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
