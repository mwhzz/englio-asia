/**
 * The learner's own language: the one the meanings, explanations and the app's text are in (Bangla first,
 * then Arabic and others the owner puts live in the admin). Kept on the phone; changing it reloads the app.
 */
const KEY = 'englio-lang';

export interface LiveLanguage {
  code: string;
  name: string;
  native: string;
  dir: 'ltr' | 'rtl';
}

export function learnerLang(): string {
  try {
    return localStorage.getItem(KEY) || 'bn';
  } catch {
    return 'bn';
  }
}

/** Whether the learner has picked a language yet (the first screen asks when there's more than one). */
export function langChosen(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return true;
  }
}

/** Saves the language; the app reloads in it when it changed. */
export function setLearnerLang(code: string): void {
  const changed = code !== learnerLang();
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // For now only.
  }
  if (changed) location.reload();
}

/** Bangladesh-only parts (districts on a map, SSC/HSC board prep, bKash) are for Bangla learners. */
export const isBangla = () => learnerLang() === 'bn';

let live: LiveLanguage[] = [];

/** The live learner languages, as the course download listed them (main.tsx). */
export const setLiveLanguages = (list: LiveLanguage[] | undefined) => {
  live = list ?? [];
};
export const liveLanguages = () => live;

/** The locale for dates in the learner's language (Arabic with 0–9 digits). */
export const dateLocale = () => (learnerLang() === 'bn' ? 'bn-BD' : learnerLang() === 'ar' ? 'ar-u-nu-latn' : learnerLang());
