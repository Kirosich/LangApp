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
  )`,
  `CREATE TABLE IF NOT EXISTS xp_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at)`,
  `CREATE TABLE IF NOT EXISTS theory_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS theory_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES theory_topics(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN ('explanation', 'example', 'common_mistake', 'exercise_hint')),
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS theory_progress (
    topic_id INTEGER PRIMARY KEY REFERENCES theory_topics(id) ON DELETE CASCADE,
    read_at TEXT,
    read_count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_theory_topics_language ON theory_topics(language)`,
  `CREATE INDEX IF NOT EXISTS idx_theory_sections_topic ON theory_sections(topic_id)`,
  `CREATE TABLE IF NOT EXISTS daily_intro_log (
    date TEXT NOT NULL,
    language TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (date, language)
  )`,
  `CREATE TABLE IF NOT EXISTS intro_settings (
    language TEXT PRIMARY KEY,
    new_cards_per_day INTEGER NOT NULL DEFAULT 8
  )`,
  `INSERT OR IGNORE INTO intro_settings (language, new_cards_per_day) VALUES ('kz', 8)`,
  `INSERT OR IGNORE INTO intro_settings (language, new_cards_per_day) VALUES ('en', 8)`,
  // Optional link from a card theme to a theory reference topic (e.g.
  // theme "глаголы" -> slug "kz-verb-tenses"). Not every theme has one —
  // seeded separately via seed-theory-links.js, after theory topics exist.
  `CREATE TABLE IF NOT EXISTS theory_theme_links (
    language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
    theme TEXT NOT NULL,
    topic_slug TEXT NOT NULL REFERENCES theory_topics(slug) ON DELETE CASCADE,
    PRIMARY KEY (language, theme)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_theory_theme_links_slug ON theory_theme_links(topic_slug)`,
  // Grammar drills attached to a reference topic (Stage 8, wave 2):
  // multiple-choice questions where the distractors are meant to be
  // realistic mistakes (wrong vowel-harmony/voicing variant of a suffix),
  // not random noise -- content lives in seed-theory-drills.js.
  `CREATE TABLE IF NOT EXISTS theory_drills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES theory_topics(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    distractors TEXT NOT NULL,
    explanation TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_theory_drills_topic ON theory_drills(topic_id)`,
  // Scenario dialogues (Stage 10, wave 2): reference content, read like a
  // theory topic (not a quiz -- no session_type needed). Content is
  // built predominantly from vocabulary already present in `cards`;
  // dialogue_new_words tracks the handful of words per dialogue that
  // aren't in the deck yet, shown transparently in the UI rather than
  // silently dumped into the dialogue.
  `CREATE TABLE IF NOT EXISTS dialogues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    scenario TEXT NOT NULL,
    level TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS dialogue_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dialogue_id INTEGER NOT NULL REFERENCES dialogues(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    speaker TEXT NOT NULL,
    text TEXT NOT NULL,
    translation_ru TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dialogue_new_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dialogue_id INTEGER NOT NULL REFERENCES dialogues(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    translation_ru TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS dialogue_progress (
    dialogue_id INTEGER PRIMARY KEY REFERENCES dialogues(id) ON DELETE CASCADE,
    read_at TEXT,
    read_count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dialogues_language ON dialogues(language)`,
  `CREATE INDEX IF NOT EXISTS idx_dialogue_lines_dialogue ON dialogue_lines(dialogue_id)`,
  `CREATE INDEX IF NOT EXISTS idx_dialogue_new_words_dialogue ON dialogue_new_words(dialogue_id)`
];

function addColumnIfMissing(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// SQLite can't ALTER a CHECK constraint in place, so widening the allowed
// session_type set means recreating the table. Guarded by inspecting the
// stored schema text so this only runs once, ever.
function ensureSessionTypeAllowsSentence(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes('quiz_sentence')) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

function ensureSessionTypeAllowsTheoryDrill(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes('theory_drill')) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

function ensureSessionTypeAllowsListening(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes('quiz_listening')) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

export function runMigrations(db) {
  db.pragma('foreign_keys = ON');
  const migrate = db.transaction(() => {
    for (const sql of MIGRATIONS) {
      db.exec(sql);
    }
    addColumnIfMissing(db, 'study_sessions', 'correct_count', 'INTEGER');
    ensureSessionTypeAllowsSentence(db);
    ensureSessionTypeAllowsTheoryDrill(db);
    ensureSessionTypeAllowsListening(db);
    addColumnIfMissing(db, 'cards', 'status', "TEXT NOT NULL DEFAULT 'active'");
    addColumnIfMissing(db, 'cards', 'activated_at', 'TEXT');
    addColumnIfMissing(db, 'cards', 'mastered_at', 'TEXT');
    // Backfill: cards that predate this column are already active, so treat
    // their creation as their activation moment.
    db.exec(`UPDATE cards SET activated_at = created_at WHERE status = 'active' AND activated_at IS NULL`);
  });
  migrate();
}
