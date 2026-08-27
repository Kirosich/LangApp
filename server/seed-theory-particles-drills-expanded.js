// Expands the remaining 6 Kazakh drill topics (negation, question
// particles, postpositions, conjunctions, emphatic particles,
// comparative) from 5 drills each. Negation/question-particles reuse
// the same harmony+voicing "collapse3" system already verified in the
// case/morphology/verb expansions; the rest are vocabulary-driven
// (lower grammatical-rule risk) fill-in-blank sentences.
import { db } from './db/index.js';

const HARMONY_LABEL = { back: 'задние', front: 'передние' };

// ---------------------------------------------------------------------
// kz-negation: verbal -ма/-ме/-ба/-бе/-па/-пе. Reuses the verb bank's
// consonant/vowelRegular/vowelContract split -- vowel and sonorant
// endings both take -ма/-ме (matches existing барма-, кел-ме examples);
// voiceless endings take -па/-пе. (No voicedObstruent-ending verb in
// this bank, so -ба/-бе isn't exercised here -- kept out rather than
// guessed.)
// ---------------------------------------------------------------------
const NEG_VERBS = [
  { word: 'бар', gloss: 'идти', harmony: 'back', voiceless: false },
  { word: 'жаз', gloss: 'писать', harmony: 'back', voiceless: false },
  { word: 'тұр', gloss: 'стоять', harmony: 'back', voiceless: false },
  { word: 'айт', gloss: 'сказать', harmony: 'back', voiceless: true },
  { word: 'кел', gloss: 'приходить', harmony: 'front', voiceless: false },
  { word: 'біл', gloss: 'знать', harmony: 'front', voiceless: false },
  { word: 'жүр', gloss: 'ходить', harmony: 'front', voiceless: false },
  { word: 'өт', gloss: 'проходить', harmony: 'front', voiceless: true },
  { word: 'жаса', gloss: 'делать', harmony: 'back', voiceless: false },
  { word: 'тыңда', gloss: 'слушать', harmony: 'back', voiceless: false },
  { word: 'сөйле', gloss: 'говорить', harmony: 'front', voiceless: false },
  { word: 'ізде', gloss: 'искать', harmony: 'front', voiceless: false },
  { word: 'оқы', gloss: 'читать', harmony: 'back', voiceless: false }
];
const NEG_TABLE = { back: { voiced: 'ма', voiceless: 'па' }, front: { voiced: 'ме', voiceless: 'пе' } };
function negSuffix(v) {
  return NEG_TABLE[v.harmony][v.voiceless ? 'voiceless' : 'voiced'];
}
function negationDrills() {
  const out = [];
  const allForms = ['ма', 'ме', 'па', 'пе'];
  for (const v of NEG_VERBS) {
    const correct = negSuffix(v);
    const distractors = allForms.filter((f) => f !== correct);
    out.push({
      prompt: `Мен ${v.word}___ймын. (я не ${v.gloss} — глагольное отрицание, осы шақ)`,
      correct_answer: correct,
      distractors,
      explanation: `«${v.word}» — ${v.voiceless ? 'глухой согласный' : 'гласная/звонкая-сонорная'} конец, гласные ${HARMONY_LABEL[v.harmony]} → -${correct}-.`
    });
    out.push({
      prompt: `Ол ${v.word}___ді. (он не ${v.gloss === 'идти' ? 'ходил' : v.gloss} — прошедшее)`,
      correct_answer: correct,
      distractors,
      explanation: `Тот же отрицательный суффикс -${correct}- ставится перед суффиксом времени, здесь перед -ді.`
    });
  }
  return out;
}

