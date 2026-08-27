// Expands the 3 Kazakh morphology drill topics (plural, personal
// affixes vs possessive affixes, extended possessive paradigm) from 5
// drills each. Same programmatic approach as
// seed-theory-case-drills-expanded.js: word bank + explicit suffix
// rules, not hand-typed one by one.
import { db } from './db/index.js';

// ---------------------------------------------------------------------
// Шared word bank: {word, gloss, harmony, bucket}. bucket collapses to
// vowel / sonorant (й,л,м,н,ң,р,у) / voicedObstruent (б,в,г,д,ж,з,ғ) /
// voiceless (қ,к,п,с,т,ф,х,ц,ч,ш,щ) based on the word's actual final
// sound.
// ---------------------------------------------------------------------
const WORDS = [
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'ана', gloss: 'мать', harmony: 'back', bucket: 'vowel' },
  { word: 'апа', gloss: 'старшая сестра', harmony: 'back', bucket: 'vowel' },
  { word: 'қала', gloss: 'город', harmony: 'back', bucket: 'vowel' },
  { word: 'адам', gloss: 'человек', harmony: 'back', bucket: 'sonorant' },
  { word: 'орман', gloss: 'лес', harmony: 'back', bucket: 'sonorant' },
  { word: 'жол', gloss: 'дорога', harmony: 'back', bucket: 'sonorant' },
  { word: 'қыз', gloss: 'девочка', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'жаз', gloss: 'лето', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'кітап', gloss: 'книга', harmony: 'back', bucket: 'voiceless' },
  { word: 'тас', gloss: 'камень', harmony: 'back', bucket: 'voiceless' },
  { word: 'ат', gloss: 'лошадь', harmony: 'back', bucket: 'voiceless' },
  { word: 'қазақ', gloss: 'казах', harmony: 'back', bucket: 'voiceless' },
  { word: 'түйе', gloss: 'верблюд', harmony: 'front', bucket: 'vowel' },
  { word: 'әже', gloss: 'бабушка', harmony: 'front', bucket: 'vowel' },
  { word: 'үй', gloss: 'дом', harmony: 'front', bucket: 'sonorant' },
  { word: 'гүл', gloss: 'цветок', harmony: 'front', bucket: 'sonorant' },
  { word: 'көл', gloss: 'озеро', harmony: 'front', bucket: 'sonorant' },
  { word: 'сөз', gloss: 'слово', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'өрік', gloss: 'абрикос', harmony: 'front', bucket: 'voiceless' },
  { word: 'бет', gloss: 'лицо', harmony: 'front', bucket: 'voiceless' },
  { word: 'ет', gloss: 'мясо', harmony: 'front', bucket: 'voiceless' }
];

const BUCKET_LABEL = {
  vowel: 'гласную',
  sonorant: 'сонорный согласный (й/л/м/н/ң/р/у)',
  voicedObstruent: 'звонкий согласный',
  voiceless: 'глухой согласный'
};
const HARMONY_LABEL = { back: 'задние', front: 'передние' };

function collapse3(bucket) {
  if (bucket === 'vowel') return 'vowel';
  if (bucket === 'voiceless') return 'voiceless';
  return 'voiced';
}

// Word-final п/қ/к voice to б/ғ/г before a vowel-initial suffix (e.g.
// кітап+ым -> кітабым). Shared by the personal-vs-possessive distractor
// below and the full possessive paradigm further down.
const MUTATE = { п: 'б', қ: 'ғ', к: 'г' };
function mutateStem(word) {
  const last = word.slice(-1);
  return MUTATE[last] ? word.slice(0, -1) + MUTATE[last] : word;
}

