import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import type { Request } from './http.ts';
import { callback, checkout, premiumInfo, premiumOf, type Post } from './premium.ts';
import { saveSettings } from './settings.ts';
import { saveProgress } from './users.ts';
import { DEFAULT_SETTINGS } from '../src/data/appSettings.ts';

const NOW = new Date('2026-11-03T08:00:00Z');
const KEYS = ['BKASH_BASE_URL', 'BKASH_APP_KEY', 'BKASH_APP_SECRET', 'BKASH_USERNAME', 'BKASH_PASSWORD', 'PUBLIC_API_URL', 'APP_URL'];

/** A pretend bKash: grants a token, creates a payment, and completes it unless told otherwise. */
function fakeBkash(complete = true) {
  const calls: string[] = [];
  const post: Post = async (url) => {
    const step = url.split('/').pop()!;
    calls.push(step);
    if (step === 'grant') return { id_token: 'tok' };
    if (step === 'create') return { paymentID: 'PAY1', bkashURL: 'https://sandbox.bka.sh/pay/PAY1', statusCode: '0000' };
    return complete ? { transactionStatus: 'Completed', trxID: 'TRX9' } : { transactionStatus: 'Failed' };
  };
  return { post, calls };
}
const query = (q: string) => ({ query: new URLSearchParams(q) }) as unknown as Request;

beforeEach(() => {
  Object.assign(process.env, {
    BKASH_BASE_URL: 'https://sandbox.bka.sh/v1.2.0-beta',
    BKASH_APP_KEY: 'k',
    BKASH_APP_SECRET: 's',
    BKASH_USERNAME: 'u',
    BKASH_PASSWORD: 'p',
    PUBLIC_API_URL: 'https://api.example.com/api',
    APP_URL: 'https://app.example.com',
  });
});
afterEach(() => KEYS.forEach((k) => delete process.env[k]));

function setup() {
  const db = openDb(':memory:');
  saveProgress(db, 'learner-0001', { profile: { name: 'Rina' }, completed: {} });
  return db;
}

describe('Englio Plus with bKash', () => {
  it('is off until bKash is configured', () => {
    const db = setup();
    expect(premiumInfo(db)).toMatchObject({ available: true, price: 99, days: 30 });
    delete process.env.BKASH_APP_KEY;
    expect(premiumInfo(db).available).toBe(false);
  });

  it('takes the plan from the admin settings, and stops sales when Plus is switched off', async () => {
    const db = setup();
    saveSettings(db, { body: { ...DEFAULT_SETTINGS, plus: { price: 149, days: 60 } } } as unknown as Request);
    expect(premiumInfo(db)).toMatchObject({ available: true, price: 149, days: 60 });
    const bkash = fakeBkash();
    const seen: string[] = [];
    const post: Post = async (url, init) => (seen.push(init.body), bkash.post(url, init));
    await checkout(db, { params: { id: 'learner-0001' } } as unknown as Request, post, NOW);
    expect(seen.some((b) => b.includes('"amount":"149.00"'))).toBe(true);
    await callback(db, query('paymentID=PAY1&status=success'), bkash.post, NOW);
    expect(premiumOf(db, 'learner-0001', NOW).until).toBe(new Date(NOW.getTime() + 60 * 86_400_000).toISOString());

    saveSettings(db, { body: { ...DEFAULT_SETTINGS, features: { ...DEFAULT_SETTINGS.features, plus: false } } } as unknown as Request);
    expect(premiumInfo(db).available).toBe(false);
    await expect(checkout(db, { params: { id: 'learner-0001' } } as unknown as Request, fakeBkash().post, NOW)).rejects.toThrow('not set up');
  });

  it('pays, confirms with bKash, then gives 30 days', async () => {
    const db = setup();
    const bkash = fakeBkash();
    expect(await checkout(db, { params: { id: 'learner-0001' } } as unknown as Request, bkash.post, NOW)).toEqual({ url: 'https://sandbox.bka.sh/pay/PAY1' });
    const back = await callback(db, query('paymentID=PAY1&status=success'), bkash.post, NOW);
    expect(back.location).toBe('https://app.example.com/#premium=ok');
    expect(bkash.calls).toEqual(['grant', 'create', 'grant', 'execute']);
    expect(premiumOf(db, 'learner-0001', NOW).until).toBe('2026-12-03T08:00:00.000Z');
    // bKash calling back twice doesn't give the days twice.
    await callback(db, query('paymentID=PAY1&status=success'), bkash.post, NOW);
    expect(premiumOf(db, 'learner-0001', NOW).until).toBe('2026-12-03T08:00:00.000Z');
  });

  it('gives nothing for a cancelled or failed payment', async () => {
    const db = setup();
    await checkout(db, { params: { id: 'learner-0001' } } as unknown as Request, fakeBkash().post, NOW);
    expect((await callback(db, query('paymentID=PAY1&status=cancel'), fakeBkash().post, NOW)).location).toContain('premium=cancelled');
    expect(premiumOf(db, 'learner-0001', NOW).until).toBeNull();

    const db2 = setup();
    await checkout(db2, { params: { id: 'learner-0001' } } as unknown as Request, fakeBkash(false).post, NOW);
    expect((await callback(db2, query('paymentID=PAY1&status=success'), fakeBkash(false).post, NOW)).location).toContain('premium=failed');
    expect(premiumOf(db2, 'learner-0001', NOW).until).toBeNull();
  });

  it('ignores a payment it never started', async () => {
    expect((await callback(setup(), query('paymentID=FAKE&status=success'), fakeBkash().post, NOW)).location).toContain('premium=failed');
  });
});
