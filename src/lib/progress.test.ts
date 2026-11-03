import { describe, expect, it } from 'vitest';
import { shiftDay } from './days';
import { DEFAULT_PROGRESS, recordLesson } from './progress';
import { currentStreak } from './streak';

const day = '2026-03-31';

describe('recordLesson', () => {
  it('adds XP, counts the lesson and starts a streak', () => {
    const p = recordLesson(DEFAULT_PROGRESS, 'u1-l1', 15, day);
    expect(p.xp).toBe(15);
    expect(p.completed['u1-l1']).toBe(1);
    expect(p.xpByDay[day]).toBe(15);
    expect(p.streak).toBe(1);
  });

  it('counts lessons and time per day', () => {
    let p = recordLesson(DEFAULT_PROGRESS, 'u1-l1', 10, day, 90);
    p = recordLesson(p, null, 5, day, 30);
    expect(p.lessonsByDay[day]).toBe(2);
    expect(p.secondsByDay[day]).toBe(120);
  });

  it('extends the streak on consecutive days only', () => {
    let p = recordLesson(DEFAULT_PROGRESS, 'u1-l1', 10, day);
    p = recordLesson(p, 'u1-l2', 10, day);
    expect(p.streak).toBe(1);
    p = recordLesson(p, 'u1-l3', 10, shiftDay(day, 1));
    expect(p.streak).toBe(2);
    p = recordLesson(p, 'u2-l1', 10, shiftDay(day, 5));
    expect(p.streak).toBe(1);
  });

  it('records practice without marking a lesson', () => {
    const p = recordLesson(DEFAULT_PROGRESS, null, 5, day);
    expect(p.completed).toEqual({});
    expect(p.xp).toBe(5);
  });
});

describe('currentStreak', () => {
  it('drops to zero after a missed day', () => {
    const p = recordLesson(DEFAULT_PROGRESS, 'u1-l1', 10, day);
    expect(currentStreak(p, shiftDay(day, 1))).toBe(1);
    expect(currentStreak(p, shiftDay(day, 2))).toBe(0);
  });
});

describe('shiftDay', () => {
  it('crosses month and year boundaries', () => {
    expect(shiftDay('2026-03-31', 1)).toBe('2026-04-01');
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
  });
});
