import { describe, expect, it } from 'vitest';
import { BADGES, earned } from './badges';
import { DEFAULT_PROGRESS } from './progress';
import { weekReport } from './weekReport';

describe('badges', () => {
  it('have unique ids and none are earned at the start', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    expect(earned(DEFAULT_PROGRESS)).toEqual([]);
  });

  it('are earned when their number is reached', () => {
    const p = { ...DEFAULT_PROGRESS, xp: 120, streak: 3, completed: { 'u1-l1': 1 } };
    expect(earned(p).map((b) => b.id)).toEqual(['first-lesson', 'streak-3', 'xp-100']);
  });
});

describe('weekly report', () => {
  it('compares the last 7 days with the 7 before', () => {
    const p = {
      ...DEFAULT_PROGRESS,
      xpByDay: { '2026-11-03': 20, '2026-10-28': 10, '2026-10-27': 15, '2026-10-20': 99 },
      lessonsByDay: { '2026-11-03': 2, '2026-10-27': 1 },
      secondsByDay: { '2026-11-03': 600 },
    };
    const { now, before } = weekReport(p, '2026-11-03');
    expect(now).toEqual({ xp: 30, lessons: 2, minutes: 10, activeDays: 2 });
    expect(before).toEqual({ xp: 15, lessons: 1, minutes: 0, activeDays: 1 });
  });
});

describe('every badge can be earned', () => {
  it('has no badge for the removed letters tab', () => {
    expect(BADGES.map((b) => b.id)).not.toContain('alphabet');
  });
});
