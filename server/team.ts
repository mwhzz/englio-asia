import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';

/**
 * owner: everything. editor: content only. support: learners and their reports (no content, settings or team).
 * A route says who may use it: true (anyone on the team), 'owner', 'content' (owner, editor) or 'people' (owner, support).
 */
export type Role = 'owner' | 'editor' | 'support';
export type Access = true | 'owner' | 'content' | 'people';
export const ROLES: Role[] = ['owner', 'editor', 'support'];

export function allowed(role: Role, access: Access): boolean {
  if (role === 'owner' || access === true) return true;
  if (access === 'content') return role === 'editor';
  if (access === 'people') return role === 'support';
  return false;
}
export interface Admin {
  name: string;
  role: Role;
}

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Who a bearer token belongs to: ADMIN_TOKEN is the owner; team members have their own tokens,
 * kept only as a hash. null when the token is wrong.
 */
export function adminOf(db: DatabaseSync, authorization: string | undefined, ownerToken: string, now = new Date()): Admin | null {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return null;
  if (sameText(token, ownerToken)) return { name: 'Owner', role: 'owner' };
  const row = db.prepare('SELECT id, name, role FROM admins WHERE token_hash = ?').get(hash(token)) as { id: number; name: string; role: Role } | undefined;
  if (!row) return null;
  db.prepare('UPDATE admins SET last_used = ? WHERE id = ?').run(now.toISOString(), row.id);
  return { name: row.name, role: row.role };
}

export function listTeam(db: DatabaseSync) {
  return db.prepare('SELECT id, name, role, created_at AS createdAt, last_used AS lastUsed FROM admins ORDER BY id').all();
}

/** Adds a team member and returns their token. It's shown this once; the server only keeps its hash. */
export function addMember(db: DatabaseSync, { body }: Request, now = new Date()) {
  const b = (body ?? {}) as { name?: unknown; role?: unknown };
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 60) : '';
  if (!name) throw new HttpError(400, '"name" is required');
  const role: Role = ROLES.includes(b.role as Role) ? (b.role as Role) : 'editor';
  const token = `eng_${randomBytes(24).toString('base64url')}`;
  const result = db.prepare('INSERT INTO admins (name, role, token_hash, created_at) VALUES (?, ?, ?, ?)').run(name, role, hash(token), now.toISOString());
  return { id: Number(result.lastInsertRowid), name, role, token };
}

export function removeMember(db: DatabaseSync, { params }: Request) {
  if (!db.prepare('DELETE FROM admins WHERE id = ?').run(Number(params.id)).changes) throw new HttpError(404, 'No such team member');
  return { ok: true };
}

/** A short, safe note of what was sent with a change (no tokens or passwords, at most 300 letters). */
export function changeDetail(body: unknown): string {
  if (!body || typeof body !== 'object' || Buffer.isBuffer(body)) return '';
  const safe = JSON.stringify(body, (key, value) => (/token|password|secret/i.test(key) ? '•••' : value));
  return safe.length > 300 ? `${safe.slice(0, 299)}…` : safe;
}

/** Remembers one change made in the admin panel: who, what, what was sent, and whether it worked. */
export function logChange(db: DatabaseSync, admin: Admin, method: string, path: string, status: number, now = new Date(), detail = ''): void {
  db.prepare('INSERT INTO audit (at, admin, method, path, status, detail) VALUES (?, ?, ?, ?, ?, ?)').run(now.toISOString(), admin.name, method, path, status, detail);
}

/** The latest changes, newest first; filter by who (`admin`) or by words in the path (`q`). */
export function activity(db: DatabaseSync, { query }: Pick<Request, 'query'>) {
  const limit = Math.min(500, Math.max(1, Number(query.get('limit')) || 100));
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (query.get('admin')) (where.push('admin = ?'), args.push(query.get('admin')!));
  if (query.get('q')) (where.push('path LIKE ?'), args.push(`%${query.get('q')}%`));
  return db
    .prepare(`SELECT at, admin, method, path, status, detail FROM audit ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT ?`)
    .all(...args, limit);
}

/** Older databases: the support role and the change detail. */
export function migrateTeam(db: DatabaseSync): void {
  const sql = (db.prepare("SELECT sql FROM sqlite_master WHERE name = 'admins'").get() as { sql: string }).sql;
  if (!sql.includes("'support'")) {
    db.exec(`
      CREATE TABLE admins_new (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'support')),
        token_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        last_used TEXT
      );
      INSERT INTO admins_new SELECT id, name, role, token_hash, created_at, last_used FROM admins;
      DROP TABLE admins;
      ALTER TABLE admins_new RENAME TO admins;
    `);
  }
  const cols = (db.prepare('PRAGMA table_info(audit)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('detail')) db.exec("ALTER TABLE audit ADD COLUMN detail TEXT NOT NULL DEFAULT ''");
}
