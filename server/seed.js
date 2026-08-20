import { db } from './db/index.js';

const CARDS = [
  // Kazakh — basic everyday phrases
  { language: 'kz', term: 'Сәлем', translation_ru: 'привет', transcription: null, theme: 'бытовое', example_sentence: 'Сәлем, қалайсың?' },
  { language: 'kz', term: 'Рахмет', translation_ru: 'спасибо', transcription: null, theme: 'бытовое', example_sentence: 'Көмегің үшін рахмет.' },
  { language: 'kz', term: 'Кешіріңіз', translation_ru: 'извините', transcription: null, theme: 'бытовое', example_sentence: 'Кешіріңіз, кешіктім.' },
  { language: 'kz', term: 'Иә', translation_ru: 'да', transcription: null, theme: 'бытовое', example_sentence: 'Иә, мен келісемін.' },
  { language: 'kz', term: 'Жоқ', translation_ru: 'нет', transcription: null, theme: 'бытовое', example_sentence: 'Жоқ, рахмет, керек емес.' },

  // English
  { language: 'en', term: 'Water', translation_ru: 'вода', transcription: 'ˈwɔːtər', theme: 'еда', example_sentence: 'Can I have some water?' },
  { language: 'en', term: 'Bread', translation_ru: 'хлеб', transcription: 'brɛd', theme: 'еда', example_sentence: 'She bought fresh bread.' },
  { language: 'en', term: 'Tree', translation_ru: 'дерево', transcription: 'triː', theme: 'природа', example_sentence: 'A tall tree grows in the yard.' },
  { language: 'en', term: 'Run', translation_ru: 'бежать', transcription: 'rʌn', theme: 'глаголы', example_sentence: 'I run every morning.' },
  { language: 'en', term: 'Sun', translation_ru: 'солнце', transcription: 'sʌn', theme: 'природа', example_sentence: 'The sun is shining today.' },

  // Extra mix covering numbers/time and verbs
  { language: 'kz', term: 'Бір', translation_ru: 'один', transcription: null, theme: 'числа/время', example_sentence: 'Бір, екі, үш.' },
  { language: 'kz', term: 'Су', translation_ru: 'вода', transcription: null, theme: 'еда', example_sentence: 'Су ішкің келе ме?' },
  { language: 'en', term: 'One', translation_ru: 'один', transcription: 'wʌn', theme: 'числа/время', example_sentence: 'I need just one.' },
  { language: 'kz', term: 'Жүру', translation_ru: 'идти/ходить', transcription: null, theme: 'глаголы', example_sentence: 'Мен саябаққа жүремін.' },
  { language: 'en', term: 'Today', translation_ru: 'сегодня', transcription: 'təˈdeɪ', theme: 'числа/время', example_sentence: 'Today is a good day.' }
];

function seed() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM cards').get().count;
  if (existing > 0) {
    console.log(`Skipping seed: cards table already has ${existing} row(s).`);
    return;
  }

  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence)
     VALUES (@language, @term, @translation_ru, @transcription, @theme, @example_sentence)`
  );
  const insertProgress = db.prepare('INSERT INTO progress (card_id) VALUES (?)');

  const insertAll = db.transaction((cards) => {
    for (const card of cards) {
      const info = insertCard.run(card);
      insertProgress.run(info.lastInsertRowid);
    }
  });

  insertAll(CARDS);
  console.log(`Seeded ${CARDS.length} cards.`);
}

seed();
