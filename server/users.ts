import type { DatabaseSync } from 'node:sqlite';
import type { Progress } from '../src/lib/progress.ts';
import { HttpError } from './http.ts';

const ID = /^[A-Za-z0-9-]{8,64}$/;

export function checkUserId(id: string): string {
  if (!ID.test(id)) throw new HttpError(400, 'Bad user id');
  return id;
}

/** Saves the progress an app sends, copying the fields the admin lists and sorts by. */
export function saveProgress(db: DatabaseSync, id: string, progress: unknown, now = new Date()): void {
  if (!progress || typeof progress !== 'object') throw new HttpError(400, '"progress" must be an object');
  const p = progress as Partial<Progress>;
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0);
  db.prepare(
    `INSERT INTO users (id, name, district_id, class_id, xp, streak, lessons_done, joined_at, last_seen, progress)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, district_id = excluded.district_id, class_id = excluded.class_id,
       xp = excluded.xp, streak = excluded.streak, lessons_done = excluded.lessons_done,
       joined_at = excluded.joined_at, last_seen = excluded.last_seen, progress = excluded.progress`,
  ).run(
    id,
    p.profile?.name?.slice(0, 60) ?? null,
    p.profile?.districtId ?? null,
    p.profile?.classId ?? null,
    num(p.xp),
    num(p.streak),
    Object.keys(p.completed ?? {}).length,
    p.profile?.joinedAt ?? null,
    now.toISOString(),
    JSON.stringify(progress),
  );
}

export function loadProgress(db: DatabaseSync, id: string): unknown {
  const row = db.prepare('SELECT progress FROM users WHERE id = ?').get(id) as { progress: string } | undefined;
  if (!row) throw new HttpError(404, 'No such user');
  return JSON.parse(row.progress);
}
