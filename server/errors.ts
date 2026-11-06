import { createHash } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';
import { deviceName } from './users.ts';

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');

/**
 * An app crash, sent by the phone (see src/lib/reportError.ts). The same error from many phones is one
 * row with a count, so the admin sees what breaks most; no learner id is kept.
 */
export function recordError(db: DatabaseSync, { body, headers }: Request, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const message = clip(b.message, 300).trim();
  if (!message) throw new HttpError(400, '"message" is required');
  const where = clip(b.where, 120);
  const stack = clip(b.stack, 2000);
  // The first line of the stack says where in the code; with the message it identifies the error.
  const id = createHash('sha256').update(`${message}\n${stack.split('\n')[1] ?? ''}`).digest('hex').slice(0, 24);
  // The app's version (sent by newer apps, and written into "where" by older ones as "· v1.6.1 ·").
  const version = clip(b.version, 32) || (/· v([\w.+-]+) ·/.exec(where)?.[1] ?? null);
  db.prepare(
    `INSERT INTO app_errors (id, message, stack, place, agent, first_at, last_at, n, version, device) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET n = n + 1, last_at = excluded.last_at, place = excluded.place, agent = excluded.agent,
       version = excluded.version, device = excluded.device`,
  ).run(id, message, stack, where, clip(headers['user-agent'], 200), now.toISOString(), now.toISOString(), version, deviceName(clip(headers['user-agent'], 200)));
  return { ok: true };
}

/** For the admin: the errors seen most, with where they last happened. */
export function listErrors(db: DatabaseSync) {
  return db.prepare('SELECT id, message, stack, place, agent, version, device, first_at AS firstAt, last_at AS lastAt, n FROM app_errors ORDER BY last_at DESC LIMIT 100').all();
}

export function clearError(db: DatabaseSync, { params }: Request) {
  db.prepare('DELETE FROM app_errors WHERE id = ?').run(params.id);
  return { ok: true };
}

/** Older databases: the app version and phone on each crash. */
export function migrateErrors(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(app_errors)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('version')) db.exec('ALTER TABLE app_errors ADD COLUMN version TEXT; ALTER TABLE app_errors ADD COLUMN device TEXT;');
}
