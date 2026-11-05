import { describe, expect, it } from 'vitest';
import type { Sentence, Vocab } from '../types';
import { wordInSentence } from './wordInSentence';

const v = (en: string, bn = en): Vocab => ({ en, bn, emoji: '' });
const s = (en: string, bn: string): Sentence => ({ en, bn, alt: [] });
const pool = [v('house'), v('big'), v('city'), v('small'), v('school')];

describe('wordInSentence', () => {
  it('blanks the word in a sentence that uses it, with the Bangla as the hint', () => {
    const fill = wordInSentence(v('big'), [s('Our house is big.', 'আমাদের বাড়িটা বড়।')], pool)!;
    expect(fill.text).toBe('Our house is ___.');
    expect(fill.answer).toBe('big');
    expect(fill.bn).toBe('আমাদের বাড়িটা বড়।');
    expect(fill.options).toHaveLength(3);
    expect(new Set(fill.options).size).toBe(3);
    expect(fill.options).toContain('big');
  });

  it("never offers a word that's already in the sentence", () => {
    for (let i = 0; i < 30; i++) {
      const fill = wordInSentence(v('big'), [s('Our house is big.', '')], pool)!;
      expect(fill.options).not.toContain('house');
    }
  });

  it('matches whole words only, ignoring case, and keeps the case it found', () => {
    expect(wordInSentence(v('is'), [s('This is my sister.', '')], [...pool, v('is')])?.text).toBe('This ___ my sister.');
    expect(wordInSentence(v('big'), [s('A bigger house.', '')], pool)).toBeNull();
    expect(wordInSentence(v('Dhaka'), [s('I live in dhaka.', '')], pool)?.answer).toBe('dhaka');
  });

  it("skips a word that only starts the sentence (its capital would give it away)", () => {
    expect(wordInSentence(v('house'), [s('House is big.', '')], pool)).toBeNull();
  });

  it('skips phrases and words with too few other words to choose from', () => {
    expect(wordInSentence(v('good morning'), [s('I say good morning.', '')], pool)).toBeNull();
    expect(wordInSentence(v('big'), [s('Our house is big.', '')], [v('big'), v('house')])).toBeNull();
  });
});
