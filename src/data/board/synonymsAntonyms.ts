import type { BoardTopic } from './types.ts';

/** Synonyms and antonyms: common SSC and HSC vocabulary. */
export const SYNONYMS_ANTONYMS: BoardTopic = {
  id: 'synonyms-antonyms',
  exam: ['ssc', 'hsc'],
  title: 'Synonyms and Antonyms',
  titleBn: 'সমার্থক ও বিপরীত শব্দ',
  tip: 'Synonym মানে একই অর্থ, antonym মানে উল্টো অর্থ; বাক্যে শব্দটি কোন অর্থে বসেছে দেখে উত্তর বাছো।',
  questions: [
    { question: 'abundant শব্দের synonym কোনটি? Fish is abundant in our rivers.', correct: 'plentiful', wrong: ['scarce', 'rare'], why: 'abundant মানে প্রচুর; plentiful-এর অর্থও প্রচুর।' },
    { question: 'scarce শব্দের antonym কোনটি? Pure water is scarce in some areas.', correct: 'abundant', wrong: ['rare', 'little'], why: 'scarce মানে দুষ্প্রাপ্য বা অল্প; এর বিপরীত abundant (প্রচুর)।' },
    { question: 'diligent শব্দের synonym কোনটি? Rina is a diligent student.', correct: 'hardworking', wrong: ['lazy', 'clever'], why: 'diligent মানে পরিশ্রমী; hardworking-এর অর্থও পরিশ্রমী।' },
    { question: 'diligent শব্দের antonym কোনটি? A diligent worker never wastes time.', correct: 'lazy', wrong: ['careful', 'honest'], why: 'diligent মানে পরিশ্রমী; এর বিপরীত lazy (অলস)।' },
    { question: 'obscure শব্দের synonym কোনটি? The meaning of the poem is obscure.', correct: 'unclear', wrong: ['famous', 'simple'], why: 'এখানে obscure মানে অস্পষ্ট; unclear-এর অর্থও অস্পষ্ট।' },
    { question: 'famous শব্দের antonym কোনটি? He is a famous writer.', correct: 'unknown', wrong: ['popular', 'great'], why: 'famous মানে বিখ্যাত; এর বিপরীত unknown (অখ্যাত)।' },
    { question: 'ancient শব্দের antonym কোনটি? Mahasthangarh is an ancient city.', correct: 'modern', wrong: ['old', 'historic'], why: 'ancient মানে প্রাচীন; এর বিপরীত modern (আধুনিক)।' },
    { question: 'brave শব্দের synonym কোনটি? The brave soldiers fought for the country.', correct: 'courageous', wrong: ['cowardly', 'weak'], why: 'brave মানে সাহসী; courageous-এর অর্থও সাহসী।' },
    { question: 'humble শব্দের antonym কোনটি? He is humble in his behaviour.', correct: 'proud', wrong: ['polite', 'simple'], why: 'humble মানে বিনয়ী; এর বিপরীত proud (অহংকারী)।' },
    { question: 'vast শব্দের synonym কোনটি? The Bay of Bengal is a vast sea.', correct: 'huge', wrong: ['tiny', 'narrow'], why: 'vast মানে বিশাল; huge-এর অর্থও বিশাল।' },
    { question: 'prosperity শব্দের antonym কোনটি? Education brings prosperity to a nation.', correct: 'poverty', wrong: ['wealth', 'progress'], why: 'prosperity মানে সমৃদ্ধি; এর বিপরীত poverty (দারিদ্র্য)।' },
    { question: 'eager শব্দের synonym কোনটি? The students are eager to learn.', correct: 'keen', wrong: ['unwilling', 'tired'], why: 'eager মানে আগ্রহী; keen-এর অর্থও আগ্রহী।' },
    { question: 'victory শব্দের antonym কোনটি? Our victory came in 1971.', correct: 'defeat', wrong: ['success', 'triumph'], why: 'victory মানে বিজয়; এর বিপরীত defeat (পরাজয়)।' },
    { question: 'rapid শব্দের synonym কোনটি? The country is making rapid progress.', correct: 'fast', wrong: ['slow', 'steady'], why: 'rapid মানে দ্রুত; fast-এর অর্থও দ্রুত।' },
    { question: 'generous শব্দের antonym কোনটি? Haji Muhammad Mohsin was a generous man.', correct: 'stingy', wrong: ['kind', 'rich'], why: 'generous মানে উদার; এর বিপরীত stingy (কৃপণ)।' },
    { question: 'hostile শব্দের antonym কোনটি? The villagers were hostile to the strangers.', correct: 'friendly', wrong: ['angry', 'cruel'], why: 'hostile মানে শত্রুভাবাপন্ন; এর বিপরীত friendly (বন্ধুভাবাপন্ন)।' },
    { question: 'neglect শব্দের synonym কোনটি? Do not neglect your health.', correct: 'ignore', wrong: ['notice', 'protect'], why: 'neglect মানে অবহেলা করা; ignore-এর অর্থও উপেক্ষা বা অবহেলা করা।' },
    { question: 'expand শব্দের antonym কোনটি? Metals expand when heated.', correct: 'contract', wrong: ['increase', 'extend'], why: 'expand মানে প্রসারিত হওয়া; এর বিপরীত contract (সংকুচিত হওয়া)।' },
  ],
};
