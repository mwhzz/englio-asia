import { randomInt } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';
import { leagueWeek, weekXp } from './leaderboard.ts';

// Easy to read out to a friend: no 0/O, 1/I/L. Six characters; it only lets someone see your first name and weekly XP.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MAX_FRIENDS = 50;

const normal = (code: unknown) => (typeof code === 'string' ? code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '');

/** A learner's friend code, made the first time it's asked for. Unlike the backup code, it's safe to share. */
export function friendCode(db: DatabaseSync, userId: string): string {
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) throw new HttpError(404, 'No such user');
  const row = db.prepare('SELECT code FROM friend_codes WHERE user_id = ?').get(userId) as { code: string } | undefined;
  if (row) return row.code;
  for (;;) {
    const code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    if (db.prepare('INSERT OR IGNORE INTO friend_codes (code, user_id) VALUES (?, ?)').run(code, userId).changes) return code;
  }
}

/** The friends league: me and my friends by this week's XP (first names and codes only, never ids). */
export function friendsLeague(db: DatabaseSync, { params }: Request, now = new Date()) {
  const me = params.id;
  const code = friendCode(db, me);
  const friends = db
    .prepare('SELECT f.friend_id AS id, c.code FROM friends f JOIN friend_codes c ON c.user_id = f.friend_id WHERE f.user_id = ?')
    .all(me) as { id: string; code: string }[];
  const ids = [me, ...friends.map((f) => f.id)];
  const xp = new Map(weekXp(db, now, ids).map((r) => [r.id, r.xp]));
  const names = new Map(
    (db.prepare(`SELECT id, name FROM users WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids) as { id: string; name: string | null }[]).map((r) => [r.id, r.name]),
  );
  const people = ids
    .map((id) => ({
      name: names.get(id)?.trim().split(/\s+/)[0] || 'Learner',
      code: id === me ? code : friends.find((f) => f.id === id)!.code,
      xp: xp.get(id) ?? 0,
      isMe: id === me,
    }))
    .sort((a, b) => b.xp - a.xp || Number(b.isMe) - Number(a.isMe));
  return { ...leagueWeek(now), code, people };
}

/** Adds a friend by their code; both see each other from then on. */
export function addFriend(db: DatabaseSync, { params, body }: Request) {
  const me = params.id;
  const row = db.prepare('SELECT user_id FROM friend_codes WHERE code = ?').get(normal((body as { code?: unknown } | null)?.code)) as { user_id: string } | undefined;
  if (!row) throw new HttpError(404, 'No learner has this friend code');
  if (row.user_id === me) throw new HttpError(400, 'That is your own code');
  friendCode(db, me);
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM friends WHERE user_id = ?').get(me) as { n: number };
  if (n >= MAX_FRIENDS) throw new HttpError(400, `At most ${MAX_FRIENDS} friends`);
  const add = db.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)');
  add.run(me, row.user_id);
  add.run(row.user_id, me);
  return { ok: true };
}

/** Removes a friend (for both). */
export function removeFriend(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT user_id FROM friend_codes WHERE code = ?').get(normal(params.code)) as { user_id: string } | undefined;
  if (row) db.prepare('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(params.id, row.user_id, row.user_id, params.id);
  return { ok: true };
}
