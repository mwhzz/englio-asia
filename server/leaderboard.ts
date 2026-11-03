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
  /** The first day counted ("2026-10-28"); the week is the last 7 days in Bangladesh time. */
  since: string;
  districts: { districtId: string; xp: number; learners: number }[];
  /** The top learners of `districtId` (or of the whole country without one); first names only. */
  learners: { name: string; xp: number; isMe: boolean }[];
  me: { rank: number; xp: number } | null;
  /** My district's place among districts. */
  myDistrictRank: number | null;
}

const dhakaDay = (at: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(at);

let cache: { at: number; since: string; rows: Row[] } | null = null;

/** Everyone's XP over the last 7 days, highest first. */
function weekRows(db: DatabaseSync, now: Date): { since: string; rows: Row[] } {
  if (cache && now.getTime() - cache.at < CACHE_MS) return cache;
  const since = dhakaDay(new Date(now.getTime() - 6 * 86_400_000));
  // Each day counts at most MAX_XP_PER_DAY, and future days not at all (see fairPlay.ts).
  // `week_xp`, not `xp`: that name is already the users table's all-time XP column.
  const found = db
    .prepare(
      `SELECT u.id, u.name, u.district_id AS district, SUM(MIN(j.value, ${MAX_XP_PER_DAY})) AS week_xp
       FROM users u, json_each(u.progress, '$.xpByDay') j
       WHERE j.key >= ? AND j.key <= ? AND j.type IN ('integer', 'real') AND j.value > 0
       GROUP BY u.id
       HAVING week_xp > 0
       ORDER BY week_xp DESC`,
    )
    .all(since, dhakaDay(new Date(now.getTime() + 86_400_000))) as unknown as (Omit<Row, 'xp'> & { week_xp: number })[];
  const rows = found.map(({ week_xp, ...r }) => ({ ...r, xp: week_xp }));
  cache = { at: now.getTime(), since, rows };
  return cache;
}

/** Forgets the cached count (tests, or after the admin deletes learners). */
export function clearLeaderboardCache(): void {
  cache = null;
}

/** This week's district league, and the top learners of a district, as seen by learner `me`. */
export function leaderboard(db: DatabaseSync, districtId: string | null, me: string | null, now = new Date()): Leaderboard {
  const { since, rows } = weekRows(db, now);

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
    since,
    districts: ranked.slice(0, TOP),
    learners: local.slice(0, TOP).map((r) => ({ name: r.name?.trim().split(/\s+/)[0] || 'Learner', xp: r.xp, isMe: r.id === me })),
    me: myIndex >= 0 ? { rank: myIndex + 1, xp: local[myIndex].xp } : null,
    myDistrictRank: districtIndex >= 0 ? districtIndex + 1 : null,
  };
}
