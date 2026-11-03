import { describe, expect, it } from 'vitest';
import { BUNDLED_STORIES } from '../data/stories';
import { fieldsToStory, storyToFields } from './storyForm';

describe('story form', () => {
  it.each(BUNDLED_STORIES.map((s) => [s.id, s] as const))('round-trips %s', (_, story) => {
    expect(fieldsToStory(storyToFields(story))).toEqual(story);
  });

  it('reads narration and speech lines', () => {
    const s = fieldsToStory({ id: '', title: 'At School', titleBn: 'স্কুলে', color: '#007aff', lines: 'It is Monday. | আজ সোমবার।\nRina | Good morning! | সুপ্রভাত!', quiz: '' });
    expect(s.id).toBe('at-school');
    expect(s.lines).toEqual([
      { en: 'It is Monday.', bn: 'আজ সোমবার।' },
      { who: 'Rina', en: 'Good morning!', bn: 'সুপ্রভাত!' },
    ]);
  });
});