// ---------------------------------------------------------------------
// kz-question-particles: ма/ме/ба/бе/па/пе, full 3-bucket system (this
// one DOES have a voicedObstruent example, unlike negation).
// ---------------------------------------------------------------------
const Q_WORDS = [
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'адам', gloss: 'человек', harmony: 'back', bucket: 'sonorant' },
  { word: 'жаз', gloss: 'лето', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'тас', gloss: 'камень', harmony: 'back', bucket: 'voiceless' },
  { word: 'түйе', gloss: 'верблюд', harmony: 'front', bucket: 'vowel' },
  { word: 'гүл', gloss: 'цветок', harmony: 'front', bucket: 'sonorant' },
  { word: 'кез', gloss: 'случай', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'бет', gloss: 'лицо', harmony: 'front', bucket: 'voiceless' }
];
// 3 distinct-value groups (vowel and sonorant endings share the same
// particle, unlike ілік/табыс where they differ) -- group vowel+sonorant
// together up front instead of collapsing 4 raw buckets down to 3 late,
// which is what produced a duplicate distractor here on the first pass.
const Q_TABLE = {
  back: { vowelOrSonorant: 'ма', voicedObstruent: 'ба', voiceless: 'па' },
  front: { vowelOrSonorant: 'ме', voicedObstruent: 'бе', voiceless: 'пе' }
};
function questionGroup(bucket) {
  if (bucket === 'voicedObstruent') return 'voicedObstruent';
  if (bucket === 'voiceless') return 'voiceless';
  return 'vowelOrSonorant';
}
function questionParticleDrills() {
  const out = [];
  for (const w of Q_WORDS) {
    const group = questionGroup(w.bucket);
    const correct = Q_TABLE[w.harmony][group];
    const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
    const otherGroups = ['vowelOrSonorant', 'voicedObstruent', 'voiceless'].filter((g) => g !== group);
    const distractors = [Q_TABLE[otherHarmony][group], Q_TABLE[w.harmony][otherGroups[0]], Q_TABLE[w.harmony][otherGroups[1]]];
    out.push({
      prompt: `Бұл ${w.word} ___? (это ${w.gloss}? — вопросительная частица)`,
      correct_answer: correct,
      distractors,
      explanation: `«${w.word}» оканчивается на ${w.bucket === 'vowel' ? 'гласную' : w.bucket === 'voiceless' ? 'глухой согласный' : w.bucket === 'voicedObstruent' ? 'звонкий согласный' : 'сонорный согласный'}, гласные ${HARMONY_LABEL[w.harmony]} → ${correct}. Частица всегда пишется отдельно от предыдущего слова.`
    });
  }
  return out;
}

// ---------------------------------------------------------------------
// kz-postpositions -- vocabulary, extends the existing list.
// ---------------------------------------------------------------------
const POSTPOSITIONS = [
  { word: 'арқылы', ru: 'через, посредством', example: 'Мен телефон ___ сөйлестім.', gloss: '(через телефон поговорил)' },
  { word: 'бойы', ru: 'в течение, на протяжении', example: 'Ол күн ___ жұмыс істеді.', gloss: '(весь день работал)' },
  { word: 'сайын', ru: 'каждый раз, всякий', example: 'Жыл ___ біз теңізге барамыз.', gloss: '(каждый год ездим на море)' },
  { word: 'қарсы', ru: 'против', example: 'Мен бұл жоспарға ___.', gloss: '(я против этого плана)' },
  { word: 'басқа', ru: 'кроме', example: 'Сеннен ___ ешкім келмеді.', gloss: '(кроме тебя никто не пришёл)' },
  { word: 'бері', ru: 'с тех пор как', example: 'Таңнан ___ жаңбыр жауып тұр.', gloss: '(с утра идёт дождь)' },
  { word: 'шейін', ru: 'до (синоним дейін)', example: 'Түске ___ күттім.', gloss: '(ждал до обеда)' },
  { word: 'сияқты', ru: 'как, подобно', example: 'Ол ағасы ___ мықты.', gloss: '(силён, как его старший брат)' },
  { word: 'туралы', ru: 'о, про', example: 'Кітап тарих ___ жазылған.', gloss: '(книга написана об истории)' },
  { word: 'үшін', ru: 'ради, для', example: 'Отбасым ___ бәрін істеймін.', gloss: '(ради семьи всё сделаю)' }
];
function postpositionDrills() {
  const out = [];
  const all = POSTPOSITIONS.map((p) => p.word);
  for (const p of POSTPOSITIONS) {
    const distractors = all.filter((w) => w !== p.word).sort(() => 0.5 - hashSeed(p.word)).slice(0, 3);
    out.push({
      prompt: `${p.example} ${p.gloss}`,
      correct_answer: p.word,
      distractors,
      explanation: `«${p.word}» — ${p.ru}.`
    });
    out.push({
      prompt: `Выбери послелог со значением «${p.ru}».`,
      correct_answer: p.word,
      distractors: all.filter((w) => w !== p.word).slice(0, 3),
      explanation: `«${p.word}» — ${p.ru}.`
    });
  }
  return out;
}
// deterministic small shuffle helper (no Math.random dependency needed
// for reproducible seed content)
function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 97;
  return h / 97;
}

