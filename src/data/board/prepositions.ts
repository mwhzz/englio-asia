import type { BoardTopic } from './types.ts';

/** Prepositions: time, place, between/among, by/with, and fixed pairs like fond of. */
export const PREPOSITIONS: BoardTopic = {
  id: 'prepositions',
  exam: ['ssc', 'hsc'],
  title: 'Prepositions',
  titleBn: 'প্রিপজিশন',
  tip: 'সময়ের জন্য: সাল/মাসে in, দিন/তারিখে on, নির্দিষ্ট সময়ে at; আর fond of, consist of-এর মতো জোড়গুলো মুখস্থ রাখো।',
  questions: [
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: He was born ___ 2008.', correct: 'in', wrong: ['on', 'at'], why: 'সাল, মাস বা ঋতুর আগে in বসে: in 2008, in May।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: We will meet ___ Friday.', correct: 'on', wrong: ['in', 'at'], why: 'বার বা তারিখের আগে on বসে: on Friday, on 21 February।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The train leaves ___ 6 p.m.', correct: 'at', wrong: ['in', 'on'], why: 'ঘড়ির নির্দিষ্ট সময়ের আগে at বসে: at 6 p.m., at noon।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: Divide the mangoes ___ the two brothers.', correct: 'between', wrong: ['among', 'with'], why: 'দুইজনের মধ্যে ভাগ বোঝাতে between, দুইয়ের বেশি হলে among।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The money was distributed ___ the poor.', correct: 'among', wrong: ['between', 'within'], why: 'the poor মানে অনেক গরিব মানুষ; দুইয়ের বেশির মধ্যে ভাগ বোঝাতে among বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: He has been ill ___ last Monday.', correct: 'since', wrong: ['for', 'from'], why: 'কাজ শুরুর নির্দিষ্ট সময় (last Monday) বোঝাতে perfect tense-এর সাথে since বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: She has lived here ___ ten years.', correct: 'for', wrong: ['since', 'from'], why: 'সময়ের পরিমাণ বা দৈর্ঘ্য (ten years) বোঝাতে for বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The letter was written ___ a pen.', correct: 'with', wrong: ['by', 'from'], why: 'কোনো যন্ত্র বা উপকরণ দিয়ে কাজ করা বোঝাতে with বসে; by বসে কর্তার আগে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The letter was written ___ Karim.', correct: 'by', wrong: ['with', 'from'], why: 'Passive voice-এ কাজটি কে করেছে (কর্তা) বোঝাতে by বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The boys are swimming ___ the pond.', correct: 'in', wrong: ['into', 'at'], why: 'কোনো কিছুর ভেতরে অবস্থান বোঝাতে in; বাইরে থেকে ভেতরে ঢোকার গতি বোঝাতে into।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: He walked ___ the room and switched on the light.', correct: 'into', wrong: ['at', 'on'], why: 'বাইরে থেকে ভেতরে প্রবেশের গতি বোঝাতে into বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: My sister is fond ___ music.', correct: 'of', wrong: ['with', 'for'], why: 'fond-এর পরে সবসময় of বসে: fond of (কোনো কিছুর প্রতি অনুরাগী)।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The teacher was angry ___ the boy.', correct: 'with', wrong: ['on', 'to'], why: 'কোনো ব্যক্তির উপর রাগ বোঝাতে angry with বসে; কোনো ঘটনা বা আচরণের উপর রাগ হলে angry at।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: Water consists ___ hydrogen and oxygen.', correct: 'of', wrong: ['in', 'with'], why: 'কোনো কিছু কী দিয়ে গঠিত তা বোঝাতে consist of বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The old man died ___ cholera.', correct: 'of', wrong: ['by', 'with'], why: 'রোগে মারা যাওয়া বোঝাতে die of বসে: die of cholera, die of cancer।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: He insisted ___ going there alone.', correct: 'on', wrong: ['in', 'at'], why: 'insist-এর পরে on বসে: insist on doing something।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: The rain prevented us ___ going out.', correct: 'from', wrong: ['to', 'of'], why: 'কাউকে কোনো কাজে বাধা দেওয়া বোঝাতে prevent someone from বসে।' },
    { question: 'শূন্যস্থানে সঠিক preposition বসাও: Rina is junior ___ me by two years.', correct: 'to', wrong: ['than', 'from'], why: 'junior, senior, superior, inferior, prefer-এর পরে than নয়, to বসে।' },
  ],
};
