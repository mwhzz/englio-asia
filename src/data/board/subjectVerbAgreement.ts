import type { BoardTopic } from './types.ts';

/** Subject-verb agreement: each/every, either/neither, number of, as well as. */
export const SUBJECT_VERB_AGREEMENT: BoardTopic = {
  id: 'subject-verb-agreement',
  exam: ['ssc', 'hsc'],
  title: 'Subject-Verb Agreement',
  titleBn: 'কর্তা ও ক্রিয়ার মিল',
  tip: 'আসল subject কোনটা খুঁজে বের করো: each, every, one of-এর পরে verb-টি একবচন; either/neither ... or/nor-এ verb কাছের subject অনুযায়ী।',
  questions: [
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Each of the boys ___ a pen.', correct: 'has', wrong: ['have', 'are'], why: 'Each of-এর পরে plural noun থাকলেও আসল subject হলো each, তাই verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Every man and woman ___ present at the meeting.', correct: 'was', wrong: ['were', 'are'], why: 'and দিয়ে যুক্ত দুটি noun-এর আগে every বা each থাকলে verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Either Rahim or his brothers ___ responsible for this.', correct: 'are', wrong: ['is', 'was'], why: 'either ... or দিয়ে যুক্ত হলে verb কাছের subject (brothers, plural) অনুযায়ী হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Neither the teacher nor the students ___ present.', correct: 'were', wrong: ['was', 'is'], why: 'neither ... nor-এ verb কাছের subject অনুযায়ী হয়; এখানে students বহুবচন, তাই were।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Neither the students nor the teacher ___ present.', correct: 'was', wrong: ['were', 'are'], why: 'neither ... nor-এ verb কাছের subject অনুযায়ী হয়; এখানে teacher একবচন, তাই was।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: One of the boys ___ absent today.', correct: 'is', wrong: ['are', 'were'], why: 'One of the + plural noun-এর আসল subject হলো one, তাই verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: A number of students ___ absent today.', correct: 'are', wrong: ['is', 'was'], why: 'A number of মানে অনেকগুলো, তাই এর পরের verb-টি বহুবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: The number of students ___ increasing every year.', correct: 'is', wrong: ['are', 'were'], why: 'The number of মানে সংখ্যাটি, যা একটি জিনিস; তাই verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: The teacher as well as his students ___ present.', correct: 'was', wrong: ['were', 'are'], why: 'as well as, with, along with দিয়ে যুক্ত হলে verb প্রথম subject (teacher) অনুযায়ী হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Rahim, with his friends, ___ coming here.', correct: 'is', wrong: ['are', 'were'], why: 'with দিয়ে যুক্ত অংশ subject-এর অংশ নয়; আসল subject হলো Rahim, তাই verb-টি একবচন।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: The cattle ___ grazing in the field.', correct: 'are', wrong: ['is', 'was'], why: 'cattle, people, police সবসময় plural অর্থে ব্যবহৃত হয়, তাই verb-টি বহুবচন।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Bread and butter ___ my favourite breakfast.', correct: 'is', wrong: ['are', 'were'], why: 'and দিয়ে যুক্ত দুটি শব্দ মিলে একটি জিনিস বোঝালে (bread and butter) verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Mathematics ___ a difficult subject for many students.', correct: 'is', wrong: ['are', 'were'], why: 'Mathematics, physics, economics দেখতে plural হলেও বিষয়ের নাম, তাই verb-টি একবচন।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: The news ___ true.', correct: 'is', wrong: ['are', 'were'], why: 'news শব্দটি s দিয়ে শেষ হলেও singular, তাই verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Ten miles ___ a long distance.', correct: 'is', wrong: ['are', 'were'], why: 'দূরত্ব, সময় বা টাকার পরিমাণকে একটি একক হিসেবে ধরলে verb-টি একবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Many a student ___ failed in the exam.', correct: 'has', wrong: ['have', 'are'], why: 'Many a-এর পরে একবচন noun এবং একবচন verb বসে।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: The poor ___ suffering a lot.', correct: 'are', wrong: ['is', 'was'], why: 'the + adjective (the poor) একটি শ্রেণির মানুষকে বোঝায়, তাই verb-টি বহুবচন হয়।' },
    { question: 'শূন্যস্থানে সঠিক verb বসাও: Our family ___ a large one.', correct: 'is', wrong: ['are', 'were'], why: 'দলবাচক noun পুরো দলকে একটি একক হিসেবে বোঝালে verb-টি একবচন হয়।' },
  ],
};
