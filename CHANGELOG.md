# Changelog

What changed in each version of Englio, newest first. Write a line or two under **Unreleased** as you work, in plain words (what a learner or admin would notice). `npm run release -- patch|minor|major` moves it under the new version number and date.

Version numbers: **patch** (1.0.0 → 1.0.1) for fixes, **minor** (1.0.0 → 1.1.0) for new features, **major** (1.0.0 → 2.0.0) for big changes. The Android app's own `versionCode` only changes when a new APK/AAB is built (see AGENTS.md).

## Unreleased

- Learning path: bigger stops and more room, a soft band in the unit's color with one big faint word of the unit behind it, one smooth line (the done part in color); the scattered drawings are gone.
- New question: hear a word or letter (nothing written) and pick it.
- Lesson complete: a burst of dots, three big numbers, the streak, and the new words to tap and hear.
- Arabic letters: “কোনটা? ব” instead of “Which one is বা — ব?”; blanks are just the blank (the question under it); letters on tiles and choices are big; a letter question says “ঠিকটা বাছো”.
- No hearts when the owner turns hearts off (learning is free): nothing shows in the lesson header.
## 1.12.0 (2026-11-12)

- New first run: a 30-second taste right after the welcome (hear a letter or word, pick it, can't fail) and the words you already know; why you learn; your name in Arabic letters (Arabic course); minutes a day, when to remind (after breakfast, after Isha…), আপনি and bigger text; then the first lesson opens by itself.
- Starting a new course (e.g. Arabic after English) shows its own short intro: what it teaches, a taste, then "new" or a level test.
- Reminders for the Arabic course say Arabic, and a new one: “আজ কয়েকটা শব্দ ফিরছে”.

## 1.11.0 (2026-11-12)

- Switch what you learn from the top of Home (like Duolingo): tap the course pill (English · العربية), pick another. Streak and XP are shared, each course keeps its own path.
- End of a lesson: the words you just learned, and when they come back (tomorrow, the day after, in 4 and 7 days).
- Home: “আজ Xটা জিনিস ফিরছে” with a few of the words coming back today.

## 1.10.1 (2026-11-12)

- Arabic: the hamza (ء) lesson shows ء more often.

## 1.10.0 (2026-11-12)

- Learn Arabic from zero: letters 5 at a time, then reading (Arabic and its sound in Bangla letters, so you can read without knowing the meaning), ال, tanween and বিসমিল্লাহ, then first words and questions. 5 units, 21 lessons.
- Every word you learn comes back after 1, 2, 4 and 7 days: each lesson ends with today's words to match again (heard when tapped). Each new word is seen 6+ times in its lesson and 15+ times in two weeks.
- New words are highlighted in sentences; tap a word you've learned to see its meaning.
- After an answer, only the English or Arabic part is read aloud (not the Bangla).

## 1.9.0 (2026-11-12)

- Arabic letters: two units (8 lessons) at the start of the Arabic course teach all 28 letters, zabar/zer/pesh/sukun and the first words, a few letters at a time (draft, for an Arabic teacher's check).
- English A1 complete: units 1–11 get their grammar and conversation lessons (21 lessons; unit 1 gets "All about me", introducing yourself), as drafts.
- Units 22–28 (A2: a day out, questions about the past, cooking, festivals, people, sports, phones), 28 lessons, as drafts.
- New lessons have no emoji. How lessons are arranged so nobody gives up: docs/LEARNING_DESIGN.md.
- Learn Arabic too: Bangla speakers can choose "কী শিখবে? English · العربية" on the first screen or in Profile. Arabic lessons are read aloud in Arabic, answers count without vowel marks (মَرْحَبًا = مرحبا), Arabic runs right to left in the lessons, and the speaking practice listens for Arabic. XP and streak are shared between courses.
- First Arabic course for Bangla speakers (draft, for an Arabic teacher's check): 6 units, 24 lessons, A1 (greetings, family, numbers and time, food, daily life, work and travel).
- Admin: ভাষা → "আরবি শেখা" creates the Arabic course (code bn-ar).

## 1.8.0 (2026-11-07)

- The app in Arabic: when Arabic is live, a learner picks العربية on the first screen (or in Profile → আমার ভাষা) and the whole app is in Arabic, right to left, with dates in Arabic; Bangladesh-only parts (district map, SSC/HSC board prep, bKash) are left out; reminders come in Arabic. Two clean Arabic fonts: a modern one and Naskh, the familiar book style (Profile).
- Admin: অ্যাপের লেখা, every text of the app next to its translation, to check and fix (Arabic is drafted, 712 texts).
- Arabic course: units 4–11 (A1 to A2, 32 lessons) and lessons 3–4 for units 1–3, as drafts for a native speaker's check.
- Every unit is now complete: words 1, words 2, grammar, conversation, then the unit test. Units 12–21 (Bangla) got their grammar and conversation lessons (40 lessons in all).
- Importing a JSON file adds lessons to a unit that already exists (same title) instead of making a second one.

## 1.7.0 (2026-11-07)

- New content, waiting for a teacher's check: units 12–21 (A1+ to A2: home, clothes and shopping, free time, jobs, in town, last weekend, health, plans, feelings, comparing), 20 lessons, every blank with a "why". The whole A1–B2 plan is in docs/SYLLABUS.md.
- Admin: ভাষা → "JSON থেকে যোগ করো" adds a writer's batch of units, topics and stories to a language, checked first, as drafts.
- A wrong answer to a blank, a gap text or a dialogue shows why the right answer is right (when the lesson has it).
- SSC/HSC exam plan in board practice: a daily mixed round of 10 questions and the last 14 days' scores; the home card says whether today's round is done.
- League tiers: ব্রোঞ্জ → সিলভার → গোল্ড → ডায়মন্ড. 150+ XP in a week moves you up, under 30 (or a skipped week) moves you down; the league opens on your tier.
- Lessons adapt: learners who are doing well get more typing and dictation, struggling ones more picking and no dictation.
- "আপনি": learners who chose job / other are spoken to as আপনি everywhere (Profile → আপনি বলে ডাকো to change).
- Englio Plus: a free trial (days set by the owner, once per learner), a yearly plan, and promo codes made in the admin (Settings → প্রোমো কোড). Trial and codes work in the Android app too.
- Admin sign-in now gives a 30-day session instead of keeping the token in the browser; two-step sign-in with an authenticator app (Team page); team tokens last 180 days and can be replaced ("নতুন টোকেন").
- Admin dashboard: "কত লেসন করলে ফিরে আসে" (learners by lessons finished, and how many came back this week).

- Day one can't fail: the first 3 lessons cost no hearts; practice works before any lesson is finished (it crashed for a beginner out of hearts); a half-done lesson waits 24 hours instead of 6.
- Offline from the first visit: the app saves all its files when first opened; a page that still needs the internet says so calmly instead of "something went wrong".
- Home: the next lesson is at the top; it never points at a Plus-locked unit; "Englio কীভাবে চলে" is folded to one row; the streak cards no longer contradict each other; a one-time card asks to write down the backup code after 3 lessons. Card labels are in Bangla.
- Onboarding: a text-size button on the first screen; Bangla subtitles; on a short phone with large text the search's "বাতিল" and the class dial fit; job/other learners get an "Englio pass" card. "Raj" finds Rajshahi first.
- "এখন বলতে পারছি না" no longer counts as a right answer; the microphone message gives the Android app's steps; the league shows your district's place right away; an answered question says "উত্তর দেওয়া হয়েছে".

- Inside the Android (Play) app the bKash buy button never shows (Google requires Play Billing there); the owner chooses whether Plus-only units are open in the app until then.
- League: rude names are hidden ("Learner"), new learners show as "নতুন শিক্ষার্থী" for 3 days, and one address can create at most 40 new learners a day.
- bKash: a payment can't give its days twice, and a payment left halfway (browser closed after paying) gets its Plus from a check every 10 minutes; unfinished ones expire after a day.
- Admin: ইতিহাস ও ট্র্যাশ: every content change and delete is kept for 90 days and can be put back in one tap (a lesson or unit with everything in it). Lessons, stories and grammar topics can be খসড়া (hidden from learners) or প্রকাশিত.
- Admin settings: a notice on every learner's home page, maintenance mode, and "please update" for apps older than a version. Switching settings no longer makes every phone download the whole course again.
- Admin: "আজ যা দেখতে হবে" on the dashboard (new reports, crashes, stuck payments); CSV downloads of learners, reports and payments; close a whole list of reports at once; a language's course as JSON for translators; where new learners came from (?utm_source=…) and weekly/monthly active; reminder wordings compared by how often they're opened. The Lessons and Team pages are in Bangla.
- New help reports reach the owner's Telegram at once; a learner whose report was answered sees "তোমার রিপোর্টের উত্তর এসেছে" on the home page.
- আজকের কাজ: three small goals each day (daily goal, 2 lessons, 10 minutes); all three give a streak freeze.
- Reminders: after two quiet days only on days 3, 7, 14 and 30 away, with a "come back" message; everyday reminders have three wordings.
- Missed blanks and grammar questions come back in review too, not only words and sentences.
- A wrong pick shows a cross in its circle; the help page's lists have no stray bullets.
- Website: an about page, terms of use and a refund policy (linked from Profile), and link preview cards when the site is shared.

- Help page (Profile → সাহায্য ও অভিযোগ): answers to common questions, a form to report any problem (account, payment, a bug…), and the team's replies to your reports.
- A lost streak is told ("৯ দিনের স্ট্রিক শেষ হয়ে গেছে") with a button to start again, instead of silently becoming 0.
- Leaving a lesson can be "পরে চালিয়ে যাব" (carries on from the same question). The question count no longer grows when a missed question comes back; it says "আবার".
- Largest text on a small phone: the tab bar, lesson header and story reader fit the screen; the lesson header stays pinned; nothing scrolls sideways.
- The story's "পরের লাইন" button stays at the bottom, under the thumb. The league counts this week's XP right away. Small Bangla fixes (ঢাকার, Rina-র; "শব্দটা জোরে বলো" for single words; board practice says "১৮টা থেকে ১০টা প্রশ্ন"). A short lesson counts as 1 minute. The unearnable "পুরো বর্ণমালা" badge became "৩টা গল্প".
- Admin, reports: every report with the learner, app version and phone; statuses (নতুন, দেখছি, ঠিক হয়েছে, বন্ধ), kinds, who handles it, search, and a reply the learner reads in the app. Fixing a lesson question tells everyone who reported it.
- Admin, learners: find by name, backup code, phone number, device id or Google email; 50 per page; Plus, payments, sign-ins, reminder, phone and version on the learner page; give Plus, fill hearts, give freezes, give back a streak, join a second phone's progress, block from the league, download the data. Deleting removes payments too.
- Admin, dashboard: sign-ups and active learners per day, day 1/7/30 retention, onboarding drop-off, reminders asked/sent/opened, Plus numbers, learners and crashes by app version; the lesson funnel is in course order. The admin pages are in Bangla.
- Admin, team: a "support" role (learners and reports, no content or settings); the activity log shows what was sent and can be filtered.
- Server: nightly backup checked and sent to the owner's Telegram (optionally locked), a restore script, and a 5-minute check that messages Telegram when the site is down, the disk is full or the backup is old. Reminders and the league no longer read every learner's progress (safe at 100k learners); higher rate limit for shared mobile networks; deploys build at low priority.

## 1.6.1 (2026-11-06)

- Fix: since 1.5.0 the app downloaded the whole course every time it opened, instead of only when it changed. Fixed for the apps already on phones too.
- Draft languages are no longer served to the public course; only live ones are.

## 1.6.0 (2026-11-06)

- Admin: a শব্দ page with every word of a language in one list: add a word to any lesson (meaning, emoji, picture, pronunciation), and record or upload each word's pronunciation right there. Search, filter by unit, or show only words without audio.
- Admin: an অডিও page with everything the app reads aloud (words, sentences, blanks, dialogues, stories, grammar examples), how much has a recording, and per line: listen, record with the microphone, upload, remove. Upload many files at once, named after their text.
- One recording per text plays everywhere that text is spoken, in every language's course, instead of the phone's voice.
- Arabic starter course in the admin (draft, not shown to learners): 3 units (First Steps, Family, Food & Drink), 6 lessons and 3 grammar topics (am/is/are, a/an/the, pronouns), written for Arabic speakers' usual mistakes. Needs a native speaker's check before going live.
- `server/importLanguage.ts` adds a language's starter content from a JSON file, with the admin's checks.

## 1.5.0 (2026-11-06)

- Admin: a new ভাষা page to add the learners' own languages (Arabic, Urdu, Hindi, Japanese and others in one tap, or any other by code). A new language starts empty and in draft (only the admin sees it); it can go live once it has content, and the page shows how much is there and how much is translated.
- Admin: the Lessons, Grammar and Stories pages have a language bar on top; what you add goes into the chosen language. Each language's content is kept apart (its ids start with its code, like ar-u1). SSC/HSC board prep stays Bangla only.
- The app still shows the Bangla course; choosing a language in the app comes in a later release.

## 1.4.0 (2026-11-06)

- Admin: a new সেটিংস page for the owner. Switch features on or off (hearts, league, stories, board prep, শোনা-বলা, reminders, buying Plus), choose which units are free and which need Englio Plus, and set the Plus price and days. Apps pick it up the next time they open, no new APK.
- App: units the owner made Plus-only show a "Plus" tag on the path and the Up Next card; tapping one explains Englio Plus (and how to get it, once bKash is on) instead of starting the lesson. Switching hearts off gives everyone unlimited hearts.
- Admin looks and moves like the app: menus in Bangla, grouped, with Englio's icons; on a phone, the app's glass tab bar with an "আরও" sheet; capsule buttons and rounder cards.

## 1.3.1 (2026-11-06)

- Every icon in the app now has the same look: search, back, zoom, clear and the reminder bell were redrawn (the bell was an emoji). Flame, gem, heart, trophy and star get a soft fill of their own colour, and the selected tab shows a solid icon.

## 1.3.0 (2026-11-06)

- New Englio brand: the app icon is a bold "e." and the logo is the learning path, in blue night with a yellow dot (black and lime in dark mode). The browser bar and the phone's status bar are blue night too. All brand files and rules are in `brand/`.

## 1.2.0 (2026-11-06)

- Englio's own icons everywhere: rounded outlines with a small dot, like the logo's speech bubble. New tab icons (a path, a speech bubble, "Aa", a smiling face), and XP is now a gem.
- "Put the word in the sentence" looks better: the meaning sits in a soft pill, a placed word pops in, and the bigger word tiles sit right above the button, under the thumb.

## 1.1.0 (2026-11-06)

- New "put the word in the sentence" questions: the sentence is shown large with a dashed slot, and the word tiles below glide into it (tap a placed word to send it back). Fill-in-the-blank and fill-in-the-gaps both work this way now.
- New words come back inside a sentence from the lesson ("Our house is ___."), so learners see how each word is used, not only what it means. 22 of the 23 lessons get these.

## 1.0.2 (2026-11-06)

- Pushing to GitHub's main now updates the site by itself, usually within a minute, switching to the new version in one step. A build or test failure means no update (the live site stays as it was), and every deploy is logged.
- `npm run release` no longer needs the server password: it waits until the site runs the new version.

## 1.0.1 (2026-11-06)

- The app is white (light) by default, even when the phone is in dark mode. Dark, or following the phone, can still be picked in Profile → থিম.

## 1.0.0 (2026-11-06)

First release, live on the demo domain and as an installable Android app.

- Lessons: 11 units, 23 lessons, 11 exercise kinds, hearts, XP, streaks with freezes, daily goal, placement test, unit tests with certificates, spaced review of mistakes, a word list.
- শোনা-বলা: listening rounds, pronunciation scored word by word, acted-out conversations.
- ব্যাকরণ: 34 grammar topics, a step-by-step Parts of Speech course, SSC/HSC board practice (15 topics, 257 questions, model tests), writing practice.
- Stories with questions; tap any word for its meaning.
- District league and a friends league; badges; a weekly report for parents.
- Backup code and phone or Google sign-in to move progress to a new phone; delete my data in the app or on the website.
- Daily reminder: offered after the first lesson, sent only on days the learner hasn't practised.
- Works offline, larger text, low-data mode, Android Back button.
- Admin panel: dashboard and lesson funnel, editors for lessons, grammar, courses, stories, board questions and writing, pictures and recordings for words, team roles with an activity log, learner reports and crash reports.
- The app's version is shown at the bottom of Profile and sent with crash reports.
