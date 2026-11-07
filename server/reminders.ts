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
  /** Days since they last practised (0 = yesterday or never). */
  away: number;
  /** The learner's language, for the message. */
  lang?: string;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) - 1;
/** After two quiet days, only these days away get a "come back" message (not every day: that gets notifications turned off). */
const COME_BACK_DAYS = new Set([3, 7, 14, 30]);

/**
 * Who should get a reminder now: it's their chosen hour where they live and they haven't
 * earned any XP today. Run this once an hour (see docs/SERVER.md) and push to each.
 */
export function dueReminders(db: DatabaseSync, now = new Date()): DueReminder[] {
  // Only the few columns needed (never the whole progress), and one at a time, so 100k sign-ups stay small.
  const rows = db
    .prepare(
      `SELECT p.user_id, p.subscription, p.hour, p.time_zone, u.name, u.streak, u.last_xp_day, u.lang
       FROM push_subs p JOIN users u ON u.id = p.user_id`,
    )
    .iterate() as Iterable<{ user_id: string; subscription: string; hour: number; time_zone: string; name: string | null; streak: number; last_xp_day: string | null; lang: string }>;
  const due: DueReminder[] = [];
  const zones = new Map<string, { day: string; hour: number }>();
  for (const r of rows) {
    let local = zones.get(r.time_zone);
    if (!local) zones.set(r.time_zone, (local = localTime(now, r.time_zone)));
    if (local.hour !== r.hour) continue;
    // Any XP today (or "tomorrow", a time-zone edge) means they practised.
    if (r.last_xp_day && r.last_xp_day >= local.day) continue;
    const away = r.last_xp_day ? Math.max(0, daysBetween(r.last_xp_day, local.day)) : 0;
    if (away > 2 && !COME_BACK_DAYS.has(away)) continue;
    due.push({ userId: r.user_id, name: r.name, streak: r.streak, subscription: JSON.parse(r.subscription), away, ...(r.lang && r.lang !== 'bn' ? { lang: r.lang } : {}) });
  }
  return due;
}

/**
 * The notification for one learner: about the streak when there's one to lose, a "come back" message after
 * days away, otherwise one of a few everyday wordings. `variant` names the wording, so the admin can compare
 * how often each one is opened.
 */
export function reminderMessage(r: Pick<DueReminder, 'name' | 'streak'> & { away?: number; lang?: string }, pick = Math.random()): { title: string; body: string; variant: string } {
  if (r.lang === 'ar') return arabicMessage(r);
  const first = r.name?.split(' ')[0];
  const hi = first ? `${first}, ` : '';
  const away = r.away ?? 0;
  if (away >= 3) {
    return away >= 14
      ? { title: 'অনেক দিন দেখা নেই!', body: `${hi}ইংরেজি ভুলে যাওয়ার আগে ৫ মিনিটের একটা লেসন করে ফেলো।`, variant: `back-${away}` }
      : { title: 'তোমাকে মিস করছি', body: `${hi}যেখানে থেমেছিলে সেখান থেকেই শুরু করো। মাত্র ৫ মিনিট।`, variant: `back-${away}` };
  }
  if (r.streak > 1) {
    return { title: `${toBanglaDigits(r.streak)} দিনের স্ট্রিক বাঁচাও!`, body: `${hi}আজকের একটা লেসন বাকি। মাত্র ৫ মিনিট লাগবে।`, variant: 'streak' };
  }
  const everyday = [
    { title: 'আজকের ইংরেজি বাকি!', body: `${hi}মাত্র ৫ মিনিট। একটা লেসন করে ফেলো।`, variant: 'daily-a' },
    { title: 'নতুন ৫টা শব্দ অপেক্ষা করছে', body: `${hi}আজকের লেসনটা করে ফেলো। ৫ মিনিটেই হয়ে যাবে।`, variant: 'daily-b' },
    { title: 'একটু ইংরেজি হয়ে যাক?', body: `${hi}রোজ ৫ মিনিট = এক মাসে অনেক শব্দ।`, variant: 'daily-c' },
  ];
  return everyday[Math.min(everyday.length - 1, Math.floor(pick * everyday.length))];
}

/** The same messages for Arabic-speaking learners. */
function arabicMessage(r: Pick<DueReminder, 'name' | 'streak'> & { away?: number }): { title: string; body: string; variant: string } {
  const first = r.name?.split(' ')[0];
  const hi = first ? `${first}، ` : '';
  const away = r.away ?? 0;
  if (away >= 3) return { title: 'اشتقنا إليك', body: `${hi}ابدأ من حيث توقفت. خمس دقائق فقط.`, variant: `ar-back-${away}` };
  if (r.streak > 1) return { title: `احمِ سلسلة ${r.streak} أيام!`, body: `${hi}بقي درس اليوم. خمس دقائق فقط.`, variant: 'ar-streak' };
  return { title: 'إنجليزية اليوم تنتظرك!', body: `${hi}خمس دقائق فقط. أنهِ درسًا واحدًا.`, variant: 'ar-daily' };
}
