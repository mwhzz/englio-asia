import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BUNDLED_COURSE } from '../src/data/course.ts';
import { BUNDLED_GRAMMAR } from '../src/data/grammar/index.ts';
import { createApi } from './app.ts';
import { openDb } from './db.ts';
import { seedBoard, seedCourse, seedCourses, seedGrammar, seedStories, seedUsers, seedWriting } from './seed.ts';
import { BUNDLED_WRITING } from '../src/data/writing/tasks.ts';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BUNDLED_BOARD } from '../src/data/board/index.ts';
import { validateBoard } from './adminBoard.ts';
import { BUNDLED_COURSES } from '../src/data/grammarCourses/index.ts';
import { BUNDLED_STORIES } from '../src/data/stories.ts';

const TOKEN = 'test-token';
let server: Server;
let base = '';

const call = async (method: string, path: string, body?: unknown, admin = false) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(admin ? { authorization: `Bearer ${TOKEN}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // Responses are loosely typed JSON; the assertions below check their shape.
  const json: any = res.status === 304 ? null : await res.json();
  return { status: res.status, json, etag: res.headers.get('etag') };
};
const admin = (method: string, path: string, body?: unknown) => call(method, path, body, true);

beforeAll(async () => {
  const db = openDb(':memory:');
  seedCourse(db);
  seedGrammar(db);
  seedCourses(db);
  seedStories(db);
  seedBoard(db);
  seedWriting(db);
  seedUsers(db, 5);
  server = createApi(db, TOKEN);
  await new Promise<void>((done) => server.listen(0, done));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((done) => server.close(() => done())));

describe('course', () => {
  it('reports the running version on /api/health, so a deploy can be checked', async () => {
    const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    expect((await call('GET', '/api/health')).json).toEqual({ ok: true, version });
  });

  it('lets the owner switch features off and lock units, and sends that to the app with the course', async () => {
    const before = await call('GET', '/api/course');
    expect(before.json.settings.features.hearts).toBe(true);
    expect(before.json.settings.lockedUnits).toEqual([]);

    expect((await call('GET', '/api/admin/settings')).status).toBe(401);
    const current = (await admin('GET', '/api/admin/settings')).json;
    expect(current).toHaveProperty('paymentsReady');
    const unit = before.json.units[2].id;
    expect((await admin('PUT', '/api/admin/settings', { ...current, lockedUnits: ['nope'] })).status).toBe(400);
    const saved = await admin('PUT', '/api/admin/settings', { features: { ...current.features, league: false }, lockedUnits: [unit], plus: { price: 149, days: 60 } });
    expect(saved.status).toBe(200);

    const after = await call('GET', '/api/course');
    expect(after.etag).not.toBe(before.etag);
    expect(after.json.settings).toEqual({ features: { ...current.features, league: false }, lockedUnits: [unit], plus: { price: 149, days: 60 } });
    expect((await call('GET', '/api/premium/info')).json).toMatchObject({ price: 149, days: 60 });
    // Put it back for the other tests.
    await admin('PUT', '/api/admin/settings', { features: current.features, lockedUnits: [], plus: current.plus });
  });

  it('adds a language empty and in draft, keeps its content apart, and only removes it when empty', async () => {
    expect((await admin('POST', '/api/admin/languages', { code: 'Arabic!', name: 'Arabic', native: 'العربية', dir: 'rtl' })).status).toBe(400);
    const added = await admin('POST', '/api/admin/languages', { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' });
    expect(added.json).toEqual({ code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl', status: 'draft' });
    expect((await admin('POST', '/api/admin/languages', { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' })).status).toBe(409);

    const unit = await admin('POST', '/api/admin/units', { lang: 'ar', title: 'First steps', titleBn: 'الخطوات الأولى', color: '#34c759' });
    expect(unit.json.id).toBe('ar-u1');
    expect((await admin('GET', '/api/admin/units?lang=ar')).json.map((u: { id: string }) => u.id)).toEqual(['ar-u1']);
    expect((await admin('GET', '/api/admin/units')).json.some((u: { id: string }) => u.id === 'ar-u1')).toBe(false);

    const ar = (await call('GET', '/api/course?lang=ar')).json;
    expect(ar.lang).toBe('ar');
    expect(ar.units.map((u: { id: string }) => u.id)).toEqual(['ar-u1']);
    expect(ar.board).toEqual([]);
    expect((await call('GET', '/api/course')).json.languages.map((l: { code: string }) => l.code)).toEqual(['bn']);
    expect((await call('GET', '/api/course?lang=xx')).status).toBe(404);

    const list = (await admin('GET', '/api/admin/languages')).json;
    expect(list.find((l: { code: string }) => l.code === 'ar')).toMatchObject({ units: 1, lessons: 0, status: 'draft' });
    expect((await admin('DELETE', '/api/admin/languages/ar')).status).toBe(409);
    expect((await admin('DELETE', '/api/admin/languages/bn')).status).toBe(400);
    await admin('DELETE', '/api/admin/units/ar-u1');
    expect((await admin('DELETE', '/api/admin/languages/ar')).status).toBe(200);
  });

  it('serves the seeded course in the same shape as the built-in one', async () => {
    const { status, json } = await call('GET', '/api/course');
    expect(status).toBe(200);
    expect(json.units.map((u: { id: string }) => u.id)).toEqual(BUNDLED_COURSE.map((u) => u.id));
    const lesson = json.units[0].lessons[0];
    expect(lesson.vocab).toEqual(BUNDLED_COURSE[0].lessons[0].vocab);
    expect(lesson.dialogs).toEqual(BUNDLED_COURSE[0].lessons[0].dialogs);
  });

  it('answers 304 when the course has not changed', async () => {
    const first = await call('GET', '/api/course');
    const res = await fetch(base + '/api/course', { headers: { 'if-none-match': first.etag! } });
    expect(res.status).toBe(304);
  });
});

describe('grammar', () => {
  it('serves the seeded topics with the course', async () => {
    const { json } = await call('GET', '/api/course');
    expect(json.grammar.map((t: { id: string }) => t.id)).toEqual(BUNDLED_GRAMMAR.map((t) => t.id));
    expect(json.grammar[0]).toEqual(BUNDLED_GRAMMAR[0]);
  });

  it('lets the admin add, edit, reorder and delete a topic', async () => {
    const topic = { ...BUNDLED_GRAMMAR[0], id: 'test-topic', title: 'Test topic' };
    expect((await admin('POST', '/api/admin/grammar', topic)).status).toBe(200);
    expect((await admin('POST', '/api/admin/grammar', topic)).status).toBe(409);
    await admin('PUT', '/api/admin/grammar/test-topic', { ...topic, title: 'Renamed' });
    await admin('POST', '/api/admin/grammar/test-topic/move', { dir: -1 });
    const list = (await admin('GET', '/api/admin/grammar')).json;
    expect(list[list.length - 2]).toEqual(expect.objectContaining({ id: 'test-topic', title: 'Renamed' }));
    await admin('DELETE', '/api/admin/grammar/test-topic');
    expect((await admin('GET', '/api/admin/grammar/test-topic')).status).toBe(404);
  });

  it('refuses topics the page could not show', async () => {
    const base = BUNDLED_GRAMMAR[0];
    const bad = [
      { ...base, id: 'Bad Id' },
      { ...base, id: 'x-1', level: 'expert' },
      { ...base, id: 'x-2', quiz: [] },
      { ...base, id: 'x-3', quiz: [{ question: 'Q', correct: 'a', wrong: ['a'], why: 'w' }] },
      { ...base, id: 'x-4', table: [['a', 'b'], ['c']] },
    ];
    for (const t of bad) expect((await admin('POST', '/api/admin/grammar', t)).status).toBe(400);
  });
});

describe('users', () => {
  it('saves and returns a learner’s progress', async () => {
    const progress = { profile: { name: 'Test', districtId: 'dhaka', classId: 'class-8', joinedAt: '2026-11-01' }, xp: 42, xpByDay: { '2026-11-01': 42 }, completed: { 'u1-l1': 1 } };
    expect((await call('PUT', '/api/users/test-user-1', { progress })).status).toBe(200);
    expect((await call('GET', '/api/users/test-user-1')).json.progress).toEqual(progress);
    const list = (await admin('GET', '/api/admin/users?q=Test')).json;
    expect(list).toEqual([expect.objectContaining({ id: 'test-user-1', xp: 42, lessonsDone: 1, districtId: 'dhaka' })]);
  });

  it('rejects bad ids', async () => {
    expect((await call('PUT', '/api/users/x', { progress: {} })).status).toBe(400);
  });
});

describe('admin', () => {
  it('needs the token', async () => {
    expect((await call('GET', '/api/admin/summary')).status).toBe(401);
    expect((await admin('GET', '/api/admin/summary')).json.users).toBe(6);
  });

  it('adds, edits and deletes content, and the course follows', async () => {
    const before = (await call('GET', '/api/course')).etag;
    const unit = (await admin('POST', '/api/admin/units', { title: 'Food', titleBn: 'খাবার', color: '#ff9500' })).json;
    const lesson = (await admin('POST', `/api/admin/units/${unit.id}/lessons`, { title: 'Rice', titleBn: 'ভাত' })).json;
    const item = (await admin('POST', `/api/admin/lessons/${lesson.id}/items`, { kind: 'vocab', data: { en: ' rice ', bn: 'ভাত' } })).json;
    await admin('PUT', `/api/admin/items/${item.id}`, { data: { en: 'rice', bn: 'চাল' } });

    const course = await call('GET', '/api/course');
    expect(course.etag).not.toBe(before);
    const added = course.json.units.find((u: { id: string }) => u.id === unit.id);
    expect(added.lessons[0].vocab).toEqual([{ en: 'rice', bn: 'চাল', emoji: '' }]);

    await admin('DELETE', `/api/admin/units/${unit.id}`);
    expect((await admin('GET', `/api/admin/lessons/${lesson.id}`)).status).toBe(404);
  });

  it('adds many items at once, or none when a row is wrong', async () => {
    const lessonId = (await call('GET', '/api/course')).json.units[0].lessons[0].id;
    const count = async () => (await admin('GET', `/api/admin/lessons/${lessonId}`)).json.items.filter((i: { kind: string }) => i.kind === 'vocab').length;
    const before = await count();
    const bad = await admin('POST', `/api/admin/lessons/${lessonId}/items/bulk`, { kind: 'vocab', rows: [{ en: 'pen', bn: 'কলম' }, { en: 'cup' }] });
    expect(bad.status).toBe(400);
    expect(bad.json.error).toContain('Row 2');
    expect(await count()).toBe(before);
    const ok = await admin('POST', `/api/admin/lessons/${lessonId}/items/bulk`, { kind: 'vocab', rows: [{ en: 'pen', bn: 'কলম' }, { en: 'cup', bn: 'কাপ' }] });
    expect(ok.json).toEqual({ added: 2 });
    expect(await count()).toBe(before + 2);
  });

  it('refuses content the app could not use', async () => {
    const bad = [
      { kind: 'fill', data: { text: 'No blank here', answer: 'a', options: ['a', 'b'], bn: 'x' } },
      { kind: 'gaps', data: { text: 'One ___ only', answers: ['a', 'b'], extra: [], bn: 'x' } },
      { kind: 'dialog', data: { with: 'A', lines: [{ who: 'you', en: 'Hi', bn: 'x' }, { who: 'them', en: 'Hi', bn: 'x' }], wrong: ['No'] } },
    ];
    for (const item of bad) expect((await admin('POST', '/api/admin/lessons/u1-l1/items', item)).status).toBe(400);
  });
});

describe('grammar courses and stories', () => {
  it('serve with the course', async () => {
    const { json } = await call('GET', '/api/course');
    expect(json.courses['parts-of-speech']).toEqual(JSON.parse(JSON.stringify(BUNDLED_COURSES['parts-of-speech'])));
    expect(json.stories.map((s: { id: string }) => s.id)).toEqual(BUNDLED_STORIES.map((s) => s.id));
  });

  it('lets the admin write a course of hand-written questions', async () => {
    const topic = (await call('GET', '/api/course')).json.grammar[1].id;
    const course = {
      units: [
        {
          title: 'Basics',
          titleBn: 'শুরু',
          lessons: [
            {
              id: 'basics-01',
              title: 'First',
              titleBn: 'প্রথম',
              teach: { points: ['একটা কথা।'], examples: [['I am.', 'আমি।']] },
              questions: [{ prompt: 'কোনটা ঠিক?', card: 'I was here.', mark: 'am', correct: 'am', wrong: ['is'], why: 'I-এর সাথে am।' }],
            },
          ],
        },
      ],
    };
    expect((await admin('PUT', `/api/admin/courses/${topic}`, course)).status).toBe(400); // the mark must be in the card
    course.units[0].lessons[0].questions[0].card = 'I am here.';
    expect((await admin('PUT', `/api/admin/courses/${topic}`, course)).json).toEqual({ ok: true, lessons: 1 });
    expect((await call('GET', '/api/course')).json.courses[topic].units[0].lessons[0].id).toBe('basics-01');

    const clash = structuredClone(course);
    clash.units[0].lessons[0].id = 'pos-01';
    expect((await admin('PUT', `/api/admin/courses/${topic}`, clash)).status).toBe(409);
    expect((await admin('DELETE', `/api/admin/courses/${topic}`)).status).toBe(200);
    expect((await call('GET', '/api/course')).json.courses[topic]).toBeUndefined();
  });

  it('lets the admin add, edit and remove a story', async () => {
    const story = { id: 'new-story', title: 'New', titleBn: 'নতুন', color: '#ff2d55', lines: [{ en: 'Hi.', bn: 'হাই।' }, { who: 'Rina', en: 'Hello.', bn: 'হ্যালো।' }], quiz: [{ question: 'কে?', correct: 'Rina', wrong: ['Mina'], why: 'Rina বলেছে।' }] };
    expect((await admin('POST', '/api/admin/stories', { ...story, lines: story.lines.slice(0, 1) })).status).toBe(400);
    expect((await admin('POST', '/api/admin/stories', story)).status).toBe(200);
    expect((await admin('PUT', '/api/admin/stories/new-story', { ...story, title: 'Renamed' })).status).toBe(200);
    expect((await call('GET', '/api/course')).json.stories.at(-1)).toEqual({ ...story, title: 'Renamed' });
    expect((await admin('POST', '/api/admin/stories/new-story/move', { dir: -1 })).status).toBe(200);
    expect((await call('GET', '/api/course')).json.stories.at(-2).id).toBe('new-story');
    expect((await admin('DELETE', '/api/admin/stories/new-story')).status).toBe(200);
    expect((await admin('GET', '/api/admin/stories')).json).toHaveLength(BUNDLED_STORIES.length);
  });
});

describe('deleting my data', () => {
  it('erases the learner and their reminder', async () => {
    const id = 'delete-me-0001';
    await call('PUT', `/api/users/${id}`, { progress: { profile: { name: 'Gone' }, completed: {} } });
    await call('PUT', `/api/users/${id}/push`, { subscription: { endpoint: 'https://push.example.com/x', keys: {} }, hour: 9 });
    expect((await call('DELETE', `/api/users/${id}`)).status).toBe(200);
    expect((await call('GET', `/api/users/${id}`)).status).toBe(404);
    expect((await call('DELETE', `/api/users/${id}`)).status).toBe(404);
  });
});

describe('board practice', () => {
  it('serves the built-in topics, every one valid for the admin too', async () => {
    const { json } = await call('GET', '/api/course');
    expect(json.board.map((t: { id: string }) => t.id)).toEqual(BUNDLED_BOARD.map((t) => t.id));
    for (const t of BUNDLED_BOARD) expect(validateBoard(t)).toEqual(t);
  });

  it('lets the admin add a topic, and refuses a broken one', async () => {
    const q = (n: number) => ({ question: `শূন্যস্থান পূরণ করো: Test ${n} ___.`, correct: 'a', wrong: ['b', 'c'], why: 'কারণ।' });
    const topic = { id: 'test-topic', exam: ['ssc'], title: 'Test', titleBn: 'টেস্ট', tip: 'মনে রাখো।', questions: [1, 2, 3, 4, 5].map(q) };
    expect((await admin('POST', '/api/admin/board', { ...topic, exam: [] })).status).toBe(400);
    expect((await admin('POST', '/api/admin/board', { ...topic, questions: [q(1)] })).status).toBe(400);
    expect((await admin('POST', '/api/admin/board', topic)).status).toBe(200);
    expect((await call('GET', '/api/course')).json.board.at(-1).id).toBe('test-topic');
    expect((await admin('DELETE', '/api/admin/board/test-topic')).status).toBe(200);
  });
});

describe('levels', () => {
  it('saves which levels a unit is for, sends them with the course, and rejects unknown ones', async () => {
    const unit = { title: 'SSC Writing', titleBn: 'এসএসসি লেখা', color: '#ff9500', tips: [], levels: ['higher', 'secondary'] };
    expect((await admin('POST', '/api/admin/units', { ...unit, levels: ['grade-9'] })).status).toBe(400);
    const { json } = await admin('POST', '/api/admin/units', unit);
    const listed = (await admin('GET', '/api/admin/units')).json.find((u: { id: string }) => u.id === json.id);
    expect(listed.levels).toEqual(['secondary', 'higher']);
    const course = (await call('GET', '/api/course')).json.units;
    expect(course.find((u: { id: string }) => u.id === json.id).levels).toEqual(['secondary', 'higher']);
    // Units for everyone are sent without levels, like the built-in course.
    expect(course[0]).not.toHaveProperty('levels');
    await admin('PUT', `/api/admin/units/${json.id}`, { ...unit, levels: [] });
    expect((await call('GET', '/api/course')).json.units.find((u: { id: string }) => u.id === json.id)).not.toHaveProperty('levels');
    await admin('DELETE', `/api/admin/units/${json.id}`);
  });

  it('adds the levels column to a database made before it', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'englio-')), 'old.db');
    const old = new DatabaseSync(file);
    old.exec(`CREATE TABLE units (id TEXT PRIMARY KEY, position INTEGER NOT NULL, title TEXT NOT NULL, title_bn TEXT NOT NULL, color TEXT NOT NULL, tips TEXT NOT NULL DEFAULT '[]')`);
    old.exec(`INSERT INTO units (id, position, title, title_bn, color) VALUES ('u1', 0, 'Old', 'পুরনো', '#000000')`);
    old.close();
    const db = openDb(file);
    expect(db.prepare(`SELECT levels FROM units WHERE id = 'u1'`).get()).toEqual({ levels: '[]' });
    db.close();
  });
});

describe('writing practice', () => {
  const task = { ...BUNDLED_WRITING[0], id: 'test-task', title: 'Test task' };

  it('serves the seeded tasks with the course', async () => {
    const { json } = await call('GET', '/api/course');
    expect(json.writing.map((t: { id: string }) => t.id)).toEqual(BUNDLED_WRITING.map((t) => t.id));
  });

  it('checks a task before saving it', async () => {
    expect((await admin('POST', '/api/admin/writing', { ...task, kind: 'poem' })).status).toBe(400);
    expect((await admin('POST', '/api/admin/writing', { ...task, hints: [] })).status).toBe(400);
    expect((await admin('POST', '/api/admin/writing', { ...task, model: ' ' })).status).toBe(400);
    expect((await admin('POST', '/api/admin/writing', { ...task, minWords: 0 })).status).toBe(400);
    expect((await admin('POST', '/api/admin/writing', { ...task, levels: ['class-9'] })).status).toBe(400);
  });

  it('lets the admin add, edit, reorder and delete a task', async () => {
    expect((await admin('POST', '/api/admin/writing', task)).status).toBe(200);
    expect((await admin('POST', '/api/admin/writing', task)).status).toBe(409);
    await admin('PUT', '/api/admin/writing/test-task', { ...task, title: 'Renamed', levels: ['higher', 'primary'] });
    expect((await admin('GET', '/api/admin/writing/test-task')).json).toEqual(expect.objectContaining({ title: 'Renamed', levels: ['primary', 'higher'] }));
    await admin('POST', '/api/admin/writing/test-task/move', { dir: -1 });
    const list = (await admin('GET', '/api/admin/writing')).json;
    expect(list[list.length - 2].id).toBe('test-task');
    expect((await call('GET', '/api/course')).json.writing.some((t: { id: string }) => t.id === 'test-task')).toBe(true);
    await admin('DELETE', '/api/admin/writing/test-task');
    expect((await admin('GET', '/api/admin/writing/test-task')).status).toBe(404);
  });

  it('is admin only', async () => {
    expect((await call('POST', '/api/admin/writing', task)).status).toBe(401);
  });
});

describe('content plan', () => {
  it('counts the content for each level and lists what is missing', async () => {
    const { status, json } = await admin('GET', '/api/admin/coverage');
    expect(status).toBe(200);
    const lessons = BUNDLED_COURSE.reduce((n, u) => n + u.lessons.length, 0);
    // The built-in units are for everyone, so every level sees all of them.
    expect(json.levels.map((l: { level: string }) => l.level)).toEqual(['primary', 'secondary', 'higher', 'university', 'other']);
    for (const l of json.levels) expect(l).toEqual(expect.objectContaining({ lessons, ownLessons: 0 }));
    expect(json.levels[0].writing).toBe(BUNDLED_WRITING.filter((t) => t.levels.includes('primary')).length);
    expect(json.grammar.topics).toBe(BUNDLED_GRAMMAR.length);
    expect(json.grammar.missingCourse.length).toBe(json.grammar.topics - json.grammar.withCourse);
    expect(json.targets.lessons).toBeGreaterThan(0);
  });
});
