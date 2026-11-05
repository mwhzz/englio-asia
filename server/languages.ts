import type { DatabaseSync } from 'node:sqlite';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';

/**
 * The learners' own languages: each has its own course (units, lessons, grammar, stories, writing), with
 * the meanings and explanations in that language. "draft" ones are only seen in the admin; "live" ones are
 * offered to learners. Bangla is the first and can't be removed.
 */
export interface Language {
  code: string;
  name: string;
  native: string;
  dir: 'ltr' | 'rtl';
  status: 'draft' | 'live';
}

const BANGLA = /[ঀ-৿]/;
const CODE = /^[a-z]{2,3}$/;

const row = (db: DatabaseSync, code: string) => db.prepare('SELECT code, name, native, dir, status FROM languages WHERE code = ?').get(code) as Language | undefined;

/** The language a request is about (?lang=), Bangla when none is given; an unknown one is a 404. */
export function langOf(db: DatabaseSync, value: string | null | undefined): string {
  const code = value || 'bn';
  if (!row(db, code)) throw new HttpError(404, `No language "${code}"`);
  return code;
}

/** Whether learners may see this language's course. */
export const isLive = (db: DatabaseSync, code: string) => row(db, code)?.status === 'live';

/** Every language, with how much content it has and, for the others, how much is translated from Bangla. */
export function listLanguages(db: DatabaseSync) {
  const languages = db.prepare('SELECT code, name, native, dir, status FROM languages ORDER BY position, code').all() as unknown as Language[];
  const count = (sql: string, code: string) => (db.prepare(sql).get(code) as { n: number }).n;
  return languages.map((l) => {
    const items = db
      .prepare('SELECT i.data FROM items i JOIN lessons ls ON ls.id = i.lesson_id JOIN units u ON u.id = ls.unit_id WHERE u.lang = ?')
      .all(l.code) as { data: string }[];
    return {
      ...l,
      units: count('SELECT COUNT(*) AS n FROM units WHERE lang = ?', l.code),
      lessons: count('SELECT COUNT(*) AS n FROM lessons WHERE unit_id IN (SELECT id FROM units WHERE lang = ?)', l.code),
      items: items.length,
      // An item still holding Bangla text isn't translated yet (only counts for the other languages).
      translated: l.code === 'bn' ? items.length : items.filter((i) => !BANGLA.test(i.data)).length,
      grammar: count('SELECT COUNT(*) AS n FROM grammar WHERE lang = ?', l.code),
      stories: count('SELECT COUNT(*) AS n FROM stories WHERE lang = ?', l.code),
      writing: count('SELECT COUNT(*) AS n FROM writing_tasks WHERE lang = ?', l.code),
    };
  });
}

/** The live languages, for the app (it offers these to learners). */
export function liveLanguages(db: DatabaseSync) {
  return db.prepare("SELECT code, name, native, dir FROM languages WHERE status = 'live' ORDER BY position, code").all();
}

function fields(body: unknown, partial: boolean) {
  const b = (body ?? {}) as Record<string, unknown>;
  const out: Partial<Language> = {};
  for (const key of ['name', 'native'] as const) {
    if (b[key] === undefined && partial) continue;
    const v = typeof b[key] === 'string' ? b[key].trim() : '';
    if (!v || v.length > 60) throw new HttpError(400, `"${key}" is required (up to 60 letters)`);
    out[key] = v;
  }
  if (b.dir !== undefined || !partial) {
    if (b.dir !== 'ltr' && b.dir !== 'rtl') throw new HttpError(400, '"dir" must be ltr or rtl');
    out.dir = b.dir;
  }
  if (b.status !== undefined) {
    if (b.status !== 'draft' && b.status !== 'live') throw new HttpError(400, '"status" must be draft or live');
    out.status = b.status;
  }
  return out;
}

/** Adds a language, empty and in draft: its content is written in the admin before it goes live. */
export function createLanguage(db: DatabaseSync, { body }: Request) {
  const code = typeof (body as { code?: unknown })?.code === 'string' ? (body as { code: string }).code.trim().toLowerCase() : '';
  if (!CODE.test(code)) throw new HttpError(400, '"code" must be a 2–3 letter language code, like ar or hi');
  if (row(db, code)) throw new HttpError(409, `"${code}" is already added`);
  const f = fields(body, false);
  const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM languages').get() as { p: number };
  db.prepare('INSERT INTO languages (code, name, native, dir, status, position) VALUES (?, ?, ?, ?, ?, ?)').run(code, f.name!, f.native!, f.dir!, 'draft', p);
  return row(db, code);
}

/** Renames a language, changes its direction, or puts it live / back to draft. */
export function updateLanguage(db: DatabaseSync, { params, body }: Request) {
  const current = row(db, params.code);
  if (!current) throw new HttpError(404, 'No such language');
  const next = { ...current, ...fields(body, true) };
  if (params.code === 'bn' && next.status !== 'live') throw new HttpError(400, 'Bangla stays live');
  return transaction(db, () => {
    db.prepare('UPDATE languages SET name = ?, native = ?, dir = ?, status = ? WHERE code = ?').run(next.name, next.native, next.dir, next.status, params.code);
    bumpContentVersion(db);
    return next;
  });
}

/** Removes a language that has no content yet (so nothing written is ever lost by accident). */
export function deleteLanguage(db: DatabaseSync, { params }: Request) {
  if (params.code === 'bn') throw new HttpError(400, "Bangla can't be removed");
  const lang = listLanguages(db).find((l) => l.code === params.code);
  if (!lang) throw new HttpError(404, 'No such language');
  if (lang.units + lang.grammar + lang.stories + lang.writing > 0) throw new HttpError(409, 'Delete its content first');
  db.prepare('DELETE FROM languages WHERE code = ?').run(params.code);
  return { ok: true };
}

/** The id for new content in a language: Bangla's ids stay as they are; the others start with their code. */
export const idIn = (lang: string, id: string) => (lang === 'bn' || id.startsWith(`${lang}-`) ? id : `${lang}-${id}`);
