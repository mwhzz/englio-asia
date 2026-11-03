import { describe, expect, it } from 'vitest';
import { COURSES, lessonsOf } from '../../../data/grammarCourses';
import { DUALS, parseSentence, SENTENCES, WORDS } from '../../../data/grammarCourses/posBank';
import { makeQuestions } from './makeQuestions';

const course = COURSES['parts-of-speech'];
const lessons = lessonsOf(course);

describe('parts of speech course', () => {
  it('has 35 lessons with unique ids', () => {
    expect(lessons).toHaveLength(35);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(35);
  });

  it('has a clean word bank and tagged sentences', () => {
    const words = WORDS.map(([w]) => w);
    expect(new Set(words).size).toBe(words.length);
    for (const s of SENTENCES) expect(parseSentence(s).some((w) => w.pos)).toBe(true);
    for (const [sentence, word] of DUALS) expect(sentence).toContain(word);
  });

  it.each(lessons.map((l, i) => [l.id, i] as const))('%s always makes solvable, non-repeating questions', (_, i) => {
    const lesson = lessons[i];
    for (let run = 0; run < 40; run++) {
      const qs = makeQuestions(lesson, lessons.slice(0, i));
      expect(qs).toHaveLength(lesson.size ?? 10);
      const keys = qs.map((q) => (q.kind === 'tap' ? q.words.map((w) => w.word).join(' ') + q.target : q.prompt + q.card + q.mark));
      expect(new Set(keys).size).toBe(keys.length);
      for (const q of qs) {
        if (q.kind === 'tap') {
          expect(q.words.some((w) => w.pos === q.target)).toBe(true);
        } else {
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          if (q.mark) expect(q.card).toContain(q.mark);
        }
        expect(q.why.length).toBeGreaterThan(5);
      }
    }
  });

  it('brings back earlier parts of speech in later lessons', () => {
    const verbLesson = lessons.findIndex((l) => l.focus?.length === 1 && l.focus[0] === 'v');
    const qs = makeQuestions(lessons[verbLesson], lessons.slice(0, verbLesson));
    const targets = qs.map((q) => (q.kind === 'tap' ? q.target : q.answer));
    expect(targets.some((t) => t === 'n' || t === 'pro' || /Noun|Pronoun/.test(t))).toBe(true);
  });
});

describe('hand-written course questions', () => {
  const q = (n: number) => ({ prompt: `Question ${n}?`, card: `card ${n}`, correct: `right ${n}`, wrong: [`wrong ${n}`], why: `because ${n}` });
  const first = { id: 't-1', title: 'One', titleBn: 'এক', teach: { points: [], examples: [] }, questions: [q(1), q(2)] };
  const second = { id: 't-2', title: 'Two', titleBn: 'দুই', teach: { points: [], examples: [] }, questions: [q(3), q(4), q(5)] };

  it('asks every written question first, then two from earlier lessons', () => {
    const qs = makeQuestions(second, [first]);
    expect(qs).toHaveLength(5);
    expect(qs[0].kind === 'choice' && qs[0].prompt).toBe('Question 3?');
    const prompts = qs.map((x) => (x.kind === 'choice' ? x.prompt : ''));
    expect(prompts).toEqual(expect.arrayContaining(['Question 3?', 'Question 4?', 'Question 5?', 'Question 1?', 'Question 2?']));
    for (const x of qs) if (x.kind === 'choice') expect(x.options).toContain(x.answer);
  });

  it('makes nothing from an empty lesson', () => {
    expect(makeQuestions({ ...first, questions: [] }, [])).toEqual([]);
  });
});
