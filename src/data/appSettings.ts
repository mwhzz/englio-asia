// The owner's switches for the whole app, set on the admin's Settings page and sent to every app with the
// course (so a change works without a new APK). Shared by the server (validation) and the app.

export const FEATURES = [
  { id: 'hearts', bn: 'হার্ট', hint: 'ভুল করলে হার্ট কমে। বন্ধ করলে সবাই অফুরন্ত হার্ট পায়।' },
  { id: 'league', bn: 'লিগ', hint: 'জেলা লিগ আর বন্ধুদের লিগ।' },
  { id: 'stories', bn: 'গল্প', hint: 'হোমে ছোট গল্প পড়ার কার্ড।' },
  { id: 'board', bn: 'বোর্ড প্রস্তুতি', hint: 'SSC/HSC বোর্ড প্রস্তুতির কার্ড আর পাতা।' },
  { id: 'speaking', bn: 'শোনা-বলা', hint: 'নিচের "শোনা-বলা" ট্যাব।' },
  { id: 'reminders', bn: 'রোজকার রিমাইন্ডার', hint: 'প্রথম লেসনের পর রিমাইন্ডার চালুর প্রশ্ন আর সেটিংসের সারি।' },
  { id: 'plus', bn: 'Englio Plus কেনা', hint: 'Plus কেনার বোতাম (bKash চালু থাকলে)। বন্ধ করলে কেউ নতুন করে কিনতে পারবে না।' },
] as const;

export type FeatureId = (typeof FEATURES)[number]['id'];

export interface AppSettings {
  /** Each feature on or off. */
  features: Record<FeatureId, boolean>;
  /** Units that need Englio Plus; everyone else can open the rest. */
  lockedUnits: string[];
  /** The Plus plan: price in taka, and how many days it lasts. */
  plus: { price: number; days: number };
}

export const DEFAULT_SETTINGS: AppSettings = {
  features: Object.fromEntries(FEATURES.map((f) => [f.id, true])) as Record<FeatureId, boolean>,
  lockedUnits: [],
  plus: { price: 99, days: 30 },
};

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const wholeIn = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/**
 * Settings as the app reads them: anything missing or broken falls back to the default (every feature on,
 * nothing locked), so an older or odd server never switches features off by accident.
 */
export function normalizeSettings(raw: unknown, fallback: AppSettings = DEFAULT_SETTINGS): AppSettings {
  const r = isRecord(raw) ? raw : {};
  const f = isRecord(r.features) ? r.features : {};
  const p = isRecord(r.plus) ? r.plus : {};
  return {
    features: Object.fromEntries(FEATURES.map(({ id }) => [id, typeof f[id] === 'boolean' ? f[id] : fallback.features[id]])) as Record<FeatureId, boolean>,
    lockedUnits: Array.isArray(r.lockedUnits) ? [...new Set(r.lockedUnits.filter((u): u is string => typeof u === 'string'))] : fallback.lockedUnits,
    plus: {
      price: wholeIn(p.price, 1, 100_000) ? (p.price as number) : fallback.plus.price,
      days: wholeIn(p.days, 1, 3650) ? (p.days as number) : fallback.plus.days,
    },
  };
}

/** For the admin saving new settings: the problems in plain words (empty when it's fine). */
export function settingsProblems(raw: unknown, unitIds: string[]): string[] {
  if (!isRecord(raw)) return ['Settings must be an object'];
  const problems: string[] = [];
  const f = isRecord(raw.features) ? raw.features : null;
  if (!f) problems.push('"features" is missing');
  else for (const { id } of FEATURES) if (typeof f[id] !== 'boolean') problems.push(`feature "${id}" must be on or off`);
  if (!Array.isArray(raw.lockedUnits) || raw.lockedUnits.some((u) => typeof u !== 'string')) problems.push('"lockedUnits" must be a list of unit ids');
  else for (const u of raw.lockedUnits as string[]) if (!unitIds.includes(u)) problems.push(`unknown unit "${u}"`);
  const p = isRecord(raw.plus) ? raw.plus : null;
  if (!p || !wholeIn(p.price, 1, 100_000)) problems.push('Plus price must be a whole number of taka (1–100000)');
  if (!p || !wholeIn(p.days, 1, 3650)) problems.push('Plus days must be a whole number (1–3650)');
  return problems;
}
