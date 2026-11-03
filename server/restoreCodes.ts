import { randomInt } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError } from './http.ts';

// No 0/O, 1/I/L: easy to read out and type. 10 characters ≈ 50 bits, which with rate limiting can't be guessed.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LENGTH = 10;

/** "ab cde-12345 " → "ABCDE12345" (what the learner types can have spaces, dashes or small letters). */
export const normalizeCode = (code: unknown): string => (typeof code === 'string' ? code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '');

/** Shown to the learner as "ABCDE-12345". */
export const formatCode = (code: string): string => `${code.slice(0, 5)}-${code.slice(5)}`;

/** The learner's backup code, made the first time they ask for it. */
export function backupCode(db: DatabaseSync, userId: string, now = new Date()): string {
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) throw new HttpError(404, 'No such user');
  const row = db.prepare('SELECT code FROM restore_codes WHERE user_id = ?').get(userId) as { code: string } | undefined;
  if (row) return formatCode(row.code);
  for (;;) {
    const code = Array.from({ length: LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    if (db.prepare('INSERT OR IGNORE INTO restore_codes (code, user_id, created_at) VALUES (?, ?, ?)').run(code, userId, now.toISOString()).changes) {
      return formatCode(code);
    }
  }
}

function userOf(db: DatabaseSync, code: unknown): string {
  const row = db.prepare('SELECT user_id FROM restore_codes WHERE code = ?').get(normalizeCode(code)) as { user_id: string } | undefined;
  if (!row) throw new HttpError(404, 'No learner has this code');
  return row.user_id;
}

/** A new phone takes over the learner with this code: their id and progress. */
export function restore(db: DatabaseSync, body: unknown): { id: string; progress: unknown } {
  const id = userOf(db, (body as { code?: unknown } | null)?.code);
  const { progress } = db.prepare('SELECT progress FROM users WHERE id = ?').get(id) as { progress: string };
  return { id, progress: JSON.parse(progress) };
}

/** Erases the learner with this code, for the web page that deletes data without the app. */
export function deleteByCode(db: DatabaseSync, body: unknown): { ok: true } {
  db.prepare('DELETE FROM users WHERE id = ?').run(userOf(db, (body as { code?: unknown } | null)?.code));
  return { ok: true };
}
