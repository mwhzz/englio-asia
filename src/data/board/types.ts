import type { QuizQuestion } from '../../types';

export type Exam = 'ssc' | 'hsc';

/** One board-exam topic with its practice questions. */
export interface BoardTopic {
  id: string;
  /** Which exams ask this topic. */
  exam: Exam[];
  title: string;
  titleBn: string;
  /** One short Bangla tip: the rule to remember. */
  tip: string;
  questions: QuizQuestion[];
}
