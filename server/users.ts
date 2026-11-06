import type { DatabaseSync } from 'node:sqlite';
import { mergeProgress } from '../src/lib/mergeProgress.ts';
import type { Progress } from '../src/lib/progress.ts';
import { fairTotalXp, fairXpByDay } from './fairPlay.ts';
import { activitySummary } from './activity.ts';
import { HttpError } from './http.ts';

const ID = /^[A-Za-z0-9-]{8,64}$/;

/** Which app and phone sent the progress (shown on the admin's learner page and next to their reports). */
export interface Client {
  version?: string | null;
  device?: string | null;
}

/** The app version (X-App-Version) and a short phone name from the User-Agent of a request. */
export function clientOf(headers: Record<string, string | string[] | undefined>): Client {
  const v = headers['x-app-version'];
  const version = typeof v === 'string' && /^[0-9A-Za-z.+-]{1,32}$/.test(v) ? v : null;
  return { version, device: deviceName(typeof headers['user-agent'] === 'string' ? headers['user-agent'] : '') };
}

/**
 * Keeps saved progress from growing forever: lessons and minutes per day older than a year are dropped
 * (XP per day stays, it is the learner's history). The phone takes the trimmed copy on its next sync.
 */
export function trimOld(p: Partial<Progress>, now = new Date()): Partial<Progress> {
  const cutoff = new Date(now.getTime() - 366 * 86_400_000).toISOString().slice(0, 10);
  const keep = (m?: Record<string, number>) => (m ? Object.fromEntries(Object.entries(m).filter(([day]) => day >= cutoff)) : m);
  return { ...p, lessonsByDay: keep(p.lessonsByDay), secondsByDay: keep(p.secondsByDay) };
}

/** "Android 13 · SM-A045F" from a User-Agent; null when there's nothing useful. */
export function deviceName(agent: string): string | null {
  const android = /Android ([\d.]+)(?:; ([^;)]+))?/.exec(agent);
  if (android) {
    const model = android[2]?.trim();
    return `Android ${android[1]}${model && model !== 'K' && !/^wv$/.test(model) ? ` · ${model.slice(0, 40)}` : ''}`;
  }
  if (/iPhone|iPad/.test(agent)) return 'iPhone';
  if (/Windows/.test(agent)) return 'Windows';
  if (/Mac OS X/.test(agent)) return 'Mac';
  if (/Linux/.test(agent)) return 'Linux';
  return null;
}

export function checkUserId(id: string): string {
  if (!ID.test(id)) throw new HttpError(400, 'Bad user id');
  return id;
}

/**
 * Saves the progress an app sends, merged with the copy already here (another phone may have added to
 * it; see lib/mergeProgress.ts), and returns the merged copy for the app to take. Also copies the fields
 * the admin lists and sorts by.
 */
export function saveProgress(db: DatabaseSync, id: string, progress: unknown, now = new Date(), client?: Client): unknown {
  if (!progress || typeof progress !== 'object') throw new HttpError(400, '"progress" must be an object');
  const stored = db.prepare('SELECT xp, progress FROM users WHERE id = ?').get(id) as { xp: number; progress: string } | undefined;
  const p = trimOld((stored ? mergeProgress(JSON.parse(stored.progress), progress as Progress) : progress) as Partial<Progress>, now);
  // The XP column others see (admin rankings) only counts what a real learner could have earned (see fairPlay.ts).
  const previous = stored;
  const days = fairXpByDay(p.xpByDay, now);
  const fairXp = fairTotalXp(p.xp, days, previous?.xp ?? 0);
  // Small copies of the activity, so reminders and the league never have to read every learner's progress.
  const act = activitySummary(days);
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0);
  db.prepare(
    `INSERT INTO users (id, name, district_id, class_id, xp, streak, lessons_done, joined_at, last_seen, progress, last_xp_day, week_since, week_xp, app_version, device, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, district_id = excluded.district_id, class_id = excluded.class_id,
       xp = excluded.xp, streak = excluded.streak, lessons_done = excluded.lessons_done,
       joined_at = excluded.joined_at, last_seen = excluded.last_seen, progress = excluded.progress,
       last_xp_day = excluded.last_xp_day, week_since = excluded.week_since, week_xp = excluded.week_xp,
       app_version = COALESCE(excluded.app_version, users.app_version), device = COALESCE(excluded.device, users.device),
       source = COALESCE(users.source, excluded.source)`,
  ).run(
    id,
    p.profile?.name?.slice(0, 60) ?? null,
    p.profile?.districtId ?? null,
    p.profile?.classId ?? null,
    fairXp,
    num(p.streak),
    Object.keys(p.completed ?? {}).length,
    p.profile?.joinedAt ?? null,
    now.toISOString(),
    JSON.stringify(p),
    act.lastDay,
    act.weekSince,
    act.weekXp,
    client?.version ?? null,
    client?.device ?? null,
    typeof p.profile?.source === 'string' ? p.profile.source.slice(0, 60) : null,
    now.toISOString(),
  );
  // The recent days practised (older ones were recorded when they happened).
  const recent = new Date(now.getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
  const addDay = db.prepare('INSERT OR IGNORE INTO active_days (user_id, day) VALUES (?, ?)');
  for (const day of Object.keys(days)) if (day >= recent || !stored) addDay.run(id, day);
  return p;
}

export function loadProgress(db: DatabaseSync, id: string): unknown {
  const row = db.prepare('SELECT progress FROM users WHERE id = ?').get(id) as { progress: string } | undefined;
  if (!row) throw new HttpError(404, 'No such user');
  return JSON.parse(row.progress);
}

/** What isn't removed with the learner's row by itself (no foreign key): payments and the learner on reports. */
export function forgetUser(db: DatabaseSync, id: string) {
  db.prepare('DELETE FROM payments WHERE user_id = ?').run(id);
  db.prepare('UPDATE reports SET user_id = NULL WHERE user_id = ?').run(id);
}
