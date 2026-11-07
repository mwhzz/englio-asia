# Builds content/bn-batch-01.json: units 12-21 (A1+ to A2) for Bangla speakers, lessons 1-2 of each unit
# (bn_batch_01_more.py adds lessons 3-4).  python content/build/bn_batch_01.py content/bn-batch-01.json && python content/build/bn_batch_01_more.py content/bn-batch-01.json
import json, sys

def v(en, bn, emoji=''): return {'en': en, 'bn': bn, 'emoji': emoji}
def s(en, bn, *alt): return {'en': en, 'bn': bn, 'alt': list(alt)}
def f(text, answer, options, bn): return {'text': text, 'answer': answer, 'options': options, 'bn': bn}
def g(text, answers, extra, bn): return {'text': text, 'answers': answers, 'extra': extra, 'bn': bn}
def gr(rule, correct, wrong, why): return {'rule': rule, 'correct': correct, 'wrong': wrong, 'why': why}
def d(who, lines, wrong): return {'with': who, 'lines': [{'who': w, 'en': e, 'bn': b} for w, e, b in lines], 'wrong': wrong}
def tip(title, body, examples): return {'title': title, 'body': body, 'examples': examples}
def L(title, titleBn, vocab, sentences, fills, gaps=None, grammar=None, dialogs=None):
    return {'title': title, 'titleBn': titleBn, 'vocab': vocab, 'sentences': sentences, 'fills': fills,
            'gaps': gaps or [], 'grammar': grammar or [], 'dialogs': dialogs or []}
def U(title, titleBn, color, tips, lessons): return {'title': title, 'titleBn': titleBn, 'color': color, 'tips': tips, 'lessons': lessons}

