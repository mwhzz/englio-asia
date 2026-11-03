import type { GrammarTopic } from '../../types';

/** Topics whose title, Bangla title, summary or examples contain every word of the search. */
export function searchTopics(topics: GrammarTopic[], query: string): GrammarTopic[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return topics;
  return topics.filter((t) => {
    const text = [t.title, t.titleBn, t.summary, ...t.examples.map((e) => e.en)].join(' ').toLowerCase();
    return words.every((w) => text.includes(w));
  });
}
