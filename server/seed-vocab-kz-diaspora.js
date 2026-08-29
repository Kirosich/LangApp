// Vocabulary drawn from a batch of words the user sent (glossed from a
// published story) -- only the bare word+translation pairs are used
// here, no copied sentences/dialogue/verse. Original example sentences
// written fresh for each. See seed-reading-kz-diaspora.js for the
// original (not copied) reading text on a related theme.
import { db } from './db/index.js';

const KZ_CARDS = [
  // человек и общение
  { term: 'дауыс', translation_ru: 'голос', theme: 'человек и общение', level: 'A2', example_sentence: 'Далада таныс дауыс естілді.' },
  { term: 'жалт қарау', translation_ru: 'резко обернуться', theme: 'человек и общение', level: 'B1', example_sentence: 'Ол атын естігенде жалт қарады.' },
  { term: 'орта бойлы', translation_ru: 'среднего роста', theme: 'человек и общение', level: 'A2', example_sentence: 'Ол орта бойлы, қара шашты жігіт.' },
  { term: 'сұрша', translation_ru: 'светловатый, светлокожий', theme: 'человек и общение', level: 'B1', example_sentence: 'Оның сұрша түсі бар.' },
  { term: 'сөмке', translation_ru: 'сумка', theme: 'путешествия', level: 'A1', example_sentence: 'Менің сөмкем ауыр.' },
  { term: 'есім', translation_ru: 'имя', theme: 'человек и общение', level: 'A2', example_sentence: 'Сенің есімің қалай?' },
  { term: 'көрші', translation_ru: 'сосед', theme: 'человек и общение', level: 'A2', example_sentence: 'Біздің көршіміз өте мейірімді.' },
  { term: 'қабылдану', translation_ru: 'быть зачисленным/принятым', theme: 'работа и учёба', level: 'B1', example_sentence: 'Ол университетке қабылданды.' },
  { term: 'тілашар', translation_ru: 'разговорник', theme: 'человек и общение', level: 'A2', example_sentence: 'Саяхатқа тілашар алдым.' },
  { term: 'туыс', translation_ru: 'родственник', theme: 'человек и общение', level: 'A2', example_sentence: 'Бізде туыстар көп.' },
  { term: 'жатақхана', translation_ru: 'общежитие', theme: 'дом', level: 'A2', example_sentence: 'Мен жатақханада тұрамын.' },
  { term: 'зейнеткер', translation_ru: 'пенсионер', theme: 'человек и общение', level: 'A2', example_sentence: 'Менің әжем — зейнеткер.' },

  // природа и религия
  { term: 'дін', translation_ru: 'религия', theme: 'природа и религия', level: 'B1', example_sentence: 'Әр елдің өз діни дәстүрі бар.' },
  { term: 'құзғын', translation_ru: 'стервятник, ворон', theme: 'природа и религия', level: 'B1', example_sentence: 'Аспанда құзғын ұшып жүр.' },
  { term: 'қоректену', translation_ru: 'питаться', theme: 'глаголы', level: 'B1', example_sentence: 'Балықтар су жәндіктерімен қоректенеді.' },
  { term: 'жəндік', translation_ru: 'живность, существо', theme: 'природа и религия', level: 'B1', example_sentence: 'Өзенде түрлі жәндік бар.' },

  // чувства и абстракции
  { term: 'сөну', translation_ru: 'гаснуть', theme: 'глаголы', level: 'B1', example_sentence: 'Күн батқанда от сөнді.' },
  { term: 'қорлық', translation_ru: 'унижение', theme: 'чувства и абстракции', level: 'B1', example_sentence: 'Ол мұндай қорлыққа шыдамады.' },
  { term: 'ар', translation_ru: 'честь', theme: 'чувства и абстракции', level: 'B1', example_sentence: 'Ар-намыс — маңызды қасиет.' },
  { term: 'ұят', translation_ru: 'стыд', theme: 'чувства и абстракции', level: 'A2', example_sentence: 'Маған ұят болды.' },
  { term: 'құрметтеу', translation_ru: 'уважать', theme: 'глаголы', level: 'A2', example_sentence: 'Үлкенді құрметте.' },
  { term: 'қайталау', translation_ru: 'повторять', theme: 'глаголы', level: 'A2', example_sentence: 'Сөзді тағы бір қайталаңызшы.' },
  { term: 'мүдірмей', translation_ru: 'без запинки', theme: 'человек и общение', level: 'B1', example_sentence: 'Ол өлеңді мүдірмей оқыды.' },
  { term: 'тəуірлену', translation_ru: 'становиться лучше', theme: 'глаголы', level: 'B1', example_sentence: 'Оның қазақшасы тәуірленді.' },
  { term: 'дүние', translation_ru: 'мир, вселенная', theme: 'чувства и абстракции', level: 'A2', example_sentence: 'Дүние кең екен.' },
  { term: 'тану', translation_ru: 'узнавать', theme: 'глаголы', level: 'A2', example_sentence: 'Мені танисың ба?' },
  { term: 'тəкəппар', translation_ru: 'надменный, гордый', theme: 'качества', level: 'B1', example_sentence: 'Ол тым тәкәппар адам.' },

  // общество и идентичность
  { term: 'ту', translation_ru: 'знамя, флаг', theme: 'общество и идентичность', level: 'A2', example_sentence: 'Мемлекеттің туы желбіреп тұр.' },
  { term: 'ана тілі', translation_ru: 'родной (материнский) язык', theme: 'общество и идентичность', level: 'A2', example_sentence: 'Ана тілін білу — үлкен байлық.' },
  { term: 'ұрпақ', translation_ru: 'поколение', theme: 'общество и идентичность', level: 'B1', example_sentence: 'Жас ұрпақ көп нәрсеге қабілетті.' },
  { term: 'зобалаң', translation_ru: 'бедствие, смута', theme: 'общество и идентичность', level: 'B2', example_sentence: 'Ел тарихында талай зобалаң болды.' },
  { term: 'əлсірету', translation_ru: 'ослаблять', theme: 'общество и идентичность', level: 'B1', example_sentence: 'Ұзақ ауру денені әлсіретеді.' },
  { term: 'сіңіп кету', translation_ru: 'ассимилироваться', theme: 'общество и идентичность', level: 'B2', example_sentence: 'Кейбір ұрпақ басқа мәдениетке сіңіп кетеді.' },
  { term: 'жақындасу', translation_ru: 'сближаться', theme: 'общество и идентичность', level: 'B1', example_sentence: 'Екі отбасы бірте-бірте жақындасты.' },
  { term: 'бейім', translation_ru: 'склонный', theme: 'качества', level: 'B1', example_sentence: 'Ол тез үйренуге бейім.' },
  { term: 'қайсар', translation_ru: 'стойкий, упорный', theme: 'качества', level: 'B1', example_sentence: 'Ол қайсар мінезді адам.' },
  { term: 'ақын', translation_ru: 'поэт', theme: 'общество и идентичность', level: 'A2', example_sentence: 'Абай — ұлы қазақ ақыны.' },
  { term: 'жыр', translation_ru: 'поэма, песнь', theme: 'общество и идентичность', level: 'B1', example_sentence: 'Ол ескі жырды жатқа біледі.' },
  { term: 'күрескер', translation_ru: 'борец', theme: 'общество и идентичность', level: 'B1', example_sentence: 'Ол әділдік үшін күрескер болды.' }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM cards WHERE language = ? AND term = ?');
  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, theme, example_sentence, level)
     VALUES ('kz', @term, @translation_ru, @theme, @example_sentence, @level)`
  );
  const insertProgress = db.prepare('INSERT INTO progress (card_id) VALUES (?)');

  let inserted = 0;
  const insertAll = db.transaction(() => {
    for (const card of KZ_CARDS) {
      if (existsStmt.get('kz', card.term)) continue; // idempotent
      const info = insertCard.run(card);
      insertProgress.run(info.lastInsertRowid);
      inserted += 1;
    }
  });

  insertAll();
  console.log(`Seeded ${inserted} Kazakh cards (${KZ_CARDS.length - inserted} already existed).`);
}

seed();
