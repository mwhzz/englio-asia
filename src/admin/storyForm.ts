import type { Story } from '../types';
import { slug } from './topicForm';

/** A story as plain text fields: one line of the story per line, and one question per line. */
export interface StoryFields {
  id: string;
  title: string;
  titleBn: string;
  color: string;
  /** "English | বাংলা" per line, or "Speaker | English | বাংলা" for something said. */
  lines: string;
  /** "question | right answer | wrong 1; wrong 2 | why" per line. */
  quiz: string;
}

export const EMPTY_STORY: StoryFields = { id: '', title: '', titleBn: '', color: '#34c759', lines: '', quiz: '' };

const rows = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split('|').map((c) => c.trim()));

export function storyToFields(s: Story): StoryFields {
  return {
    id: s.id,
    title: s.title,
    titleBn: s.titleBn,
    color: s.color,
    lines: s.lines.map((l) => [l.who, l.en, l.bn].filter((x) => x !== undefined).join(' | ')).join('\n'),
    quiz: s.quiz.map((q) => `${q.question} | ${q.correct} | ${q.wrong.join('; ')} | ${q.why}`).join('\n'),
  };
}

/** The story the server expects; the server checks it and says what's missing. */
export function fieldsToStory(f: StoryFields): Story {
  return {
    id: f.id.trim() || slug(f.title),
    title: f.title.trim(),
    titleBn: f.titleBn.trim(),
    color: f.color,
    lines: rows(f.lines).map((c) => (c.length >= 3 ? { who: c[0], en: c[1], bn: c[2] } : { en: c[0], bn: c[1] ?? '' })),
    quiz: rows(f.quiz).map(([question, correct, wrong = '', why = '']) => ({
      question,
      correct,
      wrong: wrong.split(';').map((w) => w.trim()).filter(Boolean),
      why,
    })),
  };
}
