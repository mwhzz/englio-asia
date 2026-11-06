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
import { addReport, bulkTickets, closeReports, exportTickets, listReports, listTickets, myReports, updateTicket } from './reports.ts';
import { analytics, recordEvents } from './events.ts';
import { accountsOf, signInGoogle, startPhone, verifyPhone } from './auth.ts';
import { addFriend, friendsLeague, removeFriend } from './friends.ts';
import { callback, checkout, paymentsReady, premiumInfo, premiumOf } from './premium.ts';
import { clearLeaderboardCache, leaderboard } from './leaderboard.ts';
import { MAX_UPLOAD, readMedia, saveMedia } from './media.ts';
import { deletePush, savePush } from './reminders.ts';
import { backupCode, deleteByCode, restore } from './restoreCodes.ts';
import * as team from './team.ts';
import { checkUserId, clientOf, loadProgress, saveProgress } from './users.ts';
import { health } from './health.ts';
import { stats } from './stats.ts';
import { draftIds, listHistory, restoreHistory, setDraft, snapshotFor } from './history.ts';
import { readSettings, saveSettings } from './settings.ts';
import { deleteClip, listSpoken, listWords, readClips, setClip } from './adminAudio.ts';
import { createLanguage, deleteLanguage, isLive, langOf, listLanguages, liveLanguages, updateLanguage } from './languages.ts';

/** What learners get: no drafts. */
const PUBLIC = { drafts: false };

