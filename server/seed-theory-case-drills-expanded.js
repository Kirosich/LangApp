// Expands the 7 Kazakh case (септік) drill topics from 5 drills each to
// ~30 each. Generated programmatically from a word bank + the actual
// suffix rules (not hand-typed one by one) to avoid transcription
// mistakes in a system with 6-way harmony/voicing variation per case.
//
// Suffix system (matches the 5 pre-existing, human-authored drills per
// topic, which came from kaz-tili.kz -- see CLAUDE.md "Стратегия
// обучения"):
//   - harmony: word's last vowel is back (а,о,ұ,ы) or front (е,ө,ү,і)
//   - bucket per word ending:
//       vowel           -- ends in a vowel
//       sonorant        -- ends in й/л/м/н/ң/р/у (voiced-like for most
//                          cases, but köMEKTES splits it from vowel... it
//                          doesn't: sonorant patterns WITH vowel there)
//       voicedObstruent -- ends in б/в/г/д/ж/з/ғ (a true voiced stop/
//                          fricative, not a sonorant)
//       voiceless       -- ends in қ/к/п/с/т/ф/х/ц/ч/ш/щ
//   - nasal: true only for sonorant-bucket words ending specifically in
//     м/н/ң (not л/р/у/й) -- affects ШЫҒЫС only (-нан/-нен instead of
//     -дан/-ден)
import { db } from './db/index.js';

const WORDS = [
  // back harmony
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'ана', gloss: 'мать', harmony: 'back', bucket: 'vowel' },
  { word: 'апа', gloss: 'старшая сестра/тётя', harmony: 'back', bucket: 'vowel' },
  { word: 'қала', gloss: 'город', harmony: 'back', bucket: 'vowel' },
  { word: 'орта', gloss: 'середина', harmony: 'back', bucket: 'vowel' },
  { word: 'арба', gloss: 'телега', harmony: 'back', bucket: 'vowel' },
  { word: 'жаға', gloss: 'берег', harmony: 'back', bucket: 'vowel' },
  { word: 'қора', gloss: 'сарай', harmony: 'back', bucket: 'vowel' },
  { word: 'адам', gloss: 'человек', harmony: 'back', bucket: 'sonorant', nasal: true },
  { word: 'орман', gloss: 'лес', harmony: 'back', bucket: 'sonorant', nasal: true },
  { word: 'таң', gloss: 'рассвет', harmony: 'back', bucket: 'sonorant', nasal: true },
  { word: 'қоян', gloss: 'заяц', harmony: 'back', bucket: 'sonorant', nasal: true },
  { word: 'тау', gloss: 'гора', harmony: 'back', bucket: 'sonorant' },
  { word: 'жол', gloss: 'дорога', harmony: 'back', bucket: 'sonorant' },
  { word: 'қол', gloss: 'рука', harmony: 'back', bucket: 'sonorant' },
  { word: 'ауыл', gloss: 'село', harmony: 'back', bucket: 'sonorant' },
  { word: 'бау', gloss: 'сад', harmony: 'back', bucket: 'sonorant' },
  { word: 'бидай', gloss: 'пшеница', harmony: 'back', bucket: 'sonorant' },
  { word: 'самал', gloss: 'ветерок', harmony: 'back', bucket: 'sonorant' },
  { word: 'жаз', gloss: 'лето', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'мұз', gloss: 'лёд', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'кітап', gloss: 'книга', harmony: 'back', bucket: 'voiceless' },
  { word: 'тас', gloss: 'камень', harmony: 'back', bucket: 'voiceless' },
  { word: 'от', gloss: 'огонь', harmony: 'back', bucket: 'voiceless' },
  { word: 'ат', gloss: 'лошадь', harmony: 'back', bucket: 'voiceless' },
  { word: 'доп', gloss: 'мяч', harmony: 'back', bucket: 'voiceless' },
  { word: 'құс', gloss: 'птица', harmony: 'back', bucket: 'voiceless' },
  { word: 'тамақ', gloss: 'еда', harmony: 'back', bucket: 'voiceless' },
  // front harmony
  { word: 'түйе', gloss: 'верблюд', harmony: 'front', bucket: 'vowel' },
  { word: 'әже', gloss: 'бабушка', harmony: 'front', bucket: 'vowel' },
  { word: 'күлкі', gloss: 'смех', harmony: 'front', bucket: 'vowel' },
  { word: 'іні', gloss: 'младший брат', harmony: 'front', bucket: 'vowel' },
  { word: 'тәте', gloss: 'тётя', harmony: 'front', bucket: 'vowel' },
  { word: 'үй', gloss: 'дом', harmony: 'front', bucket: 'sonorant' },
  { word: 'гүл', gloss: 'цветок', harmony: 'front', bucket: 'sonorant' },
  { word: 'көл', gloss: 'озеро', harmony: 'front', bucket: 'sonorant' },
  { word: 'тіл', gloss: 'язык', harmony: 'front', bucket: 'sonorant' },
  { word: 'білім', gloss: 'знание', harmony: 'front', bucket: 'sonorant', nasal: true },
  { word: 'өзен', gloss: 'река', harmony: 'front', bucket: 'sonorant', nasal: true },
  { word: 'күн', gloss: 'день/солнце', harmony: 'front', bucket: 'sonorant', nasal: true },
  { word: 'түн', gloss: 'ночь', harmony: 'front', bucket: 'sonorant', nasal: true },
  { word: 'кез', gloss: 'случай', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'сөз', gloss: 'слово', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'өрік', gloss: 'абрикос', harmony: 'front', bucket: 'voiceless' },
  { word: 'күш', gloss: 'сила', harmony: 'front', bucket: 'voiceless' },
  { word: 'іс', gloss: 'дело', harmony: 'front', bucket: 'voiceless' },
  { word: 'бет', gloss: 'лицо', harmony: 'front', bucket: 'voiceless' },
  { word: 'ет', gloss: 'мясо', harmony: 'front', bucket: 'voiceless' },
  { word: 'түс', gloss: 'полдень', harmony: 'front', bucket: 'voiceless' }
];

