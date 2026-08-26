// Original short story (own plot, own dialogue) on the theme of a
// Kazakh abroad meeting a compatriot and talking about their native
// language -- written after the user shared a batch of vocabulary
// glossed from a published story (Есболат Айдабосын, "Тибет аруы") and
// asked for reading material in a similar spirit. That story's actual
// text/dialogue/verse is NOT reproduced anywhere here or in the app
// (see CLAUDE.md "Стратегия обучения" on why); only the underlying
// vocabulary batch was reused, as flashcards, in
// seed-vocab-kz-diaspora.js.
import { db } from './db/index.js';

const TEXT = {
  slug: 'kz-shettegi-kezdesu',
  language: 'kz',
  title: 'Шетелдегі кездесу',
  theme: 'жеке тарих',
  level: 'B1',
  style: 'genre',
  body: `Айгерім Ыстамбұлда оқиды. Ол бір жыл бұрын осында келді. Алдымен қиын болды: тілі бөтен, адамдары бейтаныс, күн сайын сағыныш басты.

Бір күні кітапханада ол таныс дауыс естіді — біреу қазақша сөйлеп тұр екен. Айгерім жалт қарады.

— Кешіріңіз, сіз де қазақсыз ба? — деп сұрады ол қуана.

— Иә! — деп күлді қыз. — Атым — Дана. Мұнда қазақ өте аз, сондықтан таныс дауыс естігенде қуандым.

Олар жақындасып, дос болды. Дана өзінің ана тілін ұмытпау үшін күн сайын қазақша кітап оқитынын айтты. Айгерім де солай істеуге серт берді.

— Ал сен неге дәл осында келдің? — деп сұрады Дана.

— Менің әжем ақын еді, — деді Айгерім. — Ол маған қазақ жырларын жаттатушы еді. Мен оның ана тілін құрметтегенін көріп өстім, сондықтан мен де тілімді ұмытпауға тырысамын.

Енді олар апта сайын кездеседі: қазақша сөйлеседі, ән айтады, елдегі жаңалықтарды бөліседі. Алыста жүрсе де, олар өз ана тілін, өз мәдениетін ешкімге сіңіп кетуге бермейді.`,
  new_words: [
    { term: 'бөтен', translation_ru: 'чужой, незнакомый' },
    { term: 'сағыныш', translation_ru: 'тоска (по дому)' },
    { term: 'бейтаныс', translation_ru: 'незнакомый' },
    { term: 'жаттату', translation_ru: 'заставлять заучивать наизусть' },
    { term: 'мәдениет', translation_ru: 'культура' }
  ],
  exercises: [
    { prompt: 'Айгерім қай қалада оқиды?', correct_answer: 'Ыстамбұлда', distractors: ['Алматыда', 'Мәскеуде', 'Пекинде'] },
    { prompt: 'Дана күн сайын не істейді, ана тілін ұмытпау үшін?', correct_answer: 'Қазақша кітап оқиды', distractors: ['Ән тыңдайды', 'Хат жазады', 'Теледидар көреді'] },
    { prompt: 'Айгерімнің әжесі кім болған?', correct_answer: 'Ақын', distractors: ['Мұғалім', 'Дәрігер', 'Зейнеткер'] },
    { prompt: 'Олар қаншалықты жиі кездеседі?', correct_answer: 'Апта сайын', distractors: ['Күн сайын', 'Ай сайын', 'Жыл сайын'] }
  ]
};

function seed() {
  const existsStmt = db.prepare('SELECT id FROM reading_texts WHERE slug = ?');
  if (existsStmt.get(TEXT.slug)) {
    console.log(`Already exists, skipping: ${TEXT.slug}`);
    return;
  }
  const order = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM reading_texts').get().m + 1;

  const insertAll = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO reading_texts (language, slug, title, theme, level, style, body, order_index)
         VALUES (@language, @slug, @title, @theme, @level, @style, @body, @order_index)`
      )
      .run({ ...TEXT, order_index: order });

    TEXT.new_words.forEach((w, i) =>
      db.prepare('INSERT INTO reading_new_words (text_id, term, translation_ru, position) VALUES (?, ?, ?, ?)').run(info.lastInsertRowid, w.term, w.translation_ru, i)
    );
    TEXT.exercises.forEach((e, i) =>
      db
        .prepare('INSERT INTO reading_exercises (text_id, prompt, correct_answer, distractors, position) VALUES (?, ?, ?, ?, ?)')
        .run(info.lastInsertRowid, e.prompt, e.correct_answer, JSON.stringify(e.distractors), i)
    );
  });

  insertAll();
  console.log(`Inserted reading text: ${TEXT.slug}`);
}

seed();
