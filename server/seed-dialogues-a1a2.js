// 20 original A1-A2 Kazakh dialogues, built mostly from the user's own
// deck vocabulary. All original writing. Fills a gap: before this, kz
// dialogues had only 3 entries (базар/такси/кафе), all lumped under one
// "A1-A2" level with no finer split.
import { db } from './db/index.js';

const DIALOGUES = [
  {
    slug: 'kz-dialogue-tanysu',
    title: 'Танысу',
    scenario: 'танысу',
    level: 'A1',
    lines: [
      { speaker: 'Нұрлан', text: 'Сәлем! Менің есімім — Нұрлан.', translation_ru: 'Привет! Меня зовут Нурлан.' },
      { speaker: 'Айгерім', text: 'Сәлем, Нұрлан! Мен — Айгерім.', translation_ru: 'Привет, Нурлан! Я — Айгерим.' },
      { speaker: 'Нұрлан', text: 'Қалайсың, Айгерім?', translation_ru: 'Как дела, Айгерим?' },
      { speaker: 'Айгерім', text: 'Жақсымын, рахмет. Ал сен қалайсың?', translation_ru: 'Хорошо, спасибо. А ты как?' },
      { speaker: 'Нұрлан', text: 'Мен де жақсымын. Сен қайдансың?', translation_ru: 'Я тоже хорошо. Ты откуда?' },
      { speaker: 'Айгерім', text: 'Мен Алматыданмын. Ал сен?', translation_ru: 'Я из Алматы. А ты?' },
      { speaker: 'Нұрлан', text: 'Мен Астанаданмын. Танысқаныма қуаныштымын!', translation_ru: 'Я из Астаны. Рад знакомству!' }
    ],
    new_words: [{ term: 'танысу', translation_ru: 'знакомиться' }, { term: 'қуаныштымын', translation_ru: 'рад(а)' }]
  },
  {
    slug: 'kz-dialogue-dukende-zattar',
    title: 'Дүкенде',
    scenario: 'дүкен',
    level: 'A1',
    lines: [
      { speaker: 'Сатушы', text: 'Сәлеметсіз бе! Сізге не керек?', translation_ru: 'Здравствуйте! Что вам нужно?' },
      { speaker: 'Айгерім', text: 'Маған нан мен сүт керек.', translation_ru: 'Мне нужны хлеб и молоко.' },
      { speaker: 'Сатушы', text: 'Міне, нан. Сүт мына жерде.', translation_ru: 'Вот хлеб. Молоко здесь.' },
      { speaker: 'Айгерім', text: 'Рахмет. Бұл қанша тұрады?', translation_ru: 'Спасибо. Сколько это стоит?' },
      { speaker: 'Сатушы', text: 'Бес жүз теңге.', translation_ru: 'Пятьсот тенге.' },
      { speaker: 'Айгерім', text: 'Міне, ақша. Сау болыңыз!', translation_ru: 'Вот деньги. До свидания!' }
    ],
    new_words: [{ term: 'міне', translation_ru: 'вот' }, { term: 'тұру (бағасы)', translation_ru: 'стоить' }, { term: 'теңге', translation_ru: 'тенге (валюта)' }]
  },
  {
    slug: 'kz-dialogue-darigerde',
    title: 'Дәрігерде',
    scenario: 'дәрігер',
    level: 'A1',
    lines: [
      { speaker: 'Дәрігер', text: 'Сәлеметсіз бе! Не ауырады?', translation_ru: 'Здравствуйте! Что болит?' },
      { speaker: 'Нұрлан', text: 'Менің басым ауырады.', translation_ru: 'У меня болит голова.' },
      { speaker: 'Дәрігер', text: 'Қашаннан бері ауырады?', translation_ru: 'С каких пор болит?' },
      { speaker: 'Нұрлан', text: 'Кешеден бері.', translation_ru: 'Со вчерашнего дня.' },
      { speaker: 'Дәрігер', text: 'Түсінікті. Мен сізге дәрі жазып беремін.', translation_ru: 'Понятно. Я выпишу вам лекарство.' },
      { speaker: 'Нұрлан', text: 'Рахмет, дәрігер!', translation_ru: 'Спасибо, доктор!' }
    ],
    new_words: [{ term: 'қашаннан бері', translation_ru: 'с каких пор' }, { term: 'түсінікті', translation_ru: 'понятно' }, { term: 'жазып беру', translation_ru: 'выписать' }]
  },
  {
    slug: 'kz-dialogue-mektepte',
    title: 'Мектепте',
    scenario: 'мектеп',
    level: 'A1',
    lines: [
      { speaker: 'Мұғалім', text: 'Қалайсыңдар, балалар?', translation_ru: 'Как дела, дети?' },
      { speaker: 'Оқушы', text: 'Жақсымыз, мұғалім!', translation_ru: 'Хорошо, учитель!' },
      { speaker: 'Мұғалім', text: 'Бүгін біз жаңа сабақ өтеміз.', translation_ru: 'Сегодня мы пройдём новый урок.' },
      { speaker: 'Оқушы', text: 'Қандай сабақ?', translation_ru: 'Какой урок?' },
      { speaker: 'Мұғалім', text: 'Қазақ тілі сабағы.', translation_ru: 'Урок казахского языка.' },
      { speaker: 'Оқушы', text: 'Тамаша! Мен қазақ тілін жақсы көремін.', translation_ru: 'Отлично! Я люблю казахский язык.' }
    ],
    new_words: [{ term: 'сабақ өту', translation_ru: 'проходить урок' }, { term: 'тамаша', translation_ru: 'отлично' }]
  },
  {
    slug: 'kz-dialogue-otbasy-turaly',
    title: 'Отбасы туралы',
    scenario: 'үй',
    level: 'A1',
    lines: [
      { speaker: 'Айгерім', text: 'Сенің отбасың үлкен бе?', translation_ru: 'У тебя большая семья?' },
      { speaker: 'Нұрлан', text: 'Иә, менің әкем, шешем және екі ағам бар.', translation_ru: 'Да, у меня есть отец, мама и два старших брата.' },
      { speaker: 'Айгерім', text: 'Ал сенің әпкең бар ма?', translation_ru: 'А сестра у тебя есть?' },
      { speaker: 'Нұрлан', text: 'Жоқ, әпкем жоқ. Ал сенің отбасың ше?', translation_ru: 'Нет, сестры нет. А у тебя как с семьёй?' },
      { speaker: 'Айгерім', text: 'Менің отбасым кішкентай: әкем, шешем және мен.', translation_ru: 'Моя семья маленькая: отец, мама и я.' }
    ],
    new_words: [{ term: 'әпке', translation_ru: 'старшая сестра' }, { term: 'кішкентай', translation_ru: 'маленький' }]
  },
  {
    slug: 'kz-dialogue-ava-rayy-turaly',
    title: 'Ауа райы туралы',
    scenario: 'сырт әңгіме',
    level: 'A1',
    lines: [
      { speaker: 'Нұрлан', text: 'Бүгін ауа райы қандай?', translation_ru: 'Какая сегодня погода?' },
      { speaker: 'Айгерім', text: 'Бүгін суық және жел бар.', translation_ru: 'Сегодня холодно и есть ветер.' },
      { speaker: 'Нұрлан', text: 'Ертең жаңбыр жауады ма?', translation_ru: 'Завтра будет дождь?' },
      { speaker: 'Айгерім', text: 'Білмеймін, бірақ бұлт көп.', translation_ru: 'Не знаю, но облаков много.' },
      { speaker: 'Нұрлан', text: 'Онда мен жылы киім киемін.', translation_ru: 'Тогда я надену тёплую одежду.' }
    ],
    new_words: [{ term: 'білмеймін', translation_ru: 'не знаю' }, { term: 'онда', translation_ru: 'тогда' }]
  },
  {
    slug: 'kz-dialogue-kiim-satyp-alu',
    title: 'Киім сатып алу',
    scenario: 'киім дүкені',
    level: 'A2',
    lines: [
      { speaker: 'Сатушы', text: 'Сізге қандай көйлек ұнайды?', translation_ru: 'Какое платье вам нравится?' },
      { speaker: 'Айгерім', text: 'Мен ақ түсті көйлек іздеймін.', translation_ru: 'Я ищу платье белого цвета.' },
      { speaker: 'Сатушы', text: 'Міне, бұл көйлекті киіп көріңіз.', translation_ru: 'Вот, примерьте это платье.' },
      { speaker: 'Айгерім', text: 'Бұл маған жарасады ма?', translation_ru: 'Мне идёт это?' },
      { speaker: 'Сатушы', text: 'Иә, өте жарасады!', translation_ru: 'Да, очень идёт!' },
      { speaker: 'Айгерім', text: 'Жақсы, мен осыны аламын.', translation_ru: 'Хорошо, я это возьму.' }
    ],
    new_words: [{ term: 'іздеу', translation_ru: 'искать' }, { term: 'киіп көру', translation_ru: 'примерить' }]
  },
  {
    slug: 'kz-dialogue-telefon-arkyly',
    title: 'Телефон арқылы сөйлесу',
    scenario: 'телефон',
    level: 'A1',
    lines: [
      { speaker: 'Нұрлан', text: 'Алло! Айгерім, бұл сенбісің?', translation_ru: 'Алло! Айгерим, это ты?' },
      { speaker: 'Айгерім', text: 'Иә, мен. Қалайсың, Нұрлан?', translation_ru: 'Да, я. Как дела, Нурлан?' },
      { speaker: 'Нұрлан', text: 'Жақсымын. Ертең бос уақытың бар ма?', translation_ru: 'Хорошо. У тебя завтра есть свободное время?' },
      { speaker: 'Айгерім', text: 'Иә, бар. Не істейміз?', translation_ru: 'Да, есть. Что будем делать?' },
      { speaker: 'Нұрлан', text: 'Кафеде кездесейік пе?', translation_ru: 'Встретимся в кафе?' },
      { speaker: 'Айгерім', text: 'Жарайды, сағат үште кездесейік.', translation_ru: 'Хорошо, встретимся в три часа.' }
    ],
    new_words: [{ term: 'алло', translation_ru: 'алло' }, { term: 'бос уақыт', translation_ru: 'свободное время' }]
  },
  {
    slug: 'kz-dialogue-zhol-surau',
    title: 'Жол сұрау',
    scenario: 'көшеде',
    level: 'A1',
    lines: [
      { speaker: 'Айгерім', text: 'Кешіріңіз, дүкен қайда орналасқан?', translation_ru: 'Извините, где находится магазин?' },
      { speaker: 'Көрші', text: 'Дүкен осы көшенің соңында.', translation_ru: 'Магазин в конце этой улицы.' },
      { speaker: 'Айгерім', text: 'Алыс па?', translation_ru: 'Это далеко?' },
      { speaker: 'Көрші', text: 'Жоқ, жақын. Бес минут жаяу жүру керек.', translation_ru: 'Нет, близко. Нужно пройти пешком пять минут.' },
      { speaker: 'Айгерім', text: 'Рахмет сізге!', translation_ru: 'Спасибо вам!' }
    ],
    new_words: [{ term: 'орналасу', translation_ru: 'находиться (о месте)' }, { term: 'соңы', translation_ru: 'конец' }, { term: 'жаяу жүру', translation_ru: 'идти пешком' }]
  },
  {
    slug: 'kz-dialogue-emhanada',
    title: 'Емханада',
    scenario: 'емхана',
    level: 'A2',
    lines: [
      { speaker: 'Тіркеуші', text: 'Сәлеметсіз бе! Қандай дәрігерге жазылғыңыз келеді?', translation_ru: 'Здравствуйте! К какому врачу хотите записаться?' },
      { speaker: 'Нұрлан', text: 'Тіс дәрігеріне, өтінемін.', translation_ru: 'К зубному врачу, пожалуйста.' },
      { speaker: 'Тіркеуші', text: 'Ертеңге сағат оннан жазайын ба?', translation_ru: 'Записать на завтра, на десять часов?' },
      { speaker: 'Нұрлан', text: 'Иә, жарайды. Рахмет!', translation_ru: 'Да, хорошо. Спасибо!' }
    ],
    new_words: [{ term: 'тіркеуші', translation_ru: 'регистратор' }, { term: 'жазылу', translation_ru: 'записаться' }, { term: 'өтінемін', translation_ru: 'пожалуйста (просьба)' }]
  },
  {
    slug: 'kz-dialogue-dostarmen-zhospar',
    title: 'Достармен жоспар құру',
    scenario: 'демалыс',
    level: 'A2',
    lines: [
      { speaker: 'Айгерім', text: 'Демалыс күні не істейміз?', translation_ru: 'Что будем делать в выходной?' },
      { speaker: 'Нұрлан', text: 'Саябаққа барайық па?', translation_ru: 'Пойдём в парк?' },
      { speaker: 'Айгерім', text: 'Жақсы идея! Тағы кім барады?', translation_ru: 'Хорошая идея! Кто ещё пойдёт?' },
      { speaker: 'Нұрлан', text: 'Ерлан мен Динара да келеді.', translation_ru: 'Ерлан и Динара тоже придут.' },
      { speaker: 'Айгерім', text: 'Тамаша, сағат бірде кездесейік.', translation_ru: 'Отлично, встретимся в час.' }
    ],
    new_words: [{ term: 'жоспар құру', translation_ru: 'строить план' }, { term: 'идея', translation_ru: 'идея' }, { term: 'тағы', translation_ru: 'ещё' }]
  },
  {
    slug: 'kz-dialogue-mereke-kuttyktau',
    title: 'Мерекемен құттықтау',
    scenario: 'мереке',
    level: 'A2',
    lines: [
      { speaker: 'Айгерім', text: 'Наурыз мейрамымен құттықтаймын!', translation_ru: 'Поздравляю с праздником Наурыз!' },
      { speaker: 'Нұрлан', text: 'Рахмет! Сені де құттықтаймын.', translation_ru: 'Спасибо! Тебя тоже поздравляю.' },
      { speaker: 'Айгерім', text: 'Отбасыңа денсаулық пен бақыт тілеймін.', translation_ru: 'Желаю твоей семье здоровья и счастья.' },
      { speaker: 'Нұрлан', text: 'Рахмет, саған да сол тілектер!', translation_ru: 'Спасибо, тебе тоже такие же пожелания!' }
    ],
    new_words: [{ term: 'құттықтау', translation_ru: 'поздравлять' }, { term: 'бақыт', translation_ru: 'счастье' }, { term: 'тілеу', translation_ru: 'желать' }]
  },
  {
    slug: 'kz-dialogue-zhumysta',
    title: 'Жұмыста',
    scenario: 'жұмыс',
    level: 'A2',
    lines: [
      { speaker: 'Әріптес', text: 'Қалайсың? Жұмыс қалай өтіп жатыр?', translation_ru: 'Как дела? Как проходит работа?' },
      { speaker: 'Айгерім', text: 'Жақсы, бірақ бүгін жұмыс көп.', translation_ru: 'Хорошо, но сегодня много работы.' },
      { speaker: 'Әріптес', text: 'Көмек керек пе?', translation_ru: 'Нужна помощь?' },
      { speaker: 'Айгерім', text: 'Иә, рахмет! Бұл жобаны бірге жасайық.', translation_ru: 'Да, спасибо! Давай сделаем этот проект вместе.' }
    ],
    new_words: [{ term: 'көмек', translation_ru: 'помощь' }, { term: 'жоба', translation_ru: 'проект' }]
  },
  {
    slug: 'kz-dialogue-auezhaiyda',
    title: 'Әуежайда',
    scenario: 'әуежай',
    level: 'A2',
    lines: [
      { speaker: 'Қызметкер', text: 'Паспортыңыз бен билетіңізді көрсетіңізші.', translation_ru: 'Покажите ваш паспорт и билет, пожалуйста.' },
      { speaker: 'Нұрлан', text: 'Міне, алыңыз.', translation_ru: 'Вот, возьмите.' },
      { speaker: 'Қызметкер', text: 'Багажыңыз бар ма?', translation_ru: 'У вас есть багаж?' },
      { speaker: 'Нұрлан', text: 'Иә, бір сөмке бар.', translation_ru: 'Да, есть одна сумка.' },
      { speaker: 'Қызметкер', text: 'Жақсы, сәтті ұшу тілеймін!', translation_ru: 'Хорошо, желаю удачного полёта!' }
    ],
    new_words: [{ term: 'қызметкер', translation_ru: 'сотрудник' }, { term: 'көрсету', translation_ru: 'показать' }, { term: 'сәтті', translation_ru: 'удачный' }]
  },
  {
    slug: 'kz-dialogue-sportpen-turaly',
    title: 'Спорт туралы',
    scenario: 'спорт',
    level: 'A2',
    lines: [
      { speaker: 'Айгерім', text: 'Сен спортпен айналысасың ба?', translation_ru: 'Ты занимаешься спортом?' },
      { speaker: 'Нұрлан', text: 'Иә, мен күн сайын жүгіремін.', translation_ru: 'Да, я каждый день бегаю.' },
      { speaker: 'Айгерім', text: 'Жүзе аласың ба?', translation_ru: 'Ты умеешь плавать?' },
      { speaker: 'Нұрлан', text: 'Иә, жүзуді жақсы көремін. Ал сен ше?', translation_ru: 'Да, люблю плавать. А ты как?' },
      { speaker: 'Айгерім', text: 'Мен таңертең жаттығу жасаймын.', translation_ru: 'Я утром делаю зарядку.' }
    ],
    new_words: [{ term: 'айналысу', translation_ru: 'заниматься (чем-то)' }, { term: 'жүзе алу', translation_ru: 'уметь плавать' }]
  },
  {
    slug: 'kz-dialogue-keshki-as',
    title: 'Кешкі ас',
    scenario: 'үй, тамақ',
    level: 'A1',
    lines: [
      { speaker: 'Шеше', text: 'Кешкі асқа не дайындайық?', translation_ru: 'Что приготовим на ужин?' },
      { speaker: 'Айгерім', text: 'Балық пен көкөніс болса жақсы болар еді.', translation_ru: 'Было бы хорошо рыбу с овощами.' },
      { speaker: 'Шеше', text: 'Жарайды. Сен нан алып кел.', translation_ru: 'Хорошо. Ты принеси хлеб.' },
      { speaker: 'Айгерім', text: 'Жақсы, қазір барамын.', translation_ru: 'Хорошо, сейчас пойду.' }
    ],
    new_words: [{ term: 'болса жақсы болар еді', translation_ru: 'было бы хорошо' }, { term: 'алып келу', translation_ru: 'принести' }]
  },
  {
    slug: 'kz-dialogue-demalys-zhospary',
    title: 'Демалыс жоспары',
    scenario: 'демалыс',
    level: 'A1',
    lines: [
      { speaker: 'Нұрлан', text: 'Апта соңында не істейсің?', translation_ru: 'Что будешь делать в выходные?' },
      { speaker: 'Айгерім', text: 'Мен үйде демаламын, кино көремін.', translation_ru: 'Я буду отдыхать дома, посмотрю кино.' },
      { speaker: 'Нұрлан', text: 'Мен саябаққа барамын, ауа райы жақсы болса.', translation_ru: 'Я пойду в парк, если погода будет хорошей.' },
      { speaker: 'Айгерім', text: 'Жақсы демалыс болсын!', translation_ru: 'Хорошего отдыха!' }
    ],
    new_words: [{ term: 'апта соңы', translation_ru: 'конец недели, выходные' }, { term: 'кино көру', translation_ru: 'смотреть кино' }]
  },
  {
    slug: 'kz-dialogue-paterr-zhaldau',
    title: 'Пәтер жалдау',
    scenario: 'үй іздеу',
    level: 'A2',
    lines: [
      { speaker: 'Нұрлан', text: 'Бұл пәтерде неше бөлме бар?', translation_ru: 'В этой квартире сколько комнат?' },
      { speaker: 'Иесі', text: 'Екі бөлме, ас үй және дәретхана бар.', translation_ru: 'Две комнаты, кухня и туалет.' },
      { speaker: 'Нұрлан', text: 'Терезеден не көрінеді?', translation_ru: 'Что видно из окна?' },
      { speaker: 'Иесі', text: 'Көшенің көрінісі жақсы.', translation_ru: 'Хороший вид на улицу.' },
      { speaker: 'Нұрлан', text: 'Маған ұнайды. Мен ойланып көрейін.', translation_ru: 'Мне нравится. Я подумаю.' }
    ],
    new_words: [{ term: 'жалдау', translation_ru: 'арендовать' }, { term: 'иесі', translation_ru: 'хозяин (владелец)' }, { term: 'ойлану', translation_ru: 'подумать' }]
  },
  {
    slug: 'kz-dialogue-dukende-tamak',
    title: 'Дүкенде тамақ сатып алу',
    scenario: 'дүкен',
    level: 'A1',
    lines: [
      { speaker: 'Айгерім', text: 'Балық бар ма?', translation_ru: 'Есть рыба?' },
      { speaker: 'Сатушы', text: 'Иә, жаңа балық бар.', translation_ru: 'Да, есть свежая рыба.' },
      { speaker: 'Айгерім', text: 'Жақсы, екі балық беріңіз.', translation_ru: 'Хорошо, дайте две рыбы.' },
      { speaker: 'Сатушы', text: 'Тағы бірдеңе керек пе?', translation_ru: 'Ещё что-нибудь нужно?' },
      { speaker: 'Айгерім', text: 'Жоқ, жеткілікті. Рахмет!', translation_ru: 'Нет, достаточно. Спасибо!' }
    ],
    new_words: [{ term: 'жаңа (тамақ туралы)', translation_ru: 'свежий' }, { term: 'жеткілікті', translation_ru: 'достаточно' }]
  },
  {
    slug: 'kz-dialogue-tugan-kun',
    title: 'Туған күнмен құттықтау',
    scenario: 'туған күн',
    level: 'A1',
    lines: [
      { speaker: 'Айгерім', text: 'Туған күніңмен құттықтаймын!', translation_ru: 'Поздравляю с днём рождения!' },
      { speaker: 'Нұрлан', text: 'Рахмет саған!', translation_ru: 'Спасибо тебе!' },
      { speaker: 'Айгерім', text: 'Саған денсаулық және сәттілік тілеймін.', translation_ru: 'Желаю тебе здоровья и удачи.' },
      { speaker: 'Нұрлан', text: 'Рахмет, бұл маған өте маңызды.', translation_ru: 'Спасибо, это для меня очень важно.' }
    ],
    new_words: [{ term: 'туған күн', translation_ru: 'день рождения' }, { term: 'сәттілік', translation_ru: 'удача' }, { term: 'маңызды', translation_ru: 'важный' }]
  }
];

