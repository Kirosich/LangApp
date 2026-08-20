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
  `CREATE TABLE IF NOT EXISTS theory_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS theory_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES theory_courses(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
    planned_minutes INTEGER,
    logged_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS theory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL REFERENCES theory_blocks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_progress_due_date ON progress(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_cards_theme ON cards(theme)`,
  `CREATE INDEX IF NOT EXISTS idx_cards_language ON cards(language)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at)`,
  `CREATE INDEX IF NOT EXISTS idx_theory_blocks_course ON theory_blocks(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_theory_items_block ON theory_items(block_id)`,
  `CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    best_day_cards INTEGER NOT NULL DEFAULT 0,
    best_session_minutes INTEGER NOT NULL DEFAULT 0
  )`,
  `INSERT OR IGNORE INTO user_stats (id) VALUES (1)`,
  `CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    earned_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`
];

function addColumnIfMissing(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function runMigrations(db) {
  db.pragma('foreign_keys = ON');
  const migrate = db.transaction(() => {
    for (const sql of MIGRATIONS) {
      db.exec(sql);
    }
    addColumnIfMissing(db, 'study_sessions', 'correct_count', 'INTEGER');
  });
  migrate();
}
