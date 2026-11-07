# Builds content/ar-starter-more.json: lessons 3 (grammar) and 4 (conversation) for the Arabic starter's units
# 1–3, so they are complete like every unit (docs/SYLLABUS.md). Imported with admin → ভাষা → আরবি → JSON থেকে
# যোগ করো: units with the same title get the lessons added (server/importLanguage.ts importMore).
#   python content/build/ar_starter_more.py content/ar-starter-more.json
import json, sys

def v(en, ar, emoji=''): return {'en': en, 'bn': ar, 'emoji': emoji}
def s(en, ar, *alt): return {'en': en, 'bn': ar, 'alt': list(alt)}
def f(text, answer, options, ar, why): return {'text': text, 'answer': answer, 'options': options, 'bn': ar, 'why': why}
def g(text, answers, extra, ar, why): return {'text': text, 'answers': answers, 'extra': extra, 'bn': ar, 'why': why}
def gr(rule, correct, wrong, why): return {'rule': rule, 'correct': correct, 'wrong': wrong, 'why': why}
def d(who, lines, wrong): return {'with': who, 'lines': [{'who': w, 'en': e, 'bn': b} for w, e, b in lines], 'wrong': wrong}
def L(title, ar, vocab, sentences, fills, gaps=(), grammar=(), dialogs=()):
    return {'title': title, 'titleBn': ar, 'vocab': vocab, 'sentences': sentences, 'fills': fills, 'gaps': list(gaps), 'grammar': list(grammar), 'dialogs': list(dialogs)}
def U(title, ar, color, lessons): return {'title': title, 'titleBn': ar, 'color': color, 'tips': [], 'lessons': lessons}