function seedDialogues() {
  const getBySlug = db.prepare('SELECT id FROM dialogues WHERE slug = ?');
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM dialogues');
  const insertDialogue = db.prepare(
    `INSERT INTO dialogues (language, slug, title, scenario, level, order_index)
     VALUES ('kz', @slug, @title, @scenario, @level, @order_index)`
  );
  const insertLine = db.prepare(
    'INSERT INTO dialogue_lines (dialogue_id, position, speaker, text, translation_ru) VALUES (@dialogue_id, @position, @speaker, @text, @translation_ru)'
  );
  const insertNewWord = db.prepare(
    'INSERT INTO dialogue_new_words (dialogue_id, term, translation_ru, position) VALUES (@dialogue_id, @term, @translation_ru, @position)'
  );

  let inserted = 0;
  const insertAll = db.transaction(() => {
    let order = maxOrder.get().m;
    for (const dialogue of DIALOGUES) {
      if (getBySlug.get(dialogue.slug)) continue;
      order += 1;

      const info = insertDialogue.run({ ...dialogue, order_index: order });
      const dialogueId = info.lastInsertRowid;

      dialogue.lines.forEach((line, position) => {
        insertLine.run({ dialogue_id: dialogueId, position, speaker: line.speaker, text: line.text, translation_ru: line.translation_ru });
      });
      dialogue.new_words.forEach((word, position) => {
        insertNewWord.run({ dialogue_id: dialogueId, term: word.term, translation_ru: word.translation_ru, position });
      });

      inserted += 1;
    }
  });

  insertAll();
  console.log(`Seeded ${inserted} dialogue(s) (${DIALOGUES.length - inserted} already existed).`);
}

seedDialogues();
