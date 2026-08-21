// Every date computation the Telegram bot makes uses Asia/Almaty local
// time, independent of the rest of the app's existing UTC-based "today"
// (cards.js due_date, computeStreak, etc.) -- those stay as they are.
// The bot needs its own day boundary specifically because a session at
// 23:50 Almaty time is still "today" in Almaty even though the server's
// own UTC clock may already be on the next calendar day (Almaty is
// UTC+5, so its calendar day starts 5 hours before UTC's does).

const TZ = 'Asia/Almaty';

const PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  weekday: 'short'
});

function partsOf(date) {
  const raw = {};
  for (const part of PARTS_FORMATTER.formatToParts(date)) {
    if (part.type !== 'literal') raw[part.type] = part.value;
  }
  return {
    year: Number(raw.year),
    month: Number(raw.month),
    day: Number(raw.day),
    hour: Number(raw.hour),
    minute: Number(raw.minute),
    second: Number(raw.second),
    weekday: raw.weekday // 'Sun'..'Sat'
  };
}

// Minutes to ADD to a UTC instant's wall-clock fields to get Almaty's.
// Derived from Intl rather than hardcoded, so this keeps working even if
// Kazakhstan's UTC offset (or IANA's data for it) ever changes again.
function offsetMinutes(date) {
  const p = partsOf(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

export function almatyDateString(date = new Date()) {
  const p = partsOf(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

// [start, end) of the current Almaty calendar day, as SQLite
// 'YYYY-MM-DD HH:MM:SS' UTC strings -- directly comparable against
// study_sessions.started_at (stored via SQLite's datetime('now'), UTC).
export function almatyDayBoundsUtc(date = new Date()) {
  const offset = offsetMinutes(date);
  const p = partsOf(date);
  const startMs = Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0) - offset * 60000;
  const endMs = startMs + 24 * 3600000;
  const toSqlite = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
  return { start: toSqlite(startMs), end: toSqlite(endMs) };
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Next real-world UTC Date instant for the given Almaty local hour:minute
// -- today if it hasn't passed yet, otherwise the next matching day.
// Pass weekday (0=Sun..6=Sat) to only match a specific day of the week
// (e.g. the Monday recap). No persisted state needed: since this is
// always computed fresh from the current real time, a container restart
// just recomputes the correct next occurrence -- nothing to recover.
export function nextAlmatyOccurrence({ hour, minute = 0, weekday = null }) {
  const now = new Date();
  const offset = offsetMinutes(now);
  const p = partsOf(now);
  const todayCandidateMs = Date.UTC(p.year, p.month - 1, p.day, hour, minute, 0) - offset * 60000;

  let deltaDays = 0;
  if (weekday !== null) {
    const currentWeekday = WEEKDAYS.indexOf(p.weekday);
    deltaDays = (weekday - currentWeekday + 7) % 7;
    if (deltaDays === 0 && todayCandidateMs <= now.getTime()) deltaDays = 7;
  } else if (todayCandidateMs <= now.getTime()) {
    deltaDays = 1;
  }

  return new Date(todayCandidateMs + deltaDays * 24 * 3600000);
}
