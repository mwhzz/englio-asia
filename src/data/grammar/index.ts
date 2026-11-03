import type { GrammarLevel, GrammarTopic } from '../../types';
import { ADVANCED } from './advanced.ts';
import { BEGINNER } from './beginner.ts';
import { INTERMEDIATE } from './intermediate.ts';

/** The built-in grammar topics: the fallback when the server can't be reached, and the server's seed data. */
export const BUNDLED_GRAMMAR: GrammarTopic[] = [...BEGINNER, ...INTERMEDIATE, ...ADVANCED];

/** The topics the app is showing: the server's copy once loaded, else the built-in ones. */
export let GRAMMAR: GrammarTopic[] = globalThis.englioServerContent?.grammar ?? BUNDLED_GRAMMAR;

/** Switches to another copy of the topics (tests; the app sets englioServerContent in main.tsx). */
export function setGrammar(topics: GrammarTopic[]): void {
  GRAMMAR = topics;
}

export const LEVELS: { id: GrammarLevel; bn: string; en: string; color: string }[] = [
  { id: 'beginner', bn: 'শুরু', en: 'Beginner', color: '#34c759' },
  { id: 'intermediate', bn: 'মাঝারি', en: 'Intermediate', color: '#007aff' },
  { id: 'advanced', bn: 'উচ্চতর', en: 'Advanced', color: '#af52de' },
];

export const levelOf = (id: GrammarLevel) => LEVELS.find((l) => l.id === id)!;
