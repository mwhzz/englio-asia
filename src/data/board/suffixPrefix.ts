import type { BoardTopic } from './types.ts';

/** Suffix and prefix: change the word form to fit the sentence. */
export const SUFFIX_PREFIX: BoardTopic = {
  id: 'suffix-prefix',
  exam: ['ssc', 'hsc'],
  title: 'Suffix and Prefix',
  titleBn: 'উপসর্গ ও প্রত্যয়',
  tip: 'আগে দেখো শূন্যস্থানে কী লাগবে (noun, verb, adjective) আর অর্থ উল্টো হবে কি না; তারপর ঠিক suffix বা prefix বসাও।',
  questions: [
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: We should ___ (beauty) our surroundings.', correct: 'beautify', wrong: ['beautiful', 'beautyfy'], why: 'should-এর পরে verb লাগবে; beauty-র সাথে -fy যোগ করে (y বদলে i) verb হয় beautify।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: She is a ___ (beauty) girl.', correct: 'beautiful', wrong: ['beautify', 'beautyful'], why: 'noun (girl)-এর আগে adjective লাগবে; beauty + -ful = beautiful (y বদলে i)।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: He is ___ (able) to walk because of his injury.', correct: 'unable', wrong: ['disable', 'enable'], why: 'আঘাতের কারণে হাঁটতে পারে না, তাই উল্টো অর্থের adjective লাগবে: un- + able = unable।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: The accident ___ (able) him for life.', correct: 'disabled', wrong: ['unabled', 'enabled'], why: 'এখানে past tense-এর verb লাগবে, অর্থ অক্ষম করে দেওয়া: dis- + able = disable, past রূপ disabled।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: Education ___ (able) us to think freely.', correct: 'enables', wrong: ['disables', 'unables'], why: 'সক্ষম করে তোলা অর্থে en- + able = enable; subject-টি একবচন বলে enables।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: The ___ (able) of the boy surprised everyone.', correct: 'ability', wrong: ['ableness', 'enable'], why: 'the-এর পরে noun লাগবে; able-এর noun রূপ ability (-ity)।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: The ___ (develop) of a country depends on education.', correct: 'development', wrong: ['developness', 'developed'], why: 'the-এর পরে noun লাগবে; develop + -ment = development।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: ___ (kind) is a great virtue.', correct: 'Kindness', wrong: ['Kindly', 'Unkind'], why: 'বাক্যের subject হিসেবে noun লাগবে; kind + -ness = kindness।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: His ___ (honest) is known to all.', correct: 'honesty', wrong: ['honestly', 'dishonest'], why: 'His-এর পরে noun লাগবে; honest + -y = honesty।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: The ___ (popular) of the singer is increasing.', correct: 'popularity', wrong: ['popularness', 'popularize'], why: 'the-এর পরে noun লাগবে; popular + -ity = popularity।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: We must ___ (modern) our agriculture.', correct: 'modernize', wrong: ['modernity', 'modernly'], why: 'must-এর পরে verb লাগবে; modern + -ize = modernize (আধুনিক করা)।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: The government is trying to ___ (large) the road.', correct: 'enlarge', wrong: ['largen', 'largely'], why: 'to-এর পরে verb লাগবে; en- + large = enlarge (বড় করা)।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: He ___ (danger) his life to save the child.', correct: 'endangered', wrong: ['dangered', 'dangerous'], why: 'এখানে past tense-এর verb লাগবে; en- + danger = endanger (বিপন্ন করা), past রূপ endangered।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: Smoking is ___ (harm) to health.', correct: 'harmful', wrong: ['harmless', 'harmness'], why: 'ধূমপান স্বাস্থ্যের ক্ষতি করে, তাই ক্ষতিকর অর্থে harm + -ful = harmful; harmless মানে উল্টো, নিরীহ।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: Don’t be ___ (patient); wait a little.', correct: 'impatient', wrong: ['unpatient', 'dispatient'], why: 'উল্টো অর্থ বোঝাতে patient-এর আগে im- বসে: impatient (অধৈর্য)।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: He was ___ (regular) in his studies, so he failed.', correct: 'irregular', wrong: ['unregular', 'disregular'], why: 'r দিয়ে শুরু শব্দের উল্টো অর্থে সাধারণত ir- বসে: irregular।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: It is ___ (legal) to drive without a licence.', correct: 'illegal', wrong: ['unlegal', 'dislegal'], why: 'l দিয়ে শুরু শব্দের উল্টো অর্থে সাধারণত il- বসে: illegal।' },
    { question: 'বন্ধনীর শব্দের সঠিক রূপ বসাও: Being ___ (courage), he faced the danger.', correct: 'courageous', wrong: ['encourage', 'couragely'], why: 'Being-এর পরে adjective লাগবে; courage + -ous = courageous (সাহসী)।' },
  ],
};
