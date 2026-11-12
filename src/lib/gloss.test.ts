import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../data/course';
import { glossFor, glossParts } from './gloss';

describe('word meanings in a lesson', () => {
  const first = ALL_LESSONS[0].lesson;
  const second = ALL_LESSONS[1].lesson;

  it("marks the lesson's new words and knows the earlier ones", () => {
    const g = glossFor(second.id);
    const parts = glossParts(`${first.vocab[0].en} and ${second.vocab[0].en}`, g);
    expect(parts.find((p) => p.text === first.vocab[0].en)).toMatchObject({ meaning: first.vocab[0].bn, fresh: false });
    expect(parts.find((p) => p.text === second.vocab[0].en)).toMatchObject({ meaning: second.vocab[0].bn, fresh: true });
  });

  it("doesn't know words of later lessons", () => {
    const later = ALL_LESSONS.at(-1)!.lesson.vocab.find((v) => !first.vocab.some((w) => w.en === v.en))!;
    expect(glossParts(later.en, glossFor(first.id)).some((p) => p.meaning)).toBe(false);
  });

  it('a phrase is one word ("good morning"), and the text comes back unchanged', () => {
    const g = glossFor(first.id);
    const text = 'Good morning, teacher.';
    const parts = glossParts(text, g);
    expect(parts.map((p) => p.text).join('')).toBe(text);
    expect(parts.find((p) => p.text === 'Good morning,')?.meaning).toBe('সুপ্রভাত');
  });

  it('in a unit test nothing is new', () => {
    expect(glossFor(first.id, false).fresh.size).toBe(0);
  });
});
