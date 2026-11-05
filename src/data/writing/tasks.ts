import type { WritingTask } from './types.ts';

/** The built-in writing tasks: the app's fallback, and what the server's database is seeded with. */
export const BUNDLED_WRITING: WritingTask[] = [
  {
    id: 'my-school',
    kind: 'paragraph',
    levels: ['primary', 'secondary'],
    title: 'My School',
    titleBn: 'আমার স্কুল',
    prompt: 'Write a paragraph about your school. Say its name and where it is, what it looks like, your teachers, and why you like it.',
    hints: ['স্কুলের নাম আর কোথায়', 'স্কুলটা দেখতে কেমন (বিল্ডিং, মাঠ)', 'শিক্ষকেরা কেমন', 'কেন স্কুলটা ভালো লাগে'],
    phrases: ['is situated', 'a two-storied building', 'playground', 'library', 'Our teachers are', 'I am proud of'],
    model: `The name of my school is Rupnagar Government Primary School. It is situated in a quiet village beside a small river. It is a two-storied building with ten classrooms, a library and a big playground in front of it.

There are about five hundred students and fifteen teachers in our school. Our teachers are kind and helpful. They teach us with care and help us when we do not understand something.

We play football and cricket in the playground after classes. Every year our school holds a sports day and a cultural programme. I love my school very much, and I am proud of it.`,
    minWords: 80,
  },
  {
    id: 'leave-application',
    kind: 'application',
    levels: ['secondary'],
    title: 'Application for leave',
    titleBn: 'ছুটির জন্য দরখাস্ত',
    prompt: 'Write an application to your headmaster for three days’ leave because you were ill.',
    hints: ['তারিখ আর প্রাপক (The Headmaster, স্কুলের নাম)', 'Subject লাইন', 'কেন ছুটি দরকার আর কত দিন', 'অনুরোধের বাক্য (I pray that…)', 'শেষে নাম, শ্রেণি, রোল'],
    phrases: ['The Headmaster', 'Subject:', 'Sir,', 'With due respect', 'I could not attend', 'I pray that', 'Yours obediently'],
    model: `12 March 2026
The Headmaster
Shaheen High School, Dhaka

Subject: Application for three days’ leave

Sir,
With due respect, I beg to state that I am a student of Class Eight of your school. I had a high fever from 9 March to 11 March, so I could not attend school on those days. The doctor told me to take complete rest.

I, therefore, pray that you would be kind enough to grant me leave for these three days.

Yours obediently,
Nusrat Jahan
Class: Eight, Section: A, Roll: 12`,
    minWords: 60,
  },
  {
    id: 'letter-to-friend',
    kind: 'letter',
    levels: ['secondary', 'higher'],
    title: 'Letter to a friend about your vacation',
    titleBn: 'ছুটি কেমন কাটলো জানিয়ে বন্ধুকে চিঠি',
    prompt: 'Write a letter to your friend telling them how you spent your last winter vacation.',
    hints: ['ঠিকানা আর তারিখ', 'সম্বোধন (Dear …)', 'কোথায় গিয়েছিলে, কী করেছ', 'কী সবচেয়ে ভালো লেগেছে', 'বন্ধুর খোঁজ নেওয়া আর বিদায়'],
    phrases: ['Dear', 'I hope you are well', 'I spent', 'It was a great experience', 'I will never forget', 'Write to me soon', 'Your friend'],
    model: `Mirpur, Dhaka
20 January 2026

Dear Rafi,
I hope you are well. I am fine too. Today I want to tell you how I spent my last winter vacation.

I spent ten days at my grandparents’ house in Sylhet. Every morning I walked through the tea gardens with my cousins. We had fresh date juice and hot pitha for breakfast. One day we went to Ratargul Swamp Forest by boat. It was a great experience, and I will never forget it.

How was your vacation? Please give my regards to your parents. Write to me soon.

Your friend,
Tanvir`,
    minWords: 100,
  },
  {
    id: 'traffic-jam',
    kind: 'paragraph',
    levels: ['secondary', 'higher'],
    title: 'Traffic Jam',
    titleBn: 'যানজট',
    prompt: 'Write a paragraph on “Traffic Jam” answering: What is it? What are its causes? What problems does it create? How can it be solved?',
    hints: ['যানজট কী', 'কারণ: বেশি গাড়ি, সরু রাস্তা, আইন না মানা', 'ফল: সময় নষ্ট, দূষণ, রোগী আর শিক্ষার্থীদের কষ্ট', 'সমাধান: বড় রাস্তা, মেট্রোরেল, আইন মানা'],
    phrases: ['a common problem', 'is caused by', 'As a result', 'waste of time', 'traffic rules', 'should be taken', 'In conclusion'],
    model: `Traffic jam is a long line of vehicles that cannot move or move very slowly. It is a common problem in big cities like Dhaka and Chattogram.

It is caused by many things. The number of vehicles is much higher than the roads can carry. Many roads are narrow, and some are blocked by shops and parked cars. Drivers and walkers often do not follow traffic rules.

As a result, people waste hours on the road every day. Students and office workers cannot reach on time, and patients in ambulances suffer the most. Waiting vehicles also burn more fuel and pollute the air.

Steps should be taken at once. Roads should be widened, and more flyovers and metro rail lines should be built. Everyone should follow traffic rules. In conclusion, the government and the people must work together to solve this problem.`,
    minWords: 150,
  },
  {
    id: 'job-email',
    kind: 'email',
    levels: ['higher', 'university', 'other'],
    title: 'Email applying for a part-time job',
    titleBn: 'পার্ট-টাইম চাকরির জন্য ইমেইল',
    prompt: 'You saw an advertisement for a part-time customer service job at a mobile phone shop. Write an email to the manager applying for it.',
    hints: ['স্পষ্ট Subject', 'কোথায় বিজ্ঞাপন দেখেছ', 'নিজের পরিচয় আর অভিজ্ঞতা', 'কখন কাজ করতে পারবে', 'ভদ্রভাবে শেষ করা, CV সংযুক্ত'],
    phrases: ['Dear Sir/Madam', 'I am writing to apply for', 'I saw your advertisement', 'I am available', 'I have attached my CV', 'I look forward to hearing from you', 'Best regards'],
    model: `Subject: Application for the part-time customer service job

Dear Sir/Madam,

I am writing to apply for the part-time customer service job at your shop. I saw your advertisement on Facebook yesterday.

I am a second-year student at Dhaka College. Last year I worked for six months at a bookshop, where I helped customers find what they needed and handled payments. I am friendly, honest and good with phones and computers. I can speak both Bangla and English well.

I am available every afternoon from 3 pm and all day on Fridays. I have attached my CV with this email.

Thank you for your time. I look forward to hearing from you.

Best regards,
Sadia Rahman
01700-000000`,
    minWords: 90,
  },
];
