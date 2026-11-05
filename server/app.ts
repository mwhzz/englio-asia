import { createServer, type Server } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import * as content from './adminContent.ts';
import * as courses from './adminCourses.ts';
import * as grammar from './adminGrammar.ts';
import * as stories from './adminStories.ts';
import * as people from './adminUsers.ts';
import * as board from './adminBoard.ts';
import * as writing from './adminWriting.ts';
import { coverage } from './coverage.ts';
import { readBoard, readCourse, readCourses, readGrammar, readStories, readWriting } from './course.ts';
import { contentVersion } from './db.ts';
import { FileReply, HttpError, matchPath, readBody, readJson, Redirect, send, type Route } from './http.ts';
import { clientIp, MINUTE, RateLimit } from './rateLimit.ts';
import { clearError, listErrors, recordError } from './errors.ts';
import { addReport, closeReports, listReports } from './reports.ts';
import { analytics, recordEvents } from './events.ts';
import { accountsOf, signInGoogle, startPhone, verifyPhone } from './auth.ts';
import { addFriend, friendsLeague, removeFriend } from './friends.ts';
import { callback, checkout, premiumInfo, premiumOf } from './premium.ts';
import { clearLeaderboardCache, leaderboard } from './leaderboard.ts';
import { MAX_UPLOAD, readMedia, saveMedia } from './media.ts';
import { deletePush, savePush } from './reminders.ts';
import { backupCode, deleteByCode, restore } from './restoreCodes.ts';
import * as team from './team.ts';
import { checkUserId, loadProgress, saveProgress } from './users.ts';

