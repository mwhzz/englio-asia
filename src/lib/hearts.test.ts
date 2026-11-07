import { describe, expect, it } from 'vitest';
import { HEART_REGEN_MS, gainHeart, loseHeart, nextHeartAt, regenHearts } from './hearts';
import { DEFAULT_PROGRESS, MAX_HEARTS } from './progress';

const t0 = 1_000_000_000;

describe('hearts', () => {
  it('starts the refill clock when the first heart is lost', () => {
    const p = loseHeart(DEFAULT_PROGRESS, t0);
    expect(p.hearts).toBe(MAX_HEARTS - 1);
    expect(nextHeartAt(p)).toBe(t0 + HEART_REGEN_MS);
  });

  it('refills one heart per period, never above the max', () => {
    let p = loseHeart(loseHeart(DEFAULT_PROGRESS, t0), t0);
    expect(regenHearts(p, t0 + HEART_REGEN_MS - 1)).toBe(p);
    p = regenHearts(p, t0 + HEART_REGEN_MS + 5);
    expect(p.hearts).toBe(MAX_HEARTS - 1);
    expect(regenHearts(p, t0 + 10 * HEART_REGEN_MS).hearts).toBe(MAX_HEARTS);
  });

  it('cannot go below zero', () => {
    let p = DEFAULT_PROGRESS;
    for (let i = 0; i < MAX_HEARTS + 3; i++) p = loseHeart(p, t0);
    expect(p.hearts).toBe(0);
  });

  it('practice adds a heart up to the max', () => {
    expect(gainHeart(loseHeart(DEFAULT_PROGRESS, t0)).hearts).toBe(MAX_HEARTS);
    expect(gainHeart(DEFAULT_PROGRESS)).toBe(DEFAULT_PROGRESS);
  });
});

describe('the first lessons', () => {
  it('don’t cost hearts', async () => {
    const { beginner } = await import('./hearts');
    expect(beginner({ completed: {} })).toBe(true);
    expect(beginner({ completed: { a: 1, b: 1, c: 1 } })).toBe(false);
  });
});
