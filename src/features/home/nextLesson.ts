import { COURSE } from '../../data/course';
import type { Lesson, Unit } from '../../types';

export interface NextLesson {
  unit: Unit;
  lesson: Lesson;
  unitNumber: number;
  lessonNumber: number;
  /** Lessons already finished in this unit. */
  doneInUnit: number;
}

/**
 * The first lesson not yet completed, in course order; null when everything is done. With `isLocked`,
 * units the learner can't open (Plus-only) are skipped, so "next" never points at a locked door.
 */
export function nextLesson(completed: Record<string, number>, isLocked?: (unitId: string) => boolean): NextLesson | null {
  for (const [u, unit] of COURSE.entries()) {
    if (isLocked?.(unit.id)) continue;
    const index = unit.lessons.findIndex((l) => !completed[l.id]);
    if (index >= 0) {
      return {
        unit,
        lesson: unit.lessons[index],
        unitNumber: u + 1,
        lessonNumber: index + 1,
        doneInUnit: unit.lessons.filter((l) => completed[l.id]).length,
      };
    }
  }
  return null;
}
