# Builds content/ar-batch-01.json: Arabic speakers' units 4–11 (A1 to A2), after the Arabic starter (units 1–3).
# Every unit has the four lessons of a complete unit (docs/SYLLABUS.md): words 1, words 2, grammar, conversation;
# the unit test (built by the app from all four) closes it. Meanings and explanations in Modern Standard Arabic,
# drafted by AI: a native speaker checks them in the admin before Arabic goes live.
#   python content/build/ar_batch_01.py content/ar-batch-01.json
import json, sys

def v(en, ar, emoji=''): return {'en': en, 'bn': ar, 'emoji': emoji}
def s(en, ar, *alt): return {'en': en, 'bn': ar, 'alt': list(alt)}
def f(text, answer, options, ar, why): return {'text': text, 'answer': answer, 'options': options, 'bn': ar, 'why': why}
def g(text, answers, extra, ar, why): return {'text': text, 'answers': answers, 'extra': extra, 'bn': ar, 'why': why}
def gr(rule, correct, wrong, why): return {'rule': rule, 'correct': correct, 'wrong': wrong, 'why': why}
def d(who, lines, wrong, why=''):
    out = {'with': who, 'lines': [{'who': w, 'en': e, 'bn': b} for w, e, b in lines], 'wrong': wrong}
    if why: out['why'] = why
    return out
def tip(title, body, examples): return {'title': title, 'body': body, 'examples': examples}
def L(title, ar, vocab, sentences, fills, gaps=(), grammar=(), dialogs=()):
    return {'title': title, 'titleBn': ar, 'vocab': vocab, 'sentences': sentences, 'fills': fills, 'gaps': list(gaps), 'grammar': list(grammar), 'dialogs': list(dialogs)}
def U(title, ar, color, tips, lessons): return {'title': title, 'titleBn': ar, 'color': color, 'tips': tips, 'lessons': lessons}

