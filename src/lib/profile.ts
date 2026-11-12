export interface Profile {
  name: string;
  districtId: string;
  classId: string;
  joinedAt: string;
  /** Where they came from on their first visit (lib/source.ts), e.g. "facebook/launch". */
  source?: string;
  /** The learner's own language (lib/learnerLang.ts), for reminders in it. */
  lang?: string;
  /** Why they learn (onboarding WhyStep): work, abroad, exam, quran, travel, fun. */
  goals?: string[];
  /** District and class not picked yet: asked after the first lesson (onboarding, phase "finish"). */
  setupLater?: boolean;
}

export const NAME_MAX = 30;

/** Trims and collapses spaces; keeps Bangla and English letters alike. */
export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
}

export function isValidName(raw: string): boolean {
  return cleanName(raw).length >= 2;
}

/** First letter for the avatar, e.g. "rahim" → "R", "রহিম" → "র". */
export function initialOf(name: string): string {
  const first = cleanName(name)[0] ?? '';
  return first.toUpperCase();
}
