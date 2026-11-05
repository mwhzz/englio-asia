import type { BoardTopic } from './types.ts';

/** Articles: a, an, the, and when to leave them out. */
export const ARTICLES: BoardTopic = {
  id: 'articles',
  exam: ['ssc', 'hsc'],
  title: 'Articles',
  titleBn: 'আর্টিকেল',
  tip: 'বানান নয়, উচ্চারণ দেখে a/an বসাও: vowel sound হলে an, consonant sound হলে a।',
  questions: [
    { question: 'শূন্যস্থানে সঠিক article বসাও: He is ___ honest man.', correct: 'an', wrong: ['a', 'কোনো article বসবে না'], why: 'honest-এর h উচ্চারিত হয় না, শব্দটি শুরু হয় vowel sound দিয়ে, তাই an বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: He is ___ university student.', correct: 'a', wrong: ['an', 'কোনো article বসবে না'], why: 'university-র উচ্চারণ শুরু হয় "ইউ" (y) ধ্বনি দিয়ে, যা consonant sound, তাই a বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: I saw ___ one-eyed man in the market.', correct: 'a', wrong: ['an', 'the'], why: 'one-এর উচ্চারণ "ওয়ান" (w ধ্বনি), যা consonant sound, তাই a বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: He gave me ___ hour to finish the work.', correct: 'an', wrong: ['a', 'কোনো article বসবে না'], why: 'hour-এর h উচ্চারিত হয় না, উচ্চারণ শুরু হয় vowel sound দিয়ে, তাই an বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: Mr. Karim is ___ M.A. in English.', correct: 'an', wrong: ['a', 'the'], why: 'M অক্ষরের উচ্চারণ "এম", যা vowel sound দিয়ে শুরু, তাই an বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: He is ___ European.', correct: 'a', wrong: ['an', 'কোনো article বসবে না'], why: 'European-এর উচ্চারণ শুরু হয় "ইউ" (y) ধ্বনি দিয়ে, তাই vowel দিয়ে লেখা হলেও a বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: Every student must wear ___ uniform.', correct: 'a', wrong: ['an', 'কোনো article বসবে না'], why: 'uniform-এর উচ্চারণ "ইউনিফর্ম", শুরু হয় consonant (y) sound দিয়ে, তাই a বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: What ___ beautiful scene it is!', correct: 'a', wrong: ['an', 'the'], why: 'What দিয়ে শুরু exclamatory sentence-এ গণনাযোগ্য একবচন noun-এর আগে a/an বসে; beautiful consonant sound দিয়ে শুরু, তাই a।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: He is ___ useful member of our club.', correct: 'a', wrong: ['an', 'কোনো article বসবে না'], why: 'useful-এর উচ্চারণ "ইউসফুল", শুরু হয় consonant sound দিয়ে, তাই a বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: ___ sun rises in the east.', correct: 'The', wrong: ['A', 'An'], why: 'পৃথিবীতে একটিই আছে এমন জিনিসের (sun, moon, sky) আগে the বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: Mount Everest is ___ highest peak in the world.', correct: 'the', wrong: ['a', 'an'], why: 'Superlative-এর (highest, best) আগে সবসময় the বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: ___ Padma is a mighty river.', correct: 'The', wrong: ['A', 'কোনো article বসবে না'], why: 'নদী, সাগর, মহাসাগরের নামের আগে the বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: ___ Sundarbans is home to the Royal Bengal Tiger.', correct: 'The', wrong: ['A', 'কোনো article বসবে না'], why: 'কিছু বিশেষ ভৌগোলিক নাম, যেমন the Sundarbans, the Himalayas, এর আগে the বসে।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: ___ Quran is the holy book of the Muslims.', correct: 'The', wrong: ['A', 'An'], why: 'ধর্মগ্রন্থের নামের আগে the বসে: the Quran, the Bible, the Gita।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: ___ rich are not always happy.', correct: 'The', wrong: ['A', 'কোনো article বসবে না'], why: 'Adjective-এর আগে the বসালে তা পুরো শ্রেণিকে বোঝায় (the rich = ধনী লোকেরা) এবং plural হয়।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: We have ___ lunch at one o’clock.', correct: 'কোনো article বসবে না', wrong: ['a', 'the'], why: 'সাধারণভাবে breakfast, lunch, dinner-এর মতো খাবারের নামের আগে article বসে না।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: We speak ___ Bangla at home.', correct: 'কোনো article বসবে না', wrong: ['a', 'the'], why: 'ভাষার নামের (Bangla, English) আগে article বসে না; তবে language শব্দটি থাকলে বসে: the Bangla language।' },
    { question: 'শূন্যস্থানে সঠিক article বসাও: Dhaka stands on ___ Buriganga.', correct: 'the', wrong: ['a', 'কোনো article বসবে না'], why: 'Buriganga একটি নদী, আর নদীর নামের আগে the বসে।' },
  ],
};
