# What's left: findings from the review agents

Collected from the three review agents in `.claude/agents/` (2026-11-06, app v1.6.1). Size: S = hours, M = a few days, L = a week or more.

Status: **language audit ✓, admin/ops audit ✓, learner test ✓**. The order to fix things is in section 4.

**Done and on `main` (commit 2fba173, deployed 2026-11-06; version number not yet raised):** all of section 1's "minimum before launch" (reminders and league read small columns, rate limit 3000/5 min, Telegram off-site backup + restore script + integrity check, 5-minute health check with Telegram alerts, health checks the database), learner search by name/code/phone/device/email with paging and debounce, deploy builds at low priority, old daily history trimmed; sign-ups/active/retention/onboarding/reminder/Plus/version/crash numbers; reports v2 (learner, version, phone, status, kind, assignee, reply seen in the app, help page with FAQ and form); learner page (Plus, payments, sign-ins, give Plus, hearts, freezes, streak, merge phones, block, export; delete removes payments); support role; activity detail and filters; all of section 3 (majors, minors, polish); from section 2: lesson preview in any language, admin forms named after the language with right-to-left typing, a লেখা (writing) admin page, the importer takes stories and writing.

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

## 5. Running it at Duolingo scale (product-auditor, 2026-11-06)

New findings, beyond sections 1–4:

| # | Item | Why | Size | When |
| --- | --- | --- | --- | --- |
| 1 | Detect the Play app (TWA) and hide bKash there; plan Play Billing; decide what Play learners get for Plus-only units | Play payments policy | S | Before launch |
| 2 | League abuse: name filter, report a name, hide new learners' names for a few days, limit new device ids per IP | One request put a rude name at #1 in the Dhaka league | S–M | Before launch |
| 3 | Uptime monitor outside the droplet (free) on `/api/health` | `watch.sh` dies with the droplet | S | Before launch |
| 4 | Check stuck bKash payments against bKash on a timer; lock a payment while crediting | Paid-but-no-Plus, double credit | S | Before launch |
| 5 | Landing page, terms, refund policy, support email on Englio's domain, share preview cards (Open Graph) | Store review, trust, sharing | M | Before launch |
| 6 | Content undo: trash instead of delete, snapshot before each save, restore; draft → publish per lesson/story/topic | Every save is live at once, no undo; deleting breaks saved progress | M | Before launch |
| 7 | Support: new-ticket alert to Telegram, canned replies, "waiting since", tell the learner when a reply arrives, refuse tickets with no learner | Support time; spam tickets | S–M | First 3 months |
| 8 | In-app announcement / maintenance / forced-update message from the admin | Talk to learners without a deploy | S–M | First 3 months |
| 9 | Per-learner (anonymous) events, campaign tags, Play install referrer; weekly/monthly active, cohort funnels | Know what works | M | First 3 months |
| 10 | Content: ~30 more Bangla units (A1–A2) with recordings | Course runs out in 3–4 weeks (11 units, 23 lessons) | L (people) | First 3 months |
| 11 | "Come back" reminders after 3/7/14 days, wording variants with open rates | Cheapest retention lever | S–M | First 3 months |
| 12 | Daily quests, league tiers with promotion | Duolingo's main pull back | M | First 3 months |
| 13 | Weak-skill practice (review blanks, grammar, matching), harder questions after right answers | Learning quality | M | First 3 months |
| 14 | Course download in parts (outline + lessons on demand); settings changes not bumping the content version (`server/settings.ts:30`) | Payload grows; one switch makes every phone re-download | M | Before ~100 units |
| 15 | Content export for translators, CEFR tags and coverage | Multi-language team | M | Later |
| 16 | Rollout percentages and A/B tests on switches | Safe launches | M | Later |
| 17 | Promo codes, yearly plan, trial, school plan, refunds, revenue report | Revenue | M–L | Later |
| 18 | Admin two-step login, token rotation/expiry, CSV exports, bulk ticket actions; the last English admin pages (Lessons, Team) in Bangla | Security and speed | M | Later |

Also seen: a wrong answer shows a check mark in its radio circle; stray bullet points on the FAQ list; the phone dashboard starts with totals instead of "what needs me today"; Families policy and privacy paperwork (Class 1 learners are under 13).

