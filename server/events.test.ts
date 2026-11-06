import { describe, expect, it } from 'vitest';
import { openDb } from './db.ts';
import { analytics, recordEvents } from './events.ts';

const NOW = new Date('2026-11-03T08:00:00Z');

describe('analytics events', () => {
  it('adds up batches into a lesson funnel and the most-missed exercises', () => {
    const db = openDb(':memory:');
    recordEvents(db, { events: [{ name: 'lesson_start', key: 'u1-l1', n: 3 }, { name: 'lesson_done', key: 'u1-l1', n: 2 }, { name: 'mistake', key: 'w:apple', n: 4 }] }, NOW);
    recordEvents(db, { events: [{ name: 'lesson_start', key: 'u1-l1' }, { name: 'mistake', key: 's:I am a boy.', n: 1 }] }, NOW);
    expect(analytics(db, 30, NOW)).toEqual({
      since: '2026-10-05',
      lessons: [{ lessonId: 'u1-l1', started: 4, finished: 2, title: null }],
      mistakes: [
        { key: 'w:apple', n: 4 },
        { key: 's:I am a boy.', n: 1 },
      ],
      stories: [],
    });
  });

  it('skips unknown or oversized events and caps counts', () => {
    const db = openDb(':memory:');
    const r = recordEvents(db, { events: [{ name: 'hack', key: 'x' }, { name: 'mistake', key: 'x'.repeat(500) }, { name: 'mistake', key: 'w:cat', n: 9999 }] }, NOW);
    expect(r.kept).toBe(1);
    expect(analytics(db, 30, NOW).mistakes).toEqual([{ key: 'w:cat', n: 50 }]);
    expect(() => recordEvents(db, { nope: 1 })).toThrow();
  });
});