/** Every API route. Admin routes need `Authorization: Bearer <ADMIN_TOKEN>`. */
function routes(db: DatabaseSync): Route[] {
  return [
    // For uptime monitors: also checks that the database answers (a 500 means it doesn't).
    { method: 'GET', pattern: '/api/health', handler: () => health(db) },

    // ---- The app ----
    {
      method: 'GET',
      pattern: '/api/course',
      // ?lang= picks the learner's language (Bangla when missing, as older apps don't send it).
      handler: ({ query }) => {
        const lang = langOf(db, query.get('lang'));
        // Draft languages are only for the admin, not the public course.
        if (!isLive(db, lang)) throw new HttpError(404, `No language "${lang}"`);
        return {
          version: contentVersion(db),
          lang,
          languages: liveLanguages(db),
          units: readCourse(db, lang, PUBLIC),
          grammar: readGrammar(db, lang, PUBLIC),
          courses: readCourses(db, lang, PUBLIC),
          stories: readStories(db, lang, PUBLIC),
          // SSC/HSC board practice is for Bangladesh only.
          board: lang === 'bn' ? readBoard(db) : [],
          writing: readWriting(db, lang),
          settings: readSettings(db),
          // Recordings by English text (adminAudio.ts), played instead of the phone's voice.
          audio: readClips(db),
        };
      },
    },
    {
      method: 'PUT',
      pattern: '/api/users/:id',
      handler: ({ params, body, headers }) => {
        // The answer is the merged progress, which the app takes (another phone may have added to it).
        return { ok: true, progress: saveProgress(db, checkUserId(params.id), (body as { progress?: unknown } | null)?.progress, new Date(), clientOf(headers)) };
      },
    },
    { method: 'GET', pattern: '/api/users/:id', handler: ({ params }) => ({ progress: loadProgress(db, checkUserId(params.id)) }) },
    // A learner erasing themselves (the device id is the only key to the data).
    {
      method: 'DELETE',
      pattern: '/api/users/:id',
      handler: ({ params }) => {
        return people.deleteUser(db, { params: { id: checkUserId(params.id) } });
      },
    },
    { method: 'POST', pattern: '/api/auth/phone/start', strict: true, handler: (r) => startPhone(db, r) },
    { method: 'POST', pattern: '/api/auth/phone/verify', strict: true, handler: (r) => verifyPhone(db, r) },
    { method: 'POST', pattern: '/api/auth/google', strict: true, handler: (r) => signInGoogle(db, r) },
    { method: 'GET', pattern: '/api/users/:id/accounts', handler: (r) => accountsOf(db, { ...r, params: { id: checkUserId(r.params.id) } }) },
    // The owner's switches, read by the app each time it opens (small; not cached).
    { method: 'GET', pattern: '/api/settings', handler: () => readSettings(db) },
    { method: 'GET', pattern: '/api/premium/info', handler: () => premiumInfo(db) },
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
    { method: 'GET', pattern: '/api/admin/reports', admin: true, handler: (r) => listReports(db, r) },
    { method: 'POST', pattern: '/api/admin/reports/close', admin: true, handler: (r) => closeReports(db, r) },
    { method: 'GET', pattern: '/api/admin/tickets', admin: 'people', handler: (r) => listTickets(db, r) },
    { method: 'PUT', pattern: '/api/admin/tickets/:id', admin: 'people', handler: (r) => updateTicket(db, r) },
    { method: 'POST', pattern: '/api/admin/tickets/bulk', admin: 'people', handler: (r) => bulkTickets(db, r) },
    // Spreadsheets for the owner (the admin turns these into CSV files).
    // A language's whole course in the importer's format (importLanguage.ts): for translators to turn into
    // another language (change "language", translate the meanings) and import back.
    {
      method: 'GET',
      pattern: '/api/admin/export/content',
      admin: 'content',
      handler: ({ query }) => {
        const lang = langOf(db, query.get('lang'));
        const language = listLanguages(db).find((l) => l.code === lang)!;
        return {
          language: { code: language.code, name: language.name, native: language.native, dir: language.dir },
          units: readCourse(db, lang),
          grammar: readGrammar(db, lang),
          stories: readStories(db, lang),
          writing: readWriting(db, lang),
        };
      },
    },
    { method: 'GET', pattern: '/api/admin/export/tickets', admin: 'people', handler: () => exportTickets(db) },
    { method: 'GET', pattern: '/api/admin/export/users', admin: 'owner', handler: () => people.exportUsers(db) },
    { method: 'GET', pattern: '/api/admin/export/payments', admin: 'owner', handler: () => people.exportPayments(db) },
    // The learner's own reports and the replies to them (the app's help page).
    { method: 'GET', pattern: '/api/users/:id/reports', handler: ({ params }) => myReports(db, checkUserId(params.id)) },
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
    { method: 'GET', pattern: '/api/admin/words', admin: 'content', handler: (r) => listWords(db, langOf(db, r.query.get('lang'))) },
    { method: 'GET', pattern: '/api/admin/audio', admin: 'content', handler: (r) => listSpoken(db, langOf(db, r.query.get('lang'))) },
    { method: 'PUT', pattern: '/api/admin/audio', admin: 'content', handler: (r) => setClip(db, r) },
    { method: 'DELETE', pattern: '/api/admin/audio', admin: 'content', handler: (r) => deleteClip(db, r) },
    { method: 'GET', pattern: '/api/admin/languages', admin: true, handler: () => listLanguages(db) },
    { method: 'POST', pattern: '/api/admin/languages', admin: 'owner', handler: (r) => createLanguage(db, r) },
    { method: 'PUT', pattern: '/api/admin/languages/:code', admin: 'owner', handler: (r) => updateLanguage(db, r) },
    { method: 'DELETE', pattern: '/api/admin/languages/:code', admin: 'owner', handler: (r) => deleteLanguage(db, r) },
    { method: 'GET', pattern: '/api/admin/settings', admin: 'owner', handler: () => ({ ...readSettings(db), paymentsReady: paymentsReady() }) },
    { method: 'PUT', pattern: '/api/admin/settings', admin: 'owner', handler: (r) => saveSettings(db, r) },
    { method: 'POST', pattern: '/api/admin/media', admin: 'content', raw: MAX_UPLOAD, handler: (r) => saveMedia(r) },
    { method: 'GET', pattern: '/api/admin/summary', admin: true, handler: () => people.summary(db) },
    { method: 'GET', pattern: '/api/admin/stats', admin: 'people', handler: ({ query }) => stats(db, Math.min(90, Math.max(7, Number(query.get('days')) || 30))) },
    { method: 'GET', pattern: '/api/admin/analytics', admin: true, handler: ({ query }) => analytics(db, Math.min(365, Math.max(1, Number(query.get('days')) || 30))) },
    // A language's course as the app gets it, drafts too (the admin's lesson preview in that language).
    { method: 'GET', pattern: '/api/admin/course', admin: 'content', handler: (r) => ({ units: readCourse(db, langOf(db, r.query.get('lang'))) }) },
    // খসড়া: hide a lesson, story or grammar topic from learners until it's ready (or show it again).
    { method: 'POST', pattern: '/api/admin/draft', admin: 'content', handler: (r) => setDraft(db, r) },
    { method: 'GET', pattern: '/api/admin/drafts', admin: 'content', handler: () => draftIds(db) },
    // Content history: every change and delete is kept, and can be put back (history.ts).
    { method: 'GET', pattern: '/api/admin/history', admin: 'content', handler: (r) => listHistory(db, r) },
    { method: 'POST', pattern: '/api/admin/history/:id/restore', admin: 'content', handler: (r) => restoreHistory(db, r) },
    { method: 'GET', pattern: '/api/admin/units', admin: 'content', handler: (r) => content.listUnits(db, langOf(db, r.query.get('lang'))) },
    { method: 'POST', pattern: '/api/admin/units', admin: 'content', handler: (r) => content.createUnit(db, r) },
    { method: 'PUT', pattern: '/api/admin/units/:id', admin: 'content', handler: (r) => content.updateUnit(db, r) },
    { method: 'DELETE', pattern: '/api/admin/units/:id', admin: 'content', handler: (r) => content.deleteUnit(db, r) },
    { method: 'POST', pattern: '/api/admin/units/:id/move', admin: 'content', handler: (r) => content.moveRow(db, 'units', r) },
    { method: 'POST', pattern: '/api/admin/units/:id/lessons', admin: 'content', handler: (r) => content.createLesson(db, r) },
    { method: 'GET', pattern: '/api/admin/lessons/:id', admin: 'content', handler: (r) => content.getLesson(db, r) },
    { method: 'PUT', pattern: '/api/admin/lessons/:id', admin: 'content', handler: (r) => content.updateLesson(db, r) },
    { method: 'DELETE', pattern: '/api/admin/lessons/:id', admin: 'content', handler: (r) => content.deleteLesson(db, r) },
    { method: 'POST', pattern: '/api/admin/lessons/:id/move', admin: 'content', handler: (r) => content.moveRow(db, 'lessons', r) },
    { method: 'POST', pattern: '/api/admin/lessons/:id/items', admin: 'content', handler: (r) => content.createItem(db, r) },
    { method: 'POST', pattern: '/api/admin/lessons/:id/items/bulk', admin: 'content', handler: (r) => content.createItems(db, r) },
    { method: 'PUT', pattern: '/api/admin/items/:id', admin: 'content', handler: (r) => content.updateItem(db, r) },
    { method: 'DELETE', pattern: '/api/admin/items/:id', admin: 'content', handler: (r) => content.deleteItem(db, r) },
    { method: 'GET', pattern: '/api/admin/grammar', admin: 'content', handler: (r) => grammar.listTopics(db, langOf(db, r.query.get('lang'))) },
    { method: 'POST', pattern: '/api/admin/grammar', admin: 'content', handler: (r) => grammar.createTopic(db, r) },
    { method: 'GET', pattern: '/api/admin/grammar/:id', admin: 'content', handler: (r) => grammar.getTopic(db, r) },
    { method: 'PUT', pattern: '/api/admin/grammar/:id', admin: 'content', handler: (r) => grammar.updateTopic(db, r) },
    { method: 'DELETE', pattern: '/api/admin/grammar/:id', admin: 'content', handler: (r) => grammar.deleteTopic(db, r) },
    { method: 'POST', pattern: '/api/admin/grammar/:id/move', admin: 'content', handler: (r) => grammar.moveTopic(db, r) },
    { method: 'GET', pattern: '/api/admin/courses/:id', admin: 'content', handler: (r) => courses.getCourse(db, r) },
    { method: 'PUT', pattern: '/api/admin/courses/:id', admin: 'content', handler: (r) => courses.saveCourse(db, r) },
    { method: 'DELETE', pattern: '/api/admin/courses/:id', admin: 'content', handler: (r) => courses.deleteCourse(db, r) },
    { method: 'GET', pattern: '/api/admin/board', admin: 'content', handler: () => board.listBoard(db) },
    { method: 'POST', pattern: '/api/admin/board', admin: 'content', handler: (r) => board.createBoard(db, r) },
    { method: 'GET', pattern: '/api/admin/board/:id', admin: 'content', handler: (r) => board.getBoard(db, r) },
    { method: 'PUT', pattern: '/api/admin/board/:id', admin: 'content', handler: (r) => board.updateBoard(db, r) },
    { method: 'DELETE', pattern: '/api/admin/board/:id', admin: 'content', handler: (r) => board.deleteBoard(db, r) },
    { method: 'POST', pattern: '/api/admin/board/:id/move', admin: 'content', handler: (r) => board.moveBoard(db, r) },
    { method: 'GET', pattern: '/api/admin/coverage', admin: 'content', handler: () => coverage(db) },
    { method: 'GET', pattern: '/api/admin/writing', admin: 'content', handler: (r) => writing.listWriting(db, langOf(db, r.query.get('lang'))) },
    { method: 'POST', pattern: '/api/admin/writing', admin: 'content', handler: (r) => writing.createWriting(db, r) },
    { method: 'GET', pattern: '/api/admin/writing/:id', admin: 'content', handler: (r) => writing.getWriting(db, r) },
    { method: 'PUT', pattern: '/api/admin/writing/:id', admin: 'content', handler: (r) => writing.updateWriting(db, r) },
    { method: 'DELETE', pattern: '/api/admin/writing/:id', admin: 'content', handler: (r) => writing.deleteWriting(db, r) },
    { method: 'POST', pattern: '/api/admin/writing/:id/move', admin: 'content', handler: (r) => writing.moveWriting(db, r) },
    { method: 'GET', pattern: '/api/admin/stories', admin: 'content', handler: (r) => stories.listStories(db, langOf(db, r.query.get('lang'))) },
    { method: 'POST', pattern: '/api/admin/stories', admin: 'content', handler: (r) => stories.createStory(db, r) },
    { method: 'GET', pattern: '/api/admin/stories/:id', admin: 'content', handler: (r) => stories.getStory(db, r) },
    { method: 'PUT', pattern: '/api/admin/stories/:id', admin: 'content', handler: (r) => stories.updateStory(db, r) },
    { method: 'DELETE', pattern: '/api/admin/stories/:id', admin: 'content', handler: (r) => stories.deleteStory(db, r) },
    { method: 'POST', pattern: '/api/admin/stories/:id/move', admin: 'content', handler: (r) => stories.moveStory(db, r) },
    { method: 'GET', pattern: '/api/admin/users', admin: 'people', handler: (r) => people.listUsers(db, r) },
    { method: 'GET', pattern: '/api/admin/users/:id', admin: 'people', handler: (r) => people.getUser(db, r) },
    { method: 'GET', pattern: '/api/admin/users/:id/export', admin: 'people', handler: (r) => people.exportUser(db, r) },
    { method: 'POST', pattern: '/api/admin/users/:id/action', admin: 'people', handler: (r) => people.userAction(db, r) },
    { method: 'DELETE', pattern: '/api/admin/users/:id', admin: 'owner', handler: (r) => people.deleteUser(db, r) },
  ];
}

