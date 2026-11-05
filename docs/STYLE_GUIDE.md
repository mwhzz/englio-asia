# Englio Style Guide

The look and feel set during **onboarding** (finished and approved). Every new section (dashboard, lessons, profile, …) should follow this guide.

> **Status:** onboarding (`src/features/onboarding/`) is done. The home page (`src/features/home/`: glow header, week strip, goal bar, Up Next card, glass tab bar) and the learning path (`src/features/path/trail/`) are done. The lesson screens (`src/features/lesson/`, `src/features/exercises/`) are done too. The profile (`src/features/profile/`) is done too; the old top bar and chunky `.btn` buttons are gone. The guidebook sheet still uses the older look.

---

> **2026-11-03 — plain iOS pass.** The user found the decorated look "cheap" and "not iOS". Lesson and home are now flat like Apple's own apps: **Inter** for Latin text (closest web font to SF Pro), body weight 400, Bangla headings at 600; solid one-color buttons (no gradients, inner highlights or colored glows); white cells with no drop shadow on `--ios-bg`; inset grouped lists with hairlines; a segmented control; system-blue tint for anything tappable in a lesson (the unit's color only marks progress); calm ease motion instead of springy bounces. The parrot mascot and star bursts were removed. Where older sections below say otherwise, this note wins.

> **Lesson look (after "mix of Duolingo + Apple").** Each exercise opens with a **hero card** in the unit's color (soft gradient, two faint circles, an "Aa" watermark) that grows to fill the free space, with a tag on top (kind of question · প্রশ্ন ৩/১২). Answers are separate white cards with a radio circle; picked = unit-color wash + ring + small pop. The unit's color is the lesson's tint (CTA, selection, progress). The result panel is lightly tinted green/red and shows the right answer in English + Bangla with a speaker. **No emoji in exercises** (the user found them ugly). Kinds: select, match, translate, listen, choice, type, fill, **gaps** (several blanks, one bank), **grammar** (rule card + pick the correct sentence, reason shown after), **dialog** (chat bubbles, pick your reply), **dictate** (hear and type). English inside Bangla text goes through `MixedText`, which sets it in Inter, tinted and semibold (a bare "I" otherwise looks like "।"); all-English text is left plain. Full-screen pages (letter, game, topic) render into `<body>` above the tab bar. The tab bar has four tabs: শেখো · অক্ষর · ব্যাকরণ · প্রোফাইল.

> **Tabs (2026-11-03).** শেখো · শোনা-বলা · ব্যাকরণ · প্রোফাইল. The letters (অক্ষর) tab was removed at the user's request; listening and speaking replaced it.

> **Thumb reach (user feedback).** On any question screen the answers sit at the bottom of the screen, where the thumb is, and the explanation after answering comes up from the bottom as a sheet (`.cl-ask` in `grammarCourse.css`). Never stack the answers right under the question at the top.

> **Home path background.** Each unit on the path has a soft glow in its color and faint line drawings beside the stops, themed by the unit's title (`features/path/trail/doodles.ts`; a hand and a speech bubble for greetings, a house for family…). They sit on the side the curve leaves free. Keep them faint (about 34% of the unit color); they're background, not content.

## 1. Principles

1. **Duolingo's structure, Apple's look.** Take Duolingo's flow: one question per screen, progress at the top, one big action at the bottom, a lesson path. Draw it in **Apple's iOS 26 "Liquid Glass" style** with **Apple system colors**.
2. **Clean, never cartoonish.** No thick 3D borders and no chunky pressed-down buttons. Shadows are soft, edges are hairlines, surfaces are glass.
3. **Every screen gets one creative hero.** Don't build plain forms. Examples from onboarding: the 3D district map, the student card, the class dial (ক্লাস ঘড়ি).
4. **Bangla first.** Titles and buttons are in Bangla, with a short English subtitle under the title.
5. **No emoji as UI.** Use SVG glyphs (pin, cap, briefcase, chevron) and initials instead. Emoji are fine inside learning content.
6. **Light and fast.** Use no new libraries, and synthesize sounds and visuals in CSS/SVG. Lazy-load big sections (onboarding is its own chunk of about 17 KB gzipped).
7. **One feature per file.** Each component, hook or helper lives in its own file.

