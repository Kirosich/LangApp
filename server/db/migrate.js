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
  `CREATE INDEX IF NOT EXISTS idx_dialogue_new_words_dialogue ON dialogue_new_words(dialogue_id)`,

  // --- FSRS migration, Stage A -------------------------------------
  // Raw review history -- doesn't exist yet (the old review_log table
  // was dropped years ago and never replaced). Needed both to build
  // each review's elapsed_days/scheduled_days and, later, to
  // personalize FSRS's weights once there's 1000+ reviews logged.
  `CREATE TABLE IF NOT EXISTS review_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3, 4)),
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
    elapsed_days REAL,
    scheduled_days REAL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_review_log_card ON review_log(card_id)`,
  `CREATE INDEX IF NOT EXISTS idx_review_log_reviewed_at ON review_log(reviewed_at)`,

  // Single-row settings table (same pattern as user_stats id=1) for the
  // one FSRS knob worth exposing: target retention. Not surfaced as a
  // required UI control -- deliberately DB-only for now, per the plan.
  `CREATE TABLE IF NOT EXISTS fsrs_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    request_retention REAL NOT NULL DEFAULT 0.9
  )`,
  `INSERT OR IGNORE INTO fsrs_settings (id) VALUES (1)`
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

// Same recreate-table dance, widening the CHECK once more for the level
// exam feature. Has to carry the `language` column through too (added
// later via addColumnIfMissing), since a table recreate loses any column
// not explicitly listed.
function ensureSessionTypeAllowsLevelExam(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes('level_exam')) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening', 'level_exam')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER,
      language TEXT
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count, language)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count, language FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

function ensureSessionTypeAllowsReading(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes("'reading'")) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening', 'level_exam', 'reading')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER,
      language TEXT
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count, language)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count, language FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

function ensureSessionTypeAllowsMediaExam(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes("'media_exam'")) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening', 'level_exam', 'reading', 'media_exam')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER,
      language TEXT
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count, language)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count, language FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

function ensureSessionTypeAllowsProficiencyTest(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes("'proficiency_test'")) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening', 'level_exam', 'reading', 'media_exam', 'proficiency_test')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER,
      language TEXT
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count, language)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count, language FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

