import type { Dialog, DialogLine, Fill, Gaps, Grammar, Lesson, Sentence, Unit, Vocab } from '../types';

const v = (en: string, bn: string, emoji: string): Vocab => ({ en, bn, emoji });
const s = (en: string, bn: string, ...alt: string[]): Sentence => ({ en, bn, alt });
const f = (text: string, answer: string, options: string[], bn: string): Fill => ({ text, answer, options, bn });
/** Several blanks (`___`) filled from one bank: the right words in order, plus wrong ones. */
const gp = (text: string, answers: string[], extra: string[], bn: string): Gaps => ({ text, answers, extra, bn });
/** A grammar rule (Bangla), the correct sentence, wrong versions, and why (Bangla). */
const gr = (rule: string, correct: string, wrong: string[], why: string): Grammar => ({ rule, correct, wrong, why });
/** A conversation with `name`; its last line is the learner's, to be picked from it and `wrong`. */
const d = (name: string, lines: [DialogLine['who'], string, string][], wrong: string[]): Dialog => ({
  with: name,
  lines: lines.map(([who, en, bn]) => ({ who, en, bn })),
  reply: lines.length - 1,
  wrong,
});
type Extras = Pick<Lesson, 'gaps' | 'grammar' | 'dialogs'>;
const L = (
  id: string,
  title: string,
  titleBn: string,
  vocab: Vocab[],
  sentences: Sentence[],
  fills: Fill[],
  extras: Extras = {},
): Lesson => ({
  id,
  title,
  titleBn,
  vocab,
  sentences,
  fills,
  ...extras,
});

/**
 * The built-in English course: the app's fallback when it can't reach the server,
 * and the demo data the server's database is seeded from. Each lesson only lists words, sentences and
 * blanks, and optionally gaps (gp), grammar points (gr) and conversations (d);
 * the exercises are generated from them (see lib/lesson.ts), so adding a
 * lesson means adding data here and nothing else.
 */
