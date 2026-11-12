import { describe, expect, it } from 'vitest';
import { goalOfUnit, servesGoals } from './goalTopics';

describe('learner goals shape content', () => {
  it('a work unit serves the work goal only', () => {
    expect(goalOfUnit('Jobs & Work', ['fun', 'work'])).toBe('work');
    expect(goalOfUnit('Jobs & Work', ['quran'])).toBeNull();
    expect(goalOfUnit('Jobs & Work', undefined)).toBeNull();
  });

  it('sentences with goal words count, plurals too', () => {
    expect(servesGoals('i go to the office', ['work'])).toBe(true);
    expect(servesGoals('we have two tickets', ['abroad'])).toBe(true);
    expect(servesGoals('i like tea', ['work'])).toBe(false);
  });
});
