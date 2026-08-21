// Reading section, first batch: one 'textbook' text (tightly built from
// existing deck vocabulary) and one 'genre' text (authentic register --
// a fairy tale / a marketing article -- allowed more new words) per
// language. Everything here is original writing, never copied from an
// external source (same rule as the vocab decks). Content grows over
// time the same way vocab/grammar did -- this is a starting batch, not
// a finished library.
import { db } from './db/index.js';

const TEXTS = [
  {
    slug: 'kz-family-trip',
    language: 'kz',
    title: 'Отбасылық саяхат',
    theme: 'бытовое',
    level: 'A2',
    style: 'textbook',
    body: `Біздің отбасы жазда саяхатқа шықты. Біз ұшақпен Алматыға бардық. Әуежайда көп адам болды. Менің әкем мен шешем қуанышты еді.

Алматыда біз қонақүйде тұрдық. Қонақүй үлкен және таза болды. Таңертең біз таңғы ас іштік: нан, ірімшік, шай және кофе.

Күндіз біз тауға бардық. Тау өте биік және әдемі болды. Ауа райы жылы болды, күн шықты. Біз саябақта серуендедік және фотосуретке түстік.

Кешке біз базарға бардық. Базарда жеміс, көкөніс және сувенир сатылады. Мен анама гүл сатып алдым, ол өте қуанды.

Бес күннен кейін біз үйге қайттық. Саяхат тамаша болды! Біз көп нәрсе көрдік және жаңа орындарды білдік.`,
    new_words: [
      { term: 'отбасы', translation_ru: 'семья' },
      { term: 'сувенир', translation_ru: 'сувенир' },
      { term: 'тамаша', translation_ru: 'прекрасно, замечательно' }
    ],
    exercises: [
      { prompt: 'Отбасы қай көлікпен саяхатқа шықты?', correct_answer: 'Ұшақпен', distractors: ['Пойызбен', 'Автобуспен', 'Көлікпен'] },
      { prompt: 'Олар қай қалаға барды?', correct_answer: 'Алматыға', distractors: ['Астанаға', 'Шымкентке', 'Түркістанға'] },
      { prompt: 'Тауда ауа райы қандай болды?', correct_answer: 'Жылы', distractors: ['Суық', 'Жаңбырлы', 'Аязды'] },
      { prompt: 'Саяхат неше күнге созылды?', correct_answer: 'Бес күн', distractors: ['Үш күн', 'Он күн', 'Бір апта'] }
    ]
  },
  {
    slug: 'kz-fox-and-hare',
    language: 'kz',
    title: 'Түлкі мен қоян',
    theme: 'фэнтези и рассказы',
    level: 'B1',
    style: 'genre',
    body: `Ертеде бір орманда түлкі мен қоян тұрды. Түлкі қулығымен танымал болды, ал қоян жылдам жүгіретін.

Бір күні қоян далада шөп жеп жүрді. Кенеттен ол түлкіні көрді. Түлкі оған жақындап келді.

— Сәлем, қоян! — деді түлкі. — Сен неге жалғызсың?

Қоян қорықты, бірақ жауап берді:

— Мен тамақ іздеп жүрмін. Орманда жеміс аз қалды.

Түлкі ойлады: «Мен оны алдап, тамағыма айналдырамын». Бірақ қоян да ақымақ емес еді. Ол түлкінің көзінен қулықты байқады.

— Маған сенің көмегің керек, — деді қоян. — Тауда үлкен алма ағашы бар. Бірге барайық па?

Түлкі келісті. Бірақ тауға барар жолда қоян жылдам жүгіріп кетті. Түлкі оны қуа алмады — қоян одан жылдамырақ еді.

Осылай қоян ақылмен өзін құтқарды. Ол үйіне аман-есен жетті.`,
    new_words: [
      { term: 'кенеттен', translation_ru: 'вдруг' },
      { term: 'жақындау', translation_ru: 'приближаться' },
      { term: 'жалғыз', translation_ru: 'один, одинокий' },
      { term: 'іздеу', translation_ru: 'искать' },
      { term: 'аз', translation_ru: 'мало' },
      { term: 'ойлау', translation_ru: 'думать' },
      { term: 'алдау', translation_ru: 'обманывать' },
      { term: 'ақымақ', translation_ru: 'глупый' },
      { term: 'көмек', translation_ru: 'помощь' },
      { term: 'жол', translation_ru: 'дорога, путь' },
      { term: 'қуу', translation_ru: 'гнаться, преследовать' },
      { term: 'құтқару', translation_ru: 'спасать' },
      { term: 'аман-есен', translation_ru: 'целый и невредимый' },
      { term: 'жету', translation_ru: 'добраться, достичь' }
    ],
    exercises: [
      { prompt: 'Орманда кімдер тұрды?', correct_answer: 'Түлкі мен қоян', distractors: ['Қасқыр мен аю', 'Ит пен мысық', 'Құс пен балық'] },
      {
        prompt: 'Түлкі қоянды неге алдағысы келді?',
        correct_answer: 'Оны тамағына айналдыру үшін',
        distractors: ['Онымен дос болу үшін', 'Оған көмектесу үшін', 'Ойнау үшін']
      },
      {
        prompt: 'Қоян түлкіні қалай алдады?',
        correct_answer: 'Жылдам жүгіріп қашып кетті',
        distractors: ['Ағашқа өрмелеп шықты', 'Су астына тығылды', 'Ұйықтап қалды']
      },
      {
        prompt: 'Ертегінің соңында не болды?',
        correct_answer: 'Қоян үйіне аман-есен жетті',
        distractors: ['Түлкі қоянды ұстады', 'Екеуі дос болды', 'Қоян адасып қалды']
      }
    ]
  },
  {
    slug: 'en-marketing-agency-day',
    language: 'en',
    title: 'A Typical Day at a Marketing Agency',
    theme: 'профессиональные',
    level: 'B2',
    style: 'textbook',
    body: `Sarah works at a marketing agency downtown. Every morning, she checks her email and prepares for the daily meeting with her team.

Today, there's a kickoff meeting for a new project. Her manager wants to delegate several tasks to different team members. Sarah is responsible for the client's social media strategy, so she needs to align on the timeline with the creative department.

During the meeting, a colleague raises a concern about the deadline. It seems too tight, given the amount of work involved. The team decides to weigh the pros and cons before making a final decision. Eventually, they agree to negotiate a slightly longer deadline with the client.

After the meeting, Sarah has a one-on-one with her manager. They discuss her recent performance review. Her manager says she has made a lot of progress this quarter and mentions the possibility of a promotion soon.

By the end of the day, Sarah feels accountable for her part of the project, but also excited about what's ahead.`,
    new_words: [
      { term: 'one-on-one', translation_ru: 'личная встреча тет-а-тет' },
      { term: 'downtown', translation_ru: 'центр города, деловой район' },
      { term: 'a tight deadline', translation_ru: 'сжатый срок' }
    ],
    exercises: [
      {
        prompt: "What does Sarah's team decide to do about the tight deadline?",
        correct_answer: 'Negotiate a slightly longer deadline with the client',
        distractors: ['Cancel the project', 'Work overtime without telling the client', 'Ignore the concern and proceed']
      },
      {
        prompt: 'What is Sarah responsible for in the new project?',
        correct_answer: "The client's social media strategy",
        distractors: ["The company's budget", 'Hiring new employees', "The office's daily schedule"]
      },
      {
        prompt: "What does Sarah's manager mention during their one-on-one?",
        correct_answer: 'The possibility of a promotion',
        distractors: ['A pay cut', 'A move to another department', 'Sarah being let go']
      },
      {
        prompt: 'How does Sarah feel by the end of the day?',
        correct_answer: 'Accountable and excited',
        distractors: ['Bored and indifferent', 'Angry and frustrated', 'Confused and lost']
      }
    ]
  },
  {
    slug: 'en-brand-digital-detox',
    language: 'en',
    title: 'Why Your Brand Needs a Digital Detox',
    theme: 'маркетинговые статьи',
    level: 'C1',
    style: 'genre',
    body: `Every marketing team eventually hits a wall: engagement drops, the algorithm shifts overnight, and yesterday's viral post feels like ancient history. It's tempting to chase every trend and jump on the bandwagon of whatever's trending this week. But here's an uncomfortable truth: constantly reacting is a slippery slope toward burnout, both for your team and your brand's identity.

Think of it this way. A brand that never pauses to reflect is a lot like someone doomscrolling at 2am -- technically active, but not actually moving forward. The most resilient brands aren't the loudest ones; they're the ones with genuine self-awareness about what they stand for.

So what does a "digital detox" look like for a brand? It means stepping back from the noise, reading the room instead of just posting into the void, and being honest about what's actually working versus what just feels productive.

At the end of the day, audiences can tell the difference between a brand that's authentically present and one that's just going through the motions. Arguably, that authenticity is the only thing an algorithm can't fake.`,
    new_words: [
      { term: 'going through the motions', translation_ru: 'делать что-то механически, без энтузиазма' },
      { term: 'ancient history', translation_ru: '(разг.) давно забытое, неактуальное' },
      { term: 'authenticity', translation_ru: 'подлинность, аутентичность' }
    ],
    exercises: [
      {
        prompt: "According to the article, what's the real risk of constantly chasing trends?",
        correct_answer: "Burnout and losing the brand's genuine identity",
        distractors: ['Losing followers immediately', 'Running out of content ideas', 'Spending too much on ads']
      },
      {
        prompt: 'What comparison does the author make to describe reactive brands?',
        correct_answer: 'Someone doomscrolling at 2am -- active but not moving forward',
        distractors: ['A ship without a captain', 'A student cramming for an exam', 'A car without fuel']
      },
      {
        prompt: 'What does the author say resilient brands have in common?',
        correct_answer: 'Genuine self-awareness about what they stand for',
        distractors: ['The biggest advertising budget', 'The most followers', 'The fastest posting schedule']
      },
      {
        prompt: "What can't an algorithm fake, according to the article?",
        correct_answer: 'Authenticity',
        distractors: ['Engagement numbers', 'Follower count', 'Posting frequency']
      }
    ]
  }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM reading_texts WHERE slug = ?');
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM reading_texts');
  const insertText = db.prepare(
    `INSERT INTO reading_texts (language, slug, title, theme, level, style, body, order_index)
     VALUES (@language, @slug, @title, @theme, @level, @style, @body, @order_index)`
  );
  const insertWord = db.prepare('INSERT INTO reading_new_words (text_id, term, translation_ru, position) VALUES (?, ?, ?, ?)');
  const insertExercise = db.prepare(
    'INSERT INTO reading_exercises (text_id, prompt, correct_answer, distractors, position) VALUES (?, ?, ?, ?, ?)'
  );

  let inserted = 0;
  const skipped = [];
  const insertAll = db.transaction((texts) => {
    let order = maxOrder.get().m;
    for (const text of texts) {
      if (existsStmt.get(text.slug)) {
        skipped.push(text.slug);
        continue;
      }
      order += 1;
      const info = insertText.run({
        language: text.language,
        slug: text.slug,
        title: text.title,
        theme: text.theme,
        level: text.level,
        style: text.style,
        body: text.body,
        order_index: order
      });
      text.new_words.forEach((w, i) => insertWord.run(info.lastInsertRowid, w.term, w.translation_ru, i));
      text.exercises.forEach((e, i) =>
        insertExercise.run(info.lastInsertRowid, e.prompt, e.correct_answer, JSON.stringify(e.distractors), i)
      );
      inserted += 1;
    }
  });

  insertAll(TEXTS);
  console.log(`Inserted ${inserted} reading texts (${TEXTS.length} candidates, ${skipped.length} already existed).`);
  if (skipped.length > 0) console.log('Skipped:', skipped);
}

seed();
