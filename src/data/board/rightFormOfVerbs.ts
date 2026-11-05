import type { BoardTopic } from './types.ts';

/** Right form of verbs: tense sequence, since, it is time, as if, if-clauses, lest. */
export const RIGHT_FORM_OF_VERBS: BoardTopic = {
  id: 'right-form-of-verbs',
  exam: ['ssc', 'hsc'],
  title: 'Right Form of Verbs',
  titleBn: 'ক্রিয়ার সঠিক রূপ',
  tip: 'বাক্যের সংকেত শব্দ খোঁজো (every day, yesterday, since, it is time, as if, lest), তারপর সেই নিয়মে verb-এর রূপ বসাও।',
  questions: [
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: He ___ (go) to school every day.', correct: 'goes', wrong: ['go', 'going'], why: 'every day অভ্যাস বোঝায়, তাই present indefinite; subject হলো he (third person, একবচন), তাই verb-এর সাথে es যোগ হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: I ___ (see) him yesterday.', correct: 'saw', wrong: ['have seen', 'had seen'], why: 'yesterday অতীতের নির্দিষ্ট সময় বোঝায়, তাই past indefinite (V2) হয়; present perfect এর সাথে বসে না।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: Ten years have passed since my father ___ (die).', correct: 'died', wrong: ['has died', 'had died'], why: 'since-এর আগের অংশ present perfect হলে since-এর পরের অংশ past indefinite হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: It is high time we ___ (start) the work.', correct: 'started', wrong: ['start', 'will start'], why: 'It is time / It is high time-এর পরে subject থাকলে verb-এর past form বসে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: I would rather die than ___ (beg).', correct: 'beg', wrong: ['begging', 'to beg'], why: 'would rather ... than-এর পরে verb-এর base form বসে, to বা ing লাগে না।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: You had better ___ (leave) now.', correct: 'leave', wrong: ['to leave', 'left'], why: 'had better-এর পরে সবসময় verb-এর base form বসে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: He talks as if he ___ (be) a king.', correct: 'were', wrong: ['is', 'has been'], why: 'as if / as though দিয়ে কাল্পনিক তুলনা বোঝালে সব subject-এর সাথে be verb-এর রূপ were হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: I wish I ___ (be) a millionaire.', correct: 'were', wrong: ['am', 'will be'], why: 'wish দিয়ে অবাস্তব ইচ্ছা প্রকাশ করলে be verb-এর রূপ were হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: If it rains, we ___ (not go) out.', correct: 'will not go', wrong: ['would not go', 'did not go'], why: 'If-clause present indefinite হলে main clause-এ future indefinite (will/shall + verb) হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: If I ___ (be) a bird, I would fly in the sky.', correct: 'were', wrong: ['am', 'will be'], why: 'অবাস্তব কল্পনার If-clause-এ (main clause-এ would) be verb-এর রূপ were হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: If he had worked hard, he ___ (pass).', correct: 'would have passed', wrong: ['would pass', 'will pass'], why: 'If-clause past perfect হলে main clause-এ would have + V3 বসে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: Had I ___ (know) the news, I would have come.', correct: 'known', wrong: ['knew', 'know'], why: 'Had I known = If I had known; had-এর পরে verb-এর V3 বসে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: Walk fast lest you ___ (miss) the train.', correct: 'should miss', wrong: ['will miss', 'missed'], why: 'lest-এর পরে subject + should + verb-এর base form বসে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: The patient had died before the doctor ___ (come).', correct: 'came', wrong: ['had come', 'comes'], why: 'অতীতের দুটি কাজের মধ্যে আগেরটি past perfect হলে before-এর পরের কাজটি past indefinite হয়।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: After he ___ (finish) the work, he went home.', correct: 'had finished', wrong: ['has finished', 'finishes'], why: 'অতীতের দুটি কাজের মধ্যে আগে যেটি ঘটেছে তা past perfect হয়; after-এর পরে সাধারণত সেই আগের কাজটি থাকে।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: He told me that he ___ (go) to Dhaka the next day.', correct: 'would go', wrong: ['will go', 'goes'], why: 'Principal clause past tense (told) হলে subordinate clause-ও past হয়, তাই will বদলে would।' },
    { question: 'Verb-এর সঠিক রূপ বেছে নাও: The sun ___ (rise) in the east.', correct: 'rises', wrong: ['rise', 'rose'], why: 'চিরন্তন সত্য বোঝাতে present indefinite হয়; subject হলো the sun, যা একবচন, তাই rises।' },
  ],
};
