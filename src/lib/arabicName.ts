// A learner's name in Arabic letters, roughly, for the fun of seeing it on the name screen of the Arabic course
// ("Zawad" → "زاواد"). Letter by letter from English or Bangla spelling; it's shown as "about like this".

import { BANGLA, LATIN, LATIN_PAIRS } from '../data/arabicLetters';

// A word starting with a vowel (not y, w or য) starts with alif carrying hamza.
const VOWELS = /^[aeiouঅআইঈউঊএঐওঔ]/;
const FIRST_VOWEL: Record<string, string> = { ا: 'أ', ي: 'إي', و: 'أو', اي: 'أي', او: 'أو' };

function word(w: string): string {
  const latin = /^[a-z]+$/i.test(w);
  let out = '';
  const lower = w.toLowerCase();
  for (let i = 0; i < lower.length; ) {
    if (latin && LATIN_PAIRS[lower.slice(i, i + 2)]) {
      const pair = LATIN_PAIRS[lower.slice(i, i + 2)];
      out += i === 0 && VOWELS.test(lower) && FIRST_VOWEL[pair] ? FIRST_VOWEL[pair] : pair;
      i += 2;
      continue;
    }
    // Bangla nukta letters come as two code points (ড + ়).
    const two = lower.slice(i, i + 2);
    const ch = !latin && BANGLA[two] ? two : lower[i];
    const mapped = (latin ? LATIN : BANGLA)[ch] ?? '';
    out += i === 0 && VOWELS.test(lower) && FIRST_VOWEL[mapped] ? FIRST_VOWEL[mapped] : mapped;
    i += ch.length;
  }
  // The same letter twice in a row is written once (a doubled sound).
  return out.replace(/(.)\1+/g, '$1');
}

/** The name in Arabic letters, or "" when it has nothing to write (digits, other scripts). */
export function arabicName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word)
    .filter(Boolean)
    .join(' ');
}
