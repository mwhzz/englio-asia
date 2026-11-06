import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import * as content from './adminContent.ts';
import { openDb } from './db.ts';
import * as grammar from './adminGrammar.ts';
import type { Request } from './http.ts';
import { createLanguage, listLanguages } from './languages.ts';
import { validateItem } from './validate.ts';
import { validateTopic } from './validateTopic.ts';
import { validateStory } from './validateStory.ts';
import * as stories from './adminStories.ts';
import * as writing from './adminWriting.ts';

// `node server/importLanguage.ts <file.json>`: adds a starter course for one learner language (units with their
// lessons and items, and grammar topics) from a JSON file, through the same checks as the admin. Everything is
// checked first and nothing is added if anything is wrong; a language that already has content is refused, so
// a file is never added twice. The language is created (in draft) if it doesn't exist yet. The file:
//   { "language": { code, name, native, dir }, "units": [{ title, titleBn, color, tips, lessons: [{ title, titleBn,
//     vocab, sentences, fills, gaps, grammar, dialogs }] }], "grammar": [ GrammarTopic … ],
//     "stories": [ Story … ], "writing": [ WritingTask … ] }
// (titleBn / bn fields hold the meaning in that language.)

interface LessonIn {
  title: string;
  titleBn: string;
  vocab?: unknown[];
  sentences?: unknown[];
  fills?: unknown[];
  gaps?: unknown[];
  grammar?: unknown[];
  dialogs?: unknown[];
}
interface UnitIn {
  title: string;
  titleBn: string;
  color: string;
  tips?: unknown[];
  lessons: LessonIn[];
}
export interface LanguageFile {
  language: { code: string; name: string; native: string; dir: 'ltr' | 'rtl' };
  units: UnitIn[];
  grammar?: unknown[];
  /** Short stories and writing tasks, as the admin's story and writing editors save them. */
  stories?: unknown[];
  writing?: unknown[];
}

const KINDS = [
  ['vocab', 'vocab'],
  ['sentences', 'sentence'],
  ['fills', 'fill'],
  ['gaps', 'gaps'],
  ['grammar', 'grammar'],
  ['dialogs', 'dialog'],
] as const;

const req = (parts: Partial<Request>) => ({ params: {}, query: new URLSearchParams(), ...parts }) as Request;

/** Adds the file's content; returns what was added. Throws (adding nothing) when anything is wrong. */
export function importLanguage(db: DatabaseSync, file: LanguageFile) {
  const { code } = file.language;
  // 1. Check everything before adding anything.
  file.units.forEach((u, ui) => {
    if (!u.title || !u.titleBn || !u.lessons?.length) throw new Error(`Unit ${ui + 1} needs a title, its meaning and lessons`);
    u.lessons.forEach((l, li) => {
      if (!l.title || !l.titleBn) throw new Error(`Unit ${ui + 1}, lesson ${li + 1} needs a title and its meaning`);
      for (const [field, kind] of KINDS)
        (l[field] ?? []).forEach((item, i) => {
          try {
            validateItem(kind, item);
          } catch (error) {
            throw new Error(`Unit ${ui + 1}, lesson ${li + 1}, ${field} ${i + 1}: ${(error as Error).message}`);
          }
        });
    });
  });
  (file.grammar ?? []).forEach((t, i) => {
    try {
      validateTopic(t);
    } catch (error) {
      throw new Error(`Grammar topic ${i + 1}: ${(error as Error).message}`);
    }
  });
  (file.stories ?? []).forEach((t, i) => {
    try {
      validateStory(t);
    } catch (error) {
      throw new Error(`Story ${i + 1}: ${(error as Error).message}`);
    }
  });
  (file.writing ?? []).forEach((t, i) => {
    try {
      writing.validateWriting(t);
    } catch (error) {
      throw new Error(`Writing task ${i + 1}: ${(error as Error).message}`);
    }
  });
  const existing = listLanguages(db).find((l) => l.code === code);
  if (existing && existing.units + existing.grammar + existing.stories + existing.writing > 0) throw new Error(`"${code}" already has content; nothing was added`);

  // 2. Add it, through the admin's own functions (same ids, positions and checks).
  if (!existing) createLanguage(db, req({ body: file.language }));
  let lessons = 0;
  let items = 0;
  for (const u of file.units) {
    const { id: unitId } = content.createUnit(db, req({ body: { ...u, lang: code } }));
    for (const l of u.lessons) {
      const { id: lessonId } = content.createLesson(db, req({ params: { id: unitId }, body: { title: l.title, titleBn: l.titleBn } }));
      lessons++;
      for (const [field, kind] of KINDS)
        for (const data of l[field] ?? []) {
          content.createItem(db, req({ params: { id: lessonId }, body: { kind, data } }));
          items++;
        }
    }
  }
  for (const t of file.grammar ?? []) grammar.createTopic(db, req({ body: { ...(t as object), lang: code } }));
  for (const t of file.stories ?? []) stories.createStory(db, req({ body: { ...(t as object), lang: code } }));
  for (const t of file.writing ?? []) writing.createWriting(db, req({ body: { ...(t as object), lang: code } }));
  return { language: code, units: file.units.length, lessons, items, grammar: (file.grammar ?? []).length, stories: (file.stories ?? []).length, writing: (file.writing ?? []).length };
}

// Run directly (not when the tests import it).
if (process.argv[1]?.endsWith('importLanguage.ts')) {
  const path = process.argv[2];
  if (!path) {
    console.error('usage: node server/importLanguage.ts <file.json>');
    process.exit(1);
  }
  try {
    console.log('Added', importLanguage(openDb(), JSON.parse(readFileSync(path, 'utf8')) as LanguageFile));
  } catch (error) {
    console.error('Nothing was added:', (error as Error).message);
    process.exit(1);
  }
}
