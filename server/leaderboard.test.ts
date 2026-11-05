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
    expect(board.since).toBe('2026-10-31');
    expect(board.ends).toBe('2026-11-06');
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

  it('caps a hand-edited day and ignores future days', () => {
    const d = db();
    saveProgress(d, 'device-0009', { profile: { name: 'Cheat', districtId: 'sylhet' }, xpByDay: { '2026-11-03': 99999, '2026-12-25': 5000 }, completed: {} });
    const sylhet = leaderboard(d, 'sylhet', null, NOW).learners.find((l) => l.name === 'Cheat');
    expect(sylhet?.xp).toBe(600);
  });

  it('never sends device ids', () => {
    expect(JSON.stringify(leaderboard(db(), 'dhaka', 'device-0001', NOW))).not.toContain('device-');
  });
});

describe('league after a learner is deleted', () => {
  it('drops them straight away, not after the cache expires', async () => {
    const { createApi } = await import('./app.ts');
    const d = db();
    const server = createApi(d, 'owner');
    await new Promise<void>((done) => server.listen(0, done));
    const base = `http://localhost:${(server.address() as import('node:net').AddressInfo).port}`;
    const names = async () => ((await (await fetch(`${base}/api/leaderboard?district=dhaka`)).json()) as { learners: { name: string }[] }).learners.map((l) => l.name);
    expect(await names()).toContain('Karim');
    await fetch(`${base}/api/users/device-0002`, { method: 'DELETE' });
    expect(await names()).not.toContain('Karim');
    await new Promise<void>((done) => server.close(() => done()));
  });
});

describe('friends league', () => {
  it('adds friends by code, both ways, and ranks this week’s XP without showing ids', async () => {
    const { addFriend, friendCode, friendsLeague } = await import('./friends.ts');
    const d = db();
    const rinaCode = friendCode(d, 'device-0001');
    expect(rinaCode).toMatch(/^[A-Z2-9]{6}$/);
    addFriend(d, { params: { id: 'device-0003' }, body: { code: rinaCode.toLowerCase() } } as never);
    expect(() => addFriend(d, { params: { id: 'device-0001' }, body: { code: rinaCode } } as never)).toThrow(/own/);

    const rina = friendsLeague(d, { params: { id: 'device-0001' } } as never, NOW);
    expect(rina.people.map((p) => [p.name, p.xp, p.isMe])).toEqual([
      ['Rina', 50, true],
      ['Mina', 40, false],
    ]);
    expect(JSON.stringify(rina)).not.toContain('device-');
    expect(friendsLeague(d, { params: { id: 'device-0003' } } as never, NOW).people).toHaveLength(2);
  });

  it('starts a new week every Saturday', async () => {
    const { leagueWeek } = await import('./leaderboard.ts');
    // Dhaka is UTC+6: 18:00 UTC on Friday is midnight, the start of Saturday.
    expect(leagueWeek(new Date('2026-11-06T18:00:00Z'))).toEqual({ since: '2026-11-07', ends: '2026-11-13' });
    expect(leagueWeek(new Date('2026-11-06T12:00:00Z'))).toEqual({ since: '2026-10-31', ends: '2026-11-06' });
  });
});
