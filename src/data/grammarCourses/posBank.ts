import type { Pos } from './types.ts';

/** Each part of speech: its name, Bangla name and a one-line hint used in explanations. */
export const POS_INFO: Record<Pos, { en: string; bn: string; hint: string }> = {
  n: { en: 'Noun', bn: 'বিশেষ্য', hint: 'কোনো মানুষ, জায়গা, জিনিস বা ভাবের নাম' },
  pro: { en: 'Pronoun', bn: 'সর্বনাম', hint: 'নামের বদলে বসে' },
  v: { en: 'Verb', bn: 'ক্রিয়া', hint: 'কাজ বা অবস্থা বোঝায়' },
  adj: { en: 'Adjective', bn: 'বিশেষণ', hint: 'noun-এর গুণ, রং, আকার বা অবস্থা বোঝায়' },
  adv: { en: 'Adverb', bn: 'ক্রিয়া-বিশেষণ', hint: 'কাজটা কীভাবে, কখন, কোথায় বা কতটা হলো তা বোঝায়' },
  prep: { en: 'Preposition', bn: 'পদান্বয়ী অব্যয়', hint: 'noun-এর আগে বসে জায়গা, সময় বা সম্পর্ক বোঝায়' },
  conj: { en: 'Conjunction', bn: 'সংযোজক অব্যয়', hint: 'শব্দ বা বাক্য জোড়া দেয়' },
  int: { en: 'Interjection', bn: 'আবেগসূচক অব্যয়', hint: 'হঠাৎ আনন্দ, দুঃখ বা অবাক হওয়া প্রকাশ করে' },
};

