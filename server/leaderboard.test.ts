import { beforeEach, describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { clearLeaderboardCache, leaderboard } from './leaderboard.ts';
import { saveProgress } from './users.ts';

const NOW = new Date('2026-11-03T08:00:00Z');

function db() {
  const d = openDb(':memory:');
  const add = (id: string, name: string, districtId: string, xpByDay: Record<string, number>) =>
    saveProgress(d, id, { profile: { name, districtId }, xpByDay, completed: {} });
  add('device-0001', 'Rina Akter', 'dhaka', { '2026-11-03': 30, '2026-11-01': 20 });
  add('device-0002', 'Karim Uddin', 'dhaka', { '2026-11-02': 60 });
  add('device-0003', 'Mina', 'sylhet', { '2026-11-03': 40, '2026-10-20': 500 });
  add('device-0004', 'Old', 'sylhet', { '2026-10-01': 100 });
  return d;
}

beforeEach(clearLeaderboardCache);

describe('leaderboard', () => {
  it('ranks districts by this week’s XP only', () => {
    const board = leaderboard(db(), null, null, NOW);
    expect(board.since).toBe('2026-10-28');
    expect(board.districts).toEqual([
      { districtId: 'dhaka', xp: 110, learners: 2 },
      { districtId: 'sylhet', xp: 40, learners: 1 },
    ]);
  });

  it('lists a district’s learners by first name and finds me', () => {
    const board = leaderboard(db(), 'dhaka', 'device-0001', NOW);
    expect(board.learners).toEqual([
      { name: 'Karim', xp: 60, isMe: false },
      { name: 'Rina', xp: 50, isMe: true },
    ]);
    expect(board.me).toEqual({ rank: 2, xp: 50 });
    expect(board.myDistrictRank).toBe(1);
  });

  it('never sends device ids', () => {
    expect(JSON.stringify(leaderboard(db(), 'dhaka', 'device-0001', NOW))).not.toContain('device-');
  });
});
