# Englio brand

Two marks, two colour sets. Never merge the two marks into one (that was tried and rejected).

| Mark | What it is | Where it goes |
| --- | --- | --- |
| **App icon** (`app-icon*.svg`) | a bold lowercase "e" and a dot, like "e." | the phone's home screen, the Play Store icon, the browser tab, notifications |
| **Logo mark** (`logo-mark*.svg`) | the learning path: a start ring, a dotted path, the goal | next to the word "Englio": the app's welcome screen and student card, the website, certificates, the Play Store feature graphic, social posts |

## Colours

| Name | Hex | Use |
| --- | --- | --- |
| Blue night | `#2F3BD8` | the main brand colour: icon and logo tiles, the browser/status bar colour (`theme_color`) |
| Yellow dot | `#FFC93C` | the dot on blue night, and the full stop after "Englio" |
| Black | `#141A2E` | the dark version's tile; the word "Englio" on light backgrounds |
| Lime dot | `#C6F432` | the dot on black: dark mode and, later, Englio Plus |
| White | `#FFFFFF` | the "e", the path and the ring |

**Blue night** is the default everywhere. **Black-lime** is for dark backgrounds (the app's dark mode switches to it by itself) and for premium.

## Files

| File | For |
| --- | --- |
| `app-icon.svg` / `app-icon-dark.svg` | the app icon with rounded corners (previews, the website) |
| `app-icon-maskable.svg` | full-bleed icon for Android and iOS: the launcher cuts its own shape, so the art sits in the middle 80% |
| `logo-mark.svg` / `logo-mark-dark.svg` | the logo mark on its own |
| `logo.svg` / `logo-on-dark.svg` | mark + "Englio." for light / dark backgrounds |
| `png/play-store-icon-512.png` | upload as the Play Store app icon (512 × 512) |
| `png/app-icon-1024.png`, `png/app-icon-dark-1024.png` | large app icon images |
| `png/logo-mark-1024.png`, `png/logo-mark-dark-1024.png` | large logo mark images |
| `png/logo.png`, `png/logo-on-dark.png` | the logo with the word, transparent background |

The app's own copies are in `public/` (`icon.svg`, `icon-maskable.svg`, `icon-badge.svg` and their PNGs) and in `src/components/Logo.tsx`. After changing an SVG, run `PW=@playwright/test node scripts/make-icons.cjs` to redraw every PNG. Changing the app icon also needs a new Android build (see `docs/PLAY_STORE.md`), since the phone keeps the icon from the installed app.

## Rules

- Keep space around a mark at least as wide as its corner radius; don't put it on busy photos.
- Don't recolour, stretch, rotate, outline or add shadows to the marks (the app's soft drop shadow under the logo is the one exception).
- The word is **Englio** in Inter ExtraBold, always followed by the dot. Never "ENGLIO" or "englio".
- On blue night or black backgrounds use white for the word; on white use black `#141A2E`.
- The notification badge (`public/icon-badge.svg`) is the "e." in plain white, because Android shows only its shape.
