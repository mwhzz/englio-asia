import { dayKey, daysBetween } from './days';
import type { Progress } from './progress';

/** Most streak freezes a learner can hold. */
export const MAX_FREEZES = 2;
/** A freeze is earned every this many days of streak. */
export const FREEZE_EVERY = 7;

/** Days missed since the last active day (0 if active today or yesterday). */
function missed(p: Progress, today: string): number {
  return p.lastActiveDay ? Math.max(0, daysBetween(p.lastActiveDay, today) - 1) : Infinity;
}

/** The streak still counts if the learner was active today or yesterday, or a freeze covers each missed day. */
export function currentStreak(p: Progress, today = dayKey()): number {
  if (!p.lastActiveDay) return 0;
  return missed(p, today) <= (p.streakFreezes ?? 0) ? p.streak : 0;
}

/**
 * The streak after being active today: +1 on a new day, kept across missed days that freezes cover
 * (using them up), otherwise back to 1. Every 7 days of streak earns a freeze, up to 2.
 */
export function nextStreak(p: Progress, today: string): { streak: number; streakFreezes: number } {
  const freezes = p.streakFreezes ?? 0;
  if (p.lastActiveDay === today) return { streak: p.streak, streakFreezes: freezes };
  const gap = missed(p, today);
  const kept = p.lastActiveDay !== null && gap <= freezes;
  const streak = kept ? p.streak + 1 : 1;
  const left = kept ? freezes - gap : freezes;
  const earned = streak % FREEZE_EVERY === 0 ? 1 : 0;
  return { streak, streakFreezes: Math.min(MAX_FREEZES, left + earned) };
}