/**
 * Per address. Mobile networks put many phones behind one address (carrier NAT), so the general limit is
 * high; backup codes, sign-in and wrong admin tokens get few tries.
 */
/** newUsers: new learners (device ids) one address may create a day, so nobody floods the league with fakes. */
type Limits = Record<'all' | 'strict' | 'badToken' | 'newUsers', [max: number, windowMs: number]>;
export const LIMITS: Limits = { all: [3000, 5 * MINUTE], strict: [10, 15 * MINUTE], badToken: [20, 15 * MINUTE], newUsers: [40, 24 * 60 * MINUTE] };

/** The HTTP server: JSON in, JSON out, CORS open so the app can be hosted anywhere. */
export function createApi(db: DatabaseSync, adminToken: string, limits: Limits = LIMITS): Server {
  const table = routes(db);
  const all = new RateLimit(...limits.all);
  const strict = new RateLimit(...limits.strict);
  const badToken = new RateLimit(...limits.badToken);
  const newUsers = new RateLimit(...(limits.newUsers ?? LIMITS.newUsers));
  // Reports: plenty for a classroom sharing one address, too few to flood the admin.
  const reports = new RateLimit(60, 15 * MINUTE);

  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, undefined);
      const url = new URL(req.url ?? '/', 'http://localhost');
      let params: Record<string, string> | null = null;
      const route = table.find((r) => r.method === req.method && (params = matchPath(r.pattern, url.pathname)));
      if (!route || !params) throw new HttpError(404, 'Not found');
      const ip = clientIp(req);
      if (!all.take(ip) || (route.strict && !strict.take(ip))) throw new HttpError(429, 'Too many requests, try again later');
      if (route.pattern === '/api/reports' && !reports.take(ip)) throw new HttpError(429, 'Too many reports, try again later');
      // A learner saved for the first time counts against the address's daily new-learner limit.
      if (req.method === 'PUT' && route.pattern === '/api/users/:id' && !db.prepare('SELECT 1 FROM users WHERE id = ?').get((params as Record<string, string>).id)) {
        if (!newUsers.take(ip)) throw new HttpError(429, 'Too many new learners from here today');
      }
      const admin = route.admin ? team.adminOf(db, req.headers.authorization, adminToken) : null;
      if (route.admin && !admin) {
        if (!badToken.take(ip)) throw new HttpError(429, 'Too many wrong tokens, try again later');
        throw new HttpError(401, 'Admin token needed');
      }
      if (route.admin && admin && !team.allowed(admin.role, route.admin)) throw new HttpError(403, 'Your role cannot do this');

      // The course only changes when the admin edits it, so apps can ask "has it changed?" cheaply.
      if (url.pathname === '/api/course') {
        // Bangla keeps the original tag, which the apps already in people's phones send back.
        const lang = url.searchParams.get('lang') || 'bn';
        const etag = lang === 'bn' ? `"course-${contentVersion(db)}"` : `"course-${contentVersion(db)}-${lang}"`;
        if (req.headers['if-none-match'] === etag) return send(res, 304, undefined, { etag });
        return send(res, 200, route.handler({ method: 'GET', path: url.pathname, query: url.searchParams, params, headers: req.headers, body: null }), {
          etag,
          'cache-control': 'no-cache',
        });
      }

      const body = req.method === 'GET' || req.method === 'DELETE' ? null : route.raw ? await readBody(req, route.raw) : await readJson(req);
      // Every admin change is written down (who, what, and whether it worked).
      const log = (status: number) => admin && req.method !== 'GET' && team.logChange(db, admin, req.method!, url.pathname, status, new Date(), team.changeDetail(body));
      // Content about to change or be deleted is copied first, so the admin can put it back.
      const snapshot = admin && (req.method === 'PUT' || req.method === 'DELETE') ? snapshotFor(db, url.pathname) : null;
      try {
        const result = await route.handler({ method: req.method!, path: url.pathname, query: url.searchParams, params, headers: req.headers, body, admin: admin ?? undefined });
        log(200);
        if (snapshot && admin) snapshot.save(admin.name, req.method!);
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
