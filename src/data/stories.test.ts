import { describe, expect, it } from 'vitest';
import { BUNDLED_STORIES } from './stories';

describe('stories', () => {
  it.each(BUNDLED_STORIES.map((s) => [s.id, s] as const))('%s has lines and answerable questions', (_, s) => {
    expect(s.lines.length).toBeGreaterThanOrEqual(4);
    for (const l of s.lines) expect(l.en && l.bn).toBeTruthy();
    expect(s.quiz.length).toBeGreaterThanOrEqual(2);
    for (const q of s.quiz) expect(q.wrong).not.toContain(q.correct);
  });

  it('have unique ids', () => {
    expect(new Set(BUNDLED_STORIES.map((s) => s.id)).size).toBe(BUNDLED_STORIES.length);
  });
});