// ---------------------------------------------------------------------
// kz-conjunctions -- vocabulary, extends the existing list.
// ---------------------------------------------------------------------
const CONJUNCTIONS = [
  { word: 'және', ru: 'и', example: 'Мен нан ___ сүт сатып алдым.', gloss: '(купил хлеб и молоко)' },
  { word: 'дегенмен', ru: 'тем не менее, однако', example: 'Жаңбыр жауды, ___ біз серуендедік.', gloss: '(дождь шёл, тем не менее мы гуляли)' },
  { word: 'әйтпесе', ru: 'иначе, а то', example: 'Тез жүр, ___ кешігеміз.', gloss: '(иди быстрее, а то опоздаем)' },
  { word: 'өйткені', ru: 'потому что', example: 'Мен үйде қалдым, ___ ауырдым.', gloss: '(остался дома, потому что заболел)' },
  { word: 'сондай-ақ', ru: 'также, к тому же', example: 'Ол ақылды, ___ еңбекқор.', gloss: '(он умный, а также трудолюбивый)' }
];
function conjunctionDrills() {
  const out = [];
  const all = CONJUNCTIONS.map((c) => c.word).concat(['бірақ', 'немесе', 'сондықтан', 'себебі']);
  for (const c of CONJUNCTIONS) {
    out.push({
      prompt: `${c.example} ${c.gloss}`,
      correct_answer: c.word,
      distractors: all.filter((w) => w !== c.word).slice(0, 3),
      explanation: `«${c.word}» — ${c.ru}.`
    });
    out.push({
      prompt: `Выбери союз со значением «${c.ru}».`,
      correct_answer: c.word,
      distractors: all.filter((w) => w !== c.word).slice(3, 6),
      explanation: `«${c.word}» — ${c.ru}.`
    });
  }
  return out;
}

// ---------------------------------------------------------------------
// kz-emphatic-particles -- vocabulary/function words, extends the list.
// ---------------------------------------------------------------------
const PARTICLES = [
  { word: 'қана', ru: 'только (синоним «тек», ставится после слова)', example: 'Су ___ ішемін.', gloss: '(пью только воду)' },
  { word: 'ақ', ru: 'же, именно, усилительная частица', example: 'Дәл осы жерде-___ тұр.', gloss: '(стой именно здесь)' },
  { word: 'да', ru: 'тоже, и (после звонкого/гласного)', example: 'Мен ___ келемін.', gloss: '(я тоже приду)' },
  { word: 'та', ru: 'тоже, и (после глухого)', example: 'Ол кітап ___ алды.', gloss: '(он взял и книгу)' }
];
function particleDrills() {
  const out = [];
  const all = ['ғой', 'тек', 'қана', 'ақ', 'да', 'та'];
  for (const p of PARTICLES) {
    out.push({
      prompt: `${p.example} ${p.gloss}`,
      correct_answer: p.word,
      distractors: all.filter((w) => w !== p.word).slice(0, 3),
      explanation: `«${p.word}» — ${p.ru}.`
    });
  }
  out.push({
    prompt: '"Тек мен келдім, басқа ешкім жоқ" — какую роль здесь играет "тек"?',
    correct_answer: 'ограничение ("только")',
    distractors: ['вопрос', 'напоминание', 'отрицание'],
    explanation: 'тек = только, ограничительная частица, та же роль что и в других примерах этой темы.'
  });
  out.push({
    prompt: '"Ол келді ғой" вместо простого "Ол келді" добавляет:',
    correct_answer: 'оттенок напоминания/очевидности ("же", "ведь пришёл")',
    distractors: ['вопрос', 'сомнение', 'отрицание'],
    explanation: 'ғой не меняет факт, только модальный оттенок — говорящий как бы напоминает или подчёркивает очевидное.'
  });
  return out;
}

