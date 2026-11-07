import { randomInt } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';
import { addPlusDays } from './premium.ts';
import { normalizeCode } from './restoreCodes.ts';

/**
 * Promo codes: the owner makes a code worth some days of Englio Plus (for a school, a campaign, a giveaway),
 * with how many learners may use it and until when. A learner types it in the app once; it's free, so it's
 * allowed in the Play app too.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function createPromo(db: DatabaseSync, { body }: Pick<Request, 'body'>, now = new Date()) {
  const b = (body ?? {}) as { code?: unknown; days?: unknown; uses?: unknown; expires?: unknown; note?: unknown };
  const days = Math.floor(Number(b.days));
  const uses = Math.floor(Number(b.uses));
  if (!(days >= 1 && days <= 3650)) throw new HttpError(400, 'Days must be 1 to 3650');
  if (!(uses >= 1 && uses <= 1_000_000)) throw new HttpError(400, 'Uses must be 1 or more');
  const wanted = normalizeCode(b.code);
  if (wanted && !/^[A-Z0-9]{4,20}$/.test(wanted)) throw new HttpError(400, 'A code is 4 to 20 letters and digits');
  const code = wanted || Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  const expires = typeof b.expires === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.expires) ? `${b.expires}T23:59:59Z` : null;
  if (db.prepare('SELECT 1 FROM promo_codes WHERE code = ?').get(code)) throw new HttpError(409, `"${code}" exists already`);
  db.prepare('INSERT INTO promo_codes (code, days, uses_left, expires_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    code,
    days,
    uses,
    expires,
    typeof b.note === 'string' ? b.note.slice(0, 120) : '',
    now.toISOString(),
  );
  return { code, days, uses, expires };
}

export function listPromos(db: DatabaseSync) {
  return db
    .prepare(
      `SELECT p.code, p.days, p.uses_left AS usesLeft, p.expires_at AS expires, p.note, p.created_at AS createdAt,
              (SELECT COUNT(*) FROM promo_uses u WHERE u.code = p.code) AS used
       FROM promo_codes p ORDER BY p.created_at DESC`,
    )
    .all();
}

export function deletePromo(db: DatabaseSync, { params }: Pick<Request, 'params'>) {
  db.prepare('DELETE FROM promo_codes WHERE code = ?').run(normalizeCode(params.code));
  return { ok: true };
}

/** A learner uses a code: once per learner, while it has uses left and hasn't expired. */
export function redeemPromo(db: DatabaseSync, { params, body }: Pick<Request, 'params' | 'body'>, now = new Date()) {
  const code = normalizeCode((body as { code?: unknown } | null)?.code);
  const row = db.prepare('SELECT days, uses_left, expires_at FROM promo_codes WHERE code = ?').get(code) as
    | { days: number; uses_left: number; expires_at: string | null }
    | undefined;
  if (row && db.prepare('SELECT 1 FROM promo_uses WHERE code = ? AND user_id = ?').get(code, params.id)) throw new HttpError(409, 'You used this code already');
  if (!row || row.uses_left < 1 || (row.expires_at && row.expires_at < now.toISOString())) throw new HttpError(404, 'This code does not work');
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such user');
  db.prepare('UPDATE promo_codes SET uses_left = uses_left - 1 WHERE code = ?').run(code);
  db.prepare('INSERT INTO promo_uses (code, user_id, at) VALUES (?, ?, ?)').run(code, params.id, now.toISOString());
  return { until: addPlusDays(db, params.id, row.days, now), days: row.days };
}