**Done from section 5 (branch `agents2`, 2026-11-06):** 1 (no bKash in the Android app, owner's choice for Plus units there), 2 (rude-name filter, new names hidden 3 days, 40 new learners per address a day), 3 (outside uptime monitor: steps in `docs/DEPLOY_BN.md`), 4 (stuck-payment check every 10 min, one-time credit), 5 (about page, terms, refund policy, Open Graph cards; the support email is still the owner's Gmail), 6 (history + trash with restore; খসড়া/প্রকাশিত for lessons, stories, topics), 7 (Telegram alert for help reports, canned replies, "waiting since" via ago, reply card in the app, help reports need a learner, 60 reports per address per 15 min), 8 (notice, maintenance, minimum version), 9 (sign-up source from utm tags, weekly/monthly active; per-learner event funnels not done), 11 (come-back reminders, wording variants with open rates), 12 (daily quests; league tiers not done), 13 (review of blanks and grammar; adaptive difficulty not done), 14 (settings no longer bump the content version; course download in parts not done), 15 (content export; CEFR tags not done), 18 (CSV exports, bulk close, Lessons/Team in Bangla; two-step login and token rotation not done), and the small issues (wrong pick shows a cross, FAQ bullets, "আজ যা দেখতে হবে" on the dashboard).

**Still open from section 5:** 10 (more content: people's work), league tiers, adaptive difficulty, per-learner event funnels and the Play install referrer (needs native code), course download in parts, CEFR tags and coverage, rollout percentages and A/B tests, promo codes / yearly / trial / school plans / Play Billing, two-step admin login and token rotation, a support email on Englio's own domain, Families-policy paperwork, Postgres and a CDN.

## 6. Five learner personas (persona-learners, 2026-11-07)

Rina (class 8, cheap phone, large text), Karim (garage owner, little English), Nusrat (HSC), Mr. Hossain (58, larger text), Tania (going abroad, often offline), each over 3–5 simulated days.

**Done (branch `agents3`):** practice crash for a beginner out of hearts; no heart loss in the first 3 lessons; resume kept 24 h; the home card is never a dead end; offline from the first visit (service worker saves every app file on install, `CACHE` v3) and a calm offline page instead of a crash; StreakNudge uses the current streak; Up Next skips Plus-locked units; large text on 360×640: next lesson at the top, search "বাতিল" on screen, class dial fits, placement buttons wrap; Bangla onboarding subtitles and home card labels, Bangla digits in quests; text-size button on the welcome screen; adult card wording; backup-code card after 3 lessons; HowItWorks folded; skipping speaking isn't praised; Android microphone steps; league district rank; "উত্তর দেওয়া হয়েছে" for answered questions; district search best match first.

**Still open:** "আপনি" for adult learners (every screen's wording), a real adult course (market, phone, doctor, travel, work abroad first), an exam plan for SSC/HSC students (daily board round, score trend), "why" explanations for wrong answers outside grammar (content work), speaking without the network.


## 7. The owner's list (2026-11-07)

**Done (branch `content-and-more`):** content batch 01 (units 12–21, drafts) and the A1–B2 plan (`docs/SYLLABUS.md`); admin JSON import; "why" notes on blanks, gaps and dialogues; SSC/HSC exam plan (daily round, 14-day trend); league tiers; adaptive lessons; আপনি for adults; Plus trial, yearly plan and promo codes; admin sessions, two-step sign-in, team token expiry and rotation; "come back by lessons finished" numbers.

**Measured, not needed yet: course download in parts.** The Bangla units' data is 64 KB (19 KB gzipped) for 21 units, about 1 KB gzipped per unit, and it is only downloaded when content changes (ETag). At 80 units that is about 75 KB gzipped. Splitting it would touch every screen that reads the course (words, review, practice, badges), so it is worth doing only past about 150 units.

**Still open, and why:**
- **The app's own text in other languages, right-to-left, choosing a language in the app.** The content side is ready (per-language courses, admin, import/export). The app's ~500 Bangla UI strings live in about 110 files; they need moving into per-language string files and a translator for each language. About a week of work, best started when a second language has its content reviewed.
- **Play Billing.** Needs the owner's Play Console: a "subscription" product, a service account for the Google Play Developer API (to check purchases on the server), and Play Billing switched on in the TWA (`twa-manifest.json`, new AAB). Then the app uses the Digital Goods API inside the Play app. Until then Plus in the Play app is: trial, promo codes, or Plus units open (Settings).
- **Postgres and a CDN.** Needed past about 100k learners (GAPS section 1). It means a managed database (about $15/month on DigitalOcean) and moving `server/*` from `node:sqlite` to a Postgres driver (the first added package). Cloudflare in front of the domain (free) is the easy first step for the CDN.
- **More content:** batches 02–09 of `docs/SYLLABUS.md`, written like batch 01, each checked by a teacher.