// ---------------------------------------------------------------------
// kz-comparative -- -рақ/-рек (comparative), matches the "-ырақ" with
// linking vowel already established for consonant-final adjectives.
// ---------------------------------------------------------------------
const ADJECTIVES = [
  { word: 'үлкен', gloss: 'большой', harmony: 'front' },
  { word: 'кіші', gloss: 'маленький', harmony: 'front' },
  { word: 'жылдам', gloss: 'быстрый', harmony: 'back' },
  { word: 'ұзын', gloss: 'длинный', harmony: 'back' },
  { word: 'қымбат', gloss: 'дорогой', harmony: 'back' },
  { word: 'жақсы', gloss: 'хороший', harmony: 'back' },
  { word: 'жаңа', gloss: 'новый', harmony: 'back' },
  { word: 'ескі', gloss: 'старый', harmony: 'front' }
];
function comparativeDrills() {
  const out = [];
  for (const a of ADJECTIVES) {
    const suf = a.harmony === 'back' ? 'ырақ' : 'ірек';
    const correct = a.word + suf;
    const superlative = 'ең ' + a.word;
    out.push({
      prompt: `Сравнительная степень («более ...») от «${a.word}» (${a.gloss}).`,
      correct_answer: correct,
      distractors: [superlative, a.word + (a.harmony === 'back' ? 'ірек' : 'ырақ'), a.word + 'дар'],
      explanation: `-${suf} — сравнительная степень (вставная гласная ${suf[0]} для удобства произношения после согласной): ${correct}. «${superlative}» — превосходная степень, другое слово.`
    });
  }
  return out;
}

const TOPICS = [
  { slug: 'kz-negation', drills: negationDrills },
  { slug: 'kz-question-particles', drills: questionParticleDrills },
  { slug: 'kz-postpositions', drills: postpositionDrills },
  { slug: 'kz-conjunctions', drills: conjunctionDrills },
  { slug: 'kz-emphatic-particles', drills: particleDrills },
  { slug: 'kz-comparative', drills: comparativeDrills }
];

function seed() {
  const topicIdStmt = db.prepare('SELECT id FROM theory_topics WHERE slug = ?');
  const maxPositionStmt = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM theory_drills WHERE topic_id = ?');
  const countStmt = db.prepare('SELECT COUNT(*) AS c FROM theory_drills WHERE topic_id = ?');
  const insertDrill = db.prepare(
    `INSERT INTO theory_drills (topic_id, prompt, correct_answer, distractors, explanation, position)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  let totalInserted = 0;
  const insertAll = db.transaction(() => {
    for (const { slug, drills } of TOPICS) {
      const topic = topicIdStmt.get(slug);
      if (!topic) {
        console.log(`Topic not found, skipping: ${slug}`);
        continue;
      }
      if (countStmt.get(topic.id).c > 5) {
        console.log(`Already expanded, skipping: ${slug}`);
        continue;
      }
      const items = drills();
      let position = maxPositionStmt.get(topic.id).m + 1;
      for (const d of items) {
        insertDrill.run(topic.id, d.prompt, d.correct_answer, JSON.stringify(d.distractors), d.explanation, position);
        position += 1;
      }
      totalInserted += items.length;
      console.log(`${slug}: +${items.length} drills`);
    }
  });

  insertAll();
  console.log(`Total inserted: ${totalInserted}`);
  console.log('Total drills now:', db.prepare('SELECT COUNT(*) c FROM theory_drills').get().c);
}

seed();
