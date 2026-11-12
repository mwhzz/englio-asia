import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { untaught, type CheckUnit as Unit } from '../src/lib/lessonCheck.ts';

// docs/LEARNING_DESIGN.md (checks in src/lib/lessonCheck.ts): nothing comes in a lesson that wasn't taught before (or in that lesson):
// every word of a sentence, blank, gap text, right answer and conversation is a word of this lesson or an
// earlier one, and in Arabic every letter has been taught. Wrong options are left out (they're mistakes).

const file = (name: string) => JSON.parse(readFileSync(new URL(`../content/${name}`, import.meta.url), 'utf8')) as { units: Unit[] };

describe('nothing comes before it is taught', () => {
  it('Arabic letters, reading and first words (bn-ar-letters.json)', () => {
    expect(untaught(file('bn-ar-letters.json').units)).toEqual([]);
  });

  it('the whole Arabic course: letters, then batch 01 (units 6–11)', () => {
    expect(untaught([...file('bn-ar-letters.json').units, ...file('bn-ar-batch-01.json').units])).toEqual([]);
  });

  it('English section 1 (bn-s1-rules.json): 5 words a lesson, nothing before it is taught', () => {
    const units = file('bn-s1-rules.json').units;
    expect(units.flatMap((u) => u.lessons.map((l) => l.vocab.length))).toEqual(Array(20).fill(5));
    expect(untaught(units, ['rina', 'rahim', 'karim'])).toEqual([]);
  });

  it('a word or letter used too early is found', () => {
    const units = [{ title: 'U', titleBn: 'U', color: '#000000', tips: [], lessons: [{ title: 'L', titleBn: 'L', vocab: [{ en: 'ب', bn: 'ব' }], sentences: [{ en: 'بَاب', bn: 'বাব', alt: [] }], fills: [] }] }];
    expect(untaught(units as Unit[])).toEqual(['U / L: word "باب"', 'U / L: letter "ا"']);
  });
});
