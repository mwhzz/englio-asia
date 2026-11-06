# What's left: findings from the review agents

Collected from the three review agents in `.claude/agents/` (2026-11-06, app v1.6.1). Size: S = hours, M = a few days, L = a week or more.

Status: **language audit ✓, admin/ops audit ✓, learner test ✓**. The order to fix things is in section 4.

**Done on branch `gaps` (2026-11-06, not yet released):** all of section 1's "minimum before launch" (reminders and league read small columns, rate limit 3000/5 min, Telegram off-site backup + restore script + integrity check, 5-minute health check with Telegram alerts, health checks the database), learner search by name/code/phone/device/email with paging and debounce, deploy builds at low priority, old daily history trimmed; sign-ups/active/retention/onboarding/reminder/Plus/version/crash numbers; reports v2 (learner, version, phone, status, kind, assignee, reply seen in the app, help page with FAQ and form); learner page (Plus, payments, sign-ins, give Plus, hearts, freezes, streak, merge phones, block, export; delete removes payments); support role; activity detail and filters; all of section 3 (majors, minors, polish); from section 2: lesson preview in any language, admin forms named after the language with right-to-left typing, a লেখা (writing) admin page, the importer takes stories and writing.

**Still open:** section 1 "build on GitHub Actions" (deploys now run at low priority instead) and Postgres beyond ~200k learners; section 2's app-side items (app text in the learner's language, right-to-left layout and fonts, choosing a language in the app, countries instead of districts, localized privacy/store pages), which need translations by native speakers.

Already fixed from these findings (v1.6.1): the course was downloaded on every app open (cache tag mismatch); draft languages were served to the public.

## 1. Server and admin at launch scale (admin-ops-auditor)

Load test on a copy with 100,000 learners and 20,000 reminder sign-ups:

| Problem | Effect | Fix | Size |
| --- | --- | --- | --- |
| Hourly reminders load every subscriber's full progress | +720 MB memory on a 1 GB server: swapping or the API killed | Read only the fields needed, or keep a "last active day" column | S |
| League totals are counted inside a request | The whole API freezes ~3 s every 5 minutes | Count on a timer, or keep a weekly-XP column | S |
| Rate limit 300 requests / 5 min per IP | Mobile networks share IPs: many real users get blocked at once | Higher limits for normal app routes, keep strict ones for codes/tokens | S |
| Backups only on the same disk, no restore tested | A disk failure loses everything; 14 days ≈ 10 GB at 100k learners | Off-site copy (Spaces/B2 or droplet backups), a restore script, one test restore | S |
| No monitoring; /api/health doesn't check the database | Nobody knows when the site is down | Free uptime alert + database check + backup ping | S |
| Learner search scans every row on each keystroke | ~1 s per letter at 100k, eats the rate limit | Debounce, indexes, paging | S |
| The server builds and tests the app on the same 1 GB on every push | Slows the live API during deploys | Build on GitHub Actions or locally; 2 GB droplet before ~50k learners | M |
| Saved progress grows forever | Database ~700 MB at 100k learners | Trim old daily history; plan Postgres beyond ~200k | L |

**Seeing what's happening, missing:** sign-ups per day, daily active trend, day 1/7/30 retention, onboarding drop-off, Plus/payment numbers, reminder opt-in and effect, crashes by app version/phone, slow screens. The lesson funnel exists but is sorted by starts, not lesson order.

**Complaints, missing:** the only way to complain is "সমস্যা জানাও" after a question; reports keep **no learner, version or device**; no status (new/in progress/fixed), tags, assignee, search or history; no way to reply or say "fixed"; no general help/complaint form (account, payment, lost progress) and no FAQ.

**Managing learners, missing:** find by device id, backup code, phone or Google; paging past 500; Plus status and payments on the learner page; app version/phone; actions (give Plus, reset hearts/streak, restore old progress, block cheaters, export); deleting a learner leaves their payments/accounts/codes behind.

**Team, missing:** a "support" role (learners and reports, not settings); what changed in the activity log; filters; who closed which report.

**Minimum before launch (about a day for the first five):** reminders memory, league freeze, rate limit, off-site backup + restore, uptime alert; plus a small reports v2 (device and version on reports, a general help form, statuses) and a small learner page (find by device id/backup code, Plus status, "give Plus").

## 2. Adding a new language (language-auditor)

**Answer today: no.** The admin can create a language and write most of its course, but no learner can reach it.

