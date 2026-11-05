import type { BoardTopic } from './types.ts';

/** Tag questions: positive/negative tags and the special cases boards love. */
export const TAG_QUESTIONS: BoardTopic = {
  id: 'tag-questions',
  exam: ['ssc', 'hsc'],
  title: 'Tag Questions',
  titleBn: 'ট্যাগ প্রশ্ন',
  tip: 'বাক্য affirmative হলে tag হয় negative, আর negative হলে tag হয় affirmative; tag-এ একই সাহায্যকারী verb আর subject-এর pronoun বসে।',
  questions: [
    { question: 'সঠিক tag question বেছে নাও: He is a doctor, ___?', correct: 'isn’t he', wrong: ['is he', 'doesn’t he'], why: 'বাক্যটি affirmative এবং auxiliary is, তাই tag হয় negative: isn’t he।' },
    { question: 'সঠিক tag question বেছে নাও: I am right, ___?', correct: 'aren’t I', wrong: ['am not I', 'isn’t I'], why: 'I am দিয়ে affirmative বাক্যের tag হয় aren’t I।' },
    { question: 'সঠিক tag question বেছে নাও: Let’s go for a walk, ___?', correct: 'shall we', wrong: ['will you', 'don’t we'], why: 'Let’s (Let us) দিয়ে প্রস্তাব বোঝালে tag হয় shall we।' },
    { question: 'সঠিক tag question বেছে নাও: Shut the door, ___?', correct: 'will you', wrong: ['shall we', 'don’t you'], why: 'Imperative sentence (আদেশ/অনুরোধ) হলে tag হয় will you।' },
    { question: 'সঠিক tag question বেছে নাও: Don’t make a noise, ___?', correct: 'will you', wrong: ['do you', 'shall we'], why: 'Negative imperative sentence-এর tag হয় will you।' },
    { question: 'সঠিক tag question বেছে নাও: Nobody came to the party, ___?', correct: 'did they', wrong: ['didn’t they', 'doesn’t he'], why: 'Nobody নিজেই negative, তাই tag-টি affirmative হয়; nobody, everybody-র জন্য tag-এ they বসে।' },
    { question: 'সঠিক tag question বেছে নাও: Everybody likes him, ___?', correct: 'don’t they', wrong: ['doesn’t they', 'do they'], why: 'Everybody, everyone-এর tag-এ pronoun হিসেবে they বসে, আর they-এর সাথে don’t।' },
    { question: 'সঠিক tag question বেছে নাও: There is a book on the table, ___?', correct: 'isn’t there', wrong: ['isn’t it', 'is there'], why: 'There is / There are দিয়ে বাক্য শুরু হলে tag-এ there বসে: isn’t there।' },
    { question: 'সঠিক tag question বেছে নাও: She never tells a lie, ___?', correct: 'does she', wrong: ['doesn’t she', 'is she'], why: 'never বাক্যকে negative করে, তাই tag-টি affirmative হয়: does she।' },
    { question: 'সঠিক tag question বেছে নাও: He hardly works, ___?', correct: 'does he', wrong: ['doesn’t he', 'is he'], why: 'hardly, scarcely, seldom negative অর্থ দেয়, তাই tag-টি affirmative হয়।' },
    { question: 'সঠিক tag question বেছে নাও: Few people knew the answer, ___?', correct: 'did they', wrong: ['didn’t they', 'do they'], why: 'Few মানে প্রায় কেউ না, তাই এটি negative অর্থ দেয় এবং tag-টি affirmative হয়।' },
    { question: 'সঠিক tag question বেছে নাও: Nothing is impossible, ___?', correct: 'is it', wrong: ['isn’t it', 'are they'], why: 'Nothing negative অর্থ দেয়, তাই tag-টি affirmative; nothing, everything-এর tag-এ it বসে।' },
    { question: 'সঠিক tag question বেছে নাও: You have finished the work, ___?', correct: 'haven’t you', wrong: ['don’t you', 'have you'], why: 'সাহায্যকারী verb হলো have, তাই affirmative বাক্যের tag হয় haven’t you।' },
    { question: 'সঠিক tag question বেছে নাও: They went to Cox’s Bazar, ___?', correct: 'didn’t they', wrong: ['weren’t they', 'did they'], why: 'বাক্যে auxiliary নেই এবং verb-টি past (went), তাই tag-এ did ব্যবহার হয়: didn’t they।' },
    { question: 'সঠিক tag question বেছে নাও: He can swim, ___?', correct: 'can’t he', wrong: ['can he', 'doesn’t he'], why: 'Modal verb হিসেবে can থাকায় affirmative বাক্যের tag হয় can’t he।' },
    { question: 'সঠিক tag question বেছে নাও: You had better go now, ___?', correct: 'hadn’t you', wrong: ['didn’t you', 'had you'], why: 'had better-এর tag-এ had ব্যবহার হয়: hadn’t you।' },
    { question: 'সঠিক tag question বেছে নাও: Rahim used to play football, ___?', correct: 'didn’t he', wrong: ['wasn’t he', 'did he'], why: 'used to-এর tag-এ সাধারণত did ব্যবহার হয়: didn’t he।' },
  ],
};
