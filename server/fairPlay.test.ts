import { describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { fairTotalXp, fairXpByDay, MAX_XP_PER_DAY } from './fairPlay.ts';
import { loadProgress, saveProgress } from './users.ts';

const NOW = new Date('2026-11-03T08:00:00Z');

describe('fair play', () => {
  it('keeps real days, caps big ones and drops nonsense', () => {
    expect(fairXpByDay({ '2026-11-03': 40, '2026-11-02': 99999, '2030-01-01': 50, 'yesterday': 10, '2026-11-01': -5, '2026-10-30': 'x' }, NOW)).toEqual({
      '2026-11-03': 40,
      '2026-11-02': MAX_XP_PER_DAY,
    });
  });

  it('caps total XP at what the days add up to, but never below what was already saved', () => {
    expect(fairTotalXp(1_000_000, { a: 30, b: 20 }, 0)).toBe(50);
    expect(fairTotalXp(500, { a: 30 }, 400)).toBe(400);
    expect(fairTotalXp(45, { a: 30, b: 20 }, 0)).toBe(45);
  });

  it('ranks by trusted XP but keeps the learner’s own progress as sent', () => {
    const db = openDb(':memory:');
    const sent = { profile: { name: 'X' }, xp: 999999, xpByDay: { '2026-11-03': 999999 }, completed: {} };
    saveProgress(db, 'cheater-0001', sent, NOW);
    expect(db.prepare('SELECT xp FROM users').get()).toEqual({ xp: MAX_XP_PER_DAY });
    expect(loadProgress(db, 'cheater-0001')).toEqual(sent);
  });
});
