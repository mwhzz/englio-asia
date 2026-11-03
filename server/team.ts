import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';

/** owner: everything. editor: content only (no learners' data, team or activity log). */
export type Role = 'owner' | 'editor';
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
  const role: Role = b.role === 'owner' ? 'owner' : 'editor';
  const token = `eng_${randomBytes(24).toString('base64url')}`;
  const result = db.prepare('INSERT INTO admins (name, role, token_hash, created_at) VALUES (?, ?, ?, ?)').run(name, role, hash(token), now.toISOString());
  return { id: Number(result.lastInsertRowid), name, role, token };
}

export function removeMember(db: DatabaseSync, { params }: Request) {
  if (!db.prepare('DELETE FROM admins WHERE id = ?').run(Number(params.id)).changes) throw new HttpError(404, 'No such team member');
  return { ok: true };
}

/** Remembers one change made in the admin panel. */
export function logChange(db: DatabaseSync, admin: Admin, method: string, path: string, status: number, now = new Date()): void {
  db.prepare('INSERT INTO audit (at, admin, method, path, status) VALUES (?, ?, ?, ?, ?)').run(now.toISOString(), admin.name, method, path, status);
}

/** The latest changes, newest first. */
export function activity(db: DatabaseSync, { query }: Request) {
  const limit = Math.min(500, Math.max(1, Number(query.get('limit')) || 100));
  return db.prepare('SELECT at, admin, method, path, status FROM audit ORDER BY id DESC LIMIT ?').all(limit);
}