// ---------------------------------------------------------------------
// kz-plural-suffix: көптік жалғау -лар/-лер/-дар/-дер/-тар/-тер, same
// 3-group system as ілік/табыс (vowel+sonorant merge into the л-group).
// ---------------------------------------------------------------------
function plural(w) {
  const table = {
    back: { vowel: 'лар', voiced: 'дар', voiceless: 'тар' },
    front: { vowel: 'лер', voiced: 'дер', voiceless: 'тер' }
  };
  const group = collapse3(w.bucket);
  const correct = w.word + table[w.harmony][group];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherGroups = ['vowel', 'voiced', 'voiceless'].filter((g) => g !== group);
  const distractors = [w.word + table[otherHarmony][group], w.word + table[w.harmony][otherGroups[0]], w.word + table[w.harmony][otherGroups[1]]];
  const explanation = `«${w.word}» оканчивается на ${BUCKET_LABEL[w.bucket]}, гласные ${HARMONY_LABEL[w.harmony]} → -${table[w.harmony][group]}. Остальные варианты — не та гармония или не та звонкость.`;
  return { prompt: `Көптік жалғау (множественное число) слова «${w.word}» (${w.gloss}).`, correct_answer: correct, distractors, explanation };
}

// ---------------------------------------------------------------------
// kz-affixes-personal-possessive: жіктік жалғау (personal/predicative:
// "мен ... -мын") vs тәуелдік жалғау (possessive: "менің ... -ым") --
// the actual point of this topic is the contrast between the two
// categories, which is why every distractor set includes the
// corresponding possessive form as the classic beginner mistake.
// Restricted to a native-word set with unambiguous vowel/sonorant vs
// voiceless endings (no voicedObstruent-ending words here, to avoid the
// rarer -бын/-бін variant and keep this at the topic's A2 level).
// ---------------------------------------------------------------------
const IDENTITY_WORDS = [
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', group: 'vowelSonorant' },
  { word: 'ана', gloss: 'мать', harmony: 'back', group: 'vowelSonorant' },
  { word: 'адам', gloss: 'человек', harmony: 'back', group: 'vowelSonorant' },
  { word: 'ұзын', gloss: 'высокий/длинный', harmony: 'back', group: 'vowelSonorant' },
  { word: 'қазақ', gloss: 'казах', harmony: 'back', group: 'voiceless' },
  { word: 'жас', gloss: 'молодой', harmony: 'back', group: 'voiceless' },
  { word: 'аш', gloss: 'голодный', harmony: 'back', group: 'voiceless' },
  { word: 'мұғалім', gloss: 'учитель', harmony: 'front', group: 'vowelSonorant' },
  { word: 'күшті', gloss: 'сильный', harmony: 'front', group: 'vowelSonorant' },
  { word: 'кедей', gloss: 'бедный', harmony: 'front', group: 'vowelSonorant' },
  { word: 'тентек', gloss: 'озорной', harmony: 'front', group: 'voiceless' }
];

const JIKTIK_1SG = { vowelSonorant: { back: 'мын', front: 'мін' }, voiceless: { back: 'пын', front: 'пін' } };
const JIKTIK_1PL = { vowelSonorant: { back: 'мыз', front: 'міз' }, voiceless: { back: 'пыз', front: 'піз' } };
const JIKTIK_2SG = { back: 'сың', front: 'сің' };
// Possessive 1st person -- vowel-final stems just get -м, others -ым/-ім.
// (used only to build the "classic mistake" distractor here, not as a
// standalone correct answer for this topic.)
function possessive1sg(w) {
  if (w.group === 'vowelSonorant' && w.word.match(/[аоұыеөүі]$/)) return w.word + 'м';
  return mutateStem(w.word) + (w.harmony === 'back' ? 'ым' : 'ім');
}

function personalAffix1sg(w) {
  const correct = w.word + JIKTIK_1SG[w.group][w.harmony];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherGroup = w.group === 'vowelSonorant' ? 'voiceless' : 'vowelSonorant';
  const distractors = [w.word + JIKTIK_1SG[w.group][otherHarmony], w.word + JIKTIK_1SG[otherGroup][w.harmony], possessive1sg(w)];
  const explanation = `«${w.word}» — личный аффикс (жіктік жалғау) 1 лица ед. числа: -${JIKTIK_1SG[w.group][w.harmony]}. «${possessive1sg(w)}» — это уже притяжательный (тәуелдік) аффикс, другая категория ("моё X", а не "я — X").`;
  return { prompt: `Мен ${w.word}___. («Я — ${w.gloss}», личный аффикс.)`, correct_answer: correct, distractors, explanation };
}

