/** The eight parts of speech. */
export type Pos = 'n' | 'pro' | 'v' | 'adj' | 'adv' | 'prep' | 'conj' | 'int';

/** The kinds of question a course lesson can ask (see features/grammar/course/makeQuestions.ts). */
export type QuestionKind =
  /** "Is 'book' a noun?" (yes / no) */
  | 'is'
  /** "Which part of speech is 'quickly'?" */
  | 'which'
  /** "Tap the noun in this sentence." */
  | 'tap'
  /** "Is 'Dhaka' a proper or a common noun?" */
  | 'nounKind'
  /** "Rina is kind. ___ helps everyone." */
  | 'pronounFill'
  /** "She sings ___ (sweet / sweetly / sweetness)." */
  | 'formFill'
  /** "I was tired, ___ I went to bed." */
  | 'conjFill'
  /** "In 'He runs fast', what is 'fast'?" (the same word doing different jobs) */
  | 'dual';

/** A question the admin writes by hand: works for any topic, not just parts of speech. */
export interface WrittenQuestion {
  prompt: string;
  /** The word or sentence the question is about (optional). */
  card?: string;
  /** A word in the card to underline. */
  mark?: string;
  correct: string;
  wrong: string[];
  why: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  titleBn: string;
  /** The "learn it" screen: short points in Bangla and a few examples. */
  teach: { points: string[]; examples: [en: string, bn: string][] };
  /** The parts of speech this lesson is about (for generated questions). */
  focus?: Pos[];
  /** Generated question kinds, used in turn. */
  kinds?: QuestionKind[];
  /** Hand-written questions, asked first; generated ones (if any) fill up the rest. */
  questions?: WrittenQuestion[];
  /** Questions in the lesson (default 10). */
  size?: number;
}

export interface CourseUnit {
  title: string;
  titleBn: string;
  lessons: CourseLesson[];
}

/** A step-by-step course for one grammar topic. */
export interface GrammarCourse {
  topicId: string;
  units: CourseUnit[];
}
