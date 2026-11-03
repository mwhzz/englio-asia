export type LetterStyle = 'print' | 'hand' | 'cursive';
export type LetterCase = 'both' | 'upper' | 'lower';

/** The three ways of writing a letter, and the font each uses (handwriting fonts are Google's school "Playwrite" family). */
export const STYLES: { id: LetterStyle; bn: string; en: string; family: string }[] = [
  { id: 'print', bn: 'ছাপা', en: 'Print', family: 'Inter Variable' },
  { id: 'hand', bn: 'হাতের লেখা', en: 'Handwriting', family: 'Playwrite DE Grund' },
  { id: 'cursive', bn: 'টানা লেখা', en: 'Cursive', family: 'Playwrite US Trad' },
];

export const CASES: { id: LetterCase; label: string }[] = [
  { id: 'both', label: 'Aa' },
  { id: 'upper', label: 'A' },
  { id: 'lower', label: 'a' },
];

export const familyOf = (style: LetterStyle) => STYLES.find((s) => s.id === style)!.family;

/** The letter as shown for a case setting: "Aa", "A" or "a". */
export function shown(upper: string, letterCase: LetterCase): string {
  return letterCase === 'upper' ? upper : letterCase === 'lower' ? upper.toLowerCase() : `${upper}${upper.toLowerCase()}`;
}
