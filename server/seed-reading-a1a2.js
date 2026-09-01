// 20 original A1-A2 Kazakh reading texts, textbook style (built tightly
// from the user's own active/mastered deck vocabulary, per CLAUDE.md's
// "Стратегия обучения" -- minimal new words, marked separately). All
// original writing, no external source. Fills a real gap: before this,
// kz reading had 0 A1 texts and 1 A2 text total.
import { db } from './db/index.js';

const TEXTS = [
  {
    slug: 'kz-a1-menin-otbasym',
    title: 'Менің отбасым',
    theme: 'семья',
    level: 'A1',
    style: 'textbook',
    body: `Менің есімім — Айгүл. Менің отбасым үлкен емес. Менің әкем дәрігер, ал шешем мұғалім. Менің бір ағам бар, оның есімі — Ерлан. Біз бірге тұрамыз. Мен отбасымды жақсы көремін.`,
    new_words: [
      { term: 'отбасы', translation_ru: 'семья' },
      { term: 'бірге', translation_ru: 'вместе' },
      { term: 'тұру', translation_ru: 'жить' },
      { term: 'жақсы көру', translation_ru: 'любить' }
    ],
    exercises: [
      { prompt: 'Айгүлдің әкесі кім?', correct_answer: 'Дәрігер', distractors: ['Мұғалім', 'Инженер', 'Аспаз'] },
      { prompt: 'Ерлан кім?', correct_answer: 'Айгүлдің ағасы', distractors: ['Айгүлдің әкесі', 'Айгүлдің көршісі', 'Айгүлдің досы'] }
    ]
  },
  {
    slug: 'kz-a1-menin-uyim',
    title: 'Менің үйім',
    theme: 'дом',
    level: 'A1',
    style: 'textbook',
    body: `Менің үйім үлкен емес, бірақ жылы. Үйде үш бөлме бар: ас үй, жатын бөлме және қонақ бөлме. Ас үйде үстел мен орындықтар тұр. Жатын бөлмеде диван бар. Терезеден көше көрінеді.`,
    new_words: [
      { term: 'жатын бөлме', translation_ru: 'спальня' },
      { term: 'қонақ бөлме', translation_ru: 'гостиная' },
      { term: 'көріну', translation_ru: 'быть видным' }
    ],
    exercises: [
      { prompt: 'Үйде неше бөлме бар?', correct_answer: 'Үш', distractors: ['Екі', 'Төрт', 'Бес'] },
      { prompt: 'Ас үйде не тұр?', correct_answer: 'Үстел мен орындықтар', distractors: ['Диван', 'Терезе', 'Шкаф'] }
    ]
  },
  {
    slug: 'kz-a1-tangy-as',
    title: 'Таңғы асым',
    theme: 'еда',
    level: 'A1',
    style: 'textbook',
    body: `Мен сағат жетіде тұрамын. Таңертең мен нан, ірімшік және шай ішемін. Кейде мен банан жеймін. Менің анам кофе ішеді, ал әкем шай ішеді. Таңғы ас өте дәмді.`,
    new_words: [{ term: 'таңғы ас', translation_ru: 'завтрак' }, { term: 'кейде', translation_ru: 'иногда' }],
    exercises: [
      { prompt: 'Ол сағат нешеде тұрады?', correct_answer: 'Жетіде', distractors: ['Алтыда', 'Сегізде', 'Тоғызда'] },
      { prompt: 'Анасы не ішеді?', correct_answer: 'Кофе', distractors: ['Шай', 'Су', 'Сүт'] }
    ]
  },
  {
    slug: 'kz-a1-dukende',
    title: 'Дүкенде',
    theme: 'покупки и деньги',
    level: 'A1',
    style: 'textbook',
    body: `Бүгін мен дүкенге бардым. Мен нан, сүт және алма сатып алдым. Дүкенде адам көп болды. Кассир мейірімді еді. Мен ақша төледім де, үйге қайттым.`,
    new_words: [
      { term: 'сатып алу', translation_ru: 'покупать' },
      { term: 'ақша', translation_ru: 'деньги' },
      { term: 'төлеу', translation_ru: 'платить' }
    ],
    exercises: [
      { prompt: 'Ол дүкенде не сатып алды?', correct_answer: 'Нан, сүт және алма', distractors: ['Тек нан', 'Кофе мен шай', 'Киім'] },
      { prompt: 'Дүкенде адам көп пе, аз ба?', correct_answer: 'Көп', distractors: ['Аз', 'Ешкім жоқ', 'Белгісіз'] }
    ]
  },
  {
    slug: 'kz-a1-ava-rayy',
    title: 'Бүгінгі ауа райы',
    theme: 'погода',
    level: 'A1',
    style: 'textbook',
    body: `Бүгін ауа райы суық. Аспанда бұлт көп, жел соғып тұр. Кеше жаңбыр жауды, ал бүгін қар жауып тұр. Мен жылы киім кидім. Ертең ауа райы жылы болады деп ойлаймын.`,
    new_words: [{ term: 'аспан', translation_ru: 'небо' }, { term: 'соғу', translation_ru: 'дуть (о ветре)' }, { term: 'ойлау', translation_ru: 'думать' }],
    exercises: [
      { prompt: 'Кеше не болды?', correct_answer: 'Жаңбыр жауды', distractors: ['Қар жауды', 'Күн шықты', 'Жел болмады'] },
      { prompt: 'Бүгін ауа райы қандай?', correct_answer: 'Суық', distractors: ['Ыстық', 'Жылы', 'Құрғақ'] }
    ]
  },
  {
    slug: 'kz-a1-menin-dosym',
    title: 'Менің досым',
    theme: 'человек и общение',
    level: 'A1',
    style: 'textbook',
    body: `Менің досымның есімі — Нұрлан. Ол орта бойлы, көзі қара. Нұрлан менің көршім. Біз әр күні кездесеміз. Ол күлкілі және мейірімді. Мен онымен сөйлескенді жақсы көремін.`,
    new_words: [{ term: 'дос', translation_ru: 'друг' }, { term: 'кездесу', translation_ru: 'встречаться' }, { term: 'күлкілі', translation_ru: 'весёлый, смешной' }],
    exercises: [
      { prompt: 'Нұрлан кім?', correct_answer: 'Айтушының досы және көршісі', distractors: ['Айтушының ағасы', 'Мұғалім', 'Дәрігер'] },
      { prompt: 'Олар қаншалықты жиі кездеседі?', correct_answer: 'Әр күні', distractors: ['Аптасына бір рет', 'Жылына бір рет', 'Ешқашан'] }
    ]
  },
  {
    slug: 'kz-a1-mektepte',
    title: 'Мектепте',
    theme: 'профессии',
    level: 'A1',
    style: 'textbook',
    body: `Менің қарындасым оқушы. Ол мектепке сағат сегізде барады. Мұғалімі өте жақсы адам. Сабақ алтыда аяқталады. Кешке ол үй тапсырмасын жасайды.`,
    new_words: [{ term: 'сабақ', translation_ru: 'урок' }, { term: 'аяқталу', translation_ru: 'заканчиваться' }, { term: 'үй тапсырмасы', translation_ru: 'домашнее задание' }],
    exercises: [
      { prompt: 'Қарындасы кім?', correct_answer: 'Оқушы', distractors: ['Мұғалім', 'Дәрігер', 'Студент'] },
      { prompt: 'Сабақ нешеде аяқталады?', correct_answer: 'Алтыда', distractors: ['Сегізде', 'Жетіде', 'Тоғызда'] }
    ]
  },
  {
    slug: 'kz-a1-darigerde',
    title: 'Дәрігерде',
    theme: 'здоровье',
    level: 'A1',
    style: 'textbook',
    body: `Кеше менің басым ауырды. Мен дәрігерге бардым. Дәрігер маған дәрі берді. Бүгін мен өзімді жақсы сезінемін. Ауырғанда демалу керек.`,
    new_words: [{ term: 'демалу', translation_ru: 'отдыхать' }, { term: 'керек', translation_ru: 'нужно' }, { term: 'сезіну', translation_ru: 'чувствовать' }],
    exercises: [
      { prompt: 'Не ауырды?', correct_answer: 'Бас', distractors: ['Тіс', 'Іш', 'Қол'] },
      { prompt: 'Дәрігер оған не берді?', correct_answer: 'Дәрі', distractors: ['Ақша', 'Кітап', 'Су'] }
    ]
  },
  {
    slug: 'kz-a1-demalys-kuni',
    title: 'Демалыс күні',
    theme: 'эмоции',
    level: 'A1',
    style: 'textbook',
    body: `Сенбі — демалыс күні. Мен ұзақ ұйықтадым, сосын саябаққа бардым. Күн шықты, ауа райы жылы болды. Мен қуанышты едім. Кешке достарыммен кездестім.`,
    new_words: [{ term: 'ұйықтау', translation_ru: 'спать' }, { term: 'саябақ', translation_ru: 'парк' }, { term: 'сосын', translation_ru: 'потом' }],
    exercises: [
      { prompt: 'Ол қайда барды?', correct_answer: 'Саябаққа', distractors: ['Дүкенге', 'Мектепке', 'Ауруханаға'] },
      { prompt: 'Ол өзін қалай сезінді?', correct_answer: 'Қуанышты', distractors: ['Ашулы', 'Шаршаған', 'Қорқақ'] }
    ]
  },
  {
    slug: 'kz-a1-sayahat',
    title: 'Саяхатқа дайындық',
    theme: 'путешествия',
    level: 'A2',
    style: 'textbook',
    body: `Ертең мен саяхатқа шығамын. Мен сөмкеме киім, паспорт және билет салдым. Ұшақ сағат тоғызда ұшады. Әуежайға ерте бару керек. Мен бұл саяхатты асыға күтемін.`,
    new_words: [{ term: 'дайындық', translation_ru: 'подготовка' }, { term: 'салу', translation_ru: 'класть' }, { term: 'асыға күту', translation_ru: 'с нетерпением ждать' }],
    exercises: [
      { prompt: 'Ұшақ нешеде ұшады?', correct_answer: 'Тоғызда', distractors: ['Алтыда', 'Жетіде', 'Онда'] },
      { prompt: 'Сөмкеге не салынды?', correct_answer: 'Киім, паспорт және билет', distractors: ['Тек ақша', 'Кітаптар', 'Дәрі'] }
    ]
  },
  {
    slug: 'kz-a1-uy-zhanuary',
    title: 'Менің мысығым',
    theme: 'природа',
    level: 'A1',
    style: 'textbook',
    body: `Менің үйімде мысық бар. Оның аты — Мұрзик. Ол ақ түсті. Мұрзик күн сайын сүт ішеді. Кешке ол диванда ұйықтайды. Мен оны жақсы көремін.`,
    new_words: [{ term: 'түс', translation_ru: 'цвет' }, { term: 'ақ', translation_ru: 'белый' }],
    exercises: [
      { prompt: 'Мысықтың түсі қандай?', correct_answer: 'Ақ', distractors: ['Қара', 'Сары', 'Қызыл'] },
      { prompt: 'Мысық кешке қайда ұйықтайды?', correct_answer: 'Диванда', distractors: ['Терезеде', 'Ас үйде', 'Балконда'] }
    ]
  },
  {
    slug: 'kz-a1-kiim-dukeninde',
    title: 'Киім дүкенінде',
    theme: 'одежда',
    level: 'A2',
    style: 'textbook',
    body: `Маған жаңа күртеше керек болды. Мен киім дүкеніне бардым. Онда көйлектер, шалбарлар және аяқ киім көп болды. Мен қара түсті күртеше таңдадым. Ол маған жарасты.`,
    new_words: [{ term: 'жаңа', translation_ru: 'новый' }, { term: 'таңдау', translation_ru: 'выбирать' }, { term: 'жарасу', translation_ru: 'идти, быть к лицу' }],
    exercises: [
      { prompt: 'Ол не сатып алды?', correct_answer: 'Күртеше', distractors: ['Көйлек', 'Шалбар', 'Аяқ киім'] },
      { prompt: 'Күртешенің түсі қандай?', correct_answer: 'Қара', distractors: ['Ақ', 'Сары', 'Көк'] }
    ]
  },
  {
    slug: 'kz-a1-apta-kunderi',
    title: 'Менің аптам',
    theme: 'дни недели и месяцы',
    level: 'A1',
    style: 'textbook',
    body: `Дүйсенбіден жұмаға дейін мен жұмыс істеймін. Сенбі мен жексенбі — демалыс күндері. Сәрсенбіде мен спортпен айналысамын. Жұма күні достарыммен кездесемін. Апта тез өтеді.`,
    new_words: [{ term: 'жұмыс істеу', translation_ru: 'работать' }, { term: 'спортпен айналысу', translation_ru: 'заниматься спортом' }, { term: 'тез', translation_ru: 'быстро' }],
    exercises: [
      { prompt: 'Демалыс күндері қандай?', correct_answer: 'Сенбі мен жексенбі', distractors: ['Дүйсенбі мен сейсенбі', 'Жұма мен сенбі', 'Тек жексенбі'] },
      { prompt: 'Сәрсенбіде ол не істейді?', correct_answer: 'Спортпен айналысады', distractors: ['Жұмыс істейді', 'Ұйықтайды', 'Саяхаттайды'] }
    ]
  },
  {
    slug: 'kz-a1-auyrdym',
    title: 'Мен ауырдым',
    theme: 'здоровье',
    level: 'A2',
    style: 'textbook',
    body: `Кеше кешке менің денем қызды. Түнде мен нашар ұйықтадым. Таңертең анама айттым, ол мені дәрігерге апарды. Дәрігер мені тексерді де, дәрі жазып берді. Үш күннен кейін мен сауығып кеттім.`,
    new_words: [{ term: 'апару', translation_ru: 'отвести, отвезти' }, { term: 'тексеру', translation_ru: 'осматривать, проверять' }, { term: 'сауығу', translation_ru: 'выздороветь' }],
    exercises: [
      { prompt: 'Анасы оны кімге апарды?', correct_answer: 'Дәрігерге', distractors: ['Мұғалімге', 'Көршіге', 'Достарына'] },
      { prompt: 'Ол қашан сауығып кетті?', correct_answer: 'Үш күннен кейін', distractors: ['Бір күннен кейін', 'Апта өткен соң', 'Дереу'] }
    ]
  },
  {
    slug: 'kz-a1-konakka-keldi',
    title: 'Достар қонаққа келді',
    theme: 'семья',
    level: 'A2',
    style: 'textbook',
    body: `Бүгін кешке біздің үйге достарымыз қонаққа келді. Анам дәмді ас дайындады: ет, нан және шай. Біз бірге отырып, көп сөйлестік. Балалар ойнады, ересектер әңгімелесті. Кеш өте қызықты өтті.`,
    new_words: [{ term: 'қонақ', translation_ru: 'гость' }, { term: 'дайындау', translation_ru: 'готовить' }, { term: 'ересек', translation_ru: 'взрослый' }, { term: 'әңгімелесу', translation_ru: 'беседовать' }],
    exercises: [
      { prompt: 'Анасы не дайындады?', correct_answer: 'Ет, нан және шай', distractors: ['Тек шай', 'Балық', 'Кофе'] },
      { prompt: 'Балалар не істеді?', correct_answer: 'Ойнады', distractors: ['Ұйықтады', 'Жұмыс істеді', 'Оқыды'] }
    ]
  },
  {
    slug: 'kz-a1-zhaz-demalysy',
    title: 'Жаз демалысы',
    theme: 'погода',
    level: 'A2',
    style: 'textbook',
    body: `Жазда ауа райы ыстық болады. Мен теңізге барғанды жақсы көремін. Биыл біз отбасымызбен теңізге бардық. Күн күркіреп, кейде жаңбыр жауды, бірақ көбіне ауа райы жылы болды. Бұл тамаша демалыс еді.`,
    new_words: [{ term: 'теңіз', translation_ru: 'море' }, { term: 'биыл', translation_ru: 'в этом году' }, { term: 'көбіне', translation_ru: 'в основном, чаще всего' }],
    exercises: [
      { prompt: 'Олар қайда барды?', correct_answer: 'Теңізге', distractors: ['Тауға', 'Ормаға', 'Қалаға'] },
      { prompt: 'Ауа райы қандай болды?', correct_answer: 'Көбіне жылы', distractors: ['Үнемі суық', 'Тек жаңбырлы', 'Аязды'] }
    ]
  },
  {
    slug: 'kz-a1-menin-zhumysym',
    title: 'Менің жұмысым',
    theme: 'профессии',
    level: 'A2',
    style: 'textbook',
    body: `Мен инженер болып жұмыс істеймін. Жұмысым қызықты, бірақ кейде қиын. Күн сайын мен сағат тоғызда жұмысқа барамын. Менің әріптестерім мейірімді. Кешке үйге қайтамын да, отбасыммен уақыт өткіземін.`,
    new_words: [{ term: 'әріптес', translation_ru: 'коллега' }, { term: 'қиын', translation_ru: 'трудный' }, { term: 'уақыт өткізу', translation_ru: 'проводить время' }],
    exercises: [
      { prompt: 'Ол кім болып жұмыс істейді?', correct_answer: 'Инженер', distractors: ['Дәрігер', 'Мұғалім', 'Аспаз'] },
      { prompt: 'Ол жұмысқа нешеде барады?', correct_answer: 'Тоғызда', distractors: ['Жетіде', 'Сегізде', 'Онда'] }
    ]
  },
  {
    slug: 'kz-a1-telefon-internet',
    title: 'Телефон және интернет',
    theme: 'технологии и интернет',
    level: 'A2',
    style: 'textbook',
    body: `Менің жаңа телефоным бар. Онда интернет жылдам жұмыс істейді. Мен әр күні достарыммен телефон арқылы сөйлесемін. Кейде сайттарда қызықты мақалалар оқимын. Телефонсыз өмір сүру қиын болды.`,
    new_words: [{ term: 'жылдам', translation_ru: 'быстрый' }, { term: 'мақала', translation_ru: 'статья' }, { term: 'өмір сүру', translation_ru: 'жить (существовать)' }],
    exercises: [
      { prompt: 'Ол достарымен қалай сөйлеседі?', correct_answer: 'Телефон арқылы', distractors: ['Хат арқылы', 'Кездесіп қана', 'Ешқашан сөйлеспейді'] },
      { prompt: 'Интернет қалай жұмыс істейді?', correct_answer: 'Жылдам', distractors: ['Баяу', 'Мүлдем істемейді', 'Кейде ғана'] }
    ]
  },
  {
    slug: 'kz-a1-tangertengi-zhattygu',
    title: 'Таңертеңгі жаттығу',
    theme: 'здоровье',
    level: 'A2',
    style: 'textbook',
    body: `Мен күн сайын таңертең жаттығу жасаймын. Алдымен жүгіремін, сосын секіремін. Бұл денсаулыққа өте пайдалы. Жаттығудан кейін мен өзімді қуатты сезінемін. Дене шынықтыру маған көңіл-күй береді.`,
    new_words: [{ term: 'жаттығу', translation_ru: 'упражнение, тренировка' }, { term: 'пайдалы', translation_ru: 'полезный' }, { term: 'қуатты', translation_ru: 'бодрый, полный сил' }, { term: 'көңіл-күй', translation_ru: 'настроение' }],
    exercises: [
      { prompt: 'Ол алдымен не істейді?', correct_answer: 'Жүгіреді', distractors: ['Секіреді', 'Ұйықтайды', 'Тамақтанады'] },
      { prompt: 'Жаттығу неге пайдалы?', correct_answer: 'Денсаулыққа', distractors: ['Жұмысқа', 'Ақшаға', 'Демалысқа'] }
    ]
  },
  {
    slug: 'kz-a1-bazarda-satyp-alu',
    title: 'Базардан сауда',
    theme: 'покупки и деньги',
    level: 'A2',
    style: 'textbook',
    body: `Апта сайын мен базарға барамын. Онда жеміс пен көкөніс арзан. Мен алма, банан және балық сатып алдым. Сатушылармен сөйлесу маған ұнайды. Базардан үйге көп заттар алып қайттым.`,
    new_words: [{ term: 'сауда', translation_ru: 'торговля, покупки' }, { term: 'арзан', translation_ru: 'дешёвый' }, { term: 'сатушы', translation_ru: 'продавец' }, { term: 'зат', translation_ru: 'вещь' }],
    exercises: [
      { prompt: 'Базарда не арзан?', correct_answer: 'Жеміс пен көкөніс', distractors: ['Киім', 'Телефон', 'Кітап'] },
      { prompt: 'Оған не ұнайды?', correct_answer: 'Сатушылармен сөйлесу', distractors: ['Жалғыз жүру', 'Ұзақ күту', 'Ештеңе'] }
    ]
  }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM reading_texts WHERE slug = ?');
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM reading_texts');
  const insertText = db.prepare(
    `INSERT INTO reading_texts (language, slug, title, theme, level, style, body, order_index)
     VALUES ('kz', @slug, @title, @theme, @level, @style, @body, @order_index)`
  );
  const insertWord = db.prepare('INSERT INTO reading_new_words (text_id, term, translation_ru, position) VALUES (?, ?, ?, ?)');
  const insertExercise = db.prepare(
    'INSERT INTO reading_exercises (text_id, prompt, correct_answer, distractors, position) VALUES (?, ?, ?, ?, ?)'
  );

  let inserted = 0;
  const insertAll = db.transaction(() => {
    let order = maxOrder.get().m;
    for (const text of TEXTS) {
      if (existsStmt.get(text.slug)) continue;
      order += 1;
      const info = insertText.run({ ...text, order_index: order });
      text.new_words.forEach((w, i) => insertWord.run(info.lastInsertRowid, w.term, w.translation_ru, i));
      text.exercises.forEach((e, i) => insertExercise.run(info.lastInsertRowid, e.prompt, e.correct_answer, JSON.stringify(e.distractors), i));
      inserted += 1;
    }
  });

  insertAll();
  console.log(`Inserted ${inserted} reading texts (${TEXTS.length - inserted} already existed).`);
}

seed();
