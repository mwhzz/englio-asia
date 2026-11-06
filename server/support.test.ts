import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from './app.ts';
import { openDb } from './db.ts';
import { backupCode } from './restoreCodes.ts';
import { saveProgress, deviceName } from './users.ts';
import { dueReminders } from './reminders.ts';
import { clearLeaderboardCache, leaderboard } from './leaderboard.ts';
import { activitySummary } from './activity.ts';
import { health } from './health.ts';

let server: Server;
let base = '';
let db: DatabaseSync;
const call = async (method: string, path: string, body?: unknown, token = 'owner-secret', headers: Record<string, string> = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // Loosely typed JSON; the assertions check its shape.
  const json: any = await res.json().catch(() => null);
  return { status: res.status, json };
};
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A045F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';

beforeAll(async () => {
  db = openDb(':memory:');
  saveProgress(db, 'device-rina-01', { profile: { name: 'Rina Akter', districtId: 'dhaka' }, xp: 30, streak: 3, lastActiveDay: '2026-11-05', xpByDay: { '2026-11-05': 30 }, completed: {} });
  saveProgress(db, 'device-karim-1', { profile: { name: 'Karim', districtId: 'dhaka' }, xp: 10, xpByDay: { '2026-11-04': 10 }, completed: {} });
  server = createApi(db, 'owner-secret');
  await new Promise<void>((done) => server.listen(0, done));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((done) => server.close(() => done())));

describe('reports with the learner, version and phone', () => {
  it('keeps who sent it, lets the admin reply, and the learner sees the reply', async () => {
    await call('POST', '/api/reports', { where: 'help', kind: 'account', question: 'আমার স্ট্রিক হারিয়ে গেছে', userId: 'device-rina-01' }, '', { 'x-app-version': '1.7.0', 'user-agent': ANDROID });
    const { json } = await call('GET', '/api/admin/tickets?status=open');
    const t = json.tickets[0];
    expect(t).toMatchObject({ kind: 'account', status: 'new', userId: 'device-rina-01', userName: 'Rina Akter', version: '1.7.0', device: 'Android 13 · SM-A045F' });
    expect((await call('PUT', `/api/admin/tickets/${t.id}`, { status: 'fixed', reply: 'স্ট্রিক ফিরিয়ে দিয়েছি' })).status).toBe(200);
    const mine = (await call('GET', '/api/users/device-rina-01/reports', undefined, '')).json;
    expect(mine[0]).toMatchObject({ status: 'fixed', reply: 'স্ট্রিক ফিরিয়ে দিয়েছি' });
  });

  it('groups content reports and closing them tells each learner', async () => {
    for (const id of ['device-rina-01', 'device-karim-1']) await call('POST', '/api/reports', { where: 'lesson:u1-l1', question: 'Which one is ছেলে', reason: 'mistake', userId: id }, '');
    const groups = (await call('GET', '/api/admin/reports')).json;
    expect(groups[0]).toMatchObject({ question: 'Which one is ছেলে', n: 2 });
    await call('POST', '/api/admin/reports/close', { where: 'lesson:u1-l1', question: 'Which one is ছেলে' });
    expect((await call('GET', '/api/admin/reports')).json).toEqual([]);
    expect((await call('GET', '/api/users/device-karim-1/reports', undefined, '')).json[0]).toMatchObject({ status: 'fixed' });
  });

  it('refuses an unknown status', async () => {
    expect((await call('PUT', '/api/admin/tickets/1', { status: 'maybe' })).status).toBe(400);
  });
});

describe('managing a learner', () => {
  it('finds a learner by backup code, device id, phone or the start of a name', async () => {
    const code = backupCode(db, 'device-karim-1');
    db.prepare("INSERT INTO accounts (kind, subject, user_id) VALUES ('phone', '+8801712345678', 'device-rina-01')").run();
    const find = async (q: string) => (await call('GET', `/api/admin/users?q=${encodeURIComponent(q)}`)).json.users.map((u: { id: string }) => u.id);
    expect(await find(code.toLowerCase())).toEqual(['device-karim-1']);
    expect(await find('device-rina-01')).toEqual(['device-rina-01']);
    expect(await find('12345678')).toEqual(['device-rina-01']);
    expect(await find('Akt')).toEqual(['device-rina-01']);
  });

  it('pages through learners', async () => {
    const { json } = await call('GET', '/api/admin/users?page=0');
    expect(json).toMatchObject({ total: 2, page: 0, pageSize: 50 });
  });

  it('gives Plus, fills hearts, gives back a streak, and the phone takes it on its next sync', async () => {
    const act = (body: unknown) => call('POST', '/api/admin/users/device-rina-01/action', body);
    expect((await act({ action: 'plus', days: 30 })).json.plusUntil).toBeTruthy();
    await act({ action: 'hearts' });
    await act({ action: 'streak', days: 12 });
    const user = (await call('GET', '/api/admin/users/device-rina-01')).json;
    expect(user.plusUntil).toBeTruthy();
    expect(user.progress).toMatchObject({ hearts: 5, streak: 12 });
    // The phone still has its old copy (saved earlier): the admin's newer one wins the merge.
    const merged = saveProgress(db, 'device-rina-01', { ...user.progress, hearts: 0, streak: 3, lastActiveDay: '2026-11-05', savedAt: 1 }) as { hearts: number; streak: number };
    expect(merged.hearts).toBe(5);
    expect(merged.streak).toBe(12);
  });

  it('blocks a cheater out of the league', async () => {
    await call('POST', '/api/admin/users/device-karim-1/action', { action: 'block' });
    clearLeaderboardCache();
    const board = leaderboard(db, 'dhaka', null, new Date('2026-11-05T08:00:00Z'));
    expect(board.learners.map((l) => l.name)).not.toContain('Karim');
    await call('POST', '/api/admin/users/device-karim-1/action', { action: 'unblock' });
  });

  it('merges a second phone into the learner', async () => {
    saveProgress(db, 'device-rina-02', { profile: { name: 'Rina' }, xpByDay: { '2026-11-06': 20 }, completed: { 'u2-l1': 1 } });
    const r = await call('POST', '/api/admin/users/device-rina-01/action', { action: 'merge', from: 'device-rina-02' });
    expect(r.json).toMatchObject({ ok: true, merged: 'device-rina-02' });
    expect((await call('GET', '/api/admin/users/device-rina-01')).json.progress.completed).toHaveProperty('u2-l1');
  });

  it('deleting a learner removes their payments too', async () => {
    db.prepare("INSERT INTO payments VALUES ('pay1', 'device-rina-02', 99, 'paid', 'T1', '2026-11-01')").run();
    await call('DELETE', '/api/admin/users/device-rina-02');
    expect(db.prepare("SELECT COUNT(*) AS n FROM payments WHERE user_id = 'device-rina-02'").get()).toEqual({ n: 0 });
  });
});

describe('team roles', () => {
  it('support sees learners and reports but not content or settings', async () => {
    const { json } = await call('POST', '/api/admin/team', { name: 'Mitu', role: 'support' });
    expect(json.role).toBe('support');
    expect((await call('GET', '/api/admin/users', undefined, json.token)).status).toBe(200);
    expect((await call('GET', '/api/admin/tickets', undefined, json.token)).status).toBe(200);
    expect((await call('GET', '/api/admin/units', undefined, json.token)).status).toBe(403);
    expect((await call('GET', '/api/admin/settings', undefined, json.token)).status).toBe(403);
  });

  it('the activity log keeps what was sent, without secrets', async () => {
    const log = (await call('GET', '/api/admin/activity?q=team')).json;
    expect(log[0].detail).toContain('Mitu');
    expect(log[0].detail).not.toContain('token');
  });
});

describe('cheap reminders and league', () => {
  it('keeps the last XP day and the week’s XP in columns', () => {
    expect(activitySummary({ '2026-11-03': 20, '2026-11-05': 30, '2026-10-20': 100 })).toEqual({ lastDay: '2026-11-05', weekSince: '2026-10-31', weekXp: 50 });
    expect(activitySummary({})).toEqual({ lastDay: null, weekSince: null, weekXp: 0 });
  });

  it('reminds only those who have not practised today', () => {
    db.prepare("INSERT INTO push_subs VALUES ('device-karim-1', '{\"endpoint\":\"https://x\"}', 20, 'Asia/Dhaka')").run();
    // 14:00 UTC is 20:00 in Dhaka.
    expect(dueReminders(db, new Date('2026-11-05T14:00:00Z')).map((r) => r.userId)).toEqual(['device-karim-1']);
    expect(dueReminders(db, new Date('2026-11-04T14:00:00Z'))).toEqual([]);
  });

  it('fills the new columns for learners saved before them', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'englio-')), 'old.db');
    const old = new DatabaseSync(file);
    old.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, district_id TEXT, class_id TEXT, xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0, lessons_done INTEGER NOT NULL DEFAULT 0, joined_at TEXT, last_seen TEXT NOT NULL, progress TEXT NOT NULL)`);
    old.prepare("INSERT INTO users (id, last_seen, progress) VALUES ('device-old-01', '2026-11-01', ?)").run(JSON.stringify({ xpByDay: { '2026-11-02': 40 } }));
    old.close();
    const migrated = openDb(file);
    expect(migrated.prepare('SELECT last_xp_day, week_since, week_xp FROM users').get()).toEqual({ last_xp_day: '2026-11-02', week_since: '2026-10-31', week_xp: 40 });
    migrated.close();
  });
});

describe('health and devices', () => {
  it('health says the database answers and how old the backup is', () => {
    expect(health(db, '/no/such/file')).toMatchObject({ ok: true, db: 'ok', backupAgeHours: null });
  });

  it('names the phone from its browser', () => {
    expect(deviceName(ANDROID)).toBe('Android 13 · SM-A045F');
    expect(deviceName('Mozilla/5.0 (Linux; Android 10; K) Chrome/120')).toBe('Android 10');
    expect(deviceName('')).toBeNull();
  });
});

describe('owner numbers', () => {
  it('counts sign-ups, active learners, retention and onboarding', async () => {
    const { json } = await call('GET', '/api/admin/stats?days=30');
    expect(json.daily).toHaveLength(30);
    expect(json.retention.map((r: { after: number }) => r.after)).toEqual([1, 7, 30]);
    expect(json.onboarding[0]).toEqual({ step: 'welcome', n: 0 });
    expect(json.reminders).toHaveProperty('subscribed');
    expect(json.plus).toMatchObject({ active: expect.any(Number) });
  });

  it('keeps the app version of a crash', async () => {
    await call('POST', '/api/errors', { message: 'Boom', stack: 'Error\n at x', where: '#home · v1.6.1 · production' }, '');
    const errors = (await call('GET', '/api/admin/errors')).json;
    expect(errors[0]).toMatchObject({ message: 'Boom', version: '1.6.1' });
  });
});

describe('content history and drafts', () => {
  it('a deleted lesson comes back with its items, and a draft is hidden from learners', async () => {
    const { seedCourse } = await import('./seed.ts');
    seedCourse(db);
    const before = (await call('GET', '/api/course', undefined, '')).json.units[0].lessons;
    const lesson = before[0];
    expect((await call('DELETE', `/api/admin/lessons/${lesson.id}`)).status).toBe(200);
    expect((await call('GET', '/api/course', undefined, '')).json.units[0].lessons[0].id).not.toBe(lesson.id);
    const trash = (await call('GET', '/api/admin/history?action=delete')).json;
    expect(trash[0]).toMatchObject({ kind: 'lesson', entity: lesson.id, action: 'delete' });
    expect((await call('POST', `/api/admin/history/${trash[0].id}/restore`)).status).toBe(200);
    const back = (await call('GET', '/api/course', undefined, '')).json.units[0].lessons[0];
    expect(back.id).toBe(lesson.id);
    expect(back.vocab.length).toBe(lesson.vocab.length);

    await call('POST', '/api/admin/draft', { kind: 'lesson', id: lesson.id, draft: true });
    expect((await call('GET', '/api/course', undefined, '')).json.units[0].lessons.map((l: { id: string }) => l.id)).not.toContain(lesson.id);
    expect((await call('GET', '/api/admin/drafts')).json.lessons).toContain(lesson.id);
    await call('POST', '/api/admin/draft', { kind: 'lesson', id: lesson.id, draft: false });
    expect((await call('GET', '/api/course', undefined, '')).json.units[0].lessons[0].id).toBe(lesson.id);
  });

  it('an edit can be undone', async () => {
    const unit = (await call('GET', '/api/admin/units')).json[0];
    await call('PUT', `/api/admin/units/${unit.id}`, { ...unit, title: 'Changed title' });
    const change = (await call('GET', '/api/admin/history?action=change')).json[0];
    await call('POST', `/api/admin/history/${change.id}/restore`);
    expect((await call('GET', '/api/admin/units')).json[0].title).toBe(unit.title);
  });

  it('limits new learners per address, so nobody floods the league with fakes', async () => {
    const { createApi: make } = await import('./app.ts');
    const s = make(openDb(':memory:'), 'x', { all: [1000, 60_000], strict: [10, 60_000], badToken: [10, 60_000], newUsers: [2, 60_000] });
    await new Promise<void>((done) => s.listen(0, done));
    const url = `http://localhost:${(s.address() as AddressInfo).port}/api/users/`;
    const put = (id: string) => fetch(url + id, { method: 'PUT', body: JSON.stringify({ progress: { profile: { name: 'X' }, completed: {} } }) }).then((r) => r.status);
    expect([await put('fake-000001'), await put('fake-000002'), await put('fake-000003'), await put('fake-000001')]).toEqual([200, 200, 429, 200]);
    await new Promise<void>((done) => s.close(() => done()));
  });
});
