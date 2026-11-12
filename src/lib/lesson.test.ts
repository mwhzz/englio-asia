import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../data/course';
import { answersOf, compare, tokens } from './answer';
import { fillGaps, grade, SKIP_SPEAKING } from './grade';
import { buildLesson, buildPractice } from './lesson';

// Exercises are random, so build each lesson many times.
const RUNS = 30;

describe('course content', () => {
  it('has unique lesson ids', () => {
    const ids = ALL_LESSONS.map((x) => x.lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ALL_LESSONS.map((x) => [x.lesson.id, x.lesson] as const))('%s has valid data', (_, lesson) => {
    expect(lesson.vocab.length).toBeGreaterThanOrEqual(3);
    expect(lesson.sentences.length).toBeGreaterThanOrEqual(3);
    expect(new Set(lesson.vocab.map((v) => v.bn)).size).toBe(lesson.vocab.length);
    for (const fill of lesson.fills) {
      expect(fill.text.split('___')).toHaveLength(2);
      expect(fill.options).toContain(fill.answer);
    }
    for (const gaps of lesson.gaps ?? []) {
      expect(gaps.text.split('___')).toHaveLength(gaps.answers.length + 1);
      for (const wrong of gaps.extra) expect(gaps.answers).not.toContain(wrong);
    }
    for (const g of lesson.grammar ?? []) {
      expect(g.wrong).not.toContain(g.correct);
      expect(new Set(g.wrong).size).toBe(g.wrong.length);
    }
    for (const dialog of lesson.dialogs ?? []) {
      expect(dialog.lines[dialog.reply]?.who).toBe('you');
      expect(dialog.wrong).not.toContain(dialog.lines[dialog.reply].en);
    }
  });
});

describe('buildLesson', () => {
  it.each(ALL_LESSONS.map((x) => [x.lesson.id]))('%s always produces solvable exercises', (id) => {
    for (let run = 0; run < RUNS; run++) {
      const exercises = buildLesson(id);
      expect(exercises.length).toBeGreaterThanOrEqual(8);
      expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);

      for (const ex of exercises) {
        switch (ex.kind) {
          case 'select':
            expect(ex.choices).toHaveLength(3);
            expect(new Set(ex.choices.map((c) => c.bn)).size).toBe(3);
            expect(grade(ex, ex.word.en).result).toBe('correct');
            break;
          case 'translate':
          case 'listen': {
            // The correct sentence can be built from the tiles.
            const pool = [...ex.tiles];
            for (const word of tokens(ex.sentence.en)) {
              const i = pool.indexOf(word);
              expect(i, `tile "${word}" missing`).toBeGreaterThanOrEqual(0);
              pool.splice(i, 1);
            }
            expect(grade(ex, tokens(ex.sentence.en).join(' ')).result).toBe('correct');
            break;
          }
          case 'choice':
            expect(ex.options).toContain(ex.sentence.bn);
            expect(new Set(ex.options).size).toBe(ex.options.length);
            break;
          case 'type':
            for (const a of answersOf(ex.sentence)) expect(compare(a, answersOf(ex.sentence), true)).toBe('correct');
            break;
          case 'match':
            expect(new Set(ex.pairs.map((p) => p.bn)).size).toBe(ex.pairs.length);
            break;
          case 'fill':
            expect(grade(ex, ex.fill.answer).result).toBe('correct');
            break;
          case 'gaps': {
            // Every answer is in the bank, and filling them in order is correct.
            const bank = [...ex.bank];
            for (const word of ex.gaps.answers) {
              const i = bank.indexOf(word);
              expect(i, `"${word}" missing from bank`).toBeGreaterThanOrEqual(0);
              bank.splice(i, 1);
            }
            expect(grade(ex, ex.gaps.answers.join('|')).result).toBe('correct');
            expect(grade(ex, ex.gaps.answers.join('|')).solution).toBe(fillGaps(ex.gaps.text, ex.gaps.answers));
            break;
          }
          case 'grammar':
            expect(ex.options).toContain(ex.grammar.correct);
            expect(grade(ex, ex.grammar.correct).result).toBe('correct');
            expect(grade(ex, ex.grammar.wrong[0]).result).toBe('wrong');
            break;
          case 'dialog': {
            const right = ex.dialog.lines[ex.dialog.reply].en;
            expect(ex.options).toContain(right);
            expect(new Set(ex.options).size).toBe(ex.options.length);
            expect(grade(ex, right).result).toBe('correct');
            break;
          }
          case 'dictate':
            expect(grade(ex, ex.sentence.en).result).toBe('correct');
            break;
          case 'speak':
            throw new Error('speaking is only added when asked for');
        }
      }
    }
  });
});

describe('new exercise kinds', () => {
  it('appear in lessons that have the data', () => {
    const kinds = new Set<string>();
    for (let run = 0; run < RUNS; run++) for (const ex of buildLesson('u1-l1')) kinds.add(ex.kind);
    for (const kind of ['gaps', 'grammar', 'dialog', 'dictate', 'hearWord']) expect(kinds).toContain(kind);
  });

  it('accepts a dictation with a small typo but not a wrong sentence', () => {
    const ex = buildLesson('u1-l1').find((e) => e.kind === 'dictate');
    if (!ex || ex.kind !== 'dictate') throw new Error('no dictation');
    expect(grade(ex, ex.sentence.en.toLowerCase().replace(/[.,!?]/g, '')).result).toBe('correct');
    expect(grade(ex, 'banana bread').result).toBe('wrong');
  });
});

describe('speaking', () => {
  it('adds one speaking exercise only when the device can listen, accepting the sentence or a skip', () => {
    expect(buildLesson('u1-l1').some((e) => e.kind === 'speak')).toBe(false);
    const lesson = buildLesson('u1-l1', { speak: true });
    const speak = lesson.filter((e) => e.kind === 'speak');
    expect(speak).toHaveLength(1);
    const ex = speak[0];
    if (ex.kind !== 'speak') throw new Error('not speak');
    expect(grade(ex, ex.sentence.en.toLowerCase()).result).toBe('correct');
    expect(grade(ex, SKIP_SPEAKING).result).toBe('correct');
    expect(grade(ex, 'something else entirely').result).toBe('wrong');
  });
});

describe('buildPractice', () => {
  it('mixes material from completed lessons', () => {
    const completed = { 'u1-l1': 1, 'u3-l2': 2 };
    const allowed = new Set(
      ALL_LESSONS.filter((x) => completed[x.lesson.id as keyof typeof completed]).flatMap((x) => x.lesson.sentences.map((s) => s.en)),
    );
    for (let run = 0; run < RUNS; run++) {
      for (const ex of buildPractice(completed)) {
        if ('sentence' in ex) expect(allowed.has(ex.sentence.en)).toBe(true);
      }
    }
  });
});

describe('practice for a beginner', () => {
  it('works before any lesson is finished (out of hearts in lesson 1)', async () => {
    const { buildPractice } = await import('./lesson');
    expect(buildPractice({}).length).toBeGreaterThan(0);
  });
});
