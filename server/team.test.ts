import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApi } from './app.ts';
import { openDb } from './db.ts';
import { seedCourse } from './seed.ts';

let server: Server;
let base = '';
const as = (token: string) => async (method: string, path: string, body?: unknown) => {
  const res = await fetch(base + path, { method, headers: { authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
  // Responses are loosely typed JSON; the assertions below check their shape.
  const json: any = await res.json().catch(() => null);
  return { status: res.status, json };
};
const owner = as('owner-secret');

beforeAll(async () => {
  const db = openDb(':memory:');
  seedCourse(db);
  server = createApi(db, 'owner-secret');
  await new Promise<void>((done) => server.listen(0, done));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((done) => server.close(() => done())));

describe('admin team', () => {
  it('lets the owner add an editor, who can edit content but not see learners or the team', async () => {
    const added = await owner('POST', '/api/admin/team', { name: 'Shila', role: 'editor' });
    expect(added.json).toMatchObject({ name: 'Shila', role: 'editor' });
    const editor = as(added.json.token);

    expect((await editor('GET', '/api/admin/me')).json).toMatchObject({ name: 'Shila', role: 'editor' });
    expect((await editor('POST', '/api/admin/units', { title: 'Sports', titleBn: 'খেলা', color: '#ff9500' })).status).toBe(200);
    expect((await editor('GET', '/api/admin/users')).status).toBe(403);
    expect((await editor('GET', '/api/admin/team')).status).toBe(403);
    expect((await editor('POST', '/api/admin/team', { name: 'Me too', role: 'owner' })).status).toBe(403);
  });

  it('keeps only a hash of the token, and a removed member is locked out', async () => {
    const added = await owner('POST', '/api/admin/team', { name: 'Temp' });
    const list = (await owner('GET', '/api/admin/team')).json as { id: number; name: string }[];
    expect(JSON.stringify(list)).not.toContain(added.json.token);
    await owner('DELETE', `/api/admin/team/${added.json.id}`);
    expect((await as(added.json.token)('GET', '/api/admin/me')).status).toBe(401);
  });

  it('writes down every change: who, what and whether it worked', async () => {
    const log = (await owner('GET', '/api/admin/activity')).json as { admin: string; method: string; path: string; status: number }[];
    expect(log).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ admin: 'Shila', method: 'POST', path: '/api/admin/units', status: 200 }),
        expect.objectContaining({ admin: 'Owner', method: 'POST', path: '/api/admin/team', status: 200 }),
      ]),
    );
    expect(log.some((e) => e.method === 'GET')).toBe(false);
  });
});

describe('app errors', () => {
  it('groups the same crash from many phones and lets the admin clear it', async () => {
    const crash = { message: 'x is undefined', stack: 'TypeError: x is undefined\n    at Lesson (app.js:1:2)', where: 'lesson' };
    for (let i = 0; i < 3; i++) await fetch(`${base}/api/errors`, { method: 'POST', body: JSON.stringify(crash) });
    const list = (await owner('GET', '/api/admin/errors')).json as { id: string; n: number; message: string }[];
    expect(list).toEqual([expect.objectContaining({ message: 'x is undefined', n: 3 })]);
    await owner('DELETE', `/api/admin/errors/${list[0].id}`);
    expect((await owner('GET', '/api/admin/errors')).json).toEqual([]);
  });
});

describe('admin sign-in', () => {
  it('trades a token for a 30-day session, and with two-step on, needs a code and refuses raw tokens', async () => {
    const { totp } = await import('./adminAuth.ts');
    const post = (path: string, body: unknown, token?: string) =>
      fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, json: (await r.json().catch(() => null)) as any }));
    expect((await post('/api/admin/login', { token: 'wrong' })).status).toBe(401);
    const { json: s1 } = await post('/api/admin/login', { token: 'owner-secret' });
    expect(s1.session).toMatch(/^ses_/);
    expect((await as(s1.session)('GET', '/api/admin/me')).json).toMatchObject({ role: 'owner', twoStep: false });

    const { json: start } = await post('/api/admin/two-step/start', {}, s1.session);
    expect((await post('/api/admin/two-step/confirm', { code: '000000' }, s1.session)).status).toBe(400);
    expect((await post('/api/admin/two-step/confirm', { code: totp(start.secret) }, s1.session)).json).toEqual({ on: true });

    expect((await owner('GET', '/api/admin/me')).status).toBe(401);
    expect((await post('/api/admin/login', { token: 'owner-secret' })).status).toBe(428);
    const { json: s2 } = await post('/api/admin/login', { token: 'owner-secret', code: totp(start.secret) });
    expect((await as(s2.session)('GET', '/api/admin/me')).status).toBe(200);

    await post('/api/admin/two-step/off', { code: totp(start.secret) }, s2.session);
    expect((await owner('GET', '/api/admin/me')).status).toBe(200);
  });

  it('gives a team member a new token; the old one stops working', async () => {
    const added = (await owner('POST', '/api/admin/team', { name: 'Rotate Me', role: 'editor' })).json;
    const fresh = (await owner('POST', `/api/admin/team/${added.id}/rotate`)).json;
    expect((await as(added.token)('GET', '/api/admin/me')).status).toBe(401);
    expect((await as(fresh.token)('GET', '/api/admin/me')).status).toBe(200);
  });
});
