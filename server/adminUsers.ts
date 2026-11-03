import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';

type Row = Record<string, unknown>;

const DAY = 24 * 60 * 60 * 1000;

/** Numbers for the dashboard: learners, activity, content, and the top districts and classes. */
export function summary(db: DatabaseSync, now = Date.now()) {
  const count = (sql: string, ...args: (string | number)[]) => (db.prepare(sql).get(...args) as { n: number }).n;
  const since = (ms: number) => new Date(now - ms).toISOString();
  return {
    users: count('SELECT COUNT(*) AS n FROM users'),
    activeToday: count('SELECT COUNT(*) AS n FROM users WHERE last_seen >= ?', since(DAY)),
    activeWeek: count('SELECT COUNT(*) AS n FROM users WHERE last_seen >= ?', since(7 * DAY)),
    totalXp: count('SELECT COALESCE(SUM(xp), 0) AS n FROM users'),
    units: count('SELECT COUNT(*) AS n FROM units'),
    lessons: count('SELECT COUNT(*) AS n FROM lessons'),
    items: count('SELECT COUNT(*) AS n FROM items'),
    grammar: count('SELECT COUNT(*) AS n FROM grammar'),
    districts: db
      .prepare(
        `SELECT district_id AS id, COUNT(*) AS users, SUM(xp) AS xp FROM users
         WHERE district_id IS NOT NULL GROUP BY district_id ORDER BY xp DESC LIMIT 8`,
      )
      .all(),
    classes: db
      .prepare('SELECT class_id AS id, COUNT(*) AS users FROM users WHERE class_id IS NOT NULL GROUP BY class_id ORDER BY users DESC')
      .all(),
  };
}

const SORTS: Record<string, string> = {
  xp: 'xp DESC',
  seen: 'last_seen DESC',
  joined: 'joined_at DESC',
  name: 'name COLLATE NOCASE',
};

/** Learners for the admin table, searchable by name and sortable. */
export function listUsers(db: DatabaseSync, { query }: Request) {
  const order = SORTS[query.get('sort') ?? 'seen'] ?? SORTS.seen;
  const q = `%${(query.get('q') ?? '').trim()}%`;
  return db
    .prepare(
      `SELECT id, name, district_id AS districtId, class_id AS classId, xp, streak, lessons_done AS lessonsDone,
              joined_at AS joinedAt, last_seen AS lastSeen
       FROM users WHERE COALESCE(name, '') LIKE ? ORDER BY ${order} LIMIT 500`,
    )
    .all(q);
}

/** One learner with their full saved progress. */
export function getUser(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(params.id) as Row | undefined;
  if (!row) throw new HttpError(404, 'No such user');
  return { ...row, progress: JSON.parse(row.progress as string) };
}

export function deleteUser(db: DatabaseSync, { params }: Request) {
  if (!db.prepare('DELETE FROM users WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such user');
  return { ok: true };
}