function personalAffix1pl(w) {
  const correct = w.word + JIKTIK_1PL[w.group][w.harmony];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const otherGroup = w.group === 'vowelSonorant' ? 'voiceless' : 'vowelSonorant';
  const distractors = [w.word + JIKTIK_1PL[w.group][otherHarmony], w.word + JIKTIK_1PL[otherGroup][w.harmony], w.word + JIKTIK_1SG[w.group][w.harmony]];
  const explanation = `«${w.word}» — личный аффикс 1 лица мн. числа: -${JIKTIK_1PL[w.group][w.harmony]}. «${w.word}${JIKTIK_1SG[w.group][w.harmony]}» — это форма единственного числа ("я"), а не "мы".`;
  return { prompt: `Біз ${w.word}___. («Мы — ${w.gloss}(лар)», личный аффикс.)`, correct_answer: correct, distractors, explanation };
}

function personalAffix2sg(w) {
  const correct = w.word + JIKTIK_2SG[w.harmony];
  const otherHarmony = w.harmony === 'back' ? 'front' : 'back';
  const distractors = [w.word + JIKTIK_2SG[otherHarmony], w.word + JIKTIK_1SG[w.group][w.harmony], possessive1sg(w)];
  const explanation = `«${w.word}» — личный аффикс 2 лица: -${JIKTIK_2SG[w.harmony]} (не зависит от звонкости конца слова, только от гармонии). «${w.word}${JIKTIK_1SG[w.group][w.harmony]}» — это 1-е лицо ("я"), «${possessive1sg(w)}» — притяжательный.`;
  return { prompt: `Сен ${w.word}___. («Ты — ${w.gloss}», личный аффикс.)`, correct_answer: correct, distractors, explanation };
}

// ---------------------------------------------------------------------
// kz-possessive-extended: тәуелдік жалғау full paradigm (1sg/2sg/3rd/
// 1pl), including the п→б / қ→ғ / к→г mutation before the vowel-initial
// -ым/-ім/-ы/-і forms (кітап -> кітабым, already the DB's own example).
// ---------------------------------------------------------------------
// Uses the case-drill bucket system (vowel/sonorant/voicedObstruent/voiceless).
const POSSESSIVE_WORDS = [
  { word: 'бала', gloss: 'ребёнок', harmony: 'back', bucket: 'vowel' },
  { word: 'ана', gloss: 'мать', harmony: 'back', bucket: 'vowel' },
  { word: 'қала', gloss: 'город', harmony: 'back', bucket: 'vowel' },
  { word: 'адам', gloss: 'человек', harmony: 'back', bucket: 'sonorant' },
  { word: 'жол', gloss: 'дорога', harmony: 'back', bucket: 'sonorant' },
  { word: 'қыз', gloss: 'девочка', harmony: 'back', bucket: 'voicedObstruent' },
  { word: 'кітап', gloss: 'книга', harmony: 'back', bucket: 'voiceless' },
  { word: 'тарақ', gloss: 'расчёска', harmony: 'back', bucket: 'voiceless' },
  { word: 'құрбақа', gloss: 'лягушка', harmony: 'back', bucket: 'vowel' },
  { word: 'түйе', gloss: 'верблюд', harmony: 'front', bucket: 'vowel' },
  { word: 'әже', gloss: 'бабушка', harmony: 'front', bucket: 'vowel' },
  { word: 'үй', gloss: 'дом', harmony: 'front', bucket: 'sonorant' },
  { word: 'көл', gloss: 'озеро', harmony: 'front', bucket: 'sonorant' },
  { word: 'сөз', gloss: 'слово', harmony: 'front', bucket: 'voicedObstruent' },
  { word: 'өрік', gloss: 'абрикос', harmony: 'front', bucket: 'voiceless' },
  { word: 'бет', gloss: 'лицо', harmony: 'front', bucket: 'voiceless' }
];

