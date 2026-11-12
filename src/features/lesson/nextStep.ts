import { ALL_LESSONS } from '../../data/course';
import { dayKey } from '../../lib/days';
import type { Progress } from '../../lib/progress';
import { nextLesson } from '../home/nextLesson';

/** After a lesson, the one thing to do next (the finish screen's main button). */
export type NextStep = { kind: 'test'; unitId: string } | { kind: 'goal' } | { kind: 'lesson'; lessonId: string } | { kind: 'home' };

/**
 * The unit just finished → its test; today's goal reached → done for today (come back tomorrow);
 * else → the next lesson. Practice and reviews go home.
 */
export function nextStep(p: Progress, lessonId: string | null, isLocked?: (unitId: string) => boolean): NextStep {
  if (!lessonId) return { kind: 'home' };
  const unit = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.unit;
  if (unit && unit.lessons.every((l) => p.completed[l.id]) && !p.unitTests?.[unit.id]) return { kind: 'test', unitId: unit.id };
  if ((p.xpByDay[dayKey()] ?? 0) >= p.dailyGoal) return { kind: 'goal' };
  const next = nextLesson(p.completed, isLocked);
  return next ? { kind: 'lesson', lessonId: next.lesson.id } : { kind: 'home' };
}
