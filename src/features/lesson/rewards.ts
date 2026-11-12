import { nextSkill } from '../../lib/difficulty';
import { gainHeart } from '../../lib/hearts';
import { recordLesson, type Progress } from '../../lib/progress';
import { currentStreak } from '../../lib/streak';
import { ALL_LESSONS } from '../../data/course';
import { scheduleTaught } from '../../lib/review';
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
  const recorded = recordLesson(practice ? gainHeart(p) : p, lessonId, xp, today, stats.seconds);
  // How well it went sets how hard the next lessons are.
  const skilled = { ...recorded, skill: nextSkill(p.skill, stats.attempts - stats.mistakes, stats.attempts) };
  // The lesson's new words come back after 1, 2, 4 and 7 days (4 times in the first two weeks) (lib/review.ts).
  const taught = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.lesson.vocab.map((v) => v.en) ?? [];
  const next = practice ? skilled : scheduleTaught(skilled, taught, today);
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
