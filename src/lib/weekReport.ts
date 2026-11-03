import { dayKey, shiftDay } from './days';
import type { Progress } from './progress';

export interface WeekTotals {
  xp: number;
  lessons: number;
  minutes: number;
  activeDays: number;
}

/** Totals for the 7 days ending `end` (inclusive). */
function totals(p: Progress, end: string): WeekTotals {
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(end, -i));
  return {
    xp: days.reduce((n, d) => n + (p.xpByDay[d] ?? 0), 0),
    lessons: days.reduce((n, d) => n + (p.lessonsByDay[d] ?? 0), 0),
    minutes: Math.floor(days.reduce((n, d) => n + (p.secondsByDay[d] ?? 0), 0) / 60),
    activeDays: days.filter((d) => (p.xpByDay[d] ?? 0) > 0).length,
  };
}

/** This week (the last 7 days) next to the 7 days before it. */
export function weekReport(p: Progress, today = dayKey()): { now: WeekTotals; before: WeekTotals } {
  return { now: totals(p, today), before: totals(p, shiftDay(today, -7)) };
}
