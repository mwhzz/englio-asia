/**
 * The language being learned. Englio teaches English; a course can also teach Arabic (for Bangla speakers,
 * course code "bn-ar"). The course download says which (`target`); this module tells the rest of the app:
 * the voice that reads it, speech recognition, how answers are compared, and the writing direction.
 */
export type Target = 'en' | 'ar';

let current: Target = 'en';

/** Set once at startup from the course (main.tsx also marks <html data-target> for the styles). */
export function setTarget(t: unknown): void {
  current = t === 'ar' ? 'ar' : 'en';
}

export const target = (): Target => current;

/** BCP 47 language for the voice and speech recognition. */
export const speechLang = () => (current === 'ar' ? 'ar-SA' : 'en-US');

const ARABIC = /[؀-ۿ]/;
export const isArabicText = (text: string) => ARABIC.test(text);

/**
 * Arabic as typed by learners: short vowel marks (harakat), tatweel and the different hamza/alef forms don't
 * count, so "مَرْحَبًا" and "مرحبا" are the same answer.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^؀-ۿ0-9 ]+/g, ' ')
    .replace(/[،؟؛]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}
