export interface Vocab {
  en: string;
  bn: string;
  emoji: string;
}

export interface Sentence {
  en: string;
  bn: string;
  /** Other English answers that are also accepted. */
  alt: string[];
}

/** A fill-in-the-blank sentence; `text` contains exactly one `___`. */
export interface Fill {
  text: string;
  answer: string;
  options: string[];
  bn: string;
}

/** One or two sentences with several blanks, filled from a shared word bank. */
export interface Gaps {
  /** The text, with `___` for each blank. */
  text: string;
  /** The word for each blank, in order. */
  answers: string[];
  /** Wrong words mixed into the bank. */
  extra: string[];
  bn: string;
}

/** A grammar point: a short rule in Bangla, then "which sentence is correct?". */
export interface Grammar {
  rule: string;
  correct: string;
  wrong: string[];
  /** Why the correct sentence is right, shown after checking (Bangla). */
  why: string;
}

/** One line of a conversation; "you" is the learner. */
export interface DialogLine {
  who: 'them' | 'you';
  en: string;
  bn: string;
}

/** A short conversation; the learner picks what to say on the `reply` line. */
export interface Dialog {
  /** The other person's name. */
  with: string;
  lines: DialogLine[];
  /** Index of the learner's line to pick (its `who` is "you"). */
  reply: number;
  /** Wrong replies offered next to the right one. */
  wrong: string[];
}

/** One letter of the alphabet, with how it sounds and words that start with it. */
export interface Letter {
  upper: string;
  lower: string;
  /** The letter's name in Bangla script, e.g. "এ" for A. */
  nameBn: string;
  /** The sound it usually makes, in Bangla script, e.g. "অ্যা". */
  soundBn: string;
  vowel: boolean;
  words: { en: string; bn: string }[];
}

export type GrammarLevel = 'beginner' | 'intermediate' | 'advanced';

/** A grammar topic for the grammar page. Bangla text may contain English words (see MixedText). */
export interface GrammarTopic {
  id: string;
  level: GrammarLevel;
  title: string;
  titleBn: string;
  /** One line under the title in the list (Bangla). */
  summary: string;
  /** The explanation, one paragraph per item (Bangla). */
  explain: string[];
  /** Sentence patterns, e.g. { label: 'হ্যাঁ-বোধক', parts: ['Subject', 'Verb (s/es)', 'Object'] }. */
  formulas: { label: string; parts: string[] }[];
  /** An optional table (first row is the header), e.g. the forms of a verb. */
  table?: string[][];
  examples: { en: string; bn: string }[];
  mistakes: { wrong: string; right: string; note: string }[];
  quiz: QuizQuestion[];
}

/** A quiz question used by grammar topics and stories. */
export interface QuizQuestion {
  question: string;
  correct: string;
  wrong: string[];
  /** Why the answer is right (Bangla), shown after answering. */
  why: string;
}

/** A short story read line by line, then a few questions about it. */
export interface Story {
  id: string;
  title: string;
  titleBn: string;
  color: string;
  /** `who` names the speaker for spoken lines. */
  lines: { who?: string; en: string; bn: string }[];
  quiz: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  titleBn: string;
  vocab: Vocab[];
  sentences: Sentence[];
  fills: Fill[];
  gaps?: Gaps[];
  grammar?: Grammar[];
  dialogs?: Dialog[];
}

export interface Tip {
  title: string;
  body: string;
  examples: string[];
}

export interface Unit {
  id: string;
  title: string;
  titleBn: string;
  color: string;
  tips: Tip[];
  lessons: Lesson[];
}

export type ExerciseBody =
  | { kind: 'select'; word: Vocab; choices: Vocab[] }
  | { kind: 'match'; pairs: Vocab[] }
  | { kind: 'translate'; sentence: Sentence; tiles: string[] }
  | { kind: 'listen'; sentence: Sentence; tiles: string[] }
  | { kind: 'choice'; sentence: Sentence; options: string[] }
  | { kind: 'type'; sentence: Sentence }
  | { kind: 'fill'; fill: Fill }
  | { kind: 'gaps'; gaps: Gaps; bank: string[] }
  | { kind: 'grammar'; grammar: Grammar; options: string[] }
  | { kind: 'dialog'; dialog: Dialog; options: string[] }
  | { kind: 'dictate'; sentence: Sentence }
  | { kind: 'speak'; sentence: Sentence };

export type Exercise = ExerciseBody & { id: string };

export type ExerciseOf<K extends Exercise['kind']> = Extract<Exercise, { kind: K }>;

export interface Grade {
  result: 'correct' | 'typo' | 'wrong';
  solution: string;
}
