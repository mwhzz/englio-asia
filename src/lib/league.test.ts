import { describe, expect, it } from 'vitest';
import { withMyXp, type League } from './league';

const LEAGUE: League = {
  since: '2026-10-31',
  ends: '2026-11-06',
  districts: [],
  learners: [{ name: 'Karim', xp: 40, isMe: false }],
  me: null,
  myDistrictRank: null,
};

describe('league with my own XP', () => {
  it('counts this week’s XP from the phone before the server has it', () => {
    const l = withMyXp(LEAGUE, { '2026-11-05': 70, '2026-10-20': 500 }, 'Rina Akter');
    expect(l.me).toEqual({ rank: 1, xp: 70 });
    expect(l.learners[0]).toEqual({ name: 'Rina', xp: 70, isMe: true });
  });

  it('keeps the server’s numbers when they are already up to date', () => {
    const synced = { ...LEAGUE, me: { rank: 2, xp: 30 } };
    expect(withMyXp(synced, { '2026-11-05': 30 }, 'Rina')).toBe(synced);
  });

  it('gives my district a place once I have XP, instead of "-"', () => {
    const l = withMyXp({ ...LEAGUE, districts: [{ districtId: 'sylhet', xp: 100, learners: 2 }] }, { '2026-11-05': 70 }, 'Rina', 'dhaka');
    expect(l.myDistrictRank).toBe(2);
  });
});