export const BUNDLED_COURSE: Unit[] = [
  {
    id: 'u1',
    title: 'First Steps',
    titleBn: 'প্রথম ধাপ',
    color: '#34c759',
    tips: [
      {
        title: 'Greetings',
        body: '"Hello" দিনের যেকোনো সময় বলা যায়। "Good morning" শুধু সকালে বলা হয়, আর "Goodbye" বলা হয় বিদায় নেওয়ার সময়।',
        examples: ['Hello, how are you?', 'Good morning, teacher.'],
      },
      {
        title: 'am / is / are',
        body: 'I এর সাথে am, he / she / it এর সাথে is, আর you / we / they এর সাথে are বসে। "আমি" অর্থে I সবসময় বড় হাতের অক্ষরে লেখা হয়।',
        examples: ['I am a student.', 'She is my friend.', 'You are kind.'],
      },
      {
        title: 'Short forms',
        body: "কথা বলার সময় ছোট রূপ বেশি ব্যবহার হয়: I am → I'm, she is → she's, what is → what's। দুটোই সঠিক।",
        examples: ["I'm fine.", "What's your name?"],
      },
    ],
    lessons: [
      L(
        'u1-l1',
        'Greetings',
        'শুভেচ্ছা',
        [
          v('hello', 'হ্যালো', '🙋'),
          v('good morning', 'সুপ্রভাত', '🌅'),
          v('thank you', 'ধন্যবাদ', '🙏'),
          v('goodbye', 'বিদায়', '👋'),
          v('sorry', 'দুঃখিত', '😔'),
          v('yes', 'হ্যাঁ', '✅'),
          v('no', 'না', '❌'),
        ],
        [
          s('Hello, how are you?', 'হ্যালো, তুমি কেমন আছ?'),
          s('I am fine.', 'আমি ভালো আছি।', 'I am well.', 'I am good.'),
          s('Thank you very much.', 'অনেক ধন্যবাদ।', 'Thanks a lot.'),
          s('Good morning, teacher.', 'সুপ্রভাত, শিক্ষক।'),
          s('Goodbye, see you later.', 'বিদায়, পরে দেখা হবে।'),
        ],
        [
          f('Good ___!', 'morning', ['morning', 'thanks', 'sorry'], 'সুপ্রভাত!'),
          f('Thank ___ very much.', 'you', ['you', 'me', 'I'], 'অনেক ধন্যবাদ।'),
        ],
        {
          gaps: [gp('Good ___, teacher. How ___ you?', ['morning', 'are'], ['is', 'night'], 'সুপ্রভাত, শিক্ষক। আপনি কেমন আছেন?')],
          grammar: [
            gr(
              '"আমি" বোঝাতে ইংরেজিতে I লেখা হয়, আর I সবসময় বড় হাতের অক্ষরে।',
              'I am fine.',
              ['i am fine.', 'I is fine.'],
              'I সবসময় বড় হাতের অক্ষরে লেখা হয়, আর I এর সাথে am বসে।',
            ),
          ],
          dialogs: [
            d(
              'Rina',
              [
                ['them', 'Hello! How are you?', 'হ্যালো! কেমন আছ?'],
                ['you', 'I am fine, thank you.', 'আমি ভালো আছি, ধন্যবাদ।'],
              ],
              ['Goodbye, see you later.', 'Good morning, teacher.'],
            ),
            d(
              'Rina',
              [
                ['them', 'Good morning!', 'সুপ্রভাত!'],
                ['you', 'Good morning! How are you?', 'সুপ্রভাত! কেমন আছ?'],
                ['them', 'I am fine. Goodbye, see you later.', 'ভালো আছি। বিদায়, পরে দেখা হবে।'],
                ['you', 'Goodbye!', 'বিদায়!'],
              ],
              ['Thank you very much.', 'Yes, I am.'],
            ),
          ],
        },
      ),
      L(
        'u1-l2',
        'Introductions',
        'পরিচয়',
        [
          v('name', 'নাম', '🏷️'),
          v('student', 'ছাত্র', '🧑‍🎓'),
          v('teacher', 'শিক্ষক', '🧑‍🏫'),
          v('friend', 'বন্ধু', '🤝'),
          v('boy', 'ছেলে', '👦'),
          v('girl', 'মেয়ে', '👧'),
        ],
        [
          s('My name is Rahim.', 'আমার নাম রহিম।'),
          s('What is your name?', 'তোমার নাম কী?'),
          s('I am a student.', 'আমি একজন ছাত্র।'),
          s('She is my friend.', 'সে আমার বন্ধু।'),
          s('Nice to meet you.', 'তোমার সাথে পরিচিত হয়ে ভালো লাগলো।', 'Pleased to meet you.'),
        ],
        [
          f('I ___ a student.', 'am', ['am', 'is', 'are'], 'আমি একজন ছাত্র।'),
          f('She ___ my friend.', 'is', ['is', 'am', 'are'], 'সে আমার বন্ধু।'),
        ],
        {
          gaps: [gp('My name ___ Rahim. I ___ a student.', ['is', 'am'], ['are', 'be'], 'আমার নাম রহিম। আমি একজন ছাত্র।')],
          grammar: [
            gr(
              'I এর সাথে am, he / she / it এর সাথে is, আর you / we / they এর সাথে are বসে।',
              'She is my friend.',
              ['She am my friend.', 'She are my friend.'],
              'she এর সাথে সবসময় is বসে।',
            ),
            gr(
              'I এর সাথে am, he / she / it এর সাথে is, আর you / we / they এর সাথে are বসে।',
              'You are my teacher.',
              ['You is my teacher.', 'You am my teacher.'],
              'you এর সাথে সবসময় are বসে।',
            ),
          ],
          dialogs: [
            d(
              'Karim',
              [
                ['them', 'Hello! What is your name?', 'হ্যালো! তোমার নাম কী?'],
                ['you', 'My name is Rahim.', 'আমার নাম রহিম।'],
              ],
              ['I am from Bangladesh.', 'Thank you very much.'],
            ),
            d(
              'Karim',
              [
                ['them', 'This is my friend, Rina.', 'এ আমার বন্ধু, রিনা।'],
                ['you', 'Nice to meet you.', 'তোমার সাথে পরিচিত হয়ে ভালো লাগলো।'],
              ],
              ['Goodbye, see you later.', 'I am a student.'],
            ),
          ],
        },
      ),
      L(
        'u1-l3',
        'Where I live',
        'আমি কোথায় থাকি',
        [
          v('country', 'দেশ', '🗺️'),
          v('city', 'শহর', '🏙️'),
          v('village', 'গ্রাম', '🏡'),
          v('river', 'নদী', '🏞️'),
          v('house', 'বাড়ি', '🏠'),
          v('big', 'বড়', '🐘'),
        ],
        [
          s('I am from Bangladesh.', 'আমি বাংলাদেশ থেকে এসেছি।'),
          s('Where are you from?', 'তুমি কোথা থেকে এসেছ?'),
          s('I live in Dhaka.', 'আমি ঢাকায় থাকি।'),
          s('This is a big city.', 'এটা একটা বড় শহর।'),
          s('My village is near a river.', 'আমার গ্রাম একটা নদীর কাছে।'),
        ],
        [
          f('I am ___ Bangladesh.', 'from', ['from', 'in', 'at'], 'আমি বাংলাদেশ থেকে এসেছি।'),
          f('I live ___ Dhaka.', 'in', ['in', 'on', 'to'], 'আমি ঢাকায় থাকি।'),
        ],
        {
          gaps: [gp('I am ___ Bangladesh. I live ___ Dhaka.', ['from', 'in'], ['on', 'at'], 'আমি বাংলাদেশ থেকে এসেছি। আমি ঢাকায় থাকি।')],
          grammar: [
            gr(
              'কোনো শহর বা দেশের ভেতরে থাকা বোঝাতে in বসে, আর কোথা থেকে এসেছ বোঝাতে from।',
              'I live in Dhaka.',
              ['I live on Dhaka.', 'I live from Dhaka.'],
              'শহরের ভেতরে থাকা বোঝাতে in বসে।',
            ),
          ],
          dialogs: [
            d(
              'Tom',
              [
                ['them', 'Where are you from?', 'তুমি কোথা থেকে এসেছ?'],
                ['you', 'I am from Bangladesh.', 'আমি বাংলাদেশ থেকে এসেছি।'],
              ],
              ['This is a big city.', 'Nice to meet you.'],
            ),
          ],
        },
      ),
    ],
  },
  {
    id: 'u2',
    title: 'Family',
    titleBn: 'পরিবার',
    color: '#af52de',
    tips: [
      {
        title: 'my / your / his / her',
        body: 'কার জিনিস বোঝাতে: my = আমার, your = তোমার, his = তার (ছেলে), her = তার (মেয়ে), our = আমাদের, their = তাদের।',
        examples: ['This is my mother.', 'Her sister is ten years old.', 'Our house is small.'],
      },
      {
        title: 'a / an',
        body: 'একটি বোঝাতে a বা an বসে। শব্দটি স্বরধ্বনি (a, e, i, o, u) দিয়ে শুরু হলে an, অন্যথায় a।',
        examples: ['My father is a doctor.', 'I eat an apple.'],
      },
    ],
    lessons: [
      L(
        'u2-l1',
        'My family',
        'আমার পরিবার',
        [
          v('mother', 'মা', '👩'),
          v('father', 'বাবা', '👨'),
          v('brother', 'ভাই', '👦'),
          v('sister', 'বোন', '👧'),
          v('baby', 'শিশু', '👶'),
          v('family', 'পরিবার', '👨‍👩‍👧'),
        ],
        [
          s('This is my mother.', 'ইনি আমার মা।', 'She is my mother.'),
          s('I have a brother.', 'আমার একটা ভাই আছে।', 'I have one brother.'),
          s('My father is a doctor.', 'আমার বাবা একজন ডাক্তার।'),
          s('We are a happy family.', 'আমরা একটি সুখী পরিবার।'),
          s('My sister is ten years old.', 'আমার বোনের বয়স দশ বছর।'),
        ],
        [
          f('This is ___ mother.', 'my', ['my', 'I', 'me'], 'ইনি আমার মা।'),
          f('My father is ___ doctor.', 'a', ['a', 'an', 'am'], 'আমার বাবা একজন ডাক্তার।'),
        ],
      ),
      L(
        'u2-l2',
        'Describing people',
        'মানুষের বর্ণনা',
        [
          v('tall', 'লম্বা', '🦒'),
          v('small', 'ছোট', '🐭'),
          v('happy', 'খুশি', '😊'),
          v('sad', 'দুঃখী', '😢'),
          v('kind', 'দয়ালু', '💖'),
          v('beautiful', 'সুন্দর', '🌸'),
        ],
        [
          s('My brother is tall.', 'আমার ভাই লম্বা।'),
          s('The baby is happy.', 'বাচ্চাটি খুশি।', 'The child is happy.'),
          s('Our house is small.', 'আমাদের বাড়ি ছোট।'),
          s('She is not sad.', 'সে দুঃখী নয়।'),
          s('They are very kind.', 'তারা খুব দয়ালু।'),
        ],
        [
          f('My brother ___ tall.', 'is', ['is', 'are', 'am'], 'আমার ভাই লম্বা।'),
          f('They ___ very kind.', 'are', ['are', 'is', 'am'], 'তারা খুব দয়ালু।'),
        ],
      ),
    ],
  },
  {
    id: 'u3',
    title: 'Food & Drink',
    titleBn: 'খাবার ও পানীয়',
    color: '#ff9500',
    tips: [
      {
        title: 'he / she + verb-s',
        body: 'বর্তমান কালে he, she বা it এর পরে ক্রিয়ার শেষে -s যোগ হয়: I drink → she drinks, I eat → he eats।',
        examples: ['I eat rice.', 'She drinks tea.'],
      },
      {
        title: 'Asking politely',
        body: '"Can I ...?" দিয়ে ভদ্রভাবে কিছু চাওয়া যায়। শেষে "please" যোগ করলে আরও ভদ্র শোনায়।',
        examples: ['Can I see the menu?', 'Give me some water, please.'],
      },
    ],
    lessons: [
      L(
        'u3-l1',
        'Everyday food',
        'প্রতিদিনের খাবার',
        [
          v('rice', 'ভাত', '🍚'),
          v('water', 'পানি', '💧'),
          v('fish', 'মাছ', '🐟'),
          v('egg', 'ডিম', '🥚'),
          v('apple', 'আপেল', '🍎'),
          v('tea', 'চা', '🍵'),
          v('milk', 'দুধ', '🥛'),
        ],
        [
          s('I eat rice.', 'আমি ভাত খাই।'),
          s('She drinks tea.', 'সে চা পান করে।'),
          s('I like fish.', 'আমি মাছ পছন্দ করি।'),
          s('Give me some water, please.', 'অনুগ্রহ করে আমাকে একটু পানি দাও।', 'Please give me some water.', 'Give me water, please.'),
          s('The apple is red.', 'আপেলটি লাল।'),
        ],
        [
          f('She ___ tea.', 'drinks', ['drinks', 'drink', 'drinking'], 'সে চা পান করে।'),
          f('I eat ___ apple.', 'an', ['an', 'a', 'am'], 'আমি একটা আপেল খাই।'),
        ],
      ),
      L(
        'u3-l2',
        'At a restaurant',
        'রেস্টুরেন্টে',
        [
          v('hungry', 'ক্ষুধার্ত', '🤤'),
          v('thirsty', 'তৃষ্ণার্ত', '🥵'),
          v('delicious', 'সুস্বাদু', '😋'),
          v('chicken', 'মুরগি', '🍗'),
          v('spoon', 'চামচ', '🥄'),
          v('plate', 'প্লেট', '🍽️'),
        ],
        [
          s('I am hungry.', 'আমার ক্ষুধা লেগেছে।'),
          s('The food is delicious.', 'খাবারটি সুস্বাদু।', 'The food is tasty.'),
          s('Can I see the menu?', 'আমি কি মেনুটা দেখতে পারি?'),
          s('We want chicken and rice.', 'আমরা মুরগি আর ভাত চাই।'),
          s('Are you thirsty?', 'তোমার কি পিপাসা পেয়েছে?'),
        ],
        [
          f('I ___ hungry.', 'am', ['am', 'is', 'are'], 'আমার ক্ষুধা লেগেছে।'),
          f('___ you thirsty?', 'Are', ['Are', 'Is', 'Am'], 'তোমার কি পিপাসা পেয়েছে?'),
        ],
      ),
    ],
  },
  {
    id: 'u4',
    title: 'Numbers & Time',
    titleBn: 'সংখ্যা ও সময়',
    color: '#007aff',
    tips: [
      {
        title: 'One cat, two cats',
        body: 'একের বেশি বোঝাতে সাধারণত শব্দের শেষে -s যোগ হয়: one book → three books।',
        examples: ['I have two cats.', 'She has three books.'],
      },
      {
        title: 'Telling the time',
        body: 'সময় জানতে "What time is it?" বলা হয়। উত্তরে "It is ... o\'clock" বলা হয়।',
        examples: ['What time is it?', "It is seven o'clock."],
      },
    ],
    lessons: [
      L(
        'u4-l1',
        'Numbers',
        'সংখ্যা',
        [
          v('one', 'এক', '1️⃣'),
          v('two', 'দুই', '2️⃣'),
          v('three', 'তিন', '3️⃣'),
          v('four', 'চার', '4️⃣'),
          v('five', 'পাঁচ', '5️⃣'),
          v('ten', 'দশ', '🔟'),
        ],
        [
          s('I have two cats.', 'আমার দুটি বিড়াল আছে।'),
          s('She has three books.', 'তার তিনটি বই আছে।'),
          s('There are five eggs.', 'পাঁচটি ডিম আছে।'),
          s('I am ten years old.', 'আমার বয়স দশ বছর।'),
          s('Four and one is five.', 'চার আর এক মিলে পাঁচ।', 'Four plus one is five.'),
        ],
        [
          f('I have two ___.', 'cats', ['cats', 'cat', 'a cat'], 'আমার দুটি বিড়াল আছে।'),
          f('She has three ___.', 'books', ['books', 'book', 'a book'], 'তার তিনটি বই আছে।'),
        ],
      ),
      L(
        'u4-l2',
        'Days & time',
        'দিন ও সময়',
        [
          v('today', 'আজ', '📅'),
          v('tomorrow', 'আগামীকাল', '⏭️'),
          v('yesterday', 'গতকাল', '⏮️'),
          v('morning', 'সকাল', '🌄'),
          v('night', 'রাত', '🌙'),
          v('clock', 'ঘড়ি', '⏰'),
        ],
        [
          s('What time is it?', 'এখন কয়টা বাজে?'),
          s("It is seven o'clock.", 'এখন সাতটা বাজে।'),
          s('I wake up in the morning.', 'আমি সকালে ঘুম থেকে উঠি।', 'I get up in the morning.'),
          s('See you tomorrow.', 'আগামীকাল দেখা হবে।'),
          s('Today is Friday.', 'আজ শুক্রবার।'),
        ],
        [
          f('I wake up ___ the morning.', 'in', ['in', 'on', 'at'], 'আমি সকালে ঘুম থেকে উঠি।'),
          f('See you ___.', 'tomorrow', ['tomorrow', 'yesterday', 'last'], 'আগামীকাল দেখা হবে।'),
        ],
      ),
    ],
  },
  {
    id: 'u5',
    title: 'Daily Life',
    titleBn: 'দৈনন্দিন জীবন',
    color: '#ff2d55',
    tips: [
      {
        title: 'Habits: I go, he goes',
        body: 'নিয়মিত যা করি তা present simple দিয়ে বলা হয়: I go to school. He reads a book.',
        examples: ['I go to school.', 'He reads a book.'],
      },
      {
        title: 'Right now: am / is / are + -ing',
        body: 'এই মুহূর্তে যা ঘটছে তা বলতে am / is / are এর পরে ক্রিয়ার সাথে -ing যোগ হয়: I am going home.',
        examples: ['I am going home.', 'The children are in the park.'],
      },
    ],
    lessons: [
      L(
        'u5-l1',
        'Actions',
        'কাজকর্ম',
        [
          v('go', 'যাওয়া', '🚶'),
          v('read', 'পড়া', '📖'),
          v('write', 'লেখা', '✍️'),
          v('sleep', 'ঘুমানো', '😴'),
          v('play', 'খেলা', '⚽'),
          v('work', 'কাজ করা', '💼'),
        ],
        [
          s('I go to school.', 'আমি স্কুলে যাই।'),
          s('He reads a book.', 'সে একটি বই পড়ে।'),
          s('We play football.', 'আমরা ফুটবল খেলি।'),
          s('She works in an office.', 'সে একটি অফিসে কাজ করে।'),
          s('I sleep at night.', 'আমি রাতে ঘুমাই।'),
        ],
        [
          f('He ___ a book.', 'reads', ['reads', 'read', 'reading'], 'সে একটি বই পড়ে।'),
          f('We ___ football.', 'play', ['play', 'plays', 'playing'], 'আমরা ফুটবল খেলি।'),
        ],
      ),
      L(
        'u5-l2',
        'Around town',
        'শহরের ভেতরে',
        [
          v('school', 'স্কুল', '🏫'),
          v('market', 'বাজার', '🛒'),
          v('hospital', 'হাসপাতাল', '🏥'),
          v('park', 'পার্ক', '🌳'),
          v('shop', 'দোকান', '🏪'),
          v('office', 'অফিস', '🏢'),
        ],
        [
          s('Where is the hospital?', 'হাসপাতাল কোথায়?'),
          s('I am going home.', 'আমি বাড়ি যাচ্ছি।'),
          s('The market is near.', 'বাজার কাছেই।', 'The market is close.', 'The market is nearby.'),
          s('The children are in the park.', 'বাচ্চারা পার্কে আছে।', 'The kids are in the park.'),
          s('Is the shop open?', 'দোকানটা কি খোলা?'),
        ],
        [
          f('I am ___ home.', 'going', ['going', 'go', 'goes'], 'আমি বাড়ি যাচ্ছি।'),
          f('The children are ___ the park.', 'in', ['in', 'of', 'to'], 'বাচ্চারা পার্কে আছে।'),
        ],
      ),
    ],
  },
  {
    id: 'u7',
    title: 'At the Market',
    titleBn: 'বাজারে',
    color: '#00c7be',
    tips: [
      {
        title: 'How much …?',
        body: 'দাম জানতে "How much is this?" বলা হয়। একাধিক জিনিস হলে "How much are these?"।',
        examples: ['How much is a kilo of potatoes?', 'How much are these tomatoes?'],
      },
      {
        title: 'Asking politely',
        body: 'দোকানে কিছু চাইতে "I want …" বা আরও ভদ্রভাবে "Can I have …?" বলা যায়। শেষে "please" যোগ করলে ভালো শোনায়।',
        examples: ['I want two kilos of onions.', 'Can you give me a discount?'],
      },
    ],
    lessons: [
      L(
        'u7-l1',
        'Vegetables',
        'সবজি',
        [
          v('potato', 'আলু', '🥔'),
          v('onion', 'পেঁয়াজ', '🧅'),
          v('tomato', 'টমেটো', '🍅'),
          v('carrot', 'গাজর', '🥕'),
          v('chili', 'মরিচ', '🌶️'),
          v('kilo', 'কেজি', '⚖️'),
        ],
        [
          s('How much is a kilo of potatoes?', 'এক কেজি আলুর দাম কত?'),
          s('I want two kilos of onions.', 'আমি দুই কেজি পেঁয়াজ চাই।', 'I need two kilos of onions.'),
          s('These tomatoes are fresh.', 'এই টমেটোগুলো তাজা।'),
          s('Give me some green chilies.', 'আমাকে কিছু কাঁচা মরিচ দিন।', 'Please give me some green chilies.'),
          s('Carrots are good for health.', 'গাজর স্বাস্থ্যের জন্য ভালো।', 'Carrots are good for your health.'),
        ],
        [
          f('How much ___ this?', 'is', ['is', 'are', 'am'], 'এটার দাম কত?'),
          f('These tomatoes ___ fresh.', 'are', ['are', 'is', 'am'], 'এই টমেটোগুলো তাজা।'),
        ],
      ),
      L(
        'u7-l2',
        'Paying & bargaining',
        'দামাদামি',
        [
          v('price', 'দাম', '🏷️'),
          v('cheap', 'সস্তা', '👍'),
          v('expensive', 'দামি', '💰'),
          v('money', 'টাকা', '💵'),
          v('change', 'ভাংতি', '🪙'),
          v('receipt', 'রসিদ', '🧾'),
        ],
        [
          s('This is too expensive.', 'এটা অনেক দামি।'),
          s('Can you give me a discount?', 'একটু কম রাখা যাবে?', 'Can you give a discount?'),
          s('I will pay two hundred taka.', 'আমি দুইশো টাকা দেব।'),
          s('Do you have change?', 'আপনার কাছে ভাংতি আছে?'),
          s('Can I pay with bKash?', 'বিকাশে টাকা দেওয়া যাবে?', 'Can I pay by bKash?'),
        ],
        [
          f('This is too ___.', 'expensive', ['expensive', 'expense', 'expend'], 'এটা অনেক দামি।'),
          f('Do you ___ change?', 'have', ['have', 'has', 'having'], 'আপনার কাছে ভাংতি আছে?'),
        ],
      ),
    ],
  },
  {
    id: 'u8',
    title: 'At School',
    titleBn: 'স্কুলে',
    color: '#5856d6',
    tips: [
      {
        title: 'May I …?',
        body: 'ক্লাসে অনুমতি চাইতে "May I …?" দিয়ে শুরু করা হয়। এটা খুব ভদ্র।',
        examples: ['May I come in, sir?', 'May I go out?'],
      },
      {
        title: 'When you don’t understand',
        body: 'কিছু না বুঝলে লজ্জা না পেয়ে বলো "I don’t understand." বা "Can you say that again?"।',
        examples: ["I don't understand.", 'Please speak slowly.'],
      },
    ],
    lessons: [
      L(
        'u8-l1',
        'In the classroom',
        'ক্লাসরুমে',
        [
          v('book', 'বই', '📘'),
          v('pen', 'কলম', '🖊️'),
          v('pencil', 'পেন্সিল', '✏️'),
          v('board', 'বোর্ড', '📋'),
          v('homework', 'বাড়ির কাজ', '📝'),
          v('bell', 'ঘণ্টা', '🔔'),
        ],
        [
          s('May I come in, sir?', 'স্যার, আমি কি ভেতরে আসতে পারি?'),
          s('Please open your books.', 'তোমাদের বই খোলো।', 'Open your books, please.'),
          s('I forgot my homework.', 'আমি বাড়ির কাজ আনতে ভুলে গেছি।'),
          s('Can I borrow your pen?', 'আমি কি তোমার কলমটা নিতে পারি?'),
          s('Look at the board.', 'বোর্ডের দিকে তাকাও।'),
        ],
        [
          f('___ I come in?', 'May', ['May', 'Do', 'Am'], 'আমি কি ভেতরে আসতে পারি?'),
          f('Look ___ the board.', 'at', ['at', 'on', 'in'], 'বোর্ডের দিকে তাকাও।'),
        ],
      ),
      L(
        'u8-l2',
        'Asking for help',
        'সাহায্য চাওয়া',
        [
          v('question', 'প্রশ্ন', '❓'),
          v('answer', 'উত্তর', '💬'),
          v('word', 'শব্দ', '🔤'),
          v('meaning', 'অর্থ', '💡'),
          v('slowly', 'ধীরে', '🐢'),
          v('again', 'আবার', '🔁'),
        ],
        [
          s("I don't understand.", 'আমি বুঝতে পারছি না।'),
          s('Can you say that again?', 'আপনি কি আবার বলবেন?', 'Could you say that again?'),
          s('What is the meaning of this word?', 'এই শব্দের অর্থ কী?'),
          s('Please speak slowly.', 'অনুগ্রহ করে ধীরে বলুন।', 'Speak slowly, please.'),
          s('I have a question.', 'আমার একটা প্রশ্ন আছে।'),
        ],
        [
          f("I don't ___.", 'understand', ['understand', 'understands', 'understood'], 'আমি বুঝতে পারছি না।'),
          f('I have a ___.', 'question', ['question', 'questions', 'ask'], 'আমার একটা প্রশ্ন আছে।'),
        ],
      ),
    ],
  },
  {
    id: 'u9',
    title: 'Weather',
    titleBn: 'আবহাওয়া',
    color: '#32ade6',
    tips: [
      {
        title: 'It is …',
        body: 'আবহাওয়া বলতে "It is" দিয়ে শুরু হয়: It is hot. এখন যা হচ্ছে তা বলতে -ing: It is raining।',
        examples: ['It is raining outside.', 'It is very hot today.'],
      },
      {
        title: 'Seasons',
        body: 'ঋতুর আগে সাধারণত "in" বসে: in winter, in summer, in spring।',
        examples: ['We eat pitha in winter.', 'Flowers bloom in spring.'],
      },
    ],
    lessons: [
      L(
        'u9-l1',
        'Rain and sun',
        'বৃষ্টি আর রোদ',
        [
          v('rain', 'বৃষ্টি', '🌧️'),
          v('sun', 'সূর্য', '☀️'),
          v('cloud', 'মেঘ', '☁️'),
          v('hot', 'গরম', '🔥'),
          v('cold', 'ঠান্ডা', '🥶'),
          v('umbrella', 'ছাতা', '☂️'),
        ],
        [
          s('It is raining outside.', 'বাইরে বৃষ্টি হচ্ছে।'),
          s('It is very hot today.', 'আজ খুব গরম।', 'Today is very hot.'),
          s('Take your umbrella.', 'তোমার ছাতাটা নাও।'),
          s('The sky is cloudy.', 'আকাশ মেঘলা।'),
          s('I feel cold.', 'আমার ঠান্ডা লাগছে।', 'I am cold.'),
        ],
        [
          f('It is ___ outside.', 'raining', ['raining', 'rain', 'rains'], 'বাইরে বৃষ্টি হচ্ছে।'),
          f('Take your ___.', 'umbrella', ['umbrella', 'rain', 'sun'], 'তোমার ছাতাটা নাও।'),
        ],
      ),
      L(
        'u9-l2',
        'Seasons',
        'ঋতু',
        [
          v('summer', 'গ্রীষ্ম', '🌞'),
          v('winter', 'শীত', '❄️'),
          v('spring', 'বসন্ত', '🌸'),
          v('flood', 'বন্যা', '🌊'),
          v('wind', 'বাতাস', '🌬️'),
          v('storm', 'ঝড়', '⛈️'),
        ],
        [
          s('Winter is my favourite season.', 'শীত আমার প্রিয় ঋতু।', 'Winter is my favorite season.'),
          s('It is very windy today.', 'আজ অনেক বাতাস বইছে।'),
          s('A storm is coming.', 'ঝড় আসছে।'),
          s('Flowers bloom in spring.', 'বসন্তে ফুল ফোটে।'),
          s('We eat pitha in winter.', 'আমরা শীতকালে পিঠা খাই।'),
        ],
        [
          f('Flowers bloom ___ spring.', 'in', ['in', 'on', 'at'], 'বসন্তে ফুল ফোটে।'),
          f('A storm ___ coming.', 'is', ['is', 'are', 'am'], 'ঝড় আসছে।'),
        ],
      ),
    ],
  },
  {
    id: 'u6',
    title: 'Travel',
    titleBn: 'ভ্রমণ',
    color: '#30b0c7',
    tips: [
      {
        title: 'Giving directions',
        body: 'নির্দেশ দিতে ক্রিয়া দিয়েই বাক্য শুরু হয়: Turn left. Go straight. Stop here.',
        examples: ['Turn left here.', 'Where is the bus station?'],
      },
      {
        title: 'Asking for help',
        body: 'অপরিচিত কাউকে কিছু জিজ্ঞেস করার আগে "Excuse me" বলা ভদ্রতা।',
        examples: ['Excuse me, can you help me?', 'Can I have the key, please?'],
      },
    ],
    lessons: [
      L(
        'u6-l1',
        'Getting around',
        'যাতায়াত',
        [
          v('bus', 'বাস', '🚌'),
          v('train', 'ট্রেন', '🚆'),
          v('ticket', 'টিকিট', '🎫'),
          v('airport', 'বিমানবন্দর', '✈️'),
          v('left', 'বাম', '⬅️'),
          v('right', 'ডান', '➡️'),
        ],
        [
          s('Where is the bus station?', 'বাস স্টেশন কোথায়?'),
          s('I need a ticket.', 'আমার একটা টিকিট দরকার।'),
          s('Turn left here.', 'এখানে বামে ঘুরুন।'),
          s('The train is late.', 'ট্রেনটি দেরি করছে।'),
          s('The airport is far.', 'বিমানবন্দর অনেক দূরে।', 'The airport is far away.'),
        ],
        [
          f('Turn ___ here.', 'left', ['left', 'lift', 'late'], 'এখানে বামে ঘুরুন।'),
          f('I need ___ ticket.', 'a', ['a', 'an', 'am'], 'আমার একটা টিকিট দরকার।'),
        ],
      ),
      L(
        'u6-l2',
        'At the hotel',
        'হোটেলে',
        [
          v('room', 'রুম', '🛏️'),
          v('key', 'চাবি', '🔑'),
          v('map', 'মানচিত্র', '🧭'),
          v('passport', 'পাসপোর্ট', '🛂'),
          v('bag', 'ব্যাগ', '🧳'),
          v('help', 'সাহায্য', '🆘'),
        ],
        [
          s('Excuse me, can you help me?', 'মাফ করবেন, আপনি কি আমাকে সাহায্য করতে পারবেন?'),
          s('Where is my bag?', 'আমার ব্যাগ কোথায়?'),
          s('Here is my passport.', 'এই যে আমার পাসপোর্ট।'),
          s('I am lost.', 'আমি পথ হারিয়ে ফেলেছি।'),
          s('Can I have the key, please?', 'অনুগ্রহ করে চাবিটা দেবেন?', 'Can I have the key?', 'Please give me the key.'),
        ],
        [
          f('Can you ___ me?', 'help', ['help', 'helps', 'helping'], 'আপনি কি আমাকে সাহায্য করতে পারবেন?'),
          f('Where ___ my bag?', 'is', ['is', 'are', 'am'], 'আমার ব্যাগ কোথায়?'),
        ],
      ),
    ],
  },
  {
    id: 'u10',
    title: 'On the Phone',
    titleBn: 'ফোনে কথা',
    color: '#a2845e',
    tips: [
      {
        title: 'This is …',
        body: 'ফোনে নিজের পরিচয় দিতে "I am" না বলে "This is …" বলা হয়: Hello, this is Rahim।',
        examples: ['Hello, this is Rahim.', 'Can I speak to Karim?'],
      },
      {
        title: 'I will …',
        body: 'ভবিষ্যতে কিছু করবে বোঝাতে "I will" (ছোট রূপে I’ll) বসে।',
        examples: ['I will call you later.', "I'll send you the photo."],
      },
    ],
    lessons: [
      L(
        'u10-l1',
        'Making a call',
        'ফোন করা',
        [
          v('phone', 'ফোন', '📱'),
          v('call', 'কল', '📞'),
          v('number', 'নম্বর', '🔢'),
          v('message', 'মেসেজ', '✉️'),
          v('battery', 'ব্যাটারি', '🔋'),
          v('later', 'পরে', '⏳'),
        ],
        [
          s('Hello, this is Rahim.', 'হ্যালো, আমি রহিম বলছি।'),
          s('Can I speak to Karim?', 'আমি কি করিমের সাথে কথা বলতে পারি?'),
          s('I will call you later.', 'আমি তোমাকে পরে কল করব।'),
          s('What is your phone number?', 'তোমার ফোন নম্বর কত?'),
          s('My battery is low.', 'আমার ফোনের চার্জ কম।'),
        ],
        [
          f('Hello, ___ is Rahim.', 'this', ['this', 'he', 'am'], 'হ্যালো, আমি রহিম বলছি।'),
          f('I will call you ___.', 'later', ['later', 'late', 'latest'], 'আমি তোমাকে পরে কল করব।'),
        ],
      ),
      L(
        'u10-l2',
        'Messages',
        'মেসেজ',
        [
          v('send', 'পাঠানো', '📤'),
          v('reply', 'উত্তর দেওয়া', '↩️'),
          v('photo', 'ছবি', '📷'),
          v('video', 'ভিডিও', '🎥'),
          v('online', 'অনলাইন', '🌐'),
          v('busy', 'ব্যস্ত', '⏰'),
        ],
        [
          s('Please send me the photo.', 'অনুগ্রহ করে আমাকে ছবিটা পাঠাও।', 'Send me the photo, please.'),
          s('I am busy right now.', 'আমি এখন ব্যস্ত।'),
          s('Reply when you are free.', 'ফ্রি হলে উত্তর দিও।'),
          s('Are you online?', 'তুমি কি অনলাইনে আছ?'),
          s('I sent you a video.', 'আমি তোমাকে একটা ভিডিও পাঠিয়েছি।'),
        ],
        [
          f('I am ___ right now.', 'busy', ['busy', 'business', 'busily'], 'আমি এখন ব্যস্ত।'),
          f('I ___ you a video.', 'sent', ['sent', 'send', 'sending'], 'আমি তোমাকে একটা ভিডিও পাঠিয়েছি।'),
        ],
      ),
    ],
  },
  {
    id: 'u11',
    title: 'At the Doctor',
    titleBn: 'ডাক্তারের কাছে',
    color: '#ff453a',
    tips: [
      {
        title: 'I have a …',
        body: 'অসুখের কথা বলতে "I have a …" বলা হয়: I have a fever. কোথাও ব্যথা হলে "My … hurts."।',
        examples: ['I have a fever.', 'My head hurts.'],
      },
      {
        title: 'Taking medicine',
        body: 'ওষুধ খাওয়ার নিয়ম বলতে: once a day (দিনে একবার), twice a day (দিনে দুইবার), after meals (খাবারের পরে)।',
        examples: ['Take it twice a day.', 'Take this medicine after meals.'],
      },
    ],
    lessons: [
      L(
        'u11-l1',
        'Feeling sick',
        'অসুস্থ লাগা',
        [
          v('fever', 'জ্বর', '🤒'),
          v('headache', 'মাথাব্যথা', '🤕'),
          v('cough', 'কাশি', '😷'),
          v('medicine', 'ওষুধ', '💊'),
          v('doctor', 'ডাক্তার', '🩺'),
          v('rest', 'বিশ্রাম', '🛌'),
        ],
        [
          s('I have a fever.', 'আমার জ্বর হয়েছে।'),
          s('My head hurts.', 'আমার মাথা ব্যথা করছে।', 'I have a headache.'),
          s('I need a doctor.', 'আমার একজন ডাক্তার দরকার।'),
          s('Take this medicine after meals.', 'খাবারের পরে এই ওষুধটা খাবেন।', 'Take this medicine after eating.'),
          s('You need some rest.', 'আপনার একটু বিশ্রাম দরকার।'),
        ],
        [
          f('I ___ a fever.', 'have', ['have', 'has', 'am'], 'আমার জ্বর হয়েছে।'),
          f('My head ___.', 'hurts', ['hurts', 'hurt', 'hurting'], 'আমার মাথা ব্যথা করছে।'),
        ],
      ),
      L(
        'u11-l2',
        'At the pharmacy',
        'ফার্মেসিতে',
        [
          v('pharmacy', 'ফার্মেসি', '⚕️'),
          v('syrup', 'সিরাপ', '🧴'),
          v('bandage', 'ব্যান্ডেজ', '🩹'),
          v('thermometer', 'থার্মোমিটার', '🌡️'),
          v('prescription', 'প্রেসক্রিপশন', '📋'),
          v('twice', 'দুইবার', '✌️'),
        ],
        [
          s('Where is the nearest pharmacy?', 'সবচেয়ে কাছের ফার্মেসি কোথায়?'),
          s('Here is my prescription.', 'এই যে আমার প্রেসক্রিপশন।'),
          s('Take it twice a day.', 'দিনে দুইবার খাবেন।'),
          s('I need a bandage.', 'আমার একটা ব্যান্ডেজ দরকার।'),
          s('Do you have cough syrup?', 'আপনার কাছে কাশির সিরাপ আছে?'),
        ],
        [
          f('Take it ___ a day.', 'twice', ['twice', 'two', 'second'], 'দিনে দুইবার খাবেন।'),
          f('Where is the ___ pharmacy?', 'nearest', ['nearest', 'near', 'nearly'], 'সবচেয়ে কাছের ফার্মেসি কোথায়?'),
        ],
      ),
    ],
  },
];

const flatten = (units: Unit[]) => units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));

/** The course the app is using: the server's copy once loaded (see lib/courseSource.ts), else the built-in one. */
export let COURSE: Unit[] = BUNDLED_COURSE;
export let ALL_LESSONS = flatten(COURSE);

/** Switches the app to another copy of the course; call before the app renders. */
export function setCourse(units: Unit[]): void {
  COURSE = units;
  ALL_LESSONS = flatten(units);
}
