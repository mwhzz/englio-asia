import { describe, expect, it } from 'vitest';
import { mergeProgress, sameProgress } from './mergeProgress';
import { DEFAULT_PROGRESS, type Progress } from './progress';

const profile = { name: 'Rina', districtId: 'dhaka', classId: 'class-8', joinedAt: '2026-10-01' };
const copy = (p: Partial<Progress>): Progress => ({ ...DEFAULT_PROGRESS, profile, ...p });

describe('merging two phones’ progress', () => {
  // The old phone kept learning after the code moved progress to a new phone.
  const oldPhone = copy({
    savedAt: 100,
    xp: 70,
    xpByDay: { '2026-11-01': 50, '2026-11-02': 20 },
    completed: { 'u1-l1': 1, 'u1-l2': 1 },
    streak: 2,
    lastActiveDay: '2026-11-02',
    lettersPracticed: ['A'],
    unitTests: { u1: { score: 80, date: '2026-11-02' } },
  });
  const newPhone = copy({
    savedAt: 200,
    xp: 80,
    xpByDay: { '2026-11-01': 50, '2026-11-03': 30 },
    completed: { 'u1-l1': 2, 'u2-l1': 1 },
    streak: 1,
    lastActiveDay: '2026-11-03',
    lettersPracticed: ['B'],
    unitTests: { u1: { score: 93, date: '2026-11-03' } },
    soundOn: false,
  });

  it('keeps everything learned on either phone', () => {
    const m = mergeProgress(oldPhone, newPhone);
    expect(m.completed).toEqual({ 'u1-l1': 2, 'u1-l2': 1, 'u2-l1': 1 });
    expect(m.xpByDay).toEqual({ '2026-11-01': 50, '2026-11-02': 20, '2026-11-03': 30 });
    expect(m.xp).toBe(100);
    expect(m.lettersPracticed).toEqual(['A', 'B']);
    expect(m.unitTests.u1.score).toBe(93);
  });

  it('takes settings from the copy saved last and the streak from the latest day', () => {
    const m = mergeProgress(oldPhone, newPhone);
    expect(m.soundOn).toBe(false);
    expect(m.lastActiveDay).toBe('2026-11-03');
    expect(m.savedAt).toBe(200);
  });

  it('gives the same result whichever way round', () => {
    expect(sameProgress(mergeProgress(oldPhone, newPhone), mergeProgress(newPhone, oldPhone))).toBe(true);
  });

  it('lets a deliberate reset win over older progress', () => {
    const reset = copy({ savedAt: 300, resetAt: 250, xp: 0 });
    expect(mergeProgress(newPhone, reset)).toBe(reset);
    expect(mergeProgress(reset, newPhone)).toBe(reset);
  });

  it('keeps XP from before it was counted per day', () => {
    const legacy = copy({ xp: 500, xpByDay: { '2026-11-01': 20 } });
    expect(mergeProgress(legacy, copy({ xp: 20, xpByDay: { '2026-11-01': 20, '2026-11-02': 10 } })).xp).toBe(510);
  });
});
