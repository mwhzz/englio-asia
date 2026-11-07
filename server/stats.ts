import type { DatabaseSync } from 'node:sqlite';

const DAY = 86_400_000;
const dhaka = (at: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(at);
const shift = (day: string, days: number) => new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

/**
 * The owner's daily numbers for the last `days` days: sign-ups and active learners per day, retention
 * (of those who joined, how many came back after 1, 7 and 30 days), onboarding drop-off, reminders,
 * Englio Plus, crashes by app version, and learners by app version.
 */
export function stats(db: DatabaseSync, days = 30, now = new Date()) {
  const today = dhaka(now);
  const since = shift(today, -(days - 1));
  const all = <T>(sql: string, ...args: (string | number)[]) => db.prepare(sql).all(...args) as T[];
  const one = (sql: string, ...args: (string | number)[]) => (db.prepare(sql).get(...args) as { n: number | null }).n ?? 0;

  const signups = new Map(all<{ day: string; n: number }>('SELECT substr(joined_at, 1, 10) AS day, COUNT(*) AS n FROM users WHERE joined_at >= ? GROUP BY day', since).map((r) => [r.day, r.n]));
  const active = new Map(all<{ day: string; n: number }>('SELECT day, COUNT(*) AS n FROM active_days WHERE day >= ? GROUP BY day', since).map((r) => [r.day, r.n]));
  const daily = Array.from({ length: days }, (_, i) => {
    const day = shift(since, i);
    return { day, signups: signups.get(day) ?? 0, active: active.get(day) ?? 0 };
  });

  // Retention: learners who joined at least N days ago (within the last 90), and how many practised on day N.
  const retention = [1, 7, 30].map((after) => {
    const latest = shift(today, -after);
    const from = shift(today, -90);
    const cohort = one('SELECT COUNT(*) AS n FROM users WHERE substr(joined_at, 1, 10) BETWEEN ? AND ?', from, latest);
    const back = one(
      `SELECT COUNT(*) AS n FROM users u WHERE substr(u.joined_at, 1, 10) BETWEEN ? AND ?
       AND EXISTS (SELECT 1 FROM active_days a WHERE a.user_id = u.id AND a.day = date(substr(u.joined_at, 1, 10), '+' || ? || ' days'))`,
      from,
      latest,
      after,
    );
    return { after, cohort, back, rate: cohort ? Math.round((100 * back) / cohort) : null };
  });

  const events = (name: string) =>
    Object.fromEntries(all<{ key: string; n: number }>('SELECT key, SUM(n) AS n FROM events WHERE name = ? AND day >= ? GROUP BY key', name, since).map((r) => [r.key, r.n]));
  const onboard = events('onboard');
  const firstLesson = one("SELECT SUM(n) AS n FROM events WHERE name = 'lesson_start' AND key = 'u1-l1' AND day >= ?", since);
  const asks = events('reminder_ask');
  const nowIso = now.toISOString();

  return {
    since,
    daily,
    retention,
    onboarding: [
      { step: 'welcome', n: onboard.welcome ?? 0 },
      { step: 'district', n: onboard.district ?? 0 },
      { step: 'name', n: onboard.name ?? 0 },
      { step: 'class', n: onboard.class ?? 0 },
      { step: 'done', n: onboard.done ?? 0 },
      { step: 'first-lesson', n: firstLesson },
    ],
    // Each reminder wording: sent and opened (sw.js counts opens by wording).
    reminderVariants: (() => {
      const sent = events('reminder_sent');
      const opened = events('reminder_open');
      return Object.keys({ ...sent, ...opened })
        .filter((k) => k !== 'sent' && k !== 'open')
        .map((k) => ({ variant: k, sent: sent[k] ?? 0, opened: opened[k] ?? 0 }))
        .sort((a, b) => b.sent - a.sent);
    })(),
    reminders: {
      subscribed: one('SELECT COUNT(*) AS n FROM push_subs'),
      asked: asks.shown ?? 0,
      said_yes: Object.entries(asks).filter(([k]) => k.startsWith('on:')).reduce((a, [, n]) => a + n, 0),
      later: asks.later ?? 0,
      blocked: asks.blocked ?? 0,
      sent: one("SELECT SUM(n) AS n FROM events WHERE name = 'reminder_sent' AND day >= ?", since),
      opened: one("SELECT SUM(n) AS n FROM events WHERE name = 'reminder_open' AND day >= ?", since),
      // Of learners with a reminder, how many practised today, against those without one.
      activeTodayWith: one('SELECT COUNT(*) AS n FROM push_subs p JOIN active_days a ON a.user_id = p.user_id AND a.day = ?', today),
      activeTodayWithout: one('SELECT COUNT(*) AS n FROM active_days a WHERE a.day = ? AND a.user_id NOT IN (SELECT user_id FROM push_subs)', today),
    },
    plus: {
      active: one('SELECT COUNT(*) AS n FROM premium WHERE until > ?', nowIso),
      paid: one("SELECT COUNT(*) AS n FROM payments WHERE status = 'paid' AND created_at >= ?", since),
      revenue: one("SELECT SUM(amount) AS n FROM payments WHERE status = 'paid' AND created_at >= ?", since),
      started: one('SELECT COUNT(*) AS n FROM payments WHERE created_at >= ?', since),
    },
    // Do learners who finish more lessons come back? Learners who joined 7–90 days ago, grouped by lessons
    // finished, and how many of them practised in the last 7 days.
    returnByLessons: [
      [1, 1],
      [2, 3],
      [4, 9],
      [10, 1_000_000],
    ].map(([lo, hi]) => {
      const where = 'joined_at BETWEEN ? AND ? AND lessons_done BETWEEN ? AND ?';
      const range = [shift(today, -90), shift(today, -7), lo, hi] as const;
      const learners = one(`SELECT COUNT(*) AS n FROM users WHERE ${where}`, ...range);
      const back = one(
        `SELECT COUNT(*) AS n FROM users u WHERE ${where} AND EXISTS (SELECT 1 FROM active_days a WHERE a.user_id = u.id AND a.day > ?)`,
        ...range,
        shift(today, -7),
      );
      return { lessons: hi >= 1_000_000 ? `${lo}+` : lo === hi ? `${lo}` : `${lo}-${hi}`, learners, back, rate: learners ? Math.round((100 * back) / learners) : null };
    }),
    // Where this period's new learners came from (campaign tags on their first link).
    sources: all<{ source: string; n: number }>(
      "SELECT COALESCE(source, 'direct') AS source, COUNT(*) AS n FROM users WHERE joined_at >= ? GROUP BY source ORDER BY n DESC LIMIT 15",
      since,
    ),
    // Learners who practised in the last 7 and 30 days, and how "sticky" the app is (daily / monthly).
    activeWeek: one('SELECT COUNT(DISTINCT user_id) AS n FROM active_days WHERE day > ?', shift(today, -7)),
    activeMonth: one('SELECT COUNT(DISTINCT user_id) AS n FROM active_days WHERE day > ?', shift(today, -30)),
    versions: all<{ version: string; n: number }>(
      "SELECT COALESCE(app_version, '?') AS version, COUNT(*) AS n FROM users WHERE last_seen >= ? GROUP BY version ORDER BY n DESC LIMIT 10",
      new Date(now.getTime() - 7 * DAY).toISOString(),
    ),
    crashes: all<{ version: string; n: number; errors: number }>(
      "SELECT COALESCE(version, '?') AS version, SUM(n) AS n, COUNT(*) AS errors FROM app_errors WHERE last_at >= ? GROUP BY version ORDER BY n DESC LIMIT 10",
      new Date(now.getTime() - days * DAY).toISOString(),
    ),
  };
}

/** Forgets practice days older than 120 days (run daily; retention only looks back 90 days + 30). */
export function trimActiveDays(db: DatabaseSync, now = new Date()): void {
  db.prepare('DELETE FROM active_days WHERE day < ?').run(shift(dhaka(now), -120));
}
