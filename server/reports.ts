import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';
import { clientOf } from './users.ts';
import { notifyOwner } from './notify.ts';

/**
 * Learners' reports: "this question is wrong" from a lesson (ReportButton.tsx) and anything else from the
 * help page (account, payment, a bug…). Each keeps who sent it (device id), their app version and phone,
 * and moves through statuses; the admin can reply, and the learner sees the reply in the app.
 */

const REASONS = new Set(['wrong-answer', 'mistake', 'audio', 'unclear', 'other']);
export const KINDS = ['content', 'bug', 'account', 'payment', 'idea', 'other'] as const;
export const STATUSES = ['new', 'doing', 'fixed', 'closed'] as const;
type Kind = (typeof KINDS)[number];
type Status = (typeof STATUSES)[number];

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const USER = /^[A-Za-z0-9-]{8,64}$/;

/** A new report from the app. `where` is the place ("lesson:u1-l2", or "help" from the help page). */
export function addReport(db: DatabaseSync, { body, headers }: Request, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const where = clip(b.where, 120);
  const question = clip(b.question, 1000);
  if (!where || !question) throw new HttpError(400, '"where" and "question" are required');
  const reason = typeof b.reason === 'string' && REASONS.has(b.reason) ? b.reason : 'other';
  const kind: Kind = KINDS.includes(b.kind as Kind) ? (b.kind as Kind) : where === 'help' ? 'other' : 'content';
  const userId = typeof b.userId === 'string' && USER.test(b.userId) ? b.userId : null;
  // The help page always sends who it is; a help report without a learner is spam.
  if (where === 'help' && !userId) throw new HttpError(400, '"userId" is required');
  const client = clientOf(headers);
  const at = now.toISOString();
  db.prepare(
    `INSERT INTO reports (at, place, question, answer, reason, note, done, user_id, app_version, device, status, kind, contact, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'new', ?, ?, ?)`,
  ).run(at, where, question, clip(b.answer, 300), reason, clip(b.note, 1000), userId, client.version ?? null, client.device ?? null, kind, clip(b.contact, 80), at);
  // Help-page reports (account, payment, bugs) reach the owner's Telegram at once; lesson reports wait in the admin.
  if (where === 'help') notifyOwner(`New Englio report (${kind}):
${question.slice(0, 500)}
${client.device ?? ''} · v${client.version ?? '?'}`);
  return { ok: true };
}

interface Filters {
  status?: string | null;
  kind?: string | null;
  q?: string | null;
  user?: string | null;
}

/** Content reports grouped by question (the same mistake from many learners is one row), open first. */
export function listReports(db: DatabaseSync, { query }: Pick<Request, 'query'> = { query: new URLSearchParams() }) {
  const open = query.get('status') !== 'done';
  return db
    .prepare(
      `SELECT place, question, COUNT(*) AS n, MAX(at) AS lastAt, MIN(status) AS status,
              json_group_array(json_object('id', id, 'reason', reason, 'answer', answer, 'note', note, 'userId', user_id, 'version', app_version, 'device', device)) AS items
       FROM reports WHERE kind = 'content' AND place != 'help' AND ${open ? "status IN ('new', 'doing')" : "status IN ('fixed', 'closed')"}
       GROUP BY place, question ORDER BY n DESC, lastAt DESC LIMIT 200`,
    )
    .all()
    .map((r) => ({ ...(r as object), items: JSON.parse((r as { items: string }).items) }));
}

/** Marks every report about one question as fixed (and replies to each learner that it's fixed). */
export function closeReports(db: DatabaseSync, { body, admin }: Request, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const reply = clip(b.reply, 1000) || 'ধন্যবাদ! তোমার জানানো ভুলটা ঠিক করা হয়েছে।';
  db.prepare(
    `UPDATE reports SET status = 'fixed', done = 1, reply = COALESCE(NULLIF(reply, ''), ?), handled_by = ?, updated_at = ?
     WHERE place = ? AND question = ? AND status IN ('new', 'doing')`,
  ).run(reply, admin?.name ?? null, now.toISOString(), clip(b.where, 120), clip(b.question, 1000));
  return { ok: true };
}

/** Every report one by one, newest first, filtered by status, kind, learner or text. */
export function listTickets(db: DatabaseSync, { query }: Pick<Request, 'query'>) {
  const f: Filters = { status: query.get('status'), kind: query.get('kind'), q: query.get('q'), user: query.get('user') };
  const where: string[] = [];
  const args: string[] = [];
  if (f.status === 'open') where.push("r.status IN ('new', 'doing')");
  else if (f.status && STATUSES.includes(f.status as Status)) (where.push('r.status = ?'), args.push(f.status));
  if (f.kind && KINDS.includes(f.kind as Kind)) (where.push('r.kind = ?'), args.push(f.kind));
  if (f.user) (where.push('r.user_id = ?'), args.push(f.user));
  if (f.q?.trim()) {
    where.push('(r.question LIKE ? OR r.note LIKE ? OR r.place LIKE ?)');
    const like = `%${f.q.trim()}%`;
    args.push(like, like, like);
  }
  const rows = db
    .prepare(
      `SELECT r.id, r.at, r.place, r.question, r.answer, r.reason, r.note, r.kind, r.status, r.reply, r.assignee,
              r.handled_by AS handledBy, r.updated_at AS updatedAt, r.user_id AS userId, r.app_version AS version, r.device, r.contact,
              u.name AS userName
       FROM reports r LEFT JOIN users u ON u.id = r.user_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY r.id DESC LIMIT 300`,
    )
    .all(...args);
  const counts = Object.fromEntries(
    (db.prepare('SELECT status, COUNT(*) AS n FROM reports GROUP BY status').all() as { status: string; n: number }[]).map((c) => [c.status, c.n]),
  );
  return { tickets: rows, counts };
}

