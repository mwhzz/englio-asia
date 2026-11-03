/**
 * Limits on what an app can claim, so a hand-edited progress can't top the league.
 * A real learner earns roughly 10–25 XP a lesson, so 600 in one day is already a very long day.
 */
export const MAX_XP_PER_DAY = 600;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * XP per day as the server trusts it: real dates only, none more than a day in the future
 * (time zones), each capped at MAX_XP_PER_DAY; anything else is dropped.
 */
export function fairXpByDay(xpByDay: unknown, now = new Date()): Record<string, number> {
  if (!xpByDay || typeof xpByDay !== 'object') return {};
  const latest = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10);
  const out: Record<string, number> = {};
  for (const [day, xp] of Object.entries(xpByDay as Record<string, unknown>)) {
    if (!DAY.test(day) || day > latest || Number.isNaN(Date.parse(day))) continue;
    if (typeof xp !== 'number' || !Number.isFinite(xp) || xp <= 0) continue;
    out[day] = Math.min(Math.round(xp), MAX_XP_PER_DAY);
  }
  return out;
}

/** Total XP can't be more than the trusted days add up to (plus what came before day-by-day counting). */
export function fairTotalXp(xp: unknown, days: Record<string, number>, previous: number): number {
  const claimed = typeof xp === 'number' && Number.isFinite(xp) ? Math.max(0, Math.round(xp)) : 0;
  const earned = Object.values(days).reduce((a, b) => a + b, 0);
  return Math.min(claimed, Math.max(earned, previous));
}