| Step | Status | What's needed | Size |
| --- | --- | --- | --- |
| Add a language, draft/live | Exists | — | — |
| Units, lessons, all item kinds, tips, grammar, stories per language | Exists | — | — |
| Writing tasks | Partly | Admin page for writing tasks (API exists); importer doesn't do stories/writing | S–M |
| Admin forms for another language | Missing | Labels say "(Bangla)"; inputs forced to Bangla, no right-to-left | S–M |
| Preview a lesson in another language | Broken | Preview looks in the Bangla course | S |
| Recordings | Exists | — | — |
| App text in the learner's language | Missing | ~500 lines of Bangla in 108 files, reminder text, offline fallback content | L |
| Right-to-left layout and fonts | Missing | `dir`, mirrored layout/icons, Arabic/Devanagari/CJK fonts | M–L |
| Learner picks or switches language | Missing | Onboarding step, Profile switch, saved on the server, progress per language | M |
| Country instead of Bangladesh districts | Missing | Onboarding map, leagues, dashboard, student card, class levels (SSC/HSC); hide board prep and bKash outside Bangladesh | M–L |
| Placement, unit tests, certificates | Partly | Work once a language loads; their text is Bangla | (with app text) |
| Privacy page, manifest, store listing | Missing | Localized versions | S |
| Arabic content | Partly | Starter imported (draft); needs a native speaker's review and more content (no stories or writing yet) | person |

## 3. Using the app as a learner (learner-tester)

Pixel 7 and 360×640, normal and "আরও বড়" text, local copy. **No blockers**: lessons, hearts/practice, streak freeze, restore by backup code and delete all work with no console errors. Not checked: the reminder prompt after a lesson (headless browser blocks notifications) and reopening offline (needs the built app with the service worker).

| # | Problem | Where | Size |
| --- | --- | --- | --- |
| **Major** | | | |
| 1 | 360 px + large text: tab bar wider than the screen, "প্রোফাইল" and the path's practice button cut off, page scrolls sideways | `TabBar`, `PracticeButton`, text-size zoom | S |
| 2 | 360 px + large text: story reader clipped on the left (close, speaker, "পরের লাইন") | `StoryReader` | S |
| 3 | 360 px + large text: lesson header (quit, progress, hearts) scrolls away; third answer hidden under যাচাই করো | `LessonView`, `LessonHeader` | S |
| 4 | A lost streak silently becomes 0, no "streak ended / start again" | `StreakNudge`, `lib/streak.ts` | S |
| 5 | Badge "পুরো বর্ণমালা" can never be earned (letters tab removed) | `lib/badges.ts:35` | S |
| **Minor** | | | |
| 6 | "০ মিনিট" after a short lesson | `todayStats`, `GoalBar` | S |
| 7 | League shows no points until XP syncs | `LeaguePage`, `lib/league.ts` | S |
| 8 | Match exercise shows a dead, grey যাচাই করো | `LessonFooter` | S |
| 9 | Question count grows mid-lesson (১/১৮ → ৪/২০) when wrong answers come back | `useLessonSession` | S |
| 10 | Story "পরের লাইন" sits high on screen (thumb zone) | `StoryReader` | S |
| 11 | Quit sheet says progress is lost, but closing the app keeps it; offer "পরে চালিয়ে যাও" | `QuitDialog` | S |
| **Polish** | "ঢাকা-এর" → "ঢাকার" (and "Rina-এর"); missing "?" in select prompts; "বাক্যটা জোরে বলো" for single words; board "১৮টা প্রশ্ন" vs "১০টা প্রশ্ন"; brief sideways scroll as cards slide in; old "অক্ষর" comment in `e2e/helpers.ts` | | S |

**Missing, from a learner's view:** a streak-lost moment and a way to repair it; a "why" screen before the browser's notification popup; next-heart countdown; a list of past mistakes; hints (tap a word) in translate/listen exercises; adding friends without a phone account.

## 4. What to do, in order

1. **Before launch, server (≈1 day):** reminders memory, league freeze, rate limit, off-site backup + restore test, uptime alert (section 1).
2. **Before launch, app (≈1 day):** learner majors 1–5 and minors 8, 9, 11 (section 3); test offline reopen and the reminder prompt on a real phone.
3. **Before launch, admin (2–3 days):** reports v2 (device/version, help form, statuses) and a small learner page (find by device id/backup code, Plus status, give Plus).
4. **After launch:** the rest of section 1 (stats, build off-server, data growth), learner polish and missing features.
5. **Later, for other languages:** section 2 (app text, right-to-left, language choice, countries); Arabic needs a native speaker.
