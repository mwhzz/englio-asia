import type { BoardTopic } from './types.ts';

/** Completing sentences: pick the ending that fits the structure. */
export const COMPLETING_SENTENCES: BoardTopic = {
  id: 'completing-sentences',
  exam: ['ssc', 'hsc'],
  title: 'Completing Sentences',
  titleBn: 'বাক্য সম্পূর্ণকরণ',
  tip: 'বাক্যের শুরুর কাঠামো দেখো: If + present হলে will, It is time হলে past, No sooner হলে than, Hardly হলে when, lest হলে should।',
  questions: [
    { question: 'বাক্যটি সম্পূর্ণ করো: If you work hard, ___.', correct: 'you will succeed', wrong: ['you would succeed', 'you succeeded'], why: 'If-clause present indefinite হলে পরের অংশে will + verb বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: If I were a king, ___.', correct: 'I would help the poor', wrong: ['I will help the poor', 'I helped the poor'], why: 'If I were দিয়ে অবাস্তব কল্পনা বোঝালে পরের অংশে would + verb বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: If he had come earlier, ___.', correct: 'he would have met me', wrong: ['he would meet me', 'he will meet me'], why: 'If-clause past perfect হলে পরের অংশে would have + V3 বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Had I been a bird, ___.', correct: 'I would have flown to you', wrong: ['I will fly to you', 'I would flown to you'], why: 'Had I been = If I had been, তাই পরের অংশে would have + V3 বসে; fly-এর V3 flown।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: It is high time ___.', correct: 'we changed our bad habits', wrong: ['we will change our bad habits', 'we have changed our bad habits'], why: 'It is high time-এর পরে subject + verb-এর past form বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: No sooner had he left the house ___.', correct: 'than it started to rain', wrong: ['when it started to rain', 'then it started to rain'], why: 'No sooner had ...-এর পরের অংশ সবসময় than দিয়ে শুরু হয়।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Hardly had we reached the station ___.', correct: 'when the train left', wrong: ['than the train left', 'then the train left'], why: 'Hardly/Scarcely had ...-এর পরের অংশ when বা before দিয়ে শুরু হয়, than দিয়ে নয়।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: He walked fast lest ___.', correct: 'he should miss the bus', wrong: ['he should not miss the bus', 'he would not miss the bus'], why: 'lest নিজেই না-বাচক অর্থ দেয় (যাতে না), তাই এর পরে should বসে, not বসে না।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: I would rather starve ___.', correct: 'than beg', wrong: ['than begging', 'to beg'], why: 'would rather ... than-এর পরে verb-এর base form বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: It is a long time since ___.', correct: 'I last saw him', wrong: ['I had seen him', 'I see him'], why: 'since-এর আগের অংশ present tense হলে since-এর পরে past indefinite বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: He talks as if ___.', correct: 'he knew everything', wrong: ['he know everything', 'he will know everything'], why: 'as if দিয়ে কাল্পনিক তুলনা বোঝালে পরে past form বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Unless you study regularly, ___.', correct: 'you will not pass', wrong: ['you will pass', 'you would not passed'], why: 'Unless মানে যদি না; নিয়মিত না পড়লে পাস করবে না, আর এর পরের অংশে will + verb বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Though he is poor, ___.', correct: 'he is honest', wrong: ['but he is honest', 'so he is honest'], why: 'Though দিয়ে বাক্য শুরু হলে পরের অংশে but বসে না।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Since he was ill, ___.', correct: 'he could not go to school', wrong: ['so he could not go to school', 'but he could not go to school'], why: 'Since দিয়ে কারণ বোঝালে পরের অংশে so বা but যোগ করতে হয় না।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: The more you read, ___.', correct: 'the more you learn', wrong: ['more you learn', 'the most you learn'], why: 'The + comparative ..., the + comparative কাঠামোতে দুই অংশেই the + comparative বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: He is so weak that ___.', correct: 'he cannot walk', wrong: ['he cannot to walk', 'he can walk'], why: 'so ... that-এর পরে ফল বোঝাতে subject + cannot + verb-এর base form বসে।' },
    { question: 'বাক্যটি সম্পূর্ণ করো: Would that ___.', correct: 'I were a child again', wrong: ['I am a child again', 'I will be a child again'], why: 'Would that দিয়ে অবাস্তব ইচ্ছা প্রকাশ করলে পরে were/past form বসে।' },
  ],
};
