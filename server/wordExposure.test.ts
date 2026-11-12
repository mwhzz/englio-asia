import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readCourse } from './course.ts';
import { openDb } from './db.ts';
import { importLanguage, type LanguageFile } from './importLanguage.ts';
import { setCourse } from '../src/data/course.ts';
import { shiftDay } from '../src/lib/days.ts';
import { buildLesson } from '../src/lib/lesson.ts';
import type { Progress } from '../src/lib/progress.ts';
import { withReturning } from '../src/lib/returning.ts';
import { buildReview, noteRight, reviewKey, scheduleTaught } from '../src/lib/review.ts';
import { normalizeArabic, setTarget } from '../src/lib/target.ts';
import type { Exercise, Unit } from '../src/types.ts';

// docs/LEARNING_DESIGN.md: 5 new words a lesson, at least 15 a unit, and every word is seen 15–20 times
// over its first two weeks: 6–8 times in its own lesson, then coming back after 1, 2, 4 and 7 days.

const RUNS = 10;

/** The same "random" lessons every run (a fixed seed), so the result never depends on luck. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const MIN_IN_LESSON = 6;
const MIN_TWO_WEEKS = 15;

const file = (name: string) => JSON.parse(readFileSync(new URL(`../content/${name}`, import.meta.url), 'utf8')) as LanguageFile;

/** Every bit of learning-language text the learner sees in an exercise. */
function seenText(ex: Exercise): string[] {
  switch (ex.kind) {
    case 'select':
      return ex.choices.map((c) => c.en);
    case 'match':
      return ex.pairs.map((p) => p.en);
    case 'fill':
      return [ex.fill.text.replace('___', ex.fill.answer), ...ex.fill.options];
    case 'gaps':
      return [ex.gaps.answers.reduce((t, a) => t.replace('___', a), ex.gaps.text), ...ex.gaps.extra];
    case 'grammar':
      return [ex.grammar.correct, ...ex.grammar.wrong];
    case 'dialog':
      return [...ex.dialog.lines.map((l) => l.en), ...ex.dialog.wrong];
    default:
      return [ex.sentence.en];
  }
}

const words = (t: string) => ` ${(/[؀-ۿ]/.test(t) ? normalizeArabic(t) : t.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ')).replace(/\s+/g, ' ').trim()} `;

/** How many exercises show this word (a single Arabic letter counts when it's inside a word shown). */
function timesSeen(word: string, exercises: Exercise[]): number {
  const w = words(word).trim();
  const letter = /[؀-ۿ]/.test(word) && [...w].length <= 2;
  return exercises.filter((ex) => seenText(ex).some((t) => (letter ? words(t).includes(w) : words(t).includes(` ${w} `)))).length;
}

/**
 * A learner doing one lesson a day, every answer right, then 14 more days of review: how often each word
 * is seen from the day it's taught to two weeks after (on average over a few runs).
 */
function twoWeeks(units: Unit[]): { word: string; inLesson: number; total: number }[] {
  const lessons = units.flatMap((u) => u.lessons);
  const sums = new Map<string, { inLesson: number; total: number }>();
  for (let run = 0; run < RUNS; run++) {
    let p = { review: {} } as unknown as Progress;
    const days: Exercise[][] = [];
    lessons.forEach((lesson, d) => {
      const today = shiftDay('2026-01-01', d);
      const session = withReturning(buildLesson(lesson.id), p, lesson.id, today);
      for (const ex of session) {
        const key = reviewKey(ex);
        if (key) p = noteRight(p, key, today);
        if (ex.kind === 'match') p = ex.pairs.reduce((q, w) => noteRight(q, `w:${w.en}`, today), p);
      }
      p = scheduleTaught(p, lesson.vocab.map((v) => v.en), today);
      days.push(session);
    });
    for (let d = lessons.length; d < lessons.length + 14; d++) {
      const today = shiftDay('2026-01-01', d);
      const session = buildReview(p, today);
      for (const ex of session) {
        const key = reviewKey(ex);
        if (key) p = noteRight(p, key, today);
      }
      days.push(session);
    }
    lessons.forEach((lesson, d) => {
      for (const v of lesson.vocab) {
        const s = sums.get(v.en) ?? { inLesson: 0, total: 0 };
        s.inLesson += timesSeen(v.en, days[d]);
        s.total += timesSeen(v.en, days.slice(d, d + 15).flat());
        sums.set(v.en, s);
      }
    });
  }
  return [...sums].map(([word, s]) => ({ word, inLesson: s.inLesson / RUNS, total: s.total / RUNS }));
}

describe('every word keeps coming back (Arabic letters, reading and first words)', () => {
  afterEach(() => vi.restoreAllMocks());
  const db = openDb(':memory:');
  importLanguage(db, file('bn-ar-letters.json'));
  const units = readCourse(db, 'bn-ar');

  it('5 new words a lesson, 15+ a unit', () => {
    for (const unit of units) {
      for (const l of unit.lessons) expect(l.vocab.length, `${unit.title} / ${l.title}`).toBe(5);
      expect(unit.lessons.flatMap((l) => l.vocab).length, unit.title).toBeGreaterThanOrEqual(15);
    }
  });

  it(`each word: ${MIN_IN_LESSON}+ times in its lesson, ${MIN_TWO_WEEKS}+ in two weeks`, () => {
    setCourse(units);
    setTarget('ar');
    vi.spyOn(Math, 'random').mockImplementation(seeded(2026));
    try {
      const rows = twoWeeks(units);
      if (process.env.SHOW_EXPOSURE) console.log(rows.map((r) => `${r.word} ${r.inLesson.toFixed(1)} ${r.total.toFixed(1)}`).join('\n'));
      expect(rows.filter((r) => r.inLesson < MIN_IN_LESSON).map((r) => `${r.word}: ${r.inLesson.toFixed(1)}`), 'in its lesson').toEqual([]);
      expect(rows.filter((r) => r.total < MIN_TWO_WEEKS).map((r) => `${r.word}: ${r.total.toFixed(1)}`), 'in two weeks').toEqual([]);
    } finally {
      setTarget('en');
    }
  }, 60_000);
});
