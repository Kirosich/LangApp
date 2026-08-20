import { db } from './db/index.js';

// Explanations, examples and framing below are written from scratch for
// this app, aimed at a B2 speaker doing maintenance/refinement rather
// than learning from zero — focused on what actually trips people up.

const TOPICS = [
  {
    slug: 'en-present-perfect-vs-past-simple',
    title: 'Present Perfect vs Past Simple',
    level: 'B2',
    summary: 'Не время действия важно, а связь с настоящим — вот на что реально смотреть при выборе.',
    sections: [
      {
        type: 'explanation',
        content:
          'Забудьте на секунду про "давно/недавно" — это не главный критерий. Главный вопрос: важен ли РЕЗУЛЬТАТ ' +
          'действия сейчас, или вы просто констатируете факт из прошлого?\n\n' +
          'Past Simple — законченное действие, привязанное к конкретному (пусть даже не названному явно) моменту ' +
          'в прошлом. Момент уже "закрыт".\n\n' +
          'Present Perfect — действие произошло когда-то в неопределённом прошлом, но его РЕЗУЛЬТАТ или релевантность ' +
          'сохраняется сейчас. Конкретное время не называется — как только вы называете конкретное время ' +
          '(yesterday, in 2020, last week), Present Perfect автоматически становится невозможным.'
      },
      {
        type: 'example',
        content:
          'I have finished the report. — Отчёт готов (важен результат: он сейчас существует).\n' +
          'I finished the report yesterday at 5pm. — Просто факт из прошлого, с указанием времени.\n' +
          'Have you ever been to Kazakhstan? — Опыт в жизни, без привязки к моменту.\n' +
          'I went to Kazakhstan in 2019. — Конкретная поездка, конкретный год.'
      },
      {
        type: 'common_mistake',
        content:
          'Самая частая ошибка на этом уровне — ставить маркер конкретного времени рядом с Present Perfect: ' +
          '"I have seen him yesterday" — неверно. Раз названо "yesterday", это уже Past Simple: "I saw him yesterday".'
      }
    ]
  },
  {
    slug: 'en-conditionals',
    title: 'Conditionals: 0–3 типа',
    level: 'B2',
    summary: 'Сжатый обзор четырёх типов, с акцентом на разницу между 2-м и 3-м — она путает чаще всего.',
    sections: [
      {
        type: 'explanation',
        content:
          'Zero — общая истина, всегда работает: If + present, present. ' +
          'First — реальная возможность в будущем: If + present, will + base. ' +
          'Second — гипотеза о настоящем/будущем, которая скорее всего не сбудется, но теоретически ещё возможна: ' +
          'If + past simple, would + base. ' +
          'Third — прошлое, которое уже нельзя изменить, чисто гипотетическое "а что если бы тогда было по-другому": ' +
          'If + past perfect, would have + past participle.\n\n' +
          'Ключевое различие 2 и 3: второй тип всё ещё про настоящее/будущее (воображаемая альтернатива, которая ' +
          'теоретически могла бы случиться), третий — про прошлое, которое уже физически невозможно изменить.'
      },
      {
        type: 'example',
        content:
          'If you heat ice, it melts. — 0, всегда так.\n' +
          'If it rains tomorrow, I will stay home. — 1, реально возможно.\n' +
          'If I had more free time, I would learn Kazakh faster. — 2, гипотеза о текущей жизни (у меня нет столько времени).\n' +
          'If I had started earlier, I would have finished by now. — 3, прошлое уже случилось, изменить нельзя.'
      },
      {
        type: 'common_mistake',
        content:
          'Смешение времён внутри одного условия ("If I would have known...") — довольно частая ошибка носителей ' +
          'некоторых языков. В придаточном с if после самого if не используется would — только would/would have ' +
          'в главном предложении.'
      }
    ]
  },
  {
    slug: 'en-phrasal-verbs-work',
    title: 'Phrasal verbs: про работу',
    level: 'B2',
    summary: 'Фразовые глаголы, которые реально звучат в рабочем контексте — не общий список, а тематическая группа.',
    sections: [
      {
        type: 'explanation',
        content:
          'Эти фразовые глаголы часто встречаются в переписке и разговорах на работе — про задачи, дедлайны ' +
          'и рабочие процессы.'
      },
      {
        type: 'example',
        content:
          'take on — взять на себя (доп. обязанности): "I took on a new project this month."\n' +
          'chase up — напомнить/поторопить с чем-то: "Can you chase up the client for a reply?"\n' +
          'run something by someone — обсудить вкратце, спросить мнение: "Let me run this by my manager first."\n' +
          'sort out — разобраться, уладить: "We sorted out the billing issue."\n' +
          'wrap up — завершить: "Let\'s wrap up the meeting."\n' +
          'burn out — перегореть от переработки: "She burned out after months of overtime."'
      }
    ]
  },
  {
    slug: 'en-phrasal-verbs-relationships',
    title: 'Phrasal verbs: про отношения',
    level: 'B2',
    summary: 'Фразовые глаголы для разговоров о людях, дружбе и романтических отношениях.',
    sections: [
      {
        type: 'explanation',
        content: 'Эта группа фразовых глаголов описывает динамику отношений между людьми — от знакомства до расставания.'
      },
      {
        type: 'example',
        content:
          'hit it off — сразу поладить с кем-то: "We hit it off right away."\n' +
          'fall for — влюбиться (или попасться на обман): "He fell for her instantly." / "Don\'t fall for that trick."\n' +
          'make up — помириться: "They had a fight but made up the next day."\n' +
          'break up — расстаться: "They broke up last month."\n' +
          'grow apart — постепенно отдалиться друг от друга: "Old friends sometimes grow apart."\n' +
          'look up to — уважать, восхищаться кем-то: "I\'ve always looked up to my older brother."'
      }
    ]
  },
  {
    slug: 'en-phrasal-verbs-daily-life',
    title: 'Phrasal verbs: про повседневность',
    level: 'B2',
    summary: 'Фразовые глаголы для бытовых ситуаций — покупки, планы, привычные дела.',
    sections: [
      {
        type: 'explanation',
        content: 'Эти фразовые глаголы касаются повседневных бытовых ситуаций, которые случаются почти каждый день.'
      },
      {
        type: 'example',
        content:
          'run out of — закончиться (о запасах): "We ran out of milk."\n' +
          'put off — отложить: "I keep putting off my dentist appointment."\n' +
          'look after — присматривать за кем-то/чем-то: "Can you look after my cat this weekend?"\n' +
          'get by — перебиваться, справляться (обычно с ограниченными средствами): "We get by on a tight budget."\n' +
          'catch up on — наверстать упущенное: "I need to catch up on sleep."\n' +
          'drop by — заскочить ненадолго: "I might drop by after work."'
      }
    ]
  },
  {
    slug: 'en-reported-speech',
    title: 'Reported speech: сдвиг времён',
    level: 'B2',
    summary: 'При пересказе чужих слов времена обычно сдвигаются на шаг назад — и не только времена.',
    sections: [
      {
        type: 'explanation',
        content:
          'Базовое правило backshift: если глагол вступления стоит в прошедшем времени (said, told), время в ' +
          'придаточном обычно сдвигается на шаг назад:\n' +
          'present simple → past simple; present continuous → past continuous; past simple → past perfect; ' +
          'will → would; can → could; must → had to (для обязательства).\n\n' +
          'Сдвигаются и другие слова, привязанные к моменту речи: today → that day, tomorrow → the next day, ' +
          'yesterday → the day before, here → there, this → that.'
      },
      {
        type: 'example',
        content:
          '"I am tired," she said. → She said (that) she was tired.\n' +
          '"I will call you tomorrow," he said. → He said he would call me the next day.\n' +
          '"I saw him yesterday," she said. → She said she had seen him the day before.'
      },
      {
        type: 'common_mistake',
        content:
          'Backshift НЕ применяется, если то, что было сказано, остаётся общей истиной или всё ещё актуально сейчас: ' +
          '"The Earth goes round the Sun," he said. → He said the Earth goes round the Sun (не went!). ' +
          'Также часто забывают сдвинуть модальные глаголы (will→would, can→could), меняя только основной глагол.'
      }
    ]
  },
  {
    slug: 'en-confused-word-pairs',
    title: 'Частые ошибки: путаемые пары слов',
    level: 'B2',
    summary: 'Слова, которые пишутся/звучат похоже, но значат разное — классический источник опечаток даже на высоком уровне.',
    sections: [
      {
        type: 'explanation',
        content:
          'affect (глагол, "влиять") vs effect (существительное, "эффект, результат"): "The weather affects my mood." / "The effect was huge."\n\n' +
          'its (притяжательное, "его/её" — без апострофа) vs it\'s (сокращение "it is/it has"): "The dog wagged its tail." / "It\'s raining."\n\n' +
          'their (притяжательное) vs there (место/there is) vs they\'re (they are): "Their house is there — they\'re proud of it."\n\n' +
          'who\'s (who is/has) vs whose (притяжательное): "Who\'s coming?" / "Whose bag is this?"\n\n' +
          'then (тогда, затем) vs than (сравнение): "First we ate, then we left." / "Better late than never."\n\n' +
          'advice (существительное, неисчисляемое) vs advise (глагол): "Can you give me some advice?" / "I advise you to wait."'
      },
      {
        type: 'common_mistake',
        content:
          'its/it\'s — самая частая ошибка даже у носителей: апостроф в it\'s означает "it is" или "it has", а не притяжательность ' +
          '(в отличие от обычных существительных, где апостроф-s как раз показывает принадлежность — John\'s book).'
      }
    ]
  },
  {
    slug: 'en-modals-deduction-politeness',
    title: 'Модальные глаголы: предположения и вежливость',
    level: 'B2',
    summary: 'must have / could have / might have — как выразить степень уверенности о прошлом, плюс вежливые формы.',
    sections: [
      {
        type: 'explanation',
        content:
          'Для предположений о прошлом используется modal + have + past participle:\n' +
          'must have — уверенное предположение ("наверняка было так"): He must have left already.\n' +
          'could have / might have — возможное, но не точное предположение: She could have forgotten.\n' +
          'can\'t have — уверенное отрицание, "точно не могло быть": He can\'t have said that, it\'s not like him.\n\n' +
          'Для вежливых просьб/предложений на B2 уровне уместны: Could you possibly...? / Would you mind...? / ' +
          'I was wondering if you could... — они звучат мягче, чем прямое Can you...?'
      },
      {
        type: 'example',
        content:
          'The lights are off — they must have left. — Свет выключен, они, должно быть, ушли.\n' +
          'She could have missed the bus, that\'s why she\'s late. — Возможно, она пропустила автобус.\n' +
          'He can\'t have finished already, it\'s only been five minutes. — Не может быть, что он уже закончил.\n' +
          'Would you mind closing the window? — Не могли бы вы закрыть окно?'
      },
      {
        type: 'common_mistake',
        content:
          'Частая ошибка — использовать "must" вместо "must have" для прошлого: "He must left already" неверно, ' +
          'нужно "He must have left already" — обязательно нужен вспомогательный have перед причастием прошедшего времени.'
      }
    ]
  }
];

function seed() {
  const insertTopic = db.prepare(
    `INSERT INTO theory_topics (language, slug, title, level, order_index, summary) VALUES ('en', ?, ?, ?, ?, ?)`
  );
  const insertSection = db.prepare(
    `INSERT INTO theory_sections (topic_id, section_type, content, order_index) VALUES (?, ?, ?, ?)`
  );
  const existsStmt = db.prepare('SELECT id FROM theory_topics WHERE slug = ?');

  let inserted = 0;
  const insertAll = db.transaction((topics) => {
    topics.forEach((topic, index) => {
      if (existsStmt.get(topic.slug)) return;

      const info = insertTopic.run(topic.slug, topic.title, topic.level, index, topic.summary);
      topic.sections.forEach((section, sectionIndex) => {
        insertSection.run(info.lastInsertRowid, section.type, section.content, sectionIndex);
      });
      inserted += 1;
    });
  });

  insertAll(TOPICS);
  console.log(`Seeded ${inserted} English theory topics (${TOPICS.length - inserted} already existed).`);
}

seed();
