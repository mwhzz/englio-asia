import { gainHeart } from '../../lib/hearts';
import { recordLesson, type Progress } from '../../lib/progress';
import { currentStreak } from '../../lib/streak';
import type { LessonStats } from './useLessonSession';

export const LESSON_XP = 10;
export const PERFECT_BONUS_XP = 5;
export const PRACTICE_XP = 5;

export interface LessonResult {
  xp: number;
  accuracy: number;
  seconds: number;
  perfect: boolean;
  practice: boolean;
  streak: number;
  streakUp: boolean;
}

/** XP, streak and hearts earned for a finished lesson; `lessonId` null means a practice session. */
export function applyRewards(p: Progress, lessonId: string | null, stats: LessonStats, today: string) {
  const practice = lessonId === null;
  const perfect = stats.mistakes === 0;
  const xp = practice ? PRACTICE_XP : LESSON_XP + (perfect ? PERFECT_BONUS_XP : 0);
  const next = recordLesson(practice ? gainHeart(p) : p, lessonId, xp, today, stats.seconds);
  const result: LessonResult = {
    xp,
    perfect,
    practice,
    seconds: stats.seconds,
    accuracy: Math.round((100 * (stats.attempts - stats.mistakes)) / Math.max(1, stats.attempts)),
    streak: next.streak,
    streakUp: next.streak > currentStreak(p, today),
  };
  return { progress: next, result };
}
