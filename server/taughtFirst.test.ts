import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeArabic } from '../src/lib/target.ts';

// docs/LEARNING_DESIGN.md: nothing comes in a lesson that wasn't taught before (or in that lesson):
// every word of a sentence, blank, gap text, right answer and conversation is a word of this lesson or an
// earlier one, and in Arabic every letter has been taught. Wrong options are left out (they're mistakes).

interface Lesson {
  title: string;
  vocab: { en: string; bn: string }[];
  sentences?: { en: string }[];
  fills?: { text: string; answer: string }[];
  gaps?: { text: string; answers: string[] }[];
  grammar?: { correct: string }[];
  dialogs?: { lines: { en: string }[] }[];
}
interface Unit {
  title: string;
  lessons: Lesson[];
}

const arabic = (t: string) => /[؀-ۿ]/.test(t);
const tokens = (t: string) =>
  (arabic(t) ? normalizeArabic(t) : t.toLowerCase().replace(/[^a-z0-9' ]+/g, ' '))
    .split(/\s+/)
    .filter(Boolean);

/** The learning-language text a lesson shows as right. */
const shown = (l: Lesson) => [
  ...(l.sentences ?? []).map((s) => s.en),
  ...(l.fills ?? []).map((f) => f.text.replace('___', f.answer)),
  ...(l.gaps ?? []).map((g) => g.answers.reduce((t, a) => t.replace('___', a), g.text)),
  ...(l.grammar ?? []).map((g) => g.correct),
  ...(l.dialogs ?? []).flatMap((d) => d.lines.map((x) => x.en)),
];

/** Words and letters used before they were taught, lesson by lesson (in course order). */
export function untaught(units: Unit[]): string[] {
  const words = new Set<string>();
  const letters = new Set<string>();
  const problems: string[] = [];
  // A word is known when taught, or when it's وَ ("and") or ال ("the") in front of a known word, once taught.
  const known = (w: string): boolean =>
    words.has(w) || (w.startsWith('و') && words.has('و') && known(w.slice(1))) || (w.startsWith('ال') && words.has('ال') && known(w.slice(2)));
  for (const u of units)
    for (const l of u.lessons) {
      for (const v of l.vocab) {
        tokens(v.en).forEach((w) => words.add(w));
        // An Arabic letter lesson teaches its letters (a single letter, or a letter with its marks).
        if (arabic(v.en) && [...normalizeArabic(v.en)].length <= 2) [...normalizeArabic(v.en)].forEach((c) => letters.add(c));
      }
      if ((l.vocab ?? []).some((v) => v.en.startsWith('اَلْ') || v.en.startsWith('ال'))) words.add('ال');
      const where = `${u.title} / ${l.title}`;
      for (const text of shown(l)) {
        for (const w of tokens(text)) if (!known(w)) problems.push(`${where}: word "${w}"`);
        if (arabic(text)) for (const c of normalizeArabic(text).replace(/\s/g, '')) if (!letters.has(c)) problems.push(`${where}: letter "${c}"`);
      }
    }
  return [...new Set(problems)];
}

const file = (name: string) => JSON.parse(readFileSync(new URL(`../content/${name}`, import.meta.url), 'utf8')) as { units: Unit[] };

describe('nothing comes before it is taught', () => {
  it('Arabic letters, reading and first words (bn-ar-letters.json)', () => {
    expect(untaught(file('bn-ar-letters.json').units)).toEqual([]);
  });

  it('the whole Arabic course: letters, then batch 01 (units 6–11)', () => {
    expect(untaught([...file('bn-ar-letters.json').units, ...file('bn-ar-batch-01.json').units])).toEqual([]);
  });

  it('a word or letter used too early is found', () => {
    const units = [{ title: 'U', titleBn: 'U', color: '#000000', tips: [], lessons: [{ title: 'L', titleBn: 'L', vocab: [{ en: 'ب', bn: 'ব' }], sentences: [{ en: 'بَاب', bn: 'বাব', alt: [] }], fills: [] }] }];
    expect(untaught(units as Unit[])).toEqual(['U / L: word "باب"', 'U / L: letter "ا"']);
  });
});
