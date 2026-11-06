import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readCourse, readGrammar } from './course.ts';
import { openDb } from './db.ts';
import { importLanguage, type LanguageFile } from './importLanguage.ts';
import { listLanguages } from './languages.ts';
import { seedCourse } from './seed.ts';
import { setCourse } from '../src/data/course.ts';
import { grade } from '../src/lib/grade.ts';
import { buildLesson } from '../src/lib/lesson.ts';
import type { Exercise } from '../src/types.ts';

const ARABIC = JSON.parse(readFileSync(new URL('../content/ar-starter.json', import.meta.url), 'utf8')) as LanguageFile;

describe('importing a language', () => {
  it('adds the Arabic starter course in draft, apart from Bangla, and only once', () => {
    const db = openDb(':memory:');
    seedCourse(db);
    const bangla = readCourse(db).length;

    expect(importLanguage(db, ARABIC)).toEqual({ language: 'ar', units: 3, lessons: 6, items: 86, grammar: 3, stories: 0, writing: 0 });
    const ar = listLanguages(db).find((l) => l.code === 'ar')!;
    expect(ar).toMatchObject({ status: 'draft', dir: 'rtl', units: 3, lessons: 6 });
    expect(ar.translated).toBe(ar.items);

    const units = readCourse(db, 'ar');
    expect(units.map((u) => u.id)).toEqual(['ar-u1', 'ar-u2', 'ar-u3']);
    expect(units[0].lessons[0]).toMatchObject({ id: 'ar-u1-l1', title: 'Greetings', titleBn: 'التحيات' });
    expect(readGrammar(db, 'ar').map((t) => t.id)).toEqual(['ar-be-verbs', 'ar-articles', 'ar-personal-pronouns']);
    expect(readCourse(db)).toHaveLength(bangla);

    expect(() => importLanguage(db, ARABIC)).toThrow('already has content');
  });

  it('adds nothing when anything in the file is wrong', () => {
    const db = openDb(':memory:');
    const broken: LanguageFile = JSON.parse(JSON.stringify(ARABIC));
    broken.units[1].lessons[0].fills = [{ text: 'No blank here.', answer: 'x', options: ['x', 'y'], bn: 'خطأ' }];
    expect(() => importLanguage(db, broken)).toThrow('Unit 2, lesson 1, fills 1');
    expect(listLanguages(db).map((l) => l.code)).toEqual(['bn']);
  });

  it('makes Arabic lessons whose every question can be answered', () => {
    const db = openDb(':memory:');
    importLanguage(db, ARABIC);
    const units = readCourse(db, 'ar');
    setCourse(units);
    const right = (ex: Exercise): string | null => {
      switch (ex.kind) {
        case 'select':
          return ex.word.en;
        case 'translate':
        case 'listen':
        case 'type':
        case 'dictate':
          return ex.sentence.en;
        case 'choice':
          return ex.sentence.bn;
        case 'fill':
          return ex.fill.answer;
        case 'gaps':
          return ex.gaps.answers.join('|');
        case 'grammar':
          return ex.grammar.correct;
        case 'dialog':
          return ex.dialog.lines[ex.dialog.reply].en;
        default:
          return null; // matching pairs and speaking are checked elsewhere
      }
    };
    for (const lesson of units.flatMap((u) => u.lessons))
      for (let run = 0; run < 30; run++)
        for (const ex of buildLesson(lesson.id)) {
          const answer = right(ex);
          if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
        }
  });
});
