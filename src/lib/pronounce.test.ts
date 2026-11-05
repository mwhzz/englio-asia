import { describe, expect, it } from 'vitest';
import { compareSpoken } from './pronounce';

describe('word-by-word speaking score', () => {
  it('marks every word heard when the sentence is said right', () => {
    expect(compareSpoken('She is my friend.', 'she is my friend')).toEqual({
      words: [
        { word: 'She', ok: true },
        { word: 'is', ok: true },
        { word: 'my', ok: true },
        { word: 'friend.', ok: true },
      ],
      score: 100,
    });
  });

  it('finds the missed word even with an extra word said', () => {
    const r = compareSpoken('I am a student.', 'I am um student');
    expect(r.words.map((w) => w.ok)).toEqual([true, true, false, true]);
    expect(r.score).toBe(75);
  });

  it('treats digits, apostrophes and case as the same', () => {
    expect(compareSpoken('I have two brothers.', 'i have 2 brothers').score).toBe(100);
    expect(compareSpoken('I’m fine.', 'im fine').score).toBe(100);
  });

  it('scores nothing heard as zero', () => {
    expect(compareSpoken('Good morning!', '').score).toBe(0);
  });
});
