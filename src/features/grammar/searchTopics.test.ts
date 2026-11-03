import { describe, expect, it } from 'vitest';
import { BUNDLED_GRAMMAR } from '../../data/grammar';
import { searchTopics } from './searchTopics';

describe('searchTopics', () => {
  it('finds topics by English or Bangla title, ignoring case', () => {
    expect(searchTopics(BUNDLED_GRAMMAR, 'VOICE').map((t) => t.id)).toContain('voice');
    expect(searchTopics(BUNDLED_GRAMMAR, 'আর্টিকেল').map((t) => t.id)).toEqual(['articles']);
  });

  it('needs every word to match, and an empty search shows everything', () => {
    expect(searchTopics(BUNDLED_GRAMMAR, 'present continuous').map((t) => t.id)).toContain('present-continuous');
    expect(searchTopics(BUNDLED_GRAMMAR, 'present zzz')).toEqual([]);
    expect(searchTopics(BUNDLED_GRAMMAR, '  ')).toHaveLength(BUNDLED_GRAMMAR.length);
  });
});
