import { dayKey } from './days';
import { toBanglaDigits } from './bangla';
import type { Progress } from './progress';
import { MAX_FREEZES } from './streak';

export interface Quest {
  id: string;
  bn: string;
  done: number;
  target: number;
}

/**
 * Today's three quests, from what the learner did today: reach the daily goal, finish two lessons (or
 * practices), and learn for ten minutes. All three done earns a streak freeze (one a day, see claimQuests).
 */
export function todaysQuests(p: Progress, today = dayKey()): Quest[] {
  return [
    { id: 'goal', bn: `দৈনিক লক্ষ্য: ${toBanglaDigits(p.dailyGoal)} XP`, done: p.xpByDay[today] ?? 0, target: p.dailyGoal },
    { id: 'lessons', bn: '২টা লেসন বা অনুশীলন শেষ করো', done: p.lessonsByDay[today] ?? 0, target: 2 },
    { id: 'minutes', bn: '১০ মিনিট শেখো', done: Math.floor((p.secondsByDay[today] ?? 0) / 60), target: 10 },
  ];
}

export const allDone = (quests: Quest[]) => quests.every((q) => q.done >= q.target);

/** Whether today's reward can be collected now. */
export const canClaim = (p: Progress, today = dayKey()) => allDone(todaysQuests(p, today)) && p.questDay !== today;

/** Collects today's reward: a streak freeze (up to the most a learner can hold). */
export function claimQuests(p: Progress, today = dayKey()): Progress {
  if (!canClaim(p, today)) return p;
  return { ...p, questDay: today, streakFreezes: Math.min(MAX_FREEZES, (p.streakFreezes ?? 0) + 1) };
}
