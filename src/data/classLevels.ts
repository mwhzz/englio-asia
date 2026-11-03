import { toBanglaDigits } from '../lib/bangla';

export type StageId = 'primary' | 'secondary' | 'higher' | 'university' | 'other';

export interface Stage {
  id: StageId;
  en: string;
  bn: string;
  /** What learners at this stage will focus on (shown during onboarding). */
  focus: string;
  /** Gradient colors (Apple system palette). */
  colors: [string, string];
}

export const STAGES: Record<StageId, Stage> = {
  primary: {
    id: 'primary',
    en: 'Primary',
    bn: 'প্রাথমিক',
    focus: 'ছবি, শব্দ আর ছোট ছোট বাক্য দিয়ে শুরু',
    colors: ['#5ac8fa', '#007aff'],
  },
  secondary: {
    id: 'secondary',
    en: 'Secondary',
    bn: 'মাধ্যমিক',
    focus: 'গ্রামার, বাক্য গঠন আর SSC-র প্রস্তুতি',
    colors: ['#34c759', '#30b0c7'],
  },
  higher: {
    id: 'higher',
    en: 'Higher Secondary',
    bn: 'উচ্চ মাধ্যমিক',
    focus: 'HSC, লেখা আর স্পোকেন ইংলিশ',
    colors: ['#ff9500', '#ff2d55'],
  },
  university: {
    id: 'university',
    en: 'University',
    bn: 'বিশ্ববিদ্যালয়',
    focus: 'প্রেজেন্টেশন, ইন্টারভিউ আর একাডেমিক ইংলিশ',
    colors: ['#af52de', '#5856d6'],
  },
  other: {
    id: 'other',
    en: 'Job or other',
    bn: 'চাকরি / অন্যান্য',
    focus: 'অফিস আর প্রতিদিনের কথোপকথনের ইংলিশ',
    colors: ['#c69c6d', '#7d5a3c'],
  },
};

export interface ClassLevel {
  id: string;
  en: string;
  bn: string;
  /** Bangla numeral for school classes; empty for university / other. */
  short: string;
  stage: StageId;
}

const ORDINALS = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম', 'একাদশ', 'দ্বাদশ'];

const stageOf = (n: number): StageId => (n <= 5 ? 'primary' : n <= 10 ? 'secondary' : 'higher');

export const SCHOOL_CLASSES: ClassLevel[] = ORDINALS.map((ordinal, i) => ({
  id: `class-${i + 1}`,
  en: `Class ${i + 1}`,
  bn: `${ordinal} শ্রেণি`,
  short: toBanglaDigits(i + 1),
  stage: stageOf(i + 1),
}));

export const OTHER_LEVELS: ClassLevel[] = [
  { id: 'university', en: 'University', bn: 'বিশ্ববিদ্যালয়', short: '', stage: 'university' },
  { id: 'other', en: 'Job or other', bn: 'চাকরি / অন্যান্য', short: '', stage: 'other' },
];

export const CLASS_LEVELS: ClassLevel[] = [...SCHOOL_CLASSES, ...OTHER_LEVELS];

export function findClassLevel(id: string | null | undefined): ClassLevel | undefined {
  return CLASS_LEVELS.find((x) => x.id === id);
}
