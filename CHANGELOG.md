# Changelog

What changed in each version of Englio, newest first. Write a line or two under **Unreleased** as you work, in plain words (what a learner or admin would notice). `npm run release -- patch|minor|major` moves it under the new version number and date.

Version numbers: **patch** (1.0.0 → 1.0.1) for fixes, **minor** (1.0.0 → 1.1.0) for new features, **major** (1.0.0 → 2.0.0) for big changes. The Android app's own `versionCode` only changes when a new APK/AAB is built (see AGENTS.md).

## Unreleased

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
