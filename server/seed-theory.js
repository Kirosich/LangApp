import { db } from './db/index.js';

const COURSES = [
  {
    title: 'Казахский — грамматика (self-study)',
    description:
      '20-часовой план, 8 блоков. Отметки "пройдено" по блокам — черновая раскладка уже освоенных тем, ' +
      'поправьте распределение по блокам, если что-то не туда.',
    blocks: [
      {
        title: 'Повторение местоимений/множественного числа',
        status: 'in_progress',
        items: [
          { label: 'Суффиксы множественного числа (лар/дар/тар)', done: true },
          { label: 'Личные местоимения и предикативные суффиксы (мын/мін, сіз, біз)', done: true },
          { label: 'Сингармонизм (vowel harmony)', done: true },
          { label: 'Вопросительные частицы', done: true },
          { label: 'Превосходная степень', done: true }
        ]
      },
      { title: 'Притяжательные окончания', status: 'not_started', items: [] },
      {
        title: 'Падежи',
        status: 'in_progress',
        items: [{ label: 'Базовые падежные конструкции', done: true }]
      },
      {
        title: 'Времена глаголов',
        status: 'in_progress',
        items: [{ label: 'Образование времён глагола', done: true }]
      },
      {
        title: 'Дополнительные глагольные формы',
        status: 'in_progress',
        items: [
          { label: 'Дезидеративные конструкции (хотение)', done: true },
          { label: 'Вспомогательные глаголы (напр. жіберу — мгновенность действия)', done: true }
        ]
      },
      { title: 'Модальные конструкции', status: 'not_started', items: [] },
      { title: 'Причастия и деепричастия', status: 'not_started', items: [] },
      { title: 'Практическая разговорная речь', status: 'not_started', items: [] }
    ]
  },
  {
    title: 'English Grammar — Elijah',
    description:
      '20 часов, уровень B2 (самооценка). Примеры берутся из реальных проектов: маркетинговое агентство, ' +
      'эфиргейм.рф, TikTok-стримы. Параллельно ведётся markdown-трекер ' +
      '/mnt/user-data/outputs/english-grammar-plan-20h.md — это внутренний дубль для langapp.',
    blocks: [
      {
        title: 'Perfect Tenses (приоритет)',
        status: 'in_progress',
        planned_minutes: 360,
        logged_minutes: 23,
        items: [
          {
            label: 'Present Perfect vs Past Simple — концепция',
            done: true,
            notes: 'Present Perfect = результат актуален сейчас; Past Simple = завершённый факт в прошлом'
          },
          { label: 'Практика already/just/yet/never', done: false },
          { label: 'Past Perfect', done: false, notes: 'стабильно пропускается — слабое место' },
          { label: 'Порядок слов с "already"', done: false }
        ]
      },
      { title: 'Conditionals', status: 'not_started', planned_minutes: 240, items: [] },
      {
        title: 'Articles',
        status: 'not_started',
        planned_minutes: 240,
        items: [{ label: '"a free time" → "free time" (неисчисляемые)', done: false }]
      },
      {
        title: 'Prepositions',
        status: 'not_started',
        planned_minutes: 180,
        items: [{ label: '"in the marketing agency" → "at a marketing agency"', done: false }]
      },
      {
        title: 'Свободная практика / финальный тест',
        status: 'not_started',
        planned_minutes: 180,
        items: [
          { label: 'Согласование has/have в 3-м лице ед. числа', done: false },
          { label: 'Согласование числа this/these', done: false }
        ]
      }
    ]
  }
];

function seedTheory() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM theory_courses').get().count;
  if (existing > 0) {
    console.log(`Skipping theory seed: theory_courses already has ${existing} row(s).`);
    return;
  }

  const insertCourse = db.prepare('INSERT INTO theory_courses (title, description, position) VALUES (?, ?, ?)');
  const insertBlock = db.prepare(
    `INSERT INTO theory_blocks (course_id, position, title, status, planned_minutes, logged_minutes)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare('INSERT INTO theory_items (block_id, position, label, done, notes) VALUES (?, ?, ?, ?, ?)');

  const insertAll = db.transaction((courses) => {
    courses.forEach((course, courseIndex) => {
      const courseInfo = insertCourse.run(course.title, course.description ?? null, courseIndex);
      course.blocks.forEach((block, blockIndex) => {
        const blockInfo = insertBlock.run(
          courseInfo.lastInsertRowid,
          blockIndex,
          block.title,
          block.status ?? 'not_started',
          block.planned_minutes ?? null,
          block.logged_minutes ?? 0
        );
        block.items.forEach((item, itemIndex) => {
          insertItem.run(blockInfo.lastInsertRowid, itemIndex, item.label, item.done ? 1 : 0, item.notes ?? null);
        });
      });
    });
  });

  insertAll(COURSES);
  console.log(`Seeded ${COURSES.length} theory courses.`);
}

seedTheory();
