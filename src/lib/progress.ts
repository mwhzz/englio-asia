import { dayKey } from './days';
import type { Profile } from './profile';
import { nextStreak } from './streak';

export interface Progress {
  /** Set by onboarding; null until the learner has finished it. */
  profile: Profile | null;
  xp: number;
  /** lessonId -> number of times completed */
  completed: Record<string, number>;
  streak: number;
  lastActiveDay: string | null;
  hearts: number;
  /** When the current heart refill period started (ms). */
  heartsUpdatedAt: number;
  dailyGoal: number;
  xpByDay: Record<string, number>;
  /** Lessons and practice sessions finished per day. */
  lessonsByDay: Record<string, number>;
  /** Seconds spent in lessons per day. */
  secondsByDay: Record<string, number>;
  soundOn: boolean;
  /** Letters traced on the letters page (uppercase, e.g. "A"). */
  lettersPracticed: string[];
  /** Grammar topics marked as learned, and bookmarked ones. */
  grammarLearned: string[];
  grammarSaved: string[];
  /** Finished lessons of grammar courses (e.g. "pos-07"). */
  grammarLessonsDone: string[];
  /** Took (or skipped) the level test, so the home page stops offering it. */
  placementTaken: boolean;
  /** Words ("w:hello") and sentences ("s:I am fine.") answered wrong, and when each comes back (see lib/review.ts). */
  review: Record<string, { due: string; step: number }>;
  /** Best passing unit-test score (0–100) and when, by unit id; a pass earns the unit's certificate. */
  unitTests: Record<string, { score: number; date: string }>;
  /** Saved-up streak freezes: each covers one missed day (see lib/streak.ts). */
  streakFreezes: number;
  /** Stories read to the end. */
  storiesRead: string[];
  /** Daily reminder: on or off, and the local hour (0–23) to send it if the learner hasn't practised yet. */
  reminder: { on: boolean; hour: number };
  /** Board questions answered right and asked, per day (the exam plan's trend, lib/board.ts). */
  boardDays?: Record<string, { right: number; total: number }>;
  /** Best score (0–100) in each SSC/HSC board practice topic, by topic id. */
  boardScores: Record<string, number>;
  /** Running share of right answers in recent lessons (0–1), for lesson difficulty (lib/difficulty.ts). */
  skill?: number;
  /** The last day the learner collected the daily quests' reward (lib/quests.ts). */
  questDay?: string | null;
  /** When this copy last changed, and when the learner last reset it (ms); used to merge two phones' copies. */
  savedAt: number;
  resetAt: number;
}

export const MAX_HEARTS = 5;
export const DAILY_GOALS = [10, 20, 30, 50];

export const DEFAULT_PROGRESS: Progress = {
  profile: null,
  xp: 0,
  completed: {},
  streak: 0,
  lastActiveDay: null,
  hearts: MAX_HEARTS,
  heartsUpdatedAt: 0,
  dailyGoal: 20,
  xpByDay: {},
  lessonsByDay: {},
  secondsByDay: {},
  soundOn: true,
  lettersPracticed: [],
  grammarLearned: [],
  grammarSaved: [],
  grammarLessonsDone: [],
  placementTaken: false,
  review: {},
  unitTests: {},
  streakFreezes: 0,
  storiesRead: [],
  reminder: { on: false, hour: 20 },
  boardScores: {},
  savedAt: 0,
  resetAt: 0,
};

/** Records a finished lesson (or a practice session when `lessonId` is null). */
export function recordLesson(p: Progress, lessonId: string | null, xp: number, today = dayKey(), seconds = 0): Progress {
  const { streak, streakFreezes } = nextStreak(p, today);
  return {
    ...p,
    xp: p.xp + xp,
    streak,
    streakFreezes,
    lastActiveDay: today,
    xpByDay: { ...p.xpByDay, [today]: (p.xpByDay[today] ?? 0) + xp },
    lessonsByDay: { ...p.lessonsByDay, [today]: (p.lessonsByDay[today] ?? 0) + 1 },
    secondsByDay: { ...p.secondsByDay, [today]: (p.secondsByDay[today] ?? 0) + seconds },
    completed: lessonId ? { ...p.completed, [lessonId]: (p.completed[lessonId] ?? 0) + 1 } : p.completed,
  };
}
