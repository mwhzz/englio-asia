import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { activitySummary } from './activity.ts';
import { fairXpByDay } from './fairPlay.ts';
import { migrateReports } from './reports.ts';
import { migrateTeam } from './team.ts';
import { migrateAdminAuth } from './adminAuth.ts';
import { migrateErrors } from './errors.ts';

/** The database file; set DB_PATH to keep it somewhere else. */
export const DB_PATH = process.env.DB_PATH ?? fileURLToPath(new URL('./englio.db', import.meta.url));

const SCHEMA = `
  -- Course content. Each lesson's words, sentences, blanks, gaps, grammar points and
  -- dialogues are rows in items, with the kind-specific fields as JSON in data.
  CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    color TEXT NOT NULL,
    tips TEXT NOT NULL DEFAULT '[]',
    levels TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_bn TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('vocab', 'sentence', 'fill', 'gaps', 'grammar', 'dialog')),
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS items_by_lesson ON items(lesson_id, kind, position);

  -- Grammar topics for the grammar page; each topic's content is JSON in data.
  CREATE TABLE IF NOT EXISTS grammar (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );

  -- Step-by-step grammar courses, one per topic (JSON in data), and short stories.
  CREATE TABLE IF NOT EXISTS grammar_courses (
    topic_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS board_topics (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );
  -- Writing practice (paragraphs, letters, applications…), each task as JSON in data.
  CREATE TABLE IF NOT EXISTS writing_tasks (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    data TEXT NOT NULL
  );

  -- Learners. The app sends its whole progress; the columns copy what the admin lists and sorts by.
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    district_id TEXT,
    class_id TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    lessons_done INTEGER NOT NULL DEFAULT 0,
    joined_at TEXT,
    last_seen TEXT NOT NULL,
    progress TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS users_by_xp ON users(xp DESC);
  CREATE INDEX IF NOT EXISTS users_by_seen ON users(last_seen DESC);

  -- Daily reminders: one push subscription per device, with the local hour to remind at.
  CREATE TABLE IF NOT EXISTS push_subs (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    subscription TEXT NOT NULL,
    hour INTEGER NOT NULL,
    time_zone TEXT NOT NULL
  );

  -- Friends: a shareable code per learner, and who follows whom (both ways).
  CREATE TABLE IF NOT EXISTS friend_codes (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS friends (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, friend_id)
  );

  -- Real accounts: a phone number or Google account linked to a learner, and the sign-in codes sent by SMS.
  CREATE TABLE IF NOT EXISTS accounts (
    kind TEXT NOT NULL CHECK (kind IN ('phone', 'google')),
    subject TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT,
    PRIMARY KEY (kind, subject)
  );
  CREATE TABLE IF NOT EXISTS otp_codes (
    phone TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    tries INTEGER NOT NULL
  );

  -- Englio Plus: bKash payments, and until when each learner has it.
  CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    trx_id TEXT,
    created_at TEXT NOT NULL
  );
  -- Free trials taken (once per learner) and promo codes worth Plus days (promo.ts).
  CREATE TABLE IF NOT EXISTS trials (user_id TEXT PRIMARY KEY, at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    days INTEGER NOT NULL,
    uses_left INTEGER NOT NULL,
    expires_at TEXT,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS promo_uses (
    code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    at TEXT NOT NULL,
    PRIMARY KEY (code, user_id)
  );
  CREATE TABLE IF NOT EXISTS premium (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    until TEXT NOT NULL
  );

  -- Backup codes: type one on a new phone to bring your progress over (or to delete it from the web).
  CREATE TABLE IF NOT EXISTS restore_codes (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );

  -- Anonymous daily counts from the apps (lesson starts and finishes, missed exercises).
  CREATE TABLE IF NOT EXISTS events (
    day TEXT NOT NULL,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    n INTEGER NOT NULL,
    PRIMARY KEY (day, name, key)
  );

  -- Admin team members (the owner is ADMIN_TOKEN) and a log of every change made in the admin panel.
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'support')),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    last_used TEXT
  );
  CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL,
    admin TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status INTEGER NOT NULL
  );

  -- "This question is wrong" reports from learners.
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL,
    place TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    reason TEXT NOT NULL,
    note TEXT NOT NULL,
    done INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS reports_open ON reports(done, place, question);

  -- App crashes reported by phones, one row per distinct error.
  CREATE TABLE IF NOT EXISTS app_errors (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    stack TEXT NOT NULL,
    place TEXT NOT NULL,
    agent TEXT NOT NULL,
    first_at TEXT NOT NULL,
    last_at TEXT NOT NULL,
    n INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

  -- Content as it was before each admin change or delete (history.ts), to put it back.
  CREATE TABLE IF NOT EXISTS content_history (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL,
    admin TEXT NOT NULL,
    action TEXT NOT NULL,
    kind TEXT NOT NULL,
    entity TEXT NOT NULL,
    label TEXT NOT NULL,
    rows TEXT NOT NULL
  );

  -- The days each learner practised (from their XP per day), for daily active learners and retention.
  -- Kept for 120 days (stats.ts trims it).
  CREATE TABLE IF NOT EXISTS active_days (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    PRIMARY KEY (user_id, day)
  ) WITHOUT ROWID;
  CREATE INDEX IF NOT EXISTS active_by_day ON active_days(day);

  -- Recordings of English text (by its normalised text), from the admin's Words and Audio pages.
  CREATE TABLE IF NOT EXISTS audio_clips (
    key TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    file TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- The learners' own languages the course is made for (the app and the meanings are in it). Bangla first.
  CREATE TABLE IF NOT EXISTS languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    native TEXT NOT NULL,
    dir TEXT NOT NULL DEFAULT 'ltr',
    status TEXT NOT NULL DEFAULT 'draft',
    position INTEGER NOT NULL
  );
`;

