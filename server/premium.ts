import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, Redirect, type Request } from './http.ts';
import { readSettings } from './settings.ts';

/**
 * Englio Plus (unlimited hearts), paid with bKash's Tokenized Checkout. Set these to turn it on
 * (see docs/SERVER.md): BKASH_BASE_URL, BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD,
 * PUBLIC_API_URL (this API's https address, for bKash to send the learner back to) and APP_URL (the app).
 * The plan (price, days) and whether Plus can be bought are set on the admin's Settings page (settings.ts);
 * PREMIUM_PRICE / PREMIUM_DAYS only give the starting plan before the owner saves one.
 */
const env = () => ({
  base: process.env.BKASH_BASE_URL ?? '',
  appKey: process.env.BKASH_APP_KEY ?? '',
  appSecret: process.env.BKASH_APP_SECRET ?? '',
  username: process.env.BKASH_USERNAME ?? '',
  password: process.env.BKASH_PASSWORD ?? '',
  api: (process.env.PUBLIC_API_URL ?? '').replace(/\/$/, ''),
  app: (process.env.APP_URL ?? './').replace(/\/$/, ''),
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

/** Whether bKash is set up on the server (the admin warns when Plus-only units can't be bought yet). */
export const paymentsReady = () => ready();

/** Whether payments are on, and the plan. */
export function premiumInfo(db: DatabaseSync) {
  const { features, plus } = readSettings(db);
  return { available: ready() && features.plus, price: plus.price, days: plus.days };
}

/** Until when this learner has Englio Plus (null: not now). */
export function premiumOf(db: DatabaseSync, userId: string, now = new Date()) {
  const row = db.prepare('SELECT until FROM premium WHERE user_id = ?').get(userId) as { until: string } | undefined;
  return { until: row && row.until > now.toISOString() ? row.until : null };
}

/** Starts a payment and returns bKash's page to send the learner to. */
export async function checkout(db: DatabaseSync, { params }: Request, post: Post = httpPost, now = new Date()) {
  const e = env();
  const { features, plus } = readSettings(db);
  if (!ready(e) || !features.plus) throw new HttpError(503, 'Payments are not set up yet');
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such user');
  const invoice = `EN${now.getTime().toString(36)}${randomBytes(3).toString('hex')}`.toUpperCase();
  const idToken = await token(post);
  const r = await post(`${e.base}/tokenized/checkout/create`, {
    headers: { authorization: idToken, 'x-app-key': e.appKey },
    body: JSON.stringify({
      mode: '0011',
      payerReference: invoice,
      callbackURL: `${e.api}/premium/callback`,
      amount: plus.price.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoice,
    }),
  });
  if (typeof r.paymentID !== 'string' || typeof r.bkashURL !== 'string') throw new HttpError(502, String(r.statusMessage ?? 'bKash could not start the payment'));
  db.prepare('INSERT INTO payments (payment_id, user_id, amount, status, trx_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)').run(r.paymentID, params.id, plus.price, 'started', now.toISOString());
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
  if (payment.status !== 'started') return back('failed');
  if (query.get('status') !== 'success') {
    db.prepare('UPDATE payments SET status = ? WHERE payment_id = ?').run(query.get('status') === 'cancel' ? 'cancelled' : 'failed', paymentId);
    return back(query.get('status') === 'cancel' ? 'cancelled' : 'failed');
  }
  const r = await post(`${e.base}/tokenized/checkout/execute`, {
    headers: { authorization: await token(post), 'x-app-key': e.appKey },
    body: JSON.stringify({ paymentID: paymentId }),
  });
  if (r.transactionStatus !== 'Completed') {
    db.prepare("UPDATE payments SET status = 'failed' WHERE payment_id = ? AND status = 'started'").run(paymentId);
    return back('failed');
  }
  credit(db, paymentId, payment.user_id, String(r.trxID ?? ''), now);
  return back('ok');
}

/**
 * Marks a payment paid and gives its days of Plus, once: the payment is claimed in one statement, so two
 * callbacks (or a callback and the check below) for the same payment can't both add days.
 */
function credit(db: DatabaseSync, paymentId: string, userId: string, trxId: string, now: Date): boolean {
  const claimed = db.prepare("UPDATE payments SET status = 'paid', trx_id = ? WHERE payment_id = ? AND status = 'started'").run(trxId, paymentId).changes;
  if (!claimed) return false;
  // Paying again while still Plus adds the days on top.
  const current = premiumOf(db, userId, now).until;
  const from = current ? new Date(current) : now;
  const until = new Date(from.getTime() + readSettings(db).plus.days * 86_400_000).toISOString();
  db.prepare('INSERT INTO premium (user_id, until) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET until = excluded.until').run(userId, until);
  return true;
}

/**
 * Payments still "started" after a few minutes: the learner may have paid and closed the browser before
 * bKash sent them back. Ask bKash about each (run every 10 minutes, main.ts); a completed one gets its Plus,
 * and one still unfinished after a day is marked expired.
 */
export async function checkStuckPayments(db: DatabaseSync, post: Post = httpPost, now = new Date()): Promise<{ credited: number; expired: number }> {
  const e = env();
  let credited = 0;
  let expired = 0;
  if (!ready(e)) return { credited, expired };
  const stuck = db
    .prepare("SELECT payment_id AS id, user_id AS userId, created_at AS at FROM payments WHERE status = 'started' AND created_at < ?")
    .all(new Date(now.getTime() - 5 * 60_000).toISOString()) as { id: string; userId: string; at: string }[];
  if (!stuck.length) return { credited, expired };
  const idToken = await token(post);
  for (const p of stuck) {
    const r = await post(`${e.base}/tokenized/checkout/payment/status`, {
      headers: { authorization: idToken, 'x-app-key': e.appKey },
      body: JSON.stringify({ paymentID: p.id }),
    }).catch(() => ({}) as Record<string, unknown>);
    if (r.transactionStatus === 'Completed') {
      if (credit(db, p.id, p.userId, String(r.trxID ?? ''), now)) credited++;
    } else if (now.getTime() - Date.parse(p.at) > 86_400_000) {
      db.prepare("UPDATE payments SET status = 'expired' WHERE payment_id = ? AND status = 'started'").run(p.id);
      expired++;
    }
  }
  return { credited, expired };
}
