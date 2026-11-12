import { ALL_LESSONS } from '../data/course';
import { normalize } from './answer';

// Word meanings for the lesson being played: every word taught up to this lesson can be tapped to see
// its meaning, and this lesson's new words are highlighted (docs/LEARNING_DESIGN.md). Set by the lesson
// runner when a lesson starts; a review or unit test uses everything taught, with nothing marked new.

export interface Gloss {
  /** Normalised word or phrase → its meaning (in Bangla). */
  meanings: Map<string, string>;
  /** The lesson's new words (normalised). */
  fresh: Set<string>;
  /** The longest phrase, in words. */
  longest: number;
}

const EMPTY: Gloss = { meanings: new Map(), fresh: new Set(), longest: 0 };
let current: Gloss = EMPTY;

/** Builds the gloss for a lesson (or, with no lesson, for the whole course, nothing new). */
export function glossFor(lessonId: string | null, markNew = true): Gloss {
  const index = lessonId ? ALL_LESSONS.findIndex((x) => x.lesson.id === lessonId) : ALL_LESSONS.length - 1;
  if (index < 0) return EMPTY;
  const meanings = new Map<string, string>();
  let longest = 0;
  for (const { lesson } of ALL_LESSONS.slice(0, index + 1))
    for (const v of lesson.vocab) {
      const key = normalize(v.en);
      if (!key) continue;
      meanings.set(key, v.bn);
      longest = Math.max(longest, key.split(' ').length);
    }
  const fresh = new Set(lessonId && markNew ? ALL_LESSONS[index].lesson.vocab.map((v) => normalize(v.en)) : []);
  return { meanings, fresh, longest };
}

/** markNew false: a unit test, where nothing is new. */
export function setGloss(lessonId: string | null, markNew = true): void {
  current = glossFor(lessonId, markNew);
}

export const gloss = (): Gloss => current;

export interface GlossPart {
  text: string;
  /** Its meaning, when it's a taught word or phrase. */
  meaning?: string;
  /** A new word of this lesson. */
  fresh?: boolean;
}

/** Arabic "and" (و) or "the" (ال) written in front of a taught word still shows that word's meaning. */
function lookup(g: Gloss, key: string): { key: string; meaning: string } | null {
  for (const k of [key, key.replace(/^و/, ''), key.replace(/^(و)?ال/, '')]) {
    const meaning = g.meanings.get(k);
    if (k && meaning) return { key: k, meaning };
  }
  return null;
}

/** Splits a text into words (with their meanings where known) and the spaces and marks between them. */
export function glossParts(text: string, g: Gloss = current): GlossPart[] {
  const pieces = text.split(/(\s+)/);
  const out: GlossPart[] = [];
  for (let i = 0; i < pieces.length; ) {
    let matched = false;
    // Longest taught phrase first ("good morning" before "good"), over words and the spaces between them.
    for (let n = Math.min(g.longest, Math.ceil((pieces.length - i) / 2)); n >= 1 && !matched; n--) {
      const span = pieces.slice(i, i + 2 * n - 1);
      if (span.length < 2 * n - 1 || /^\s*$/.test(span[0])) continue;
      const found = lookup(g, normalize(span.join('')));
      if (found) {
        out.push({ text: span.join(''), meaning: found.meaning, fresh: g.fresh.has(found.key) });
        i += 2 * n - 1;
        matched = true;
      }
    }
    if (!matched) out.push({ text: pieces[i++] });
  }
  return out.filter((p) => p.text);
}
