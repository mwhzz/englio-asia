import type { BoardTopic } from './types.ts';

/** Affirmative and negative: changing the form without changing the meaning. */
export const AFFIRMATIVE_NEGATIVE: BoardTopic = {
  id: 'affirmative-negative',
  exam: ['ssc', 'hsc'],
  title: 'Affirmative and Negative',
  titleBn: 'হ্যাঁ-বাচক ও না-বাচক',
  tip: 'অর্থ ঠিক রেখে রূপ বদলাও: only → none but (ব্যক্তি) / nothing but (বস্তু), always → never ... (বিপরীত শব্দ), must → cannot but, as soon as → no sooner ... than।',
  questions: [
    { question: 'Negative sentence-এ রূপান্তর করো: Only Rahim can do it.', correct: 'None but Rahim can do it.', wrong: ['Nothing but Rahim can do it.', 'Not only Rahim can do it.', 'None but Rahim cannot do it.'], why: 'ব্যক্তির আগে only থাকলে negative-এ None but বসে; বস্তুর আগে হলে Nothing but।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He has only a pen.', correct: 'He has nothing but a pen.', wrong: ['He has none but a pen.', 'He has not only a pen.', 'He has nothing a pen.'], why: 'বস্তুর আগে only থাকলে negative-এ nothing but বসে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He is always busy.', correct: 'He is never free.', wrong: ['He is never busy.', 'He is not always free.', 'He is not never busy.'], why: 'always-এর negative রূপে never বসে এবং পরের শব্দটির বিপরীত শব্দ (busy → free) বসে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: I must go there.', correct: 'I cannot but go there.', wrong: ['I cannot but going there.', 'I can but go there.', 'I cannot go there.'], why: 'must-এর negative রূপ cannot but + verb-এর base form।' },
    { question: 'Negative sentence-এ রূপান্তর করো: As soon as he came, they left.', correct: 'No sooner had he come than they left.', wrong: ['No sooner did he come then they left.', 'No sooner had he came than they left.', 'No sooner had he come when they left.'], why: 'As soon as-এর negative রূপ No sooner had + subject + V3 + than; than-এর বদলে then বা when বসে না।' },
    { question: 'Negative sentence-এ রূপান্তর করো: The box is too heavy for me to lift.', correct: 'The box is so heavy that I cannot lift it.', wrong: ['The box is so heavy that I can lift it.', 'The box is too heavy that I cannot lift it.', 'The box is so heavy that I cannot lift.'], why: 'too ... to-এর negative রূপ so ... that ... cannot; lift-এর object হিসেবে it যোগ করতে হয়।' },
    { question: 'Negative sentence-এ রূপান্তর করো: Everyone loves flowers.', correct: 'There is no one who does not love flowers.', wrong: ['There is no one who loves flowers.', 'Everyone does not love flowers.', 'There is no one who does love flowers.'], why: 'Everyone/Everybody-র negative রূপ There is no one who does not + verb; দুটি negative মিলে অর্থ affirmative থাকে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He is a good boy.', correct: 'He is not a bad boy.', wrong: ['He is not a good boy.', 'He is a not bad boy.', 'He is never a bad boy.'], why: 'adjective-এর বিপরীত শব্দ (good → bad) বসিয়ে not যোগ করলে অর্থ ঠিক থাকে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: I shall remember you.', correct: 'I shall never forget you.', wrong: ['I shall never remember you.', 'I shall not remember you.', 'I shall forget you never.'], why: 'remember-এর বিপরীত শব্দ forget বসিয়ে never/not যোগ করলে অর্থ ঠিক থাকে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: Everybody was present.', correct: 'Nobody was absent.', wrong: ['Nobody was present.', 'Everybody was not absent.', 'Nobody were absent.'], why: 'Everybody হয় Nobody, আর present-এর বিপরীত শব্দ absent বসে; nobody একবচন বলে was।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He tried every means.', correct: 'He left no means untried.', wrong: ['He left any means untried.', 'He did not try any means.', 'He left no means tried.'], why: 'every-র negative রূপে no বসে, আর verb-এর বিপরীত ভাব (tried → untried) প্রকাশ করতে হয়।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He was doubtful about it.', correct: 'He was not sure about it.', wrong: ['He was not doubtful about it.', 'He was sure about it.', 'He was not unsure about it.'], why: 'doubtful-এর বিপরীত শব্দ sure; তার আগে not বসালে একই অর্থ থাকে।' },
    { question: 'Negative sentence-এ রূপান্তর করো: He is sometimes late.', correct: 'He is not always punctual.', wrong: ['He is never late.', 'He is always not punctual.', 'He is sometimes not late.'], why: 'sometimes-এর negative রূপ not always, আর late-এর বিপরীত শব্দ punctual বসে।' },
    { question: 'Affirmative sentence-এ রূপান্তর করো: He is not rich.', correct: 'He is poor.', wrong: ['He is not poor.', 'He is a rich.', 'He is never poor.'], why: 'not বাদ দিয়ে adjective-এর বিপরীত শব্দ (rich → poor) বসালে affirmative হয়।' },
    { question: 'Affirmative sentence-এ রূপান্তর করো: None but a fool can do this.', correct: 'Only a fool can do this.', wrong: ['Only a fool cannot do this.', 'Nothing but a fool can do this.', 'A fool only cannot do this.'], why: 'None but-এর affirmative রূপ Only।' },
    { question: 'Affirmative sentence-এ রূপান্তর করো: No sooner had the thief seen the police than he ran away.', correct: 'As soon as the thief saw the police, he ran away.', wrong: ['As soon as the thief had saw the police, he ran away.', 'As soon as the thief saw the police, than he ran away.', 'Soon the thief saw the police, he ran away.'], why: 'No sooner had ... than-এর affirmative রূপ As soon as + subject + V2; than বাদ যায়।' },
  ],
};