/** Words that are (almost) always one part of speech, with their meaning. */
export const WORDS: [word: string, pos: Pos, bn: string][] = [
  // Nouns: people, places, things, ideas.
  ['boy', 'n', 'ছেলে'], ['girl', 'n', 'মেয়ে'], ['teacher', 'n', 'শিক্ষক'], ['mother', 'n', 'মা'], ['farmer', 'n', 'কৃষক'],
  ['doctor', 'n', 'ডাক্তার'], ['friend', 'n', 'বন্ধু'], ['Rahim', 'n', 'রহিম'], ['Rina', 'n', 'রিনা'], ['Dhaka', 'n', 'ঢাকা'],
  ['school', 'n', 'স্কুল'], ['village', 'n', 'গ্রাম'], ['river', 'n', 'নদী'], ['market', 'n', 'বাজার'], ['Bangladesh', 'n', 'বাংলাদেশ'],
  ['book', 'n', 'বই'], ['pen', 'n', 'কলম'], ['table', 'n', 'টেবিল'], ['mango', 'n', 'আম'], ['rice', 'n', 'ভাত'],
  ['tree', 'n', 'গাছ'], ['cat', 'n', 'বিড়াল'], ['water', 'n', 'পানি'], ['sun', 'n', 'সূর্য'], ['happiness', 'n', 'সুখ'],
  ['honesty', 'n', 'সততা'], ['love', 'n', 'ভালোবাসা'], ['freedom', 'n', 'স্বাধীনতা'],
  // Pronouns.
  ['I', 'pro', 'আমি'], ['you', 'pro', 'তুমি'], ['he', 'pro', 'সে (ছেলে)'], ['she', 'pro', 'সে (মেয়ে)'], ['it', 'pro', 'এটা'],
  ['we', 'pro', 'আমরা'], ['they', 'pro', 'তারা'], ['me', 'pro', 'আমাকে'], ['him', 'pro', 'তাকে (ছেলে)'], ['us', 'pro', 'আমাদের'],
  ['them', 'pro', 'তাদের'], ['myself', 'pro', 'আমি নিজে'], ['someone', 'pro', 'কেউ'], ['everyone', 'pro', 'সবাই'],
  // Verbs.
  ['run', 'v', 'দৌড়ানো'], ['eat', 'v', 'খাওয়া'], ['go', 'v', 'যাওয়া'], ['write', 'v', 'লেখা'], ['read', 'v', 'পড়া'],
  ['sing', 'v', 'গান গাওয়া'], ['sleep', 'v', 'ঘুমানো'], ['swim', 'v', 'সাঁতার কাটা'], ['cook', 'v', 'রান্না করা'], ['speak', 'v', 'কথা বলা'],
  ['think', 'v', 'চিন্তা করা'], ['jump', 'v', 'লাফানো'], ['laugh', 'v', 'হাসা'], ['build', 'v', 'বানানো'], ['is', 'v', 'হয় / আছে'],
  ['are', 'v', 'হয় / আছে'], ['was', 'v', 'ছিল'], ['become', 'v', 'হওয়া'], ['buy', 'v', 'কেনা'], ['open', 'v', 'খোলা'],
  // Adjectives.
  ['big', 'adj', 'বড়'], ['small', 'adj', 'ছোট'], ['beautiful', 'adj', 'সুন্দর'], ['happy', 'adj', 'খুশি'], ['red', 'adj', 'লাল'],
  ['tall', 'adj', 'লম্বা'], ['kind', 'adj', 'দয়ালু'], ['hot', 'adj', 'গরম'], ['cold', 'adj', 'ঠান্ডা'], ['good', 'adj', 'ভালো'],
  ['new', 'adj', 'নতুন'], ['old', 'adj', 'পুরোনো'], ['clever', 'adj', 'চালাক'], ['sweet', 'adj', 'মিষ্টি'], ['heavy', 'adj', 'ভারী'],
  ['honest', 'adj', 'সৎ'], ['green', 'adj', 'সবুজ'], ['five', 'adj', 'পাঁচটি'],
  // Adverbs.
  ['quickly', 'adv', 'দ্রুত'], ['slowly', 'adv', 'ধীরে'], ['carefully', 'adv', 'সাবধানে'], ['loudly', 'adv', 'জোরে'], ['happily', 'adv', 'আনন্দে'],
  ['well', 'adv', 'ভালোভাবে'], ['very', 'adv', 'খুব'], ['always', 'adv', 'সবসময়'], ['never', 'adv', 'কখনো না'], ['often', 'adv', 'প্রায়ই'],
  ['today', 'adv', 'আজ'], ['yesterday', 'adv', 'গতকাল'], ['here', 'adv', 'এখানে'], ['there', 'adv', 'সেখানে'], ['soon', 'adv', 'শীঘ্রই'],
  ['sweetly', 'adv', 'মিষ্টি করে'], ['badly', 'adv', 'খারাপভাবে'],
  // Prepositions.
  ['in', 'prep', 'ভেতরে'], ['on', 'prep', 'উপরে'], ['at', 'prep', '-তে'], ['under', 'prep', 'নিচে'], ['over', 'prep', 'উপর দিয়ে'],
  ['between', 'prep', 'মাঝে'], ['behind', 'prep', 'পেছনে'], ['from', 'prep', 'থেকে'], ['to', 'prep', 'দিকে / -কে'], ['with', 'prep', 'সাথে'],
  ['into', 'prep', 'ভেতরে (ঢুকে)'], ['near', 'prep', 'কাছে'], ['during', 'prep', 'চলাকালীন'], ['across', 'prep', 'পার হয়ে'],
  // Conjunctions.
  ['and', 'conj', 'এবং'], ['but', 'conj', 'কিন্তু'], ['or', 'conj', 'অথবা'], ['because', 'conj', 'কারণ'], ['so', 'conj', 'তাই'],
  ['although', 'conj', 'যদিও'], ['if', 'conj', 'যদি'], ['unless', 'conj', 'যদি না'], ['while', 'conj', 'যখন'], ['when', 'conj', 'যখন'],
  // Interjections.
  ['Oh', 'int', 'ওহ'], ['Wow', 'int', 'বাহ'], ['Alas', 'int', 'হায়'], ['Hurrah', 'int', 'হুররে'], ['Ouch', 'int', 'উফ (ব্যথায়)'],
  ['Oops', 'int', 'ইশ (ভুলে)'], ['Bravo', 'int', 'সাবাশ'], ['Ah', 'int', 'আহ'],
];

/**
 * Sentences with each word's part of speech after a slash: "The cat/n sleeps/v ."
 * Untagged words (the, a, my…) are never asked about.
 */
