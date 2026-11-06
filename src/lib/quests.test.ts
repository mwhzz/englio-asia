import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS } from './progress';
import { canClaim, claimQuests, todaysQuests } from './quests';

const today = '2026-11-06';
const busy = { ...DEFAULT_PROGRESS, dailyGoal: 20, xpByDay: { [today]: 30 }, lessonsByDay: { [today]: 2 }, secondsByDay: { [today]: 700 } };

describe('daily quests', () => {
  it('count what was done today', () => {
    expect(todaysQuests(DEFAULT_PROGRESS, today).map((q) => q.done)).toEqual([0, 0, 0]);
    expect(todaysQuests(busy, today).every((q) => q.done >= q.target)).toBe(true);
  });

  it('give one streak freeze a day when all three are done', () => {
    expect(canClaim(busy, today)).toBe(true);
    const after = claimQuests(busy, today);
    expect(after.streakFreezes).toBe(1);
    expect(canClaim(after, today)).toBe(false);
    expect(claimQuests(after, today)).toBe(after);
    expect(canClaim({ ...after, xpByDay: { '2026-11-07': 30 }, lessonsByDay: { '2026-11-07': 2 }, secondsByDay: { '2026-11-07': 700 } }, '2026-11-07')).toBe(true);
  });
});