/** The admin changes a report: its status, kind, who handles it, or the reply the learner will see. */
export function updateTicket(db: DatabaseSync, { params, body, admin }: Request, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const row = db.prepare('SELECT id FROM reports WHERE id = ?').get(Number(params.id));
  if (!row) throw new HttpError(404, 'No such report');
  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status as Status)) throw new HttpError(400, `"status" must be one of ${STATUSES.join(', ')}`);
    sets.push('status = ?', 'done = ?');
    args.push(b.status as string, b.status === 'fixed' || b.status === 'closed' ? 1 : 0);
  }
  if (b.kind !== undefined) {
    if (!KINDS.includes(b.kind as Kind)) throw new HttpError(400, `"kind" must be one of ${KINDS.join(', ')}`);
    sets.push('kind = ?');
    args.push(b.kind as string);
  }
  if (b.assignee !== undefined) (sets.push('assignee = ?'), args.push(clip(b.assignee, 60) || null));
  if (b.reply !== undefined) (sets.push('reply = ?'), args.push(clip(b.reply, 1000)));
  if (!sets.length) throw new HttpError(400, 'Nothing to change');
  sets.push('handled_by = ?', 'updated_at = ?');
  args.push(admin?.name ?? null, now.toISOString());
  db.prepare(`UPDATE reports SET ${sets.join(', ')} WHERE id = ?`).run(...args, Number(params.id));
  return { ok: true };
}

/** For the app's help page: what this learner sent, and the admin's replies. */
export function myReports(db: DatabaseSync, userId: string) {
  return db
    .prepare(
      `SELECT id, at, place, question, kind, status, reply, updated_at AS updatedAt FROM reports
       WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
    )
    .all(userId);
}

/** Columns added in reports v2 (older rows: no learner; done → fixed). */
export function migrateReports(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(reports)').all() as { name: string }[]).map((c) => c.name);
  if (cols.includes('status')) return;
  db.exec(`
    ALTER TABLE reports ADD COLUMN user_id TEXT;
    ALTER TABLE reports ADD COLUMN app_version TEXT;
    ALTER TABLE reports ADD COLUMN device TEXT;
    ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
    ALTER TABLE reports ADD COLUMN kind TEXT NOT NULL DEFAULT 'content';
    ALTER TABLE reports ADD COLUMN assignee TEXT;
    ALTER TABLE reports ADD COLUMN reply TEXT NOT NULL DEFAULT '';
    ALTER TABLE reports ADD COLUMN handled_by TEXT;
    ALTER TABLE reports ADD COLUMN contact TEXT NOT NULL DEFAULT '';
    ALTER TABLE reports ADD COLUMN updated_at TEXT;
    UPDATE reports SET status = CASE WHEN done = 1 THEN 'fixed' ELSE 'new' END, updated_at = at;
    CREATE INDEX IF NOT EXISTS reports_by_user ON reports(user_id);
    CREATE INDEX IF NOT EXISTS reports_by_status ON reports(status, id);
  `);
}

/** Changes many reports at once (e.g. close every spam report): `{ ids: [1, 2], status: 'closed' }`. */
export function bulkTickets(db: DatabaseSync, { body, admin }: Pick<Request, 'body' | 'admin'>, now = new Date()) {
  const b = (body ?? {}) as { ids?: unknown; status?: unknown };
  const ids = Array.isArray(b.ids) ? b.ids.filter((x): x is number => Number.isInteger(x)).slice(0, 1000) : [];
  if (!ids.length || !STATUSES.includes(b.status as Status)) throw new HttpError(400, 'Give ids and a status');
  const done = b.status === 'fixed' || b.status === 'closed' ? 1 : 0;
  const n = db
    .prepare(`UPDATE reports SET status = ?, done = ?, handled_by = ?, updated_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`)
    .run(b.status as string, done, admin?.name ?? null, now.toISOString(), ...ids).changes;
  return { ok: true, changed: n };
}

/** Every report as rows for a spreadsheet. */
export function exportTickets(db: DatabaseSync) {
  return db
    .prepare('SELECT id, at, kind, status, place, question, note, reply, assignee, user_id AS learner, app_version AS version, device FROM reports ORDER BY id DESC LIMIT 200000')
    .all();
}

