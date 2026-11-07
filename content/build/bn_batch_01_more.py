# Adds lessons 3 (grammar) and 4 (conversation) to each unit of content/bn-batch-01.json, so every unit is
# complete (docs/SYLLABUS.md: words 1, words 2, grammar, conversation, then the unit test).
#   python content/build/bn_batch_01_more.py content/bn-batch-01.json
import json, sys

def v(en, bn, emoji=''): return {'en': en, 'bn': bn, 'emoji': emoji}
def s(en, bn, *alt): return {'en': en, 'bn': bn, 'alt': list(alt)}
def f(text, answer, options, bn, why): return {'text': text, 'answer': answer, 'options': options, 'bn': bn, 'why': why}
def g(text, answers, extra, bn, why): return {'text': text, 'answers': answers, 'extra': extra, 'bn': bn, 'why': why}
def gr(rule, correct, wrong, why): return {'rule': rule, 'correct': correct, 'wrong': wrong, 'why': why}
def d(who, lines, wrong): return {'with': who, 'lines': [{'who': w, 'en': e, 'bn': b} for w, e, b in lines], 'wrong': wrong}
def L(title, bn, vocab, sentences, fills, gaps=(), grammar=(), dialogs=()):
    return {'title': title, 'titleBn': bn, 'vocab': vocab, 'sentences': sentences, 'fills': fills, 'gaps': list(gaps), 'grammar': list(grammar), 'dialogs': list(dialogs)}

