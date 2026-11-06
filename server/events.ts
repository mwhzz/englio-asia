import type { DatabaseSync } from 'node:sqlite';
import { transaction } from './db.ts';
import { HttpError } from './http.ts';

const NAMES = new Set(['lesson_start', 'lesson_done', 'mistake', 'story_done', 'course_done', 'reminder_ask', 'onboard', 'reminder_open']);
const MAX_EVENTS = 200;

const today = (now: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(now);

/** Adds an app's batch of anonymous counts to today's totals; anything unknown is skipped. */
export function recordEvents(db: DatabaseSync, body: unknown, now = new Date()): { ok: true; kept: number } {
  const events = (body as { events?: unknown } | null)?.events;
  if (!Array.isArray(events)) throw new HttpError(400, '"events" must be a list');
  const day = today(now);
  const add = db.prepare(
    `INSERT INTO events (day, name, key, n) VALUES (?, ?, ?, ?)
     ON CONFLICT(day, name, key) DO UPDATE SET n = n + excluded.n`,
  );
  let kept = 0;
  transaction(db, () => {
    for (const e of events.slice(0, MAX_EVENTS) as { name?: unknown; key?: unknown; n?: unknown }[]) {
      if (typeof e?.name !== 'string' || !NAMES.has(e.name) || typeof e.key !== 'string' || !e.key || e.key.length > 120) continue;
      const n = typeof e.n === 'number' && Number.isInteger(e.n) ? Math.min(Math.max(e.n, 1), 50) : 1;
      add.run(day, e.name, e.key, n);
      kept++;
    }
  });
  return { ok: true, kept };
}

/** Adds `n` to one of today's counts (for counts the server makes itself, like reminders sent). */
export function countEvent(db: DatabaseSync, name: string, key: string, n: number, now = new Date()): void {
  if (n <= 0) return;
  db.prepare(
    `INSERT INTO events (day, name, key, n) VALUES (?, ?, ?, ?)
     ON CONFLICT(day, name, key) DO UPDATE SET n = n + excluded.n`,
  ).run(today(now), name, key, n);
}

/** For the admin: each lesson's starts and finishes, and the most-missed exercises, over the last `days` days. */
export function analytics(db: DatabaseSync, days = 30, now = new Date()) {
  const since = today(new Date(now.getTime() - (days - 1) * 86_400_000));
  const sum = (name: string, limit: number) =>
    db
      .prepare('SELECT key, SUM(n) AS n FROM events WHERE name = ? AND day >= ? GROUP BY key ORDER BY n DESC LIMIT ?')
      .all(name, since, limit) as { key: string; n: number }[];
  const done = new Map(sum('lesson_done', 1000).map((r) => [r.key, r.n]));
  const course = db
    .prepare('SELECT l.id, l.title FROM lessons l JOIN units u ON u.id = l.unit_id ORDER BY u.lang, u.position, l.position')
    .all() as { id: string; title: string }[];
  const order = new Map(course.map((l, i) => [l.id, i]));
  const titles = new Map(course.map((l) => [l.id, l.title]));
  return {
    since,
    // In course order (unit, then lesson), so a drop between two lessons shows where learners stop.
    lessons: sum('lesson_start', 1000)
      .map((r) => ({ lessonId: r.key, started: r.n, finished: done.get(r.key) ?? 0, order: order.get(r.key) ?? Number.MAX_SAFE_INTEGER, title: titles.get(r.key) ?? null }))
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...l }) => l),
    mistakes: sum('mistake', 20).map((r) => ({ key: r.key, n: r.n })),
    stories: sum('story_done', 100).map((r) => ({ storyId: r.key, n: r.n })),
  };
}
