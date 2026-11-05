import type { DatabaseSync } from 'node:sqlite';
import { DEFAULT_SETTINGS, normalizeSettings, settingsProblems, type AppSettings } from '../src/data/appSettings.ts';
import { bumpContentVersion } from './db.ts';
import { HttpError, type Request } from './http.ts';

const KEY = 'app_settings';

/** Before the owner saves any, the Plus plan comes from PREMIUM_PRICE / PREMIUM_DAYS (see premium.ts). */
const defaults = (): AppSettings => ({
  ...DEFAULT_SETTINGS,
  plus: {
    price: Number(process.env.PREMIUM_PRICE) || DEFAULT_SETTINGS.plus.price,
    days: Number(process.env.PREMIUM_DAYS) || DEFAULT_SETTINGS.plus.days,
  },
});

/** The owner's switches (feature on/off, locked units, the Plus plan); sent to every app with the course. */
export function readSettings(db: DatabaseSync): AppSettings {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(KEY) as { value: string } | undefined;
  return normalizeSettings(row ? JSON.parse(row.value) : undefined, defaults());
}

/** Saves new settings (owner only); apps get them the next time they open, like content. */
export function saveSettings(db: DatabaseSync, { body }: Request): AppSettings {
  const units = (db.prepare('SELECT id FROM units').all() as { id: string }[]).map((u) => u.id);
  const problems = settingsProblems(body, units);
  if (problems.length) throw new HttpError(400, problems.join('; '));
  const settings = normalizeSettings(body);
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(KEY, JSON.stringify(settings));
  bumpContentVersion(db);
  return settings;
}
