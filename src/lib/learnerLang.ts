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
  /** What the course teaches: English, or Arabic for a course like "bn-ar". */
  target?: 'en' | 'ar';
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

/**
 * The course is a code: the learner's language ("bn", "ar"), or with what it teaches when that isn't English
 * ("bn-ar": Arabic for Bangla speakers). The app's own text is in the learner's language, the first part.
 */
export const uiLang = () => learnerLang().split('-')[0];

/** Bangladesh-only parts (districts on a map, bKash) are for Bangla speakers, in any course. */
export const isBangla = () => uiLang() === 'bn';

/** SSC/HSC board prep is English for Bangla speakers: the plain Bangla course only. */
export const boardCourse = () => learnerLang() === 'bn';

let live: LiveLanguage[] = [];

/** The live learner languages, as the course download listed them (main.tsx). */
export const setLiveLanguages = (list: LiveLanguage[] | undefined) => {
  live = list ?? [];
};
export const liveLanguages = () => live;

/** The locale for dates in the learner's language (Arabic with 0–9 digits). */
export const dateLocale = () => (uiLang() === 'bn' ? 'bn-BD' : uiLang() === 'ar' ? 'ar-u-nu-latn' : uiLang());

/** The learner languages to pick from on the welcome screen (courses for them aren't listed here). */
export const baseLanguages = () => live.filter((l) => !l.code.includes('-'));

/** What a speaker of the current language can learn: English (their plain course) and any other live course for them. */
export const coursesForMe = () => live.filter((l) => l.code === uiLang() || l.code.startsWith(`${uiLang()}-`));
