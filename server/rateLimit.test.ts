import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createApi } from './app.ts';
import { openDb } from './db.ts';
import { RateLimit } from './rateLimit.ts';

describe('rate limits', () => {
  it('allows `max` hits per window, then resets', () => {
    const limit = new RateLimit(2, 1000);
    expect([limit.take('a', 0), limit.take('a', 10), limit.take('a', 20), limit.take('b', 20)]).toEqual([true, true, false, true]);
    expect(limit.take('a', 1001)).toBe(true);
  });

  it('answers 429 when an address tries too many backup codes or admin tokens', async () => {
    const server = createApi(openDb(':memory:'), 'secret', { all: [100, 60_000], strict: [3, 60_000], badToken: [2, 60_000], newUsers: [100, 60_000] });
    await new Promise<void>((done) => server.listen(0, done));
    const base = `http://localhost:${(server.address() as AddressInfo).port}`;
    const restore = () => fetch(`${base}/api/restore`, { method: 'POST', body: JSON.stringify({ code: 'AAAAAAAAAA' }) }).then((r) => r.status);
    expect([await restore(), await restore(), await restore(), await restore()]).toEqual([404, 404, 404, 429]);
    const admin = () => fetch(`${base}/api/admin/summary`, { headers: { authorization: 'Bearer wrong' } }).then((r) => r.status);
    expect([await admin(), await admin(), await admin()]).toEqual([401, 401, 429]);
    await new Promise<void>((done) => server.close(() => done()));
  });
});
