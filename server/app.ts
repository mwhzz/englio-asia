import { createServer, type Server } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import * as content from './adminContent.ts';
import * as courses from './adminCourses.ts';
import * as grammar from './adminGrammar.ts';
import * as stories from './adminStories.ts';
import * as people from './adminUsers.ts';
import { readCourse, readCourses, readGrammar, readStories } from './course.ts';
import { contentVersion } from './db.ts';
import { HttpError, matchPath, readJson, send, type Route } from './http.ts';
import { analytics, recordEvents } from './events.ts';
import { leaderboard } from './leaderboard.ts';
import { deletePush, savePush } from './reminders.ts';
import { checkUserId, loadProgress, saveProgress } from './users.ts';

/** Every API route. Admin routes need `Authorization: Bearer <ADMIN_TOKEN>`. */
function routes(db: DatabaseSync): Route[] {
  return [
    { method: 'GET', pattern: '/api/health', handler: () => ({ ok: true }) },

    // ---- The app ----
    {
      method: 'GET',
      pattern: '/api/course',
      handler: () => ({ version: contentVersion(db), units: readCourse(db), grammar: readGrammar(db), courses: readCourses(db), stories: readStories(db) }),
    },
    {
      method: 'PUT',
      pattern: '/api/users/:id',
      handler: ({ params, body }) => {
        saveProgress(db, checkUserId(params.id), (body as { progress?: unknown } | null)?.progress);
        return { ok: true };
      },
    },
    { method: 'GET', pattern: '/api/users/:id', handler: ({ params }) => ({ progress: loadProgress(db, checkUserId(params.id)) }) },
    // A learner erasing themselves (the device id is the only key to the data).
    {
      method: 'DELETE',
      pattern: '/api/users/:id',
      handler: ({ params }) => {
        if (!db.prepare('DELETE FROM users WHERE id = ?').run(checkUserId(params.id)).changes) throw new HttpError(404, 'No such user');
        return { ok: true };
      },
    },
    { method: 'POST', pattern: '/api/events', handler: ({ body }) => recordEvents(db, body) },
    {
      method: 'GET',
      pattern: '/api/leaderboard',
      handler: ({ query }) => leaderboard(db, query.get('district'), query.get('me')),
    },
    {
      method: 'PUT',
      pattern: '/api/users/:id/push',
      handler: ({ params, body }) => {
        loadProgress(db, checkUserId(params.id));
        savePush(db, params.id, body);
        return { ok: true };
      },
    },
    {
      method: 'DELETE',
      pattern: '/api/users/:id/push',
      handler: ({ params }) => {
        deletePush(db, checkUserId(params.id));
        return { ok: true };
      },
    },

    // ---- Admin ----
    { method: 'GET', pattern: '/api/admin/summary', admin: true, handler: () => people.summary(db) },
    { method: 'GET', pattern: '/api/admin/analytics', admin: true, handler: ({ query }) => analytics(db, Math.min(365, Math.max(1, Number(query.get('days')) || 30))) },
    { method: 'GET', pattern: '/api/admin/units', admin: true, handler: () => content.listUnits(db) },
    { method: 'POST', pattern: '/api/admin/units', admin: true, handler: (r) => content.createUnit(db, r) },
    { method: 'PUT', pattern: '/api/admin/units/:id', admin: true, handler: (r) => content.updateUnit(db, r) },
    { method: 'DELETE', pattern: '/api/admin/units/:id', admin: true, handler: (r) => content.deleteUnit(db, r) },
    { method: 'POST', pattern: '/api/admin/units/:id/move', admin: true, handler: (r) => content.moveRow(db, 'units', r) },
    { method: 'POST', pattern: '/api/admin/units/:id/lessons', admin: true, handler: (r) => content.createLesson(db, r) },
    { method: 'GET', pattern: '/api/admin/lessons/:id', admin: true, handler: (r) => content.getLesson(db, r) },
    { method: 'PUT', pattern: '/api/admin/lessons/:id', admin: true, handler: (r) => content.updateLesson(db, r) },
    { method: 'DELETE', pattern: '/api/admin/lessons/:id', admin: true, handler: (r) => content.deleteLesson(db, r) },
    { method: 'POST', pattern: '/api/admin/lessons/:id/move', admin: true, handler: (r) => content.moveRow(db, 'lessons', r) },
    { method: 'POST', pattern: '/api/admin/lessons/:id/items', admin: true, handler: (r) => content.createItem(db, r) },
    { method: 'PUT', pattern: '/api/admin/items/:id', admin: true, handler: (r) => content.updateItem(db, r) },
    { method: 'DELETE', pattern: '/api/admin/items/:id', admin: true, handler: (r) => content.deleteItem(db, r) },
    { method: 'GET', pattern: '/api/admin/grammar', admin: true, handler: () => grammar.listTopics(db) },
    { method: 'POST', pattern: '/api/admin/grammar', admin: true, handler: (r) => grammar.createTopic(db, r) },
    { method: 'GET', pattern: '/api/admin/grammar/:id', admin: true, handler: (r) => grammar.getTopic(db, r) },
    { method: 'PUT', pattern: '/api/admin/grammar/:id', admin: true, handler: (r) => grammar.updateTopic(db, r) },
    { method: 'DELETE', pattern: '/api/admin/grammar/:id', admin: true, handler: (r) => grammar.deleteTopic(db, r) },
    { method: 'POST', pattern: '/api/admin/grammar/:id/move', admin: true, handler: (r) => grammar.moveTopic(db, r) },
    { method: 'GET', pattern: '/api/admin/courses/:id', admin: true, handler: (r) => courses.getCourse(db, r) },
    { method: 'PUT', pattern: '/api/admin/courses/:id', admin: true, handler: (r) => courses.saveCourse(db, r) },
    { method: 'DELETE', pattern: '/api/admin/courses/:id', admin: true, handler: (r) => courses.deleteCourse(db, r) },
    { method: 'GET', pattern: '/api/admin/stories', admin: true, handler: () => stories.listStories(db) },
    { method: 'POST', pattern: '/api/admin/stories', admin: true, handler: (r) => stories.createStory(db, r) },
    { method: 'GET', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.getStory(db, r) },
    { method: 'PUT', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.updateStory(db, r) },
    { method: 'DELETE', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.deleteStory(db, r) },
    { method: 'POST', pattern: '/api/admin/stories/:id/move', admin: true, handler: (r) => stories.moveStory(db, r) },
    { method: 'GET', pattern: '/api/admin/users', admin: true, handler: (r) => people.listUsers(db, r) },
    { method: 'GET', pattern: '/api/admin/users/:id', admin: true, handler: (r) => people.getUser(db, r) },
    { method: 'DELETE', pattern: '/api/admin/users/:id', admin: true, handler: (r) => people.deleteUser(db, r) },
  ];
}

