# Englio course plan: A1 to B2

The whole English course for Bangla speakers, from the first words (A1) to confident everyday and exam English (B2), on the CEFR scale. Each unit has 2–3 lessons of about 15 questions (6 words, 5 sentences, blanks, one gap text, one grammar point, one dialogue) and tips. About 80 units in all; a learner doing one lesson a day needs about 6 months to finish.

## What a unit is

Every unit is complete on its own: when a learner finishes its lessons, they know everything in it.

1. **Words 1** and **Words 2**: 6 words each, with 5 sentences using them and blanks (each blank says *why*).
2. **Grammar**: the unit's grammar point, with a gap text and 1–2 "which sentence is right?" questions.
3. **Conversation**: the words and grammar in a real-life dialogue or two.
4. **Unit test**: built by the app from all four lessons; passing it gives the unit's certificate.

Plus at least 2 tips (the unit's guidebook). `server/importLanguage.test.ts` checks every batch file against this (4+ lessons, 16+ words, grammar, a gap text, a dialogue, 2+ tips) and that every question can be answered.

Status: **live** = learners have it; **draft** = written, waiting for a teacher's check (admin → লেসন, it shows খসড়া); **planned** = not written yet.

## How a batch is added and checked

1. A batch is written as a JSON file in `content/` (same format as the Arabic starter; the meanings in `bn` / `titleBn`).
2. The owner opens admin → ভাষা → বাংলা → **JSON থেকে যোগ করো** and picks the file. Everything is checked first; nothing is added if anything is wrong. Lessons come in as **খসড়া**: learners don't see them.
3. A teacher opens each lesson (admin → লেসন), plays it with **প্রিভিউ**, fixes anything (every change is kept in ইতিহাস ও ট্র্যাশ), records audio if wanted (শব্দ, অডিও pages), and switches it to **প্রকাশিত**.
4. The tests (`server/importLanguage.test.ts`) check that every question in a batch file can be answered.

## A1: first words and survival English

The A1 goal and the rules for arranging lessons (so nobody gives up): `docs/LEARNING_DESIGN.md`. Lessons 1–2 (1–3 in unit 1) are live; lessons 3–4 of every unit (grammar + conversation; unit 1 gets "All about me", introducing yourself) are in `content/bn-a1-more.json`, draft.

| # | Unit | Grammar and focus | Status |
| --- | --- | --- | --- |
| 1 | First Steps | greetings, I am / you are | live |
| 2 | Family | my / your / his / her, a / an | live |
| 3 | Food & Drink | I like / I don't like, some | live |
| 4 | Numbers & Time | numbers, What time is it? | live |
| 5 | Daily Life | present simple (I get up…) | live |
| 6 | Travel | transport, by bus / by train | live |
| 7 | At the Market | How much?, plurals | live |
| 8 | At School | classroom words, imperatives | live |
| 9 | Weather | It is hot / raining, seasons | live |
| 10 | On the Phone | phone phrases, can I speak to…? | live |
| 11 | At the Doctor | body, I have a fever | live |

## A1+ to A2: everyday life (batch 01, `content/bn-batch-01.json`, 4 lessons per unit, 40 lessons)

| # | Unit | Grammar and focus | Status |
| --- | --- | --- | --- |
| 12 | My Home | there is / there are, in / on / under | live |
| 13 | Clothes & Shopping | this / these, How much is / are? | draft |
| 14 | Free Time | like + -ing, can / can't | draft |
| 15 | Jobs & Work | present simple he works, What do you do? | draft |
| 16 | In Town | next to / opposite / near, directions | draft |
| 17 | Last Weekend | was / were, past simple -ed | draft |
| 18 | Health & Body | I have a…, should | draft |
| 19 | Plans | going to, tomorrow / next week | draft |
| 20 | Feelings & Opinions | because, I think…, -ed / -ing adjectives | draft |
| 21 | Nature & Comparing | -er than, the -est | draft |

## A2: telling stories and getting things done (batch 02 = units 22–28, `content/bn-batch-02.json`, draft; batch 03 = units 29–35, planned)

| # | Unit | Grammar and focus |
| --- | --- | --- |
| 22 | A Day Out | past simple irregular (went, saw, ate) |
| 23 | Questions about the past | did you…? / didn't |
| 24 | Food and Cooking | countable / uncountable, much / many |
| 25 | Festivals (Eid, Pohela Boishakh) | dates, months, ordinal numbers |
| 26 | People I Know | describing character, have got |
| 27 | Sports | adverbs (quickly, well), how often |
| 28 | Technology & Phones | present continuous (I am using…) |
| 29 | Village and City | comparing (more … than, as … as) |
| 30 | Rules | must / mustn't / have to |
| 31 | Invitations | Would you like…? Let's… |
| 32 | Holidays | will for decisions and promises |
| 33 | Money | numbers in hundreds and thousands, spending and saving |
| 34 | Animals | a / an / the, general plurals |
| 35 | Review A2 | mixed review + unit test |

## B1: independent speaker (batch 04–06, planned)

| # | Unit | Grammar and focus |
| --- | --- | --- |
| 36 | Experiences | present perfect (Have you ever…?) |
| 37 | Since and for | present perfect + since / for |
| 38 | Life Stories | past continuous (I was walking when…) |
| 39 | Future Plans and Hopes | will / going to / present continuous for future |
| 40 | If… (real) | first conditional |
| 41 | Work and Jobs abroad | job interviews, CV words, polite requests |
| 42 | Travel and Airports | airport, visa, passport, asking for help |
| 43 | Health and Hospital | describing symptoms, advice |
| 44 | News and Events | passive (present / past) |
| 45 | Environment | flood, cyclone, pollution, should / must |
| 46 | Relationships | relative clauses (who / which / that) |
| 47 | Reported Speech | said / told |
| 48 | Opinions | agreeing and disagreeing politely |
| 49 | Phrasal Verbs 1 | get up, look for, give up… |
| 50 | Emails and Letters | formal / informal writing |
| 51 | Banking and Mobile Money | instructions, sequences |
| 52 | Shopping Online | complaints, returns |
| 53 | Education | gerund / infinitive (want to, enjoy -ing) |
| 54 | Media and Social Media | quantifiers (a few, a lot of) |
| 55 | Review B1 | mixed review + unit test |

## B2: confident English (batch 07–09, planned)

| # | Unit | Grammar and focus |
| --- | --- | --- |
| 56 | If I were… | second conditional |
| 57 | Regrets | third conditional, wish |
| 58 | Modals of deduction | must / might / can't have |
| 59 | Passive (all tenses) | advanced passive, have something done |
| 60 | Linking ideas | although, however, despite |
| 61 | Presentations | signposting language |
| 62 | Meetings at work | suggesting, interrupting politely |
| 63 | Phrasal Verbs 2 | three-part verbs |
| 64 | Idioms | everyday idioms |
| 65 | Debate | persuasive language |
| 66 | Science and Technology | noun phrases, formal register |
| 67 | Health and Society | cause and effect |
| 68 | Culture and Travel | describing places in detail |
| 69 | Money and Business | numbers, trends, graphs |
| 70 | Law and Rights | formal vocabulary |
| 71 | Writing an essay | paragraphs, topic sentences |
| 72 | Formal letters and applications | Bangladesh exam formats |
| 73 | Listening to fast English | connected speech |
| 74 | Pronunciation | stress and intonation |
| 75 | Review B2 | mixed review + unit test |

## Arabic (for Arabic speakers)

Meanings, tips and explanations in Modern Standard Arabic, drafted by AI: a native speaker checks them in the admin before Arabic goes live (admin → ভাষা → আরবি → চালু).

| Units | File | What | Status |
| --- | --- | --- | --- |
| 1–3 First Steps, Family, Food & Drink | `content/ar-starter.json` + `content/ar-starter-more.json` | 4 lessons each | draft (starter on the server; add the "more" file) |
| 4–11 Numbers & Time, Daily Life, At the Market, At School, Weather, Travel, On the Phone, At the Doctor | `content/ar-batch-01.json` | 4 lessons each, 32 lessons | draft |
| 12+ | the Bangla plan above, translated | | planned |

The app's own text in Arabic: `content/ui/ar.json` (editable in admin → অ্যাপের লেখা).

## Learning Arabic (for Bangla speakers, course `bn-ar`)

A second course for Bangla speakers: the app stays in Bangla, and what's learned is Arabic (Modern Standard
Arabic, the Gulf workplace in mind). In these files the `en` fields hold the Arabic, `bn` its Bangla meaning.
The learner picks "কী শিখবে? English · العربية" on the first screen or in Profile; XP and streak are shared.
Create it in admin → ভাষা → "আরবি শেখা" (code `bn-ar`), then import **the letters file first** (`bn-ar-letters.json`, so the letters come first), then `bn-ar-batch-01.json`. Needs an Arabic teacher's check.

