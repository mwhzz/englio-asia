import type { Grade, Sentence } from '../types';
import { isArabicText, normalizeArabic } from './target';

// Short forms are expanded so "I'm fine" and "I am fine" compare equal.
const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "you're": 'you are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "we're": 'we are',
  "they're": 'they are',
  "what's": 'what is',
  "where's": 'where is',
  "name's": 'name is',
  "here's": 'here is',
  "isn't": 'is not',
  "aren't": 'are not',
  "don't": 'do not',
  "doesn't": 'does not',
  "i'll": 'i will',
  "you'll": 'you will',
  "we'll": 'we will',
  "they'll": 'they will',
  "he'll": 'he will',
  "she'll": 'she will',
  "won't": 'will not',
  "can't": 'can not',
  cannot: 'can not',
};

export function normalize(text: string): string {
  // Arabic (a course that teaches Arabic): its own rules (lib/target.ts).
  if (isArabicText(text)) return normalizeArabic(text);
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => CONTRACTIONS[word] ?? word)
    .join(' ')
    .replace(/'/g, '');
}

/** Word tiles for a sentence: punctuation dropped, original casing kept. */
export function tokens(text: string): string[] {
  return text
    .replace(/[.,!?،؟؛]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

export function answersOf(sentence: Sentence): string[] {
  return [sentence.en, ...sentence.alt];
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** Typed answers may contain one small typo; tile answers must be exact. */
export function compare(input: string, answers: string[], allowTypo: boolean): Grade['result'] {
  const given = normalize(input);
  if (!given) return 'wrong';
  const targets = answers.map(normalize);
  if (targets.includes(given)) return 'correct';
  if (allowTypo && targets.some((t) => t.length >= 6 && editDistance(given, t) === 1)) return 'typo';
  return 'wrong';
}
