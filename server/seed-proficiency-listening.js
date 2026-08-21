// Content for the proficiency test's listening section (Этап B):
// original short passages (2-4 sentences, never copied from
// reading_texts) for the "listen and answer" sub-type, plus minimal
// pairs for the "which word did you hear" sub-type.
//
// Kazakh minimal pairs are deliberately incomplete. қ/к and ғ/г are
// vowel-harmony-conditioned allophones in Kazakh (қ only pairs with
// back vowels, к only with front vowels), so a real independent-word
// minimal pair differing ONLY in that consonant, with everything else
// identical, is essentially impossible to construct honestly -- forcing
// one would mean inventing a non-word. і/и is similarly hard: "и" is
// mostly a loanword letter in native vocabulary. Covered instead:
// о/ө, н/ң, ұ/у, ү/у, all verified as genuinely real Kazakh word pairs.
import { db } from './db/index.js';

const LISTENING_TEXTS = [
  {
    language: 'kz',
    level: 'A1',
    body: 'Менің атым Айгүл. Мен таңертең сағат жетіде тұрамын. Мен нан және шай ішемін. Кейін жұмысқа барамын.',
    questions: [
      { prompt: 'Айгүл сағат нешеде тұрады?', correct_answer: 'Сағат жетіде', distractors: ['Сағат сегізде', 'Сағат алтыда', 'Сағат тоғызда'] },
      { prompt: 'Ол таңертең не ішеді?', correct_answer: 'Нан және шай', distractors: ['Сүт және кофе', 'Тек су', 'Ештеңе ішпейді'] }
    ]
  },
  {
    language: 'kz',
    level: 'A2',
    body: 'Кеше мен базарға бардым. Базарда жеміс пен көкөніс сатып алдым. Үйге қайтқанда жаңбыр жауды. Мен қатты дымқыл болдым, бірақ көңілді едім.',
    questions: [
      { prompt: 'Автор кеше қайда барды?', correct_answer: 'Базарға', distractors: ['Дүкенге', 'Жұмысқа', 'Мектепке'] },
      { prompt: 'Үйге қайтқанда ауа райы қандай болды?', correct_answer: 'Жаңбыр жауды', distractors: ['Күн шықты', 'Қар жауды', 'Жел соқты'] },
      { prompt: 'Автор қалай сезінді?', correct_answer: 'Дымқыл, бірақ көңілді', distractors: ['Қуанышты және құрғақ', 'Ашулы', 'Шаршаған'] }
    ]
  },
  {
    language: 'en',
    level: 'B1',
    body: 'Every Monday, our team has a short meeting. We talk about the tasks for the week. Sometimes the meeting is short, sometimes it takes an hour. After the meeting, everyone goes back to work.',
    questions: [
      { prompt: 'When does the team have their meeting?', correct_answer: 'Every Monday', distractors: ['Every Friday', 'Every day', 'Once a month'] },
      { prompt: 'What do they talk about?', correct_answer: 'Tasks for the week', distractors: ['Company profits', 'Vacation plans', 'New hires'] },
      { prompt: 'How long can the meeting take?', correct_answer: 'Up to an hour', distractors: ['Exactly ten minutes', 'Always two hours', 'It never ends'] }
    ]
  },
  {
    language: 'en',
    level: 'B2',
    body: 'Working from home has become far more common over the past few years. Some people say it improves their focus, since there are fewer interruptions than in a busy office. Others miss the casual conversations that used to happen naturally throughout the day. Most companies now offer a mix of both options.',
    questions: [
      { prompt: 'What do some people say working from home improves?', correct_answer: 'Their focus', distractors: ['Their salary', 'Their commute', 'Their typing speed'] },
      { prompt: 'What do others say they miss?', correct_answer: 'Casual conversations', distractors: ['Free coffee', 'Office chairs', 'Public transport'] },
      { prompt: 'What do most companies offer now?', correct_answer: 'A mix of both options', distractors: ['Only remote work', 'Only office work', 'No flexibility at all'] }
    ]
  }
];

const MINIMAL_PAIRS = [
  { language: 'kz', word_a: 'от', word_b: 'өт', contrast_label: 'о / ө' },
  { language: 'kz', word_a: 'сен', word_b: 'сең', contrast_label: 'н / ң' },
  { language: 'kz', word_a: 'тұр', word_b: 'тур', contrast_label: 'ұ / у' },
  { language: 'kz', word_a: 'түр', word_b: 'тур', contrast_label: 'ү / у' },
  { language: 'en', word_a: 'ship', word_b: 'sheep', contrast_label: 'ɪ / iː' },
  { language: 'en', word_a: 'full', word_b: 'fool', contrast_label: 'ʊ / uː' },
  { language: 'en', word_a: 'live', word_b: 'leave', contrast_label: 'ɪ / iː' },
  { language: 'en', word_a: 'bit', word_b: 'beat', contrast_label: 'ɪ / iː' }
];

function seed() {
  const existsText = db.prepare(
    'SELECT id FROM proficiency_listening_texts WHERE language = ? AND level = ? AND body = ?'
  );
  const insertText = db.prepare(
    `INSERT INTO proficiency_listening_texts (language, level, body, comprehension_questions) VALUES (?, ?, ?, ?)`
  );
  const existsPair = db.prepare('SELECT id FROM proficiency_minimal_pairs WHERE language = ? AND word_a = ? AND word_b = ?');
  const insertPair = db.prepare(
    'INSERT INTO proficiency_minimal_pairs (language, word_a, word_b, contrast_label) VALUES (?, ?, ?, ?)'
  );

  let textsInserted = 0;
  let pairsInserted = 0;

  const run = db.transaction(() => {
    for (const t of LISTENING_TEXTS) {
      if (existsText.get(t.language, t.level, t.body)) continue;
      insertText.run(t.language, t.level, t.body, JSON.stringify(t.questions));
      textsInserted += 1;
    }
    for (const p of MINIMAL_PAIRS) {
      if (existsPair.get(p.language, p.word_a, p.word_b)) continue;
      insertPair.run(p.language, p.word_a, p.word_b, p.contrast_label);
      pairsInserted += 1;
    }
  });

  run();
  console.log(`Inserted ${textsInserted} listening texts, ${pairsInserted} minimal pairs.`);
}

seed();
