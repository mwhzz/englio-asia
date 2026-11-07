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

/** The right answer to an exercise as the learner would give it (null: checked elsewhere). */
const solve = (ex: Exercise): string | null => {
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
    const right = solve;
    for (const lesson of units.flatMap((u) => u.lessons))
      for (let run = 0; run < 30; run++)
        for (const ex of buildLesson(lesson.id)) {
          const answer = right(ex);
          if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
        }
  });
});

describe('exporting a language', () => {
  it('gives a file the importer takes back as another language', async () => {
    const { createApi } = await import('./app.ts');
    const db = openDb(':memory:');
    importLanguage(db, ARABIC);
    const server = createApi(db, 't');
    await new Promise<void>((done) => server.listen(0, done));
    const port = (server.address() as import('node:net').AddressInfo).port;
    const file = (await (await fetch(`http://localhost:${port}/api/admin/export/content?lang=ar`, { headers: { authorization: 'Bearer t' } })).json()) as typeof ARABIC;
    await new Promise<void>((done) => server.close(() => done()));
    expect(file.units).toHaveLength(3);
    const copy = { ...file, language: { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' as const } };
    expect(importLanguage(db, copy)).toMatchObject({ language: 'ur', units: 3, lessons: 6, items: 86, grammar: 3 });
  });
});

describe('Bangla batch 01 (units 12–21, A1+ to A2)', () => {
  const BATCH = JSON.parse(readFileSync(new URL('../content/bn-batch-01.json', import.meta.url), 'utf8'));

  it('passes the admin checks and comes in as drafts, hidden from learners', async () => {
    const { seedCourse } = await import('./seed.ts');
    const { importMore } = await import('./importLanguage.ts');
    const db = openDb(':memory:');
    seedCourse(db);
    const before = readCourse(db, 'bn', { drafts: false }).flatMap((u) => u.lessons).length;
    const added = importMore(db, { body: { ...BATCH, lang: 'bn' } });
    expect(added).toMatchObject({ units: 10, lessons: 40 });
    expect(readCourse(db, 'bn', { drafts: false }).flatMap((u) => u.lessons).length).toBe(before);
    expect(readCourse(db, 'bn').flatMap((u) => u.lessons).length).toBe(before + 40);
  });

  it('every question in it can be answered', () => {
    const db = openDb(':memory:');
    importLanguage(db, { ...BATCH, language: { code: 'xb', name: 'Batch', native: 'Batch', dir: 'ltr' } });
    setCourse(readCourse(db, 'xb'));
    for (const unit of readCourse(db, 'xb'))
      for (const lesson of unit.lessons)
        for (let run = 0; run < 20; run++)
          for (const ex of buildLesson(lesson.id)) {
            const answer = solve(ex);
            if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
          }
  });
});

describe('Arabic batch 01 (units 4–11, A1 to A2)', () => {
  const BATCH = JSON.parse(readFileSync(new URL('../content/ar-batch-01.json', import.meta.url), 'utf8'));

  it('comes after the Arabic starter, as drafts, and every question in it can be answered', async () => {
    const { importMore } = await import('./importLanguage.ts');
    const db = openDb(':memory:');
    importLanguage(db, ARABIC);
    expect(importMore(db, { body: { ...BATCH, lang: 'ar' } })).toMatchObject({ units: 8, lessons: 32 });
    const units = readCourse(db, 'ar');
    expect(units).toHaveLength(11);
    setCourse(units);
    for (const lesson of units.slice(3).flatMap((u) => u.lessons))
      for (let run = 0; run < 10; run++)
        for (const ex of buildLesson(lesson.id)) {
          const answer = solve(ex);
          if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
        }
  });
});

describe('every new unit is complete (docs/SYLLABUS.md)', () => {
  // A unit: words 1, words 2, grammar, conversation (and the unit test the app builds from them), tips.
  for (const file of ['ar-batch-01.json', 'bn-batch-01.json', 'bn-ar-batch-01.json']) {
    it(file, () => {
      const { units } = JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8')) as LanguageFile;
      for (const u of units) {
        expect(u.lessons.length, `${u.title}: 4 lessons`).toBeGreaterThanOrEqual(4);
        expect(u.tips?.length ?? 0, `${u.title}: tips`).toBeGreaterThanOrEqual(2);
        const all = u.lessons;
        expect(all.flatMap((l) => l.vocab ?? []).length, `${u.title}: words`).toBeGreaterThanOrEqual(16);
        expect(all.flatMap((l) => l.grammar ?? []).length, `${u.title}: grammar`).toBeGreaterThanOrEqual(1);
        expect(all.flatMap((l) => l.dialogs ?? []).length, `${u.title}: conversation`).toBeGreaterThanOrEqual(1);
        expect(all.flatMap((l) => l.gaps ?? []).length, `${u.title}: gap text`).toBeGreaterThanOrEqual(1);
      }
    });
  }
});

describe('Arabic starter, completed (lessons 3–4 added to units 1–3)', () => {
  it('adds the lessons to the existing units, and every question can be answered', async () => {
    const { importMore } = await import('./importLanguage.ts');
    const MORE = JSON.parse(readFileSync(new URL('../content/ar-starter-more.json', import.meta.url), 'utf8'));
    const db = openDb(':memory:');
    importLanguage(db, ARABIC);
    expect(importMore(db, { body: { ...MORE, lang: 'ar' } })).toMatchObject({ lessons: 6 });
    const units = readCourse(db, 'ar');
    expect(units.map((u) => u.lessons.length)).toEqual([4, 4, 4]);
    setCourse(units);
    for (const lesson of units.flatMap((u) => u.lessons))
      for (let run = 0; run < 10; run++)
        for (const ex of buildLesson(lesson.id)) {
          const answer = solve(ex);
          if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
        }
  });
});

describe('Arabic for Bangla speakers (course bn-ar), batch 01', () => {
  it('is a course that teaches Arabic, and every question can be answered (Arabic answers too)', async () => {
    const { setTarget } = await import('../src/lib/target.ts');
    const FILE = JSON.parse(readFileSync(new URL('../content/bn-ar-batch-01.json', import.meta.url), 'utf8')) as LanguageFile;
    const db = openDb(':memory:');
    expect(importLanguage(db, FILE)).toMatchObject({ language: 'bn-ar', units: 6, lessons: 24 });
    expect(listLanguages(db).find((l) => l.code === 'bn-ar')).toMatchObject({ target: 'ar', status: 'draft' });
    const units = readCourse(db, 'bn-ar');
    expect(units[0].id).toMatch(/^bn-ar-/);
    setCourse(units);
    setTarget('ar');
    try {
      for (const lesson of units.flatMap((u) => u.lessons))
        for (let run = 0; run < 10; run++)
          for (const ex of buildLesson(lesson.id)) {
            const answer = solve(ex);
            if (answer !== null) expect(grade(ex, answer).result, `${lesson.id} ${ex.kind}`).toBe('correct');
          }
    } finally {
      setTarget('en');
    }
  });

  it('an Arabic answer counts without its vowel marks', async () => {
    const { compare } = await import('../src/lib/answer.ts');
    expect(compare('مرحبا', ['مَرْحَبًا'], true)).toBe('correct');
    expect(compare('أنا من بنغلاديش', ['انا من بنغلاديش'], false)).toBe('correct');
    expect(compare('أنا طالب', ['أنا من بنغلاديش'], true)).toBe('wrong');
  });
});
