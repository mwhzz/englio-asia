import { describe, expect, it } from 'vitest';
import { levelFor, nextSkill } from './difficulty';
import { buildLesson } from './lesson';
import { ALL_LESSONS } from '../data/course';

describe('difficulty', () => {
  it('follows how well recent lessons went', () => {
    let skill: number | undefined;
    for (let i = 0; i < 6; i++) skill = nextSkill(skill, 4, 10);
    expect(levelFor({ skill, completed: {} })).toBe('easy');
    for (let i = 0; i < 10; i++) skill = nextSkill(skill, 10, 10);
    expect(levelFor({ skill, completed: { a: 1, b: 1, c: 1 } })).toBe('hard');
    expect(levelFor({ completed: {} })).toBe('normal');
  });

  it('easy lessons have no typing or dictation; hard ones have more typing', () => {
    const id = ALL_LESSONS[2].lesson.id;
    const kinds = (level: 'easy' | 'hard') => buildLesson(id, { level }).map((e) => e.kind);
    for (let run = 0; run < 10; run++) {
      expect(kinds('easy')).not.toContain('type');
      expect(kinds('easy')).not.toContain('dictate');
    }
    const typed = (level: 'easy' | 'hard') => kinds(level).filter((k) => k === 'type' || k === 'dictate').length;
    expect(typed('hard')).toBeGreaterThan(1);
  });
});
