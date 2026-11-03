import { dayKey } from '../../lib/days';
import type { Progress } from '../../lib/progress';

export interface Today {
  xp: number;
  goal: number;
  minutes: number;
  lessons: number;
  /** 0–1 share of the daily XP goal. */
  fraction: number;
}

/** What the learner has done today. */
export function todayStats(p: Progress, today = dayKey()): Today {
  const xp = p.xpByDay[today] ?? 0;
  return {
    xp,
    goal: p.dailyGoal,
    minutes: Math.floor((p.secondsByDay[today] ?? 0) / 60),
    lessons: p.lessonsByDay[today] ?? 0,
    fraction: Math.min(1, xp / Math.max(1, p.dailyGoal)),
  };
}