| # | Unit | Focus | File | Status |
| --- | --- | --- | --- | --- |
| L1–L3 | الحروف ١–٣ · আরবি হরফ | letters 5 at a time (ا ب ت ن ي → د ر و م ه → س ش ك ل ذ → ع ج ح خ ة → ث ز ص ض ط → ظ غ ف ق ء), zabar/zer/pesh/sukun/tashdid, long vowels, and reading lessons (Arabic → its sound in Bangla letters, no meaning needed) | `content/bn-ar-letters.json` | live |
| L4 | اِقْرَأْ · পড়া অনুশীলন | all letters, ال (sun and moon letters), tanween, reading বিসমিল্লাহ | same | live |
| L5 | أَوَّلُ كَلَام · প্রথম কথা | first words with meaning: أَنَا, وَ, هَذَا/هَذِهِ, هَلْ/نَعَمْ/لَا, عِنْدِي | same | live |
| 6–11 | সালাম ও পরিচয় · পরিবার · সংখ্যা ও সময় · খাবার · আমার দিন · কাজ ও ভ্রমণ | 5 new words a lesson, nothing before it is taught | `content/bn-ar-batch-01.json` (rewritten 2026-11-12) | live |
| 1 | السلام عليكم · সালাম ও পরিচয় | greetings, أنا/أنت/هو/هي, no "is" in Arabic | `content/bn-ar-batch-01.json` | draft |
| 2 | العائلة · পরিবার | family, هذا/هذه, ة for feminine, ـي = my | same | draft |
| 3 | الأرقام والوقت · সংখ্যা ও সময় | numbers 1–10, time, days | same | draft |
| 4 | الطعام والشراب · খাবার ও পানীয় | food, أريد/تريد, ال | same | draft |
| 5 | الحياة اليومية · প্রতিদিনের জীবন | أ/ت/ي verb forms, إلى/في | same | draft |
| 6 | العمل والسفر · কাজ ও ভ্রমণ | work, airport, أين/كم, asking for help | same | draft |
| 7+ | past tense, numbers 11–100, shopping, health, housing, A2 | | | planned |

## Beside the path

- **Grammar tab:** 34 topics today; each new grammar point above gets a topic (explanation in Bangla, examples, quiz).
- **Stories:** about one per unit, at the unit's level.
- **SSC/HSC board prep:** stays separate (15 topics, 257 questions today).
- **Adult track (job / other learners):** units 15, 16, 18, 41–43, 51 first, with polite আপনি wording.
- **Audio:** every word and sentence can get a recording on the admin's শব্দ / অডিও pages; until then the phone's voice reads it.

## Status (2026-11-12)

Live: English 28 units / 112 lessons (units 1–28, 4 lessons each, 5 sections in `src/data/sections.ts`); Arabic for Bangla speakers 11 units / 45 lessons (3 sections). All AI-written content still wants a teacher's check.