/** Every API route. Admin routes need `Authorization: Bearer <ADMIN_TOKEN>`. */
function routes(db: DatabaseSync): Route[] {
  return [
    { method: 'GET', pattern: '/api/health', handler: () => ({ ok: true }) },

    // ---- The app ----
    {
      method: 'GET',
      pattern: '/api/course',
      handler: () => ({
        version: contentVersion(db),
        units: readCourse(db),
        grammar: readGrammar(db),
        courses: readCourses(db),
        stories: readStories(db),
        board: readBoard(db),
        writing: readWriting(db),
      }),
    },
    {
      method: 'PUT',
      pattern: '/api/users/:id',
      handler: ({ params, body }) => {
        // The answer is the merged progress, which the app takes (another phone may have added to it).
        return { ok: true, progress: saveProgress(db, checkUserId(params.id), (body as { progress?: unknown } | null)?.progress) };
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
    { method: 'POST', pattern: '/api/auth/phone/start', strict: true, handler: (r) => startPhone(db, r) },
    { method: 'POST', pattern: '/api/auth/phone/verify', strict: true, handler: (r) => verifyPhone(db, r) },
    { method: 'POST', pattern: '/api/auth/google', strict: true, handler: (r) => signInGoogle(db, r) },
    { method: 'GET', pattern: '/api/users/:id/accounts', handler: (r) => accountsOf(db, { ...r, params: { id: checkUserId(r.params.id) } }) },
    { method: 'GET', pattern: '/api/premium/info', handler: () => premiumInfo() },
    { method: 'GET', pattern: '/api/premium/callback', handler: (r) => callback(db, r) },
    { method: 'GET', pattern: '/api/users/:id/premium', handler: ({ params }) => premiumOf(db, checkUserId(params.id)) },
    { method: 'POST', pattern: '/api/users/:id/premium/checkout', strict: true, handler: (r) => checkout(db, { ...r, params: { id: checkUserId(r.params.id) } }) },
    { method: 'GET', pattern: '/api/users/:id/friends', handler: (r) => friendsLeague(db, { ...r, params: { id: checkUserId(r.params.id) } }) },
    { method: 'POST', pattern: '/api/users/:id/friends', strict: true, handler: (r) => addFriend(db, { ...r, params: { id: checkUserId(r.params.id) } }) },
    { method: 'DELETE', pattern: '/api/users/:id/friends/:code', handler: (r) => removeFriend(db, { ...r, params: { ...r.params, id: checkUserId(r.params.id) } }) },
    { method: 'POST', pattern: '/api/users/:id/code', handler: ({ params }) => ({ code: backupCode(db, checkUserId(params.id)) }) },
    { method: 'POST', pattern: '/api/restore', strict: true, handler: ({ body }) => restore(db, body) },
    { method: 'POST', pattern: '/api/delete-by-code', strict: true, handler: ({ body }) => deleteByCode(db, body) },
    { method: 'POST', pattern: '/api/errors', handler: (r) => recordError(db, r) },
    { method: 'POST', pattern: '/api/reports', handler: (r) => addReport(db, r) },
    { method: 'GET', pattern: '/api/admin/reports', admin: true, handler: () => listReports(db) },
    { method: 'POST', pattern: '/api/admin/reports/close', admin: true, handler: (r) => closeReports(db, r) },
    { method: 'GET', pattern: '/api/admin/errors', admin: true, handler: () => listErrors(db) },
    { method: 'DELETE', pattern: '/api/admin/errors/:id', admin: true, handler: (r) => clearError(db, r) },
    { method: 'GET', pattern: '/api/media/:file', handler: (r) => readMedia(r) },
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
    { method: 'GET', pattern: '/api/admin/me', admin: true, handler: ({ admin }) => admin },
    { method: 'GET', pattern: '/api/admin/team', admin: 'owner', handler: () => team.listTeam(db) },
    { method: 'POST', pattern: '/api/admin/team', admin: 'owner', handler: (r) => team.addMember(db, r) },
    { method: 'DELETE', pattern: '/api/admin/team/:id', admin: 'owner', handler: (r) => team.removeMember(db, r) },
    { method: 'GET', pattern: '/api/admin/activity', admin: 'owner', handler: (r) => team.activity(db, r) },
    { method: 'POST', pattern: '/api/admin/media', admin: true, raw: MAX_UPLOAD, handler: (r) => saveMedia(r) },
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
    { method: 'POST', pattern: '/api/admin/lessons/:id/items/bulk', admin: true, handler: (r) => content.createItems(db, r) },
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
    { method: 'GET', pattern: '/api/admin/board', admin: true, handler: () => board.listBoard(db) },
    { method: 'POST', pattern: '/api/admin/board', admin: true, handler: (r) => board.createBoard(db, r) },
    { method: 'GET', pattern: '/api/admin/board/:id', admin: true, handler: (r) => board.getBoard(db, r) },
    { method: 'PUT', pattern: '/api/admin/board/:id', admin: true, handler: (r) => board.updateBoard(db, r) },
    { method: 'DELETE', pattern: '/api/admin/board/:id', admin: true, handler: (r) => board.deleteBoard(db, r) },
    { method: 'POST', pattern: '/api/admin/board/:id/move', admin: true, handler: (r) => board.moveBoard(db, r) },
    { method: 'GET', pattern: '/api/admin/coverage', admin: true, handler: () => coverage(db) },
    { method: 'GET', pattern: '/api/admin/writing', admin: true, handler: () => writing.listWriting(db) },
    { method: 'POST', pattern: '/api/admin/writing', admin: true, handler: (r) => writing.createWriting(db, r) },
    { method: 'GET', pattern: '/api/admin/writing/:id', admin: true, handler: (r) => writing.getWriting(db, r) },
    { method: 'PUT', pattern: '/api/admin/writing/:id', admin: true, handler: (r) => writing.updateWriting(db, r) },
    { method: 'DELETE', pattern: '/api/admin/writing/:id', admin: true, handler: (r) => writing.deleteWriting(db, r) },
    { method: 'POST', pattern: '/api/admin/writing/:id/move', admin: true, handler: (r) => writing.moveWriting(db, r) },
    { method: 'GET', pattern: '/api/admin/stories', admin: true, handler: () => stories.listStories(db) },
    { method: 'POST', pattern: '/api/admin/stories', admin: true, handler: (r) => stories.createStory(db, r) },
    { method: 'GET', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.getStory(db, r) },
    { method: 'PUT', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.updateStory(db, r) },
    { method: 'DELETE', pattern: '/api/admin/stories/:id', admin: true, handler: (r) => stories.deleteStory(db, r) },
    { method: 'POST', pattern: '/api/admin/stories/:id/move', admin: true, handler: (r) => stories.moveStory(db, r) },
    { method: 'GET', pattern: '/api/admin/users', admin: 'owner', handler: (r) => people.listUsers(db, r) },
    { method: 'GET', pattern: '/api/admin/users/:id', admin: 'owner', handler: (r) => people.getUser(db, r) },
    { method: 'DELETE', pattern: '/api/admin/users/:id', admin: 'owner', handler: (r) => people.deleteUser(db, r) },
  ];
}

/** Per address: a normal app makes a few requests a minute; backup codes and wrong admin tokens get few tries. */
type Limits = Record<'all' | 'strict' | 'badToken', [max: number, windowMs: number]>;
export const LIMITS: Limits = { all: [300, 5 * MINUTE], strict: [10, 15 * MINUTE], badToken: [20, 15 * MINUTE] };

/** The HTTP server: JSON in, JSON out, CORS open so the app can be hosted anywhere. */
export function createApi(db: DatabaseSync, adminToken: string, limits: Limits = LIMITS): Server {
  const table = routes(db);
  const all = new RateLimit(...limits.all);
  const strict = new RateLimit(...limits.strict);
  const badToken = new RateLimit(...limits.badToken);

  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, undefined);
      const url = new URL(req.url ?? '/', 'http://localhost');
      let params: Record<string, string> | null = null;
      const route = table.find((r) => r.method === req.method && (params = matchPath(r.pattern, url.pathname)));
      if (!route || !params) throw new HttpError(404, 'Not found');
      const ip = clientIp(req);
      if (!all.take(ip) || (route.strict && !strict.take(ip))) throw new HttpError(429, 'Too many requests, try again later');
      const admin = route.admin ? team.adminOf(db, req.headers.authorization, adminToken) : null;
      if (route.admin && !admin) {
        if (!badToken.take(ip)) throw new HttpError(429, 'Too many wrong tokens, try again later');
        throw new HttpError(401, 'Admin token needed');
      }
      if (route.admin === 'owner' && admin?.role !== 'owner') throw new HttpError(403, 'Only the owner can do this');

      // The course only changes when the admin edits it, so apps can ask "has it changed?" cheaply.
      if (url.pathname === '/api/course') {
        const etag = `"course-${contentVersion(db)}"`;
        if (req.headers['if-none-match'] === etag) return send(res, 304, undefined, { etag });
        return send(res, 200, route.handler({ method: 'GET', path: url.pathname, query: url.searchParams, params, headers: req.headers, body: null }), {
          etag,
          'cache-control': 'no-cache',
        });
      }

      const body = req.method === 'GET' || req.method === 'DELETE' ? null : route.raw ? await readBody(req, route.raw) : await readJson(req);
      // Every admin change is written down (who, what, and whether it worked).
      const log = (status: number) => admin && req.method !== 'GET' && team.logChange(db, admin, req.method!, url.pathname, status);
      try {
        const result = await route.handler({ method: req.method!, path: url.pathname, query: url.searchParams, params, headers: req.headers, body, admin: admin ?? undefined });
        log(200);
        // A learner was removed: the league shouldn't show them for its next 5 minutes.
        if ((req.method === 'DELETE' && /\/users\/[^/]+$/.test(url.pathname)) || url.pathname === '/api/delete-by-code') clearLeaderboardCache();
        if (result instanceof Redirect) {
          res.writeHead(302, { location: result.location });
          return res.end();
        }
        if (result instanceof FileReply) {
          res.writeHead(200, { 'content-type': result.type, 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' });
          return res.end(result.data);
        }
        send(res, 200, result);
      } catch (error) {
        log(error instanceof HttpError ? error.status : 500);
        throw error;
      }
    } catch (error) {
      if (error instanceof HttpError) return send(res, error.status, { error: error.message });
      console.error(error);
      send(res, 500, { error: 'Server error' });
    }
  });
}