MORE = {
'My Home': [
  L('Is there…? Are there…?', 'আছে কি?', [v('sofa', 'সোফা', '🛋️'), v('garden', 'বাগান', '🌷'), v('stairs', 'সিঁড়ি', '🪜'), v('balcony', 'বারান্দা', '🏙️')],
    [s('Is there a garden?', 'বাগান আছে কি?'), s('Are there any chairs in the room?', 'ঘরে কি কোনো চেয়ার আছে?'), s('There isn\'t a balcony.', 'কোনো বারান্দা নেই।'), s('There aren\'t any pictures on the wall.', 'দেয়ালে কোনো ছবি নেই।'), s('Yes, there is a big sofa.', 'হ্যাঁ, একটা বড় সোফা আছে।')],
    [f('___ there a garden?', 'Is', ['Is', 'Are', 'Am'], 'বাগান আছে কি?', 'a garden একটা, তাই Is there।'), f('There ___ any pictures.', "aren't", ["aren't", "isn't", "not"], 'কোনো ছবি নেই।', "pictures একাধিক, না বোঝাতে aren't।")],
    [g('___ there a TV? No, there ___.', ['Is', "isn't"], ['Are', "aren't"], 'টিভি আছে কি? না, নেই।', "একটা জিনিস: Is there? উত্তরে isn't।")],
    [gr('প্রশ্নে is/are আগে আসে: Is there…? Are there…?', 'Are there two bedrooms?', ['There are two bedrooms?', 'Is there two bedrooms?'], 'two bedrooms একাধিক, প্রশ্নে Are there।')]),
  L('Looking for a room', 'ঘর ভাড়া খোঁজা', [v('rent', 'ভাড়া', '💵'), v('flat', 'ফ্ল্যাট', '🏢'), v('floor', 'তলা', '🔢'), v('near', 'কাছে', '📍')],
    [s('I am looking for a flat.', 'আমি একটা ফ্ল্যাট খুঁজছি।'), s('How much is the rent?', 'ভাড়া কত?'), s('It is on the third floor.', 'এটা তিনতলায়।'), s('Is it near the school?', 'এটা কি স্কুলের কাছে?'), s('Can I see the kitchen?', 'রান্নাঘরটা দেখতে পারি?')],
    [f('How much is the ___?', 'rent', ['rent', 'floor', 'near'], 'ভাড়া কত?', 'ভাড়া = rent।'), f('It is on the third ___.', 'floor', ['floor', 'rent', 'roof'], 'এটা তিনতলায়।', 'তলা = floor।')],
    dialogs=[d('Landlord', [('them', 'Hello. Are you looking for a flat?', 'হ্যালো। ফ্ল্যাট খুঁজছেন?'), ('you', 'Yes. How much is the rent?', 'হ্যাঁ। ভাড়া কত?'), ('them', 'Ten thousand taka a month.', 'মাসে দশ হাজার টাকা।'), ('you', 'Can I see the rooms, please?', 'ঘরগুলো একটু দেখতে পারি?')], ['I am a flat.', 'Yes, rent is me.'])]),
],
'Clothes & Shopping': [
  L('Bigger, smaller', 'বড়, ছোট মাপ', [v('long', 'লম্বা', '📏'), v('short', 'খাটো', '✂️'), v('tight', 'আঁটসাঁট', '🤏'), v('loose', 'ঢিলা', '👐')],
    [s('This shirt is too tight.', 'এই শার্টটা খুব আঁটসাঁট।'), s('These trousers are too long.', 'এই প্যান্টটা খুব লম্বা।'), s('Do you have a smaller one?', 'ছোট মাপের আছে?'), s('That dress is too short.', 'ওই জামাটা খুব খাটো।'), s('I want a looser one.', 'আমি একটু ঢিলা একটা চাই।')],
    [f('This shirt is ___ tight.', 'too', ['too', 'to', 'two'], 'এই শার্টটা খুব আঁটসাঁট।', 'বেশি বোঝাতে too।'), f('Do you have a smaller ___?', 'one', ['one', 'once', 'it'], 'ছোট মাপের আছে?', 'আগের জিনিসের বদলে one।')],
    [g('___ trousers are too long. Do you have shorter ___?', ['These', 'ones'], ['This', 'one'], 'এই প্যান্টটা খুব লম্বা। খাটো আছে?', 'trousers বহুবচন: these আর ones।')],
    [gr('বেশি বোঝাতে too + বিশেষণ।', 'The shoes are too big.', ['The shoes are to big.', 'The shoes too are big.'], 'too big = বেশি বড়।')]),
  L('Paying', 'টাকা দেওয়া', [v('cash', 'নগদ', '💵'), v('card', 'কার্ড', '💳'), v('receipt', 'রসিদ', '🧾'), v('discount', 'ছাড়', '🏷️')],
    [s('Can I pay in cash?', 'নগদে দিতে পারি?'), s('Is there a discount?', 'কোনো ছাড় আছে?'), s('Can I have a receipt, please?', 'একটা রসিদ দেবেন?'), s('I will take this one.', 'আমি এটা নেব।'), s('Can I change it later?', 'পরে কি বদলাতে পারব?')],
    [f('Can I pay ___ cash?', 'in', ['in', 'by', 'on'], 'নগদে দিতে পারি?', 'নগদে = in cash।'), f('Is there a ___?', 'discount', ['discount', 'receipt', 'card'], 'কোনো ছাড় আছে?', 'ছাড় = discount।')],
    dialogs=[d('Shopkeeper', [('them', 'That is eight hundred taka.', 'আটশো টাকা।'), ('you', 'Is there a discount?', 'কোনো ছাড় আছে?'), ('them', 'Okay, seven hundred.', 'ঠিক আছে, সাতশো।'), ('you', 'Good. I will take it.', 'ভালো। আমি নেব।')], ['Yes, I am discount.', 'Seven is a shirt.'])]),
],
'Free Time': [
  L('Do you like…?', 'তোমার কি ভালো লাগে?', [v('music', 'গান', '🎵'), v('film', 'সিনেমা', '🎬'), v('game', 'খেলা', '🎮'), v('weekend', 'ছুটির দিন', '🗓️')],
    [s('Do you like music?', 'তোমার কি গান ভালো লাগে?'), s('Yes, I do.', 'হ্যাঁ, লাগে।'), s('No, I don\'t like films.', 'না, আমার সিনেমা ভালো লাগে না।'), s('Does she like games?', 'তার কি খেলা ভালো লাগে?'), s('What do you do at the weekend?', 'ছুটির দিনে কী করো?')],
    [f('___ you like music?', 'Do', ['Do', 'Does', 'Are'], 'তোমার কি গান ভালো লাগে?', 'you-এর প্রশ্নে Do।'), f('___ she like games?', 'Does', ['Does', 'Do', 'Is'], 'তার কি খেলা ভালো লাগে?', 'she-এর প্রশ্নে Does।')],
    [g('___ he play football? Yes, he ___.', ['Does', 'does'], ['Do', 'do'], 'সে কি ফুটবল খেলে? হ্যাঁ, খেলে।', 'he-এর সাথে Does … does।')],
    [gr('Does-এর পরে কাজে -s হয় না।', 'Does she like music?', ['Does she likes music?', 'Do she like music?'], 'Does থাকলে like, likes নয়।')]),
  L('Making a plan to play', 'খেলার পরিকল্পনা', [v('match', 'ম্যাচ', '🏏'), v('team', 'দল', '👥'), v('win', 'জেতা', '🏆'), v('lose', 'হারা', '😞')],
    [s('Let\'s play a match on Friday.', 'চলো শুক্রবার একটা ম্যাচ খেলি।'), s('Which team do you like?', 'কোন দল তোমার পছন্দ?'), s('Our team won yesterday.', 'আমাদের দল গতকাল জিতেছে।'), s('We lost the game.', 'আমরা খেলাটা হেরে গেছি।'), s('Can I join your team?', 'আমি কি তোমাদের দলে খেলতে পারি?')],
    [f('Which ___ do you like?', 'team', ['team', 'win', 'match'], 'কোন দল তোমার পছন্দ?', 'দল = team।'), f('Can I ___ your team?', 'join', ['join', 'joins', 'joining'], 'আমি কি তোমাদের দলে খেলতে পারি?', 'can-এর পরে কাজটা যেমন আছে।')],
    dialogs=[d('Rafi', [('them', 'Do you want to play cricket?', 'ক্রিকেট খেলবে?'), ('you', 'Yes! Can I join your team?', 'হ্যাঁ! আমি কি তোমাদের দলে খেলতে পারি?')], ['Yes, I am cricket.', 'No, team is me.'])]),
],
'Jobs & Work': [
  L('Does he work…?', 'সে কি কাজ করে?', [v('doctor', 'ডাক্তার', '👨‍⚕️'), v('teacher', 'শিক্ষক', '👩‍🏫'), v('hospital', 'হাসপাতাল', '🏥'), v('shop', 'দোকান', '🏪')],
    [s('Does your father work in a hospital?', 'তোমার বাবা কি হাসপাতালে কাজ করেন?'), s('No, he doesn\'t.', 'না, করেন না।'), s('She doesn\'t work on Friday.', 'সে শুক্রবার কাজ করে না।'), s('Where does your sister work?', 'তোমার বোন কোথায় কাজ করে?'), s('She works in a shop.', 'সে একটা দোকানে কাজ করে।')],
    [f('She ___ work on Friday.', "doesn't", ["doesn't", "don't", "isn't"], 'সে শুক্রবার কাজ করে না।', "she-এর সাথে না বোঝাতে doesn't।"), f('Where ___ your sister work?', 'does', ['does', 'do', 'is'], 'তোমার বোন কোথায় কাজ করে?', 'your sister মানে she, তাই does।')],
    [g('My brother ___ in a bank. He ___ work on Friday.', ['works', "doesn't"], ['work', "don't"], 'আমার ভাই ব্যাংকে কাজ করে। সে শুক্রবার কাজ করে না।', "he-এর সাথে works, না বোঝাতে doesn't।")],
    [gr("doesn't-এর পরে কাজে -s হয় না।", "He doesn't work on Sunday.", ["He doesn't works on Sunday.", "He don't work on Sunday."], "doesn't + work।")]),
  L('A job interview', 'চাকরির ইন্টারভিউ', [v('experience', 'অভিজ্ঞতা', '📈'), v('skill', 'দক্ষতা', '🛠️'), v('apply', 'আবেদন করা', '📝'), v('hire', 'নিয়োগ দেওয়া', '🤝')],
    [s('Tell me about yourself.', 'আপনার সম্পর্কে বলুন।'), s('I have two years of experience.', 'আমার দুই বছরের অভিজ্ঞতা আছে।'), s('I can use a computer.', 'আমি কম্পিউটার চালাতে পারি।'), s('Why do you want this job?', 'আপনি এই চাকরিটা কেন চান?'), s('I want to learn and grow.', 'আমি শিখতে আর এগিয়ে যেতে চাই।')],
    [f('I have two years of ___.', 'experience', ['experience', 'skill', 'hire'], 'আমার দুই বছরের অভিজ্ঞতা আছে।', 'অভিজ্ঞতা = experience।'), f('Why do you ___ this job?', 'want', ['want', 'wants', 'wanting'], 'আপনি এই চাকরিটা কেন চান?', 'do-এর পরে কাজটা যেমন আছে।')],
    dialogs=[d('Manager', [('them', 'Why do you want this job?', 'আপনি এই চাকরিটা কেন চান?'), ('you', 'I like this work and I want to learn more.', 'এই কাজটা আমার ভালো লাগে আর আমি আরও শিখতে চাই।')], ['I am a job.', 'Yes, I want job you.'])]),
],
'In Town': [
  L('Where is it?', 'কোথায়?', [v('between', 'মাঝখানে', '↔️'), v('behind', 'পেছনে', '🔙'), v('in front of', 'সামনে', '🔜'), v('pharmacy', 'ফার্মেসি', '💊')],
    [s('The pharmacy is between the bank and the school.', 'ফার্মেসিটা ব্যাংক আর স্কুলের মাঝখানে।'), s('The park is behind the mosque.', 'পার্কটা মসজিদের পেছনে।'), s('Wait in front of the shop.', 'দোকানের সামনে অপেক্ষা করো।'), s('Is the bank far from here?', 'ব্যাংক কি এখান থেকে দূরে?'), s('It is near the bus stop.', 'এটা বাস স্ট্যান্ডের কাছে।')],
    [f('The park is ___ the mosque.', 'behind', ['behind', 'between', 'front'], 'পার্কটা মসজিদের পেছনে।', 'পেছনে = behind।'), f('Wait in front ___ the shop.', 'of', ['of', 'to', 'at'], 'দোকানের সামনে অপেক্ষা করো।', 'সামনে = in front of।')],
    [g('The shop is ___ the bank and the school, ___ the bus stop.', ['between', 'near'], ['behind', 'of'], 'দোকানটা ব্যাংক আর স্কুলের মাঝখানে, বাস স্ট্যান্ডের কাছে।', 'দুটোর মাঝখানে between, কাছে near।')],
    [gr('দুটো জিনিসের মাঝখানে between … and …।', 'The shop is between the bank and the park.', ['The shop is between the bank or the park.', 'The shop is between of the bank and the park.'], 'between-এর সাথে and বসে।')]),
  L('In a rickshaw or taxi', 'রিকশা বা ট্যাক্সিতে', [v('stop', 'থামা', '🛑'), v('fare', 'ভাড়া', '💵'), v('here', 'এখানে', '📍'), v('slowly', 'আস্তে', '🐢')],
    [s('Please stop here.', 'দয়া করে এখানে থামুন।'), s('How much is the fare?', 'ভাড়া কত?'), s('Please go slowly.', 'দয়া করে আস্তে চালান।'), s('Take me to the station.', 'আমাকে স্টেশনে নিয়ে চলুন।'), s('Keep the change.', 'বাকি টাকা রেখে দিন।')],
    [f('Please ___ here.', 'stop', ['stop', 'stops', 'stopping'], 'দয়া করে এখানে থামুন।', 'অনুরোধে কাজটা যেমন আছে।'), f('Take me ___ the station.', 'to', ['to', 'at', 'in'], 'আমাকে স্টেশনে নিয়ে চলুন।', 'কোথাও নিয়ে যেতে to।')],
    dialogs=[d('Driver', [('them', 'Where do you want to go?', 'কোথায় যাবেন?'), ('you', 'Take me to the station, please.', 'দয়া করে আমাকে স্টেশনে নিয়ে চলুন।'), ('them', 'Okay.', 'আচ্ছা।'), ('you', 'How much is the fare?', 'ভাড়া কত?')], ['I am the station.', 'Yes, fare is go.'])]),
],
'Last Weekend': [
  L('Went, saw, ate', 'গেলাম, দেখলাম, খেলাম', [v('went', 'গেলাম', '🚶'), v('saw', 'দেখলাম', '👀'), v('ate', 'খেলাম', '🍛'), v('bought', 'কিনলাম', '🛍️')],
    [s('I went to the market yesterday.', 'আমি গতকাল বাজারে গিয়েছিলাম।'), s('We saw a big ship.', 'আমরা একটা বড় জাহাজ দেখেছিলাম।'), s('She ate fish and rice.', 'সে মাছ-ভাত খেয়েছিল।'), s('He bought a new phone.', 'সে একটা নতুন ফোন কিনেছিল।'), s('They went home late.', 'তারা দেরিতে বাড়ি গিয়েছিল।')],
    [f('I ___ to the market yesterday.', 'went', ['went', 'go', 'goed'], 'আমি গতকাল বাজারে গিয়েছিলাম।', 'go-এর অতীত went, goed নয়।'), f('He ___ a new phone.', 'bought', ['bought', 'buyed', 'buy'], 'সে একটা নতুন ফোন কিনেছিল।', 'buy-এর অতীত bought।')],
    [g('Yesterday I ___ to Cox\'s Bazar and ___ the sea.', ['went', 'saw'], ['go', 'see'], 'গতকাল আমি কক্সবাজার গিয়ে সমুদ্র দেখেছিলাম।', 'অতীতে go → went, see → saw।')],
    [gr('কিছু কাজের অতীত -ed দিয়ে হয় না: go → went, eat → ate।', 'We ate biryani last night.', ['We eated biryani last night.', 'We eat biryani last night.'], 'eat-এর অতীত ate।')]),
  L('Did you…?', 'তুমি কি…?', [v('did', 'করেছিলে কি (প্রশ্ন)', '❓'), v('didn\'t', 'করিনি', '🚫'), v('fun', 'মজা', '🎉'), v('trip', 'ভ্রমণ', '🧳')],
    [s('Did you have fun?', 'তোমার কি মজা হয়েছিল?'), s('Yes, I did.', 'হ্যাঁ, হয়েছিল।'), s('I didn\'t go to school.', 'আমি স্কুলে যাইনি।'), s('Did she call you?', 'সে কি তোমাকে ফোন করেছিল?'), s('How was your trip?', 'তোমার ভ্রমণ কেমন ছিল?')],
    [f('___ you have fun?', 'Did', ['Did', 'Do', 'Was'], 'তোমার কি মজা হয়েছিল?', 'অতীতের প্রশ্নে Did।'), f("I didn't ___ to school.", 'go', ['go', 'went', 'goes'], 'আমি স্কুলে যাইনি।', "didn't-এর পরে কাজটা যেমন আছে: go।")],
    dialogs=[d('Mim', [('them', 'How was your weekend?', 'তোমার ছুটির দিন কেমন কাটল?'), ('you', 'It was great. I went to my village.', 'দারুণ। আমি গ্রামের বাড়ি গিয়েছিলাম।')], ['It is great. I go village.', 'Yes, I weekend.'])]),
],
'Health & Body': [
  L('Should and shouldn\'t', 'উচিত, উচিত নয়', [v('exercise', 'ব্যায়াম', '🏃'), v('sugar', 'চিনি', '🍬'), v('sleep', 'ঘুম', '😴'), v('fruit', 'ফল', '🍎')],
    [s('You should exercise every day.', 'তোমার প্রতিদিন ব্যায়াম করা উচিত।'), s('You shouldn\'t eat too much sugar.', 'বেশি চিনি খাওয়া উচিত নয়।'), s('Children should sleep early.', 'বাচ্চাদের তাড়াতাড়ি ঘুমানো উচিত।'), s('We should eat more fruit.', 'আমাদের আরও ফল খাওয়া উচিত।'), s('Should I take this medicine?', 'আমার কি এই ওষুধটা খাওয়া উচিত?')],
    [f("You ___ eat too much sugar.", "shouldn't", ["shouldn't", 'should', "don't should"], 'বেশি চিনি খাওয়া উচিত নয়।', "উচিত নয় = shouldn't।"), f('___ I take this medicine?', 'Should', ['Should', 'Do should', 'Am'], 'আমার কি এই ওষুধটা খাওয়া উচিত?', 'প্রশ্নে Should আগে আসে।')],
    [g('You ___ drink water and you ___ stay up late.', ['should', "shouldn't"], ['are', 'has'], 'তোমার পানি খাওয়া উচিত আর দেরি করে জেগে থাকা উচিত নয়।', "পরামর্শে should, না বোঝাতে shouldn't।")],
    [gr('প্রশ্নে should বাক্যের শুরুতে আসে।', 'Should I see a doctor?', ['I should see a doctor?', 'Do I should see a doctor?'], 'Should I …? দিয়ে প্রশ্ন।')]),
  L('At the pharmacy', 'ফার্মেসিতে', [v('tablet', 'বড়ি', '💊'), v('syrup', 'সিরাপ', '🧴'), v('prescription', 'প্রেসক্রিপশন', '📄'), v('pain', 'ব্যথা', '🤕')],
    [s('I need something for a headache.', 'মাথাব্যথার জন্য কিছু দরকার।'), s('Do you have a prescription?', 'আপনার কাছে প্রেসক্রিপশন আছে?'), s('Take one tablet after meals.', 'খাওয়ার পরে একটা বড়ি খাবেন।'), s('This syrup is for children.', 'এই সিরাপটা বাচ্চাদের জন্য।'), s('The pain is much better now.', 'ব্যথা এখন অনেক কম।')],
    [f('Take one tablet ___ meals.', 'after', ['after', 'at', 'on'], 'খাওয়ার পরে একটা বড়ি খাবেন।', 'পরে = after।'), f('I need something ___ a headache.', 'for', ['for', 'to', 'of'], 'মাথাব্যথার জন্য কিছু দরকার।', 'কিছুর জন্য = for।')],
    dialogs=[d('Pharmacist', [('them', 'Can I help you?', 'কীভাবে সাহায্য করতে পারি?'), ('you', 'I need something for a cough.', 'কাশির জন্য কিছু দরকার।'), ('them', 'Take this syrup twice a day.', 'এই সিরাপটা দিনে দুবার খাবেন।'), ('you', 'Thank you. How much is it?', 'ধন্যবাদ। দাম কত?')], ['I am a cough.', 'Yes, syrup is me.'])]),
],
'Plans': [
  L('Will or going to?', 'will না going to?', [v('decide', 'সিদ্ধান্ত নেওয়া', '🤔'), v('promise', 'কথা দেওয়া', '🤞'), v('probably', 'সম্ভবত', '🎲'), v('help', 'সাহায্য করা', '🤝')],
    [s('I am going to study medicine.', 'আমি ডাক্তারি পড়ব (ঠিক করা আছে)।'), s('I will help you.', 'আমি তোমাকে সাহায্য করব।'), s('It will probably rain tomorrow.', 'কাল সম্ভবত বৃষ্টি হবে।'), s('I promise I will call you.', 'কথা দিচ্ছি, তোমাকে ফোন করব।'), s('The phone is ringing. I will answer it.', 'ফোন বাজছে। আমি ধরছি।')],
    [f('I promise I ___ call you.', 'will', ['will', 'am going', 'going'], 'কথা দিচ্ছি, তোমাকে ফোন করব।', 'কথা দিতে will।'), f('It will ___ rain tomorrow.', 'probably', ['probably', 'promise', 'decide'], 'কাল সম্ভবত বৃষ্টি হবে।', 'সম্ভবত = probably।')],
    [g('Next year I ___ going to study, and I ___ work hard.', ['am', 'will'], ['is', 'are'], 'আগামী বছর আমি পড়াশোনা করব, আর খুব খাটব।', 'ঠিক করা পরিকল্পনা am going to, প্রতিজ্ঞায় will।')],
    [gr('আগে থেকে ঠিক করা কাজে going to, এখনই নেওয়া সিদ্ধান্তে will।', 'I am going to visit Sylhet next month.', ['I going to visit Sylhet next month.', 'I will going to visit Sylhet next month.'], 'আগে থেকে ঠিক করা: am going to।')]),
  L('Inviting', 'দাওয়াত দেওয়া', [v('invite', 'দাওয়াত দেওয়া', '💌'), v('party', 'অনুষ্ঠান', '🎉'), v('birthday', 'জন্মদিন', '🎂'), v('would like', 'চাই (ভদ্রভাবে)', '🙏')],
    [s('Would you like to come to my party?', 'তুমি কি আমার অনুষ্ঠানে আসতে চাও?'), s('It is my birthday on Friday.', 'শুক্রবার আমার জন্মদিন।'), s('I would love to come.', 'আমি অবশ্যই আসতে চাই।'), s('Sorry, I can\'t. I am busy.', 'দুঃখিত, পারব না। আমি ব্যস্ত।'), s('What time does it start?', 'কয়টায় শুরু?')],
    [f('Would you like ___ come?', 'to', ['to', 'for', 'at'], 'তুমি কি আসতে চাও?', 'would like-এর পরে to + কাজ।'), f('It is my birthday ___ Friday.', 'on', ['on', 'in', 'at'], 'শুক্রবার আমার জন্মদিন।', 'দিনের আগে on।')],
    dialogs=[d('Nila', [('them', 'Would you like to come to my birthday party?', 'আমার জন্মদিনের অনুষ্ঠানে আসবে?'), ('you', 'I would love to. What time does it start?', 'অবশ্যই। কয়টায় শুরু?')], ['I am a party.', 'Yes, birthday is time.'])]),
],
'Feelings & Opinions': [
  L('So and because', 'তাই আর কারণ', [v('so', 'তাই', '➡️'), v('but', 'কিন্তু', '↔️'), v('happy', 'খুশি', '😊'), v('nervous', 'ঘাবড়ানো', '😬')],
    [s('I was tired, so I went to bed.', 'আমি ক্লান্ত ছিলাম, তাই ঘুমাতে গেলাম।'), s('I am nervous because I have an exam.', 'আমি ঘাবড়ে আছি কারণ আমার পরীক্ষা আছে।'), s('She is happy but tired.', 'সে খুশি কিন্তু ক্লান্ত।'), s('It was raining, so we stayed home.', 'বৃষ্টি হচ্ছিল, তাই আমরা বাড়িতে ছিলাম।'), s('I like him because he is kind.', 'আমি তাকে পছন্দ করি কারণ সে দয়ালু।')],
    [f('I was tired, ___ I went to bed.', 'so', ['so', 'because', 'but'], 'আমি ক্লান্ত ছিলাম, তাই ঘুমাতে গেলাম।', 'ফল বোঝাতে so।'), f('She is happy ___ tired.', 'but', ['but', 'so', 'because'], 'সে খুশি কিন্তু ক্লান্ত।', 'উল্টো কথা জুড়তে but।')],
    [g('I studied hard, ___ I passed, ___ I was still nervous.', ['so', 'but'], ['because', 'or'], 'আমি খুব পড়েছিলাম, তাই পাস করলাম, কিন্তু তবু ঘাবড়ে ছিলাম।', 'ফল so, উল্টো কথা but।')],
    [gr('কারণ বলতে because, ফল বলতে so।', 'It was late, so I took a rickshaw.', ['It was late, because I took a rickshaw.'], 'দেরি হয়েছিল বলে রিকশা নিলাম: so।')]),
  L('Agreeing and disagreeing', 'একমত, ভিন্নমত', [v('agree', 'একমত', '👍'), v('disagree', 'ভিন্নমত', '👎'), v('maybe', 'হয়তো', '🤔'), v('right', 'ঠিক', '✅')],
    [s('I agree with you.', 'আমি তোমার সাথে একমত।'), s('I don\'t agree.', 'আমি একমত নই।'), s('You are right.', 'তুমি ঠিক বলেছ।'), s('Maybe you are right.', 'হয়তো তুমি ঠিক।'), s('In my opinion, English is useful.', 'আমার মতে, ইংরেজি কাজের।')],
    [f('I agree ___ you.', 'with', ['with', 'to', 'at'], 'আমি তোমার সাথে একমত।', 'কারো সাথে একমত: agree with।'), f('In my ___, English is useful.', 'opinion', ['opinion', 'agree', 'right'], 'আমার মতে, ইংরেজি কাজের।', 'আমার মতে = in my opinion।')],
    dialogs=[d('Friend', [('them', 'I think this film is boring.', 'আমার মনে হয় ছবিটা একঘেয়ে।'), ('you', 'I don\'t agree. I think it is interesting.', 'আমি একমত নই। আমার মনে হয় এটা আকর্ষণীয়।')], ['I am agree boring.', 'Yes, I film.'])]),
],
'Nature & Comparing': [
  L('More and most', 'আরও আর সবচেয়ে', [v('beautiful', 'সুন্দর', '🌸'), v('important', 'গুরুত্বপূর্ণ', '❗'), v('dangerous', 'বিপজ্জনক', '⚠️'), v('famous', 'বিখ্যাত', '⭐')],
    [s('Sylhet is more beautiful than Dhaka.', 'সিলেট ঢাকার চেয়ে বেশি সুন্দর।'), s('This is the most important lesson.', 'এটা সবচেয়ে গুরুত্বপূর্ণ লেসন।'), s('A tiger is more dangerous than a cat.', 'বাঘ বিড়ালের চেয়ে বেশি বিপজ্জনক।'), s('He is the most famous singer here.', 'সে এখানকার সবচেয়ে বিখ্যাত গায়ক।'), s('Health is more important than money.', 'টাকার চেয়ে স্বাস্থ্য বেশি গুরুত্বপূর্ণ।')],
    [f('Sylhet is ___ beautiful than Dhaka.', 'more', ['more', 'most', 'the'], 'সিলেট ঢাকার চেয়ে বেশি সুন্দর।', 'বড় শব্দের তুলনায় more … than।'), f('This is the ___ important lesson.', 'most', ['most', 'more', 'much'], 'এটা সবচেয়ে গুরুত্বপূর্ণ লেসন।', 'সবচেয়ে = the most।')],
    [g('A river is ___ than a pond, but the sea is the ___.', ['bigger', 'biggest'], ['big', 'more big'], 'নদী পুকুরের চেয়ে বড়, কিন্তু সমুদ্র সবচেয়ে বড়।', 'ছোট শব্দে -er আর -est।')],
    [gr('বড় শব্দে (beautiful, important) -er নয়, more/most বসে।', 'This flower is more beautiful.', ['This flower is beautifuller.', 'This flower is more beautifuller.'], 'beautiful-এর তুলনা more beautiful।')]),
  L('Our environment', 'আমাদের পরিবেশ', [v('pollution', 'দূষণ', '🏭'), v('plant', 'গাছ লাগানো', '🌱'), v('flood', 'বন্যা', '🌊'), v('clean', 'পরিষ্কার', '🧹')],
    [s('Pollution is a big problem in cities.', 'শহরে দূষণ একটা বড় সমস্যা।'), s('We should plant more trees.', 'আমাদের আরও গাছ লাগানো উচিত।'), s('There was a flood last year.', 'গত বছর বন্যা হয়েছিল।'), s('Keep your area clean.', 'তোমার এলাকা পরিষ্কার রাখো।'), s('Don\'t throw plastic in the river.', 'নদীতে প্লাস্টিক ফেলো না।')],
    [f('We should ___ more trees.', 'plant', ['plant', 'plants', 'planting'], 'আমাদের আরও গাছ লাগানো উচিত।', 'should-এর পরে কাজটা যেমন আছে।'), f("Don't ___ plastic in the river.", 'throw', ['throw', 'throws', 'threw'], 'নদীতে প্লাস্টিক ফেলো না।', "Don't-এর পরে কাজটা যেমন আছে।")],
    dialogs=[d('Teacher', [('them', 'What can we do for our environment?', 'পরিবেশের জন্য আমরা কী করতে পারি?'), ('you', 'We can plant trees and keep our area clean.', 'আমরা গাছ লাগাতে আর এলাকা পরিষ্কার রাখতে পারি।')], ['I am a tree.', 'Yes, environment is clean me.'])]),
],
}

data = json.load(open(sys.argv[1], encoding='utf8'))
for u in data['units']:
    if len(u['lessons']) < 4:
        u['lessons'] += MORE[u['title']]
json.dump(data, open(sys.argv[1], 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print([len(u['lessons']) for u in data['units']])
