import { db } from './db/index.js';

// English B2->C1 vocabulary, organized by theme.
const EN_CARDS = [
  // синонимы
  { term: 'meticulous', translation_ru: 'дотошный, скрупулёзный', transcription: 'о человеке/работе', theme: 'синонимы', example_sentence: "She's meticulous about details in every report." },
  { term: 'profound', translation_ru: 'глубокий (о мысли, влиянии)', transcription: 'не про физическую глубину', theme: 'синонимы', example_sentence: 'The book had a profound effect on how I think.' },
  { term: 'dubious', translation_ru: 'сомнительный', transcription: 'вежливее, чем "suspicious"', theme: 'синонимы', example_sentence: "I'm dubious about that claim." },
  { term: 'candid', translation_ru: 'откровенный, прямой', transcription: 'без негативной окраски', theme: 'синонимы', example_sentence: 'He gave a candid answer about the delays.' },
  { term: 'tedious', translation_ru: 'утомительный, нудный', transcription: 'про скучную рутину', theme: 'синонимы', example_sentence: 'The paperwork was tedious but necessary.' },
  { term: 'resilient', translation_ru: 'стойкий, живучий', transcription: 'и про людей, и про системы', theme: 'синонимы', example_sentence: 'The economy proved resilient despite the crisis.' },
  { term: 'ambiguous', translation_ru: 'неоднозначный', transcription: 'допускает разные трактовки', theme: 'синонимы', example_sentence: 'The instructions were ambiguous.' },
  { term: 'plausible', translation_ru: 'правдоподобный', transcription: 'звучит как разумное объяснение', theme: 'синонимы', example_sentence: "That's a plausible explanation." },
  { term: 'adamant', translation_ru: 'непреклонный', transcription: 'твёрдо настаивает', theme: 'синонимы', example_sentence: "She was adamant that she hadn't made a mistake." },
  { term: 'subtle', translation_ru: 'тонкий, едва уловимый', transcription: 'нюанс, не бросается в глаза', theme: 'синонимы', example_sentence: "There's a subtle difference between the two versions." },

  // абстракции
  { term: 'implication', translation_ru: 'подтекст, последствие', transcription: 'что подразумевается', theme: 'абстракции', example_sentence: "The implications of this decision aren't clear yet." },
  { term: 'discrepancy', translation_ru: 'несоответствие, расхождение', transcription: 'между цифрами/фактами', theme: 'абстракции', example_sentence: "There's a discrepancy between the two reports." },
  { term: 'rationale', translation_ru: 'обоснование, логика решения', transcription: 'почему так сделано', theme: 'абстракции', example_sentence: "What's the rationale behind this policy?" },
  { term: 'premise', translation_ru: 'предпосылка, исходное утверждение', transcription: 'база для аргумента', theme: 'абстракции', example_sentence: 'The whole argument rests on a false premise.' },
  { term: 'viable', translation_ru: 'жизнеспособный, осуществимый', transcription: 'про план/идею', theme: 'абстракции', example_sentence: 'Is this a viable solution long-term?' },
  { term: 'perception', translation_ru: 'восприятие', transcription: 'как что-то воспринимается', theme: 'абстракции', example_sentence: 'Public perception of the brand has shifted.' },
  { term: 'notion', translation_ru: 'представление, понятие', transcription: 'часто с оттенком "спорное"', theme: 'абстракции', example_sentence: 'I reject the notion that money buys happiness.' },
  { term: 'consensus', translation_ru: 'единое мнение, консенсус', transcription: 'согласие большинства', theme: 'абстракции', example_sentence: 'We reached a consensus after the meeting.' },

  // деловая лексика
  { term: 'leverage', translation_ru: 'использовать (в своих интересах)', transcription: 'и глагол, и сущ.', theme: 'деловая лексика', example_sentence: 'We should leverage our existing client base.' },
  { term: 'streamline', translation_ru: 'упростить, оптимизировать (процесс)', transcription: 'часто про workflow', theme: 'деловая лексика', example_sentence: 'This tool helps streamline reporting.' },
  { term: 'stakeholder', translation_ru: 'заинтересованная сторона', transcription: 'не только "акционер"', theme: 'деловая лексика', example_sentence: 'All stakeholders were informed of the change.' },
  { term: 'accountability', translation_ru: 'ответственность (за результат)', transcription: 'не путать с responsibility', theme: 'деловая лексика', example_sentence: "There's a lack of accountability in that team." },
  { term: 'feasible', translation_ru: 'осуществимый, реалистичный', transcription: 'похоже на viable, но про исполнимость', theme: 'деловая лексика', example_sentence: 'Is the deadline still feasible?' },
  { term: 'overhaul', translation_ru: 'капитальный пересмотр, переделка', transcription: 'и глагол, и сущ.', theme: 'деловая лексика', example_sentence: 'The system needs a complete overhaul.' },
  { term: 'contingency', translation_ru: 'непредвиденное обстоятельство, план Б', transcription: 'contingency plan', theme: 'деловая лексика', example_sentence: 'We need a contingency plan in case it fails.' },

  // эмоции (nuanced, B2-C1)
  { term: 'apprehensive', translation_ru: 'тревожный, опасающийся', transcription: 'лёгкая тревога перед событием', theme: 'эмоции', example_sentence: "I'm a bit apprehensive about the interview." },
  { term: 'complacent', translation_ru: 'самодовольный, благодушный', transcription: 'негативный оттенок', theme: 'эмоции', example_sentence: "Don't get complacent just because sales are up." },
  { term: 'assertive', translation_ru: 'напористый, уверенный (в хорошем смысле)', transcription: 'не агрессивный', theme: 'эмоции', example_sentence: 'You need to be more assertive in negotiations.' },
  { term: 'indifferent', translation_ru: 'равнодушный', transcription: 'ни за, ни против', theme: 'эмоции', example_sentence: 'He seemed indifferent to the outcome.' },
  { term: 'overwhelmed', translation_ru: 'подавленный (объёмом дел/эмоций)', transcription: 'не физически, а по нагрузке', theme: 'эмоции', example_sentence: 'She felt overwhelmed by the workload.' },

  // идиомы
  { term: 'to read between the lines', translation_ru: 'понимать подтекст', transcription: 'не то, что сказано напрямую', theme: 'идиомы', example_sentence: 'You need to read between the lines here.' },
  { term: 'to be on the same page', translation_ru: 'быть на одной волне, согласны', transcription: 'про совпадение понимания', theme: 'идиомы', example_sentence: "Let's make sure we're on the same page before we start." },
  { term: 'a double-edged sword', translation_ru: 'палка о двух концах', transcription: 'и плюс, и минус одновременно', theme: 'идиомы', example_sentence: 'More automation is a double-edged sword.' },
  { term: 'to cut corners', translation_ru: 'халтурить, экономить в ущерб качеству', transcription: 'негативная окраска', theme: 'идиомы', example_sentence: 'They cut corners on safety to save money.' },
  { term: 'to touch base', translation_ru: 'связаться, синхронизироваться коротко', transcription: 'деловой контекст', theme: 'идиомы', example_sentence: "Let's touch base next week." }
];

