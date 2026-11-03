# Englio

A Duolingo-style app for learning English, made for Bangla speakers (বাংলাভাষীদের জন্য ইংরেজি শেখার অ্যাপ).

Bite-sized lessons on a path, 11 exercise types (including fill in the gaps, grammar, dialogues and dictation), an alphabet page (A–Z in print, handwriting and cursive, with tracing and three games), a grammar page (34 topics from parts of speech to SSC/HSC voice, narration and transformation, and a 35-lesson step-by-step course for Parts of Speech), hearts, XP, streaks with streak freezes, a daily goal, unit guidebooks, and spoken English through the browser's built-in text-to-speech.

Also: a placement test, spaced review of missed words and sentences, a word list, a unit test with a shareable certificate after every unit, badges and a weekly report, speaking practice (speech recognition), short stories with questions, a district league, a daily reminder, light/dark/auto theme, a backup code to move progress to a new phone, and data deletion (in the app or on `delete.html`). It works offline and can be installed on a phone (PWA), or published on the Play Store (see `docs/PLAY_STORE.md`).

**Going online:** see `docs/SERVER.md` (hosting, admin token, backups, push reminders).

## Run

```bash
npm install
npm run seed     # once: creates server/englio.db with the course and 30 demo learners
npm run server   # API on http://localhost:8787 (keep it running)
npm run dev      # app on http://localhost:5173, admin on http://localhost:5173/admin.html
npm test         # logic, course-content and API tests
npm run e2e      # the real app, admin and API in a phone-sized Chrome (first time: npx playwright install chromium)
npm run build    # static app + admin in dist/
```

The admin token is `englio-admin` in development; set `ADMIN_TOKEN` (and optionally `PORT`, `DB_PATH`) before putting the server online. The app works without the server too: it falls back to the copy of the course it saved last time, or the built-in one.

## Server and admin

- **`server/`** is a small Node API with no dependencies: Node 24's built-in `node:sqlite` and `node:http`, written in TypeScript that Node runs directly. Tables: `units`, `lessons`, `items` (each word, sentence, blank, gaps, grammar point or dialogue is one row, its fields as JSON), `grammar`, `grammar_courses`, `stories`, `users`, `push_subs` (reminders) and `events` (anonymous daily counts).
- **The app** downloads the course from `GET /api/course` at startup (waiting at most 1.5 s, and only downloading when it changed, via ETag), saves it for offline use, and sends each learner's progress to `PUT /api/users/:id` a few seconds after it changes. Learners are identified by a random device id until there are real accounts.
- **Grammar topics, grammar courses and stories** come with the course from `GET /api/course`; the built-in ones (used until the server answers) are in `src/data/grammar/`, `src/data/grammarCourses/` and `src/data/stories.ts`.
- **Other app endpoints**: `GET /api/leaderboard` (district league), `PUT|DELETE /api/users/:id/push` (daily reminder), `DELETE /api/users/:id` (delete my data), `POST /api/users/:id/code` and `POST /api/restore` (backup code), `POST /api/delete-by-code`, `POST /api/events` (lesson funnel and mistakes), `GET /api/media/:file` (uploaded pictures and recordings).
- **Admin team**: `ADMIN_TOKEN` is the owner; the owner gives editors their own tokens (content only) on the Team page, and every change is logged under Activity. Requests are rate-limited per address (`server/rateLimit.ts`).
- **The admin panel** (`admin.html`, code in `src/admin/`) has a dashboard (learners, activity, top districts, classes, lesson funnel, most-missed exercises), a story editor, a grammar course editor (a whole course as one text document, with hand-written questions), a grammar editor (each topic as plain text fields: paragraphs, and one example / mistake / quiz question per line), a lesson editor (units, lessons and all six content kinds; the server checks every item so the app can always solve it) and a learner list with details. Words can have a picture and a recorded pronunciation (played instead of the phone's voice); words, sentences and blanks can be pasted many at once from Excel or a CSV file; and stories, topics, courses and lessons have a **Preview in app** button. Content changes reach the app the next time it opens.

## Why it's light and scales

- **Static app.** `dist/` is plain HTML/JS/CSS on any CDN (Cloudflare Pages, Netlify, Vercel, GitHub Pages).
- **A tiny API.** The course is one cacheable JSON answered with 304 when unchanged; progress is one small write per learner every few seconds of activity. SQLite handles this comfortably on one server for a long way; when it doesn't, the same tables move to Postgres.
- **React is the only runtime dependency** (plus the two font packages, Inter and Anek Bangla, shipped with the app so it looks right offline). The built-in grammar loads only with the grammar page, and only the needed font subsets download. Sounds are synthesized.

## Project layout

One feature per file:

```
src/
  data/course.ts          all lessons: words, sentences, fill-in-the-blanks
  lib/                    pure logic, unit-tested
    lesson.ts             builds a lesson's exercises from course data
    answer.ts / grade.ts  answer checking (short forms, typo tolerance)
    hearts.ts streak.ts progress.ts days.ts
    speech.ts sounds.ts   text-to-speech, feedback sounds
  state/ProgressContext   saves progress to localStorage
  components/             shared UI: SpeakButton, Bubble, Modal
  features/
    exercises/            one component per exercise type
    lesson/               lesson session, header, footer, complete screen…
    path/                 home path, nodes, popover, guidebook, daily goal
    profile/              stats, weekly chart, settings
    layout/               top bar, bottom nav
  styles/                 one CSS file per feature
```

## Adding content

Add a lesson to `src/data/course.ts`: list its words (`v`), sentences (`s`, with any extra accepted answers) and blanks (`f`). Exercises are generated automatically. Run `npm test`, which checks that every generated exercise can be solved.

A lesson can also take an optional last argument with richer exercises (see Unit 1 for examples):

```ts
{
  // Fill in the gaps: several ___ in one text, filled from one word bank (answers in order, then wrong words).
  gaps: [gp('My name ___ Rahim. I ___ a student.', ['is', 'am'], ['are', 'be'], 'আমার নাম রহিম। আমি একজন ছাত্র।')],
  // Grammar: a rule in Bangla, the correct sentence, wrong versions, and why (shown after checking).
  grammar: [gr('she এর সাথে is বসে।', 'She is my friend.', ['She am my friend.'], 'she এর সাথে সবসময় is বসে।')],
  // Dialogue: a chat with someone; the last line is the learner's reply, picked from it and the wrong ones.
  dialogs: [d('Karim', [['them', 'What is your name?', 'তোমার নাম কী?'], ['you', 'My name is Rahim.', 'আমার নাম রহিম।']], ['Thank you.'])],
}
```

**Grammar courses**: any grammar topic can have a step-by-step course, written in the admin panel (Grammar → a topic → Course) as one text document:

```
# Unit title | ইউনিটের নাম
## lesson-id | Lesson title | লেসনের নাম
- a teaching point
> English example | বাংলা মানে
? question | card, [word] is underlined | right answer | wrong 1; wrong 2 | why
```

Every lesson asks its written questions, then brings back two from earlier lessons. The built-in Parts of Speech course (`src/data/grammarCourses/`) instead generates its questions from a tagged word and sentence bank (`posBank.ts`, the `focus:` and `kinds:` lines). `npm test` checks it always makes solvable questions.

**Stories**: written in the admin panel (Stories), one line per line of the story (`English | বাংলা`, or `Speaker | English | বাংলা`) and a few questions.

Each lesson gets at most one of each, plus a dictation (hear a short sentence and type it) made from its own sentences. English words inside Bangla text (like *am / is / are*) are highlighted automatically.