units = [
U('My Home', 'আমার বাড়ি', '#ff9500', [
  tip('there is / there are', 'কোথাও কিছু আছে বোঝাতে: একটা হলে there is, একাধিক হলে there are।', ['There is a bed in my room.', 'There are two chairs in the kitchen.']),
  tip('in / on / under', 'in = ভেতরে, on = উপরে (ছুঁয়ে), under = নিচে।', ['The book is on the table.', 'The cat is under the bed.']),
], [
  L('Rooms', 'ঘরগুলো', [v('kitchen', 'রান্নাঘর', '🍳'), v('bedroom', 'শোবার ঘর', '🛏️'), v('bathroom', 'বাথরুম', '🛁'), v('door', 'দরজা', '🚪'), v('window', 'জানালা', '🪟'), v('roof', 'ছাদ', '🏠')],
    [s('There is a bed in my room.', 'আমার ঘরে একটা খাট আছে।'), s('Our kitchen is small.', 'আমাদের রান্নাঘর ছোট।'), s('Please close the door.', 'দয়া করে দরজাটা বন্ধ করো।', 'Close the door, please.'), s('There are two windows in the bedroom.', 'শোবার ঘরে দুটো জানালা আছে।'), s('My mother is in the kitchen.', 'আমার মা রান্নাঘরে।')],
    [f('There ___ a bed in my room.', 'is', ['is', 'are', 'am'], 'আমার ঘরে একটা খাট আছে।'), f('There ___ two windows.', 'are', ['are', 'is', 'be'], 'দুটো জানালা আছে।')],
    [g('There ___ a table and there ___ four chairs.', ['is', 'are'], ['am', 'be'], 'একটা টেবিল আছে আর চারটা চেয়ার আছে।')],
    [gr('একাধিক জিনিসের আগে there are বসে।', 'There are three rooms in our house.', ['There is three rooms in our house.'], 'three rooms একাধিক, তাই are।')],
    [d('Nila', [('them', 'Where is your mother?', 'তোমার মা কোথায়?'), ('you', 'She is in the kitchen.', 'উনি রান্নাঘরে।')], ['She is a kitchen.', 'I am fine, thanks.'])]),
  L('Things at home', 'ঘরের জিনিস', [v('table', 'টেবিল', '🪑'), v('chair', 'চেয়ার', '🪑'), v('fan', 'ফ্যান', '🌀'), v('light', 'বাতি', '💡'), v('clock', 'ঘড়ি', '🕰️'), v('mirror', 'আয়না', '🪞')],
    [s('The book is on the table.', 'বইটা টেবিলের উপরে।'), s('The cat is under the bed.', 'বিড়ালটা খাটের নিচে।'), s('Turn on the fan, please.', 'দয়া করে ফ্যানটা চালাও।', 'Please turn on the fan.'), s('The clock is on the wall.', 'ঘড়িটা দেয়ালে।'), s('There is a mirror in the bathroom.', 'বাথরুমে একটা আয়না আছে।')],
    [f('The book is ___ the table.', 'on', ['on', 'under', 'at'], 'বইটা টেবিলের উপরে।'), f('The cat is ___ the bed.', 'under', ['under', 'on', 'of'], 'বিড়ালটা খাটের নিচে।')],
    [g('My bag is ___ the chair and my shoes are ___ the bed.', ['on', 'under'], ['of', 'at'], 'আমার ব্যাগ চেয়ারের উপরে আর জুতা খাটের নিচে।')],
    [gr('কোনো জিনিসের উপরে বোঝাতে on বসে।', 'The phone is on the table.', ['The phone is in on the table.', 'The phone on is the table.'], 'জিনিসটা টেবিলের উপরে, তাই on the table।')],
    []),
]),
U('Clothes & Shopping', 'জামাকাপড় ও কেনাকাটা', '#ff2d55', [
  tip('How much?', 'দাম জানতে: How much is this? (একটা) / How much are these? (একাধিক)।', ['How much is this shirt?', 'How much are these shoes?']),
  tip('this / these, that / those', 'কাছের একটা জিনিস this, একাধিক these; দূরের একটা that, একাধিক those।', ['This shirt is blue.', 'Those shoes are new.']),
], [
  L('Clothes and colours', 'জামা আর রং', [v('shirt', 'শার্ট', '👕'), v('dress', 'জামা (মেয়েদের)', '👗'), v('shoes', 'জুতা', '👟'), v('red', 'লাল', '🔴'), v('blue', 'নীল', '🔵'), v('black', 'কালো', '⚫')],
    [s('This shirt is blue.', 'এই শার্টটা নীল।'), s('I like your red dress.', 'তোমার লাল জামাটা আমার ভালো লাগে।'), s('These shoes are new.', 'এই জুতাগুলো নতুন।'), s('He is wearing a black shirt.', 'সে একটা কালো শার্ট পরে আছে।'), s('What colour is your bag?', 'তোমার ব্যাগটা কী রঙের?')],
    [f('___ shoes are new.', 'These', ['These', 'This', 'That'], 'এই জুতাগুলো নতুন।'), f('___ shirt is blue.', 'This', ['This', 'These', 'Those'], 'এই শার্টটা নীল।')],
    [g('___ shirt is red and ___ shoes are black.', ['This', 'these'], ['those', 'a'], 'এই শার্টটা লাল আর এই জুতাগুলো কালো।')],
    [gr('একাধিক জিনিসের জন্য these, একটার জন্য this।', 'These shoes are nice.', ['This shoes are nice.', 'These shoes is nice.'], 'shoes একাধিক, তাই these আর are।')],
    []),
  L('In a shop', 'দোকানে', [v('price', 'দাম', '🏷️'), v('cheap', 'সস্তা', '👍'), v('expensive', 'দামি', '💰'), v('size', 'মাপ', '📏'), v('buy', 'কেনা', '🛍️'), v('pay', 'টাকা দেওয়া', '💳')],
    [s('How much is this shirt?', 'এই শার্টটার দাম কত?'), s('It is too expensive.', 'এটা খুব বেশি দামি।'), s('Do you have a bigger size?', 'আপনার কাছে কি বড় মাপ আছে?'), s('I want to buy these shoes.', 'আমি এই জুতাগুলো কিনতে চাই।'), s('Can I pay by bKash?', 'আমি কি বিকাশে টাকা দিতে পারি?')],
    [f('How ___ is this shirt?', 'much', ['much', 'many', 'old'], 'এই শার্টটার দাম কত?'), f('How much ___ these shoes?', 'are', ['are', 'is', 'am'], 'এই জুতাগুলোর দাম কত?')],
    [],
    [],
    [d('Shopkeeper', [('them', 'Can I help you?', 'আপনাকে কীভাবে সাহায্য করতে পারি?'), ('you', 'How much is this shirt?', 'এই শার্টটার দাম কত?'), ('them', 'It is five hundred taka.', 'পাঁচশো টাকা।'), ('you', 'Do you have a bigger size?', 'আপনার কাছে কি বড় মাপ আছে?')], ['I am a bigger size.', 'Yes, I am fine.'])]),
]),
U('Free Time', 'অবসর', '#34c759', [
  tip('like + -ing', 'কী করতে ভালো লাগে বোঝাতে like-এর পরে কাজের সাথে -ing: I like playing।', ['I like reading books.', 'She likes watching TV.']),
  tip('can / can\'t', 'পারা বোঝাতে can, না পারা can\'t। can-এর পরে কাজটা যেমন আছে তেমন বসে।', ['I can swim.', 'He can\'t ride a bike.']),
], [
  L('Hobbies', 'শখ', [v('read', 'পড়া', '📖'), v('sing', 'গান গাওয়া', '🎤'), v('draw', 'আঁকা', '🎨'), v('play', 'খেলা', '⚽'), v('watch', 'দেখা', '📺'), v('cook', 'রান্না করা', '🍲')],
    [s('I like reading books.', 'আমি বই পড়তে ভালোবাসি।', 'I like to read books.'), s('She likes singing.', 'সে গান গাইতে ভালোবাসে।'), s('We play cricket on Friday.', 'আমরা শুক্রবার ক্রিকেট খেলি।'), s('My brother likes drawing.', 'আমার ভাই আঁকতে ভালোবাসে।'), s('Do you like cooking?', 'তুমি কি রান্না করতে ভালোবাসো?')],
    [f('I like ___ books.', 'reading', ['reading', 'read', 'reads'], 'আমি বই পড়তে ভালোবাসি।'), f('She ___ singing.', 'likes', ['likes', 'like', 'liking'], 'সে গান গাইতে ভালোবাসে।')],
    [g('I like ___ and my sister likes ___.', ['drawing', 'singing'], ['draw', 'sings'], 'আমি আঁকতে ভালোবাসি আর আমার বোন গাইতে ভালোবাসে।')],
    [gr('he/she-র সাথে like হয়ে যায় likes।', 'He likes playing football.', ['He like playing football.', 'He likes play football.'], 'he-র সাথে likes, আর like-এর পরে playing।')],
    []),
  L('What I can do', 'আমি যা পারি', [v('swim', 'সাঁতার কাটা', '🏊'), v('ride', 'চালানো (সাইকেল)', '🚲'), v('dance', 'নাচা', '💃'), v('run', 'দৌড়ানো', '🏃'), v('fast', 'দ্রুত', '⚡'), v('well', 'ভালোভাবে', '👍')],
    [s('I can swim.', 'আমি সাঁতার কাটতে পারি।'), s('He can\'t ride a bike.', 'সে সাইকেল চালাতে পারে না।', 'He cannot ride a bike.'), s('Can you dance?', 'তুমি কি নাচতে পারো?'), s('She can run very fast.', 'সে খুব দ্রুত দৌড়াতে পারে।'), s('My father can cook well.', 'আমার বাবা ভালো রান্না করতে পারেন।')],
    [f('I can ___.', 'swim', ['swim', 'swims', 'swimming'], 'আমি সাঁতার কাটতে পারি।'), f('He ___ ride a bike.', "can't", ["can't", "don't", "isn't"], 'সে সাইকেল চালাতে পারে না।')],
    [],
    [gr('can-এর পরে কাজটা যেমন আছে তেমন বসে, -s বা -ing হয় না।', 'She can sing.', ['She can sings.', 'She can singing.'], 'can-এর পরে sing, sings বা singing নয়।')],
    [d('Rafi', [('them', 'Can you play cricket?', 'তুমি কি ক্রিকেট খেলতে পারো?'), ('you', 'Yes, I can. I play every Friday.', 'হ্যাঁ, পারি। আমি প্রতি শুক্রবার খেলি।')], ['Yes, I am cricket.', 'No, I can cricket.'])]),
]),
U('Jobs & Work', 'চাকরি ও কাজ', '#5856d6', [
  tip('he works / she works', 'নিয়মিত কাজ বোঝাতে he, she, it-এর সাথে কাজের শেষে -s বা -es বসে।', ['He works in a bank.', 'She teaches English.']),
  tip('What do you do?', 'কারো পেশা জানতে: What do you do? উত্তর: I am a teacher. / I work in a hospital.', ['What does your father do?', 'He is a farmer.']),
], [
  L('Jobs', 'পেশা', [v('farmer', 'কৃষক', '👨‍🌾'), v('driver', 'চালক', '🚗'), v('nurse', 'নার্স', '👩‍⚕️'), v('engineer', 'প্রকৌশলী', '👷'), v('shopkeeper', 'দোকানদার', '🏪'), v('police officer', 'পুলিশ', '👮')],
    [s('My uncle is a farmer.', 'আমার চাচা একজন কৃষক।'), s('She is a nurse.', 'উনি একজন নার্স।'), s('What does your father do?', 'তোমার বাবা কী করেন?'), s('He is an engineer.', 'উনি একজন প্রকৌশলী।'), s('I want to be a doctor.', 'আমি ডাক্তার হতে চাই।')],
    [f('He is ___ engineer.', 'an', ['an', 'a', 'the'], 'উনি একজন প্রকৌশলী।'), f('What ___ your father do?', 'does', ['does', 'do', 'is'], 'তোমার বাবা কী করেন?')],
    [g('My mother is ___ nurse and my father is ___ engineer.', ['a', 'an'], ['the', 'am'], 'আমার মা একজন নার্স আর বাবা একজন প্রকৌশলী।')],
    [gr('স্বরধ্বনি দিয়ে শুরু পেশার আগে an বসে।', 'She is an engineer.', ['She is a engineer.'], 'engineer শুরু e দিয়ে, তাই an।')],
    []),
  L('A working day', 'কাজের দিন', [v('office', 'অফিস', '🏢'), v('factory', 'কারখানা', '🏭'), v('start', 'শুরু করা', '▶️'), v('finish', 'শেষ করা', '🏁'), v('salary', 'বেতন', '💵'), v('boss', 'বস', '👔')],
    [s('He works in a factory.', 'সে একটা কারখানায় কাজ করে।'), s('I start work at nine.', 'আমি নয়টায় কাজ শুরু করি।'), s('She finishes at five o\'clock.', 'সে পাঁচটায় কাজ শেষ করে।'), s('My boss is very kind.', 'আমার বস খুব ভালো মানুষ।'), s('We get our salary every month.', 'আমরা প্রতি মাসে বেতন পাই।')],
    [f('He ___ in a factory.', 'works', ['works', 'work', 'working'], 'সে একটা কারখানায় কাজ করে।'), f('She ___ at five o\'clock.', 'finishes', ['finishes', 'finish', 'finishing'], 'সে পাঁচটায় কাজ শেষ করে।')],
    [],
    [gr('he/she-র সাথে নিয়মিত কাজে -s যোগ হয়।', 'My sister works in an office.', ['My sister work in an office.', 'My sister working in an office.'], 'my sister মানে she, তাই works।')],
    [d('Manager', [('them', 'What time do you start work?', 'তুমি কয়টায় কাজ শুরু করো?'), ('you', 'I start at nine and finish at five.', 'আমি নয়টায় শুরু করি আর পাঁচটায় শেষ করি।')], ['I am nine o\'clock.', 'Yes, I work.'])]),
]),
U('In Town', 'শহরে', '#007aff', [
  tip('Where is…?', 'কোনো জায়গা খুঁজতে: Excuse me, where is the bank? উত্তরে next to (পাশে), opposite (উল্টো দিকে), near (কাছে)।', ['The bank is next to the school.', 'The bus stop is near the market.']),
  tip('go straight, turn left', 'পথ বলতে কাজ দিয়ে বাক্য শুরু হয়: Go straight. Turn left. Turn right.', ['Go straight and turn left.', 'Turn right at the mosque.']),
], [
  L('Places in town', 'শহরের জায়গা', [v('bank', 'ব্যাংক', '🏦'), v('hospital', 'হাসপাতাল', '🏥'), v('mosque', 'মসজিদ', '🕌'), v('bus stop', 'বাস স্ট্যান্ড', '🚏'), v('post office', 'ডাকঘর', '📮'), v('park', 'পার্ক', '🌳')],
    [s('Excuse me, where is the bank?', 'মাফ করবেন, ব্যাংকটা কোথায়?'), s('The hospital is near the market.', 'হাসপাতালটা বাজারের কাছে।'), s('The post office is next to the school.', 'ডাকঘরটা স্কুলের পাশে।'), s('The park is opposite the mosque.', 'পার্কটা মসজিদের উল্টো দিকে।'), s('Is there a bus stop near here?', 'এখানে কাছে কি কোনো বাস স্ট্যান্ড আছে?')],
    [f('The bank is next ___ the school.', 'to', ['to', 'of', 'at'], 'ব্যাংকটা স্কুলের পাশে।'), f('Excuse me, ___ is the hospital?', 'where', ['where', 'what', 'who'], 'মাফ করবেন, হাসপাতালটা কোথায়?')],
    [g('The park is ___ the mosque and the bank is next ___ it.', ['opposite', 'to'], ['under', 'of'], 'পার্কটা মসজিদের উল্টো দিকে আর ব্যাংকটা তার পাশে।')],
    [],
    []),
  L('Asking the way', 'পথ জিজ্ঞেস করা', [v('left', 'বাম', '⬅️'), v('right', 'ডান', '➡️'), v('straight', 'সোজা', '⬆️'), v('corner', 'মোড়', '↪️'), v('road', 'রাস্তা', '🛣️'), v('far', 'দূরে', '📍')],
    [s('Go straight and turn left.', 'সোজা গিয়ে বামে ঘুরুন।'), s('Turn right at the corner.', 'মোড়ে গিয়ে ডানে ঘুরুন।'), s('Is it far from here?', 'এটা কি এখান থেকে দূরে?'), s('It is a five minute walk.', 'হেঁটে পাঁচ মিনিট।'), s('Cross the road carefully.', 'সাবধানে রাস্তা পার হও।')],
    [f('Go ___ and turn left.', 'straight', ['straight', 'far', 'corner'], 'সোজা গিয়ে বামে ঘুরুন।'), f('Turn right ___ the corner.', 'at', ['at', 'on', 'of'], 'মোড়ে গিয়ে ডানে ঘুরুন।')],
    [],
    [gr('পথ বলতে বাক্য কাজ দিয়ে শুরু হয়, you লাগে না।', 'Turn left at the bank.', ['Turning left at the bank.', 'You turns left at the bank.'], 'নির্দেশ দিতে Turn দিয়ে শুরু।')],
    [d('Stranger', [('you', 'Excuse me, where is the bus stop?', 'মাফ করবেন, বাস স্ট্যান্ডটা কোথায়?'), ('them', 'Go straight and turn right. It is near the bank.', 'সোজা গিয়ে ডানে ঘুরুন। ব্যাংকের কাছে।'), ('you', 'Thank you very much.', 'অনেক ধন্যবাদ।')], ['Yes, I am a bus.', 'Turn left, please.'])]),
]),
U('Last Weekend', 'গত ছুটির দিন', '#af52de', [
  tip('was / were', 'অতীতে "ছিল": I, he, she, it-এর সাথে was; you, we, they-এর সাথে were।', ['I was at home yesterday.', 'They were happy.']),
  tip('-ed দিয়ে অতীত', 'অনেক কাজের অতীত বানাতে শেষে -ed: play → played, watch → watched, visit → visited।', ['We played football.', 'She visited her aunt.']),
], [
  L('Yesterday', 'গতকাল', [v('yesterday', 'গতকাল', '📅'), v('last week', 'গত সপ্তাহে', '🗓️'), v('tired', 'ক্লান্ত', '😩'), v('busy', 'ব্যস্ত', '⏳'), v('at home', 'বাড়িতে', '🏠'), v('ago', 'আগে', '⏪')],
    [s('I was at home yesterday.', 'আমি গতকাল বাড়িতে ছিলাম।'), s('They were very tired.', 'তারা খুব ক্লান্ত ছিল।'), s('Were you busy last week?', 'তুমি কি গত সপ্তাহে ব্যস্ত ছিলে?'), s('She was in Dhaka two days ago.', 'সে দুই দিন আগে ঢাকায় ছিল।'), s('The weather was nice.', 'আবহাওয়া ভালো ছিল।')],
    [f('I ___ at home yesterday.', 'was', ['was', 'were', 'am'], 'আমি গতকাল বাড়িতে ছিলাম।'), f('They ___ very tired.', 'were', ['were', 'was', 'are'], 'তারা খুব ক্লান্ত ছিল।')],
    [g('I ___ busy but my friends ___ at the park.', ['was', 'were'], ['is', 'am'], 'আমি ব্যস্ত ছিলাম কিন্তু আমার বন্ধুরা পার্কে ছিল।')],
    [gr('they, we, you-এর সাথে অতীতে were বসে।', 'We were at school yesterday.', ['We was at school yesterday.', 'We are at school yesterday.'], 'we-এর সাথে were, আর yesterday মানে অতীত।')],
    []),
  L('What I did', 'আমি যা করলাম', [v('visited', 'বেড়াতে গেলাম', '👋'), v('played', 'খেললাম', '⚽'), v('watched', 'দেখলাম', '📺'), v('cleaned', 'পরিষ্কার করলাম', '🧹'), v('cooked', 'রান্না করলাম', '🍳'), v('walked', 'হাঁটলাম', '🚶')],
    [s('We played football on Friday.', 'আমরা শুক্রবার ফুটবল খেলেছিলাম।'), s('She visited her aunt.', 'সে তার খালার বাড়ি বেড়াতে গিয়েছিল।'), s('I watched a film last night.', 'আমি গত রাতে একটা ছবি দেখেছিলাম।'), s('My mother cooked biryani.', 'আমার মা বিরিয়ানি রান্না করেছিলেন।'), s('We walked to the river.', 'আমরা হেঁটে নদীর ধারে গিয়েছিলাম।')],
    [f('We ___ football on Friday.', 'played', ['played', 'play', 'playing'], 'আমরা শুক্রবার ফুটবল খেলেছিলাম।'), f('I ___ a film last night.', 'watched', ['watched', 'watch', 'watches'], 'আমি গত রাতে একটা ছবি দেখেছিলাম।')],
    [],
    [gr('অতীতের কাজে শেষে -ed বসে।', 'I cleaned my room yesterday.', ['I clean my room yesterday.', 'I cleaning my room yesterday.'], 'yesterday মানে অতীত, তাই cleaned।')],
    [d('Mim', [('them', 'What did you do last weekend?', 'গত ছুটির দিনে কী করলে?'), ('you', 'I visited my grandmother.', 'আমি দাদির বাড়ি বেড়াতে গিয়েছিলাম।')], ['I visit my grandmother tomorrow.', 'Yes, I did weekend.'])]),
]),
U('Health & Body', 'স্বাস্থ্য ও শরীর', '#ff3b30', [
  tip('I have a…', 'শরীর খারাপ বলতে have: I have a headache (মাথাব্যথা), I have a fever (জ্বর)। he/she-র সাথে has।', ['I have a cold.', 'She has a fever.']),
  tip('should', 'পরামর্শ দিতে should: You should rest. should-এর পরে কাজটা যেমন আছে।', ['You should drink water.', 'You should see a doctor.']),
], [
  L('My body', 'আমার শরীর', [v('head', 'মাথা', '🙂'), v('eye', 'চোখ', '👁️'), v('ear', 'কান', '👂'), v('hand', 'হাত', '✋'), v('leg', 'পা', '🦵'), v('tooth', 'দাঁত', '🦷')],
    [s('My head hurts.', 'আমার মাথা ব্যথা করছে।'), s('Wash your hands before eating.', 'খাওয়ার আগে হাত ধোও।'), s('He broke his leg.', 'তার পা ভেঙে গেছে।'), s('I brush my teeth twice a day.', 'আমি দিনে দুবার দাঁত মাজি।'), s('She has big eyes.', 'তার চোখ বড় বড়।')],
    [f('Wash your ___ before eating.', 'hands', ['hands', 'eyes', 'ears'], 'খাওয়ার আগে হাত ধোও।'), f('I brush my ___ twice a day.', 'teeth', ['teeth', 'tooth', 'legs'], 'আমি দিনে দুবার দাঁত মাজি।')],
    [],
    [gr('একটা দাঁত tooth, অনেকগুলো teeth।', 'I brush my teeth every morning.', ['I brush my tooths every morning.'], 'tooth-এর বহুবচন teeth, tooths নয়।')],
    []),
  L('Feeling ill', 'অসুস্থ লাগা', [v('headache', 'মাথাব্যথা', '🤕'), v('fever', 'জ্বর', '🤒'), v('cough', 'কাশি', '😷'), v('medicine', 'ওষুধ', '💊'), v('rest', 'বিশ্রাম', '🛌'), v('better', 'ভালো (আগের চেয়ে)', '🙂')],
    [s('I have a headache.', 'আমার মাথাব্যথা করছে।'), s('She has a fever.', 'তার জ্বর।'), s('You should take this medicine.', 'তোমার এই ওষুধটা খাওয়া উচিত।'), s('You should rest at home.', 'তোমার বাড়িতে বিশ্রাম নেওয়া উচিত।'), s('I feel better today.', 'আজ একটু ভালো লাগছে।')],
    [f('She ___ a fever.', 'has', ['has', 'have', 'is'], 'তার জ্বর।'), f('You ___ rest at home.', 'should', ['should', 'are', 'has'], 'তোমার বাড়িতে বিশ্রাম নেওয়া উচিত।')],
    [g('I ___ a cough. You ___ see a doctor.', ['have', 'should'], ['has', 'am'], 'আমার কাশি হয়েছে। তোমার ডাক্তার দেখানো উচিত।')],
    [gr('should-এর পরে কাজটা যেমন আছে তেমন বসে।', 'You should drink more water.', ['You should drinks more water.', 'You should to drink more water.'], 'should-এর পরে drink, drinks বা to drink নয়।')],
    [d('Friend', [('them', 'You look tired. What is wrong?', 'তোমাকে ক্লান্ত লাগছে। কী হয়েছে?'), ('you', 'I have a headache.', 'আমার মাথাব্যথা করছে।')], ['I am a headache.', 'Yes, I look.'])]),
]),
U('Plans', 'পরিকল্পনা', '#00c7be', [
  tip('going to', 'আগে থেকে ঠিক করা কাজ: am/is/are + going to + কাজ।', ['I am going to visit my uncle.', 'We are going to play tomorrow.']),
  tip('ভবিষ্যতের সময়', 'tomorrow (আগামীকাল), next week (আগামী সপ্তাহে), tonight (আজ রাতে)।', ['I am going to study tonight.', 'She is going to travel next week.']),
], [
  L('Tomorrow', 'আগামীকাল', [v('tomorrow', 'আগামীকাল', '📆'), v('tonight', 'আজ রাতে', '🌙'), v('next week', 'আগামী সপ্তাহে', '🗓️'), v('study', 'পড়াশোনা করা', '📚'), v('travel', 'ভ্রমণ করা', '✈️'), v('visit', 'বেড়াতে যাওয়া', '👋')],
    [s('I am going to study tonight.', 'আমি আজ রাতে পড়াশোনা করব।'), s('We are going to visit our uncle tomorrow.', 'আমরা আগামীকাল চাচার বাড়ি যাব।'), s('She is going to travel next week.', 'সে আগামী সপ্তাহে ভ্রমণে যাবে।'), s('Are you going to play today?', 'তুমি কি আজ খেলবে?'), s('He is not going to come.', 'সে আসবে না।')],
    [f('I am going ___ study tonight.', 'to', ['to', 'for', 'at'], 'আমি আজ রাতে পড়াশোনা করব।'), f('She ___ going to travel.', 'is', ['is', 'are', 'am'], 'সে ভ্রমণে যাবে।')],
    [g('We ___ going ___ visit our uncle.', ['are', 'to'], ['is', 'for'], 'আমরা চাচার বাড়ি যাব।')],
    [gr('going to-এর আগে am/is/are লাগে।', 'They are going to buy a new phone.', ['They going to buy a new phone.', 'They is going to buy a new phone.'], 'they-এর সাথে are, তারপর going to।')],
    []),
  L('Making plans', 'পরিকল্পনা করা', [v('free', 'ফাঁকা (সময়)', '🙌'), v('meet', 'দেখা করা', '🤝'), v('together', 'একসাথে', '👫'), v('maybe', 'হয়তো', '🤔'), v('sure', 'অবশ্যই', '✅'), v('later', 'পরে', '⏰')],
    [s('Are you free on Friday?', 'তুমি কি শুক্রবার ফাঁকা আছ?'), s('Let\'s meet at the park.', 'চলো পার্কে দেখা করি।', 'Let us meet at the park.'), s('We can study together.', 'আমরা একসাথে পড়তে পারি।'), s('Maybe I will come later.', 'হয়তো আমি পরে আসব।'), s('Sure, see you tomorrow.', 'অবশ্যই, কাল দেখা হবে।')],
    [f('Let\'s ___ at the park.', 'meet', ['meet', 'meets', 'meeting'], 'চলো পার্কে দেখা করি।'), f('Are you ___ on Friday?', 'free', ['free', 'together', 'later'], 'তুমি কি শুক্রবার ফাঁকা আছ?')],
    [],
    [],
    [d('Sumon', [('them', 'Are you free on Friday?', 'তুমি কি শুক্রবার ফাঁকা আছ?'), ('you', 'Yes. Let\'s play cricket together.', 'হ্যাঁ। চলো একসাথে ক্রিকেট খেলি।')], ['Yes, I am Friday.', 'No, I am a cricket.'])]),
]),
U('Feelings & Opinions', 'অনুভূতি ও মতামত', '#ff9f0a', [
  tip('because', 'কারণ বলতে because: I am happy because I passed.', ['I am tired because I worked all day.', 'She is sad because her friend left.']),
  tip('I think…', 'নিজের মত বলতে I think, অন্যের মত জানতে What do you think?', ['I think this book is interesting.', 'What do you think about the film?']),
], [
  L('How I feel', 'আমার কেমন লাগছে', [v('angry', 'রাগী', '😠'), v('afraid', 'ভয় পাওয়া', '😨'), v('bored', 'বিরক্ত (একঘেয়ে)', '🥱'), v('excited', 'উত্তেজিত', '🤩'), v('worried', 'চিন্তিত', '😟'), v('proud', 'গর্বিত', '😌')],
    [s('I am excited because tomorrow is Eid.', 'আমি উত্তেজিত কারণ আগামীকাল ঈদ।'), s('She is worried about the exam.', 'সে পরীক্ষা নিয়ে চিন্তিত।'), s('Don\'t be afraid.', 'ভয় পেয়ো না।'), s('My parents are proud of me.', 'আমার বাবা-মা আমাকে নিয়ে গর্বিত।'), s('I am bored at home.', 'বাড়িতে আমার একঘেয়ে লাগছে।')],
    [f('She is worried ___ the exam.', 'about', ['about', 'of', 'at'], 'সে পরীক্ষা নিয়ে চিন্তিত।'), f('My parents are proud ___ me.', 'of', ['of', 'about', 'to'], 'আমার বাবা-মা আমাকে নিয়ে গর্বিত।')],
    [g('I am happy ___ I passed the test.', ['because'], ['but', 'so'], 'আমি খুশি কারণ আমি পরীক্ষায় পাস করেছি।')],
    [gr('কারণ বলতে because বসে।', 'He is tired because he worked all day.', ['He is tired so he worked all day.'], 'কাজ করেছে বলে ক্লান্ত, তাই because।')],
    []),
  L('What I think', 'আমার মত', [v('interesting', 'আকর্ষণীয়', '🤓'), v('boring', 'একঘেয়ে', '😴'), v('easy', 'সহজ', '🟢'), v('difficult', 'কঠিন', '🔴'), v('agree', 'একমত হওয়া', '🤝'), v('favourite', 'সবচেয়ে প্রিয়', '⭐')],
    [s('I think English is easy.', 'আমার মনে হয় ইংরেজি সহজ।'), s('What do you think about this film?', 'এই ছবিটা নিয়ে তোমার কী মনে হয়?'), s('I agree with you.', 'আমি তোমার সাথে একমত।'), s('Maths is difficult for me.', 'অংক আমার কাছে কঠিন।'), s('My favourite subject is science.', 'আমার সবচেয়ে প্রিয় বিষয় বিজ্ঞান।')],
    [f('I ___ English is easy.', 'think', ['think', 'thinks', 'thinking'], 'আমার মনে হয় ইংরেজি সহজ।'), f('I agree ___ you.', 'with', ['with', 'to', 'of'], 'আমি তোমার সাথে একমত।')],
    [],
    [gr('কিছু বিরক্তিকর হলে boring, মানুষ বিরক্ত হলে bored।', 'The film was boring.', ['The film was bored.'], 'ছবিটা নিজে একঘেয়ে, তাই boring।')],
    [d('Teacher', [('them', 'What do you think about this story?', 'এই গল্পটা নিয়ে তোমার কী মনে হয়?'), ('you', 'I think it is very interesting.', 'আমার মনে হয় এটা খুব আকর্ষণীয়।')], ['I think it is a story me.', 'Yes, I am interesting.'])]),
]),
U('Nature & Comparing', 'প্রকৃতি ও তুলনা', '#30b0c7', [
  tip('-er than', 'দুইটার তুলনায় ছোট শব্দের শেষে -er আর পরে than: bigger than, taller than।', ['An elephant is bigger than a cow.', 'Dhaka is bigger than Sylhet.']),
  tip('the -est', 'সবার মধ্যে সবচেয়ে বোঝাতে the + -est: the biggest, the tallest। বড় শব্দে the most: the most beautiful।', ['The Padma is the biggest river here.', 'This is the most beautiful place.']),
], [
  L('Nature', 'প্রকৃতি', [v('river', 'নদী', '🏞️'), v('mountain', 'পাহাড়', '⛰️'), v('tree', 'গাছ', '🌳'), v('flower', 'ফুল', '🌸'), v('sea', 'সমুদ্র', '🌊'), v('sky', 'আকাশ', '☁️')],
    [s('Bangladesh has many rivers.', 'বাংলাদেশে অনেক নদী আছে।'), s('The sky is blue today.', 'আজ আকাশ নীল।'), s('There are big trees in the village.', 'গ্রামে বড় বড় গাছ আছে।'), s('We went to the sea at Cox\'s Bazar.', 'আমরা কক্সবাজারে সমুদ্রে গিয়েছিলাম।'), s('Flowers grow in spring.', 'বসন্তে ফুল ফোটে।')],
    [f('Bangladesh has many ___.', 'rivers', ['rivers', 'river', 'sky'], 'বাংলাদেশে অনেক নদী আছে।'), f('The ___ is blue today.', 'sky', ['sky', 'tree', 'flower'], 'আজ আকাশ নীল।')],
    [],
    [],
    []),
  L('Bigger and biggest', 'বড় আর সবচেয়ে বড়', [v('bigger', 'আরো বড়', '🐘'), v('smaller', 'আরো ছোট', '🐜'), v('taller', 'আরো লম্বা', '🦒'), v('hotter', 'আরো গরম', '🔥'), v('the biggest', 'সবচেয়ে বড়', '🏆'), v('the best', 'সবচেয়ে ভালো', '🥇')],
    [s('An elephant is bigger than a cow.', 'হাতি গরুর চেয়ে বড়।'), s('My brother is taller than me.', 'আমার ভাই আমার চেয়ে লম্বা।'), s('Summer is hotter than winter.', 'গ্রীষ্ম শীতের চেয়ে গরম।'), s('This is the biggest tree in the village.', 'এটা গ্রামের সবচেয়ে বড় গাছ।'), s('She is the best student in our class.', 'সে আমাদের ক্লাসের সবচেয়ে ভালো ছাত্রী।')],
    [f('An elephant is bigger ___ a cow.', 'than', ['than', 'then', 'that'], 'হাতি গরুর চেয়ে বড়।'), f('This is ___ biggest tree.', 'the', ['the', 'a', 'than'], 'এটা সবচেয়ে বড় গাছ।')],
    [g('A cat is ___ than a dog, but a mouse is the ___.', ['smaller', 'smallest'], ['small', 'bigger'], 'বিড়াল কুকুরের চেয়ে ছোট, কিন্তু ইঁদুর সবচেয়ে ছোট।')],
    [gr('দুইটার তুলনায় -er + than বসে।', 'My bag is heavier than your bag.', ['My bag is more heavy than your bag.', 'My bag is heavier that your bag.'], 'heavy-র তুলনা heavier, আর পরে than।')],
    [d('Friend', [('them', 'Which is bigger, Dhaka or Sylhet?', 'কোনটা বড়, ঢাকা না সিলেট?'), ('you', 'Dhaka is bigger than Sylhet.', 'ঢাকা সিলেটের চেয়ে বড়।')], ['Dhaka is big than Sylhet.', 'Sylhet is the Dhaka.'])]),
]),
]