export const SENTENCES: string[] = [
  'Rahim/n plays/v football/n every day/n .',
  'The cat/n sleeps/v under/prep the table/n .',
  'She/pro is/v very/adv happy/adj today/adv .',
  'Wow/int ! What a beautiful/adj flower/n !',
  'I/pro like/v tea/n but/conj my brother/n likes/v coffee/n .',
  'The old/adj farmer/n walks/v slowly/adv to/prep the market/n .',
  'They/pro live/v in/prep a small/adj village/n .',
  'Rina/n sings/v sweetly/adv .',
  'We/pro went/v to/prep Dhaka/n yesterday/adv .',
  'The sun/n rises/v in/prep the east/n .',
  'Alas/int ! He/pro lost/v his money/n .',
  'My mother/n cooks/v rice/n and/conj fish/n .',
  'The tall/adj boy/n runs/v fast/adv .',
  'He/pro was/v tired/adj , so/conj he/pro slept/v early/adv .',
  'The book/n is/v on/prep the desk/n .',
  'Hurrah/int ! We/pro won/v the match/n !',
  'You/pro can/v stay/v here/adv or/conj go/v home/adv .',
  'The teacher/n speaks/v loudly/adv in/prep class/n .',
  'Honesty/n is/v the best/adj policy/n .',
  'Ouch/int ! The tea/n is/v very/adv hot/adj .',
  'She/pro reads/v a new/adj book/n every week/n .',
  'The children/n are/v playing/v in/prep the field/n .',
  'I/pro stayed/v home/adv because/conj it/pro was/v raining/v .',
  'The red/adj bus/n stopped/v near/prep our school/n .',
  'He/pro always/adv helps/v me/pro .',
  'The river/n flows/v between/prep two villages/n .',
  'Oh/int , I/pro forgot/v my pen/n .',
  'Although/conj he/pro is/v poor/adj , he/pro is/v honest/adj .',
  'The kind/adj doctor/n helped/v them/pro quickly/adv .',
  'Birds/n fly/v over/prep the green/adj fields/n .',
  'We/pro will/v meet/v after/prep lunch/n .',
  'The heavy/adj box/n fell/v from/prep the shelf/n .',
  'She/pro speaks/v English/n well/adv .',
  'Bravo/int ! You/pro did/v it/pro perfectly/adv .',
  'My friend/n and/conj I/pro walk/v to/prep school/n together/adv .',
  'The baby/n laughed/v happily/adv .',
  'Put/v the pen/n into/prep the box/n .',
  'They/pro never/adv eat/v meat/n .',
  'If/conj it/pro rains/v , we/pro will/v stay/v inside/adv .',
  'The clever/adj fox/n ran/v across/prep the road/n .',
  'Oops/int ! I/pro dropped/v the cup/n .',
  'Freedom/n is/v very/adv precious/adj .',
  'Everyone/pro loves/v sweet/adj mangoes/n .',
  'He/pro opened/v the door/n carefully/adv .',
  'The students/n listened/v while/conj the teacher/n spoke/v .',
];

/** For "proper or common noun?": proper nouns name one particular person, place or thing. */
export const NOUN_KINDS: [word: string, proper: boolean][] = [
  ['Dhaka', true], ['city', false], ['Rahim', true], ['boy', false], ['Padma', true], ['river', false],
  ['Monday', true], ['day', false], ['Bangladesh', true], ['country', false], ['Sundarbans', true], ['forest', false],
  ['Eid', true], ['festival', false], ['December', true], ['month', false], ['Rina', true], ['girl', false],
  ['Cox’s Bazar', true], ['beach', false], ['Shaheed Minar', true], ['building', false],
];

/** For "which pronoun fits?": sentence with ___, the right pronoun, wrong ones. */
export const PRONOUN_FILLS: [sentence: string, answer: string, wrong: string[]][] = [
  ['Rina is kind. ___ helps everyone.', 'She', ['He', 'They']],
  ['Rahim is my friend. ___ lives in Sylhet.', 'He', ['She', 'It']],
  ['My parents work hard. ___ are teachers.', 'They', ['He', 'We']],
  ['This is my bag. ___ is new.', 'It', ['He', 'They']],
  ['Karim and I are friends. ___ play together.', 'We', ['They', 'He']],
  ['I love my sister. I help ___ every day.', 'her', ['she', 'they']],
  ['The boys are late. Call ___ now.', 'them', ['they', 'we']],
  ['Can you help ___? I am lost.', 'me', ['I', 'my']],
  ['My father is busy. Please don’t disturb ___.', 'him', ['he', 'his']],
  ['The book is on the table. Give ___ to me.', 'it', ['they', 'him']],
];

