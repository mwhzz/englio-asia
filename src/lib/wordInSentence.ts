import type { Fill, Sentence, Vocab } from '../types';
import { sample } from './random';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A "put the word in the sentence" exercise for a new word, made from a lesson sentence that uses it:
 * "Our house is ___." with the word and two other words of the unit to choose from, and the Bangla
 * sentence as the hint. null when no sentence uses the word (or only as its first word, where the
 * capital letter would give the answer away), or there aren't two other words to offer.
 */
export function wordInSentence(word: Vocab, sentences: Sentence[], pool: Vocab[]): Fill | null {
  if (/\s/.test(word.en)) return null;
  const pattern = new RegExp(`(?<=\\s)${escape(word.en)}(?=[\\s.,!?]|$)`, 'i');
  for (const sentence of sentences) {
    const match = pattern.exec(sentence.en);
    if (!match) continue;
    const answer = match[0];
    const inSentence = new Set(sentence.en.toLowerCase().split(/[\s.,!?]+/));
    const others = pool
      .map((w) => w.en)
      .filter((en, i, all) => !/\s/.test(en) && all.indexOf(en) === i && en.toLowerCase() !== answer.toLowerCase() && !inSentence.has(en.toLowerCase()));
    if (others.length < 2) return null;
    // Same capitalisation as the answer, so the case doesn't give it away.
    const wrong = sample(others, 2).map((en) => (answer[0] === answer[0].toLowerCase() ? en.toLowerCase() : en));
    return {
      text: sentence.en.slice(0, match.index) + '___' + sentence.en.slice(match.index + answer.length),
      answer,
      options: [answer, ...wrong],
      bn: sentence.bn,
    };
  }
  return null;
}
