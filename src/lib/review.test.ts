import { describe, expect, it } from 'vitest';
import { buildLesson } from './lesson';
import { DEFAULT_PROGRESS } from './progress';
import { buildReview, dueKeys, noteMistake, noteRight, reviewKey } from './review';

const today = '2026-11-03';

describe('mistake review', () => {
  it('brings a missed item back tomorrow, then after 2, 4 and 7 days, then lets it go', () => {
    let p = noteMistake(DEFAULT_PROGRESS, 'w:hello', today);
    expect(p.review['w:hello']).toEqual({ due: '2026-11-04', step: 0 });
    expect(dueKeys(p, today)).toEqual([]);
    expect(dueKeys(p, '2026-11-04')).toEqual(['w:hello']);
    p = noteRight(p, 'w:hello', '2026-11-04');
    expect(p.review['w:hello']).toEqual({ due: '2026-11-06', step: 1 });
    p = noteRight(p, 'w:hello', '2026-11-06');
    p = noteRight(p, 'w:hello', '2026-11-10');
    expect(p.review['w:hello']).toEqual({ due: '2026-11-17', step: 3 });
    p = noteRight(p, 'w:hello', '2026-11-17');
    expect(p.review['w:hello']).toBeUndefined();
  });

  it('starts over when missed again, and ignores right answers on items not in review', () => {
    let p = noteMistake(DEFAULT_PROGRESS, 's:I am fine.', today);
    p = noteRight(p, 's:I am fine.', '2026-11-04');
    p = noteMistake(p, 's:I am fine.', '2026-11-07');
    expect(p.review['s:I am fine.']).toEqual({ due: '2026-11-08', step: 0 });
    expect(noteRight(DEFAULT_PROGRESS, 'w:cat', today)).toBe(DEFAULT_PROGRESS);
  });

  it('builds exercises for exactly the due words and sentences', () => {
    const lesson = buildLesson('u1-l1');
    let p = DEFAULT_PROGRESS;
    const keys = lesson.map(reviewKey).filter((k): k is string => !!k);
    for (const k of keys) p = noteMistake(p, k, today);
    const due = new Set(dueKeys(p, '2026-11-04'));
    const exercises = buildReview(p, '2026-11-04');
    expect(exercises.length).toBe(Math.min(10, due.size));
    for (const ex of exercises) expect(due.has(reviewKey(ex)!)).toBe(true);
  });
});

describe('weak spots beyond words', () => {
  it('a missed blank and a missed grammar question come back in review', async () => {
    const { ALL_LESSONS } = await import('../data/course');
    const { DEFAULT_PROGRESS } = await import('./progress');
    const lesson = ALL_LESSONS.map((x) => x.lesson).find((l) => l.fills.length && l.grammar?.length)!;
    const fill = lesson.fills[0];
    const grammar = lesson.grammar![0];
    expect(reviewKey({ id: 'x', kind: 'fill', fill })).toBe(`f:${fill.text}`);
    let p = noteMistake(DEFAULT_PROGRESS, `f:${fill.text}`, '2026-11-01');
    p = noteMistake(p, `g:${grammar.correct}`, '2026-11-01');
    const kinds = buildReview(p, '2026-11-02').map((e) => e.kind).sort();
    expect(kinds).toEqual(['fill', 'grammar']);
  });
});
