const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
    term TEXT NOT NULL,
    translation_ru TEXT NOT NULL,
    transcription TEXT,
    theme TEXT NOT NULL,
    example_sentence TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS progress (
    card_id INTEGER PRIMARY KEY REFERENCES cards(id) ON DELETE CASCADE,
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL DEFAULT (date('now')),
    last_reviewed TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at TEXT,
    cards_reviewed INTEGER NOT NULL DEFAULT 0
  )`,
  `DROP TABLE IF EXISTS review_log`,
  `CREATE INDEX IF NOT EXISTS idx_progress_due_date ON progress(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_cards_theme ON cards(theme)`,
  `CREATE INDEX IF NOT EXISTS idx_cards_language ON cards(language)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at)`
];

export function runMigrations(db) {
  db.pragma('foreign_keys = ON');
  const migrate = db.transaction(() => {
    for (const sql of MIGRATIONS) {
      db.exec(sql);
    }
  });
  migrate();
}
