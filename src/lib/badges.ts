import type { GlyphName } from '../components/Glyph';
import { ALL_LESSONS } from '../data/course';
import { lessonsOf, COURSES } from '../data/grammarCourses';
import type { Progress } from './progress';

export interface Badge {
  id: string;
  icon: GlyphName;
  color: string;
  bn: string;
  en: string;
  /** How far along, and the target; earned when value ≥ target. */
  value: (p: Progress) => number;
  target: number;
}

const lessonsDone = (p: Progress) => Object.keys(p.completed).length;
const wordsLearned = (p: Progress) => ALL_LESSONS.filter((x) => p.completed[x.lesson.id]).reduce((n, x) => n + x.lesson.vocab.length, 0);
const coursesDone = (p: Progress) =>
  Object.values(COURSES).filter((c) => lessonsOf(c).every((l) => p.grammarLessonsDone?.includes(l.id))).length;

/** Every badge, roughly in the order a learner earns them. */
export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: 'star', color: '#34c759', bn: 'প্রথম লেসন', en: 'First lesson', value: lessonsDone, target: 1 },
  { id: 'lessons-10', icon: 'book', color: '#34c759', bn: '১০টা লেসন', en: '10 lessons', value: lessonsDone, target: 10 },
  { id: 'lessons-all', icon: 'trophy', color: '#34c759', bn: 'সব লেসন শেষ', en: 'Every lesson', value: lessonsDone, target: ALL_LESSONS.length },
  { id: 'streak-3', icon: 'flame', color: '#ff9500', bn: '৩ দিনের স্ট্রিক', en: '3-day streak', value: (p) => p.streak, target: 3 },
  { id: 'streak-7', icon: 'flame', color: '#ff9500', bn: '৭ দিনের স্ট্রিক', en: '7-day streak', value: (p) => p.streak, target: 7 },
  { id: 'streak-30', icon: 'flame', color: '#ff3b30', bn: '৩০ দিনের স্ট্রিক', en: '30-day streak', value: (p) => p.streak, target: 30 },
  { id: 'xp-100', icon: 'gem', color: '#ffb800', bn: '১০০ XP', en: '100 XP', value: (p) => p.xp, target: 100 },
  { id: 'xp-500', icon: 'gem', color: '#ffb800', bn: '৫০০ XP', en: '500 XP', value: (p) => p.xp, target: 500 },
  { id: 'xp-1000', icon: 'gem', color: '#ff9500', bn: '১০০০ XP', en: '1000 XP', value: (p) => p.xp, target: 1000 },
  { id: 'words-50', icon: 'letters', color: '#007aff', bn: '৫০টা শব্দ', en: '50 words', value: wordsLearned, target: 50 },
  { id: 'words-100', icon: 'letters', color: '#007aff', bn: '১০০টা শব্দ', en: '100 words', value: wordsLearned, target: 100 },
  { id: 'alphabet', icon: 'pencil', color: '#5856d6', bn: 'পুরো বর্ণমালা', en: 'Traced A–Z', value: (p) => p.lettersPracticed?.length ?? 0, target: 26 },
  { id: 'grammar-1', icon: 'book', color: '#af52de', bn: 'প্রথম ব্যাকরণ', en: 'First grammar topic', value: (p) => p.grammarLearned?.length ?? 0, target: 1 },
  { id: 'grammar-10', icon: 'book', color: '#af52de', bn: '১০টা ব্যাকরণ', en: '10 grammar topics', value: (p) => p.grammarLearned?.length ?? 0, target: 10 },
  { id: 'course-1', icon: 'trophy', color: '#af52de', bn: 'পুরো কোর্স শেষ', en: 'A full grammar course', value: coursesDone, target: 1 },
  { id: 'certificate', icon: 'trophy', color: '#ffcc00', bn: 'প্রথম সার্টিফিকেট', en: 'First certificate', value: (p) => Object.keys(p.unitTests ?? {}).length, target: 1 },
];

export const earned = (p: Progress) => BADGES.filter((b) => b.value(p) >= b.target);
