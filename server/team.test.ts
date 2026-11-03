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

    expect((await editor('GET', '/api/admin/me')).json).toEqual({ name: 'Shila', role: 'editor' });
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