/** For "which form fits?": the right word, its part of speech, and look-alike wrong forms. */
export const FORM_FILLS: [sentence: string, answer: string, pos: Pos, wrong: string[]][] = [
  ['She sings ___ .', 'sweetly', 'adv', ['sweet', 'sweetness']],
  ['It is a ___ song.', 'sweet', 'adj', ['sweetly', 'sweetness']],
  ['He drives ___ .', 'carefully', 'adv', ['careful', 'care']],
  ['Be ___ on the road.', 'careful', 'adj', ['carefully', 'care']],
  ['The children played ___ .', 'happily', 'adv', ['happy', 'happiness']],
  ['They are ___ today.', 'happy', 'adj', ['happily', 'happiness']],
  ['Money cannot buy ___ .', 'happiness', 'n', ['happy', 'happily']],
  ['He is an ___ man.', 'honest', 'adj', ['honestly', 'honesty']],
  ['___ is the best policy.', 'Honesty', 'n', ['Honest', 'Honestly']],
  ['Please speak ___ .', 'slowly', 'adv', ['slow', 'slowness']],
  ['The tortoise is ___ .', 'slow', 'adj', ['slowly', 'slowness']],
  ['She is a ___ girl.', 'beautiful', 'adj', ['beautifully', 'beauty']],
  ['She dances ___ .', 'beautifully', 'adv', ['beautiful', 'beauty']],
  ['The ___ of the Sundarbans is famous.', 'beauty', 'n', ['beautiful', 'beautifully']],
  ['He answered ___ .', 'correctly', 'adv', ['correct', 'correction']],
  ['Your answer is ___ .', 'correct', 'adj', ['correctly', 'correction']],
  ['We need your ___ .', 'help', 'n', ['helpful', 'helpfully']],
  ['She is very ___ .', 'helpful', 'adj', ['help', 'helpfully']],
];

/** For "which conjunction fits?". */
export const CONJ_FILLS: [sentence: string, answer: string, wrong: string[]][] = [
  ['I like tea ___ coffee.', 'and', ['but', 'because']],
  ['He is poor ___ honest.', 'but', ['and', 'so']],
  ['Do you want rice ___ bread?', 'or', ['but', 'because']],
  ['She stayed home ___ she was ill.', 'because', ['but', 'or']],
  ['It was raining, ___ we stayed inside.', 'so', ['because', 'or']],
  ['___ he is rich, he is not happy.', 'Although', ['Because', 'So']],
  ['You will pass ___ you study hard.', 'if', ['but', 'or']],
  ['You will fail ___ you study.', 'unless', ['because', 'and']],
  ['I read a book ___ I was waiting.', 'while', ['so', 'but']],
  ['Call me ___ you reach home.', 'when', ['but', 'or']],
];

/** The same word doing different jobs: sentence, the word, and its part of speech here. */
export const DUALS: [sentence: string, word: string, pos: Pos][] = [
  ['I take a walk every morning.', 'walk', 'n'],
  ['We walk to school.', 'walk', 'v'],
  ['He is a fast runner.', 'fast', 'adj'],
  ['He runs fast.', 'fast', 'adv'],
  ['Turn on the light.', 'light', 'n'],
  ['This bag is light.', 'light', 'adj'],
  ['Please light the candle.', 'light', 'v'],
  ['She works hard.', 'hard', 'adv'],
  ['This is a hard question.', 'hard', 'adj'],
  ['They play cricket.', 'play', 'v'],
  ['We watched a play at school.', 'play', 'n'],
  ['I love my country.', 'love', 'v'],
  ['A mother’s love is pure.', 'love', 'n'],
  ['Come early tomorrow.', 'early', 'adv'],
  ['I took an early bus.', 'early', 'adj'],
  ['Water the plants.', 'Water', 'v'],
  ['Drink clean water.', 'water', 'n'],
  ['He went inside.', 'inside', 'adv'],
  ['The cat is inside the box.', 'inside', 'prep'],
  ['I have a dream.', 'dream', 'n'],
  ['I dream of a better world.', 'dream', 'v'],
];

const TAG = /^(.*)\/(n|pro|v|adj|adv|prep|conj|int)$/;

/** A tagged sentence as words, each with its part of speech (or null for untagged words and punctuation). */
export function parseSentence(tagged: string): { word: string; pos: Pos | null }[] {
  return tagged.split(' ').map((token) => {
    const m = token.match(TAG);
    return m ? { word: m[1], pos: m[2] as Pos } : { word: token, pos: null };
  });
}