/** Opens (and if needed creates) the database. */
export function openDb(path = DB_PATH): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

/** Columns added after the first release, for databases made before them. */
function migrate(db: DatabaseSync): void {
  const has = (table: string, column: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some((c) => c.name === column);
  if (!has('units', 'levels')) db.exec(`ALTER TABLE units ADD COLUMN levels TEXT NOT NULL DEFAULT '[]'`);
  // Content belongs to a language (the learner's own); everything made before languages existed is Bangla.
  for (const table of ['units', 'grammar', 'stories', 'writing_tasks']) {
    if (!has(table, 'lang')) db.exec(`ALTER TABLE ${table} ADD COLUMN lang TEXT NOT NULL DEFAULT 'bn'`);
  }
  // Copies of each learner's activity, so reminders and the league don't read every progress (users.ts).
  if (!has('users', 'week_xp')) {
    db.exec(`ALTER TABLE users ADD COLUMN last_xp_day TEXT;
             ALTER TABLE users ADD COLUMN week_since TEXT;
             ALTER TABLE users ADD COLUMN week_xp INTEGER NOT NULL DEFAULT 0;`);
    const set = db.prepare('UPDATE users SET last_xp_day = ?, week_since = ?, week_xp = ? WHERE id = ?');
    transaction(db, () => {
      for (const u of db.prepare('SELECT id, progress FROM users').iterate() as Iterable<{ id: string; progress: string }>) {
        const a = activitySummary(fairXpByDay((JSON.parse(u.progress) as { xpByDay?: unknown }).xpByDay));
        set.run(a.lastDay, a.weekSince, a.weekXp, u.id);
      }
    });
  }
  if (!(db.prepare("SELECT 1 FROM meta WHERE key = 'active_days_filled'").get())) {
    transaction(db, () => {
      const add = db.prepare('INSERT OR IGNORE INTO active_days (user_id, day) VALUES (?, ?)');
      for (const u of db.prepare('SELECT id, progress FROM users').iterate() as Iterable<{ id: string; progress: string }>) {
        for (const day of Object.keys(fairXpByDay((JSON.parse(u.progress) as { xpByDay?: unknown }).xpByDay))) add.run(u.id, day);
      }
      db.prepare("INSERT INTO meta (key, value) VALUES ('active_days_filled', '1')").run();
    });
  }
  db.exec('CREATE INDEX IF NOT EXISTS users_by_week ON users(week_since, week_xp DESC)');
  // Which app version and phone a learner last used (admin learner page, reports).
  if (!has('users', 'app_version')) db.exec('ALTER TABLE users ADD COLUMN app_version TEXT; ALTER TABLE users ADD COLUMN device TEXT;');
  // The owner can block a learner who cheats: they stay out of the league.
  // Where the learner came from (a campaign tag on their first link), for sign-ups by source.
  // When the server first saw the learner (the app's own joinedAt can't be trusted for the league).
  if (!has('users', 'created_at')) db.exec('ALTER TABLE users ADD COLUMN created_at TEXT');
  if (!has('users', 'source')) db.exec('ALTER TABLE users ADD COLUMN source TEXT');
  // League tier (tiers.ts): 0 ব্রোঞ্জ … 3 ডায়মন্ড.
  if (!has('users', 'tier')) db.exec('ALTER TABLE users ADD COLUMN tier INTEGER NOT NULL DEFAULT 0');
  // The days a payment buys (main or yearly plan).
  if (!has('payments', 'days')) db.exec('ALTER TABLE payments ADD COLUMN days INTEGER');
  if (!has('users', 'blocked')) db.exec('ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0');
  // খসড়া (draft): lessons, stories and grammar topics hidden from learners until the admin publishes them.
  for (const table of ['lessons', 'stories', 'grammar']) if (!has(table, 'draft')) db.exec(`ALTER TABLE ${table} ADD COLUMN draft INTEGER NOT NULL DEFAULT 0`);
  migrateReports(db);
  migrateTeam(db);
  migrateAdminAuth(db);
  migrateErrors(db);
  db.prepare(`INSERT OR IGNORE INTO languages (code, name, native, dir, status, position) VALUES ('bn', 'Bangla', 'বাংলা', 'ltr', 'live', 0)`).run();
}

/** A number that changes whenever the content does, so apps can skip downloading an unchanged course. */
export function contentVersion(db: DatabaseSync): string {
  const row = db.prepare(`SELECT value FROM meta WHERE key = 'content_version'`).get() as { value: string } | undefined;
  return row?.value ?? '0';
}

export function bumpContentVersion(db: DatabaseSync): void {
  db.prepare(
    `INSERT INTO meta (key, value) VALUES ('content_version', '1')
     ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1`,
  ).run();
}

/** Runs `fn` in one transaction. */
export function transaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
