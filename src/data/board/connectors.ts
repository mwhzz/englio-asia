import type { BoardTopic } from './types.ts';

/** Connectors: linking words that join ideas the right way. */
export const CONNECTORS: BoardTopic = {
  id: 'connectors',
  exam: ['ssc', 'hsc'],
  title: 'Connectors',
  titleBn: 'সংযোজক শব্দ',
  tip: 'দুই অংশের সম্পর্ক দেখো: বিপরীত হলে however/although, ফল হলে therefore, যোগ হলে moreover, শর্ত হলে unless/otherwise।',
  questions: [
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He is poor. ___, he is honest.', correct: 'However', wrong: ['Therefore', 'Moreover'], why: 'দুটি বাক্যের ভাব বিপরীত (গরিব কিন্তু সৎ), তাই However বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He was ill. ___, he could not attend the meeting.', correct: 'Therefore', wrong: ['However', 'Otherwise'], why: 'প্রথম বাক্য কারণ, দ্বিতীয়টি তার ফল; ফল বোঝাতে Therefore বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He is a good student. ___, he is a good player.', correct: 'Moreover', wrong: ['However', 'Therefore'], why: 'আগের কথার সাথে নতুন তথ্য যোগ করতে Moreover (তাছাড়া) বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: Work hard; ___, you will fail.', correct: 'otherwise', wrong: ['therefore', 'moreover'], why: 'otherwise মানে তা না হলে; কাজটি না করলে কী হবে তা বোঝাতে বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: Hurry up, ___ you will miss the bus.', correct: 'or', wrong: ['and', 'but'], why: 'আদেশের পরে না মানলে কী হবে তা বোঝাতে or (নইলে) বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: ___ he is rich, he is not happy.', correct: 'Although', wrong: ['Because', 'Unless'], why: 'ধনী হওয়া আর সুখী না হওয়া বিপরীত ভাব, তাই Although বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: It was raining heavily. ___, we went out.', correct: 'Nevertheless', wrong: ['Therefore', 'Moreover'], why: 'বৃষ্টি সত্ত্বেও বের হওয়া বিপরীত ভাব, তাই Nevertheless (তবুও) বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: You will not pass ___ you work hard.', correct: 'unless', wrong: ['if', 'because'], why: 'unless মানে if not (যদি না); কঠোর পরিশ্রম না করলে পাস করবে না।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: ___ his illness, he attended the class.', correct: 'In spite of', wrong: ['Although', 'Because of'], why: 'noun (his illness)-এর আগে বিপরীত ভাব বোঝাতে In spite of বসে; Although-এর পরে পুরো clause লাগে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: ___ the bad weather, the match was held.', correct: 'Despite', wrong: ['Although', 'Because'], why: 'noun-এর আগে বিপরীত ভাব বোঝাতে Despite বসে; despite-এর পরে of বসে না।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: She went to bed early ___ she could get up early.', correct: 'so that', wrong: ['because', 'although'], why: 'উদ্দেশ্য বোঝাতে so that বসে, এর পরে সাধারণত can/could/may/might থাকে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He ran fast ___ he could catch the train.', correct: 'so that', wrong: ['though', 'unless'], why: 'ট্রেন ধরার উদ্দেশ্যে দৌড়ানো, তাই উদ্দেশ্য বোঝাতে so that বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: You can stay here ___ you keep quiet.', correct: 'as long as', wrong: ['unless', 'although'], why: 'as long as মানে যতক্ষণ বা যদি; থাকার শর্ত বোঝাতে বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: Take an umbrella ___ it rains.', correct: 'in case', wrong: ['unless', 'although'], why: 'in case মানে যদি এমন হয়, সেই সম্ভাবনার জন্য আগে থেকে প্রস্তুতি বোঝায়।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He is not only intelligent ___ hardworking.', correct: 'but also', wrong: ['and also', 'but too'], why: 'not only-এর সাথে জোড় হিসেবে but also বসে।' },
    { question: 'শূন্যস্থানে সঠিক connector বসাও: He studied hard; ___, he passed with good marks.', correct: 'as a result', wrong: ['however', 'otherwise'], why: 'পড়াশোনার ফল হিসেবে ভালো নম্বর পাওয়া, তাই ফল বোঝাতে as a result বসে।' },
  ],
};
