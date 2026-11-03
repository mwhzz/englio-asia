import type { CourseLesson, GrammarCourse, Pos, QuestionKind } from './types.ts';

let n = 0;
/** One lesson; ids run pos-01, pos-02, … in order. */
function lesson(
  title: string,
  titleBn: string,
  points: string[],
  examples: [string, string][],
  focus: Pos[],
  kinds: QuestionKind[],
  size?: number,
): CourseLesson {
  n += 1;
  return { id: `pos-${String(n).padStart(2, '0')}`, title, titleBn, teach: { points, examples }, focus, kinds, size };
}

const ALL: Pos[] = ['n', 'pro', 'v', 'adj', 'adv', 'prep', 'conj', 'int'];

/**
 * Parts of Speech from zero to sure: 35 lessons, one part of speech at a time,
 * each lesson also bringing back the earlier ones so nothing is forgotten.
 */
export const PARTS_OF_SPEECH: GrammarCourse = {
  topicId: 'parts-of-speech',
  units: [
    {
      title: 'Noun',
      titleBn: 'বিশেষ্য',
      lessons: [
        lesson(
          'What is a noun?',
          'Noun কী?',
          ['Noun মানে নাম। যেকোনো মানুষ, জায়গা, জিনিস বা প্রাণীর নামই noun।', 'নিজেকে প্রশ্ন করো: "এটা কি কোনো কিছুর নাম?" উত্তর হ্যাঁ হলে সেটা noun।'],
          [['boy', 'ছেলে (মানুষ)'], ['school', 'স্কুল (জায়গা)'], ['book', 'বই (জিনিস)'], ['cat', 'বিড়াল (প্রাণী)']],
          ['n'],
          ['is', 'is', 'tap'],
        ),
        lesson(
          'People, places and things',
          'মানুষ, জায়গা আর জিনিস',
          ['মানুষের নাম (teacher, Rina), জায়গার নাম (village, Dhaka), জিনিসের নাম (pen, rice) সবই noun।', 'একটা বাক্যে একাধিক noun থাকতে পারে।'],
          [['The teacher reads a book.', 'teacher আর book দুটোই noun'], ['Rina lives in a village.', 'Rina আর village দুটোই noun']],
          ['n'],
          ['tap', 'is', 'tap'],
        ),
        lesson(
          'Proper and common nouns',
          'নির্দিষ্ট আর সাধারণ নাম',
          [
            'Proper noun একটা নির্দিষ্ট মানুষ, জায়গা বা জিনিসের নিজস্ব নাম: Rahim, Dhaka, Padma, Monday। এরা সবসময় বড় হাতের অক্ষরে শুরু হয়।',
            'Common noun হলো সাধারণ নাম, যেকোনো একটাকে বোঝায়: boy, city, river, day।',
          ],
          [['Dhaka is a big city.', 'Dhaka = proper, city = common'], ['The Padma is a river.', 'Padma = proper, river = common']],
          ['n'],
          ['nounKind', 'nounKind', 'tap'],
        ),
        lesson(
          'Ideas are nouns too',
          'ভাবও noun',
          ['যা চোখে দেখা যায় না, শুধু অনুভব করা যায়, তার নামও noun: happiness (সুখ), honesty (সততা), love (ভালোবাসা), freedom (স্বাধীনতা)।'],
          [['Honesty is the best policy.', 'Honesty = noun'], ['Freedom is very precious.', 'Freedom = noun']],
          ['n'],
          ['is', 'tap', 'formFill'],
        ),
        lesson('Noun review', 'Noun ঝালাই', ['এই ইউনিটের সব noun আবার দেখে নাও: মানুষ, জায়গা, জিনিস, প্রাণী আর ভাবের নাম।'], [['Rahim plays football every day.', 'Rahim, football, day = noun']], ['n'], ['tap', 'is', 'nounKind']),
      ],
    },
    {
      title: 'Pronoun',
      titleBn: 'সর্বনাম',
      lessons: [
        lesson(
          'What is a pronoun?',
          'Pronoun কী?',
          ['Pronoun হলো এমন শব্দ, যা noun-এর বদলে বসে। এতে একই নাম বারবার বলতে হয় না।', 'I, you, he, she, it, we, they হলো সবচেয়ে বেশি ব্যবহৃত pronoun।'],
          [['Rina is kind. She helps me.', 'She = Rina-র বদলে'], ['The cat is hungry. It wants milk.', 'It = cat-এর বদলে']],
          ['pro'],
          ['is', 'which', 'pronounFill'],
        ),
        lesson(
          'Pronouns take the place of nouns',
          'নামের জায়গায় সর্বনাম',
          ['ছেলের জন্য he, মেয়ের জন্য she, জিনিস বা প্রাণীর জন্য it, অনেকজনের জন্য they, আর নিজেরা সহ অনেকজনের জন্য we।'],
          [['Rahim is my friend. He lives in Sylhet.', 'He = Rahim'], ['My parents are teachers. They work hard.', 'They = parents']],
          ['pro'],
          ['pronounFill', 'pronounFill', 'tap'],
        ),
        lesson(
          'Me, him, them',
          'আমাকে, তাকে, তাদের',
          ['কাজটা যার উপর হয়, তার জন্য object pronoun বসে: me, him, her, us, them। এগুলোও pronoun।'],
          [['Please help me.', 'me = pronoun'], ['Call them now.', 'them = pronoun']],
          ['pro'],
          ['pronounFill', 'tap', 'is'],
        ),
        lesson('Pronoun review', 'Pronoun ঝালাই', ['Noun আর pronoun আলাদা করে চিনতে পারছ কি না দেখো।'], [['She reads a new book every week.', 'She = pronoun, book = noun']], ['pro'], ['tap', 'which', 'pronounFill']),
      ],
    },
    {
      title: 'Verb',
      titleBn: 'ক্রিয়া',
      lessons: [
        lesson(
          'Action verbs',
          'কাজ বোঝানো verb',
          ['Verb বলে কেউ কী করছে: run, eat, write, sing, sleep।', 'প্রশ্ন করো: "কী করে?" যে শব্দটা উত্তর দেয় সেটা verb।'],
          [['The boy runs.', 'runs = verb'], ['My mother cooks rice.', 'cooks = verb']],
          ['v'],
          ['is', 'tap', 'which'],
        ),
        lesson(
          'Being verbs: am, is, are',
          'অবস্থা বোঝানো verb',
          ['সব verb কাজ বোঝায় না। am, is, are, was, were কারো অবস্থা বোঝায়, এগুলোও verb।'],
          [['She is happy.', 'is = verb'], ['We were tired.', 'were = verb']],
          ['v'],
          ['tap', 'is', 'tap'],
        ),
        lesson(
          'Helping verbs',
          'সাহায্যকারী verb',
          ['কখনো দুটো verb একসাথে আসে: is playing, will go, can swim। দুটো শব্দই verb-এর অংশ।'],
          [['The children are playing.', 'are, playing = verb'], ['You can stay here.', 'can, stay = verb']],
          ['v'],
          ['tap', 'tap', 'which'],
        ),
        lesson(
          'Noun or verb?',
          'Noun নাকি verb?',
          ['নাম হলে noun, কাজ হলে verb। বাক্যে শব্দটা কী কাজ করছে সেটাই আসল।'],
          [['I read a book.', 'read = verb, book = noun']],
          ['v'],
          ['which', 'tap', 'which'],
        ),
        lesson('Verb review', 'Verb ঝালাই', ['Noun, pronoun আর verb একসাথে চর্চা করো।'], [['They live in a small village.', 'They = pronoun, live = verb, village = noun']], ['v'], ['tap', 'which', 'is']),
      ],
    },
    {
      title: 'Adjective',
      titleBn: 'বিশেষণ',
      lessons: [
        lesson(
          'What is an adjective?',
          'Adjective কী?',
          ['Adjective হলো এমন শব্দ, যা noun সম্পর্কে কিছু বলে: কেমন (good), কোন রঙের (red), কত বড় (big), কয়টা (five)।'],
          [['a red bus', 'red = adjective'], ['a tall boy', 'tall = adjective']],
          ['adj'],
          ['is', 'which', 'tap'],
        ),
        lesson(
          'Where adjectives go',
          'Adjective কোথায় বসে',
          ['Adjective সাধারণত noun-এর আগে বসে (a kind doctor), অথবা am/is/are-এর পরে (The tea is hot)।'],
          [['The kind doctor helped them.', 'kind = adjective'], ['The tea is very hot.', 'hot = adjective']],
          ['adj'],
          ['tap', 'tap', 'which'],
        ),
        lesson(
          'Adjective or noun?',
          'Adjective নাকি noun?',
          ['একই রকম শব্দের কোনোটা adjective, কোনোটা noun: honest (adjective) / honesty (noun), happy / happiness।'],
          [['He is honest.', 'honest = adjective'], ['Honesty is good.', 'Honesty = noun']],
          ['adj'],
          ['formFill', 'which', 'formFill'],
        ),
        lesson('Adjective review', 'Adjective ঝালাই', ['এ পর্যন্ত শেখা চারটা part of speech চিনে নাও।'], [['The clever fox ran across the road.', 'clever = adjective, fox = noun, ran = verb']], ['adj'], ['tap', 'which', 'formFill']),
      ],
    },
    {
      title: 'Adverb',
      titleBn: 'ক্রিয়া-বিশেষণ',
      lessons: [
        lesson(
          'What is an adverb?',
          'Adverb কী?',
          ['Adverb হলো এমন শব্দ, যা verb সম্পর্কে বলে: কাজটা কীভাবে হলো। অনেক adverb-এর শেষে -ly থাকে: slowly, quickly, carefully।'],
          [['She sings sweetly.', 'sweetly = adverb'], ['He drives carefully.', 'carefully = adverb']],
          ['adv'],
          ['is', 'tap', 'which'],
        ),
        lesson(
          'How, when, where',
          'কীভাবে, কখন, কোথায়',
          ['কখন বোঝায়: today, yesterday, soon। কোথায় বোঝায়: here, there। কতবার বোঝায়: always, never, often। এরাও adverb।', 'very, too-র মতো শব্দ adjective-কে আরও জোর দেয়, এরাও adverb।'],
          [['We went to Dhaka yesterday.', 'yesterday = adverb'], ['She is very happy.', 'very = adverb']],
          ['adv'],
          ['tap', 'which', 'tap'],
        ),
        lesson(
          'Adjective or adverb?',
          'Adjective নাকি adverb?',
          ['Noun-এর কথা বললে adjective (a slow tortoise), কাজের কথা বললে adverb (He walks slowly)।'],
          [['It is a sweet song.', 'sweet = adjective'], ['She sings sweetly.', 'sweetly = adverb']],
          ['adv'],
          ['formFill', 'formFill', 'which'],
        ),
        lesson('Adverb review', 'Adverb ঝালাই', ['পাঁচটা part of speech একসাথে চর্চা।'], [['The old farmer walks slowly to the market.', 'old = adjective, slowly = adverb']], ['adv'], ['tap', 'which', 'formFill']),
      ],
    },
    {
      title: 'Preposition',
      titleBn: 'পদান্বয়ী অব্যয়',
      lessons: [
        lesson(
          'What is a preposition?',
          'Preposition কী?',
          ['Preposition হলো এমন শব্দ, যা noun বা pronoun-এর আগে বসে জায়গা বা সম্পর্ক বোঝায়: in, on, under, behind, near।'],
          [['The cat sleeps under the table.', 'under = preposition'], ['The book is on the desk.', 'on = preposition']],
          ['prep'],
          ['is', 'tap', 'which'],
        ),
        lesson(
          'Time and movement',
          'সময় আর চলাচল',
          ['সময় বোঝায়: at, on, in, during, after। চলাচল বোঝায়: to, from, into, across, over।'],
          [['We went to Dhaka.', 'to = preposition'], ['The fox ran across the road.', 'across = preposition']],
          ['prep'],
          ['tap', 'which', 'tap'],
        ),
        lesson('Preposition review', 'Preposition ঝালাই', ['ছয়টা part of speech চিনে নাও।'], [['The river flows between two villages.', 'between = preposition']], ['prep'], ['tap', 'which', 'is']),
      ],
    },
    {
      title: 'Conjunction',
      titleBn: 'সংযোজক অব্যয়',
      lessons: [
        lesson(
          'What is a conjunction?',
          'Conjunction কী?',
          ['Conjunction দুটো শব্দ বা দুটো বাক্য জোড়া দেয়: and (এবং), but (কিন্তু), or (অথবা)।'],
          [['rice and fish', 'and = conjunction'], ['He is poor but honest.', 'but = conjunction']],
          ['conj'],
          ['is', 'conjFill', 'tap'],
        ),
        lesson(
          'Because, so, if, although',
          'কারণ, তাই, যদি, যদিও',
          ['because কারণ বলে, so ফল বলে, if শর্ত দেয়, although উল্টো কথা আনে। এরা সবাই conjunction।'],
          [['I stayed home because it was raining.', 'because = conjunction'], ['He was tired, so he slept early.', 'so = conjunction']],
          ['conj'],
          ['conjFill', 'conjFill', 'tap'],
        ),
        lesson('Conjunction review', 'Conjunction ঝালাই', ['সাতটা part of speech একসাথে।'], [['Although he is poor, he is honest.', 'Although = conjunction']], ['conj'], ['tap', 'which', 'conjFill']),
      ],
    },
    {
      title: 'Interjection',
      titleBn: 'আবেগসূচক অব্যয়',
      lessons: [
        lesson(
          'What is an interjection?',
          'Interjection কী?',
          ['Interjection হঠাৎ মনের ভাব প্রকাশ করে: Wow! (অবাক), Alas! (দুঃখ), Hurrah! (আনন্দ), Ouch! (ব্যথা)। এর পরে সাধারণত ! বসে।'],
          [['Wow! What a beautiful flower!', 'Wow = interjection'], ['Ouch! The tea is hot.', 'Ouch = interjection']],
          ['int'],
          ['is', 'tap', 'which'],
        ),
        lesson('All eight together', 'আটটা একসাথে', ['এবার আটটা part of speech-ই শেখা হলো। মনে রাখো: শব্দটা বাক্যে কী কাজ করছে, সেটাই বলে দেয় সে কোন part of speech।'], [['Hurrah! We won the match!', 'Hurrah = interjection, We = pronoun, won = verb, match = noun']], ALL, ['which', 'tap', 'which']),
      ],
    },
    {
      title: 'Same word, different job',
      titleBn: 'একই শব্দ, ভিন্ন কাজ',
      lessons: [
        lesson(
          'One word, two jobs',
          'এক শব্দ, দুই কাজ',
          ['একই শব্দ এক বাক্যে noun, আরেক বাক্যে verb হতে পারে: I take a walk (noun) / We walk to school (verb)।', 'তাই শব্দটা একা দেখে নয়, বাক্যে তার কাজ দেখে বিচার করো।'],
          [['I take a walk every morning.', 'walk = noun'], ['We walk to school.', 'walk = verb']],
          ALL,
          ['dual', 'dual', 'which'],
        ),
        lesson(
          'Fast, hard, early',
          'Fast, hard, early',
          ['fast, hard, early শব্দগুলো যখন noun-এর আগে বসে, তখন adjective (a fast runner); আর কাজের পরে বসলে adverb (He runs fast)।'],
          [['He is a fast runner.', 'fast = adjective'], ['He runs fast.', 'fast = adverb']],
          ALL,
          ['dual', 'dual', 'formFill'],
        ),
        lesson('Tricky words', 'কঠিন শব্দ', ['light, love, water, inside এর মতো শব্দ বাক্যভেদে আলাদা part of speech হয়।'], [['Please light the candle.', 'light = verb'], ['This bag is light.', 'light = adjective']], ALL, ['dual', 'tap', 'dual']),
      ],
    },
    {
      title: 'Final review',
      titleBn: 'শেষ ঝালাই',
      lessons: [
        lesson('Big review', 'বড় ঝালাই', ['সব কিছু একসাথে: শব্দ চেনা, বাক্যে খোঁজা, সঠিক রূপ বেছে নেওয়া।'], [['The kind doctor helped them quickly.', 'kind = adj, doctor = noun, helped = verb, them = pronoun, quickly = adverb']], ALL, ['which', 'tap', 'formFill', 'conjFill', 'dual', 'pronounFill'], 12),
        lesson('Final test', 'শেষ পরীক্ষা', ['১৫টা প্রশ্ন। সব ঠিক হলে Parts of Speech পুরোপুরি শেখা হয়ে গেল!'], [['Wow! The tall boy runs fast and wins.', 'প্রতিটা শব্দের কাজ চিনে নাও']], ALL, ['which', 'tap', 'dual', 'formFill', 'nounKind', 'conjFill'], 15),
      ],
    },
  ],
};
