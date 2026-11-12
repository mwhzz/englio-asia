import { describe, expect, it } from 'vitest';
import { checkLesson } from './lessonCheck';

const units = [
  {
    title: 'U',
    lessons: [
      { id: 'l1', title: 'A', vocab: [{ en: 'tea', bn: 'চা' }, { en: 'I', bn: 'আমি' }, { en: 'like', bn: 'পছন্দ করি' }], sentences: [{ en: 'I like tea.' }] },
      { id: 'l2', title: 'B', vocab: [{ en: 'milk', bn: 'দুধ' }], sentences: [{ en: 'I like milk and tea.' }, { en: 'Milk!' }] },
    ],
  },
];

describe('the admin lesson check', () => {
  it('counts words, how often each shows, and what was not taught', () => {
    expect(checkLesson(units, 'l2')).toEqual({ words: 1, exposure: [{ en: 'milk', inLesson: 2, inUnit: 2 }], untaught: ['word "and"'] });
    expect(checkLesson(units, 'l1')?.untaught).toEqual([]);
    expect(checkLesson(units, 'nope')).toBeNull();
  });
});
