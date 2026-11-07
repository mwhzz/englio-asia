import { createHash, createHmac, randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';
import type { Admin, Role } from './team.ts';

/**
 * Admin sign-in. The admin panel trades a token (ADMIN_TOKEN or a team member's) for a session that lasts
 * 30 days, so the long-lived token isn't kept in the browser. The owner can turn on two-step sign-in: then a
 * 6-digit code from an authenticator app (Google Authenticator and the like, TOTP) is needed too, and raw
 * tokens stop working for the admin API (only sessions do).
 */

const SESSION_DAYS = 30;
const hash = (s: string) => createHash('sha256').update(s).digest('hex');

// ---- TOTP (RFC 6238: 30-second steps, 6 digits, SHA-1), as authenticator apps make them ----

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32(bytes: Buffer): string {
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function fromBase32(text: string): Buffer {
  let bits = '';
  for (const c of text.toUpperCase().replace(/[^A-Z2-7]/g, '')) bits += B32.indexOf(c).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

/** The 6-digit code for a secret at a time. */
export function totp(secret: string, at = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const h = createHmac('sha1', fromBase32(secret)).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}

/** Whether a typed code is right (the step before and after count too, for a phone clock a little off). */
export const codeOk = (secret: string, code: unknown, at = Date.now()) =>
  typeof code === 'string' && [-1, 0, 1].some((step) => totp(secret, at + step * 30_000) === code.replace(/\s/g, ''));

const meta = (db: DatabaseSync, key: string) => (db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined)?.value ?? null;
const setMeta = (db: DatabaseSync, key: string, value: string | null) =>
  value === null
    ? db.prepare('DELETE FROM meta WHERE key = ?').run(key)
    : db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);

/** Whether two-step sign-in is on. */
export const twoStepOn = (db: DatabaseSync) => !!meta(db, 'totp_secret');

/** Sign in: a token (and, with two-step on, a code) for a 30-day session. */
export function login(db: DatabaseSync, { body }: Pick<Request, 'body'>, check: (token: string) => Admin | null, now = new Date()) {
  const b = (body ?? {}) as { token?: unknown; code?: unknown };
  const admin = typeof b.token === 'string' ? check(b.token.trim()) : null;
  if (!admin) throw new HttpError(401, 'That token is not right');
  const secret = meta(db, 'totp_secret');
  if (secret && !codeOk(secret, b.code, now.getTime())) throw new HttpError(428, b.code ? 'That code is not right' : 'Code needed');
  const session = `ses_${randomBytes(24).toString('base64url')}`;
  db.prepare('INSERT INTO admin_sessions (token_hash, name, role, expires_at) VALUES (?, ?, ?, ?)').run(
    hash(session),
    admin.name,
    admin.role,
    new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString(),
  );
  db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(now.toISOString());
  return { session, name: admin.name, role: admin.role };
}

/** The admin a session token belongs to (null: not a session, or expired). */
export function sessionAdmin(db: DatabaseSync, token: string, now = new Date()): Admin | null {
  const row = db.prepare('SELECT name, role, expires_at FROM admin_sessions WHERE token_hash = ?').get(hash(token)) as { name: string; role: Role; expires_at: string } | undefined;
  return row && row.expires_at > now.toISOString() ? { name: row.name, role: row.role } : null;
}

/** Signing out ends the session. */
export function logout(db: DatabaseSync, authorization: string | undefined) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(hash(token));
  return { ok: true };
}

/** Owner: start turning on two-step sign-in. Returns the secret to type (or scan) into an authenticator app. */
export function twoStepStart(db: DatabaseSync) {
  const secret = base32(randomBytes(20));
  setMeta(db, 'totp_pending', secret);
  return { secret, url: `otpauth://totp/Englio%20admin?secret=${secret}&issuer=Englio`, on: twoStepOn(db) };
}

/** Owner: finish turning it on with the first code from the app (proves the app is set up). */
export function twoStepConfirm(db: DatabaseSync, { body }: Pick<Request, 'body'>, now = new Date()) {
  const pending = meta(db, 'totp_pending');
  if (!pending) throw new HttpError(400, 'Start again');
  if (!codeOk(pending, (body as { code?: unknown } | null)?.code, now.getTime())) throw new HttpError(400, 'That code is not right');
  setMeta(db, 'totp_secret', pending);
  setMeta(db, 'totp_pending', null);
  return { on: true };
}

/** Owner: turn two-step off (needs a current code). */
export function twoStepOff(db: DatabaseSync, { body }: Pick<Request, 'body'>, now = new Date()) {
  const secret = meta(db, 'totp_secret');
  if (!secret) return { on: false };
  if (!codeOk(secret, (body as { code?: unknown } | null)?.code, now.getTime())) throw new HttpError(400, 'That code is not right');
  setMeta(db, 'totp_secret', null);
  return { on: false };
}

export const twoStepStatus = (db: DatabaseSync) => ({ on: twoStepOn(db) });

export function migrateAdminAuth(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`);
  const cols = (db.prepare('PRAGMA table_info(admins)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('expires_at')) db.exec('ALTER TABLE admins ADD COLUMN expires_at TEXT');
}
