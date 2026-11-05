import { describe, expect, it } from 'vitest';
import { reportText } from './shareReport';

describe('weekly report message', () => {
  it('reads naturally for a parent', () => {
    const text = reportText('Rina', { xp: 120, lessons: 8, minutes: 45, activeDays: 5 }, { xp: 80, lessons: 5, minutes: 30, activeDays: 3 }, 9);
    expect(text).toBe('Rina এই সপ্তাহে Englio-তে ইংরেজি শিখেছে:\n• ৫ দিন শিখেছে, মোট ৪৫ মিনিট\n• ৮টা লেসন, ১২০ XP (গত সপ্তাহের চেয়ে বেশি)\n• টানা ৯ দিনের স্ট্রিক');
  });
});