// Stem used before a vowel-initial suffix -- mutated if it ends in п/қ/к.
function stemForVowelSuffix(w) {
  return w.bucket === 'voiceless' ? mutateStem(w.word) : w.word;
}
// -м after a vowel-final stem, -ым/-ім after a consonant-final stem
// (mutated first if it ends п/қ/к).
function possTable(w) {
  const vowelEnding = w.bucket === 'vowel';
  const stem1 = vowelEnding ? w.word : stemForVowelSuffix(w);
  const suf1 = vowelEnding ? 'м' : w.harmony === 'back' ? 'ым' : 'ім';
  const suf2 = vowelEnding ? 'ң' : w.harmony === 'back' ? 'ың' : 'ің'; // 2sg informal -- bare -ң after a vowel-final stem, -ың/-ің after consonant
  const suf3 = vowelEnding ? 'сы' : w.harmony === 'back' ? 'ы' : 'і'; // 3rd: -сы after vowel, -ы/-і after consonant
  const stem3 = vowelEnding ? w.word : stemForVowelSuffix(w);
  const sufPl = vowelEnding ? (w.harmony === 'back' ? 'мыз' : 'міз') : w.harmony === 'back' ? 'ымыз' : 'іміз'; // bare -мыз/-міз after a vowel-final stem
  return {
    p1sg: stem1 + suf1,
    p2sg: stem1 + suf2,
    p3: stem3 + suf3,
    p1pl: stem1 + sufPl
  };
}

function possessive1sgDrill(w) {
  const t = possTable(w);
  const distractors = [t.p2sg, t.p3, t.p1pl];
  const explanation = w.bucket === 'vowel'
    ? `«${w.word}» оканчивается на гласную → притяжательный 1sg просто -м: ${t.p1sg}.`
    : `«${w.word}» оканчивается на согласную → -${w.harmony === 'back' ? 'ым' : 'ім'}${w.bucket === 'voiceless' ? `, конечный ${w.word.slice(-1)} перед гласной озвончается → ${mutateStem(w.word)}` : ''}: ${t.p1sg}.`;
  return { prompt: `Выбери «мой(я) ${w.gloss}» (${w.word}, притяжательный 1 лицо ед. числа).`, correct_answer: t.p1sg, distractors, explanation };
}

function possessive3Drill(w) {
  const t = possTable(w);
  const distractors = [t.p1sg, t.p2sg, t.p1pl];
  const explanation = w.bucket === 'vowel'
    ? `После гласной основы 3-е лицо всегда со вставной -с-: ${t.p3} (не просто -ы/-і).`
    : `После согласной основы 3-е лицо — просто -${w.harmony === 'back' ? 'ы' : 'і'}: ${t.p3}${w.bucket === 'voiceless' ? ` (${w.word.slice(-1)} озвончается: ${mutateStem(w.word)})` : ''}.`;
  return { prompt: `Выбери «его/её ${w.gloss}» (${w.word}, притяжательный 3 лицо).`, correct_answer: t.p3, distractors, explanation };
}

function possessive1plDrill(w) {
  const t = possTable(w);
  const distractors = [t.p1sg, t.p2sg, t.p3];
  const explanation = `«наш(а) ${w.gloss}» — притяжательный 1 лицо мн. числа: -${w.harmony === 'back' ? 'ымыз' : 'іміз'} → ${t.p1pl}. Не путай с ед. числом «${t.p1sg}».`;
  return { prompt: `Выбери «наш(а) ${w.gloss}» (${w.word}, притяжательный 1 лицо мн. числа).`, correct_answer: t.p1pl, distractors, explanation };
}

const TOPICS = [
  { slug: 'kz-plural-suffix', drills: () => WORDS.map(plural) },
  {
    slug: 'kz-affixes-personal-possessive',
    drills: () => [...IDENTITY_WORDS.map(personalAffix1sg), ...IDENTITY_WORDS.map(personalAffix2sg), ...IDENTITY_WORDS.map(personalAffix1pl)]
  },
  {
    slug: 'kz-possessive-extended',
    drills: () => [...POSSESSIVE_WORDS.map(possessive1sgDrill), ...POSSESSIVE_WORDS.map(possessive3Drill), ...POSSESSIVE_WORDS.map(possessive1plDrill)]
  }
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
      if (countStmt.get(topic.id).c >= 20) {
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
