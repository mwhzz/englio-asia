import { findClassLevel } from '../data/classLevels';
import type { BoardTopic, Exam } from '../data/board/types';
import type { QuizQuestion } from '../types';
import { dayKey, shiftDay } from './days';
import { recordLesson, type Progress } from './progress';
import { sample } from './random';

export const ROUND = 10;
export const MODEL_TEST = 20;
/** boardScores keys for the model tests. */
export const modelKey = (exam: Exam) => `model-${exam}`;

/** The exam a learner is heading for: HSC from class 11 up, else SSC. */
export function examFor(classId: string | null | undefined): Exam {
  const level = findClassLevel(classId);
  return level?.stage === 'higher' || level?.id === 'university' ? 'hsc' : 'ssc';
}

/** Whether to show board preparation on the home page: classes 8 to 12. */
export function boardYears(classId: string | null | undefined): boolean {
  const n = Number(classId?.replace('class-', ''));
  return n >= 8 && n <= 12;
}

export const topicsFor = (topics: BoardTopic[], exam: Exam) => topics.filter((t) => t.exam.includes(exam));

/** A practice round: ROUND questions of one topic, in a new order each time. */
export const roundOf = (topic: BoardTopic): QuizQuestion[] => sample(topic.questions, ROUND);

/** A model test: MODEL_TEST questions spread over every topic of the exam. */
export function modelTest(topics: BoardTopic[], exam: Exam): QuizQuestion[] {
  const list = topicsFor(topics, exam);
  const each = Math.max(1, Math.ceil(MODEL_TEST / Math.max(1, list.length)));
  return sample(
    list.flatMap((t) => sample(t.questions, each)),
    MODEL_TEST,
  );
}

/** A finished round: the best score (0–100) is kept, and each right answer is worth 1 XP. */
export function applyBoardRound(p: Progress, key: string, right: number, total: number, seconds = 0, today = dayKey()): Progress {
  const score = Math.round((100 * right) / Math.max(1, total));
  const after = recordLesson(p, null, right, today, seconds);
  const day = p.boardDays?.[today] ?? { right: 0, total: 0 };
  return {
    ...after,
    boardScores: { ...(p.boardScores ?? {}), [key]: Math.max(p.boardScores?.[key] ?? 0, score) },
    boardDays: { ...(p.boardDays ?? {}), [today]: { right: day.right + right, total: day.total + total } },
  };
}

/** boardScores key of the daily round. */
export const dailyKey = (exam: Exam) => `daily-${exam}`;

/** The exam plan's daily round: ROUND questions mixed from every topic of the exam. */
export function dailyRound(topics: BoardTopic[], exam: Exam): QuizQuestion[] {
  const list = topicsFor(topics, exam);
  return sample(
    list.flatMap((t) => sample(t.questions, 2)),
    ROUND,
  );
}

/** Whether the learner did any board practice today. */
export const boardToday = (p: Progress, today = dayKey()) => (p.boardDays?.[today]?.total ?? 0) > 0;

/** The last `days` days' board scores (percent right, null when not practised), oldest first. */
export function boardTrend(p: Progress, days = 14, today = dayKey()): { day: string; percent: number | null }[] {
  return Array.from({ length: days }, (_, i) => {
    const day = shiftDay(today, i - days + 1);
    const d = p.boardDays?.[day];
    return { day, percent: d && d.total ? Math.round((100 * d.right) / d.total) : null };
  });
}