// Kazakh A1->A2 vocabulary. Greetings merge into the existing "бытовое"
// theme, verbs merge into the existing "глаголы" theme — both already
// exist from the original seed, so new entries join them rather than
// fragmenting into near-duplicate theme names.
const KZ_CARDS = [
  // бытовое (greetings/politeness — joins the existing theme)
  { term: 'Сәлеметсіз бе', translation_ru: 'Здравствуйте (формально)', transcription: 'сә- как "сэ"', theme: 'бытовое', example_sentence: 'Сәлеметсіз бе, менің атым Элайджа.' },
  { term: 'Қалайсың? / Қалайсыз?', translation_ru: 'Как дела? (ты/вы)', transcription: 'қ — твёрдое "к" из глубины горла', theme: 'бытовое', example_sentence: 'Қалайсың, бәрі жақсы ма?' },
  { term: 'Рақмет', translation_ru: 'Спасибо', transcription: null, theme: 'бытовое', example_sentence: 'Рақмет, өте жақсы болды.' },
  { term: 'Кешіріңіз', translation_ru: 'Извините', transcription: null, theme: 'бытовое', example_sentence: 'Кешіріңіз, сұрақ қоюға бола ма?' },
  { term: 'Сау болыңыз', translation_ru: 'До свидания (формально)', transcription: null, theme: 'бытовое', example_sentence: 'Сау болыңыз, кездескенше!' },
  { term: 'Жарайды', translation_ru: 'Хорошо, ладно, договорились', transcription: 'универсальное согласие', theme: 'бытовое', example_sentence: 'Жарайды, ертең көрісеміз.' },

  // семья
  { term: 'ата-ана', translation_ru: 'родители', transcription: null, theme: 'семья', example_sentence: 'Менің ата-анам Алматыда тұрады.' },
  { term: 'әке', translation_ru: 'отец', transcription: 'ә — мягкое "я" без й', theme: 'семья', example_sentence: 'Әкем дәрігер.' },
  { term: 'шеше / ана', translation_ru: 'мать', transcription: 'оба варианта используются', theme: 'семья', example_sentence: 'Анам үй шаруасымен айналысады.' },
  { term: 'аға', translation_ru: 'старший брат', transcription: null, theme: 'семья', example_sentence: 'Менің ағам бар.' },
  { term: 'қарындас / сіңлі', translation_ru: 'младшая сестра', transcription: 'қарындас — если говорит брат, сіңлі — если говорит сестра', theme: 'семья', example_sentence: 'Менің қарындасым мектепте оқиды.' },
  { term: 'бала', translation_ru: 'ребёнок', transcription: null, theme: 'семья', example_sentence: 'Олардың екі баласы бар.' },

  // тело
  { term: 'бас', translation_ru: 'голова', transcription: null, theme: 'тело', example_sentence: 'Басым ауырып тұр.' },
  { term: 'қол', translation_ru: 'рука', transcription: null, theme: 'тело', example_sentence: 'Қолымды жудым.' },
  { term: 'аяқ', translation_ru: 'нога', transcription: null, theme: 'тело', example_sentence: 'Аяғым шаршады.' },
  { term: 'көз', translation_ru: 'глаз', transcription: null, theme: 'тело', example_sentence: 'Оның көзі көк.' },
  { term: 'құлақ', translation_ru: 'ухо', transcription: 'құ — твёрдо, из глубины', theme: 'тело', example_sentence: 'Құлағым естімейді.' },

  // дом
  { term: 'үй', translation_ru: 'дом', transcription: null, theme: 'дом', example_sentence: 'Менің үйім осы жерде.' },
  { term: 'бөлме', translation_ru: 'комната', transcription: null, theme: 'дом', example_sentence: 'Бұл менің бөлмем.' },
  { term: 'ас үй', translation_ru: 'кухня', transcription: 'буквально "еда+дом"', theme: 'дом', example_sentence: 'Ас үйде ас пісіріп жатырмын.' },
  { term: 'терезе', translation_ru: 'окно', transcription: null, theme: 'дом', example_sentence: 'Терезені ашыңызшы.' },
  { term: 'есік', translation_ru: 'дверь', transcription: null, theme: 'дом', example_sentence: 'Есікті жабыңыз.' },

  // транспорт
  { term: 'автобус', translation_ru: 'автобус', transcription: null, theme: 'транспорт', example_sentence: 'Автобус қашан келеді?' },
  { term: 'таксиге отыру', translation_ru: 'сесть в такси', transcription: 'глагольное сочетание', theme: 'транспорт', example_sentence: 'Мен таксиге отырдым.' },
  { term: 'көше', translation_ru: 'улица', transcription: null, theme: 'транспорт', example_sentence: 'Бұл көшенің аты не?' },
  { term: 'базар', translation_ru: 'рынок, базар', transcription: null, theme: 'транспорт', example_sentence: 'Базарға барайық.' },
  { term: 'дүкен', translation_ru: 'магазин', transcription: null, theme: 'транспорт', example_sentence: 'Дүкен неше сағатта ашылады?' },

  // профессии
  { term: 'дәрігер', translation_ru: 'врач', transcription: null, theme: 'профессии', example_sentence: 'Ол дәрігер болып жұмыс істейді.' },
  { term: 'мұғалім', translation_ru: 'учитель', transcription: null, theme: 'профессии', example_sentence: 'Менің анам мұғалім.' },
  { term: 'суретші', translation_ru: 'художник', transcription: null, theme: 'профессии', example_sentence: 'Ол өте талантты суретші.' },
  { term: 'жүргізуші', translation_ru: 'водитель', transcription: null, theme: 'профессии', example_sentence: 'Такси жүргізушісі мейірімді екен.' },

  // эмоции (A1-A2 basic — joins the theme also used by the EN nuanced-emotion set)
  { term: 'қуанышты', translation_ru: 'радостный, счастливый', transcription: null, theme: 'эмоции', example_sentence: 'Мен бүгін қуаныштымын.' },
  { term: 'ашулы', translation_ru: 'сердитый', transcription: null, theme: 'эмоции', example_sentence: 'Ол неге ашулы?' },
  { term: 'шаршаған', translation_ru: 'уставший', transcription: null, theme: 'эмоции', example_sentence: 'Мен жұмыстан кейін шаршағанмын.' },
  { term: 'қорқақ', translation_ru: 'трусливый / боится', transcription: null, theme: 'эмоции', example_sentence: 'Ит қорқақ емес.' },

  // глаголы (joins the existing theme)
  { term: 'келу', translation_ru: 'приходить', transcription: null, theme: 'глаголы', example_sentence: 'Ол ертең келеді.' },
  { term: 'бару', translation_ru: 'идти, ехать (куда-то)', transcription: null, theme: 'глаголы', example_sentence: 'Мен базарға барамын.' },
  { term: 'көру', translation_ru: 'видеть', transcription: null, theme: 'глаголы', example_sentence: 'Мен сені көрдім.' },
  { term: 'айту', translation_ru: 'говорить, сказать', transcription: null, theme: 'глаголы', example_sentence: 'Маған айтыңызшы.' },
  { term: 'түсіну', translation_ru: 'понимать', transcription: null, theme: 'глаголы', example_sentence: 'Түсінбедім, қайталаңызшы.' }
];

function seedLanguage(language, cards) {
  const existsStmt = db.prepare('SELECT id FROM cards WHERE language = ? AND term = ?');
  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence)
     VALUES (@language, @term, @translation_ru, @transcription, @theme, @example_sentence)`
  );
  const insertProgress = db.prepare('INSERT INTO progress (card_id) VALUES (?)');

  let inserted = 0;
  const insertAll = db.transaction((items) => {
    for (const card of items) {
      if (existsStmt.get(language, card.term)) continue; // idempotent: skip if already imported
      const info = insertCard.run({ language, ...card, transcription: card.transcription ?? null });
      insertProgress.run(info.lastInsertRowid);
      inserted += 1;
    }
  });

  insertAll(cards);
  return inserted;
}

function seed() {
  const enInserted = seedLanguage('en', EN_CARDS);
  const kzInserted = seedLanguage('kz', KZ_CARDS);
  console.log(`Seeded ${enInserted} English cards (${EN_CARDS.length - enInserted} already existed).`);
  console.log(`Seeded ${kzInserted} Kazakh cards (${KZ_CARDS.length - kzInserted} already existed).`);
}

seed();
