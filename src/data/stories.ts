import type { Story } from '../types';

/** The built-in short stories (the server's copy replaces them once loaded, like the course). */
export const BUNDLED_STORIES: Story[] = [
  {
    id: 'rina-morning',
    title: "Rina's Morning",
    titleBn: 'রিনার সকাল',
    color: '#ff9500',
    lines: [
      { en: 'Rina wakes up at six o’clock.', bn: 'রিনা ছয়টায় ঘুম থেকে ওঠে।' },
      { en: 'She washes her face and brushes her teeth.', bn: 'সে মুখ ধোয় আর দাঁত ব্রাশ করে।' },
      { en: 'Her mother makes tea and bread.', bn: 'তার মা চা আর রুটি বানান।' },
      { who: 'Mother', en: 'Rina, your breakfast is ready!', bn: 'রিনা, তোমার নাশতা তৈরি!' },
      { who: 'Rina', en: 'Thank you, Ma. I am coming.', bn: 'ধন্যবাদ, মা। আমি আসছি।' },
      { en: 'After breakfast, Rina takes her bag.', bn: 'নাশতার পর রিনা তার ব্যাগ নেয়।' },
      { en: 'She walks to school with her friend Mina.', bn: 'সে তার বন্ধু মিনার সাথে হেঁটে স্কুলে যায়।' },
      { en: 'The school starts at eight o’clock.', bn: 'স্কুল আটটায় শুরু হয়।' },
    ],
    quiz: [
      { question: 'রিনা কয়টায় ঘুম থেকে ওঠে?', correct: 'At six o’clock', wrong: ['At eight o’clock', 'At seven o’clock'], why: '"Rina wakes up at six o’clock."' },
      { question: 'নাশতা কে বানান?', correct: 'Her mother', wrong: ['Rina', 'Mina'], why: '"Her mother makes tea and bread."' },
      { question: 'রিনা কার সাথে স্কুলে যায়?', correct: 'With Mina', wrong: ['With her mother', 'Alone'], why: '"She walks to school with her friend Mina."' },
    ],
  },
  {
    id: 'at-the-market',
    title: 'At the Market',
    titleBn: 'বাজারে',
    color: '#34c759',
    lines: [
      { en: 'Karim goes to the market on Friday.', bn: 'করিম শুক্রবার বাজারে যায়।' },
      { who: 'Karim', en: 'How much are the mangoes?', bn: 'আমগুলোর দাম কত?' },
      { who: 'Seller', en: 'They are one hundred taka a kilo.', bn: 'এক কেজি একশো টাকা।' },
      { who: 'Karim', en: 'That is too much. Ninety taka?', bn: 'এটা অনেক বেশি। নব্বই টাকা?' },
      { who: 'Seller', en: 'Okay, ninety taka for you.', bn: 'ঠিক আছে, আপনার জন্য নব্বই টাকা।' },
      { en: 'Karim buys two kilos of mangoes.', bn: 'করিম দুই কেজি আম কেনে।' },
      { en: 'He also buys some rice and fish.', bn: 'সে কিছু চাল আর মাছও কেনে।' },
      { en: 'He goes home happily.', bn: 'সে খুশি মনে বাড়ি ফেরে।' },
    ],
    quiz: [
      { question: 'করিম কবে বাজারে যায়?', correct: 'On Friday', wrong: ['On Monday', 'On Sunday'], why: '"Karim goes to the market on Friday."' },
      { question: 'শেষে এক কেজি আমের দাম কত হলো?', correct: 'Ninety taka', wrong: ['One hundred taka', 'Fifty taka'], why: 'বিক্রেতা বলল: "Okay, ninety taka for you."' },
      { question: 'করিম কত কেজি আম কিনল?', correct: 'Two kilos', wrong: ['One kilo', 'Three kilos'], why: '"Karim buys two kilos of mangoes."' },
    ],
  },
  {
    id: 'rainy-day',
    title: 'A Rainy Day',
    titleBn: 'বৃষ্টির দিন',
    color: '#007aff',
    lines: [
      { en: 'It is a rainy day in July.', bn: 'জুলাই মাসের এক বৃষ্টির দিন।' },
      { en: 'Rahim cannot play football outside.', bn: 'রহিম বাইরে ফুটবল খেলতে পারে না।' },
      { who: 'Rahim', en: 'Grandma, can you tell me a story?', bn: 'দাদু, আমাকে একটা গল্প বলবে?' },
      { who: 'Grandma', en: 'Of course! Sit next to me.', bn: 'অবশ্যই! আমার পাশে বসো।' },
      { en: 'Grandma tells a story about a clever fox.', bn: 'দাদি একটা চালাক শিয়ালের গল্প বলেন।' },
      { en: 'Rahim listens carefully and laughs.', bn: 'রহিম মন দিয়ে শোনে আর হাসে।' },
      { en: 'In the evening, the rain stops.', bn: 'সন্ধ্যায় বৃষ্টি থামে।' },
      { en: 'Rahim says, “Rainy days are fun too!”', bn: 'রহিম বলে, “বৃষ্টির দিনও মজার!”' },
    ],
    quiz: [
      { question: 'রহিম কেন বাইরে খেলতে পারে না?', correct: 'Because it is raining', wrong: ['Because he is sick', 'Because it is night'], why: '"It is a rainy day", তাই বাইরে খেলা যায় না।' },
      { question: 'দাদির গল্পটা কী নিয়ে?', correct: 'A clever fox', wrong: ['A big tiger', 'A little bird'], why: '"Grandma tells a story about a clever fox."' },
      { question: 'বৃষ্টি কখন থামে?', correct: 'In the evening', wrong: ['In the morning', 'At night'], why: '"In the evening, the rain stops."' },
    ],
  },
];

/** The stories the app shows: the server's copy once loaded, else the built-in ones. */
export let STORIES: Story[] = BUNDLED_STORIES;

export function setStories(stories: Story[]): void {
  STORIES = stories;
}
