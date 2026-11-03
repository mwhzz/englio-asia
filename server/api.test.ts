import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BUNDLED_COURSE } from '../src/data/course.ts';
import { BUNDLED_GRAMMAR } from '../src/data/grammar/index.ts';
import { createApi } from './app.ts';
import { openDb } from './db.ts';
import { seedCourse, seedCourses, seedGrammar, seedStories, seedUsers } from './seed.ts';
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
  seedUsers(db, 5);
  server = createApi(db, TOKEN);
  await new Promise<void>((done) => server.listen(0, done));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((done) => server.close(() => done())));

describe('course', () => {
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
    const progress = { profile: { name: 'Test', districtId: 'dhaka', classId: 'class-8', joinedAt: '2026-11-01' }, xp: 42, completed: { 'u1-l1': 1 } };
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
