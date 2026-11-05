import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';

/**
 * Real accounts: a learner links their phone number (a code by SMS) or Google account to their
 * progress, and gets it back on any phone by signing in again. Until then the device id is the key.
 */
const CODE_MINUTES = 10;
const MAX_TRIES = 5;

const hash = (s: string) => createHash('sha256').update(s).digest('hex');

/** "017-1234 5678", "+8801712345678", "8801712345678" → "+8801712345678"; null when it isn't a Bangladeshi mobile number. */
export function normalPhone(input: unknown): string | null {
  const digits = typeof input === 'string' ? input.replace(/[^\d]/g, '') : '';
  const local = digits.startsWith('880') ? digits.slice(2) : digits;
  return /^01[3-9]\d{8}$/.test(local) ? `+88${local}` : null;
}

/** "+8801712345678" → "+880 17•• •••678", for showing which number is linked. */
export const maskPhone = (phone: string) => `${phone.slice(0, 4)} ${phone.slice(4, 6)}•• •••${phone.slice(-3)}`;

/**
 * Sends a text message. Set SMS_API_URL to your SMS provider's send URL with {to} and {text} in it
 * (most Bangladeshi gateways, e.g. https://…/send?api_key=KEY&to={to}&msg={text}). Without it the
 * code is only printed in the server log, for development.
 */
export async function sendSms(to: string, text: string): Promise<void> {
  const url = process.env.SMS_API_URL;
  if (!url) {
    console.log(`[sms to ${to}] ${text}`);
    return;
  }
  const res = await fetch(url.replace('{to}', encodeURIComponent(to)).replace('{text}', encodeURIComponent(text)));
  if (!res.ok) throw new HttpError(502, 'The SMS could not be sent, try again');
}

/** Step 1 of phone sign-in: text a 6-digit code to the number. */
export async function startPhone(db: DatabaseSync, { body }: Request, send = sendSms, now = new Date()) {
  const phone = normalPhone((body as { phone?: unknown } | null)?.phone);
  if (!phone) throw new HttpError(400, 'Write a Bangladeshi mobile number, like 01712345678');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  db.prepare(
    `INSERT INTO otp_codes (phone, code_hash, expires_at, tries) VALUES (?, ?, ?, 0)
     ON CONFLICT(phone) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, tries = 0`,
  ).run(phone, hash(code), now.getTime() + CODE_MINUTES * 60_000);
  await send(phone, `Englio code: ${code}. It works for ${CODE_MINUTES} minutes. Don't share it with anyone.`);
  // Only when explicitly asked (development and the end-to-end tests): the code comes back too.
  return process.env.OTP_DEV_ECHO === '1' ? { ok: true, devCode: code } : { ok: true };
}

/**
 * Links an account to a learner and says who they are now: an account seen before brings back its
 * learner (the app then merges this phone's progress into it); a new one is linked to this device.
 */
function link(db: DatabaseSync, kind: 'phone' | 'google', subject: string, deviceId: unknown) {
  const known = db.prepare('SELECT user_id FROM accounts WHERE kind = ? AND subject = ?').get(kind, subject) as { user_id: string } | undefined;
  const id = known?.user_id ?? (typeof deviceId === 'string' ? deviceId : '');
  const row = db.prepare('SELECT progress FROM users WHERE id = ?').get(id) as { progress: string } | undefined;
  if (!row) throw new HttpError(404, 'No progress is saved with this account yet');
  if (!known) db.prepare('INSERT INTO accounts (kind, subject, user_id) VALUES (?, ?, ?)').run(kind, subject, id);
  return { id, progress: JSON.parse(row.progress), isNew: !known };
}

/** Step 2 of phone sign-in: check the code, then link the number (or bring back its progress). */
export function verifyPhone(db: DatabaseSync, { body }: Request, now = new Date()) {
  const b = (body ?? {}) as { phone?: unknown; code?: unknown; deviceId?: unknown };
  const phone = normalPhone(b.phone);
  const row = phone ? (db.prepare('SELECT code_hash, expires_at, tries FROM otp_codes WHERE phone = ?').get(phone) as { code_hash: string; expires_at: number; tries: number } | undefined) : undefined;
  if (!phone || !row || row.expires_at < now.getTime() || row.tries >= MAX_TRIES) throw new HttpError(410, 'The code has expired, ask for a new one');
  const given = Buffer.from(hash(typeof b.code === 'string' ? b.code.replace(/\D/g, '') : ''));
  if (!timingSafeEqual(given, Buffer.from(row.code_hash))) {
    db.prepare('UPDATE otp_codes SET tries = tries + 1 WHERE phone = ?').run(phone);
    throw new HttpError(401, 'That code is not right');
  }
  db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone);
  return link(db, 'phone', phone, b.deviceId);
}

type FetchLike = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/**
 * Google sign-in: checks the ID token Google gave the app (with Google's own tokeninfo service) and
 * that it was made for this app (GOOGLE_CLIENT_ID), then links the Google account.
 */
export async function signInGoogle(db: DatabaseSync, { body }: Request, get: FetchLike = fetch) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(503, 'Google sign-in is not set up on this server');
  const b = (body ?? {}) as { idToken?: unknown; deviceId?: unknown };
  if (typeof b.idToken !== 'string' || !b.idToken) throw new HttpError(400, '"idToken" is required');
  const res = await get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(b.idToken)}`);
  const info = (res.ok ? await res.json() : null) as { aud?: string; sub?: string; email?: string; email_verified?: string | boolean } | null;
  if (!info?.sub || info.aud !== clientId || !(info.email_verified === true || info.email_verified === 'true')) throw new HttpError(401, 'Google could not confirm this account');
  const result = link(db, 'google', info.sub, b.deviceId);
  db.prepare('UPDATE accounts SET label = ? WHERE kind = ? AND subject = ?').run(info.email ?? '', 'google', info.sub);
  return result;
}

/** What this learner has linked, for the settings page (the number masked). */
export function accountsOf(db: DatabaseSync, { params }: Request) {
  const rows = db.prepare('SELECT kind, subject, label FROM accounts WHERE user_id = ?').all(params.id) as { kind: string; subject: string; label: string | null }[];
  return rows.map((r) => ({ kind: r.kind, label: r.kind === 'phone' ? maskPhone(r.subject) : r.label || 'Google' }));
}
