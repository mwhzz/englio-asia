import { topic } from './topic.ts';

/** Grammar for beginners: the building blocks of a sentence. */
export const BEGINNER = [
  topic('parts-of-speech', 'beginner', 'Parts of Speech', 'পদ প্রকরণ', 'ইংরেজি বাক্যের ৮ রকম শব্দ', {
    explain: [
      'ইংরেজিতে প্রতিটি শব্দ বাক্যে কোনো একটা কাজ করে। কাজ অনুযায়ী শব্দকে ৮ ভাগে ভাগ করা হয়, এদের বলে Parts of Speech।',
      'Noun হলো নাম, Pronoun নামের বদলে বসে, Verb কাজ বোঝায়, Adjective নামের গুণ বোঝায়, Adverb কাজের ধরন বোঝায়, Preposition সম্পর্ক বোঝায়, Conjunction দুটো অংশ জোড়া দেয়, আর Interjection মনের আবেগ প্রকাশ করে।',
    ],
    table: [
      ['Part', 'কাজ', 'উদাহরণ'],
      ['Noun', 'নাম', 'Rina, book, Dhaka'],
      ['Pronoun', 'নামের বদলে', 'I, he, they'],
      ['Verb', 'কাজ', 'go, eat, is'],
      ['Adjective', 'গুণ / অবস্থা', 'big, red, happy'],
      ['Adverb', 'কীভাবে / কখন', 'fast, slowly, today'],
      ['Preposition', 'সম্পর্ক', 'in, on, at, to'],
      ['Conjunction', 'জোড়া দেয়', 'and, but, because'],
      ['Interjection', 'আবেগ', 'Oh!, Wow!, Alas!'],
    ],
    examples: [
      ['Rina reads a book.', 'রিনা একটা বই পড়ে। (Rina = noun, reads = verb)'],
      ['She is very happy.', 'সে খুব খুশি। (She = pronoun, happy = adjective)'],
      ['He runs fast.', 'সে দ্রুত দৌড়ায়। (fast = adverb)'],
      ['The pen is on the table.', 'কলমটা টেবিলের উপরে। (on = preposition)'],
    ],
    quiz: [
      ['"happy" শব্দটা কোন Part of Speech?', 'Adjective', ['Verb', 'Noun'], 'happy কারো অবস্থা বা গুণ বোঝায়, তাই এটা Adjective।'],
      ['"She sings sweetly." বাক্যে "sweetly" কী?', 'Adverb', ['Adjective', 'Pronoun'], 'sweetly বলছে সে কীভাবে গায়, তাই এটা Adverb।'],
      ['"and" শব্দটা কোন Part of Speech?', 'Conjunction', ['Preposition', 'Interjection'], 'and দুটো শব্দ বা বাক্য জোড়া দেয়, তাই এটা Conjunction।'],
    ],
  }),

  topic('capitals-punctuation', 'beginner', 'Capital Letters & Punctuation', 'বড় হাতের অক্ষর ও যতিচিহ্ন', 'কোথায় বড় হাতের অক্ষর আর কোন চিহ্ন বসে', {
    explain: [
      'বাক্যের প্রথম অক্ষর সবসময় বড় হাতের (Capital) হয়। মানুষ, জায়গা, দিন, মাস আর ভাষার নামের প্রথম অক্ষরও বড় হাতের হয়। "আমি" অর্থে I সবসময় বড় হাতের।',
      'বাক্য শেষে সাধারণ কথায় full stop (.), প্রশ্নে question mark (?), আর অবাক বা জোর দিয়ে বলা কথায় exclamation mark (!) বসে। তালিকা বা বিরতিতে comma (,) বসে।',
    ],
    table: [
      ['চিহ্ন', 'নাম', 'কখন'],
      ['.', 'Full stop', 'সাধারণ বাক্যের শেষে'],
      ['?', 'Question mark', 'প্রশ্নের শেষে'],
      ['!', 'Exclamation mark', 'অবাক বা জোর দিয়ে বলায়'],
      [',', 'Comma', 'তালিকায় বা ছোট বিরতিতে'],
      ["'", 'Apostrophe', "ছোট রূপ (I'm) বা মালিকানা (Rina's)"],
    ],
    examples: [
      ['My name is Rahim.', 'আমার নাম রহিম।'],
      ['I live in Dhaka.', 'আমি ঢাকায় থাকি।'],
      ['Where are you going?', 'তুমি কোথায় যাচ্ছ?'],
      ['I bought rice, fish and eggs.', 'আমি ভাত, মাছ আর ডিম কিনেছি।'],
    ],
    mistakes: [
      ['i am a student.', 'I am a student.', 'বাক্যের শুরু আর I সবসময় বড় হাতের।'],
      ['We go to school on sunday.', 'We go to school on Sunday.', 'দিনের নাম বড় হাতের অক্ষরে শুরু হয়।'],
      ['What is your name.', 'What is your name?', 'প্রশ্নের শেষে question mark বসে।'],
    ],
    quiz: [
      ['কোন বাক্যটা ঠিক?', 'I live in Bangladesh.', ['i live in bangladesh.', 'I live in bangladesh.'], 'I আর দেশের নাম দুটোই বড় হাতের অক্ষরে শুরু হয়।'],
      ['প্রশ্নের শেষে কোন চিহ্ন বসে?', '?', ['.', '!'], 'প্রশ্নের শেষে question mark (?) বসে।'],
      ['কোনটা ঠিক?', 'My birthday is in May.', ['My birthday is in may.', 'my birthday is in May.'], 'বাক্যের শুরু আর মাসের নাম বড় হাতের।'],
    ],
  }),

  topic('nouns', 'beginner', 'Nouns: Singular & Plural', 'বিশেষ্য: একবচন ও বহুবচন', 'একটা থেকে অনেক: s, es, ies আর অনিয়মিত রূপ', {
    explain: [
      'Noun মানে কোনো কিছুর নাম: মানুষ, জায়গা, জিনিস বা ভাব। একটা বোঝালে Singular, একাধিক বোঝালে Plural।',
      'সাধারণত শেষে s যোগ হয় (book → books)। s, sh, ch, x, o দিয়ে শেষ হলে es (box → boxes)। ব্যঞ্জনবর্ণ + y হলে y বদলে ies (baby → babies)। কিছু শব্দ অনিয়মিত: man → men, child → children।',
    ],
    table: [
      ['নিয়ম', 'Singular', 'Plural'],
      ['+ s', 'book, pen', 'books, pens'],
      ['+ es', 'box, bus, potato', 'boxes, buses, potatoes'],
      ['y → ies', 'baby, city', 'babies, cities'],
      ['f → ves', 'leaf, knife', 'leaves, knives'],
      ['অনিয়মিত', 'man, child, foot', 'men, children, feet'],
    ],
    examples: [
      ['I have two books.', 'আমার দুটো বই আছে।'],
      ['There are many buses on the road.', 'রাস্তায় অনেক বাস আছে।'],
      ['The children are playing.', 'শিশুরা খেলছে।'],
      ['Leaves fall in winter.', 'শীতে পাতা ঝরে।'],
    ],
    mistakes: [
      ['two book', 'two books', 'একের বেশি হলে noun-এর plural রূপ লাগে।'],
      ['three childs', 'three children', 'child-এর plural হলো children।'],
      ['many citys', 'many cities', 'ব্যঞ্জনবর্ণ + y হলে y বদলে ies হয়।'],
    ],
    quiz: [
      ['"box" এর plural কী?', 'boxes', ['boxs', 'boxies'], 'x দিয়ে শেষ হলে es যোগ হয়।'],
      ['"man" এর plural কী?', 'men', ['mans', 'mens'], 'man অনিয়মিত শব্দ; এর plural হলো men।'],
      ['কোনটা ঠিক?', 'I bought five mangoes.', ['I bought five mango.', 'I bought five mangos.'], 'mango-এর plural সাধারণত mangoes লেখা হয়।'],
    ],
  }),

  topic('articles', 'beginner', 'Articles: a, an, the', 'আর্টিকেল: a, an, the', 'কখন a, কখন an, আর কখন the', {
    explain: [
      'a আর an মানে "একটা"; যেকোনো একটা জিনিস বোঝাতে বসে। শব্দটা ব্যঞ্জনধ্বনি দিয়ে শুরু হলে a (a book), স্বরধ্বনি দিয়ে শুরু হলে an (an apple)।',
      'মনে রাখো, নিয়মটা উচ্চারণের, বানানের নয়: an hour (h উচ্চারণ হয় না), কিন্তু a university (ইউ উচ্চারণ)।',
      'the বসে নির্দিষ্ট জিনিস বোঝাতে: যেটার কথা আগে বলা হয়েছে, বা যেটা একটাই আছে (the sun, the moon)।',
    ],
    formulas: ['ব্যঞ্জনধ্বনি: a + book', 'স্বরধ্বনি: an + egg', 'নির্দিষ্ট: the + book (যেটার কথা জানি)'],
    examples: [
      ['I saw a cat.', 'আমি একটা বিড়াল দেখলাম।'],
      ['She eats an egg every day.', 'সে প্রতিদিন একটা ডিম খায়।'],
      ['The cat is black.', 'বিড়ালটা কালো। (আগে বলা বিড়ালটা)'],
      ['The sun rises in the east.', 'সূর্য পূর্ব দিকে ওঠে।'],
    ],
    mistakes: [
      ['a apple', 'an apple', 'apple স্বরধ্বনি দিয়ে শুরু, তাই an।'],
      ['an university', 'a university', 'university-র উচ্চারণ "ইউ" দিয়ে শুরু, তাই a।'],
      ['a hour', 'an hour', 'hour-এর h উচ্চারিত হয় না, তাই an।'],
    ],
    quiz: [
      ['___ umbrella', 'an', ['a', 'the'], 'umbrella স্বরধ্বনি দিয়ে শুরু, তাই an।'],
      ['___ moon is bright tonight.', 'The', ['A', 'An'], 'চাঁদ একটাই, তাই the।'],
      ['He is ___ honest man.', 'an', ['a', 'the'], 'honest-এর h উচ্চারিত হয় না, তাই an।'],
    ],
  }),

  topic('pronouns', 'beginner', 'Pronouns', 'সর্বনাম', 'I/me/my/mine: কোন রূপ কোথায় বসে', {
    explain: [
      'Pronoun নামের বদলে বসে, যাতে একই নাম বারবার বলতে না হয়: "Rina is my friend. She is kind."',
      'কাজটা যে করে তার জন্য Subject রূপ (I, he), যার উপর কাজ হয় তার জন্য Object রূপ (me, him), আর মালিকানা বোঝাতে my/his (noun-এর আগে) বা mine/his (একা)।',
    ],
    table: [
      ['Subject', 'Object', 'Possessive', 'একা'],
      ['I', 'me', 'my', 'mine'],
      ['you', 'you', 'your', 'yours'],
      ['he', 'him', 'his', 'his'],
      ['she', 'her', 'her', 'hers'],
      ['it', 'it', 'its', '—'],
      ['we', 'us', 'our', 'ours'],
      ['they', 'them', 'their', 'theirs'],
    ],
    examples: [
      ['She loves her mother.', 'সে তার মাকে ভালোবাসে।'],
      ['Please help me.', 'দয়া করে আমাকে সাহায্য করো।'],
      ['This bag is mine.', 'এই ব্যাগটা আমার।'],
      ['They play with us.', 'তারা আমাদের সাথে খেলে।'],
    ],
    mistakes: [
      ['Me am a student.', 'I am a student.', 'কাজ যে করে তার জন্য subject রূপ I।'],
      ['He gave the book to I.', 'He gave the book to me.', 'to-র পরে object রূপ me।'],
      ['This is my.', 'This is mine.', 'noun ছাড়া একা বসলে mine।'],
    ],
    quiz: [
      ['___ is my brother.', 'He', ['Him', 'His'], 'বাক্যের subject হিসেবে He বসে।'],
      ['Can you help ___?', 'us', ['we', 'our'], 'help-এর পরে object রূপ us।'],
      ['That pen is ___.', 'hers', ['her', 'she'], 'noun ছাড়া একা বসলে hers।'],
    ],
  }),

  topic('be-verbs', 'beginner', 'Be Verbs: am, is, are, was, were', 'Be verb: am, is, are, was, were', 'কে কোন be verb নেয়', {
    explain: [
      'Be verb দিয়ে বোঝানো হয় কেউ কী, কেমন বা কোথায় আছে। বর্তমানে I-এর সাথে am, he/she/it ও একবচনের সাথে is, আর you/we/they ও বহুবচনের সাথে are।',
      'অতীতে I/he/she/it-এর সাথে was, আর you/we/they-এর সাথে were।',
    ],
    table: [
      ['Subject', 'Present', 'Past'],
      ['I', 'am', 'was'],
      ['he / she / it', 'is', 'was'],
      ['you / we / they', 'are', 'were'],
    ],
    formulas: ['হ্যাঁ-বোধক: Subject + am/is/are + ...', 'না-বোধক: Subject + am/is/are + not + ...', 'প্রশ্ন: Am/Is/Are + Subject + ...?'],
    examples: [
      ['I am a teacher.', 'আমি একজন শিক্ষক।'],
      ['The weather is hot today.', 'আজ আবহাওয়া গরম।'],
      ['They are at home.', 'তারা বাড়িতে আছে।'],
      ['We were tired yesterday.', 'গতকাল আমরা ক্লান্ত ছিলাম।'],
    ],
    mistakes: [
      ['I is happy.', 'I am happy.', 'I-এর সাথে সবসময় am।'],
      ['They was late.', 'They were late.', 'they-এর অতীত রূপ were।'],
      ['She are my sister.', 'She is my sister.', 'she-এর সাথে is।'],
    ],
    quiz: [
      ['We ___ students.', 'are', ['is', 'am'], 'we-এর সাথে are।'],
      ['He ___ sick last week.', 'was', ['were', 'is'], 'অতীত (last week) আর he, তাই was।'],
      ['___ you ready?', 'Are', ['Is', 'Am'], 'you-এর প্রশ্নে Are দিয়ে শুরু।'],
    ],
  }),

  topic('have-has', 'beginner', 'Have, Has, Had', 'Have, has, had', 'কারো কিছু আছে বোঝাতে', {
    explain: [
      'কারো কিছু আছে বোঝাতে have/has ব্যবহার হয়। he/she/it ও একবচনের সাথে has, বাকিদের সাথে have। অতীতে সবার সাথে had।',
      'না-বোধক আর প্রশ্নে do/does সাহায্য করে: I don\'t have a car. Does she have a phone? (does-এর পরে has নয়, have)',
    ],
    table: [
      ['Subject', 'Present', 'Past'],
      ['I / you / we / they', 'have', 'had'],
      ['he / she / it', 'has', 'had'],
    ],
    examples: [
      ['I have a bicycle.', 'আমার একটা সাইকেল আছে।'],
      ['She has two brothers.', 'তার দুই ভাই আছে।'],
      ['We had a cat.', 'আমাদের একটা বিড়াল ছিল।'],
      ['Do you have a pen?', 'তোমার কাছে কি কলম আছে?'],
    ],
    mistakes: [
      ['She have a phone.', 'She has a phone.', 'she-এর সাথে has।'],
      ['Does he has a car?', 'Does he have a car?', 'does-এর পরে verb-এর মূল রূপ have।'],
    ],
    quiz: [
      ['My father ___ a shop.', 'has', ['have', 'having'], 'my father = he, তাই has।'],
      ['They ___ a big house.', 'have', ['has', 'haves'], 'they-এর সাথে have।'],
      ['Does she ___ a laptop?', 'have', ['has', 'had'], 'does-এর পরে have।'],
    ],
  }),

  topic('there-is-are', 'beginner', 'There is / There are', 'There is / There are', 'কোথাও কিছু আছে বোঝাতে', {
    explain: [
      'কোনো জায়গায় কিছু আছে বোঝাতে There is (একটা বা uncountable) আর There are (একাধিক) ব্যবহার হয়।',
      'অতীতে There was / There were। প্রশ্ন: Is there...? Are there...?',
    ],
    formulas: ['একটা: There is + a/an + noun', 'অনেক: There are + plural noun'],
    examples: [
      ['There is a book on the table.', 'টেবিলের উপর একটা বই আছে।'],
      ['There are five people in my family.', 'আমার পরিবারে পাঁচজন মানুষ।'],
      ['There is some water in the glass.', 'গ্লাসে কিছু পানি আছে।'],
      ['Is there a bank near here?', 'এখানে কাছে কি কোনো ব্যাংক আছে?'],
    ],
    mistakes: [
      ['There is many students.', 'There are many students.', 'বহুবচনের সাথে there are।'],
      ['There are a pen.', 'There is a pen.', 'একটা জিনিসের জন্য there is।'],
    ],
    quiz: [
      ['There ___ two cats in the room.', 'are', ['is', 'am'], 'two cats বহুবচন, তাই are।'],
      ['There ___ a river near my village.', 'is', ['are', 'be'], 'a river একটা, তাই is।'],
      ['___ there any milk?', 'Is', ['Are', 'Am'], 'milk uncountable, তাই Is।'],
    ],
  }),

  topic('present-simple', 'beginner', 'Present Simple', 'সাধারণ বর্তমান কাল', 'রোজকার অভ্যাস আর চিরসত্য', {
    explain: [
      'যে কাজ নিয়মিত হয়, অভ্যাস, বা যা চিরসত্য, তা বোঝাতে Present Simple ব্যবহার হয়: I go to school every day. The sun rises in the east.',
      'he/she/it বা একবচন subject হলে verb-এর শেষে s বা es যোগ হয় (he goes, she watches)। না-বোধক আর প্রশ্নে do/does লাগে, তখন verb-এ আর s হয় না।',
    ],
    formulas: [
      'হ্যাঁ-বোধক: Subject + Verb (s/es) + Object',
      'না-বোধক: Subject + do/does not + Verb + Object',
      'প্রশ্ন: Do/Does + Subject + Verb + Object?',
    ],
    examples: [
      ['I drink tea every morning.', 'আমি প্রতিদিন সকালে চা খাই।'],
      ['She goes to school by bus.', 'সে বাসে স্কুলে যায়।'],
      ['He does not like fish.', 'সে মাছ পছন্দ করে না।'],
      ['Do you speak English?', 'তুমি কি ইংরেজি বলো?'],
    ],
    mistakes: [
      ['He go to school.', 'He goes to school.', 'he-এর সাথে verb-এ s/es যোগ হয়।'],
      ['She don\'t like milk.', 'She doesn\'t like milk.', 'she-এর না-বোধকে does not।'],
      ['Does he plays?', 'Does he play?', 'does-এর পরে verb-এর মূল রূপ।'],
    ],
    quiz: [
      ['My mother ___ rice every day.', 'cooks', ['cook', 'cooking'], 'my mother = she, তাই verb-এ s।'],
      ['They ___ football on Fridays.', 'play', ['plays', 'playing'], 'they-এর সাথে verb-এর মূল রূপ।'],
      ['___ he live in Sylhet?', 'Does', ['Do', 'Is'], 'he-এর প্রশ্নে Does।'],
    ],
  }),

  topic('present-continuous', 'beginner', 'Present Continuous', 'ঘটমান বর্তমান কাল', 'এই মুহূর্তে যা হচ্ছে', {
    explain: [
      'যে কাজ এখন চলছে, তা বোঝাতে Present Continuous: I am reading now. এখানে am/is/are-এর পরে verb + ing বসে।',
      'now, at the moment, look!, listen! থাকলে সাধারণত এই tense হয়। শেষে e থাকলে e বাদ দিয়ে ing (make → making), আর ছোট শব্দে শেষ ব্যঞ্জন দুবার (run → running)।',
    ],
    formulas: [
      'হ্যাঁ-বোধক: Subject + am/is/are + Verb-ing + Object',
      'না-বোধক: Subject + am/is/are + not + Verb-ing',
      'প্রশ্ন: Am/Is/Are + Subject + Verb-ing?',
    ],
    examples: [
      ['I am eating rice now.', 'আমি এখন ভাত খাচ্ছি।'],
      ['She is writing a letter.', 'সে একটা চিঠি লিখছে।'],
      ['They are not playing.', 'তারা খেলছে না।'],
      ['Are you listening?', 'তুমি কি শুনছ?'],
    ],
    mistakes: [
      ['I reading a book.', 'I am reading a book.', 'continuous-এ am/is/are লাগবেই।'],
      ['She is make tea.', 'She is making tea.', 'am/is/are-এর পরে verb + ing।'],
      ['He is runing.', 'He is running.', 'run-এর শেষ n দুবার হয়: running।'],
    ],
    quiz: [
      ['Look! The baby ___.', 'is sleeping', ['sleeps', 'are sleeping'], 'Look! মানে এখন হচ্ছে; the baby = it, তাই is sleeping।'],
      ['We ___ TV now.', 'are watching', ['is watching', 'watch'], 'now আর we, তাই are watching।'],
      ['Verb "write" এর ing রূপ কী?', 'writing', ['writeing', 'writting'], 'শেষের e বাদ দিয়ে ing।'],
    ],
  }),

  topic('questions', 'beginner', 'Questions', 'প্রশ্ন করা', 'Yes/No প্রশ্ন আর Wh- প্রশ্ন', {
    explain: [
      'Yes/No প্রশ্নে সাহায্যকারী verb (am/is/are, do/does, can, will…) subject-এর আগে চলে যায়: You are tired. → Are you tired?',
      'Wh- প্রশ্নে প্রশ্নবোধক শব্দ সবার আগে বসে, তারপর yes/no প্রশ্নের মতো: Where do you live? What is your name?',
    ],
    table: [
      ['শব্দ', 'মানে'],
      ['What', 'কী'],
      ['Who', 'কে'],
      ['Where', 'কোথায়'],
      ['When', 'কখন'],
      ['Why', 'কেন'],
      ['How', 'কীভাবে / কেমন'],
      ['Which', 'কোনটা'],
      ['How many / How much', 'কয়টা / কতটুকু'],
    ],
    formulas: ['Yes/No: Helping verb + Subject + Verb?', 'Wh-: Wh-word + Helping verb + Subject + Verb?'],
    examples: [
      ['Is she your sister?', 'সে কি তোমার বোন?'],
      ['Where do you live?', 'তুমি কোথায় থাকো?'],
      ['Why are you sad?', 'তুমি কেন মন খারাপ করে আছ?'],
      ['How many brothers do you have?', 'তোমার কয়জন ভাই?'],
    ],
    mistakes: [
      ['Where you live?', 'Where do you live?', 'প্রশ্নে সাহায্যকারী verb (do) লাগে।'],
      ['What is he doing he?', 'What is he doing?', 'subject একবারই বসে।'],
    ],
    quiz: [
      ['___ is your school? — It is in Rajshahi.', 'Where', ['When', 'Who'], 'জায়গা জানতে চাইলে Where।'],
      ['কোন প্রশ্নটা ঠিক?', 'Do you like mangoes?', ['You like mangoes?', 'Like you mangoes?'], 'Yes/No প্রশ্নে do আগে বসে।'],
      ['___ old are you?', 'How', ['What', 'Which'], 'বয়স জানতে How old।'],
    ],
  }),

  topic('negatives', 'beginner', 'Negative Sentences', 'না-বোধক বাক্য', 'not কোথায় বসে', {
    explain: [
      'না-বোধক বাক্যে সাহায্যকারী verb-এর পরে not বসে: I am not, she is not, they cannot।',
      'সাহায্যকারী verb না থাকলে do not / does not / did not লাগে, আর মূল verb তার মূল রূপে থাকে: He does not eat meat.',
      'কথায় ছোট রূপ বেশি চলে: is not → isn\'t, do not → don\'t, cannot → can\'t, will not → won\'t।',
    ],
    formulas: ['Be verb: Subject + am/is/are + not', 'অন্য verb: Subject + do/does/did + not + Verb'],
    examples: [
      ['I am not hungry.', 'আমার ক্ষুধা নেই।'],
      ['She doesn\'t eat fish.', 'সে মাছ খায় না।'],
      ['We didn\'t go to school yesterday.', 'আমরা গতকাল স্কুলে যাইনি।'],
      ['They can\'t swim.', 'তারা সাঁতার জানে না।'],
    ],
    mistakes: [
      ['I not like tea.', 'I don\'t like tea.', 'সাহায্যকারী verb না থাকলে do not লাগে।'],
      ['He didn\'t went.', 'He didn\'t go.', 'did-এর পরে verb-এর মূল রূপ।'],
    ],
    quiz: [
      ['He ___ like coffee.', "doesn't", ["don't", 'not'], 'he-এর সাথে does not।'],
      ['I ___ go out yesterday.', "didn't", ["don't", "wasn't"], 'yesterday মানে অতীত, তাই did not।'],
      ['কোনটা ঠিক?', 'She is not at home.', ['She not is at home.', 'She does not at home.'], 'be verb-এর পরে not।'],
    ],
  }),

  topic('imperatives', 'beginner', 'Imperatives', 'আদেশ ও অনুরোধ', 'আদেশ, অনুরোধ আর নিষেধ', {
    explain: [
      'আদেশ, অনুরোধ, উপদেশ বা নিষেধ বোঝাতে verb-এর মূল রূপ দিয়ে বাক্য শুরু হয়; subject (you) লেখা হয় না: Open the door.',
      'ভদ্রভাবে বলতে Please যোগ করো। নিষেধ করতে Do not / Don\'t দিয়ে শুরু করো। সবাইকে নিয়ে কিছু করতে Let\'s।',
    ],
    formulas: ['আদেশ: Verb + Object', 'অনুরোধ: Please + Verb + Object', 'নিষেধ: Don\'t + Verb', 'প্রস্তাব: Let\'s + Verb'],
    examples: [
      ['Close the window.', 'জানালাটা বন্ধ করো।'],
      ['Please sit down.', 'দয়া করে বসুন।'],
      ['Don\'t make a noise.', 'শব্দ কোরো না।'],
      ['Let\'s go to the park.', 'চলো পার্কে যাই।'],
    ],
    mistakes: [
      ['You open the book.', 'Open the book.', 'আদেশে you লেখা হয় না।'],
      ['Not run here.', 'Don\'t run here.', 'নিষেধ Don\'t দিয়ে শুরু হয়।'],
    ],
    quiz: [
      ['___ talk in the library.', "Don't", ['Not', 'No'], 'নিষেধ Don\'t দিয়ে।'],
      ['কোনটা ভদ্র অনুরোধ?', 'Please help me.', ['You help me.', 'Helping me.'], 'Please + verb ভদ্র অনুরোধ।'],
      ['___ play cricket after school.', "Let's", ['Lets', 'Let'], 'সবাইকে নিয়ে প্রস্তাব Let\'s।'],
    ],
  }),

  topic('prepositions', 'beginner', 'Prepositions: in, on, at', 'Preposition: in, on, at', 'জায়গা আর সময়ের জন্য', {
    explain: [
      'সময়ে: at বসে নির্দিষ্ট সময়ে (at 5 o\'clock, at night), on বসে দিন ও তারিখে (on Monday, on 21 February), in বসে মাস, বছর, ঋতু আর দিনের অংশে (in June, in 2025, in the morning)।',
      'জায়গায়: in মানে ভেতরে (in the box, in Dhaka), on মানে উপরে বা গায়ে (on the table, on the wall), at মানে নির্দিষ্ট একটা বিন্দুতে (at the door, at school)।',
    ],
    table: [
      ['', 'সময়', 'জায়গা'],
      ['at', 'at 7 am, at night', 'at the gate, at home'],
      ['on', 'on Friday, on 16 December', 'on the table, on the wall'],
      ['in', 'in March, in 2024, in the evening', 'in the room, in Bangladesh'],
    ],
    examples: [
      ['The class starts at 9 o\'clock.', 'ক্লাস ৯টায় শুরু হয়।'],
      ['We celebrate Victory Day on 16 December.', 'আমরা ১৬ ডিসেম্বর বিজয় দিবস পালন করি।'],
      ['It rains a lot in July.', 'জুলাই মাসে অনেক বৃষ্টি হয়।'],
      ['The keys are on the table.', 'চাবিগুলো টেবিলের উপরে।'],
    ],
    mistakes: [
      ['in Monday', 'on Monday', 'দিনের আগে on।'],
      ['on 2020', 'in 2020', 'বছরের আগে in।'],
      ['at the morning', 'in the morning', 'দিনের অংশের আগে in (কিন্তু at night)।'],
    ],
    quiz: [
      ['I was born ___ 2010.', 'in', ['on', 'at'], 'বছরের আগে in।'],
      ['See you ___ Friday.', 'on', ['in', 'at'], 'দিনের আগে on।'],
      ['The bus leaves ___ 6:30.', 'at', ['in', 'on'], 'নির্দিষ্ট সময়ের আগে at।'],
    ],
  }),

  topic('adjectives', 'beginner', 'Adjectives & Comparison', 'বিশেষণ ও তুলনা', 'big, bigger, biggest', {
    explain: [
      'Adjective হলো এমন শব্দ, যা noun-এর গুণ বা অবস্থা বোঝায়, আর সাধারণত noun-এর আগে বা be verb-এর পরে বসে: a big house, The house is big.',
      'দুটোর তুলনায় comparative (-er / more) আর than, সবার মধ্যে সেরা বোঝাতে superlative (the -est / the most)। ছোট শব্দে -er/-est, লম্বা শব্দে more/most।',
    ],
    table: [
      ['Adjective', 'Comparative', 'Superlative'],
      ['tall', 'taller', 'the tallest'],
      ['big', 'bigger', 'the biggest'],
      ['happy', 'happier', 'the happiest'],
      ['beautiful', 'more beautiful', 'the most beautiful'],
      ['good', 'better', 'the best'],
      ['bad', 'worse', 'the worst'],
    ],
    formulas: ['তুলনা: A + is + -er / more + than + B', 'সেরা: A + is + the -est / the most + ...'],
    examples: [
      ['Rahim is taller than Karim.', 'রহিম করিমের চেয়ে লম্বা।'],
      ['Dhaka is the biggest city in Bangladesh.', 'ঢাকা বাংলাদেশের সবচেয়ে বড় শহর।'],
      ['This book is more interesting than that one.', 'এই বইটা ওইটার চেয়ে বেশি মজার।'],
      ['She is the best student in the class.', 'সে ক্লাসের সবচেয়ে ভালো ছাত্রী।'],
    ],
    mistakes: [
      ['more taller', 'taller', '-er আর more একসাথে বসে না।'],
      ['gooder', 'better', 'good-এর comparative হলো better।'],
      ['the most big', 'the biggest', 'ছোট শব্দে -est।'],
    ],
    quiz: [
      ['An elephant is ___ than a horse.', 'bigger', ['big', 'biggest'], 'দুটোর তুলনায় comparative আর than।'],
      ['Everest is ___ mountain in the world.', 'the highest', ['higher', 'the most high'], 'সবার মধ্যে সেরা, তাই the highest।'],
      ['"bad" এর comparative কী?', 'worse', ['badder', 'more bad'], 'bad অনিয়মিত: bad → worse → worst।'],
    ],
  }),
];
