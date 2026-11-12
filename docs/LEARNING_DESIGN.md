# How lessons are arranged so nobody gives up

The owner's rules for every lesson, unit and batch (English and Arabic, for Bangla speakers). Writers, teachers and coding agents follow them; `docs/SYLLABUS.md` is *what* is taught, this file is *how*.

## The goal of A1 (first, before anything else)

After A1 a learner can, in English and in Arabic:

- greet, say who they are, where they're from, what they do and what they like (introduce themselves);
- ask and answer simple everyday questions (food, family, time, prices, the way, a phone call, the doctor);
- know a few grammar rules, each explained in one or two plain Bangla sentences;
- in Arabic: read and write all 28 letters with zabar, zer, pesh and sukun.

Speaking stays light and simple: short sentences people really say, never "textbook" sentences.

## Learning is free

Every lesson is free. No unit is locked behind Plus (admin → সেটিংস: no Plus-only units, "Englio Plus কেনা" off). Nobody should ever stop learning because of money.

## The psychology rules

1. **A win in the first minute.** A unit starts with words the learner half knows already: Bangla loanwords (bus, doctor, phone, ticket, চা = tea) or the simplest letters. The first questions are picking and matching, not typing.
2. **Small steps.** One new idea per lesson. 4–7 new words, 5 sentences. Arabic letters come 4–7 at a time, grouped by shape (ب ت ث ن differ only by dots).
3. **Only use what was taught.** A sentence uses words and letters from this or earlier lessons. The few exceptions (هَذَا, هَذِهِ, نَعَمْ) are taught as "sight words" in a tip first.
4. **Same order in every unit:** words 1 → words 2 → grammar → conversation → unit test. The learner always knows what comes next, and every unit ends with a real conversation they can use today (that's the reward).
5. **Mistakes teach, they don't punish.** Every blank and grammar question has a `why` in plain Bangla: the feedback explains, it never just says "wrong". Wrong options are mistakes Bangla speakers really make (I is, He go, Did you went), so the learner recognises their own mistake.
6. **Real life, Bangladeshi life.** Names, places, food and situations from the learner's life (Rahim, Sylhet, panta bhat, bKash, the bazar, Eid, a job abroad). Arabic aims at the Gulf workplace and daily life.
7. **Respect.** Adults learn here too: no childish sentences, no talking down. Polite আপনি is available (Profile).
8. **Repeat, then repeat later.** Each word comes back in a sentence in the same lesson, again in the unit test, and again in later units.
9. **Short.** A lesson takes 3–5 minutes. Better 5 minutes every day than one hour once.
10. **Plain look.** No emoji in lessons (owner's rule); the design follows `docs/STYLE_GUIDE.md`.

What the app already does for motivation (keep it): the first day can't be failed, hearts refill, streak and league, XP, unit certificates, adaptive lessons (easier mix when a learner struggles, `lib/difficulty.ts`), reminders. If hearts make beginners quit, the owner can switch hearts off (admin → সেটিংস → হার্ট).

## How the engine does it

- **A lesson** (`src/lib/lesson.ts`): every new word is picked once (wrong choices are the lesson's other new words), matched, used in sentences and blanks, then a second look at the end (match all, pick three again). Earlier words of the unit are matched again (`src/lib/unitReview.ts`).
- **Coming back over the days** (`src/lib/review.ts`, `src/lib/returning.ts`): when a lesson is finished its 5 words join the review list and come back after 1, 2, 4 and 7 days; a missed item starts over. Every lesson ends with what's due today: up to 4 matches (20 words) and 2 other items.
- **Measured** (`server/wordExposure.test.ts`): a learner doing a lesson a day sees each word 6+ times in its lesson and 15+ times in its first two weeks.
- **Nothing before it's taught** (`src/lib/lessonCheck.ts`, tested in `server/taughtFirst.test.ts`): every word (and in Arabic every letter) in a lesson was taught in it or before; `وَ` and `ال` in front of a taught word count once taught; people's names (Rina, Rahim, Karim) are free. Arabic and English units 1–5 pass; English units 6–28 still use about 350 untaught words and are being rewritten.
- **Lesson check in the admin** (`src/admin/LessonCheck.tsx`, on every lesson page): new-word count (5), how often each word comes in the lesson and its unit (15+), and the words not taught yet. Use it while writing.
- **The learner's goal** (onboarding "why", `src/data/goalTopics.ts`): practice picks up to 3 of its 5 sentences from the goal's words, and units that serve the goal say so on the lesson's first screen.
- **New words highlighted, tap for the meaning** (`src/lib/gloss.ts`, `src/features/gloss/GlossText.tsx`) in sentences, blanks and conversations.
- **Arabic: letters, then reading, then words.** Reading lessons pair Arabic with its sound in Bangla letters (بَاب = বাব), so a learner can read any text with marks without knowing the meaning.
- The plan for what comes next (FSRS later): the engine report of 2026-11-12.

## Checklist for a new lesson

- [ ] One new idea; 4–7 words; 5 short, real sentences.
- [ ] Every blank, gap and grammar question has a `why` in Bangla.
- [ ] Wrong options are real learner mistakes, and only one option fits the Bangla meaning.
- [ ] Only words/letters already taught (or a sight word from a tip).
- [ ] The unit ends with a conversation the learner can use today.
- [ ] No emoji.
- [ ] It's in a `content/*.json` batch with a test that every question can be answered (`server/importLanguage.test.ts`).
