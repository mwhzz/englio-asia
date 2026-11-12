import { describe, expect, it } from 'vitest';
import { COURSE } from '../../data/course';
import { dayKey } from '../../lib/days';
import { DEFAULT_PROGRESS } from '../../lib/progress';
import { nextStep } from './nextStep';

const unit = COURSE[0];
const first = unit.lessons[0].id;
const all = Object.fromEntries(unit.lessons.map((l) => [l.id, 1]));

describe('after a lesson, the one next thing', () => {
  it('the next lesson while today\'s goal is open', () => {
    const p = { ...DEFAULT_PROGRESS, completed: { [first]: 1 }, xpByDay: { [dayKey()]: 10 }, dailyGoal: 20 };
    expect(nextStep(p, first)).toEqual({ kind: 'lesson', lessonId: unit.lessons[1].id });
  });

  it("done for today once the goal is reached", () => {
    const p = { ...DEFAULT_PROGRESS, completed: { [first]: 1 }, xpByDay: { [dayKey()]: 20 }, dailyGoal: 20 };
    expect(nextStep(p, first).kind).toBe('goal');
  });

  it('the unit test when the unit is finished and its test not passed', () => {
    const p = { ...DEFAULT_PROGRESS, completed: all, xpByDay: { [dayKey()]: 50 }, dailyGoal: 20 };
    expect(nextStep(p, unit.lessons.at(-1)!.id)).toEqual({ kind: 'test', unitId: unit.id });
  });

  it('practice goes home', () => {
    expect(nextStep(DEFAULT_PROGRESS, null).kind).toBe('home');
  });
});
