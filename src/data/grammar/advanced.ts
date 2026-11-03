import { topic } from './topic.ts';

/** Advanced grammar, including the SSC/HSC exam topics. */
export const ADVANCED = [
  topic('voice', 'advanced', 'Active & Passive Voice', 'বাচ্য পরিবর্তন', 'কাজ কে করল, নাকি কাজটা কার উপর হলো', {
    explain: [
      'Active voice-এ কাজ যে করে সে subject: Rahim writes a letter. Passive voice-এ যার উপর কাজ হয় সে subject হয়ে যায়: A letter is written by Rahim.',
      'Passive বানাতে: object-কে সামনে আনো, tense অনুযায়ী be verb বসাও, মূল verb-এর V3 দাও, আর চাইলে by + কর্তা যোগ করো। subject-এর pronoun বদলে object রূপ হয় (I → me, he → him)।',
    ],
    table: [
      ['Tense', 'Active', 'Passive'],
      ['Present Simple', 'He writes a letter.', 'A letter is written by him.'],
      ['Present Continuous', 'He is writing a letter.', 'A letter is being written by him.'],
      ['Present Perfect', 'He has written a letter.', 'A letter has been written by him.'],
      ['Past Simple', 'He wrote a letter.', 'A letter was written by him.'],
      ['Future Simple', 'He will write a letter.', 'A letter will be written by him.'],
      ['Modal', 'He can write a letter.', 'A letter can be written by him.'],
    ],
    formulas: ['Passive: Object + be verb + V3 + by + Subject'],
    examples: [
      ['The cat killed the rat. → The rat was killed by the cat.', 'বিড়ালটা ইঁদুরটা মেরেছিল। → ইঁদুরটা বিড়াল দ্বারা মারা পড়েছিল।'],
      ['People speak English all over the world. → English is spoken all over the world.', 'সারা পৃথিবীতে ইংরেজি বলা হয়।'],
      ['They are building a bridge. → A bridge is being built.', 'একটা সেতু তৈরি হচ্ছে।'],
      ['Close the door. → Let the door be closed.', 'দরজাটা বন্ধ করা হোক।'],
    ],
    mistakes: [
      ['The letter was write by him.', 'The letter was written by him.', 'passive-এ verb-এর V3।'],
      ['Rice is eaten by we.', 'Rice is eaten by us.', 'by-এর পরে object রূপ।'],
    ],
    quiz: [
      ['"She sings a song." এর passive কোনটা?', 'A song is sung by her.', ['A song is sang by her.', 'A song was sung by she.'], 'present simple, তাই is + V3 (sung), আর by her।'],
      ['"They have finished the work." এর passive?', 'The work has been finished by them.', ['The work has finished by them.', 'The work is finished by them.'], 'present perfect-এ has been + V3।'],
      ['"He will help me." এর passive?', 'I will be helped by him.', ['I will helped by him.', 'Me will be helped by him.'], 'future-এ will be + V3, আর me → I।'],
    ],
  }),

  topic('narration', 'advanced', 'Direct & Indirect Speech', 'উক্তি পরিবর্তন (Narration)', 'কারো কথা নিজের ভাষায় বলা', {
    explain: [
      'Direct speech-এ কারো কথা হুবহু উদ্ধৃতিচিহ্নের ভেতরে থাকে: He said, "I am tired." Indirect speech-এ নিজের ভাষায় বলা হয়: He said that he was tired.',
      'Reporting verb অতীতে (said) থাকলে ভেতরের tense এক ধাপ পিছিয়ে যায় (am → was, will → would), pronoun বদলায়, আর কিছু শব্দ বদলায় (now → then, today → that day, tomorrow → the next day, here → there)।',
      'প্রশ্নে said to → asked, আর বাক্য প্রশ্ন থেকে সাধারণ বাক্যে আসে (if/whether বা wh-word দিয়ে)। আদেশে told/ordered + to + verb।',
    ],
    table: [
      ['Direct', 'Indirect'],
      ['am / is →', 'was'],
      ['are →', 'were'],
      ['do / does →', 'did'],
      ['did / has →', 'had + V3'],
      ['will / can →', 'would / could'],
      ['now / today →', 'then / that day'],
      ['tomorrow / here →', 'the next day / there'],
    ],
    examples: [
      ['He said, "I am busy." → He said that he was busy.', 'সে বলল যে সে ব্যস্ত।'],
      ['She said to me, "Where do you live?" → She asked me where I lived.', 'সে আমাকে জিজ্ঞেস করল আমি কোথায় থাকি।'],
      ['He said to me, "Are you ready?" → He asked me if I was ready.', 'সে আমাকে জিজ্ঞেস করল আমি তৈরি কি না।'],
      ['The teacher said to us, "Sit down." → The teacher told us to sit down.', 'শিক্ষক আমাদের বসতে বললেন।'],
    ],
    mistakes: [
      ['He asked me where did I live.', 'He asked me where I lived.', 'indirect প্রশ্নে সাধারণ বাক্যের ক্রম।'],
      ['She said that I am happy.', 'She said that she was happy.', 'pronoun আর tense দুটোই বদলায়।'],
    ],
    quiz: [
      ['He said, "I will go." এর indirect?', 'He said that he would go.', ['He said that he will go.', 'He said that I would go.'], 'will → would, I → he।'],
      ['She said to me, "Do you like tea?" এর indirect?', 'She asked me if I liked tea.', ['She asked me do I like tea.', 'She said me if I like tea.'], 'yes/no প্রশ্নে asked + if, আর tense এক ধাপ পিছিয়ে।'],
      ['"today" indirect-এ কী হয়?', 'that day', ['this day', 'yesterday'], 'today → that day।'],
    ],
  }),

  topic('conditionals', 'advanced', 'Conditionals (If)', 'শর্তবাচক বাক্য', 'If দিয়ে শর্ত: ০, ১, ২, ৩ নম্বর', {
    explain: [
      'If দিয়ে শর্ত আর তার ফল বোঝানো হয়। Zero: সবসময় সত্য। First: সম্ভাব্য ভবিষ্যৎ। Second: কাল্পনিক বর্তমান। Third: অতীতে যা ঘটেনি তার কল্পনা।',
      'Second conditional-এ সব subject-এর সাথে were বসানো ভালো: If I were a bird, I would fly.',
    ],
    table: [
      ['ধরন', 'If অংশ', 'ফল অংশ'],
      ['Zero', 'If + present', 'present'],
      ['First', 'If + present', 'will + verb'],
      ['Second', 'If + past', 'would + verb'],
      ['Third', 'If + had + V3', 'would have + V3'],
    ],
    examples: [
      ['If you heat ice, it melts.', 'বরফ গরম করলে গলে যায়।'],
      ['If it rains, we will stay home.', 'বৃষ্টি হলে আমরা বাড়িতে থাকব।'],
      ['If I had money, I would buy a car.', 'আমার টাকা থাকলে আমি একটা গাড়ি কিনতাম।'],
      ['If you had studied, you would have passed.', 'তুমি পড়লে পাস করতে।'],
    ],
    mistakes: [
      ['If it will rain, I will stay.', 'If it rains, I will stay.', 'If অংশে will বসে না।'],
      ['If I was you, I would go.', 'If I were you, I would go.', 'কাল্পনিক শর্তে were।'],
      ['If he had come, I would help him.', 'If he had come, I would have helped him.', 'third conditional-এ would have + V3।'],
    ],
    quiz: [
      ['If you study hard, you ___ pass.', 'will', ['would', 'would have'], 'first conditional: If + present, will + verb।'],
      ['If I ___ a bird, I would fly.', 'were', ['am', 'will be'], 'কাল্পনিক শর্তে were।'],
      ['If she had left earlier, she ___ the bus.', 'would have caught', ['will catch', 'would catch'], 'third conditional: would have + V3।'],
    ],
  }),

  topic('tag-questions', 'advanced', 'Tag Questions', 'ট্যাগ প্রশ্ন', '…, isn\'t it? / …, don\'t you?', {
    explain: [
      'বাক্যের শেষে ছোট প্রশ্ন জুড়ে দিয়ে সম্মতি চাওয়া হয়। হ্যাঁ-বোধক বাক্যে না-বোধক tag, না-বোধক বাক্যে হ্যাঁ-বোধক tag। tag-এ বাক্যের সাহায্যকারী verb আর subject-এর pronoun বসে।',
      'বিশেষ নিয়ম: I am → aren\'t I? Let\'s → shall we? আদেশ → will you? never, hardly, nothing থাকলে বাক্য না-বোধক ধরা হয়। everyone/somebody → they।',
    ],
    formulas: ['হ্যাঁ-বোধক বাক্য: Sentence + , + helping verb + n\'t + pronoun?', 'না-বোধক বাক্য: Sentence + , + helping verb + pronoun?'],
    examples: [
      ['You are a student, aren\'t you?', 'তুমি ছাত্র, তাই না?'],
      ['She doesn\'t like milk, does she?', 'সে দুধ পছন্দ করে না, তাই না?'],
      ['They went home, didn\'t they?', 'তারা বাড়ি গিয়েছিল, তাই না?'],
      ['Let\'s go, shall we?', 'চলো যাই, যাবে?'],
    ],
    mistakes: [
      ['He plays well, isn\'t he?', 'He plays well, doesn\'t he?', 'এখানে সাহায্যকারী verb হলো does (plays = does play)।'],
      ['I am right, am not I?', 'I am right, aren\'t I?', 'I am-এর tag হলো aren\'t I।'],
      ['He never lies, doesn\'t he?', 'He never lies, does he?', 'never থাকলে বাক্য না-বোধক, তাই হ্যাঁ-বোধক tag।'],
    ],
    quiz: [
      ['It is hot today, ___?', "isn't it", ['is it', "doesn't it"], 'হ্যাঁ-বোধক বাক্যে না-বোধক tag।'],
      ['You can swim, ___?', "can't you", ['can you', "don't you"], 'এখানে সাহায্যকারী verb হলো can।'],
      ['Open the door, ___?', 'will you', ["don't you", 'shall we'], 'আদেশের tag হলো will you।'],
    ],
  }),

  topic('right-form-of-verbs', 'advanced', 'Right Form of Verbs', 'Verb-এর সঠিক রূপ', 'SSC/HSC: বন্ধনীর verb-এর ঠিক রূপ', {
    explain: [
      'এই অংশে বাক্যের সময়-নির্দেশক শব্দ আর গঠন দেখে বন্ধনীর verb-এর সঠিক রূপ বসাতে হয়। আগে subject একবচন না বহুবচন দেখো, তারপর সময় বোঝানো শব্দ খোঁজো।',
      'কিছু জরুরি নিয়ম: since-এর আগের অংশ present perfect আর পরের অংশ past; It is time + past; Would that / I wish + past; modal-এর পরে মূল রূপ; preposition-এর পরে -ing; let/make/see-এর object-এর পরে মূল রূপ।',
    ],
    table: [
      ['সংকেত', 'Verb-এর রূপ', 'উদাহরণ'],
      ['every day, always, usually', 'present simple', 'He (go) → goes'],
      ['now, at present, look!', 'present continuous', 'She (sing) → is singing'],
      ['yesterday, ago, last', 'past simple', 'I (meet) → met'],
      ['already, just, yet, since', 'present perfect', 'They (finish) → have finished'],
      ['tomorrow, next', 'future', 'We (go) → will go'],
      ['It is time / I wish', 'past', 'It is time we (start) → started'],
    ],
    examples: [
      ['He (write) a letter yesterday. → wrote', 'সে গতকাল একটা চিঠি লিখেছিল।'],
      ['Look! The boys (play) football. → are playing', 'দেখো! ছেলেরা ফুটবল খেলছে।'],
      ['It is time we (leave). → left', 'আমাদের এখন যাওয়ার সময়।'],
      ['I wish I (be) a doctor. → were', 'হায়, আমি যদি ডাক্তার হতাম।'],
    ],
    mistakes: [
      ['It is ten years since I have seen him.', 'It is ten years since I saw him.', 'since-এর পরে past।'],
      ['Let him to go.', 'Let him go.', 'let-এর পরে মূল রূপ।'],
    ],
    quiz: [
      ['The earth (move) round the sun.', 'moves', ['moved', 'is moving'], 'চিরসত্যে present simple, আর earth একবচন।'],
      ['He (not come) yet.', 'has not come', ['did not come', 'does not come'], 'yet থাকলে present perfect।'],
      ['I saw him (go) to school.', 'go', ['went', 'to go'], 'see + object-এর পরে মূল রূপ (বা -ing)।'],
    ],
  }),

  topic('transformation', 'advanced', 'Transformation of Sentences', 'বাক্যের রূপান্তর', 'অর্থ ঠিক রেখে গঠন বদলানো', {
    explain: [
      'অর্থ না বদলে বাক্যের গঠন বদলানোকে Transformation বলে। SSC/HSC-তে আসে: Simple ↔ Complex ↔ Compound, Affirmative ↔ Negative, Assertive ↔ Interrogative, আর Degree of comparison।',
      'Simple: একটাই মূল বাক্য। Complex: একটা মূল বাক্য + that/who/when/because দিয়ে আরেকটা অংশ। Compound: and/but/so/or দিয়ে দুটো সমান বাক্য।',
    ],
    table: [
      ['ধরন', 'বাক্য'],
      ['Simple', 'Being ill, he could not come.'],
      ['Complex', 'As he was ill, he could not come.'],
      ['Compound', 'He was ill, so he could not come.'],
      ['Affirmative', 'He is always on time.'],
      ['Negative', 'He is never late.'],
      ['Positive degree', 'No other boy in the class is as tall as Rahim.'],
      ['Superlative degree', 'Rahim is the tallest boy in the class.'],
    ],
    examples: [
      ['He is too weak to walk. → He is so weak that he cannot walk.', 'সে এত দুর্বল যে হাঁটতে পারে না।'],
      ['Everybody loves flowers. → Who does not love flowers?', 'ফুল কে না ভালোবাসে?'],
      ['Only Rina can do it. → None but Rina can do it.', 'রিনা ছাড়া কেউ এটা পারে না।'],
      ['As soon as he saw me, he ran away. → No sooner had he seen me than he ran away.', 'আমাকে দেখামাত্রই সে পালিয়ে গেল।'],
    ],
    mistakes: [
      ['He is so weak that he can walk.', 'He is so weak that he cannot walk.', 'too…to না-বোধক অর্থ দেয়, তাই cannot।'],
      ['No sooner he had seen me than…', 'No sooner had he seen me than…', 'No sooner-এর পরে had আগে বসে।'],
    ],
    quiz: [
      ['"He is too poor to buy a car." এর complex রূপ?', 'He is so poor that he cannot buy a car.', ['He is so poor that he can buy a car.', 'He is poor and buys a car.'], 'too…to → so…that + cannot।'],
      ['"Everyone wants to be happy." এর interrogative?', 'Who does not want to be happy?', ['Does everyone want to be happy?', 'Who wants to be happy?'], 'অর্থ ঠিক রাখতে না-বোধক প্রশ্ন।'],
      ['"Rahim is the best boy." এর comparative?', 'Rahim is better than any other boy.', ['Rahim is better than all boy.', 'Rahim is good than any boy.'], 'superlative → comparative: better than any other।'],
    ],
  }),

  topic('relative-clauses', 'advanced', 'Relative Clauses', 'Relative clause: who, which, that', 'কোন মানুষ বা কোন জিনিস, তা বলা', {
    explain: [
      'Relative pronoun দিয়ে দুটো বাক্য জোড়া দিয়ে বলা হয় কোন মানুষ বা জিনিসের কথা হচ্ছে। মানুষের জন্য who, জিনিস বা প্রাণীর জন্য which, দুটোর জন্যই that। মালিকানা বোঝাতে whose, জায়গার জন্য where।',
    ],
    table: [
      ['শব্দ', 'কার জন্য', 'উদাহরণ'],
      ['who', 'মানুষ', 'the man who lives here'],
      ['which', 'জিনিস / প্রাণী', 'the book which I bought'],
      ['that', 'মানুষ বা জিনিস', 'the bag that is red'],
      ['whose', 'মালিকানা', 'the girl whose pen is lost'],
      ['where', 'জায়গা', 'the village where I was born'],
    ],
    examples: [
      ['The man who helped me is a doctor.', 'যে লোকটা আমাকে সাহায্য করেছিল তিনি একজন ডাক্তার।'],
      ['This is the book which I like most.', 'এটাই সেই বই যেটা আমি সবচেয়ে পছন্দ করি।'],
      ['I know a boy whose father is a pilot.', 'আমি একটা ছেলেকে চিনি যার বাবা পাইলট।'],
      ['This is the house where I was born.', 'এটাই সেই বাড়ি যেখানে আমি জন্মেছিলাম।'],
    ],
    mistakes: [
      ['The girl which sings is my sister.', 'The girl who sings is my sister.', 'মানুষের জন্য who।'],
      ['The pen who I lost was new.', 'The pen which I lost was new.', 'জিনিসের জন্য which।'],
    ],
    quiz: [
      ['The teacher ___ teaches us English is kind.', 'who', ['which', 'whose'], 'মানুষের জন্য who।'],
      ['I lost the watch ___ my father gave me.', 'which', ['who', 'where'], 'জিনিসের জন্য which।'],
      ['That is the school ___ I studied.', 'where', ['which', 'whose'], 'জায়গার জন্য where।'],
    ],
  }),
];
