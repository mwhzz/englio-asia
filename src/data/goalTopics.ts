// What each "why are you learning" goal (onboarding WhyStep, profile.goals) is about: the units that serve it
// (by title, any course) and words that mark a sentence as useful for it (English, and Arabic without marks).

export const GOAL_NAMES: Record<string, string> = {
  work: 'কাজ ও চাকরি',
  abroad: 'বিদেশ যাওয়া',
  exam: 'পরীক্ষা',
  quran: 'কুরআন পড়া',
  travel: 'ঘোরাঘুরি',
  fun: 'এমনি শখে',
};

const UNITS: Record<string, string[]> = {
  work: ['Jobs & Work', 'On the Phone', 'At the Market', 'Technology & Phones', 'اَلْعَمَلُ وَالسَّفَر', 'يَوْمِي'],
  abroad: ['Travel', 'At the Doctor', 'In Town', 'Health & Body', 'اَلْعَمَلُ وَالسَّفَر', 'اَلطَّعَام'],
  exam: ['At School', 'Last Weekend', 'Questions about the Past', 'Plans', 'Feelings & Opinions'],
  quran: ['الحروف ١', 'الحروف ٢', 'الحروف ٣', 'اِقْرَأْ'],
  travel: ['Travel', 'A Day Out', 'In Town', 'Food and Cooking', 'Festivals', 'اَلطَّعَام'],
  fun: ['Free Time', 'Sports', 'Festivals', 'Food & Drink', 'People I Know'],
};

const WORDS: Record<string, string[]> = {
  work: ['work', 'office', 'job', 'boss', 'salary', 'factory', 'company', 'manager', 'عمل', 'مكتب', 'شركه', 'مدير', 'مصنع'],
  abroad: ['airport', 'visa', 'passport', 'ticket', 'abroad', 'flight', 'مطار', 'تاشيره', 'جواز', 'طائره', 'طاءره'],
  exam: ['exam', 'school', 'homework', 'teacher', 'class', 'study', 'مدرسه', 'ادرس', 'طالب'],
  quran: ['بسم', 'الله', 'الرحمن', 'الرحيم', 'اصلي', 'المسجد'],
  travel: ['bus', 'train', 'hotel', 'map', 'trip', 'beach', 'ticket', 'مطار', 'حقيبه'],
  fun: ['film', 'music', 'game', 'cricket', 'football', 'play', 'sing', 'dance'],
};

/** The first of the learner's goals this unit serves, if any. */
export function goalOfUnit(unitTitle: string, goals: string[] | undefined): string | null {
  return (goals ?? []).find((g) => UNITS[g]?.includes(unitTitle)) ?? null;
}

/** Whether a sentence (its plain words) is useful for one of the goals. */
export function servesGoals(plainText: string, goals: string[] | undefined): boolean {
  const words = ` ${plainText} `;
  return (goals ?? []).some((g) => (WORDS[g] ?? []).some((w) => words.includes(` ${w} `) || words.includes(` ${w}s `)));
}