---

## 2. Typography

| Use | Font | Size / weight |
|---|---|---|
| Latin UI text | **Outfit** | 17px / 400–600 |
| Bangla text | **Anek Bangla** (any element with `lang="bn"`) | same as surrounding |
| Screen title | Anek Bangla / Outfit | `clamp(28px, 8vw, 34px)` / 700, centered, `letter-spacing: -0.02em` |
| Subtitle (English) | Outfit | 17px / 400, secondary color, centered |
| Footnote / caption | Outfit | 13px, secondary |
| Button label | Bangla | 18px / 600 |
| Big numerals (class, stats) | Anek Bangla | 800, very large (e.g. 140px on cards) |
| Map labels | Anek Bangla | `font-stretch: 85%`, 600, with halo `paint-order: stroke` |
| Card micro-labels | Outfit | 9–10px / 700, `letter-spacing: .14–.16em`, UPPERCASE |

Fonts load from Google Fonts in `index.html`:
`Anek Bangla wdth,wght@75..100,400..800` and `Outfit wght@400..800`.

**Rule:** always put `lang="bn"` on Bangla text so it gets Anek Bangla.

---

## 3. Color

Apple system colors. Tokens for onboarding are scoped under `.ob` in `src/styles/onboarding.css`. New screens use the same values as global `--ios-*`, `--glass-*`, `--ease` and `--spring` tokens in `src/styles/tokens.css`.

### Core tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ob-bg` | `#f2f2f7` | `#000000` | page (iOS grouped background) |
| `--ob-cell` | `#ffffff` | `#1c1c1e` | cells, cards |
| `--ob-label` | `#000000` | `#ffffff` | primary text |
| `--ob-secondary` | `rgba(60,60,67,.6)` | `rgba(235,235,245,.6)` | subtitles |
| `--ob-tertiary` | `rgba(60,60,67,.3)` | `rgba(235,235,245,.3)` | placeholders, disabled |
| `--ob-fill` / `-strong` | `rgba(120,120,128,.12/.2)` | `rgba(118,118,128,.24/.32)` | search field, inactive dots |
| `--ob-separator` | `rgba(60,60,67,.29)` | `rgba(84,84,88,.65)` | 0.5px hairlines |
| `--ob-blue` | `#007aff` | `#0a84ff` | **primary action, selection, links** |
| `--ob-red` | `#ff3b30` | `#ff453a` | selected district, map pin |
| `--ob-green` | `#34c759` | `#30d158` | success |

### Liquid Glass tokens

| Token | Light | Dark |
|---|---|---|
| `--ob-glass-bg` | `rgba(255,255,255,.6)` | `rgba(72,72,78,.38)` |
| `--ob-glass-hi` (top highlight) | `rgba(255,255,255,.95)` | `rgba(255,255,255,.2)` |
| `--ob-glass-edge` | `rgba(0,0,0,.08)` | `rgba(255,255,255,.12)` |

### Stage gradients (learner level) — `src/data/classLevels.ts`

| Stage | Colors |
|---|---|
| Primary (class 1–5) | `#5ac8fa → #007aff` |
| Secondary (6–10) | `#34c759 → #30b0c7` |
| Higher secondary (11–12) | `#ff9500 → #ff2d55` |
| University | `#af52de → #5856d6` |
| Job / other | `#c69c6d → #7d5a3c` |

Default card gradient (no level yet): `#0a84ff → #5e5ce6`.

### Division colors (map) — `src/features/onboarding/map/divisionColors.ts`

Dhaka `#ff9500`, Chattogram `#007aff`, Rajshahi `#af52de`, Khulna `#34c759`, Barishal `#5ac8fa`, Sylhet `#ff2d55`, Rangpur `#ffcc00`, Mymensingh `#5856d6`.
On the map they are mixed into a neutral base: `color-mix(in srgb, var(--div) 30%, var(--ob-land-base))` (38% in dark mode).

### Brand

The logo tile is green (`#5be07f → #34c759`, bottom edge `#248a3d`). The wordmark is "Engl**io**", with "io" in green. Component: `src/components/Logo.tsx`.