/** The HTTP server: JSON in, JSON out, CORS open so the app can be hosted anywhere. */
export function createApi(db: DatabaseSync, adminToken: string): Server {
  const table = routes(db);

  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, undefined);
      const url = new URL(req.url ?? '/', 'http://localhost');
      let params: Record<string, string> | null = null;
      const route = table.find((r) => r.method === req.method && (params = matchPath(r.pattern, url.pathname)));
      if (!route || !params) throw new HttpError(404, 'Not found');
      if (route.admin && req.headers.authorization !== `Bearer ${adminToken}`) throw new HttpError(401, 'Admin token needed');

      // The course only changes when the admin edits it, so apps can ask "has it changed?" cheaply.
      if (url.pathname === '/api/course') {
        const etag = `"course-${contentVersion(db)}"`;
        if (req.headers['if-none-match'] === etag) return send(res, 304, undefined, { etag });
        return send(res, 200, route.handler({ method: 'GET', path: url.pathname, query: url.searchParams, params, headers: req.headers, body: null }), {
          etag,
          'cache-control': 'no-cache',
        });
      }

      const body = req.method === 'GET' || req.method === 'DELETE' ? null : await readJson(req);
      const result = route.handler({ method: req.method!, path: url.pathname, query: url.searchParams, params, headers: req.headers, body });
      send(res, 200, result);
    } catch (error) {
      if (error instanceof HttpError) return send(res, error.status, { error: error.message });
      console.error(error);
      send(res, 500, { error: 'Server error' });
    }
  });
}
