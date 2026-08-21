import { db } from './db/index.js';

// City scenario dialogues (Stage 10, wave 2). Built predominantly from
// vocabulary already in the `cards` deck (greetings, question words,
// покупки-и-деньги, транспорт themes) -- this is reinforcement, not a
// vehicle for new words. Each dialogue's small unavoidable set of new
// words (numbers, a couple of scenario nouns) is listed explicitly in
// new_words rather than silently mixed in.
const DIALOGUES = [
  {
    slug: 'kz-dialogue-bazaar',
    language: 'kz',
    title: 'Базарда',
    scenario: 'базар',
    level: 'A1-A2',
    lines: [
      { speaker: 'Сатушы', text: 'Сәлеметсіз бе! Не керек?', translation_ru: 'Здравствуйте! Что вам нужно?' },
      { speaker: 'Сіз', text: 'Сәлем! Су бар ма?', translation_ru: 'Здравствуйте! Есть вода?' },
      { speaker: 'Сатушы', text: 'Иә, бар.', translation_ru: 'Да, есть.' },
      { speaker: 'Сіз', text: 'Қанша тұрады?', translation_ru: 'Сколько стоит?' },
      { speaker: 'Сатушы', text: 'Екі жүз теңге.', translation_ru: 'Двести тенге.' },
      { speaker: 'Сіз', text: 'Қымбат екен. Жеңілдік бар ма?', translation_ru: 'Дороговато. Скидка есть?' },
      { speaker: 'Сатушы', text: 'Жоқ, кешіріңіз. Баға осындай.', translation_ru: 'Нет, извините. Цена такая.' },
      { speaker: 'Сіз', text: 'Жарайды, аламын. Міне ақша.', translation_ru: 'Хорошо, беру. Вот деньги.' },
      { speaker: 'Сатушы', text: 'Рахмет! Міне қайтарым және чек.', translation_ru: 'Спасибо! Вот сдача и чек.' },
      { speaker: 'Сіз', text: 'Сау болыңыз!', translation_ru: 'До свидания!' }
    ],
    new_words: [
      { term: 'керек', translation_ru: 'нужно, надо' },
      { term: 'екі', translation_ru: 'два' },
      { term: 'жүз', translation_ru: 'сто' },
      { term: 'теңге', translation_ru: 'тенге (валюта)' },
      { term: 'екен', translation_ru: 'частица «оказывается»' },
      { term: 'осындай', translation_ru: 'такой, такая' },
      { term: 'аламын', translation_ru: 'беру (от «алу»)' },
      { term: 'міне', translation_ru: 'вот' },
      { term: 'және', translation_ru: 'и' }
    ]
  },
  {
    slug: 'kz-dialogue-taxi',
    language: 'kz',
    title: 'Таксиде',
    scenario: 'такси',
    level: 'A1-A2',
    lines: [
      { speaker: 'Сіз', text: 'Сәлеметсіз бе! Үйге барамыз ба?', translation_ru: 'Здравствуйте! Поедем домой?' },
      { speaker: 'Жүргізуші', text: 'Иә, отырыңыз. Қай көшеге?', translation_ru: 'Да, садитесь. На какую улицу?' },
      { speaker: 'Сіз', text: 'Абай көшесіне, өтінемін.', translation_ru: 'На улицу Абая, пожалуйста.' },
      { speaker: 'Жүргізуші', text: 'Жарайды.', translation_ru: 'Хорошо.' },
      { speaker: 'Сіз', text: 'Қанша уақыт керек?', translation_ru: 'Сколько времени нужно?' },
      { speaker: 'Жүргізуші', text: 'Он бес минут.', translation_ru: 'Пятнадцать минут.' },
      { speaker: 'Сіз', text: 'Қанша төлеймін?', translation_ru: 'Сколько платить?' },
      { speaker: 'Жүргізуші', text: 'Мың бес жүз теңге.', translation_ru: 'Тысяча пятьсот тенге.' },
      { speaker: 'Сіз', text: 'Міне, қолма-қол ақша. Рахмет!', translation_ru: 'Вот, наличные. Спасибо!' },
      { speaker: 'Жүргізуші', text: 'Сау болыңыз!', translation_ru: 'До свидания!' }
    ],
    new_words: [
      { term: 'отырыңыз', translation_ru: 'садитесь (от «отыру»)' },
      { term: 'өтінемін', translation_ru: 'пожалуйста (прошу)' },
      { term: 'уақыт', translation_ru: 'время' },
      { term: 'минут', translation_ru: 'минута' },
      { term: 'мың', translation_ru: 'тысяча' }
    ]
  },
  {
    slug: 'kz-dialogue-cafe',
    language: 'kz',
    title: 'Кафеде',
    scenario: 'кафе',
    level: 'A1-A2',
    lines: [
      { speaker: 'Даяшы', text: 'Сәлеметсіз бе! Не ішесіз?', translation_ru: 'Здравствуйте! Что будете пить?' },
      { speaker: 'Сіз', text: 'Сәлем! Су, өтінемін.', translation_ru: 'Здравствуйте! Воду, пожалуйста.' },
      { speaker: 'Даяшы', text: 'Тағы бір нәрсе керек пе?', translation_ru: 'Ещё что-нибудь нужно?' },
      { speaker: 'Сіз', text: 'Жоқ, рахмет. Тек су жеткілікті.', translation_ru: 'Нет, спасибо. Только воды достаточно.' },
      { speaker: 'Даяшы', text: 'Жарайды, бір минут.', translation_ru: 'Хорошо, одна минута.' },
      { speaker: 'Сіз', text: 'Рахмет! Қанша төлеймін?', translation_ru: 'Спасибо! Сколько платить?' },
      { speaker: 'Даяшы', text: 'Жүз теңге. Картамен бе, қолма-қол ба?', translation_ru: 'Сто тенге. Картой или наличными?' },
      { speaker: 'Сіз', text: 'Картамен, өтінемін.', translation_ru: 'Картой, пожалуйста.' },
      { speaker: 'Даяшы', text: 'Жарайды. Ас болсын!', translation_ru: 'Хорошо. Приятного аппетита!' }
    ],
    new_words: [
      { term: 'даяшы', translation_ru: 'официант' },
      { term: 'ішесіз', translation_ru: 'пьёте (от «ішу»)' },
      { term: 'тағы', translation_ru: 'ещё' },
      { term: 'бір нәрсе', translation_ru: 'что-то, что-нибудь' },
      { term: 'тек', translation_ru: 'только' },
      { term: 'жеткілікті', translation_ru: 'достаточно' },
      { term: 'Ас болсын', translation_ru: 'Приятного аппетита (устойчивое выражение)' }
    ]
  }
];

