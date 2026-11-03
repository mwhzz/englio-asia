import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS } from '../../lib/progress';
import { weekDays } from './weekDays';

describe('weekDays', () => {
  // 2026-11-03 is a Tuesday (মঙ্গলবার).
  const days = weekDays({ ...DEFAULT_PROGRESS, xpByDay: { '2026-11-03': 10, '2026-11-01': 20, '2026-10-20': 5 } }, '2026-11-03');

  it('runs over the last seven days and ends today', () => {
    expect(days.map((d) => d.key)).toEqual([
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
    ]);
    expect(days.filter((d) => d.today).map((d) => d.key)).toEqual(['2026-11-03']);
  });

  it('labels each day in Bangla', () => {
    expect(days.map((d) => d.letter)).toEqual(['বু', 'বৃ', 'শু', 'শ', 'র', 'সো', 'ম']);
  });

  it('marks the days with XP', () => {
    expect(days.filter((d) => d.active).map((d) => d.key)).toEqual(['2026-11-01', '2026-11-03']);
  });
});
