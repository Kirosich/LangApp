// Full declension/conjugation tables for the new "Таблица" exercise
// type (fill every cell, then check all at once). Reuses the same
// hand-verified suffix rules as the case/morphology/verb drill
// expansions (server/seed-theory-*-drills-expanded.js) -- copied here
// rather than imported since those files run a seed() immediately on
// import.
import { db } from './db/index.js';

function h(harmony, back, front) {
  return harmony === 'back' ? back : front;
}
function collapse3(bucket) {
  if (bucket === 'vowel') return 'vowel';
  if (bucket === 'voiceless') return 'voiceless';
  return 'voiced';
}
const MUTATE = { п: 'б', қ: 'ғ', к: 'г' };
function mutateStem(word) {
  const last = word.slice(-1);
  return MUTATE[last] ? word.slice(0, -1) + MUTATE[last] : word;
}

// ---------------------------------------------------------------------
// 1. Падежи (септік) -- 7 columns.
// ---------------------------------------------------------------------
const CASE_WORDS = [
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'үй', gloss: 'дом', harmony: 'front', bucket: 'sonorant' },
  { word: 'кітап', gloss: 'книга', harmony: 'back', bucket: 'voiceless' },
  { word: 'қыз', gloss: 'девочка', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'өрік', gloss: 'абрикос', harmony: 'front', bucket: 'voiceless' },
  { word: 'көл', gloss: 'озеро', harmony: 'front', bucket: 'sonorant' }
];
function caseCells(w) {
  const g3 = collapse3(w.bucket);
  const ilik = { back: { vowel: 'ның', voiced: 'дың', voiceless: 'тың' }, front: { vowel: 'нің', voiced: 'дің', voiceless: 'тің' } }[w.harmony][g3];
  const g2 = w.bucket === 'voiceless' ? 'voiceless' : 'voiced';
  const barys = { back: { voiced: 'ға', voiceless: 'қа' }, front: { voiced: 'ге', voiceless: 'ке' } }[w.harmony][g2];
  const tabys = { back: { vowel: 'ны', voiced: 'ды', voiceless: 'ты' }, front: { vowel: 'ні', voiced: 'ді', voiceless: 'ті' } }[w.harmony][g3];
  const jatys = { back: { voiced: 'да', voiceless: 'та' }, front: { voiced: 'де', voiceless: 'те' } }[w.harmony][g2];
  const shygys = { back: { voiced: 'дан', voiceless: 'тан' }, front: { voiced: 'ден', voiceless: 'тен' } }[w.harmony][g2];
  const komTable = { vowel: 'мен', sonorant: 'мен', voicedObstruent: 'бен', voiceless: 'пен' };
  return [
    { label: 'Атау (кто/что?)', answer: w.word },
    { label: 'Ілік (чей?)', answer: w.word + ilik },
    { label: 'Барыс (куда/кому?)', answer: w.word + barys },
    { label: 'Табыс (кого/что?)', answer: w.word + tabys },
    { label: 'Жатыс (где?)', answer: w.word + jatys },
    { label: 'Шығыс (откуда?)', answer: w.word + shygys },
    { label: 'Көмектес (с кем/чем?)', answer: w.word + komTable[w.bucket] }
  ];
}

// ---------------------------------------------------------------------
// 2. Жіктік жалғау (личные окончания сказуемого: "мен ...-мын")
// ---------------------------------------------------------------------
const PERSONAL_WORDS = [
  { word: 'қазақ', gloss: 'казах', harmony: 'back', group: 'voiceless' },
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', group: 'vowelSonorant' },
  { word: 'мұғалім', gloss: 'учитель', harmony: 'front', group: 'vowelSonorant' },
  { word: 'тентек', gloss: 'озорной', harmony: 'front', group: 'voiceless' },
  { word: 'ұзын', gloss: 'высокий', harmony: 'back', group: 'vowelSonorant' }
];
function personalCells(w) {
  const p1 = { vowelSonorant: { back: 'мын', front: 'мін' }, voiceless: { back: 'пын', front: 'пін' } }[w.group][w.harmony];
  const p1pl = { vowelSonorant: { back: 'мыз', front: 'міз' }, voiceless: { back: 'пыз', front: 'піз' } }[w.group][w.harmony];
  const p2 = h(w.harmony, 'сың', 'сің');
  return [
    { label: 'Мен ... (я)', answer: w.word + p1 },
    { label: 'Сен ... (ты)', answer: w.word + p2 },
    { label: 'Ол ... (он/она)', answer: w.word },
    { label: 'Біз ... (мы)', answer: w.word + p1pl }
  ];
}

// ---------------------------------------------------------------------
// 3. Тәуелдік жалғау (притяжательные: "менің ...-ым")
// ---------------------------------------------------------------------
const POSSESSIVE_WORDS = [
  { word: 'кітап', gloss: 'книга', harmony: 'back', bucket: 'voiceless' },
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'үй', gloss: 'дом', harmony: 'front', bucket: 'sonorant' },
  { word: 'сөз', gloss: 'слово', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'өрік', gloss: 'абрикос', harmony: 'front', bucket: 'voiceless' }
];
function possessiveCells(w) {
  const vowelEnding = w.bucket === 'vowel';
  const stem = vowelEnding ? w.word : w.bucket === 'voiceless' ? mutateStem(w.word) : w.word;
  const suf1 = vowelEnding ? 'м' : h(w.harmony, 'ым', 'ім');
  const suf2 = vowelEnding ? 'ң' : h(w.harmony, 'ың', 'ің');
  const suf3 = vowelEnding ? 'сы' : h(w.harmony, 'ы', 'і');
  const sufPl = vowelEnding ? h(w.harmony, 'мыз', 'міз') : h(w.harmony, 'ымыз', 'іміз');
  return [
    { label: 'Менің ... (мой/моя)', answer: stem + suf1 },
    { label: 'Сенің ... (твой/твоя)', answer: stem + suf2 },
    { label: 'Оның ... (его/её)', answer: stem + suf3 },
    { label: 'Біздің ... (наш/наша)', answer: stem + sufPl }
  ];
}