function seedDialogues() {
  const getBySlug = db.prepare('SELECT id FROM dialogues WHERE slug = ?');
  const insertDialogue = db.prepare(
    `INSERT INTO dialogues (language, slug, title, scenario, level, order_index) VALUES (@language, @slug, @title, @scenario, @level, @order_index)`
  );
  const insertLine = db.prepare(
    `INSERT INTO dialogue_lines (dialogue_id, position, speaker, text, translation_ru) VALUES (@dialogue_id, @position, @speaker, @text, @translation_ru)`
  );
  const insertNewWord = db.prepare(
    `INSERT INTO dialogue_new_words (dialogue_id, term, translation_ru, position) VALUES (@dialogue_id, @term, @translation_ru, @position)`
  );

  let inserted = 0;

  const insertAll = db.transaction(() => {
    DIALOGUES.forEach((dialogue, order_index) => {
      if (getBySlug.get(dialogue.slug)) return; // idempotent

      const info = insertDialogue.run({
        language: dialogue.language,
        slug: dialogue.slug,
        title: dialogue.title,
        scenario: dialogue.scenario,
        level: dialogue.level,
        order_index
      });
      const dialogueId = info.lastInsertRowid;

      dialogue.lines.forEach((line, position) => {
        insertLine.run({ dialogue_id: dialogueId, position, speaker: line.speaker, text: line.text, translation_ru: line.translation_ru });
      });
      dialogue.new_words.forEach((word, position) => {
        insertNewWord.run({ dialogue_id: dialogueId, term: word.term, translation_ru: word.translation_ru, position });
      });

      inserted += 1;
    });
  });

  insertAll();
  console.log(`Seeded ${inserted} dialogue(s) (${DIALOGUES.length - inserted} already existed).`);
}

seedDialogues();
