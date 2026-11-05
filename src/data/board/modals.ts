import type { BoardTopic } from './types.ts';

/** Modals: can, could, may, might, must, should, ought to, used to, need, dare. */
export const MODALS: BoardTopic = {
  id: 'modals',
  exam: ['ssc', 'hsc'],
  title: 'Modals',
  titleBn: 'মোডাল ক্রিয়া',
  tip: 'Modal-এর পরে verb-এর base form বসে; শুধু ought ও used-এর পরে to লাগে।',
  questions: [
    { question: 'শূন্যস্থানে সঠিক modal বসাও: ___ I come in, sir?', correct: 'May', wrong: ['Must', 'Need'], why: 'ভদ্রভাবে অনুমতি চাইতে May বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: ___ you live long!', correct: 'May', wrong: ['Can', 'Must'], why: 'শুভকামনা বা দোয়া (optative) বোঝাতে May দিয়ে বাক্য শুরু হয়।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: He ___ swim when he was five.', correct: 'could', wrong: ['can', 'may'], why: 'অতীতের সামর্থ্য বোঝাতে could বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: You ___ obey the traffic rules.', correct: 'must', wrong: ['may', 'can'], why: 'বাধ্যবাধকতা বা কর্তব্য বোঝাতে must বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: Students ___ to be punctual.', correct: 'ought', wrong: ['should', 'must'], why: 'নৈতিক কর্তব্য বোঝাতে ought to বসে; শূন্যস্থানের পরে to আছে, আর should বা must-এর পরে to বসে না।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: I ___ go to the river every day when I was a child.', correct: 'used to', wrong: ['use to', 'am used to'], why: 'অতীতের নিয়মিত অভ্যাস বোঝাতে used to + verb-এর base form বসে।' },
    { question: 'শূন্যস্থানে সঠিক রূপ বসাও: I am used to ___ up early.', correct: 'getting', wrong: ['get', 'got'], why: 'be used to মানে কোনো কিছুতে অভ্যস্ত; এখানে to একটি preposition, তাই এর পরে verb + ing বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: You ___ not come tomorrow; it is a holiday.', correct: 'need', wrong: ['ought', 'used'], why: 'প্রয়োজন নেই বোঝাতে need not + verb-এর base form বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: How ___ you say so?', correct: 'dare', wrong: ['need', 'ought'], why: 'সাহস দেখানো বা রাগ প্রকাশ করতে How dare you বসে।' },
    { question: 'শূন্যস্থানে সঠিক রূপ বসাও: He dare not ___ the truth.', correct: 'tell', wrong: ['to tell', 'telling'], why: 'Modal হিসেবে dare not-এর পরে verb-এর base form বসে, to লাগে না।' },
    { question: 'শূন্যস্থানে সঠিক রূপ বসাও: You need not ___ there.', correct: 'go', wrong: ['to go', 'going'], why: 'Modal হিসেবে need not-এর পরে verb-এর base form বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: It is cloudy. It ___ rain today.', correct: 'may', wrong: ['need', 'dare'], why: 'সম্ভাবনা বোঝাতে may বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: The lights are on. He ___ be at home.', correct: 'must', wrong: ['dare', 'need'], why: 'যুক্তি দিয়ে প্রায় নিশ্চিত অনুমান বোঝাতে must বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: He worked hard so that he ___ pass.', correct: 'might', wrong: ['can', 'will'], why: 'past tense-এর বাক্যে so that-এর পরে might/could বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: If I were rich, I ___ help the poor.', correct: 'would', wrong: ['will', 'shall'], why: 'If I were দিয়ে অবাস্তব কল্পনা বোঝালে main clause-এ would বসে।' },
    { question: 'শূন্যস্থানে সঠিক modal বসাও: ___ you help me with this bag, please?', correct: 'Could', wrong: ['Must', 'Need'], why: 'ভদ্রভাবে অনুরোধ করতে Could/Would বসে।' },
  ],
};
