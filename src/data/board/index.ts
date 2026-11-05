import { ARTICLES } from './articles.ts';
import { PREPOSITIONS } from './prepositions.ts';
import { RIGHT_FORM_OF_VERBS } from './rightFormOfVerbs.ts';
import { SUBJECT_VERB_AGREEMENT } from './subjectVerbAgreement.ts';
import { MODALS } from './modals.ts';
import { TAG_QUESTIONS } from './tagQuestions.ts';
import { CONNECTORS } from './connectors.ts';
import { SUFFIX_PREFIX } from './suffixPrefix.ts';
import { SYNONYMS_ANTONYMS } from './synonymsAntonyms.ts';
import { VOICE } from './voice.ts';
import { NARRATION } from './narration.ts';
import { DEGREE_OF_COMPARISON } from './degreeOfComparison.ts';
import { AFFIRMATIVE_NEGATIVE } from './affirmativeNegative.ts';
import { TRANSFORMATION_SENTENCES } from './transformationSentences.ts';
import { COMPLETING_SENTENCES } from './completingSentences.ts';
import type { BoardTopic } from './types.ts';

/** The built-in SSC/HSC board practice topics (the server's copy replaces them once loaded). */
export const BUNDLED_BOARD: BoardTopic[] = [
  ARTICLES,
  PREPOSITIONS,
  RIGHT_FORM_OF_VERBS,
  SUBJECT_VERB_AGREEMENT,
  MODALS,
  TAG_QUESTIONS,
  CONNECTORS,
  SUFFIX_PREFIX,
  SYNONYMS_ANTONYMS,
  VOICE,
  NARRATION,
  DEGREE_OF_COMPARISON,
  AFFIRMATIVE_NEGATIVE,
  TRANSFORMATION_SENTENCES,
  COMPLETING_SENTENCES,
];

/** The topics the app shows: the server's copy (set at startup, see data/serverContent.d.ts), else the built-in ones. */
export const BOARD: BoardTopic[] = globalThis.englioServerContent?.board ?? BUNDLED_BOARD;
