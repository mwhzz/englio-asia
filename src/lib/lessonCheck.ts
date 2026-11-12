import { normalizeArabic } from './target';

// docs/LEARNING_DESIGN.md as checks: nothing comes in a lesson before it was taught (in that lesson or an
// earlier one; in Arabic every letter too), about 5 new words a lesson, and each word met 15+ times in its
// unit. Used by the tests (server/taughtFirst.test.ts) and by the admin's lesson check panel.

export interface CheckLesson {
  id?: string;
  title: string;
  vocab: { en: string; bn: string }[];
  sentences?: { en: string }[];
  fills?: { text: string; answer: string }[];
  gaps?: { text: string; answers: string[] }[];
  grammar?: { correct: string }[];
  dialogs?: { lines: { en: string }[] }[];
}
export interface CheckUnit {
  title: string;
  lessons: CheckLesson[];
}

const arabic = (t: string) => /[؀-ۿ]/.test(t);
export const tokens = (t: string) =>
  (arabic(t) ? normalizeArabic(t) : t.toLowerCase().replace(/[^a-z0-9' ]+/g, ' '))
    .split(/\s+/)
    .filter(Boolean);

/** The learning-language text a lesson shows as right (wrong options are mistakes, so left out). */
export const shown = (l: CheckLesson) => [
  ...(l.sentences ?? []).map((s) => s.en),
  ...(l.fills ?? []).map((f) => f.text.replace('___', f.answer)),
  ...(l.gaps ?? []).map((g) => g.answers.reduce((t, a) => t.replace('___', a), g.text)),
  ...(l.grammar ?? []).map((g) => g.correct),
  ...(l.dialogs ?? []).flatMap((d) => d.lines.map((x) => x.en)),
];

/**
 * Words (and Arabic letters) used before they were taught, lesson by lesson in course order, as
 * "Unit / Lesson: word "x"". `free` words count as known from the start (e.g. "I", "is" in English A1).
 */
export function untaught(units: CheckUnit[], free: Iterable<string> = []): string[] {
  const words = new Set<string>(free);
  const letters = new Set<string>();
  const problems: string[] = [];
  // A word is known when taught, or when it's وَ ("and") or ال ("the") in front of a known word, once taught.
  const known = (w: string): boolean =>
    words.has(w) || (w.startsWith('و') && words.has('و') && known(w.slice(1))) || (w.startsWith('ال') && words.has('ال') && known(w.slice(2)));
  for (const u of units)
    for (const l of u.lessons) {
      for (const v of l.vocab) {
        tokens(v.en).forEach((w) => words.add(w));
        // An Arabic letter lesson teaches its letters (a single letter, or a letter with its marks).
        if (arabic(v.en) && [...normalizeArabic(v.en)].length <= 2) [...normalizeArabic(v.en)].forEach((c) => letters.add(c));
      }
      if (l.vocab.some((v) => v.en.startsWith('اَلْ') || v.en.startsWith('ال'))) words.add('ال');
      const where = `${u.title} / ${l.title}`;
      for (const text of shown(l)) {
        for (const w of tokens(text)) if (!known(w)) problems.push(`${where}: word "${w}"`);
        if (arabic(text)) for (const c of normalizeArabic(text).replace(/\s/g, '')) if (!letters.has(c)) problems.push(`${where}: letter "${c}"`);
      }
    }
  return [...new Set(problems)];
}

export interface LessonReport {
  /** New words in the lesson (5 is the rule). */
  words: number;
  /** Each new word: how often its text shows in this lesson's own sentences, and in its whole unit. */
  exposure: { en: string; inLesson: number; inUnit: number }[];
  /** This lesson's words or letters not taught yet. */
  untaught: string[];
}

const count = (texts: string[], word: string) => {
  const w = tokens(word).join(' ');
  return texts.reduce((n, t) => n + (` ${tokens(t).join(' ')} `.split(` ${w} `).length - 1), 0);
};

/** The admin's check for one lesson, against the whole course in order. */
export function checkLesson(units: CheckUnit[], lessonId: string, free: Iterable<string> = []): LessonReport | null {
  const unit = units.find((u) => u.lessons.some((l) => l.id === lessonId));
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  if (!unit || !lesson) return null;
  const upTo = units.slice(0, units.indexOf(unit)).concat({ ...unit, lessons: unit.lessons.slice(0, unit.lessons.indexOf(lesson) + 1) });
  const prefix = `${unit.title} / ${lesson.title}: `;
  const unitTexts = unit.lessons.flatMap(shown);
  return {
    words: lesson.vocab.length,
    exposure: lesson.vocab.map((v) => ({ en: v.en, inLesson: count(shown(lesson), v.en), inUnit: count(unitTexts, v.en) })),
    untaught: untaught(upTo, free)
      .filter((p) => p.startsWith(prefix))
      .map((p) => p.slice(prefix.length)),
  };
}
