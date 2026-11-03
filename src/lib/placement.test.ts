import { describe, expect, it } from 'vitest';
import { BUNDLED_COURSE } from '../data/course';
import { grade } from './grade';
import { buildPlacement, skipUnits } from './placement';
import { DEFAULT_PROGRESS } from './progress';

describe('placement test', () => {
  it('asks two answerable questions per unit, in course order', () => {
    for (let run = 0; run < 20; run++) {
      const rounds = buildPlacement(BUNDLED_COURSE);
      expect(rounds.map((r) => r.unitIndex)).toEqual(BUNDLED_COURSE.map((_, i) => i));
      for (const r of rounds) {
        const [select, choice] = r.exercises;
        if (select.kind !== 'select' || choice.kind !== 'choice') throw new Error('wrong kinds');
        expect(new Set(select.choices.map((c) => c.en)).size).toBe(3);
        expect(grade(select, select.word.en).result).toBe('correct');
        expect(new Set(choice.options).size).toBe(3);
        expect(grade(choice, choice.sentence.bn).result).toBe('correct');
      }
    }
  });

  it('marks earlier units done without XP, keeping lessons already done', () => {
    const before = { ...DEFAULT_PROGRESS, completed: { 'u1-l1': 3 } };
    const after = skipUnits(before, BUNDLED_COURSE, 2);
    const skipped = BUNDLED_COURSE.slice(0, 2).flatMap((u) => u.lessons.map((l) => l.id));
    expect(Object.keys(after.completed).sort()).toEqual(skipped.sort());
    expect(after.completed['u1-l1']).toBe(3);
    expect(after.xp).toBe(0);
    expect(after.placementTaken).toBe(true);
  });
});
