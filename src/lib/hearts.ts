import { MAX_HEARTS, type Progress } from './progress';

export const HEART_REGEN_MS = 30 * 60 * 1000;

/** Adds the hearts earned since `heartsUpdatedAt`. Returns `p` itself when nothing changes. */
export function regenHearts(p: Progress, now: number): Progress {
  if (p.hearts >= MAX_HEARTS) return p;
  const gained = Math.floor((now - p.heartsUpdatedAt) / HEART_REGEN_MS);
  if (gained <= 0) return p;
  return {
    ...p,
    hearts: Math.min(MAX_HEARTS, p.hearts + gained),
    heartsUpdatedAt: p.heartsUpdatedAt + gained * HEART_REGEN_MS,
  };
}

export function loseHeart(p: Progress, now: number): Progress {
  const current = regenHearts(p, now);
  if (current.hearts <= 0) return current;
  return {
    ...current,
    hearts: current.hearts - 1,
    // The refill clock starts when the first heart is lost.
    heartsUpdatedAt: current.hearts >= MAX_HEARTS ? now : current.heartsUpdatedAt,
  };
}

export function gainHeart(p: Progress): Progress {
  return p.hearts >= MAX_HEARTS ? p : { ...p, hearts: p.hearts + 1 };
}

export function nextHeartAt(p: Progress): number | null {
  return p.hearts >= MAX_HEARTS ? null : p.heartsUpdatedAt + HEART_REGEN_MS;
}

export function minutesUntil(time: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((time - now) / 60000));
}

/** Lessons a new learner finishes before mistakes cost hearts (so the first day can't end in "out of hearts"). */
export const FREE_LESSONS = 3;
export const beginner = (p: { completed: Record<string, number> }) => Object.keys(p.completed ?? {}).length < FREE_LESSONS;