// Reading a reference-topic page and going through a dialogue previously
// tracked no time at all (no session_type covered either). Added
// together since both are "just open the screen and read/listen"
// activities with no natural start/end signal besides page mount/unmount.
function ensureSessionTypeAllowsTheoryReadAndDialogue(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'study_sessions'`).get();
  if (!row || row.sql.includes("'theory_read'")) return;

  db.exec(`
    ALTER TABLE study_sessions RENAME TO study_sessions_old;
    CREATE TABLE study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK (session_type IN ('study', 'quiz_choice', 'quiz_typing', 'quiz_matching', 'quiz_sentence', 'theory_drill', 'quiz_listening', 'level_exam', 'reading', 'media_exam', 'proficiency_test', 'theory_read', 'dialogue')),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER,
      language TEXT
    );
    INSERT INTO study_sessions (id, session_type, started_at, ended_at, cards_reviewed, correct_count, language)
      SELECT id, session_type, started_at, ended_at, cards_reviewed, correct_count, language FROM study_sessions_old;
    DROP TABLE study_sessions_old;
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);
  `);
}

// Widens badges from UNIQUE(code) to UNIQUE(code, language) -- most
// badges (streak_7, streak_30, words_100, words_250, perfect_quiz) can
// now be earned once per language; a few (night_owl, marathon_30min --
// about *when*/*how long* a session was, not its content) stay
// language-independent, stored with language = NULL. Existing badge
// rows keep language = NULL (legacy/unattributed), same reasoning as
// user_stats_by_language above -- there's no reliable way to say
// in hindsight which language a past streak_7 belonged to.
function ensureBadgesAllowPerLanguage(db) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'badges'`).get();
  if (!row || row.sql.includes('language')) return;

  db.exec(`
    ALTER TABLE badges RENAME TO badges_old;
    CREATE TABLE badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      language TEXT,
      earned_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO badges (id, code, earned_at) SELECT id, code, earned_at FROM badges_old;
    DROP TABLE badges_old;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_code_language ON badges(code, language);
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

    // FSRS fields on progress (Stage A). Old SM-2 columns (easiness_factor,
    // interval_days, repetitions, due_date, last_reviewed) are untouched
    // and keep being the live source of truth until Stage D switches
    // reads over to fsrs_due. All nullable: backlog/mastered cards never
    // get these populated (see Stage C), so a plain NULL check is how
    // "has this card been migrated to FSRS yet" gets answered later.
    addColumnIfMissing(db, 'progress', 'fsrs_stability', 'REAL');
    addColumnIfMissing(db, 'progress', 'fsrs_difficulty', 'REAL');
    addColumnIfMissing(db, 'progress', 'fsrs_state', 'TEXT');
    addColumnIfMissing(db, 'progress', 'fsrs_due', 'TEXT');
    // Round out ts-fsrs's Card shape so it can be reconstructed exactly
    // between reviews instead of being approximated each time.
    addColumnIfMissing(db, 'progress', 'fsrs_reps', 'INTEGER');
    addColumnIfMissing(db, 'progress', 'fsrs_lapses', 'INTEGER');
    addColumnIfMissing(db, 'progress', 'fsrs_learning_steps', 'INTEGER');
    addColumnIfMissing(db, 'progress', 'fsrs_elapsed_days', 'REAL');
    addColumnIfMissing(db, 'progress', 'fsrs_scheduled_days', 'REAL');
    addColumnIfMissing(db, 'progress', 'fsrs_last_review', 'TEXT');

    // CEFR level (A1/A2/B1/B2/C1) per card, nullable -- lets vocabulary
    // growth be scoped by difficulty instead of just theme. Backfilled for
    // existing cards by a one-off script, not here.
    addColumnIfMissing(db, 'cards', 'level', 'TEXT');

    // Which language a session was scoped to, nullable -- lets time-spent
    // stats be split per language. NULL for sessions started without a
    // language filter (the "Все" tab can mix kz+en cards in one session,
    // so there's no single language to attribute it to) and for anything
    // recorded before this column existed.
    addColumnIfMissing(db, 'study_sessions', 'language', 'TEXT');

    // Groups theory_topics into named categories (падежи, tenses, etc.) --
    // topics within a category can span multiple CEFR levels; the
    // category's own level range is computed from its topics rather than
    // stored, so it can't drift out of sync.
    addColumnIfMissing(db, 'theory_topics', 'category', 'TEXT');

    // Must run after the `language` column above -- it needs to carry that
    // column through the table recreate.
    ensureSessionTypeAllowsLevelExam(db);

    // One row per exam attempt (not just the best/latest) -- keeps a
    // full history, and "passed" is derived (score === total) rather than
    // trusted from the client, matching how every other score in this app
    // is server-computed.
    db.exec(`
      CREATE TABLE IF NOT EXISTS level_exam_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
        level TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        taken_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_level_exam_attempts_lang_level ON level_exam_attempts(language, level);
    `);

    // Reading section -- structurally a close copy of dialogues (text +
    // new-words callout + progress), plus per-text comprehension
    // exercises. `style` distinguishes texts built tightly around deck
    // vocabulary ('textbook') from ones written in an authentic genre
    // register with more natural (less constrained) language ('genre') --
    // both are original writing, never copied from external sources.
    db.exec(`
      CREATE TABLE IF NOT EXISTS reading_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        theme TEXT NOT NULL,
        level TEXT NOT NULL,
        style TEXT NOT NULL CHECK (style IN ('textbook', 'genre')),
        body TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS reading_new_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL REFERENCES reading_texts(id) ON DELETE CASCADE,
        term TEXT NOT NULL,
        translation_ru TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS reading_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL REFERENCES reading_texts(id) ON DELETE CASCADE,
        prompt TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        distractors TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS reading_progress (
        text_id INTEGER PRIMARY KEY REFERENCES reading_texts(id) ON DELETE CASCADE,
        read_at TEXT,
        read_count INTEGER NOT NULL DEFAULT 0,
        best_score INTEGER,
        best_score_total INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_reading_texts_language ON reading_texts(language);
      CREATE INDEX IF NOT EXISTS idx_reading_new_words_text ON reading_new_words(text_id);
      CREATE INDEX IF NOT EXISTS idx_reading_exercises_text ON reading_exercises(text_id);
    `);

    // Must run after study_sessions' `language` column exists (recreate
    // carries it through), same as ensureSessionTypeAllowsLevelExam.
    ensureSessionTypeAllowsReading(db);

    // Movies/series section: a media entry is a thematic anchor, not a
    // content source (see CLAUDE.md's copyright constraint) -- everything
    // written about it (media_texts.body, comprehension_questions) is
    // original writing "in the spirit of" the genre/setting, never a
    // retelling. media_vocab_links is a plain many-to-many join onto the
    // existing `cards` table -- vocab tied to a title still goes through
    // the normal backlog/theme mechanism, this table just remembers which
    // cards were picked for which title. comprehension_questions is a
    // JSON array (not a separate table like reading_exercises) since each
    // text only needs a handful and the exam pool reads the same JSON
    // across all of an entry's texts -- one fewer table for a small
    // amount of data per row.
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
        year INTEGER,
        genre TEXT,
        language_focus TEXT NOT NULL CHECK (language_focus IN ('kz', 'en')),
        one_line_theme TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS media_vocab_links (
        media_entry_id INTEGER NOT NULL REFERENCES media_entries(id) ON DELETE CASCADE,
        card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        PRIMARY KEY (media_entry_id, card_id)
      );
      CREATE TABLE IF NOT EXISTS media_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_entry_id INTEGER NOT NULL REFERENCES media_entries(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        level TEXT NOT NULL,
        body TEXT NOT NULL,
        comprehension_questions TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS media_exam_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_entry_id INTEGER NOT NULL REFERENCES media_entries(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        taken_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_media_vocab_links_entry ON media_vocab_links(media_entry_id);
      CREATE INDEX IF NOT EXISTS idx_media_texts_entry ON media_texts(media_entry_id);
      CREATE INDEX IF NOT EXISTS idx_media_exam_results_entry ON media_exam_results(media_entry_id);
    `);

    // Must run after study_sessions' `language` column exists (same reason
    // as the two calls above).
    ensureSessionTypeAllowsMediaExam(db);

    // Proficiency test ("Тест на уровень"): a broader diagnostic than the
    // grammar-only level exam -- vocabulary + grammar now (Этап A),
    // listening and writing sections land in later stages. Only 4 fixed
    // test definitions exist (kz-A1, kz-A2, en-B1, en-B2), enforced at
    // the route layer, not by a CHECK here (keeps the schema from having
    // to change if a 5th test gets added later).
    db.exec(`
      CREATE TABLE IF NOT EXISTS proficiency_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
        target_level TEXT NOT NULL,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        overall_verdict TEXT
      );
      CREATE TABLE IF NOT EXISTS proficiency_test_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER NOT NULL REFERENCES proficiency_tests(id) ON DELETE CASCADE,
        section_type TEXT NOT NULL CHECK (section_type IN ('vocabulary', 'grammar', 'listening', 'writing')),
        score_percent INTEGER,
        skipped INTEGER NOT NULL DEFAULT 0,
        skip_reason TEXT,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_proficiency_tests_lang_level ON proficiency_tests(language, target_level);
      CREATE INDEX IF NOT EXISTS idx_proficiency_test_sections_test ON proficiency_test_sections(test_id);
    `);
    ensureSessionTypeAllowsProficiencyTest(db);

    // Listening section (Этап B): short original passages for the
    // "listen to a passage, answer questions" sub-type, and word pairs
    // for the "which did you hear" minimal-pairs sub-type. Both original
    // content, never copied.
    db.exec(`
      CREATE TABLE IF NOT EXISTS proficiency_listening_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
        level TEXT NOT NULL,
        body TEXT NOT NULL,
        comprehension_questions TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS proficiency_minimal_pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT NOT NULL CHECK (language IN ('kz', 'en')),
        word_a TEXT NOT NULL,
        word_b TEXT NOT NULL,
        contrast_label TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_proficiency_listening_texts_lang_level ON proficiency_listening_texts(language, level);
      CREATE INDEX IF NOT EXISTS idx_proficiency_minimal_pairs_language ON proficiency_minimal_pairs(language);
    `);

    // Per-language XP/level/streak tracking, additive alongside the
    // existing app-wide `user_stats` (id=1) -- deliberately NOT backfilled
    // from history. Investigated before writing this: xp_events has no
    // card/session/language link at all (just amount + timestamp), and
    // review_log (which could otherwise map card_id -> language) has 0
    // rows -- it only started logging with the FSRS migration. 47 of the
    // 48 existing study_sessions predate the `language` column entirely.
    // There is no honest way to split the existing 616 XP / streak-2
    // history by language without inventing numbers, so these two rows
    // start at zero and accumulate for real from here on, same as every
    // XP-awarding code path already knows the language of what it's
    // crediting (a card, a reading text, a dialogue, a theory topic).
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_stats_by_language (
        language TEXT PRIMARY KEY CHECK (language IN ('kz', 'en')),
        total_xp INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 1,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        best_day_cards INTEGER NOT NULL DEFAULT 0,
        best_session_minutes INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO user_stats_by_language (language) VALUES ('kz'), ('en');
    `);

    ensureBadgesAllowPerLanguage(db);
    ensureSessionTypeAllowsTheoryReadAndDialogue(db);
  });
  migrate();
}
