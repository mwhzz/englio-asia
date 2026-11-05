import type { Level } from '../../types';

export type WritingKind = 'paragraph' | 'letter' | 'application' | 'email' | 'composition' | 'story' | 'dialogue' | 'report';

/** A writing task: the learner writes their own answer, then compares it with a model answer. */
export interface WritingTask {
  id: string;
  kind: WritingKind;
  /** Who it's for (empty means everyone). */
  levels: Level[];
  title: string;
  titleBn: string;
  /** The task as an exam would set it (English). */
  prompt: string;
  /** Points to cover, shown as a checklist (Bangla or English). */
  hints: string[];
  /** Useful words and phrases; the app marks the ones the learner used. */
  phrases: string[];
  /** The model answer; a blank line starts a new paragraph. */
  model: string;
  /** About how many words a good answer has. */
  minWords: number;
}