units = [
# ---------------------------------------------------------------- 4
U('Numbers & Time', 'الأعداد والوقت', '#ff9500', [
  tip('What time is it?', 'لمعرفة الساعة نقول: What time is it? والجواب: It is ... o\'clock. ونستخدم at قبل الوقت: at seven.', ['It is ten o\'clock.', 'I wake up at six.']),
  tip('Numbers 1–100', 'من 13 إلى 19 تنتهي الأعداد بـ teen: thirteen, fourteen. والعشرات تنتهي بـ ty: twenty, thirty.', ['I am fifteen years old.', 'There are thirty students.']),
], [
  L('Numbers', 'الأعداد', [v('one', 'واحد', '1️⃣'), v('two', 'اثنان', '2️⃣'), v('three', 'ثلاثة', '3️⃣'), v('ten', 'عشرة', '🔟'), v('twenty', 'عشرون', '🔢'), v('hundred', 'مئة', '💯')],
    [s('I have two brothers.', 'عندي أخوان اثنان.'), s('She is ten years old.', 'عمرها عشر سنوات.'), s('There are twenty students in the class.', 'في الصف عشرون طالبًا.'), s('This book is one hundred pages.', 'هذا الكتاب مئة صفحة.'), s('I have three apples.', 'عندي ثلاث تفاحات.')],
    [f('She is ten years ___.', 'old', ['old', 'age', 'year'], 'عمرها عشر سنوات.', 'للعمر نقول: years old.'), f('I have two ___.', 'brothers', ['brothers', 'brother', 'a brother'], 'عندي أخوان اثنان.', 'بعد two يأتي الاسم بالجمع: brothers.')]),
  L('Telling the time', 'معرفة الوقت', [v('o\'clock', 'تمامًا (الساعة)', '🕐'), v('morning', 'الصباح', '🌅'), v('afternoon', 'بعد الظهر', '🌤️'), v('evening', 'المساء', '🌆'), v('night', 'الليل', '🌙'), v('minute', 'دقيقة', '⏱️')],
    [s('What time is it?', 'كم الساعة؟'), s('It is seven o\'clock.', 'الساعة السابعة.', 'It\'s seven o\'clock.'), s('I wake up at six in the morning.', 'أستيقظ في السادسة صباحًا.'), s('We eat dinner at night.', 'نتناول العشاء في الليل.'), s('Wait five minutes, please.', 'انتظر خمس دقائق من فضلك.')],
    [f('I wake up ___ six.', 'at', ['at', 'in', 'on'], 'أستيقظ في السادسة.', 'قبل الساعة نستخدم at.'), f('What ___ is it?', 'time', ['time', 'clock', 'hour'], 'كم الساعة؟', 'السؤال عن الساعة: What time is it?')]),
  L('Days of the week', 'أيام الأسبوع', [v('Monday', 'الاثنين', '📅'), v('Friday', 'الجمعة', '📅'), v('Saturday', 'السبت', '📅'), v('today', 'اليوم', '📍')],
    [s('Today is Monday.', 'اليوم هو الاثنين.'), s('We go to school on Sunday.', 'نذهب إلى المدرسة يوم الأحد.'), s('I visit my grandmother on Friday.', 'أزور جدتي يوم الجمعة.'), s('The shop is closed on Saturday.', 'المتجر مغلق يوم السبت.'), s('What day is it today?', 'ما اليوم؟')],
    [f('I visit my grandmother ___ Friday.', 'on', ['on', 'at', 'in'], 'أزور جدتي يوم الجمعة.', 'قبل أيام الأسبوع نستخدم on.'), f('Today ___ Monday.', 'is', ['is', 'are', 'am'], 'اليوم هو الاثنين.', 'Today مفرد، لذلك is.')],
    [g('I go to school ___ Sunday ___ eight o\'clock.', ['on', 'at'], ['in', 'of'], 'أذهب إلى المدرسة يوم الأحد في الثامنة.', 'on قبل اليوم، و at قبل الساعة.')],
    [gr('نستخدم on مع الأيام و at مع الساعات.', 'The class starts at nine on Monday.', ['The class starts on nine at Monday.', 'The class starts in nine in Monday.'], 'at nine للساعة، و on Monday لليوم.')]),
  L('Making plans', 'تحديد المواعيد', [v('when', 'متى', '❓'), v('late', 'متأخر', '⏰'), v('early', 'مبكر', '🐓'), v('tomorrow', 'غدًا', '➡️')],
    [s('When is the meeting?', 'متى الاجتماع؟'), s('The bus is late.', 'الحافلة متأخرة.'), s('Come early tomorrow.', 'تعال مبكرًا غدًا.'), s('See you at five.', 'أراك في الخامسة.'), s('Is it far?', 'هل هو بعيد؟')],
    [f('See you ___ five.', 'at', ['at', 'on', 'in'], 'أراك في الخامسة.', 'مع الساعة نستخدم at.'), f('Come ___ tomorrow.', 'early', ['early', 'late', 'when'], 'تعال مبكرًا غدًا.', 'early تعني مبكرًا.')],
    dialogs=[d('Sara', [('them', 'What time is the class?', 'متى الحصة؟'), ('you', 'It is at nine o\'clock.', 'إنها في الساعة التاسعة.')], ['It is Monday nine.', 'Yes, I am nine.'], 'للجواب عن الوقت: It is at + الساعة.'),
             d('Omar', [('them', 'Can we meet tomorrow?', 'هل يمكن أن نلتقي غدًا؟'), ('you', 'Yes, see you at five.', 'نعم، أراك في الخامسة.')], ['Yes, I am tomorrow.', 'No, five is late me.'])]),
]),
# ---------------------------------------------------------------- 5
U('Daily Life', 'الحياة اليومية', '#34c759', [
  tip('Present simple', 'للعادات اليومية نستخدم المضارع البسيط: I work. ومع he/she/it نضيف s: She works.', ['I get up at six.', 'He goes to work by bus.']),
  tip('every day', 'every day / usually / always تدل على العادة.', ['I always drink tea.', 'We usually eat at home.']),
], [
  L('My morning', 'صباحي', [v('wake up', 'يستيقظ', '⏰'), v('wash', 'يغسل', '🧼'), v('breakfast', 'الفطور', '🍳'), v('brush', 'ينظّف (بالفرشاة)', '🪥'), v('dress', 'يلبس', '👕'), v('leave', 'يغادر', '🚪')],
    [s('I wake up at six.', 'أستيقظ في السادسة.'), s('I wash my face.', 'أغسل وجهي.'), s('I eat breakfast with my family.', 'أتناول الفطور مع عائلتي.'), s('I brush my teeth.', 'أنظّف أسناني.'), s('I leave home at seven.', 'أغادر البيت في السابعة.')],
    [f('I ___ my teeth.', 'brush', ['brush', 'wash', 'eat'], 'أنظّف أسناني.', 'للأسنان نقول brush.'), f('I eat ___ with my family.', 'breakfast', ['breakfast', 'morning', 'teeth'], 'أتناول الفطور مع عائلتي.', 'breakfast هو الفطور.')]),
  L('My day', 'يومي', [v('work', 'يعمل', '💼'), v('study', 'يدرس', '📚'), v('lunch', 'الغداء', '🍱'), v('rest', 'يرتاح', '🛋️'), v('sleep', 'ينام', '😴'), v('home', 'البيت', '🏠')],
    [s('I work in an office.', 'أعمل في مكتب.'), s('She studies English every day.', 'تدرس الإنجليزية كل يوم.'), s('We eat lunch at one.', 'نتناول الغداء في الواحدة.'), s('He rests after work.', 'يرتاح بعد العمل.'), s('I go to sleep at ten.', 'أنام في العاشرة.')],
    [f('She ___ English every day.', 'studies', ['studies', 'study', 'studying'], 'تدرس الإنجليزية كل يوم.', 'مع she نضيف es: studies.'), f('He rests ___ work.', 'after', ['after', 'at', 'on'], 'يرتاح بعد العمل.', 'after تعني بعد.')]),
  L('He works, she works', 'هو يعمل، هي تعمل', [v('always', 'دائمًا', '🔁'), v('usually', 'عادةً', '📆'), v('never', 'أبدًا', '🚫'), v('sometimes', 'أحيانًا', '🔀')],
    [s('He always drinks tea in the morning.', 'يشرب الشاي دائمًا في الصباح.'), s('She usually walks to work.', 'تمشي عادةً إلى العمل.'), s('I never eat late.', 'لا آكل متأخرًا أبدًا.'), s('My father works in a bank.', 'يعمل أبي في بنك.'), s('Sometimes we watch TV.', 'أحيانًا نشاهد التلفاز.')],
    [f('My father ___ in a bank.', 'works', ['works', 'work', 'working'], 'يعمل أبي في بنك.', 'my father = he، لذلك works.'), f('I ___ eat late.', 'never', ['never', 'always', 'usually'], 'لا آكل متأخرًا أبدًا.', 'never تعني أبدًا.')],
    [g('She ___ to work and he ___ the bus.', ['walks', 'takes'], ['walk', 'take'], 'هي تمشي إلى العمل وهو يركب الحافلة.', 'مع she و he نضيف s للفعل.')],
    [gr('مع he و she و it يأخذ الفعل s في المضارع البسيط.', 'She goes to school every day.', ['She go to school every day.', 'She going to school every day.'], 'she + goes (نضيف es بعد o).'),
     gr('كلمات التكرار تأتي قبل الفعل.', 'I always drink tea.', ['I drink always tea.', 'Always I drink tea always.'], 'always قبل الفعل drink.')]),
  L('Talking about my day', 'الحديث عن يومي', [v('busy', 'مشغول', '⏳'), v('free', 'متفرغ', '🙌'), v('tired', 'متعب', '😩'), v('after', 'بعد', '➡️')],
    [s('Are you busy today?', 'هل أنت مشغول اليوم؟'), s('I am free after five.', 'أنا متفرغ بعد الخامسة.'), s('I am tired after work.', 'أنا متعب بعد العمل.'), s('What do you do in the evening?', 'ماذا تفعل في المساء؟'), s('I read and then I sleep.', 'أقرأ ثم أنام.')],
    [f('I am free ___ five.', 'after', ['after', 'on', 'of'], 'أنا متفرغ بعد الخامسة.', 'after تعني بعد.'), f('What do you ___ in the evening?', 'do', ['do', 'does', 'doing'], 'ماذا تفعل في المساء؟', 'مع you نستخدم do.')],
    dialogs=[d('Lina', [('them', 'What do you do in the evening?', 'ماذا تفعل في المساء؟'), ('you', 'I usually read a book.', 'عادةً أقرأ كتابًا.')], ['I usually a book.', 'Yes, I evening.'], 'الجواب: I + usually + فعل.'),
             d('Karim', [('them', 'Are you busy now?', 'هل أنت مشغول الآن؟'), ('you', 'No, I am free.', 'لا، أنا متفرغ.')], ['No, I free am.', 'Yes, I busy now you.'])]),
]),
# ---------------------------------------------------------------- 6
U('At the Market', 'في السوق', '#ff2d55', [
  tip('How much?', 'لسؤال السعر: How much is this? للمفرد، و How much are these? للجمع.', ['How much is this bag?', 'How much are these apples?']),
  tip('some / any', 'some في الجملة المثبتة، و any في السؤال والنفي.', ['I want some rice.', 'Do you have any eggs?']),
], [
  L('Food at the market', 'الطعام في السوق', [v('rice', 'أرز', '🍚'), v('fish', 'سمك', '🐟'), v('egg', 'بيضة', '🥚'), v('onion', 'بصل', '🧅'), v('potato', 'بطاطس', '🥔'), v('milk', 'حليب', '🥛')],
    [s('I want some rice.', 'أريد بعض الأرز.'), s('The fish is fresh.', 'السمك طازج.'), s('Do you have any eggs?', 'هل عندك بيض؟'), s('Give me one kilo of onions.', 'أعطني كيلو بصل.'), s('Milk is good for children.', 'الحليب مفيد للأطفال.')],
    [f('Do you have ___ eggs?', 'any', ['any', 'some', 'a'], 'هل عندك بيض؟', 'في السؤال نستخدم any.'), f('I want ___ rice.', 'some', ['some', 'any', 'a'], 'أريد بعض الأرز.', 'في الجملة المثبتة نستخدم some.')]),
  L('Prices', 'الأسعار', [v('price', 'السعر', '🏷️'), v('cheap', 'رخيص', '👍'), v('expensive', 'غالٍ', '💰'), v('money', 'مال', '💵'), v('change', 'الباقي (من النقود)', '🪙'), v('kilo', 'كيلو', '⚖️')],
    [s('How much is this?', 'بكم هذا؟'), s('It is too expensive.', 'إنه غالٍ جدًا.'), s('Can you make it cheaper?', 'هل يمكن أن تخفّض السعر؟'), s('Here is your change.', 'تفضّل الباقي.'), s('How much are these mangoes?', 'بكم هذا المانجو؟')],
    [f('How much ___ these mangoes?', 'are', ['are', 'is', 'am'], 'بكم هذا المانجو؟', 'mangoes جمع، لذلك are.'), f('It is too ___.', 'expensive', ['expensive', 'change', 'money'], 'إنه غالٍ جدًا.', 'expensive تعني غالٍ.')]),
  L('This, that, these, those', 'هذا وذلك', [v('this', 'هذا (قريب)', '👇'), v('that', 'ذلك (بعيد)', '👉'), v('these', 'هؤلاء/هذه (قريبة، جمع)', '👇'), v('those', 'أولئك/تلك (بعيدة، جمع)', '👉')],
    [s('This apple is red.', 'هذه التفاحة حمراء.'), s('That shop is big.', 'ذلك المتجر كبير.'), s('These bananas are cheap.', 'هذا الموز رخيص.'), s('Those oranges are sweet.', 'ذلك البرتقال حلو.'), s('Is this your bag?', 'هل هذه حقيبتك؟')],
    [f('___ bananas are cheap.', 'These', ['These', 'This', 'That'], 'هذا الموز رخيص.', 'bananas جمع وقريب: these.'), f('___ shop is big.', 'That', ['That', 'Those', 'These'], 'ذلك المتجر كبير.', 'shop مفرد وبعيد: that.')],
    [g('___ bag is mine and ___ shoes are yours.', ['This', 'those'], ['these', 'that'], 'هذه حقيبتي وتلك الأحذية لك.', 'bag مفرد قريب: this؛ shoes جمع بعيد: those.')],
    [gr('this/that للمفرد، و these/those للجمع.', 'These apples are fresh.', ['This apples are fresh.', 'These apples is fresh.'], 'apples جمع، لذلك these و are.')]),
  L('Buying things', 'الشراء', [v('buy', 'يشتري', '🛍️'), v('sell', 'يبيع', '🏪'), v('bag', 'كيس/حقيبة', '👜'), v('pay', 'يدفع', '💳')],
    [s('I want to buy some fruit.', 'أريد أن أشتري بعض الفاكهة.'), s('Do you sell bread?', 'هل تبيع الخبز؟'), s('Can I have a bag, please?', 'هل يمكن أن آخذ كيسًا من فضلك؟'), s('I will pay now.', 'سأدفع الآن.'), s('Thank you, have a nice day.', 'شكرًا، طاب يومك.')],
    [f('Do you ___ bread?', 'sell', ['sell', 'buy', 'pay'], 'هل تبيع الخبز؟', 'البائع يبيع: sell.'), f('Can I ___ a bag, please?', 'have', ['have', 'has', 'having'], 'هل يمكن أن آخذ كيسًا من فضلك؟', 'بعد can يأتي الفعل كما هو: have.')],
    dialogs=[d('Seller', [('them', 'Can I help you?', 'كيف أساعدك؟'), ('you', 'How much are these tomatoes?', 'بكم هذه الطماطم؟'), ('them', 'Fifty taka a kilo.', 'خمسون تاكا للكيلو.'), ('you', 'Give me two kilos, please.', 'أعطني كيلوين من فضلك.')], ['I am two kilos.', 'Yes, tomato is me.'])]),
]),
# ---------------------------------------------------------------- 7
U('At School', 'في المدرسة', '#007aff', [
  tip('Classroom language', 'جمل الصف تبدأ غالبًا بالفعل: Open your book. Listen. Sit down.', ['Open your books, please.', 'Please sit down.']),
  tip('Can I...?', 'لطلب الإذن نقول: Can I ...? ثم الفعل كما هو.', ['Can I go out?', 'Can I ask a question?']),
], [
  L('In the classroom', 'في الصف', [v('teacher', 'المعلم', '👩‍🏫'), v('student', 'الطالب', '🧑‍🎓'), v('book', 'كتاب', '📕'), v('pen', 'قلم', '🖊️'), v('desk', 'مكتب/طاولة', '🪑'), v('board', 'السبورة', '🧑‍🏫')],
    [s('The teacher is kind.', 'المعلم لطيف.'), s('I have a blue pen.', 'عندي قلم أزرق.'), s('My book is on the desk.', 'كتابي على الطاولة.'), s('Look at the board.', 'انظر إلى السبورة.'), s('There are thirty students.', 'هناك ثلاثون طالبًا.')],
    [f('Look ___ the board.', 'at', ['at', 'on', 'to'], 'انظر إلى السبورة.', 'نقول look at.'), f('My book is ___ the desk.', 'on', ['on', 'at', 'in'], 'كتابي على الطاولة.', 'على = on.')]),
  L('School subjects', 'المواد الدراسية', [v('English', 'الإنجليزية', '🇬🇧'), v('maths', 'الرياضيات', '➗'), v('science', 'العلوم', '🔬'), v('history', 'التاريخ', '🏛️'), v('lesson', 'درس', '📖'), v('homework', 'واجب منزلي', '📝')],
    [s('I like science.', 'أحب العلوم.'), s('Maths is my favourite subject.', 'الرياضيات مادتي المفضلة.'), s('We have English today.', 'عندنا إنجليزية اليوم.'), s('I do my homework at night.', 'أكتب واجبي في الليل.'), s('The history lesson is interesting.', 'درس التاريخ ممتع.')],
    [f('I do my ___ at night.', 'homework', ['homework', 'lesson', 'maths'], 'أكتب واجبي في الليل.', 'homework هو الواجب المنزلي.'), f('Maths is my ___ subject.', 'favourite', ['favourite', 'homework', 'teacher'], 'الرياضيات مادتي المفضلة.', 'favourite تعني المفضّل.')]),
  L('Classroom instructions', 'تعليمات الصف', [v('open', 'افتح', '📖'), v('close', 'أغلق', '📕'), v('listen', 'استمع', '👂'), v('repeat', 'كرّر', '🔁')],
    [s('Open your book, please.', 'افتح كتابك من فضلك.'), s('Close the door.', 'أغلق الباب.'), s('Listen and repeat.', 'استمع وكرّر.'), s('Don\'t talk in class.', 'لا تتكلم في الصف.'), s('Write your name here.', 'اكتب اسمك هنا.')],
    [f('___ and repeat.', 'Listen', ['Listen', 'Listens', 'Listening'], 'استمع وكرّر.', 'الأمر يبدأ بالفعل كما هو: Listen.'), f('___ talk in class.', "Don't", ["Don't", "Not", "No"], 'لا تتكلم في الصف.', "النهي: Don't + الفعل.")],
    [g('___ your book and ___ the first page.', ['Open', 'read'], ['Opens', 'reading'], 'افتح كتابك واقرأ الصفحة الأولى.', 'في الأمر يأتي الفعل كما هو.')],
    [gr("للنهي نستخدم Don't قبل الفعل.", "Don't run in the classroom.", ['Not run in the classroom.', "Don't running in the classroom."], "Don't + الفعل كما هو: run.")]),
  L('Asking the teacher', 'سؤال المعلم', [v('question', 'سؤال', '❓'), v('answer', 'جواب', '✅'), v('again', 'مرة أخرى', '🔁'), v('understand', 'يفهم', '💡')],
    [s('Can I ask a question?', 'هل يمكن أن أسأل سؤالًا؟'), s('I don\'t understand.', 'لا أفهم.'), s('Can you say it again, please?', 'هل يمكن أن تقولها مرة أخرى من فضلك؟'), s('What does this word mean?', 'ماذا تعني هذه الكلمة؟'), s('Is my answer right?', 'هل جوابي صحيح؟')],
    [f('Can I ___ a question?', 'ask', ['ask', 'asks', 'asking'], 'هل يمكن أن أسأل سؤالًا؟', 'بعد can الفعل كما هو: ask.'), f('I don\'t ___.', 'understand', ['understand', 'understands', 'understanding'], 'لا أفهم.', "بعد don't الفعل كما هو.")],
    dialogs=[d('Teacher', [('them', 'Do you understand?', 'هل تفهم؟'), ('you', 'No. Can you say it again, please?', 'لا. هل يمكن أن تقولها مرة أخرى من فضلك؟')], ['No, I am again.', 'Yes, again me please.'], 'لطلب الإعادة: Can you say it again?')]),
]),
# ---------------------------------------------------------------- 8
U('Weather', 'الطقس', '#5ac8fa', [
  tip('It is ...', 'للطقس نبدأ بـ It: It is hot. It is raining.', ['It is sunny today.', 'It is raining now.']),
  tip('Present continuous', 'لما يحدث الآن: am/is/are + فعل ing.', ['It is raining.', 'The children are playing.']),
], [
  L('The weather', 'الطقس', [v('hot', 'حار', '🥵'), v('cold', 'بارد', '🥶'), v('sunny', 'مشمس', '☀️'), v('rain', 'مطر', '🌧️'), v('wind', 'ريح', '💨'), v('cloud', 'غيمة', '☁️')],
    [s('It is hot today.', 'الجو حار اليوم.'), s('It is cold in winter.', 'الجو بارد في الشتاء.'), s('It is sunny and warm.', 'الجو مشمس ودافئ.'), s('There are many clouds.', 'هناك غيوم كثيرة.'), s('The wind is strong.', 'الريح قوية.')],
    [f('___ is hot today.', 'It', ['It', 'He', 'This'], 'الجو حار اليوم.', 'للطقس نبدأ بـ It.'), f('It is cold ___ winter.', 'in', ['in', 'on', 'at'], 'الجو بارد في الشتاء.', 'مع الفصول نستخدم in.')]),
  L('Seasons', 'الفصول', [v('summer', 'الصيف', '🏖️'), v('winter', 'الشتاء', '❄️'), v('spring', 'الربيع', '🌸'), v('autumn', 'الخريف', '🍂'), v('season', 'فصل', '🗓️'), v('umbrella', 'مظلة', '☂️')],
    [s('Summer is very hot here.', 'الصيف حار جدًا هنا.'), s('I like spring.', 'أحب الربيع.'), s('Take an umbrella.', 'خذ مظلة.'), s('It snows in winter in some countries.', 'تثلج في الشتاء في بعض البلدان.'), s('Which season do you like?', 'أي فصل تحب؟')],
    [f('Take an ___.', 'umbrella', ['umbrella', 'summer', 'season'], 'خذ مظلة.', 'umbrella تبدأ بحرف علة، لذلك an.'), f('___ season do you like?', 'Which', ['Which', 'Who', 'Where'], 'أي فصل تحب؟', 'للاختيار بين أشياء: Which.')]),
  L('It is raining', 'إنها تمطر', [v('now', 'الآن', '⏱️'), v('raining', 'تمطر', '🌧️'), v('shining', 'تسطع', '🌞'), v('blowing', 'تهب', '🌬️')],
    [s('It is raining now.', 'إنها تمطر الآن.'), s('The sun is shining.', 'الشمس تسطع.'), s('The wind is blowing.', 'الريح تهب.'), s('The children are playing outside.', 'الأطفال يلعبون في الخارج.'), s('Are you wearing a coat?', 'هل تلبس معطفًا؟')],
    [f('It is ___ now.', 'raining', ['raining', 'rain', 'rains'], 'إنها تمطر الآن.', 'لما يحدث الآن: is + ing.'), f('The children ___ playing outside.', 'are', ['are', 'is', 'am'], 'الأطفال يلعبون في الخارج.', 'children جمع، لذلك are.')],
    [g('The sun ___ shining and the birds ___ singing.', ['is', 'are'], ['am', 'be'], 'الشمس تسطع والطيور تغرّد.', 'sun مفرد: is؛ birds جمع: are.')],
    [gr('المضارع المستمر: am/is/are + الفعل مع ing.', 'She is reading now.', ['She reading now.', 'She is read now.'], 'نحتاج is ثم reading.')]),
  L('Talking about the weather', 'الحديث عن الطقس', [v('weather', 'الطقس', '🌦️'), v('outside', 'في الخارج', '🌳'), v('warm', 'دافئ', '🌡️'), v('storm', 'عاصفة', '⛈️')],
    [s('How is the weather today?', 'كيف الطقس اليوم؟'), s('It is warm outside.', 'الجو دافئ في الخارج.'), s('There is a storm tonight.', 'هناك عاصفة الليلة.'), s('Stay at home, it is raining.', 'ابقَ في البيت، إنها تمطر.'), s('What a beautiful day!', 'ما أجمل هذا اليوم!')],
    [f('How ___ the weather today?', 'is', ['is', 'are', 'does'], 'كيف الطقس اليوم؟', 'weather مفرد، لذلك is.'), f('It is warm ___.', 'outside', ['outside', 'storm', 'weather'], 'الجو دافئ في الخارج.', 'outside تعني في الخارج.')],
    dialogs=[d('Friend', [('them', 'How is the weather in your city?', 'كيف الطقس في مدينتك؟'), ('you', 'It is hot and sunny.', 'الجو حار ومشمس.')], ['It is a city.', 'Yes, I am weather.'], 'نصف الطقس بـ It is + صفة.')]),
]),
# ---------------------------------------------------------------- 9
U('Travel', 'السفر', '#af52de', [
  tip('by bus, by train', 'لوسيلة السفر نقول by: by bus, by car, by plane. لكن on foot للمشي.', ['I go to work by bus.', 'She goes to school on foot.']),
  tip('Where is...?', 'للسؤال عن مكان: Where is the station? والجواب بـ next to, near, opposite.', ['Where is the airport?', 'The station is near the market.']),
], [
  L('Transport', 'المواصلات', [v('bus', 'حافلة', '🚌'), v('train', 'قطار', '🚆'), v('car', 'سيارة', '🚗'), v('plane', 'طائرة', '✈️'), v('boat', 'قارب', '⛵'), v('bike', 'دراجة', '🚲')],
    [s('I go to work by bus.', 'أذهب إلى العمل بالحافلة.'), s('The train is fast.', 'القطار سريع.'), s('We travel by plane.', 'نسافر بالطائرة.'), s('He rides a bike to school.', 'يركب دراجة إلى المدرسة.'), s('The boat is on the river.', 'القارب على النهر.')],
    [f('I go to work ___ bus.', 'by', ['by', 'on', 'in'], 'أذهب إلى العمل بالحافلة.', 'لوسيلة النقل نقول by.'), f('He ___ a bike to school.', 'rides', ['rides', 'ride', 'riding'], 'يركب دراجة إلى المدرسة.', 'مع he نضيف s: rides.')]),
  L('At the station', 'في المحطة', [v('ticket', 'تذكرة', '🎫'), v('station', 'محطة', '🚉'), v('airport', 'مطار', '🛫'), v('passport', 'جواز سفر', '🛂'), v('bag', 'حقيبة', '🧳'), v('seat', 'مقعد', '💺')],
    [s('One ticket to Dhaka, please.', 'تذكرة واحدة إلى دكا من فضلك.'), s('Where is the station?', 'أين المحطة؟'), s('Show me your passport, please.', 'أرني جواز سفرك من فضلك.'), s('My bag is heavy.', 'حقيبتي ثقيلة.'), s('Is this seat free?', 'هل هذا المقعد فارغ؟')],
    [f('One ___ to Dhaka, please.', 'ticket', ['ticket', 'station', 'seat'], 'تذكرة واحدة إلى دكا من فضلك.', 'ticket هي التذكرة.'), f('___ is the station?', 'Where', ['Where', 'What', 'Who'], 'أين المحطة؟', 'للمكان نسأل بـ Where.')]),
  L('Directions', 'الاتجاهات', [v('left', 'يسار', '⬅️'), v('right', 'يمين', '➡️'), v('straight', 'إلى الأمام', '⬆️'), v('near', 'قريب من', '📍')],
    [s('Go straight and turn left.', 'امشِ إلى الأمام ثم انعطف يسارًا.'), s('Turn right at the bank.', 'انعطف يمينًا عند البنك.'), s('The hotel is near the station.', 'الفندق قريب من المحطة.'), s('It is next to the mosque.', 'إنه بجانب المسجد.'), s('The bank is opposite the school.', 'البنك مقابل المدرسة.')],
    [f('Turn right ___ the bank.', 'at', ['at', 'on', 'in'], 'انعطف يمينًا عند البنك.', 'عند مكان معيّن نقول at.'), f('It is next ___ the mosque.', 'to', ['to', 'of', 'at'], 'إنه بجانب المسجد.', 'بجانب = next to.')],
    [g('Go ___ and turn ___ at the corner.', ['straight', 'left'], ['near', 'opposite'], 'امشِ إلى الأمام وانعطف يسارًا عند الزاوية.', 'straight للأمام، و left لليسار.')],
    [gr('next to تعني بجانب، و opposite تعني مقابل.', 'The bank is next to the school.', ['The bank is next the school.', 'The bank is next of the school.'], 'نقول next to دائمًا.')]),
  L('Asking for help', 'طلب المساعدة', [v('lost', 'تائه', '😕'), v('map', 'خريطة', '🗺️'), v('help', 'مساعدة', '🆘'), v('far', 'بعيد', '🛣️')],
    [s('Excuse me, I am lost.', 'عفوًا، أنا تائه.'), s('Can you help me, please?', 'هل يمكن أن تساعدني من فضلك؟'), s('Is it far from here?', 'هل هو بعيد من هنا؟'), s('Can you show me on the map?', 'هل يمكن أن تريني على الخريطة؟'), s('Thank you for your help.', 'شكرًا على مساعدتك.')],
    [f('Is it far ___ here?', 'from', ['from', 'to', 'of'], 'هل هو بعيد من هنا؟', 'نقول far from.'), f('Can you ___ me, please?', 'help', ['help', 'helps', 'helping'], 'هل يمكن أن تساعدني من فضلك؟', 'بعد can الفعل كما هو.')],
    dialogs=[d('Stranger', [('you', 'Excuse me, where is the airport?', 'عفوًا، أين المطار؟'), ('them', 'Take the bus. It is far from here.', 'اركب الحافلة. إنه بعيد من هنا.'), ('you', 'Thank you very much.', 'شكرًا جزيلًا.')], ['I am the airport.', 'Yes, the bus me.']),
             d('Officer', [('them', 'Can I see your passport, please?', 'هل يمكن أن أرى جواز سفرك من فضلك؟'), ('you', 'Yes, here it is.', 'نعم، تفضّل.')], ['Yes, I am passport.', 'No, here are me.'])]),
]),
# ---------------------------------------------------------------- 10
U('On the Phone', 'على الهاتف', '#30b0c7', [
  tip('Phone phrases', 'على الهاتف نقول: This is ... (أنا ...). ولطلب شخص: Can I speak to ...?', ['Hello, this is Ahmad.', 'Can I speak to Sara, please?']),
  tip('will for offers', 'للعرض أو الوعد السريع نستخدم will: I will call you later.', ['I will call you back.', 'I will send a message.']),
], [
  L('Calling', 'الاتصال', [v('phone', 'هاتف', '📱'), v('call', 'يتصل', '📞'), v('message', 'رسالة', '💬'), v('number', 'رقم', '🔢'), v('answer', 'يرد', '✅'), v('busy', 'مشغول', '⛔')],
    [s('Please call me tonight.', 'من فضلك اتصل بي الليلة.'), s('What is your phone number?', 'ما رقم هاتفك؟'), s('I sent you a message.', 'أرسلت لك رسالة.'), s('She doesn\'t answer the phone.', 'لا ترد على الهاتف.'), s('The line is busy.', 'الخط مشغول.')],
    [f('What is your phone ___?', 'number', ['number', 'call', 'message'], 'ما رقم هاتفك؟', 'number هو الرقم.'), f('She doesn\'t ___ the phone.', 'answer', ['answer', 'answers', 'answering'], 'لا ترد على الهاتف.', "بعد doesn't الفعل كما هو.")]),
  L('Who is calling?', 'من المتصل؟', [v('hello', 'ألو/مرحبًا', '👋'), v('speak', 'يتكلم', '🗣️'), v('wait', 'ينتظر', '⏳'), v('later', 'لاحقًا', '🕒'), v('sorry', 'آسف', '🙏'), v('wrong', 'خطأ', '❌')],
    [s('Hello, this is Ahmad.', 'ألو، معك أحمد.'), s('Can I speak to Sara, please?', 'هل يمكن أن أتكلم مع سارة من فضلك؟'), s('Please wait a minute.', 'انتظر دقيقة من فضلك.'), s('Sorry, wrong number.', 'آسف، رقم خطأ.'), s('I will call you later.', 'سأتصل بك لاحقًا.')],
    [f('Can I ___ to Sara, please?', 'speak', ['speak', 'speaks', 'speaking'], 'هل يمكن أن أتكلم مع سارة من فضلك؟', 'بعد can الفعل كما هو.'), f('Sorry, ___ number.', 'wrong', ['wrong', 'busy', 'later'], 'آسف، رقم خطأ.', 'wrong number = رقم خطأ.')]),
  L('I will call you', 'سأتصل بك', [v('will', 'سوف', '🔜'), v('send', 'يرسل', '📤'), v('back', 'مجددًا/بالمقابل', '↩️'), v('soon', 'قريبًا', '⏩')],
    [s('I will call you back.', 'سأعاود الاتصال بك.'), s('She will send a message.', 'سترسل رسالة.'), s('We will meet soon.', 'سنلتقي قريبًا.'), s('Will you come tomorrow?', 'هل ستأتي غدًا؟'), s('I won\'t be late.', 'لن أتأخر.')],
    [f('I ___ call you back.', 'will', ['will', 'am', 'do'], 'سأعاود الاتصال بك.', 'للوعد نستخدم will.'), f('She will ___ a message.', 'send', ['send', 'sends', 'sending'], 'سترسل رسالة.', 'بعد will الفعل كما هو.')],
    [g('I ___ call you and I ___ be late.', ['will', "won't"], ['am', 'does'], 'سأتصل بك ولن أتأخر.', "will للمستقبل، و won't للنفي.")],
    [gr('بعد will يأتي الفعل كما هو.', 'He will come tomorrow.', ['He will comes tomorrow.', 'He will coming tomorrow.'], 'will + come، بدون s أو ing.')]),
  L('Phone conversations', 'مكالمات', [v('free', 'متفرغ', '🙌'), v('meeting', 'اجتماع', '👥'), v('tonight', 'الليلة', '🌙'), v('text', 'يراسل', '✉️')],
    [s('Are you free tonight?', 'هل أنت متفرغ الليلة؟'), s('I am in a meeting now.', 'أنا في اجتماع الآن.'), s('Text me the address.', 'أرسل لي العنوان برسالة.'), s('Can you hear me?', 'هل تسمعني؟'), s('Talk to you soon.', 'أكلمك قريبًا.')],
    [f('Can you ___ me?', 'hear', ['hear', 'hears', 'hearing'], 'هل تسمعني؟', 'بعد can الفعل كما هو.'), f('I am in a ___ now.', 'meeting', ['meeting', 'tonight', 'free'], 'أنا في اجتماع الآن.', 'meeting هو الاجتماع.')],
    dialogs=[d('Sara', [('them', 'Hello, can I speak to Ahmad?', 'ألو، هل يمكن أن أتكلم مع أحمد؟'), ('you', 'Sorry, he is not here. I will tell him.', 'آسف، ليس هنا. سأخبره.')], ['Sorry, I am Ahmad not.', 'Yes, he is a phone.'], 'للاعتذار والوعد: Sorry ... I will ...'),
             d('Boss', [('them', 'Can you call me back later?', 'هل يمكن أن تعاود الاتصال بي لاحقًا؟'), ('you', 'Yes, I will call you at four.', 'نعم، سأتصل بك في الرابعة.')], ['Yes, I call will four.', 'No, four is me.'])]),
]),
# ---------------------------------------------------------------- 11
U('At the Doctor', 'عند الطبيب', '#ff3b30', [
  tip('I have a ...', 'لوصف المرض: I have a headache / a fever / a cough. ومع he/she: has.', ['I have a headache.', 'She has a fever.']),
  tip('should', 'للنصيحة: should + الفعل: You should rest.', ['You should drink water.', 'You should see a doctor.']),
], [
  L('My body', 'جسمي', [v('head', 'رأس', '🙂'), v('stomach', 'بطن/معدة', '🫃'), v('back', 'ظهر', '🧍'), v('arm', 'ذراع', '💪'), v('leg', 'رِجل', '🦵'), v('eye', 'عين', '👁️')],
    [s('My head hurts.', 'رأسي يؤلمني.'), s('My back hurts after work.', 'ظهري يؤلمني بعد العمل.'), s('I hurt my arm.', 'آذيت ذراعي.'), s('He has a pain in his leg.', 'عنده ألم في رجله.'), s('My eyes are tired.', 'عيناي متعبتان.')],
    [f('My head ___.', 'hurts', ['hurts', 'hurt', 'hurting'], 'رأسي يؤلمني.', 'head مفرد (it)، لذلك hurts.'), f('My eyes ___ tired.', 'are', ['are', 'is', 'am'], 'عيناي متعبتان.', 'eyes جمع، لذلك are.')]),
  L('Feeling ill', 'الشعور بالمرض', [v('headache', 'صداع', '🤕'), v('fever', 'حمّى', '🤒'), v('cough', 'سعال', '😷'), v('cold', 'زكام', '🤧'), v('medicine', 'دواء', '💊'), v('pharmacy', 'صيدلية', '🏥')],
    [s('I have a headache.', 'عندي صداع.'), s('She has a fever.', 'عندها حمّى.'), s('He has a bad cough.', 'عنده سعال شديد.'), s('Take this medicine twice a day.', 'خذ هذا الدواء مرتين في اليوم.'), s('Where is the pharmacy?', 'أين الصيدلية؟')],
    [f('She ___ a fever.', 'has', ['has', 'have', 'is'], 'عندها حمّى.', 'مع she نستخدم has.'), f('Take this medicine ___ a day.', 'twice', ['twice', 'two', 'second'], 'خذ هذا الدواء مرتين في اليوم.', 'مرتين = twice.')]),
  L('Advice', 'النصيحة', [v('should', 'ينبغي', '👉'), v('rest', 'يرتاح', '🛌'), v('water', 'ماء', '💧'), v('healthy', 'صحي', '🥗')],
    [s('You should rest.', 'ينبغي أن ترتاح.'), s('You should drink more water.', 'ينبغي أن تشرب ماءً أكثر.'), s('You shouldn\'t eat too much sugar.', 'لا ينبغي أن تأكل سكرًا كثيرًا.'), s('Eat healthy food.', 'كُل طعامًا صحيًا.'), s('You should see a doctor.', 'ينبغي أن ترى طبيبًا.')],
    [f('You ___ rest.', 'should', ['should', 'are', 'has'], 'ينبغي أن ترتاح.', 'للنصيحة: should.'), f('You should ___ more water.', 'drink', ['drink', 'drinks', 'to drink'], 'ينبغي أن تشرب ماءً أكثر.', 'بعد should الفعل كما هو.')],
    [g('You have a cold. You ___ stay home and you ___ go out.', ['should', "shouldn't"], ['are', 'has'], 'عندك زكام. ينبغي أن تبقى في البيت ولا ينبغي أن تخرج.', "should للنصيحة، و shouldn't للنهي.")],
    [gr('بعد should يأتي الفعل كما هو بدون to.', 'You should see a doctor.', ['You should to see a doctor.', 'You should sees a doctor.'], 'should + see مباشرة.')]),
  L('At the clinic', 'في العيادة', [v('appointment', 'موعد', '📅'), v('doctor', 'طبيب', '👨‍⚕️'), v('better', 'أفضل', '🙂'), v('worse', 'أسوأ', '🙁')],
    [s('I have an appointment at ten.', 'عندي موعد في العاشرة.'), s('What is the matter?', 'ما المشكلة؟'), s('I feel worse today.', 'أشعر أنني أسوأ اليوم.'), s('I feel better now.', 'أشعر أنني أفضل الآن.'), s('How long have you had the fever?', 'منذ متى عندك الحمّى؟')],
    [f('I have an ___ at ten.', 'appointment', ['appointment', 'doctor', 'better'], 'عندي موعد في العاشرة.', 'appointment هو الموعد.'), f('I feel ___ now.', 'better', ['better', 'good than', 'more good'], 'أشعر أنني أفضل الآن.', 'مقارنة good هي better.')],
    dialogs=[d('Doctor', [('them', 'What is the matter?', 'ما المشكلة؟'), ('you', 'I have a headache and a fever.', 'عندي صداع وحمّى.'), ('them', 'You should rest and drink water.', 'ينبغي أن ترتاح وتشرب الماء.'), ('you', 'Thank you, doctor.', 'شكرًا يا دكتور.')], ['I am a headache.', 'Yes, I should doctor.']),
             d('Pharmacist', [('them', 'Take this twice a day.', 'خذ هذا مرتين في اليوم.'), ('you', 'Before or after food?', 'قبل الأكل أم بعده؟')], ['Yes, I am twice.', 'Food is a day.'])]),
]),
]

data = {'language': {'code': 'ar', 'name': 'Arabic', 'native': 'العربية', 'dir': 'rtl'}, 'units': units}
json.dump(data, open(sys.argv[1], 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print(len(units), 'units', sum(len(u['lessons']) for u in units), 'lessons')
