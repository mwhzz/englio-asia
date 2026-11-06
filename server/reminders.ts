import type { DatabaseSync } from 'node:sqlite';
import { toBanglaDigits } from '../src/lib/bangla.ts';
import { HttpError } from './http.ts';

interface PushBody {
  subscription?: { endpoint?: unknown; keys?: unknown };
  hour?: unknown;
  timeZone?: unknown;
}

/** Saves (or replaces) a device's push subscription and the local hour it wants its daily reminder at. */
export function savePush(db: DatabaseSync, userId: string, body: unknown): void {
  const b = (body ?? {}) as PushBody;
  const sub = b.subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !sub.endpoint.startsWith('https://') || typeof sub.keys !== 'object') {
    throw new HttpError(400, '"subscription" must be a push subscription');
  }
  const hour = typeof b.hour === 'number' && Number.isInteger(b.hour) && b.hour >= 0 && b.hour <= 23 ? b.hour : 20;
  const timeZone = typeof b.timeZone === 'string' && validZone(b.timeZone) ? b.timeZone : 'Asia/Dhaka';
  db.prepare(
    `INSERT INTO push_subs (user_id, subscription, hour, time_zone) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET subscription = excluded.subscription, hour = excluded.hour, time_zone = excluded.time_zone`,
  ).run(userId, JSON.stringify(sub), hour, timeZone);
}

export function deletePush(db: DatabaseSync, userId: string): void {
  db.prepare('DELETE FROM push_subs WHERE user_id = ?').run(userId);
}

function validZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** The local date ("2026-11-03") and hour at `now` in a time zone. */
function localTime(now: Date, timeZone: string): { day: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export interface DueReminder {
  userId: string;
  name: string | null;
  streak: number;
  subscription: unknown;
}

/**
 * Who should get a reminder now: it's their chosen hour where they live and they haven't
 * earned any XP today. Run this once an hour (see docs/SERVER.md) and push to each.
 */
export function dueReminders(db: DatabaseSync, now = new Date()): DueReminder[] {
  // Only the few columns needed (never the whole progress), and one at a time, so 100k sign-ups stay small.
  const rows = db
    .prepare(
      `SELECT p.user_id, p.subscription, p.hour, p.time_zone, u.name, u.streak, u.last_xp_day
       FROM push_subs p JOIN users u ON u.id = p.user_id`,
    )
    .iterate() as Iterable<{ user_id: string; subscription: string; hour: number; time_zone: string; name: string | null; streak: number; last_xp_day: string | null }>;
  const due: DueReminder[] = [];
  const zones = new Map<string, { day: string; hour: number }>();
  for (const r of rows) {
    let local = zones.get(r.time_zone);
    if (!local) zones.set(r.time_zone, (local = localTime(now, r.time_zone)));
    if (local.hour !== r.hour) continue;
    // Any XP today (or "tomorrow", a time-zone edge) means they practised.
    if (r.last_xp_day && r.last_xp_day >= local.day) continue;
    due.push({ userId: r.user_id, name: r.name, streak: r.streak, subscription: JSON.parse(r.subscription) });
  }
  return due;
}

/** The notification text for one learner: mentions the streak when there's one to lose. */
export function reminderMessage(r: Pick<DueReminder, 'name' | 'streak'>): { title: string; body: string } {
  const first = r.name?.split(' ')[0];
  return r.streak > 1
    ? { title: `${toBanglaDigits(r.streak)} দিনের স্ট্রিক বাঁচাও!`, body: `${first ? first + ', ' : ''}আজকের একটা লেসন বাকি। মাত্র ৫ মিনিট লাগবে।` }
    : { title: 'আজকের ইংরেজি বাকি!', body: `${first ? first + ', ' : ''}মাত্র ৫ মিনিট। একটা লেসন করে ফেলো।` };
}
