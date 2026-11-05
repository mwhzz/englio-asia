# Changelog

What changed in each version of Englio, newest first. Write a line or two under **Unreleased** as you work, in plain words (what a learner or admin would notice). `npm run release -- patch|minor|major` moves it under the new version number and date.

Version numbers: **patch** (1.0.0 → 1.0.1) for fixes, **minor** (1.0.0 → 1.1.0) for new features, **major** (1.0.0 → 2.0.0) for big changes. The Android app's own `versionCode` only changes when a new APK/AAB is built (see AGENTS.md).

## Unreleased

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
