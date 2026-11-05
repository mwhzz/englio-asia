import { describe, expect, it } from 'vitest';
import { BUNDLED_GRAMMAR } from './grammar';

describe('grammar topics', () => {
  it('have unique ids', () => {
    const ids = BUNDLED_GRAMMAR.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(BUNDLED_GRAMMAR.map((t) => [t.id, t] as const))('%s is complete and its quiz is answerable', (_, t) => {
    expect(t.explain.length).toBeGreaterThan(0);
    expect(t.examples.length).toBeGreaterThanOrEqual(3);
    expect(t.quiz.length).toBeGreaterThanOrEqual(3);
    for (const q of t.quiz) {
      expect(q.wrong).not.toContain(q.correct);
      expect(new Set([q.correct, ...q.wrong]).size).toBe(q.wrong.length + 1);
    }
    for (const f of t.formulas) expect(f.parts.length).toBeGreaterThan(0);
    if (t.table) for (const row of t.table) expect(row.length).toBe(t.table[0].length);
  });
});

