import type { Target } from '../lib/target';

/** For Bangla speakers (the words they already know came into Bangla). A 30-second first taste of a course, before anything is asked (docs/LEARNING_DESIGN.md: a win in the first minute). */
export interface Taste {
  /** What is shown big, read aloud. */
  show: string;
  /** What is said aloud (the shown text with its marks). */
  say: string;
  /** The question, in Bangla. */
  ask: string;
  /** The right answer and two wrong ones, in Bangla. */
  answer: string;
  wrong: [string, string];
  /** Shown when it's right. */
  why: string;
  /** Words a Bangla speaker already knows (they came into Bangla from this language). */
  known: { word: string; bn: string }[];
}

export const TASTES: Record<Target, Taste> = {
  ar: {
    show: 'ب',
    say: 'بَ',
    ask: 'শোনো। এই হরফের উচ্চারণ কোনটা?',
    answer: 'বা',
    wrong: ['তা', 'না'],
    why: 'ب = বা। নিচে এক নুকতা, দেখতে নৌকার মতো।',
    known: [
      { word: 'كِتَاب', bn: 'কিতাব' },
      { word: 'دُنْيَا', bn: 'দুনিয়া' },
      { word: 'سَلَام', bn: 'সালাম' },
      { word: 'دُعَاء', bn: 'দোয়া' },
      { word: 'قَلَم', bn: 'কলম' },
    ],
  },
  en: {
    show: 'doctor',
    say: 'doctor',
    ask: 'শোনো। এর মানে কী?',
    answer: 'ডাক্তার',
    wrong: ['বাস', 'চা'],
    why: 'doctor = ডাক্তার। এটা তো তুমি আগেই জানতে!',
    known: [
      { word: 'bus', bn: 'বাস' },
      { word: 'phone', bn: 'ফোন' },
      { word: 'school', bn: 'স্কুল' },
      { word: 'ticket', bn: 'টিকিট' },
      { word: 'table', bn: 'টেবিল' },
    ],
  },
};
