import { describe, expect, it } from 'vitest';
import { BUNDLED_COURSE } from './course';
import { BUNDLED_GRAMMAR } from './grammar';
import { COURSES } from './grammarCourses';
import { BUNDLED_BOARD } from './board';

// MixedText colors each run of English inside Bangla text as one phrase. Two separate terms that
// touch ("Pronoun noun-এর…") then read as one phrase, which confuses learners. These are real phrases:
const PHRASES = new Set([
  'parts of speech',
  'part of speech',
  'proper noun',
  'common noun',
  'plural noun',
  'be verb',
  'be verbs',
  'modal verb',
  'helping verb',
  'reporting verb',
  'object pronoun',
  'relative pronoun',
  'active voice',
  'passive voice',
  'subject verb',
]);

const TERMS = /^(noun|pronoun|verb|adjective|adverb|preposition|conjunction|interjection|subject|object|tag|plural|singular|comparative|superlative)s?$/i;
const BANGLA = /[ঀ-৿]/;
const LATIN = /([A-Za-z][A-Za-z'’]*(?:\s*[/→]?\s*[A-Za-z][A-Za-z'’]*)*)/g;

/** English runs inside Bangla strings where a grammar term touches another word. */
function gluedTerms(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') {
    if (BANGLA.test(value)) {
      for (const [run] of value.matchAll(LATIN)) {
        const words = run.split(/\s+/);
        if (words.length > 1 && !run.includes('/') && !run.includes('→') && words.some((w) => TERMS.test(w)) && !PHRASES.has(run.toLowerCase())) {
          found.push(`"${run}" in: ${value}`);
        }
      }
    }
  } else if (Array.isArray(value)) value.forEach((v) => gluedTerms(v, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => gluedTerms(v, found));
  return found;
}

describe('Bangla explanations', () => {
  it('never put a grammar term right next to another English word (it would read as one phrase)', () => {
    // Board questions: only the Bangla parts (tips and reasons); the English sentences are meant to be English.
    const board = BUNDLED_BOARD.map((t) => [t.tip, t.questions.map((q) => q.why)]);
    const content = [BUNDLED_GRAMMAR, Object.values(COURSES), BUNDLED_COURSE.map((u) => [u.tips, u.lessons.map((l) => l.grammar ?? [])]), board];
    expect(gluedTerms(content)).toEqual([]);
  });
});