const BUCKET_LABEL = {
  vowel: 'гласную',
  sonorant: 'сонорный согласный (й/л/м/н/ң/р/у)',
  voicedObstruent: 'звонкий согласный',
  voiceless: 'глухой согласный'
};
const HARMONY_LABEL = { back: 'задние', front: 'передние' };

// mergedBucket: for суффикс systems where vowel+sonorant+voicedObstruent
// all take the same "voiced" variant (барыс, жатыс, and шығыс's default
// -дан/-ден before the nasal exception), collapse to one key.
function merged(bucket) {
  return bucket === 'voiceless' ? 'voiceless' : 'voiced';
}

// ілік/табыс have 4 raw buckets but only 3 distinct surface forms per
// harmony -- sonorant and voicedObstruent take the same suffix. Collapse
// to exactly 3 groups so "the other groups" is always well-defined and
// never accidentally picks the same group twice.
function collapse3(bucket) {
  if (bucket === 'vowel') return 'vowel';
  if (bucket === 'voiceless') return 'voiceless';
  return 'voiced';
}

function ilik(w) {
  const table = {
    back: { vowel: 'ның', voiced: 'дың', voiceless: 'тың' },
    front: { vowel: 'нің', voiced: 'дің', voiceless: 'тің' }
  };
  const group = collapse3(w.bucket);
  const correct = w.word + table[w.harmony][group];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherGroups = ['vowel', 'voiced', 'voiceless'].filter((g) => g !== group);
  const distractors = [w.word + table[otherHarmony][group], w.word + table[w.harmony][otherGroups[0]], w.word + table[w.harmony][otherGroups[1]]];
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]}, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][group]}. Остальные варианты — не та гармония или не та звонкость окончания.`;
  return { prompt: `Ілік септік (родительный падеж, «чей?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

function barys(w) {
  const table = {
    back: { voiced: 'ға', voiceless: 'қа' },
    front: { voiced: 'ге', voiceless: 'ке' }
  };
  const bucket = merged(w.bucket);
  const correct = w.word + table[w.harmony][bucket];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherBucket = bucket === 'voiced' ? 'voiceless' : 'voiced';
  const distractors = [w.word + table[otherHarmony][bucket], w.word + table[w.harmony][otherBucket], w.word + table[otherHarmony][otherBucket]];
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]}, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][bucket]}. Барыс септік не различает гласный/звонкий конец — только глухой конец меняет форму на қ/к.`;
  return { prompt: `Барыс септік (дательный падеж, «куда?/кому?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

function tabys(w) {
  const table = {
    back: { vowel: 'ны', voiced: 'ды', voiceless: 'ты' },
    front: { vowel: 'ні', voiced: 'ді', voiceless: 'ті' }
  };
  const group = collapse3(w.bucket);
  const correct = w.word + table[w.harmony][group];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherGroups = ['vowel', 'voiced', 'voiceless'].filter((g) => g !== group);
  const distractors = [w.word + table[otherHarmony][group], w.word + table[w.harmony][otherGroups[0]], w.word + table[w.harmony][otherGroups[1]]];
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]}, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][group]}. Остальные варианты — не та гармония или не та звонкость.`;
  return { prompt: `Табыс септік (винительный падеж, «кого?/что?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

function jatys(w) {
  const table = {
    back: { voiced: 'да', voiceless: 'та' },
    front: { voiced: 'де', voiceless: 'те' }
  };
  const bucket = merged(w.bucket);
  const correct = w.word + table[w.harmony][bucket];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherBucket = bucket === 'voiced' ? 'voiceless' : 'voiced';
  const distractors = [w.word + table[otherHarmony][bucket], w.word + table[w.harmony][otherBucket], w.word + table[otherHarmony][otherBucket]];
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]}, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][bucket]}. Как и барыс, жатыс различает только глухой/не глухой конец.`;
  return { prompt: `Жатыс септік (местный падеж, «где?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

function shygys(w) {
  const table = {
    back: { voiced: 'дан', voiceless: 'тан', nasal: 'нан' },
    front: { voiced: 'ден', voiceless: 'тен', nasal: 'нен' }
  };
  const key = w.nasal ? 'nasal' : merged(w.bucket);
  const correct = w.word + table[w.harmony][key];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherKeys = ['voiced', 'voiceless', 'nasal'].filter((k) => k !== key);
  const distractors = [w.word + table[otherHarmony][key], w.word + table[w.harmony][otherKeys[0]], w.word + table[w.harmony][otherKeys[1]]];
  const explanation = w.nasal
    ? `«${w.word}» оканчивается на м/н/ң (носовой сонорный) — особый случай, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony].nasal}, а не обычный звонкий вариант -${table[w.harmony].voiced}.`
    : `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]} (не м/н/ң), гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][key]}. Вариант на -н(ан/ен) — только для слов, оканчивающихся именно на м/н/ң.`;
  return { prompt: `Шығыс септік (исходный падеж, «откуда?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

function komektes(w) {
  const table = { vowel: 'мен', sonorant: 'мен', voicedObstruent: 'бен', voiceless: 'пен' };
  const correct = w.word + table[w.bucket];
  const others = Object.values(table).filter((v, i, arr) => arr.indexOf(v) === i && v !== table[w.bucket]);
  const distractors = others.map((suf) => w.word + suf);
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]} → -${table[w.bucket]}. Көмектес септік не зависит от гармонии гласных, только от звонкости конца слова.`;
  return { prompt: `Көмектес септік (творительный падеж, «с кем?/чем?») слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

const CASES = [
  { slug: 'kz-case-atau', build: null }, // handled separately below (no suffix, just recognition)
  { slug: 'kz-case-ilik', build: ilik },
  { slug: 'kz-case-barys', build: barys },
  { slug: 'kz-case-tabys', build: tabys },
  { slug: 'kz-case-jatys', build: jatys },
  { slug: 'kz-case-shygys', build: shygys },
  { slug: 'kz-case-komektes', build: komektes }
];

function atauDrills() {
  // Атау септік has no suffix -- the drill is "recognize the bare form
  // among case-marked distractors of the same word", same pattern as
  // the 5 existing atau drills.
  const CASE_SUFFIXES_FOR_DISTRACTORS = [
    (w) => ilik(w).correct_answer,
    (w) => barys(w).correct_answer,
    (w) => tabys(w).correct_answer,
    (w) => jatys(w).correct_answer,
    (w) => shygys(w).correct_answer
  ];
  return WORDS.map((w, i) => {
    const picks = [0, 1, 2].map((k) => CASE_SUFFIXES_FOR_DISTRACTORS[(i + k) % CASE_SUFFIXES_FOR_DISTRACTORS.length](w));
    return {
      prompt: `Выбери атау септік (именительный, без суффикса) слова «${w.word}» (${w.gloss}).`,
      correct_answer: w.word,
      distractors: picks,
      explanation: `«${w.word}» без суффикса — атау септік, база слова. Остальные варианты — уже с падежными окончаниями.`
    };
  });
}

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
    for (const { slug, build } of CASES) {
      const topic = topicIdStmt.get(slug);
      if (!topic) {
        console.log(`Topic not found, skipping: ${slug}`);
        continue;
      }
      // Idempotent: if this topic already has 25+ drills, assume this
      // script already ran for it and skip (existing 5 + our ~28 more).
      if (countStmt.get(topic.id).c >= 25) {
        console.log(`Already expanded, skipping: ${slug}`);
        continue;
      }
      const drills = slug === 'kz-case-atau' ? atauDrills() : WORDS.map(build);
      let position = maxPositionStmt.get(topic.id).m + 1;
      for (const d of drills) {
        insertDrill.run(topic.id, d.prompt, d.correct_answer, JSON.stringify(d.distractors), d.explanation, position);
        position += 1;
      }
      totalInserted += drills.length;
      console.log(`${slug}: +${drills.length} drills`);
    }
  });

  insertAll();
  console.log(`Total inserted: ${totalInserted}`);
  console.log('Total drills now:', db.prepare('SELECT COUNT(*) c FROM theory_drills').get().c);
}

seed();