---

## 4. Surfaces & shape

| Element | Radius | Surface |
|---|---|---|
| Primary button | `999px` (capsule), height 56 | tinted glass (blue) |
| Glass controls (back, search, zoom, chips, fields, option buttons) | capsule or 22px | Liquid Glass |
| Cards / hero cards | 22–28px | gradient + highlight |
| Inset grouped list | 12px | `--ob-cell` with 0.5px separators inset 16px |
| Bottom sheet | 12px top corners | `--ob-bg`, grabber 36×5 |

### Liquid Glass recipe (copy this)

```css
background: var(--ob-glass-bg);
backdrop-filter: blur(24px) saturate(190%);
box-shadow:
  inset 0 1px 0 var(--ob-glass-hi),        /* bright top edge */
  inset 0 0 0 0.5px var(--ob-glass-edge),  /* hairline rim */
  0 10px 26px -14px rgba(0, 0, 0, 0.3);    /* soft float */
```

### Primary button recipe (tinted glass capsule)

```css
height: 56px;
border-radius: 999px;
background: linear-gradient(180deg, color-mix(in srgb, var(--ob-blue) 82%, white), var(--ob-blue) 60%);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.5),
  inset 0 -2px 6px rgba(0, 0, 0, 0.12),
  0 14px 26px -14px color-mix(in srgb, var(--ob-blue) 80%, black);
/* pressed */  transform: scale(0.96);
/* disabled */ glass background + --ob-tertiary text
```

One label only, in Bangla: `শুরু করো`, `পরবর্তী`. No second English line on buttons.

---

## 5. Layout

- **Column:** max-width `520px`, centered, side padding `20px`, and respect `env(safe-area-inset-*)`.
- **Screen skeleton** (top to bottom): nav bar → centered title + subtitle → **creative hero** → controls → flexible space → **CTA button at the bottom**.
- **Full-bleed hero:** `margin: 0 calc(50% - 50vw)` lets a map or picture span the window edge to edge inside the column.
- **Sticky CTA** on scrolling screens: `.ob-sticky-cta` (sticky bottom with a fade to the background).
- **Short phones:** use `@media (max-height: 720px)` to shrink heroes and hide subtitles so the screen still fits. Test at **320×680** and **390×844**, in light and dark mode.
- **Shared element across screens:** the map is a single layer that glides between screens. A screen marks where it wants the map with an empty `.ob-map-slot`, and `useSlotRect` measures that spot. The screen is `pointer-events: none` with its children set to `auto`, so taps reach the map underneath.

---

## 6. Navigation

- **Nav bar:** a round glass back button (44px, black/white chevron) on the left, **iOS page dots** in the center (the current dot stretches to a 24px blue capsule; finished dots are 45% label color).
- **Bottom sheets** (like search): slide up from the bottom, with a backdrop of `rgba(0,0,0,.3)`, a grabber handle, an iOS search field and a blue text "Cancel" (বাতিল).
- **Lists:** iOS inset grouped, with a section header (13px secondary, Bangla · English), ✓ in blue for the selected row.

---

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `--ob-ease` | `cubic-bezier(0.32, 0.72, 0, 1)` | iOS sheet / navigation ease |
| `--ob-spring` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | pops, presses, selection |

- **Screen enter:** each block fades in and slides `24px` in the travel direction (`--dir` = 1 forward, −1 back), with a **60ms** stagger (`.ob-rise` + `--i`).
- **Selection pop:** scale from 0.6–0.7 to 1 with the spring (`ob-pop`).
- **Stamp:** a value lands from `scale(1.8)` (`lc-stamp`) when it is written onto a card.
- **Sheen:** a light sweep across a card when its content changes.
- **Gradient color changes animate** using `@property --g1 / --g2` (registered as `<color>`).
- **3D:** gentle `rotateX/rotateY` tilt (the map slab; the card follows the pointer at up to 14°, via CSS variables, without re-rendering).
- **Haptics:** call `haptic()` (8ms vibration) on every pick.
- **Reduced motion:** everything must still work with animations off (a global rule in `base.css`; timers shorten).

