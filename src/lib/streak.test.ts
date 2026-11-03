import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS, recordLesson, type Progress } from './progress';
import { currentStreak, nextStreak } from './streak';

const at = (streak: number, lastActiveDay: string, streakFreezes = 0): Progress => ({ ...DEFAULT_PROGRESS, streak, lastActiveDay, streakFreezes });

describe('streak freezes', () => {
  it('earns a freeze every 7 days of streak, holding at most 2', () => {
    let p = at(6, '2026-11-02');
    p = recordLesson(p, null, 10, '2026-11-03');
    expect(p.streak).toBe(7);
    expect(p.streakFreezes).toBe(1);
    expect(nextStreak(at(13, '2026-11-02', 2), '2026-11-03').streakFreezes).toBe(2);
  });

  it('uses a freeze to keep the streak over a missed day', () => {
    const p = at(9, '2026-11-01', 1);
    expect(currentStreak(p, '2026-11-03')).toBe(9);
    expect(nextStreak(p, '2026-11-03')).toEqual({ streak: 10, streakFreezes: 0 });
  });

  it('loses the streak when more days are missed than freezes cover', () => {
    const p = at(9, '2026-10-30', 1);
    expect(currentStreak(p, '2026-11-03')).toBe(0);
    expect(nextStreak(p, '2026-11-03')).toEqual({ streak: 1, streakFreezes: 1 });
  });

  it('does nothing more on a second lesson the same day', () => {
    expect(nextStreak(at(4, '2026-11-03', 1), '2026-11-03')).toEqual({ streak: 4, streakFreezes: 1 });
  });
});
