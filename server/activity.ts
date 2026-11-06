import { leagueWeek } from './leaderboard.ts';

/**
 * What reminders and the league need from a learner's XP per day, kept in columns of `users`:
 * the last day with any XP, and the league week of that day with its XP (each day already capped).
 * A learner whose last XP was in an earlier week simply isn't in this week's league.
 */
export function activitySummary(days: Record<string, number>): { lastDay: string | null; weekSince: string | null; weekXp: number } {
  const keys = Object.keys(days).sort();
  const lastDay = keys.at(-1) ?? null;
  if (!lastDay) return { lastDay: null, weekSince: null, weekXp: 0 };
  // Midday in Bangladesh on that day, so the day falls in the right league week.
  const { since, ends } = leagueWeek(new Date(`${lastDay}T06:00:00Z`));
  const weekXp = keys.filter((d) => d >= since && d <= ends).reduce((sum, d) => sum + days[d], 0);
  return { lastDay, weekSince: since, weekXp };
}
