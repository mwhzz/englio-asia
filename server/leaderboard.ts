import type { DatabaseSync } from 'node:sqlite';
import { MAX_XP_PER_DAY } from './fairPlay.ts';

/** How long one count of the week's XP is reused, so a million learners don't each rescan the table. */
const CACHE_MS = 5 * 60 * 1000;
const TOP = 10;

interface Row {
  id: string;
  name: string | null;
  district: string | null;
  xp: number;
}

export interface Leaderboard {
  /** The league's week, Saturday to Friday in Bangladesh ("2026-10-31" to "2026-11-06"); it starts fresh each Saturday. */
  since: string;
  ends: string;
  districts: { districtId: string; xp: number; learners: number }[];
  /** The top learners of `districtId` (or of the whole country without one); first names only. */
  learners: { name: string; xp: number; isMe: boolean }[];
  me: { rank: number; xp: number } | null;
  /** My district's place among districts. */
  myDistrictRank: number | null;
}

const dhakaDay = (at: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(at);
const shift = (day: string, days: number) => new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** This league week: from the last Saturday (the Bangladesh week starts on Saturday) to the coming Friday. */
export function leagueWeek(now = new Date()): { since: string; ends: string } {
  const today = dhakaDay(now);
  const sinceSaturday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 1) % 7;
  const since = shift(today, -sinceSaturday);
  return { since, ends: shift(since, 6) };
}

let cache: { at: number; since: string; rows: Row[] } | null = null;

/** XP of these learners (or everyone) this league week, highest first; each day counts at most MAX_XP_PER_DAY. */
export function weekXp(db: DatabaseSync, now: Date, ids?: string[]): Row[] {
  const { since, ends } = leagueWeek(now);
  const only = ids ? `AND u.id IN (${ids.map(() => '?').join(',') || "''"})` : '';
  const found = db
    .prepare(
      `SELECT u.id, u.name, u.district_id AS district, SUM(MIN(j.value, ${MAX_XP_PER_DAY})) AS week_xp
       FROM users u, json_each(u.progress, '$.xpByDay') j
       WHERE j.key >= ? AND j.key <= ? AND j.type IN ('integer', 'real') AND j.value > 0 ${only}
       GROUP BY u.id
       HAVING week_xp > 0
       ORDER BY week_xp DESC`,
    )
    .all(since, ends, ...(ids ?? [])) as unknown as (Omit<Row, 'xp'> & { week_xp: number })[];
  return found.map(({ week_xp, ...r }) => ({ ...r, xp: week_xp }));
}

/** Everyone's XP this league week, counted once and reused for a few minutes. */
function weekRows(db: DatabaseSync, now: Date): { since: string; rows: Row[] } {
  const { since } = leagueWeek(now);
  if (cache && cache.since === since && now.getTime() - cache.at < CACHE_MS) return cache;
  const rows = weekXp(db, now);
  cache = { at: now.getTime(), since, rows };
  return cache;
}

/** Forgets the cached count (tests, or after the admin deletes learners). */
export function clearLeaderboardCache(): void {
  cache = null;
}

/** This week's district league, and the top learners of a district, as seen by learner `me`. */
export function leaderboard(db: DatabaseSync, districtId: string | null, me: string | null, now = new Date()): Leaderboard {
  const { rows } = weekRows(db, now);

  const totals = new Map<string, { xp: number; learners: number }>();
  for (const r of rows) {
    if (!r.district) continue;
    const t = totals.get(r.district) ?? { xp: 0, learners: 0 };
    t.xp += r.xp;
    t.learners++;
    totals.set(r.district, t);
  }
  const ranked = [...totals].map(([id, t]) => ({ districtId: id, ...t })).sort((a, b) => b.xp - a.xp);

  const local = districtId ? rows.filter((r) => r.district === districtId) : rows;
  const myIndex = me ? local.findIndex((r) => r.id === me) : -1;
  const districtIndex = districtId ? ranked.findIndex((d) => d.districtId === districtId) : -1;

  return {
    ...leagueWeek(now),
    districts: ranked.slice(0, TOP),
    learners: local.slice(0, TOP).map((r) => ({ name: r.name?.trim().split(/\s+/)[0] || 'Learner', xp: r.xp, isMe: r.id === me })),
    me: myIndex >= 0 ? { rank: myIndex + 1, xp: local[myIndex].xp } : null,
    myDistrictRank: districtIndex >= 0 ? districtIndex + 1 : null,
  };
}