data = {'language': {'code': 'bn', 'name': 'Bangla', 'native': 'বাংলা', 'dir': 'ltr'}, 'units': units}
json.dump(data, open(sys.argv[1], 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print(len(units), 'units', sum(len(u['lessons']) for u in units), 'lessons')

# Why each blank is right (shown after a wrong answer).
WHY = {
 'There ___ a bed in my room.': 'a bed একটা, তাই there is।',
 'There ___ two windows.': 'two windows একাধিক, তাই there are।',
 'There ___ a table and there ___ four chairs.': 'a table একটা, তাই is; four chairs একাধিক, তাই are।',
 'The book is ___ the table.': 'টেবিলের উপরে ছুঁয়ে আছে, তাই on।',
 'The cat is ___ the bed.': 'খাটের নিচে, তাই under।',
 'My bag is ___ the chair and my shoes are ___ the bed.': 'চেয়ারের উপরে on, খাটের নিচে under।',
 '___ shoes are new.': 'shoes একাধিক আর কাছে, তাই these।',
 '___ shirt is blue.': 'shirt একটা আর কাছে, তাই this।',
 '___ shirt is red and ___ shoes are black.': 'একটা shirt-এর আগে this, একাধিক shoes-এর আগে these।',
 'How ___ is this shirt?': 'দাম জানতে How much।',
 'How much ___ these shoes?': 'shoes একাধিক, তাই are।',
 'I like ___ books.': 'like-এর পরে কাজের সাথে -ing: reading।',
 'She ___ singing.': 'she-র সাথে like হয়ে যায় likes।',
 'I like ___ and my sister likes ___.': 'like-এর পরে -ing: drawing, singing।',
 'I can ___.': 'can-এর পরে কাজটা যেমন আছে: swim।',
 'He ___ ride a bike.': "পারে না বোঝাতে can't।",
 'He is ___ engineer.': 'engineer শুরু স্বরধ্বনি e দিয়ে, তাই an।',
 'What ___ your father do?': 'your father মানে he, তাই প্রশ্নে does।',
 'My mother is ___ nurse and my father is ___ engineer.': 'nurse-এর আগে a, engineer (স্বরধ্বনি) আগে an।',
 'He ___ in a factory.': 'he-র সাথে নিয়মিত কাজে -s: works।',
 "She ___ at five o'clock.": 'she-র সাথে finish হয় finishes (sh-এর পরে -es)।',
 'The bank is next ___ the school.': 'পাশে বোঝাতে next to।',
 'Excuse me, ___ is the hospital?': 'জায়গা জানতে where।',
 'The park is ___ the mosque and the bank is next ___ it.': 'উল্টো দিকে opposite, পাশে next to।',
 'Go ___ and turn left.': 'সোজা যাওয়া মানে go straight।',
 'Turn right ___ the corner.': 'মোড়ে বোঝাতে at the corner।',
 'I ___ at home yesterday.': 'I-এর সাথে অতীতে was।',
 'They ___ very tired.': 'they-এর সাথে অতীতে were।',
 'I ___ busy but my friends ___ at the park.': 'I-এর সাথে was, my friends (they)-এর সাথে were।',
 'We ___ football on Friday.': 'গত শুক্রবারের কথা, তাই অতীত played।',
 'I ___ a film last night.': 'last night মানে অতীত, তাই watched।',
 'Wash your ___ before eating.': 'হাত ধোয়া, তাই hands।',
 'I brush my ___ twice a day.': 'অনেকগুলো দাঁত, tooth-এর বহুবচন teeth।',
 'She ___ a fever.': 'she-র সাথে have হয়ে যায় has।',
 'You ___ rest at home.': 'পরামর্শ দিতে should।',
 'I ___ a cough. You ___ see a doctor.': 'I-এর সাথে have; পরামর্শে should।',
 'I am going ___ study tonight.': 'going-এর পরে to: going to study।',
 'She ___ going to travel.': 'she-র সাথে is।',
 'We ___ going ___ visit our uncle.': 'we-এর সাথে are, তারপর going to।',
 "Let's ___ at the park.": "Let's-এর পরে কাজটা যেমন আছে: meet।",
 'Are you ___ on Friday?': 'ফাঁকা আছ কি না: free।',
 'She is worried ___ the exam.': 'কোনো কিছু নিয়ে চিন্তা: worried about।',
 'My parents are proud ___ me.': 'কাউকে নিয়ে গর্ব: proud of।',
 'I am happy ___ I passed the test.': 'কারণ বলতে because।',
 'I ___ English is easy.': 'I-এর সাথে think, -s ছাড়া।',
 'I agree ___ you.': 'কারো সাথে একমত: agree with।',
 'Bangladesh has many ___.': 'many-র পরে বহুবচন: rivers।',
 'The ___ is blue today.': 'আকাশ নীল: sky।',
 'An elephant is bigger ___ a cow.': 'তুলনায় -er-এর পরে than।',
 'This is ___ biggest tree.': 'সবচেয়ে বোঝাতে the + -est।',
 'A cat is ___ than a dog, but a mouse is the ___.': 'দুটোর তুলনায় smaller, সবার মধ্যে the smallest।',
}
data = json.load(open(sys.argv[1], encoding='utf8'))
missing = []
for u in data['units']:
    for l in u['lessons']:
        for item in l['fills'] + l['gaps']:
            if item['text'] in WHY: item['why'] = WHY[item['text']]
            else: missing.append(item['text'])
json.dump(data, open(sys.argv[1], 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print('whys missing:', missing)