// ---------------------------------------------------------------------
// 4 & 5. Verb forms (times/moods, participles/converbs). Same VERBS
// bank + rules as seed-theory-verb-drills-expanded.js.
// ---------------------------------------------------------------------
const VERBS = [
  { word: 'бар', gloss: 'идти', harmony: 'back', type: 'consonant', voiceless: false },
  { word: 'кел', gloss: 'приходить', harmony: 'front', type: 'consonant', voiceless: false },
  { word: 'айт', gloss: 'сказать', harmony: 'back', type: 'consonant', voiceless: true },
  { word: 'жаса', gloss: 'делать', harmony: 'back', type: 'vowelRegular' },
  { word: 'оқы', gloss: 'читать', harmony: 'back', type: 'vowelContract' }
];
function presentStem(v) {
  if (v.type === 'consonant') return v.word + h(v.harmony, 'а', 'е');
  if (v.type === 'vowelRegular') return v.word + 'й';
  return v.word.slice(0, -1) + 'и';
}
const PERSON1 = { '1sg': { back: 'мын', front: 'мін' }, '3rd': { back: 'ды', front: 'ді' } };
function presentForm(v, person) {
  return presentStem(v) + PERSON1[person][v.harmony];
}
function categoricalPast1sg(v) {
  const suf = v.type === 'consonant' && v.voiceless ? h(v.harmony, 'ты', 'ті') : h(v.harmony, 'ды', 'ді');
  return v.word + suf + 'м';
}
function evidentialPast(v) {
  const suf = v.type === 'consonant' && v.voiceless ? h(v.harmony, 'қан', 'кен') : h(v.harmony, 'ған', 'ген');
  return v.word + suf;
}
function predictiveStem(v) {
  return v.type === 'consonant' ? v.word + h(v.harmony, 'ар', 'ер') : v.word + 'р';
}
function futureForm1sg(v) {
  return predictiveStem(v) + h(v.harmony, 'мын', 'мін');
}
function esimsheHabitual(v) {
  return presentStem(v) + h(v.harmony, 'тын', 'тін');
}
function converbSequential(v) {
  return v.type === 'consonant' ? v.word + h(v.harmony, 'ып', 'іп') : v.word + 'п';
}
function conditionalForm(v) {
  return v.word + h(v.harmony, 'са', 'се');
}
function imperative2sgPolite(v) {
  if (v.type === 'consonant') return v.word + h(v.harmony, 'ыңыз', 'іңіз');
  return v.word + h(v.harmony, 'ңыз', 'ңіз');
}

function tenseCells(v) {
  return [
    { label: 'Осы шақ (сейчас/привычно), мен ...', answer: presentForm(v, '1sg') },
    { label: 'Категорическое өткен шақ (точно видел), мен ...', answer: categoricalPast1sg(v) },
    { label: 'Очевидное өткен шақ (узнал позже), ол ...', answer: evidentialPast(v) },
    { label: 'Категорическое келер шақ (уверен), мен ...', answer: presentForm(v, '1sg') },
    { label: 'Болжалды келер шақ (возможно), мен ...', answer: futureForm1sg(v) }
  ];
}
function participleCells(v) {
  return [
    { label: 'Есімше, обычное действие (-атын/-етін)', answer: esimsheHabitual(v) },
    { label: 'Есімше, завершённое действие (-ған/-ген)', answer: evidentialPast(v) },
    { label: 'Көсемше, «сделав ...» (-ып/-іп/-п)', answer: converbSequential(v) },
    { label: 'Шартты рай, «если ...» (-са/-се)', answer: conditionalForm(v) },
    { label: 'Бұйрық, вежливое «...(те)!» (сіз)', answer: imperative2sgPolite(v) }
  ];
}

const PARADIGMS = [
  { type: 'cases', label: 'Падежи (септік)', words: CASE_WORDS, cellsFn: caseCells },
  { type: 'personal', label: 'Личные окончания (жіктік)', words: PERSONAL_WORDS, cellsFn: personalCells },
  { type: 'possessive', label: 'Притяжательные окончания (тәуелдік)', words: POSSESSIVE_WORDS, cellsFn: possessiveCells },
  { type: 'tenses', label: 'Времена глагола', words: VERBS, cellsFn: tenseCells },
  { type: 'participles', label: 'Причастие, деепричастие и наклонения', words: VERBS, cellsFn: participleCells }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM theory_paradigms WHERE language = ? AND paradigm_type = ? AND word = ?');
  const insert = db.prepare(
    `INSERT INTO theory_paradigms (language, paradigm_type, word, gloss, cells) VALUES ('kz', ?, ?, ?, ?)`
  );

  let inserted = 0;
  const insertAll = db.transaction(() => {
    for (const p of PARADIGMS) {
      for (const w of p.words) {
        if (existsStmt.get('kz', p.type, w.word)) continue;
        insert.run(p.type, w.word, w.gloss, JSON.stringify(p.cellsFn(w)));
        inserted += 1;
      }
    }
  });

  insertAll();
  console.log(`Inserted ${inserted} paradigm rows.`);
  console.log('Total paradigms now:', db.prepare('SELECT COUNT(*) c FROM theory_paradigms').get().c);
}

seed();
