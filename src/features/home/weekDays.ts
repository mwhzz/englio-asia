import { dayKey, shiftDay } from '../../lib/days';
import type { Progress } from '../../lib/progress';

// Short Bangla weekday names, Sunday first (as Date.getDay()).
const LETTERS = ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'];

export interface WeekDay {
  key: string;
  letter: string;
  /** Earned XP that day. */
  active: boolean;
  today: boolean;
}

/** The last seven days, ending today. */
export function weekDays(p: Progress, today = dayKey()): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const key = shiftDay(today, i - 6);
    const [y, m, d] = key.split('-').map(Number);
    return {
      key,
      letter: LETTERS[new Date(y, m - 1, d).getDay()],
      active: (p.xpByDay[key] ?? 0) > 0,
      today: i === 6,
    };
  });
}
