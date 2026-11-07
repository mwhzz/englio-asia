import { existsSync, readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { bumpContentVersion } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { langOf } from './languages.ts';

/**
 * The app's own text in each learner language. The app is written in Bangla; every Bangla text it shows is
 * listed in content/ui-strings.json (scripts/extract-ui-text.mjs). A language's translations start from
 * content/ui/<lang>.json and can be changed in the admin (অ্যাপের লেখা), which are kept in `ui_texts` and win.
 * They go to the app with the course as `ui` (src/lib/uiText.ts swaps them on screen).
 */
const CONTENT = new URL('../content/', import.meta.url);

const readJson = <T,>(path: URL, fallback: T): T => {
  try {
    return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback;
  } catch {
    return fallback;
  }
};

/** Every Bangla text the app shows (what needs translating). */
export const uiSources = (): string[] => readJson<string[]>(new URL('ui-strings.json', CONTENT), []);

/** A language's translations: the file's, with the admin's changes on top. Bangla has none (it's the source). */
export function uiTexts(db: DatabaseSync, lang: string): Record<string, string> {
  if (lang === 'bn') return {};
  const base = readJson<Record<string, string>>(new URL(`ui/${lang}.json`, CONTENT), {});
  const rows = db.prepare('SELECT source, text FROM ui_texts WHERE lang = ?').all(lang) as { source: string; text: string }[];
  for (const r of rows) base[r.source] = r.text;
  return base;
}

/** For the admin: each text with its translation (empty when missing), and how many are done. */
export function listUiTexts(db: DatabaseSync, { query }: Pick<Request, 'query'>) {
  const lang = langOf(db, query.get('lang'));
  const texts = uiTexts(db, lang);
  const sources = uiSources();
  const rows = sources.map((source) => ({ source, text: texts[source] ?? '' }));
  return { lang, total: sources.length, done: rows.filter((r) => r.text).length, rows };
}

/** The admin changes one translation (empty text = back to the file's). */
export function saveUiText(db: DatabaseSync, { body }: Pick<Request, 'body'>) {
  const b = (body ?? {}) as { lang?: string; source?: unknown; text?: unknown };
  const lang = langOf(db, b.lang);
  if (lang === 'bn') throw new HttpError(400, 'Bangla is the source text');
  if (typeof b.source !== 'string' || !uiSources().includes(b.source)) throw new HttpError(400, 'Unknown text');
  const text = typeof b.text === 'string' ? b.text.trim().slice(0, 2000) : '';
  if (text) {
    db.prepare('INSERT INTO ui_texts (lang, source, text) VALUES (?, ?, ?) ON CONFLICT(lang, source) DO UPDATE SET text = excluded.text').run(lang, b.source, text);
  } else {
    db.prepare('DELETE FROM ui_texts WHERE lang = ? AND source = ?').run(lang, b.source);
  }
  bumpContentVersion(db);
  return { ok: true };
}

export function migrateUiTexts(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS ui_texts (
    lang TEXT NOT NULL,
    source TEXT NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (lang, source)
  )`);
}
