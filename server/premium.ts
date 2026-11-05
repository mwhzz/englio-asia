import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, Redirect, type Request } from './http.ts';

/**
 * Englio Plus (unlimited hearts), paid with bKash's Tokenized Checkout. Set these to turn it on
 * (see docs/SERVER.md): BKASH_BASE_URL, BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD,
 * PUBLIC_API_URL (this API's https address, for bKash to send the learner back to) and APP_URL (the app).
 * PREMIUM_PRICE (taka, default 99) and PREMIUM_DAYS (default 30) set the plan.
 */
const env = () => ({
  base: process.env.BKASH_BASE_URL ?? '',
  appKey: process.env.BKASH_APP_KEY ?? '',
  appSecret: process.env.BKASH_APP_SECRET ?? '',
  username: process.env.BKASH_USERNAME ?? '',
  password: process.env.BKASH_PASSWORD ?? '',
  api: (process.env.PUBLIC_API_URL ?? '').replace(/\/$/, ''),
  app: (process.env.APP_URL ?? './').replace(/\/$/, ''),
  price: Number(process.env.PREMIUM_PRICE ?? 99),
  days: Number(process.env.PREMIUM_DAYS ?? 30),
});
const ready = (e = env()) => !!(e.base && e.appKey && e.appSecret && e.username && e.password && e.api);

export type Post = (url: string, init: { headers: Record<string, string>; body: string }) => Promise<Record<string, unknown>>;
const httpPost: Post = async (url, init) => {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', ...init.headers }, body: init.body });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
};

/** A bKash session token (valid about an hour; fetched per payment, which is simple and plenty for this volume). */
async function token(post: Post): Promise<string> {
  const e = env();
  const r = await post(`${e.base}/tokenized/checkout/token/grant`, {
    headers: { username: e.username, password: e.password },
    body: JSON.stringify({ app_key: e.appKey, app_secret: e.appSecret }),
  });
  if (typeof r.id_token !== 'string') throw new HttpError(502, 'bKash did not answer, try again');
  return r.id_token;
}

/** Whether payments are on, and the plan. */
export function premiumInfo() {
  const e = env();
  return { available: ready(e), price: e.price, days: e.days };
}

/** Until when this learner has Englio Plus (null: not now). */
export function premiumOf(db: DatabaseSync, userId: string, now = new Date()) {
  const row = db.prepare('SELECT until FROM premium WHERE user_id = ?').get(userId) as { until: string } | undefined;
  return { until: row && row.until > now.toISOString() ? row.until : null };
}

/** Starts a payment and returns bKash's page to send the learner to. */
export async function checkout(db: DatabaseSync, { params }: Request, post: Post = httpPost, now = new Date()) {
  const e = env();
  if (!ready(e)) throw new HttpError(503, 'Payments are not set up yet');
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such user');
  const invoice = `EN${now.getTime().toString(36)}${randomBytes(3).toString('hex')}`.toUpperCase();
  const idToken = await token(post);
  const r = await post(`${e.base}/tokenized/checkout/create`, {
    headers: { authorization: idToken, 'x-app-key': e.appKey },
    body: JSON.stringify({
      mode: '0011',
      payerReference: invoice,
      callbackURL: `${e.api}/premium/callback`,
      amount: e.price.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoice,
    }),
  });
  if (typeof r.paymentID !== 'string' || typeof r.bkashURL !== 'string') throw new HttpError(502, String(r.statusMessage ?? 'bKash could not start the payment'));
  db.prepare('INSERT INTO payments (payment_id, user_id, amount, status, trx_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)').run(r.paymentID, params.id, e.price, 'started', now.toISOString());
  return { url: r.bkashURL };
}

/**
 * bKash sends the learner back here after paying (or cancelling). A successful payment is confirmed
 * with bKash ("execute") before Plus is given, then the learner goes back to the app.
 */
export async function callback(db: DatabaseSync, { query }: Request, post: Post = httpPost, now = new Date()): Promise<Redirect> {
  const e = env();
  const back = (result: 'ok' | 'failed' | 'cancelled') => new Redirect(`${e.app}/#premium=${result}`);
  const paymentId = query.get('paymentID') ?? '';
  const payment = db.prepare('SELECT user_id, status FROM payments WHERE payment_id = ?').get(paymentId) as { user_id: string; status: string } | undefined;
  if (!payment) return back('failed');
  if (payment.status === 'paid') return back('ok');
  if (query.get('status') !== 'success') {
    db.prepare('UPDATE payments SET status = ? WHERE payment_id = ?').run(query.get('status') === 'cancel' ? 'cancelled' : 'failed', paymentId);
    return back(query.get('status') === 'cancel' ? 'cancelled' : 'failed');
  }
  const r = await post(`${e.base}/tokenized/checkout/execute`, {
    headers: { authorization: await token(post), 'x-app-key': e.appKey },
    body: JSON.stringify({ paymentID: paymentId }),
  });
  if (r.transactionStatus !== 'Completed') {
    db.prepare('UPDATE payments SET status = ? WHERE payment_id = ?').run('failed', paymentId);
    return back('failed');
  }
  // Paying again while still Plus adds the days on top.
  const current = premiumOf(db, payment.user_id, now).until;
  const from = current ? new Date(current) : now;
  const until = new Date(from.getTime() + e.days * 86_400_000).toISOString();
  db.prepare('UPDATE payments SET status = ?, trx_id = ? WHERE payment_id = ?').run('paid', String(r.trxID ?? ''), paymentId);
  db.prepare('INSERT INTO premium (user_id, until) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET until = excluded.until').run(payment.user_id, until);
  return back('ok');
}
