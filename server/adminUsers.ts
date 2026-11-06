import type { DatabaseSync } from 'node:sqlite';
import { mergeProgress } from '../src/lib/mergeProgress.ts';
import type { Progress } from '../src/lib/progress.ts';
import { transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { clearLeaderboardCache } from './leaderboard.ts';
import { myReports } from './reports.ts';
import { normalizeCode } from './restoreCodes.ts';
import { forgetUser } from './users.ts';

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
    openReports: count("SELECT COUNT(*) AS n FROM reports WHERE status IN ('new', 'doing')"),
    // What needs the owner today.
    newReports: count("SELECT COUNT(*) AS n FROM reports WHERE status = 'new'"),
    crashesToday: count('SELECT COALESCE(SUM(n), 0) AS n FROM app_errors WHERE last_at >= ?', since(DAY)),
    stuckPayments: count("SELECT COUNT(*) AS n FROM payments WHERE status IN ('started', 'failed', 'expired') AND created_at >= ?", since(DAY)),
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
const PAGE = 50;

/**
 * Learners for the admin table, a page at a time. `q` finds a learner by name (start of a word), device id,
 * backup code or phone number (the last digits are enough); `filter` narrows to Plus, blocked or reminder learners.
 */
export function listUsers(db: DatabaseSync, { query }: Pick<Request, 'query'>) {
  const order = SORTS[query.get('sort') ?? 'seen'] ?? SORTS.seen;
  const page = Math.max(0, Math.floor(Number(query.get('page')) || 0));
  const q = (query.get('q') ?? '').trim();
  const where: string[] = [];
  const args: string[] = [];
  if (q) {
    const ids = findIds(db, q);
    // A name: matches from the start of the name or of any word in it (uses no full scan per keystroke for ids).
    where.push(`(name LIKE ? OR name LIKE ?${ids.length ? ` OR id IN (${ids.map(() => '?').join(',')})` : ''})`);
    args.push(`${q}%`, `% ${q}%`, ...ids);
  }
  const filter = query.get('filter');
  if (filter === 'plus') where.push(`id IN (SELECT user_id FROM premium WHERE until > '${new Date().toISOString()}')`);
  if (filter === 'blocked') where.push('blocked = 1');
  if (filter === 'reminder') where.push('id IN (SELECT user_id FROM push_subs)');
  const sql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM users ${sql}`).get(...args) as { n: number }).n;
  const users = db
    .prepare(
      `SELECT id, name, district_id AS districtId, class_id AS classId, xp, streak, lessons_done AS lessonsDone,
              joined_at AS joinedAt, last_seen AS lastSeen, blocked, app_version AS version
       FROM users ${sql} ORDER BY ${order} LIMIT ${PAGE} OFFSET ${page * PAGE}`,
    )
    .all(...args);
  return { users, total, page, pageSize: PAGE };
}

/** Learner ids a search text points to exactly: a device id, a backup code, or a phone number. */
function findIds(db: DatabaseSync, q: string): string[] {
  const ids = new Set<string>();
  if (/^[A-Za-z0-9-]{8,64}$/.test(q) && db.prepare('SELECT 1 FROM users WHERE id = ?').get(q)) ids.add(q);
  const code = normalizeCode(q);
  if (code.length === 10) {
    const row = db.prepare('SELECT user_id FROM restore_codes WHERE code = ?').get(code) as { user_id: string } | undefined;
    if (row) ids.add(row.user_id);
  }
  const digits = q.replace(/\D/g, '');
  if (digits.length >= 6 && digits.length === q.replace(/[\s+-]/g, '').length) {
    for (const r of db.prepare("SELECT user_id FROM accounts WHERE kind = 'phone' AND subject LIKE ?").all(`%${digits}`) as { user_id: string }[]) ids.add(r.user_id);
  }
  if (q.includes('@')) {
    for (const r of db.prepare("SELECT user_id FROM accounts WHERE kind = 'google' AND label = ? COLLATE NOCASE").all(q) as { user_id: string }[]) ids.add(r.user_id);
  }
  return [...ids];
}

const need = (db: DatabaseSync, id: string) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined;
  if (!row) throw new HttpError(404, 'No such user');
  return row;
};

/** One learner with everything the admin may need: progress, Plus, payments, sign-ins, reminder, reports. */
export function getUser(db: DatabaseSync, { params }: Pick<Request, 'params'>, now = new Date()) {
  const row = need(db, params.id);
  const premium = db.prepare('SELECT until FROM premium WHERE user_id = ?').get(params.id) as { until: string } | undefined;
  return {
    ...row,
    progress: JSON.parse(row.progress as string),
    plusUntil: premium && premium.until > now.toISOString() ? premium.until : null,
    payments: db.prepare('SELECT payment_id AS id, amount, status, trx_id AS trxId, created_at AS at FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(params.id),
    accounts: db.prepare('SELECT kind, subject, label FROM accounts WHERE user_id = ?').all(params.id),
    backupCode: (db.prepare('SELECT code FROM restore_codes WHERE user_id = ?').get(params.id) as { code: string } | undefined)?.code ?? null,
    reminder: db.prepare('SELECT hour, time_zone AS timeZone FROM push_subs WHERE user_id = ?').get(params.id) ?? null,
    reports: myReports(db, params.id),
  };
}

/** Changes the learner's saved progress so that the phone takes it on its next sync (it's the newest copy). */
function editProgress(db: DatabaseSync, id: string, change: (p: Progress) => Progress, now = Date.now()) {
  const p = JSON.parse(need(db, id).progress as string) as Progress;
  const next = { ...change(p), savedAt: Math.max(now, (p.savedAt ?? 0) + 1) };
  db.prepare('UPDATE users SET progress = ?, streak = ? WHERE id = ?').run(JSON.stringify(next), next.streak ?? 0, id);
  return next;
}

const yesterday = (now: Date) => new Date(now.getTime() - DAY).toISOString().slice(0, 10);

/**
 * The owner fixes a learner's account: give Plus (days), fill hearts, give streak freezes, give back a
 * lost streak, block or unblock (a blocked learner is out of the league), or merge another device into this one.
 */
export function userAction(db: DatabaseSync, { params, body }: Pick<Request, 'params' | 'body'>, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const id = params.id;
  need(db, id);
  const n = (v: unknown, max: number) => {
    const x = Math.floor(Number(v));
    if (!Number.isFinite(x) || x < 1 || x > max) throw new HttpError(400, `Give a number from 1 to ${max}`);
    return x;
  };
  switch (b.action) {
    case 'plus': {
      const days = n(b.days, 3650);
      const current = db.prepare('SELECT until FROM premium WHERE user_id = ?').get(id) as { until: string } | undefined;
      const from = current && current.until > now.toISOString() ? new Date(current.until) : now;
      const until = new Date(from.getTime() + days * DAY).toISOString();
      db.prepare('INSERT INTO premium (user_id, until) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET until = excluded.until').run(id, until);
      return { ok: true, plusUntil: until };
    }
    case 'end-plus':
      db.prepare('DELETE FROM premium WHERE user_id = ?').run(id);
      return { ok: true };
    case 'hearts':
      editProgress(db, id, (p) => ({ ...p, hearts: 5, heartsUpdatedAt: now.getTime() }), now.getTime());
      return { ok: true };
    case 'freezes': {
      const add = n(b.count, 10);
      editProgress(db, id, (p) => ({ ...p, streakFreezes: Math.min(10, (p.streakFreezes ?? 0) + add) }), now.getTime());
      return { ok: true };
    }
    case 'streak': {
      // Gives back a streak lost by a bug or a lost phone: it counts as kept up to yesterday.
      const days = n(b.days, 3650);
      editProgress(db, id, (p) => ({ ...p, streak: days, lastActiveDay: p.lastActiveDay && p.lastActiveDay >= yesterday(now) ? p.lastActiveDay : yesterday(now) }), now.getTime());
      return { ok: true };
    }
    case 'block':
    case 'unblock':
      db.prepare('UPDATE users SET blocked = ? WHERE id = ?').run(b.action === 'block' ? 1 : 0, id);
      clearLeaderboardCache();
      return { ok: true };
    case 'merge': {
      const from = typeof b.from === 'string' ? b.from.trim() : '';
      const source = findIds(db, from)[0];
      if (!source || source === id) throw new HttpError(404, 'No other learner with that device id or backup code');
      return transaction(db, () => {
        const other = JSON.parse(need(db, source).progress as string) as Progress;
        editProgress(db, id, (p) => mergeProgress(p, other), now.getTime());
        return { ok: true, merged: source };
      });
    }
    default:
      throw new HttpError(400, 'Unknown action');
  }
}

/** A learner's data as one file (for a data request, or to keep before deleting). */
export function exportUser(db: DatabaseSync, { params }: Pick<Request, 'params'>) {
  return { exportedAt: new Date().toISOString(), ...getUser(db, { params }) };
}

/** Deletes a learner and everything kept about them (payments too; their reports stay, without the learner). */
export function deleteUser(db: DatabaseSync, { params }: Pick<Request, 'params'>) {
  return transaction(db, () => {
    if (!db.prepare('DELETE FROM users WHERE id = ?').run(params.id).changes) throw new HttpError(404, 'No such user');
    forgetUser(db, params.id);
    return { ok: true };
  });
}

/** Every learner as rows for a spreadsheet (owner's CSV download): no progress, only the columns. */
export function exportUsers(db: DatabaseSync) {
  return db
    .prepare(
      `SELECT id, name, district_id AS district, class_id AS class, xp, streak, lessons_done AS lessons, joined_at AS joined,
              last_seen AS lastSeen, app_version AS version, device, source, blocked
       FROM users ORDER BY last_seen DESC LIMIT 200000`,
    )
    .all();
}

/** Every payment, newest first (owner's CSV download). */
export function exportPayments(db: DatabaseSync) {
  return db.prepare('SELECT payment_id AS id, user_id AS learner, amount, status, trx_id AS trx, created_at AS at FROM payments ORDER BY created_at DESC LIMIT 200000').all();
}

