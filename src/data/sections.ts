// The path in sections, like chapters of a book: a heading, its level and what the learner will be able to
// do, then its units, then a checkpoint test. By unit position in each course (0-based, inclusive).

export interface Section {
  id: string;
  title: string;
  level: string;
  goal: string;
  from: number;
  to: number;
}

const SECTIONS: Record<string, Omit<Section, 'to'>[]> = {
  bn: [
    { id: 's1', title: 'শুরু: নিজের কথা', level: 'A1', goal: 'নিজের পরিচয়, পরিবার, খাবার, সংখ্যা আর সময় বলতে পারবে।', from: 0 },
    { id: 's2', title: 'রোজকার কাজ', level: 'A1', goal: 'বাজার, স্কুল, আবহাওয়া, পথ, ফোন আর ডাক্তারের কাছে কথা বলতে পারবে।', from: 5 },
    { id: 's3', title: 'ঘর, কাপড়, শহর', level: 'A1+', goal: 'বাড়ি, কেনাকাটা, শখ, কাজ আর শহরের পথ নিয়ে কথা বলতে পারবে।', from: 11 },
    { id: 's4', title: 'অতীত আর পরিকল্পনা', level: 'A2', goal: 'কী করেছিলে, কী করবে আর কেমন লাগছে বলতে পারবে।', from: 16 },
    { id: 's5', title: 'গল্প বলা', level: 'A2', goal: 'ঘোরা, রান্না, উৎসব, মানুষ, খেলা আর মোবাইল নিয়ে গল্প করতে পারবে।', from: 21 },
  ],
  'bn-ar': [
    { id: 'a1', title: 'হরফ আর পড়া', level: 'A1', goal: '২৮টা হরফ চিনবে, হরকত দেখে যেকোনো লেখা পড়তে পারবে।', from: 0 },
    { id: 'a2', title: 'প্রথম কথা', level: 'A1', goal: 'সালাম দিতে, নিজের আর পরিবারের পরিচয় দিতে পারবে।', from: 4 },
    { id: 'a3', title: 'রোজকার আরবি', level: 'A1', goal: 'সময়, খাবার, নিজের দিন আর কাজের জায়গার কথা বলতে পারবে।', from: 7 },
  ],
};

/** The sections of a course with this many units; a course without a plan is one section. */
export function sectionsOf(course: string, units: number): Section[] {
  const plan = (SECTIONS[course] ?? [{ id: 'all', title: 'শেখার পথ', level: 'A1', goal: '', from: 0 }]).filter((s) => s.from < units);
  return plan.map((s, i) => ({ ...s, to: (plan[i + 1]?.from ?? units) - 1 }));
}
