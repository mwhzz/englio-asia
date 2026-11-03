import { describe, expect, it } from 'vitest';
import { BUNDLED_GRAMMAR } from '../data/grammar';
import { fromFields, slug, toFields } from './topicForm';

describe('topic form', () => {
  it.each(BUNDLED_GRAMMAR.map((t) => [t.id, t] as const))('%s survives a round trip through the text fields', (_, topic) => {
    expect(fromFields(toFields(topic))).toEqual({ ...topic, ...(topic.table ? {} : {}) });
  });

  it('reads one item per line, with | between parts', () => {
    const t = fromFields({
      ...toFields(BUNDLED_GRAMMAR[0]),
      examples: 'I am here. | আমি এখানে।\n\n',
      quiz: 'Pick one | am | is; are | I এর সাথে am',
      formulas: 'হ্যাঁ: Subject + am + ...',
      table: '',
    });
    expect(t.examples).toEqual([{ en: 'I am here.', bn: 'আমি এখানে।' }]);
    expect(t.quiz).toEqual([{ question: 'Pick one', correct: 'am', wrong: ['is', 'are'], why: 'I এর সাথে am' }]);
    expect(t.formulas).toEqual([{ label: 'হ্যাঁ', parts: ['Subject', 'am', '...'] }]);
    expect(t.table).toBeUndefined();
  });

  it('makes ids from titles', () => {
    expect(slug('Present Simple')).toBe('present-simple');
    expect(slug('Be Verbs: am, is, are!')).toBe('be-verbs-am-is-are');
  });
});
