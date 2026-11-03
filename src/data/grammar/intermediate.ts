import { topic } from './topic.ts';

/** Grammar for the middle level: tenses, quantities, modals and joining ideas. */
export const INTERMEDIATE = [
  topic('countable-uncountable', 'intermediate', 'Countable & Uncountable', 'গণনাযোগ্য ও অগণনাযোগ্য', 'many/much, a few/a little, some/any', {
    explain: [
      'যা গোনা যায় (book, apple) তা countable; যা গোনা যায় না (water, rice, money, information) তা uncountable। uncountable-এর plural হয় না, আর তার আগে a/an বসে না।',
      'countable-এর সাথে many, a few; uncountable-এর সাথে much, a little। দুটোর সাথেই a lot of। হ্যাঁ-বোধকে some, না-বোধক আর প্রশ্নে সাধারণত any।',
    ],
    table: [
      ['', 'Countable', 'Uncountable'],
      ['অনেক', 'many books', 'much water'],
      ['অল্প', 'a few friends', 'a little sugar'],
      ['দুটোতেই', 'a lot of eggs', 'a lot of rice'],
      ['প্রশ্ন', 'How many?', 'How much?'],
    ],
    examples: [
      ['I have a few friends in Khulna.', 'খুলনায় আমার কয়েকজন বন্ধু আছে।'],
      ['There is a little milk in the jug.', 'জগে অল্প একটু দুধ আছে।'],
      ['How much money do you need?', 'তোমার কত টাকা লাগবে?'],
      ['Do you have any questions?', 'তোমার কি কোনো প্রশ্ন আছে?'],
    ],
    mistakes: [
      ['many water', 'much water', 'water uncountable, তাই much।'],
      ['an information', 'some information', 'information uncountable; a/an বসে না।'],
      ['How much books?', 'How many books?', 'books গোনা যায়, তাই many।'],
    ],
    quiz: [
      ['How ___ eggs do we need?', 'many', ['much', 'little'], 'eggs গোনা যায়, তাই many।'],
      ['There is ___ rice left.', 'a little', ['a few', 'many'], 'rice uncountable, তাই a little।'],
      ['I don\'t have ___ money.', 'any', ['some', 'many'], 'না-বোধকে any।'],
    ],
  }),

  topic('adverbs', 'intermediate', 'Adverbs', 'ক্রিয়া-বিশেষণ', 'কীভাবে, কখন, কোথায়, কতবার', {
    explain: [
      'Adverb বলে কাজটা কীভাবে, কখন, কোথায় বা কতবার হলো। অনেক adjective-এর শেষে ly যোগ করে adverb হয়: slow → slowly, careful → carefully। কিছু অনিয়মিত: good → well, fast → fast, hard → hard।',
      'কতবার বোঝানো adverb (always, usually, often, sometimes, never) সাধারণত মূল verb-এর আগে, কিন্তু be verb-এর পরে বসে: She always comes on time. He is never late.',
    ],
    table: [
      ['ধরন', 'উদাহরণ'],
      ['কীভাবে', 'slowly, carefully, well'],
      ['কখন', 'now, today, yesterday, soon'],
      ['কোথায়', 'here, there, outside'],
      ['কতবার', 'always, usually, often, sometimes, never'],
    ],
    examples: [
      ['Please speak slowly.', 'দয়া করে আস্তে বলো।'],
      ['She sings well.', 'সে ভালো গান গায়।'],
      ['I always drink water before bed.', 'আমি সবসময় ঘুমানোর আগে পানি খাই।'],
      ['He is never late.', 'সে কখনো দেরি করে না।'],
    ],
    mistakes: [
      ['He drives careful.', 'He drives carefully.', 'কাজের ধরন বোঝাতে adverb (carefully)।'],
      ['She sings good.', 'She sings well.', 'good-এর adverb রূপ well।'],
      ['I go always to school.', 'I always go to school.', 'always মূল verb-এর আগে।'],
    ],
    quiz: [
      ['He works very ___.', 'hard', ['hardly', 'hards'], 'hard-এর adverb রূপও hard (hardly মানে প্রায় না)।'],
      ['Write ___.', 'neatly', ['neat', 'neatness'], 'কীভাবে লিখবে বোঝাতে adverb লাগবে, তাই neatly।'],
      ['কোনটা ঠিক?', 'She is always happy.', ['She always is happy.', 'Always she is happy.'], 'be verb-এর পরে always।'],
    ],
  }),

  topic('past-simple', 'intermediate', 'Past Simple', 'সাধারণ অতীত কাল', 'অতীতে শেষ হয়ে যাওয়া কাজ', {
    explain: [
      'অতীতে কোনো সময়ে যে কাজ হয়ে শেষ হয়েছে, তা বোঝাতে Past Simple: I went to Cox\'s Bazar last year. yesterday, ago, last week থাকলে সাধারণত এই tense।',
      'নিয়মিত verb-এর শেষে ed যোগ হয় (play → played)। অনেক verb অনিয়মিত, সেগুলো মুখস্থ করতে হয় (go → went, eat → ate)। না-বোধক আর প্রশ্নে did, আর তখন verb মূল রূপে।',
    ],
    formulas: ['হ্যাঁ-বোধক: Subject + Verb (past) + Object', 'না-বোধক: Subject + did not + Verb', 'প্রশ্ন: Did + Subject + Verb?'],
    table: [
      ['Present', 'Past'],
      ['go', 'went'],
      ['eat', 'ate'],
      ['see', 'saw'],
      ['come', 'came'],
      ['write', 'wrote'],
      ['buy', 'bought'],
    ],
    examples: [
      ['I visited my grandmother yesterday.', 'আমি গতকাল দাদির বাড়ি গিয়েছিলাম।'],
      ['She wrote a letter last night.', 'সে গতরাতে একটা চিঠি লিখেছিল।'],
      ['We didn\'t watch TV.', 'আমরা টিভি দেখিনি।'],
      ['Did you eat breakfast?', 'তুমি কি সকালের নাশতা খেয়েছ?'],
    ],
    mistakes: [
      ['I goed to school.', 'I went to school.', 'go অনিয়মিত; এর past went।'],
      ['Did she came?', 'Did she come?', 'did-এর পরে verb মূল রূপে।'],
      ['Yesterday I go there.', 'Yesterday I went there.', 'yesterday মানে অতীত, তাই past রূপ।'],
    ],
    quiz: [
      ['We ___ a film last night.', 'watched', ['watch', 'watching'], 'last night মানে অতীত, তাই watched।'],
      ['He ___ a new phone two days ago.', 'bought', ['buyed', 'buy'], 'buy-এর past bought।'],
      ['___ you go to the market?', 'Did', ['Do', 'Were'], 'অতীতের প্রশ্নে Did।'],
    ],
  }),

  topic('past-continuous', 'intermediate', 'Past Continuous', 'ঘটমান অতীত কাল', 'অতীতের কোনো মুহূর্তে চলছিল এমন কাজ', {
    explain: [
      'অতীতের কোনো সময়ে যে কাজ চলছিল, তা বোঝাতে Past Continuous: At 8 pm I was studying.',
      'একটা কাজ চলার সময় আরেকটা ঘটলে, চলমান কাজে past continuous আর হঠাৎ ঘটা কাজে past simple: I was sleeping when the phone rang.',
    ],
    formulas: ['হ্যাঁ-বোধক: Subject + was/were + Verb-ing', 'না-বোধক: Subject + was/were + not + Verb-ing', 'প্রশ্ন: Was/Were + Subject + Verb-ing?'],
    examples: [
      ['I was reading when you called.', 'তুমি যখন ফোন দিলে, আমি পড়ছিলাম।'],
      ['They were playing in the rain.', 'তারা বৃষ্টিতে খেলছিল।'],
      ['She wasn\'t sleeping at 10 pm.', 'রাত ১০টায় সে ঘুমাচ্ছিল না।'],
      ['What were you doing yesterday evening?', 'গতকাল সন্ধ্যায় তুমি কী করছিলে?'],
    ],
    mistakes: [
      ['I was read a book.', 'I was reading a book.', 'was/were-এর পরে verb + ing।'],
      ['They was playing.', 'They were playing.', 'they-এর সাথে were।'],
    ],
    quiz: [
      ['We ___ dinner when the light went out.', 'were having', ['had', 'are having'], 'চলমান কাজটা past continuous।'],
      ['At 7 am she ___ to school.', 'was walking', ['walking', 'were walking'], 'she-এর সাথে was + ing।'],
      ['While I was cooking, the guests ___.', 'arrived', ['were arriving', 'arrive'], 'হঠাৎ ঘটা কাজটা past simple।'],
    ],
  }),

  topic('future', 'intermediate', 'Future: will & going to', 'ভবিষ্যৎ কাল: will ও going to', 'ভবিষ্যতের কথা বলার দুই উপায়', {
    explain: [
      'will দিয়ে বোঝানো হয় হঠাৎ নেওয়া সিদ্ধান্ত, প্রতিশ্রুতি বা ভবিষ্যদ্বাণী: I will help you. It will rain tomorrow. will-এর পরে verb মূল রূপে।',
      'going to দিয়ে বোঝানো হয় আগে থেকে ঠিক করা পরিকল্পনা, বা যা প্রায় নিশ্চিত ঘটবে: I am going to visit Sylhet next week. Look at the clouds! It is going to rain.',
    ],
    formulas: ['will: Subject + will + Verb', 'going to: Subject + am/is/are + going to + Verb', 'না-বোধক: Subject + will not (won\'t) + Verb'],
    examples: [
      ['I will call you tonight.', 'আমি আজ রাতে তোমাকে ফোন দেব।'],
      ['She is going to start a new job.', 'সে নতুন চাকরি শুরু করতে যাচ্ছে।'],
      ['They won\'t come today.', 'তারা আজ আসবে না।'],
      ['Will you help me?', 'তুমি কি আমাকে সাহায্য করবে?'],
    ],
    mistakes: [
      ['I will to go.', 'I will go.', 'will-এর পরে to বসে না।'],
      ['He will goes.', 'He will go.', 'will-এর পরে verb মূল রূপে।'],
      ['I going to study.', 'I am going to study.', 'going to-র আগে am/is/are লাগে।'],
    ],
    quiz: [
      ['I think it ___ rain tomorrow.', 'will', ['is', 'going'], 'ভবিষ্যদ্বাণীতে will।'],
      ['We have bought tickets. We ___ fly to Chattogram.', 'are going to', ['will to', 'going to'], 'আগে ঠিক করা পরিকল্পনা, তাই are going to।'],
      ['She ___ be late.', "won't", ["willn't", "doesn't will"], 'will not-এর ছোট রূপ won\'t।'],
    ],
  }),

  topic('present-perfect', 'intermediate', 'Present Perfect', 'পুরাঘটিত বর্তমান কাল', 'কাজ হয়ে গেছে, ফল এখনো আছে', {
    explain: [
      'কাজ শেষ হয়েছে কিন্তু তার ফল এখনো আছে, বা জীবনে কখনো করেছ কি না, তা বোঝাতে Present Perfect: I have finished my homework. Have you ever seen the sea?',
      'have/has-এর পরে verb-এর past participle (V3) বসে। just, already, yet, ever, never, since, for প্রায়ই এই tense-এ আসে। yesterday বা last year-এর মতো নির্দিষ্ট অতীত সময় থাকলে Present Perfect নয়, Past Simple।',
    ],
    formulas: ['হ্যাঁ-বোধক: Subject + have/has + V3', 'না-বোধক: Subject + have/has + not + V3', 'প্রশ্ন: Have/Has + Subject + V3?'],
    table: [
      ['Verb', 'Past', 'Past participle (V3)'],
      ['go', 'went', 'gone'],
      ['eat', 'ate', 'eaten'],
      ['see', 'saw', 'seen'],
      ['write', 'wrote', 'written'],
      ['do', 'did', 'done'],
    ],
    examples: [
      ['I have just eaten.', 'আমি এইমাত্র খেয়েছি।'],
      ['She has lived in Dhaka for five years.', 'সে পাঁচ বছর ধরে ঢাকায় আছে।'],
      ['We haven\'t finished yet.', 'আমরা এখনো শেষ করিনি।'],
      ['Have you ever been to Sundarbans?', 'তুমি কি কখনো সুন্দরবন গিয়েছ?'],
    ],
    mistakes: [
      ['I have went.', 'I have gone.', 'have-এর পরে V3 (gone)।'],
      ['She have finished.', 'She has finished.', 'she-এর সাথে has।'],
      ['I have seen him yesterday.', 'I saw him yesterday.', 'নির্দিষ্ট অতীত সময়ে past simple।'],
    ],
    quiz: [
      ['He ___ his lunch already.', 'has eaten', ['have eaten', 'has ate'], 'he-এর সাথে has + V3 (eaten)।'],
      ['I have known her ___ 2019.', 'since', ['for', 'from'], 'শুরুর সময় বোঝাতে since।'],
      ['They have lived here ___ ten years.', 'for', ['since', 'ago'], 'সময়ের দৈর্ঘ্য বোঝাতে for।'],
    ],
  }),

  topic('perfect-tenses', 'intermediate', 'Past Perfect & Perfect Continuous', 'পুরাঘটিত অতীত ও পুরাঘটিত ঘটমান', 'আগে-পরে দুটো অতীত, আর অনেকক্ষণ ধরে চলা কাজ', {
    explain: [
      'অতীতের দুটো কাজের মধ্যে যেটা আগে ঘটেছে, তাতে Past Perfect (had + V3): The train had left before we reached the station.',
      'কোনো কাজ অনেকক্ষণ ধরে চলছে বোঝাতে Perfect Continuous: বর্তমানে have/has been + Verb-ing (I have been waiting for an hour), অতীতে had been + Verb-ing।',
    ],
    formulas: [
      'Past Perfect: Subject + had + V3',
      'Present Perfect Continuous: Subject + have/has been + Verb-ing + for/since',
      'Past Perfect Continuous: Subject + had been + Verb-ing',
    ],
    examples: [
      ['When I arrived, the class had started.', 'আমি পৌঁছানোর আগেই ক্লাস শুরু হয়ে গিয়েছিল।'],
      ['She had finished her work before 5 pm.', 'সে বিকেল ৫টার আগে কাজ শেষ করেছিল।'],
      ['I have been studying since morning.', 'আমি সকাল থেকে পড়ছি।'],
      ['It has been raining for two hours.', 'দুই ঘণ্টা ধরে বৃষ্টি হচ্ছে।'],
    ],
    mistakes: [
      ['I have been wait for you.', 'I have been waiting for you.', 'been-এর পরে verb + ing।'],
      ['The film started before we had arrived.', 'The film had started before we arrived.', 'যেটা আগে ঘটেছে তাতে had + V3।'],
    ],
    quiz: [
      ['The patient ___ before the doctor came.', 'had died', ['has died', 'died had'], 'আগে ঘটা কাজে had + V3।'],
      ['We ___ here since 9 am.', 'have been waiting', ['are waiting', 'had wait'], 'সকাল থেকে এখনো চলছে, তাই have been + ing।'],
      ['She was tired because she ___ all day.', 'had been working', ['has been working', 'is working'], 'অতীতে অনেকক্ষণ চলা কাজ, তাই had been + ing।'],
    ],
  }),

  topic('tenses-overview', 'intermediate', 'All 12 Tenses', '১২টি Tense একসাথে', 'একটা ছকে সব tense', {
    explain: [
      'ইংরেজিতে তিনটি কাল (Present, Past, Future), আর প্রতিটির চারটি রূপ (Simple, Continuous, Perfect, Perfect Continuous), মোট ১২টি tense।',
      'নিচের ছকে "write" verb দিয়ে সব tense দেখানো হলো। বাক্যে সময় বোঝানো শব্দ (now, yesterday, tomorrow, since…) দেখে কোন tense লাগবে বোঝা যায়।',
    ],
    table: [
      ['', 'Present', 'Past', 'Future'],
      ['Simple', 'I write', 'I wrote', 'I will write'],
      ['Continuous', 'I am writing', 'I was writing', 'I will be writing'],
      ['Perfect', 'I have written', 'I had written', 'I will have written'],
      ['Perfect Continuous', 'I have been writing', 'I had been writing', 'I will have been writing'],
    ],
    examples: [
      ['I am writing an email now.', 'আমি এখন একটা ইমেইল লিখছি।'],
      ['By next year, I will have finished school.', 'আগামী বছরের মধ্যে আমার স্কুল শেষ হয়ে যাবে।'],
      ['This time tomorrow, I will be travelling.', 'আগামীকাল এই সময়ে আমি ভ্রমণ করতে থাকব।'],
      ['He had been living there for years.', 'সে বহু বছর ধরে সেখানে থাকছিল।'],
    ],
    quiz: [
      ['"I have been reading" কোন tense?', 'Present Perfect Continuous', ['Past Continuous', 'Present Perfect'], 'have been + ing = Present Perfect Continuous।'],
      ['"She will have left" কোন tense?', 'Future Perfect', ['Future Simple', 'Past Perfect'], 'will have + V3 = Future Perfect।'],
      ['"They were playing" কোন tense?', 'Past Continuous', ['Present Continuous', 'Past Simple'], 'was/were + ing = Past Continuous।'],
    ],
  }),

  topic('modals', 'intermediate', 'Modal Verbs', 'Modal verb', 'can, could, may, must, should, would', {
    explain: [
      'Modal verb (can, must…) মূল verb-এর আগে বসে সামর্থ্য, অনুমতি, সম্ভাবনা, বাধ্যবাধকতা বা উপদেশ বোঝায়। modal-এর পরে verb সবসময় মূল রূপে, আর he/she-এর সাথেও modal-এ s হয় না।',
    ],
    table: [
      ['Modal', 'মানে', 'উদাহরণ'],
      ['can', 'পারা', 'I can swim.'],
      ['could', 'পারত / ভদ্র অনুরোধ', 'Could you help me?'],
      ['may', 'হয়তো / অনুমতি', 'May I come in?'],
      ['must', 'অবশ্যই', 'You must wear a helmet.'],
      ['should', 'উচিত', 'You should drink more water.'],
      ['would', 'চাইতাম / ভদ্রতা', 'I would like some tea.'],
    ],
    formulas: ['হ্যাঁ-বোধক: Subject + modal + Verb', 'না-বোধক: Subject + modal + not + Verb', 'প্রশ্ন: Modal + Subject + Verb?'],
    examples: [
      ['She can speak three languages.', 'সে তিনটা ভাষা বলতে পারে।'],
      ['You should study every day.', 'তোমার প্রতিদিন পড়া উচিত।'],
      ['We must leave now.', 'আমাদের এখনই যেতে হবে।'],
      ['May I use your pen?', 'আমি কি তোমার কলমটা ব্যবহার করতে পারি?'],
    ],
    mistakes: [
      ['He can swims.', 'He can swim.', 'modal-এর পরে verb মূল রূপে।'],
      ['You must to go.', 'You must go.', 'modal-এর পরে to বসে না।'],
      ['She cans dance.', 'She can dance.', 'modal-এ কখনো s হয় না।'],
    ],
    quiz: [
      ['You ___ see a doctor. You look ill.', 'should', ['can', 'may'], 'উপদেশ দিতে should।'],
      ['___ I open the window?', 'May', ['Must', 'Should'], 'অনুমতি চাইতে May।'],
      ['কোনটা ঠিক?', 'He must finish it today.', ['He must finishes it today.', 'He musts finish it today.'], 'modal-এর পরে verb মূল রূপে, আর modal-এ s নেই।'],
    ],
  }),

  topic('conjunctions', 'intermediate', 'Conjunctions & Connectors', 'সংযোজক শব্দ', 'and, but, or, because, so, although', {
    explain: [
      'Conjunction দুটো শব্দ বা বাক্যাংশ জোড়া দেয়। and যোগ করে, but বিপরীত কথা আনে, or বিকল্প দেয়, because কারণ বলে, so ফল বলে।',
      'although / though মানে "যদিও", unless মানে "যদি না", while মানে "যখন / অথচ", as soon as মানে "যত তাড়াতাড়ি"। SSC/HSC-তে connector দিয়ে বাক্য মেলানো (completing sentences) প্রায়ই আসে।',
    ],
    table: [
      ['Connector', 'মানে'],
      ['and', 'এবং'],
      ['but', 'কিন্তু'],
      ['or', 'অথবা'],
      ['because', 'কারণ'],
      ['so', 'তাই'],
      ['although', 'যদিও'],
      ['unless', 'যদি না'],
      ['as soon as', 'যত তাড়াতাড়ি / যেইমাত্র'],
    ],
    examples: [
      ['I like tea, but my brother likes coffee.', 'আমি চা পছন্দ করি, কিন্তু আমার ভাই কফি পছন্দ করে।'],
      ['She stayed home because she was ill.', 'সে অসুস্থ ছিল বলে বাড়িতে ছিল।'],
      ['It was raining, so we didn\'t go out.', 'বৃষ্টি হচ্ছিল, তাই আমরা বাইরে যাইনি।'],
      ['Although he is poor, he is honest.', 'যদিও সে গরিব, সে সৎ।'],
    ],
    mistakes: [
      ['Although he is rich, but he is unhappy.', 'Although he is rich, he is unhappy.', 'although আর but একসাথে বসে না।'],
      ['Because I was late so I ran.', 'Because I was late, I ran.', 'because আর so একসাথে বসে না।'],
    ],
    quiz: [
      ['Work hard ___ you will fail.', 'or', ['and', 'because'], 'or মানে "নইলে" এখানে।'],
      ['He was tired, ___ he went to bed early.', 'so', ['because', 'but'], 'ফল বোঝাতে so।'],
      ['___ it rained, we played football.', 'Although', ['Because', 'So'], 'বিপরীত ভাব বোঝাতে although।'],
    ],
  }),

  topic('subject-verb-agreement', 'intermediate', 'Subject-Verb Agreement', 'Subject আর verb-এর মিল', 'একবচন subject-এ একবচন verb', {
    explain: [
      'Subject একবচন হলে verb-ও একবচন (He writes), বহুবচন হলে verb-ও বহুবচন (They write)।',
      'মনে রাখার নিয়ম: each, every, everyone, nobody একবচন। "A and B" বহুবচন। "one of the + plural noun" একবচন। "Either A or B" / "Neither A nor B"-তে verb কাছের subject অনুযায়ী।',
    ],
    examples: [
      ['Every student has a book.', 'প্রত্যেক ছাত্রের একটা বই আছে।'],
      ['Rina and Mina are sisters.', 'রিনা আর মিনা বোন।'],
      ['One of my friends lives in Barishal.', 'আমার এক বন্ধু বরিশালে থাকে।'],
      ['Neither the teacher nor the students were there.', 'শিক্ষক বা ছাত্ররা কেউই সেখানে ছিল না।'],
    ],
    mistakes: [
      ['Everyone are happy.', 'Everyone is happy.', 'everyone একবচন।'],
      ['One of the boys are absent.', 'One of the boys is absent.', '"one of" একবচন।'],
      ['The list of items are long.', 'The list of items is long.', 'মূল subject হলো list (একবচন), তাই is।'],
    ],
    quiz: [
      ['Each of the girls ___ a prize.', 'gets', ['get', 'are getting'], 'each একবচন।'],
      ['My father and mother ___ teachers.', 'are', ['is', 'was'], 'A and B বহুবচন।'],
      ['Neither he nor his friends ___ coming.', 'are', ['is', 'was'], 'কাছের subject হলো friends (বহুবচন), তাই are।'],
    ],
  }),

  topic('gerund-infinitive', 'intermediate', 'Gerund & Infinitive', 'Gerund (-ing) ও Infinitive (to)', 'like swimming, want to swim', {
    explain: [
      'Gerund হলো verb + ing যা noun-এর মতো কাজ করে: Swimming is good exercise. Infinitive হলো to + verb: I want to learn English.',
      'কিছু verb-এর পরে gerund বসে (enjoy, finish, avoid, mind, suggest), কিছুর পরে infinitive (want, decide, hope, plan, need)। preposition-এর পরে সবসময় gerund: I am good at drawing.',
    ],
    table: [
      ['এর পরে -ing', 'এর পরে to + verb'],
      ['enjoy, finish, avoid', 'want, need, hope'],
      ['mind, keep, suggest', 'decide, plan, promise'],
      ['interested in, good at', 'would like, try'],
    ],
    examples: [
      ['I enjoy reading stories.', 'আমি গল্প পড়তে ভালোবাসি।'],
      ['She decided to study medicine.', 'সে মেডিকেলে পড়ার সিদ্ধান্ত নিল।'],
      ['He is interested in playing chess.', 'সে দাবা খেলায় আগ্রহী।'],
      ['We need to buy vegetables.', 'আমাদের সবজি কিনতে হবে।'],
    ],
    mistakes: [
      ['I enjoy to swim.', 'I enjoy swimming.', 'enjoy-এর পরে gerund।'],
      ['She wants going home.', 'She wants to go home.', 'want-এর পরে to + verb।'],
      ['I am good at draw.', 'I am good at drawing.', 'preposition-এর পরে gerund।'],
    ],
    quiz: [
      ['Have you finished ___ your homework?', 'doing', ['to do', 'do'], 'finish-এর পরে gerund।'],
      ['I hope ___ you soon.', 'to see', ['seeing', 'see'], 'hope-এর পরে to + verb।'],
      ['Thank you for ___ me.', 'helping', ['help', 'to help'], 'preposition (for)-এর পরে gerund।'],
    ],
  }),
];
