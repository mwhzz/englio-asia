import { describe, expect, it } from 'vitest';
import { BUNDLED_COURSE } from '../data/course';
import { DEFAULT_PROGRESS } from './progress';
import { applyTest, buildUnitTest, PASS_SCORE, TEST_SIZE, testScore } from './unitTest';

describe('unit tests', () => {
  it.each(BUNDLED_COURSE.map((u) => [u.id]))('%s makes 15 different questions without matching', (id) => {
    const t = buildUnitTest(id);
    expect(t).toHaveLength(TEST_SIZE);
    expect(new Set(t.map((e) => e.id)).size).toBe(TEST_SIZE);
    expect(t.some((e) => e.kind === 'match')).toBe(false);
  });

  it('scores the first try and passes at 80%', () => {
    expect(testScore(15, 0)).toBe(100);
    expect(testScore(15, 3)).toBe(80);
    expect(testScore(15, 20)).toBe(0);
    expect(PASS_SCORE).toBe(80);
  });

  it('gives a certificate only on a pass, and keeps the best score', () => {
    const fail = applyTest(DEFAULT_PROGRESS, 'u1', 60, '2026-11-03', 100);
    expect(fail.unitTests.u1).toBeUndefined();
    expect(fail.xp).toBe(5);
    const pass = applyTest(fail, 'u1', 87, '2026-11-04', 100);
    expect(pass.unitTests.u1).toEqual({ score: 87, date: '2026-11-04' });
    expect(applyTest(pass, 'u1', 80, '2026-11-05', 100).unitTests.u1.score).toBe(87);
  });
});
