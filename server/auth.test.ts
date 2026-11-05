import { afterEach, describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { accountsOf, maskPhone, normalPhone, signInGoogle, startPhone, verifyPhone } from './auth.ts';
import { saveProgress } from './users.ts';
import type { Request } from './http.ts';

const req = (body: unknown, params: Record<string, string> = {}) => ({ body, params }) as unknown as Request;

function setup() {
  const db = openDb(':memory:');
  saveProgress(db, 'phone-a-0001', { profile: { name: 'Rina' }, xp: 30, xpByDay: { '2026-11-03': 30 }, completed: { 'u1-l1': 1 } });
  return db;
}

/** Starts phone sign-in, catching the SMS instead of sending it. */
async function codeFor(db: ReturnType<typeof setup>, phone: string) {
  let text = '';
  await startPhone(db, req({ phone }), async (_to, t) => void (text = t));
  return text.match(/\d{6}/)![0];
}

afterEach(() => {
  delete process.env.GOOGLE_CLIENT_ID;
});

describe('phone sign-in', () => {
  it('understands every way of writing a Bangladeshi number', () => {
    for (const n of ['01712345678', '017-1234 5678', '+8801712345678', '8801712345678']) expect(normalPhone(n)).toBe('+8801712345678');
    expect(normalPhone('01212345678')).toBeNull();
    expect(normalPhone('12345')).toBeNull();
    expect(maskPhone('+8801712345678')).toBe('+880 17•• •••678');
  });

  it('links a number to this phone, then brings that progress back on a new phone', async () => {
    const db = setup();
    const first = verifyPhone(db, req({ phone: '01712345678', code: await codeFor(db, '01712345678'), deviceId: 'phone-a-0001' }));
    expect(first).toMatchObject({ id: 'phone-a-0001', isNew: true });
    expect(accountsOf(db, req(null, { id: 'phone-a-0001' }))).toEqual([{ kind: 'phone', label: '+880 17•• •••678' }]);

    const back = verifyPhone(db, req({ phone: '+8801712345678', code: await codeFor(db, '01712345678'), deviceId: 'phone-b-0002' }));
    expect(back).toMatchObject({ id: 'phone-a-0001', isNew: false, progress: { profile: { name: 'Rina' } } });
  });

  it('refuses a wrong code, and stops after five tries', async () => {
    const db = setup();
    const code = await codeFor(db, '01712345678');
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) expect(() => verifyPhone(db, req({ phone: '01712345678', code: wrong, deviceId: 'phone-a-0001' }))).toThrow(/not right/);
    expect(() => verifyPhone(db, req({ phone: '01712345678', code, deviceId: 'phone-a-0001' }))).toThrow(/expired/);
  });

  it('says so when a new number has no progress to link yet', async () => {
    const db = setup();
    expect(() => verifyPhone(db, req({ phone: '01812345678', code: '', deviceId: 'nobody-0000' }))).toThrow();
  });
});

describe('Google sign-in', () => {
  const google = (info: object) => async () => ({ ok: true, json: async () => info });

  it('accepts a token made for this app and links the account', async () => {
    process.env.GOOGLE_CLIENT_ID = 'app-id';
    const db = setup();
    const r = await signInGoogle(db, req({ idToken: 'tok', deviceId: 'phone-a-0001' }), google({ aud: 'app-id', sub: 'g-1', email: 'rina@example.com', email_verified: 'true' }));
    expect(r).toMatchObject({ id: 'phone-a-0001', isNew: true });
    expect(accountsOf(db, req(null, { id: 'phone-a-0001' }))).toEqual([{ kind: 'google', label: 'rina@example.com' }]);
  });

  it('refuses a token made for another app, or when Google sign-in is not set up', async () => {
    const db = setup();
    await expect(signInGoogle(db, req({ idToken: 'tok', deviceId: 'phone-a-0001' }), google({}))).rejects.toThrow(/not set up/);
    process.env.GOOGLE_CLIENT_ID = 'app-id';
    await expect(signInGoogle(db, req({ idToken: 'tok', deviceId: 'phone-a-0001' }), google({ aud: 'other', sub: 'g-1', email_verified: true }))).rejects.toThrow(/confirm/);
  });
});