Durations: presses 0.2–0.35s · content changes 0.4–0.6s · color/gradient 0.7–0.8s · map moves 0.7s.

---

## 8. Signature components (reuse these)

| Component | File | What it is |
|---|---|---|
| `Logo` | `src/components/Logo.tsx` | mark + wordmark |
| `ObButton` | `onboarding/ObButton.tsx` | primary glass capsule |
| `NavBar` | `onboarding/NavBar.tsx` | glass back + page dots |
| `BangladeshMap` | `onboarding/map/` | 3D slab map: division tints, pan/zoom, lift + ripple on select, lights + speech bubbles on intro |
| `LearnerCard` | `components/card/LearnerCard.tsx` (CSS `styles/card.css`) | wallet-style student pass with district silhouette, holo shine, tilt; onboarding fills it in live, the profile shows it as its hero (with `joinedAt`) |
| `ClassDial` | `onboarding/dial/ClassDial.tsx` | watch-face picker (tap or drag, spring hand) |
| `DistrictSearch` | `onboarding/DistrictSearch.tsx` | iOS bottom sheet with search + grouped list |
| `HomeHeader` | `home/HomeHeader.tsx` | plain page with a soft glow at the top in the color of the hour (dawn, day, golden, dusk, night), Bangla date and greeting, monogram avatar, white status pills |
| `WeekStrip` | `home/WeekStrip.tsx` | the last 7 days as circles with Bangla weekday letters: orange with a flame on days with XP, a dashed ring on today until it's earned |
| `GoalBar` | `home/GoalBar.tsx` | today's XP goal as a slim yellow→orange bar with the sun (indigo moon at night) riding its tip |
| `UpNextCard` | `home/UpNextCard.tsx` | one-tap resume card in the unit's color with a fine ring pattern |
| `TabBar` | `layout/TabBar.tsx` | floating Liquid Glass capsule tab bar |
| `LessonTrail` | `path/trail/` | the learning path on the plain page: a white unit card (shared `UnitSign`, with a thin progress bar in the unit color), units more than one past the current one folded into tap-to-open rows (`UnitRow`), then its lessons as round buttons on a soft S-curve. Finished = unit-color fill with a check (the unit's last lesson is a trophy that turns gold), next = bigger with a halo, ripple and a "শুরু করো" pill, locked = white cell with a lock. The line is solid where finished and dotted ahead; names sit on a page-colored pill so the line passes behind them. Shared pieces (unit sign, lesson card, practice button) are in `path.css`. |
| `Parrot` | `components/Parrot.tsx` | টিয়া, the lesson mascot: a flat SVG ring-necked parakeet that blinks and tilts its head; asks questions in `Bubble`, peeks beside the finish medal and the quit sheet |
| Lesson screen | `lesson/LessonView.tsx` | unit-colored progress bar with a glowing bead, centered Bangla instruction, the exercise centered in the free space, floating tinted result card with a star `Burst` on a right answer and a shake + red on a wrong one, a `ComboPill` from three right in a row, CTA in the unit's color |
| Exercises | `exercises/` | white soft-shadow cards and capsule tiles (no borders); picked = unit-color wash + 2px ring + pop; word tiles glide between bank and answer (`useFlip`), empty slots are dashed; listen = round play button with sound waves while speaking |
| `LessonComplete` / `OutOfHearts` | `lesson/` | medal in the unit's color with rippling rings and the parrot, stats count up; out of hearts = an empty heart that refills like a clock (`HeartRefill`) |
| Profile | `profile/` (lazy-loaded) | large title "প্রোফাইল", the student pass, 2×2 stat tiles with iOS-Settings icon tiles, this week's XP bars with a dashed goal line, course progress per unit, and settings as an inset grouped list (segmented daily goal, iOS switch for sound, change profile, reset). Sheets (`Modal`) render into `<body>` so animated parents can't trap them. |
| Letters | `letters/` (lazy) | A–Z grid (4–5 columns, vowels tinted orange), a segmented control for ছাপা / হাতের লেখা / টানা লেখা (Inter, Playwrite DE Grund, Playwrite US Trad, loaded only on this page) and Aa / A / a. Letter page full screen: big letter in a tinted hero, name and sound buttons, example words with the letter highlighted, a four-line tracing strip (`TraceCanvas`), prev/next. Three games (hear and tap, match cases, missing letter), 8 rounds, +5 XP. |
| Grammar | `grammar/` (lazy) | search field, filter chips (সব / শুরু / মাঝারি / উচ্চতর / সংরক্ষিত), topics as inset grouped lists by level (green / blue / purple). Topic page: tinted hero with "Aa", explanation, patterns as colored blocks joined by "+", an optional table, examples with speakers, ❌/✅ common mistakes, a quiz that marks the topic learned when all answers are right, bookmark and next topic. Topics with a course get a solid unit-color card "পুরো কোর্স · ৩৫টি লেসন" (with progress) above the explanation and a "৩৫ লেসন" badge in the list; the course page lists lessons by unit (done ✓ / next "শুরু করো" / locked 🔒); a course lesson is a "শিখে নাও" screen then questions (choice cards, or tap the word in a sentence), missed ones coming back at the end. |
| `Glyph` | `components/Glyph.tsx` | SVG icons (flame, bolt, heart, play, home, person …) instead of emoji |

When a second section needs one of these, move it from `features/onboarding/` into `src/components/`, and move the `--ob-*` tokens it uses into `src/styles/tokens.css`.

---

## 9. Copy

- The title is a **question or short command in Bangla**: "তুমি কোন জেলার?", "তোমার নাম কী?".
- The subtitle is **short English**: "Tap your district on the map."
- Hints are friendly Bangla: "ম্যাপে চাপ দাও বা খুঁজো".
- Buttons have one Bangla word or phrase: "শুরু করো", "পরবর্তী".

---

## 10. Do / Don't (from design reviews)

| ✅ Do | ❌ Don't |
|---|---|
| Liquid Glass surfaces, capsule buttons | Thick 3D borders and chunky pressed-down buttons (looked "cartoon") |
| One creative hero per screen | Plain grids or forms (rejected as boring) |
| Simple but beautiful: few shapes, clean colors | Dense illustrated scenes (the detailed river scene was "too complex") |
| Original ideas rooted in Bangladesh or the app | Straight copies of Apple widgets (Fitness rings were rejected as a copy and as wasted space) |
| Fit on screen; scroll vertically only if needed | Horizontal scrolling pickers (rejected) |
| Outfit + Anek Bangla | Generic system fonts or Nunito/Hind Siliguri |
| SVG icons, initials | Emoji as UI icons |
| Bangla-only button labels | Two-line Bangla + English buttons |
| Test light + dark at 320 and 390 widths | Ship without checking small phones |

---

## 11. Checklist for a new section

- [ ] Uses the screen skeleton (nav → centered title → hero → controls → bottom CTA)
- [ ] Has one creative, animated hero (not a plain form)
- [ ] Colors only from the tokens above; works in dark mode
- [ ] Glass recipe for floating controls; capsule primary button
- [ ] Bangla title + English subtitle; `lang="bn"` on Bangla text
- [ ] Spring/ease motion, staggered entry, haptic on picks, reduced motion respected
- [ ] Fits at 320×680 and 390×844
- [ ] One component per file; no new dependencies; heavy parts lazy-loaded

---

## 12. Parked ideas

- **River journey path** (`src/features/path/`: `RiverPath.tsx`, `riverLayout.ts`, `scene/`). It's an illustrated river between green banks, with a wooden jetty per lesson, a bridge, glass sign and themed landmark per unit, a river launch that sails to the next jetty, and day and night palettes. Parked on 2026-11-01 because it was getting too complex. Keep it for later; don't extend it unless asked.
- **Star path** (`src/features/path/stars/`, `src/styles/stars.css`): the path as a night sky with constellations, nebulae, planets and a village horizon. Replaced on 2026-11-03 by the plain `LessonTrail` because the user wanted a simple background. Not imported; keep for later.
- **Sky header** (time-of-day sky picture with stars and a sun/moon arc). Replaced on 2026-11-03 by the glow header + `GoalBar` so the home page matches the plain path.
