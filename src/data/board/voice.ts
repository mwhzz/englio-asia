import type { BoardTopic } from './types.ts';

/** Voice: active to passive and back, across tenses, imperatives, questions and modals. */
export const VOICE: BoardTopic = {
  id: 'voice',
  exam: ['ssc', 'hsc'],
  title: 'Voice Change',
  titleBn: 'বাচ্য পরিবর্তন',
  tip: 'Passive = object সামনে + tense অনুযায়ী be verb + মূল verb-এর V3 + by + subject-এর object রূপ।',
  questions: [
    { question: 'Passive voice-এ রূপান্তর করো: They are building a bridge.', correct: 'A bridge is being built by them.', wrong: ['A bridge is built by them.', 'A bridge was being built by them.', 'A bridge is being build by them.'], why: 'Present continuous-এর passive-এ am/is/are + being + V3 বসে; build-এর V3 built।' },
    { question: 'Passive voice-এ রূপান্তর করো: He wrote a letter.', correct: 'A letter was written by him.', wrong: ['A letter is written by him.', 'A letter was wrote by him.', 'A letter has been written by him.'], why: 'Past indefinite-এর passive-এ was/were + V3 বসে; write-এর V3 written।' },
    { question: 'Passive voice-এ রূপান্তর করো: She has done the work.', correct: 'The work has been done by her.', wrong: ['The work has done by her.', 'The work is done by her.', 'The work has been did by her.'], why: 'Present perfect-এর passive-এ has/have + been + V3 বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: They had finished the work.', correct: 'The work had been finished by them.', wrong: ['The work has been finished by them.', 'The work had finished by them.', 'The work was been finished by them.'], why: 'Past perfect-এর passive-এ had + been + V3 বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: The boys were playing football.', correct: 'Football was being played by the boys.', wrong: ['Football was played by the boys.', 'Football were being played by the boys.', 'Football is being played by the boys.'], why: 'Past continuous-এর passive-এ was/were + being + V3 বসে; নতুন subject হলো football, যা একবচন, তাই was।' },
    { question: 'Passive voice-এ রূপান্তর করো: I will help you.', correct: 'You will be helped by me.', wrong: ['You will helped by me.', 'You would be helped by me.', 'You will be help by me.'], why: 'Future indefinite-এর passive-এ shall/will + be + V3 বসে; I-এর object রূপ me।' },
    { question: 'Passive voice-এ রূপান্তর করো: People speak English all over the world.', correct: 'English is spoken all over the world.', wrong: ['English is spoke all over the world.', 'English was spoken all over the world.', 'English is speaking all over the world.'], why: 'Present indefinite-এর passive-এ am/is/are + V3; people-এর মতো অনির্দিষ্ট কর্তা হলে by people বাদ দেওয়া যায়।' },
    { question: 'Passive voice-এ রূপান্তর করো: You must obey your parents.', correct: 'Your parents must be obeyed by you.', wrong: ['Your parents must obeyed by you.', 'Your parents must be obey by you.', 'Your parents must have obeyed by you.'], why: 'Modal verb থাকলে passive-এ modal + be + V3 বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: We should respect our teachers.', correct: 'Our teachers should be respected by us.', wrong: ['Our teachers should respected by us.', 'Our teachers should be respected by we.', 'Our teachers should been respected by us.'], why: 'Modal-এর পরে be + V3 বসে, আর by-এর পরে we-এর object রূপ us।' },
    { question: 'Passive voice-এ রূপান্তর করো: Open the door.', correct: 'Let the door be opened.', wrong: ['Let the door is opened.', 'Let the door be open.', 'The door be opened.'], why: 'Imperative sentence-এর passive-এ Let + object + be + V3 বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: Please help me.', correct: 'You are requested to help me.', wrong: ['You are requested help me.', 'I am requested to help you.', 'You are request to help me.'], why: 'Please বা kindly দিয়ে অনুরোধ বোঝালে passive-এ You are requested to + verb বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: Who wrote this book?', correct: 'By whom was this book written?', wrong: ['By who was this book written?', 'By whom this book was written?', 'By whom was this book wrote?'], why: 'Who দিয়ে প্রশ্নের passive By whom দিয়ে শুরু হয়, তারপর প্রশ্নের ক্রমে be verb + object + V3।' },
    { question: 'Passive voice-এ রূপান্তর করো: Did he do the work?', correct: 'Was the work done by him?', wrong: ['Did the work done by him?', 'Was the work did by him?', 'Is the work done by him?'], why: 'Did দিয়ে প্রশ্নের passive Was/Were দিয়ে শুরু হয়, তারপর object + V3 + by + object।' },
    { question: 'Passive voice-এ রূপান্তর করো: What are you doing?', correct: 'What is being done by you?', wrong: ['What is done by you?', 'What are being done by you?', 'What is being did by you?'], why: 'Present continuous প্রশ্নের passive-এ What + is + being + V3 + by + object বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: Do you know him?', correct: 'Is he known to you?', wrong: ['Was he known to you?', 'Is he know to you?', 'Does he known to you?'], why: 'Do দিয়ে প্রশ্নের passive Am/Is/Are দিয়ে শুরু হয়; know-এর passive-এ সাধারণত by নয়, to বসে।' },
    { question: 'Passive voice-এ রূপান্তর করো: He gave me a pen.', correct: 'I was given a pen by him.', wrong: ['I was gave a pen by him.', 'I am given a pen by him.', 'Me was given a pen by him.'], why: 'দুটি object থাকলে ব্যক্তিবাচক object (me) subject হলে I হয়, past tense বলে was + V3 (given)।' },
    { question: 'Passive voice-এ রূপান্তর করো: The news surprised me.', correct: 'I was surprised at the news.', wrong: ['I surprised at the news.', 'I was surprised of the news.', 'I am surprised at the news.'], why: 'surprise-এর passive-এ সাধারণত by-এর বদলে at বসে; past tense বলে was surprised।' },
    { question: 'Active voice-এ রূপান্তর করো: The thief was caught by the police.', correct: 'The police caught the thief.', wrong: ['The police catch the thief.', 'The police had caught the thief.', 'The police were caught the thief.'], why: 'Passive-এ was + V3 মানে past indefinite, তাই active-এ verb-এর V2 (caught) বসে।' },
  ],
};