units = [
U('First Steps', 'الخطوات الأولى', '#34c759', [
  L('I am, you are', 'أنا، أنت', [v('I', 'أنا', '🙋'), v('you', 'أنت', '👉'), v('he', 'هو', '👦'), v('she', 'هي', '👧')],
    [s('I am a student.', 'أنا طالب.'), s('You are my friend.', 'أنت صديقي.'), s('He is a teacher.', 'هو معلم.'), s('She is from Egypt.', 'هي من مصر.'), s('We are happy.', 'نحن سعداء.')],
    [f('I ___ a student.', 'am', ['am', 'is', 'are'], 'أنا طالب.', 'مع I نستخدم am.'), f('She ___ from Egypt.', 'is', ['is', 'am', 'are'], 'هي من مصر.', 'مع she نستخدم is.')],
    [g('I ___ Ali and you ___ Sara.', ['am', 'are'], ['is', 'be'], 'أنا علي وأنت سارة.', 'I + am، و you + are.')],
    [gr('am مع I، و is مع he/she/it، و are مع you/we/they.', 'They are students.', ['They is students.', 'They am students.'], 'they + are.')]),
  L('Nice to meet you', 'تشرفت بمعرفتك', [v('meet', 'يقابل', '🤝'), v('nice', 'لطيف', '😊'), v('name', 'اسم', '🏷️'), v('where', 'أين', '📍')],
    [s('What is your name?', 'ما اسمك؟'), s('My name is Omar.', 'اسمي عمر.'), s('Nice to meet you.', 'تشرفت بمعرفتك.'), s('Where are you from?', 'من أين أنت؟'), s('I am from Morocco.', 'أنا من المغرب.')],
    [f('What is your ___?', 'name', ['name', 'meet', 'nice'], 'ما اسمك؟', 'name هو الاسم.'), f('Where are you ___?', 'from', ['from', 'to', 'at'], 'من أين أنت؟', 'للبلد نسأل: Where are you from?')],
    dialogs=[d('Lina', [('them', 'Hi, my name is Lina. What is your name?', 'مرحبًا، اسمي لينا. ما اسمك؟'), ('you', 'My name is Omar. Nice to meet you.', 'اسمي عمر. تشرفت بمعرفتك.')], ['I am name Omar.', 'Yes, nice is me.'])]),
]),
U('Family', 'العائلة', '#af52de', [
  L('My, your, his, her', 'ـي، ـك، ـه، ـها', [v('my', 'ـي (لي)', '🙋'), v('your', 'ـك (لك)', '👉'), v('his', 'ـه (له)', '👦'), v('her', 'ـها (لها)', '👧')],
    [s('This is my mother.', 'هذه أمي.'), s('Is this your brother?', 'هل هذا أخوك؟'), s('His name is Karim.', 'اسمه كريم.'), s('Her sister is ten.', 'أختها عمرها عشر سنوات.'), s('Our house is small.', 'بيتنا صغير.')],
    [f('___ name is Karim.', 'His', ['His', 'He', 'Him'], 'اسمه كريم.', 'للملكية مع he نستخدم his.'), f('This is ___ mother.', 'my', ['my', 'I', 'me'], 'هذه أمي.', 'للملكية مع I نستخدم my.')],
    [g('___ father is a doctor and ___ mother is a teacher.', ['My', 'my'], ['I', 'me'], 'أبي طبيب وأمي معلمة.', 'my قبل الاسم للملكية.')],
    [gr('his للمذكر و her للمؤنث.', 'Sara loves her brother.', ['Sara loves his brother.', 'Sara loves she brother.'], 'Sara مؤنث، لذلك her.')]),
  L('Talking about family', 'الحديث عن العائلة', [v('have', 'يملك/عنده', '🤲'), v('married', 'متزوج', '💍'), v('children', 'أطفال', '👧'), v('cousin', 'ابن/ابنة العم', '👫')],
    [s('Do you have brothers?', 'هل عندك إخوة؟'), s('I have one sister.', 'عندي أخت واحدة.'), s('My brother is married.', 'أخي متزوج.'), s('They have two children.', 'عندهم طفلان.'), s('My cousin lives in Cairo.', 'ابن عمي يعيش في القاهرة.')],
    [f('Do you ___ brothers?', 'have', ['have', 'has', 'having'], 'هل عندك إخوة؟', 'مع you نستخدم have.'), f('They have two ___.', 'children', ['children', 'child', 'childs'], 'عندهم طفلان.', 'جمع child هو children.')],
    dialogs=[d('Friend', [('them', 'Do you have brothers or sisters?', 'هل عندك إخوة أو أخوات؟'), ('you', 'Yes, I have one brother and two sisters.', 'نعم، عندي أخ واحد وأختان.')], ['Yes, I am one brother.', 'No, sisters is me.'])]),
]),
U('Food & Drink', 'الطعام والشراب', '#ff9500', [
  L('I like, I don\'t like', 'أحب، لا أحب', [v('like', 'يحب', '👍'), v('love', 'يعشق', '❤️'), v('hate', 'يكره', '👎'), v('sweet', 'حلو', '🍬')],
    [s('I like apples.', 'أحب التفاح.'), s('I don\'t like coffee.', 'لا أحب القهوة.'), s('She loves sweet food.', 'تحب الطعام الحلو كثيرًا.'), s('Do you like fish?', 'هل تحب السمك؟'), s('He doesn\'t like milk.', 'لا يحب الحليب.')],
    [f("I ___ like coffee.", "don't", ["don't", "doesn't", "not"], 'لا أحب القهوة.', "مع I نستخدم don't للنفي."), f("He ___ like milk.", "doesn't", ["doesn't", "don't", "isn't"], 'لا يحب الحليب.', "مع he نستخدم doesn't.")],
    [g('I ___ tea but my sister ___ like it.', ['like', "doesn't"], ['likes', "don't"], 'أحب الشاي لكن أختي لا تحبه.', "I + like، و she + doesn't.")],
    [gr("بعد don't و doesn't يأتي الفعل كما هو.", "She doesn't like rice.", ["She doesn't likes rice.", "She don't like rice."], "doesn't + like.")]),
  L('Ordering food', 'طلب الطعام', [v('order', 'يطلب', '📝'), v('bill', 'الفاتورة', '🧾'), v('water', 'ماء', '💧'), v('chicken', 'دجاج', '🍗')],
    [s('Can I see the menu, please?', 'هل يمكن أن أرى القائمة من فضلك؟'), s('I would like chicken and rice.', 'أريد دجاجًا وأرزًا.'), s('A glass of water, please.', 'كوب ماء من فضلك.'), s('The food is delicious.', 'الطعام لذيذ.'), s('Can I have the bill, please?', 'هل يمكن أن أحصل على الفاتورة من فضلك؟')],
    [f('I would ___ chicken and rice.', 'like', ['like', 'likes', 'liking'], 'أريد دجاجًا وأرزًا.', 'للطلب بأدب: I would like.'), f('Can I have the ___, please?', 'bill', ['bill', 'water', 'order'], 'هل يمكن أن أحصل على الفاتورة من فضلك؟', 'bill هي الفاتورة.')],
    dialogs=[d('Waiter', [('them', 'What would you like?', 'ماذا تريد؟'), ('you', 'I would like chicken and rice, please.', 'أريد دجاجًا وأرزًا من فضلك.'), ('them', 'Anything to drink?', 'أي شيء للشرب؟'), ('you', 'A glass of water, please.', 'كوب ماء من فضلك.')], ['I am a water.', 'Yes, drink is me.'])]),
]),
]

json.dump({'units': units}, open(sys.argv[1], 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print(len(units), 'units', sum(len(u['lessons']) for u in units), 'lessons')
