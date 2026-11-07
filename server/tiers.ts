/**
 * League tiers (ধাপ): ব্রোঞ্জ → সিলভার → গোল্ড → ডায়মন্ড. When a new league week starts for a learner, last
 * week decides: PROMOTE XP or more moves up one tier, less than KEEP XP (or a whole week skipped) moves down
 * one, anything between stays. Learners compete with others in their tier (leaderboard.ts).
 */
export const TIERS = [
  { id: 'bronze', bn: 'ব্রোঞ্জ' },
  { id: 'silver', bn: 'সিলভার' },
  { id: 'gold', bn: 'গোল্ড' },
  { id: 'diamond', bn: 'ডায়মন্ড' },
] as const;
export const PROMOTE = 150;
export const KEEP = 30;

const DAY = 86_400_000;

/**
 * The tier after a learner's league week changed from `oldWeek` (with `oldXp`) to `newWeek` ("2026-10-31"
 * style Saturdays). Same week, or no earlier week: the tier stays.
 */
export function nextTier(tier: number, oldWeek: string | null, oldXp: number, newWeek: string | null): number {
  if (!oldWeek || !newWeek || newWeek <= oldWeek) return tier;
  const weeksApart = Math.round((Date.parse(newWeek) - Date.parse(oldWeek)) / (7 * DAY));
  // A week skipped completely counts as a quiet week.
  if (weeksApart > 1) return Math.max(0, tier - 1);
  if (oldXp >= PROMOTE) return Math.min(TIERS.length - 1, tier + 1);
  if (oldXp < KEEP) return Math.max(0, tier - 1);
  return tier;
}
