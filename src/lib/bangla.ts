const DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => DIGITS[Number(digit)]);
}

// Vowel signs and independent vowels: a word ending in one takes "র", others take "ের" (ঢাকার, সিলেটের).
const BANGLA_VOWEL_END = /[অ-ঔা-ৌৗ]$/;

/**
 * The Bangla possessive ("of"): ঢাকা → ঢাকার, সিলেট → সিলেটের, and for English names
 * Rina → Rina-র, Karim → Karim-এর.
 */
export function possessive(word: string): string {
  const w = word.trim();
  if (/[A-Za-z]$/.test(w)) return /[aeiouyAEIOUY]$/.test(w) ? `${w}-র` : `${w}-এর`;
  if (/[ঀ-৿]$/.test(w)) return BANGLA_VOWEL_END.test(w) ? `${w}র` : `${w}ের`;
  return `${w}-এর`;
}
