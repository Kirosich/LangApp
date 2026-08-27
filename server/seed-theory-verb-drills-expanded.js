// Expands the 8 Kazakh verb (глагол: время и наклонение) drill topics
// from 5 drills each. Same approach as the case/morphology expansions:
// a small verb bank + explicit, hand-verified suffix rules, generated
// programmatically. Every derived form below was checked by hand
// against the 25 existing (already-correct) drills for these topics
// before writing the generators -- e.g. оқиды/оқыған/келетін/барамын
// all reproduce exactly what's already in the DB for those words.
import { db } from './db/index.js';

// type: 'consonant' -- needs а/е insertion for the tense vowel.
//       'vowelRegular' -- ends in а/е/о/ө/ұ/ү, tense vowel is an overt
//         -й (жаса -> жасай-).
//       'vowelContract' -- ends in ы/і, the tense vowel contracts with
//         it to и (оқы -> оқи-). Kept to one verb (оқы) since this is
//         the trickiest allomorph and the existing DB only validates it
//         for that one word.
const VERBS = [
  { word: 'бар', gloss: 'идти', harmony: 'back', type: 'consonant', voiceless: false },
  { word: 'жаз', gloss: 'писать', harmony: 'back', type: 'consonant', voiceless: false },
  { word: 'айт', gloss: 'сказать', harmony: 'back', type: 'consonant', voiceless: true },
  { word: 'тұр', gloss: 'стоять', harmony: 'back', type: 'consonant', voiceless: false },
  { word: 'кел', gloss: 'приходить', harmony: 'front', type: 'consonant', voiceless: false },
  { word: 'біл', gloss: 'знать', harmony: 'front', type: 'consonant', voiceless: false },
  { word: 'жүр', gloss: 'ходить', harmony: 'front', type: 'consonant', voiceless: false },
  { word: 'өт', gloss: 'проходить', harmony: 'front', type: 'consonant', voiceless: true },
  { word: 'жаса', gloss: 'делать', harmony: 'back', type: 'vowelRegular' },
  { word: 'тыңда', gloss: 'слушать', harmony: 'back', type: 'vowelRegular' },
  { word: 'сөйле', gloss: 'говорить', harmony: 'front', type: 'vowelRegular' },
  { word: 'ізде', gloss: 'искать', harmony: 'front', type: 'vowelRegular' },
  { word: 'оқы', gloss: 'читать', harmony: 'back', type: 'vowelContract' }
];
const CONSONANT_VERBS = VERBS.filter((v) => v.type === 'consonant');

function h(v, back, front) {
  return v.harmony === 'back' ? back : front;
}

// осы шақ tense-stem (before any person suffix): барa-, жасай-, оқи-.
function presentStem(v) {
  if (v.type === 'consonant') return v.word + h(v, 'а', 'е');
  if (v.type === 'vowelRegular') return v.word + 'й';
  return v.word.slice(0, -1) + 'и'; // vowelContract
}

const PERSON1 = { '1sg': { back: 'мын', front: 'мін' }, '2sg': { back: 'сың', front: 'сің' }, '3rd': { back: 'ды', front: 'ді' } };
function presentForm(v, person) {
  return person === '3rd' ? presentStem(v) + PERSON1['3rd'][v.harmony] : presentStem(v) + PERSON1[person][v.harmony];
}

// категорическое өткен шақ: -ды/-ді, devoicing to -ты/-ті after a
// voiceless stem-final consonant (айт -> айтты, matches ілік/табыс-style
// devoicing). Vowel-final stems always take the voiced -ды/-ді directly.
function categoricalPast3rd(v) {
  const suf = v.type === 'consonant' && v.voiceless ? h(v, 'ты', 'ті') : h(v, 'ды', 'ді');
  return v.word + suf;
}
function categoricalPast1sg(v) {
  return categoricalPast3rd(v) + 'м';
}

// очевидное өткен шақ (есімше as predicate): -ған/-ген, devoicing to
// -қан/-кен after voiceless (айт -> айтқан). Matches the existing
// оқыған/келген drills exactly.
function evidentialPast(v) {
  const suf = v.type === 'consonant' && v.voiceless ? h(v, 'қан', 'кен') : h(v, 'ған', 'ген');
  return v.word + suf;
}

// болжалды келер шақ (predictive future): -ар/-ер after a consonant
// stem, just -р after any vowel-final stem (no extra vowel needed --
// the stem already ends in one).
function predictiveStem(v) {
  return v.type === 'consonant' ? v.word + h(v, 'ар', 'ер') : v.word + 'р';
}
function futureForm(v, person) {
  if (person === '3rd') return predictiveStem(v);
  return predictiveStem(v) + (person === '1sg' ? h(v, 'мын', 'мін') : h(v, 'сың', 'сің'));
}

// есімше (habitual/general participle): presentStem + -тын/-тін.
function esimsheHabitual(v) {
  return presentStem(v) + h(v, 'тын', 'тін');
}

// көсемше: -ып/-іп after consonant, -п after any vowel-final stem
// (sequential/"having done"); presentStem bare, no person (simultaneous
// /"while doing").
function converbSequential(v) {
  return v.type === 'consonant' ? v.word + h(v, 'ып', 'іп') : v.word + 'п';
}
function converbSimultaneous(v) {
  return presentStem(v);
}

// шартты рай (conditional): -са/-се attaches directly to the bare stem
// (no insertion needed for either stem type).
function conditionalForm(v) {
  return v.word + h(v, 'са', 'се');
}
function conditional1sg(v) {
  return conditionalForm(v) + 'м';
}

// Imperative (бұйрық рай).
function imperative2sgPolite(v) {
  if (v.type === 'consonant') return v.word + h(v, 'ыңыз', 'іңіз');
  return v.word + h(v, 'ңыз', 'ңіз');
}
function imperative1pl(v) {
  if (v.type === 'consonant') return v.word + h(v, 'айық', 'ейік');
  if (v.type === 'vowelContract') return v.word.slice(0, -1) + 'и' + h(v, 'ық', 'ік');
  return v.word + h(v, 'йық', 'йік');
}
function imperative3rd(v) {
  return v.word + h(v, 'сын', 'сін');
}

// ---------------------------------------------------------------------
// Drill builders (one per topic)
// ---------------------------------------------------------------------

function verbTensesDrills() {
  // Overview 3-way contrast, 1st person only, consonant verbs only --
  // matches the existing 5 drills' exact scope (бару 1sg).
  const out = [];
  for (const v of CONSONANT_VERBS) {
    const present = presentForm(v, '1sg');
    const past = categoricalPast1sg(v);
    const future1 = presentForm(v, '1sg'); // categorical future == present form
    const future2 = futureForm(v, '1sg'); // predictive
    out.push({
      prompt: `Мен қазір ${v.word}___. (сейчас/привычно, осы шақ, «${v.gloss}»)`,
      correct_answer: present,
      distractors: [past, future2, presentForm(v, '3rd')],
      explanation: `Осы шақ (настоящее): основа + ${h(v, 'а', 'е')} + личный аффикс → ${present}.`
    });
    out.push({
      prompt: `Мен кеше ${v.word}___. (вчера, точно сам делал, «${v.gloss}»)`,
      correct_answer: past,
      distractors: [present, future2, evidentialPast(v)],
      explanation: `Жедел (категорическое) өткен шақ: основа + ${categoricalPast3rd(v).slice(v.word.length)} + личный аффикс → ${past}. «${evidentialPast(v)}» — очевидное прошедшее, другая категория.`
    });
    out.push({
      prompt: `Мен ертең, мүмкін, ${v.word}___. (завтра, предположительно, «${v.gloss}»)`,
      correct_answer: future2,
      distractors: [future1, past, futureForm(v, '3rd')],
      explanation: `Болжалды келер шақ: основа + ${predictiveStem(v).slice(v.word.length)} + личный аффикс → ${future2}, оттенок неуверенности (в отличие от «${future1}», которое звучит увереннее).`
    });
  }
  return out;
}

function presentDetailDrills() {
  const out = [];
  for (const v of VERBS) {
    for (const person of ['1sg', '3rd']) {
      const correct = presentForm(v, person);
      const otherPerson = person === '1sg' ? '2sg' : '1sg';
      const otherPerson2 = person === '1sg' ? '3rd' : '2sg';
      let ruleErrorForm;
      if (v.type === 'consonant') {
        ruleErrorForm = v.word + h(v, 'е', 'а') + PERSON1[person][v.harmony]; // wrong harmony vowel
      } else if (v.type === 'vowelRegular') {
        ruleErrorForm = v.word + PERSON1[person][v.harmony]; // forgot the -й
      } else {
        ruleErrorForm = v.word + PERSON1[person][v.harmony]; // forgot the ы->и contraction
      }
      out.push({
        prompt: `Выбери форму настоящего времени (осы шақ) глагола «${v.word}» (${v.gloss}) для ${person === '1sg' ? '«мен» (я)' : '«ол» (он/она)'}.`,
        correct_answer: correct,
        distractors: [presentForm(v, otherPerson), presentForm(v, otherPerson2), ruleErrorForm],
        explanation:
          v.type === 'consonant'
            ? `«${v.word}» — основа на согласную, гласные ${h(v, 'задние', 'передние')} → вставка -${h(v, 'а', 'е')}: ${correct}.`
            : v.type === 'vowelRegular'
              ? `«${v.word}» оканчивается на гласную → вставка -й (не пропускай её): ${correct}, а не «${ruleErrorForm}».`
              : `«${v.word}» оканчивается на ы/і → стяжение с -й даёт -и: ${correct}, а не «${ruleErrorForm}» (частая ошибка — забыть про стяжение).`
      });
    }
  }
  return out;
}

function pastTypesDrills() {
  const out = [];
  for (const v of VERBS) {
    const cat = categoricalPast3rd(v);
    const evid = evidentialPast(v);
    out.push({
      prompt: `«${v.gloss}» (${v.word}): говорящий сам это видел/точно знает — какое прошедшее время?`,
      correct_answer: cat,
      distractors: [evid, presentForm(v, '3rd'), futureForm(v, '3rd')],
      explanation: `Жедел (категорическое) өткен шақ — говорящий сам свидетель: ${cat}.`
    });
    out.push({
      prompt: `«${v.gloss}» (${v.word}): говорящий не видел сам, узнал позже/по результату — какое прошедшее время?`,
      correct_answer: evid,
      distractors: [cat, presentForm(v, '3rd'), esimsheHabitual(v)],
      explanation: `Аңғарынды (очевидное) өткен шақ — не прямое наблюдение: ${evid}. «${cat}» подошло бы, только если говорящий видел сам.`
    });
  }
  return out;
}

function futureTypesDrills() {
  const out = [];
  for (const v of VERBS) {
    const catFuture = presentForm(v, '1sg');
    const predFuture = futureForm(v, '1sg');
    out.push({
      prompt: `«${v.gloss}» (${v.word}), твёрдое личное намерение («я точно...») — какая форма будущего?`,
      correct_answer: catFuture,
      distractors: [predFuture, categoricalPast1sg(v), futureForm(v, '3rd')],
      explanation: `Уверенное намерение — категорическая форма (та же, что и настоящее время): ${catFuture}.`
    });
    out.push({
      prompt: `«${v.gloss}» (${v.word}), «наверное, может быть» — какая форма будущего?`,
      correct_answer: predFuture,
      distractors: [catFuture, evidentialPast(v), futureForm(v, '3rd')],
      explanation: `Болжалды (предположительное) келер шақ: ${predFuture}. Менее уверенная форма, чем «${catFuture}».`
    });
  }
  return out;
}

function conditionalDrills() {
  const out = [];
  for (const v of VERBS) {
    const bare = conditionalForm(v);
    const withPerson = conditional1sg(v);
    const otherHarmonyBare = v.word + h(v, 'се', 'са');
    out.push({
      prompt: `Шартты рай (условное, «если ...») от «${v.word}» (${v.gloss}).`,
      correct_answer: bare,
      distractors: [otherHarmonyBare, categoricalPast3rd(v), evidentialPast(v)],
      explanation: `-${h(v, 'са', 'се')} — единственный маркер шартты рай: ${bare}.`
    });
    out.push({
      prompt: `«Если я ...» (шартты рай, 1 лицо ед. числа) от «${v.word}» (${v.gloss}).`,
      correct_answer: withPerson,
      distractors: [bare, categoricalPast1sg(v), otherHarmonyBare + 'м'],
      explanation: `Условное 1 лицо: основа + -${h(v, 'са', 'се')} + -м → ${withPerson}.`
    });
  }
  return out;
}

function esimsheDrills() {
  const out = [];
  for (const v of VERBS) {
    const habitual = esimsheHabitual(v);
    const completed = evidentialPast(v);
    out.push({
      prompt: `Есімше (определение, «который обычно ...») от «${v.word}» (${v.gloss}).`,
      correct_answer: habitual,
      distractors: [completed, presentForm(v, '3rd'), conditionalForm(v)],
      explanation: `-${h(v, 'тын', 'тін')} — обычное/повторяющееся действие как определение: ${habitual}. «${completed}» — уже завершённое действие, другой оттенок.`
    });
    out.push({
      prompt: `Есімше (определение, «уже сделанный/-ая ...») от «${v.word}» (${v.gloss}).`,
      correct_answer: completed,
      distractors: [habitual, categoricalPast3rd(v), presentForm(v, '3rd')],
      explanation: `-${h(v, 'ған', 'ген')}${v.type === 'consonant' && v.voiceless ? `/-${h(v, 'қан', 'кен')} после глухой согласной` : ''} — завершённое действие как определение: ${completed}.`
    });
  }
  return out;
}

function kosemsheDrills() {
  const out = [];
  for (const v of VERBS) {
    const seq = converbSequential(v);
    const sim = converbSimultaneous(v);
    out.push({
      prompt: `Көсемше (добавочное действие ПЕРЕД основным, «сделав ...») от «${v.word}» (${v.gloss}).`,
      correct_answer: seq,
      distractors: [sim, categoricalPast3rd(v), esimsheHabitual(v)],
      explanation: `-${v.type === 'consonant' ? h(v, 'ып', 'іп') : 'п'} — последовательное добавочное действие: ${seq}.`
    });
    out.push({
      prompt: `Көсемше (действие ОДНОВРЕМЕННО с основным, «делая ...») от «${v.word}» (${v.gloss}).`,
      correct_answer: sim,
      distractors: [seq, presentForm(v, '3rd'), conditionalForm(v)],
      explanation: `-${h(v, 'а', 'е')}${v.type !== 'consonant' ? '/-й' : ''} (без личного аффикса) — одновременность: ${sim}.`
    });
  }
  return out;
}

function imperativeDrills() {
  const out = [];
  for (const v of VERBS) {
    const polite = imperative2sgPolite(v);
    const third = imperative3rd(v);
    out.push({
      prompt: `Вежливое «...(те)!» (сен→сіз) от «${v.word}» (${v.gloss}).`,
      correct_answer: polite,
      distractors: [v.word, third, presentForm(v, '3rd')],
      explanation: `Вежливая форма 2 лица: -${v.type === 'consonant' ? h(v, 'ыңыз', 'іңіз') : h(v, 'ңыз', 'ңіз')} → ${polite}. «${v.word}» одно — грубая прямая форма.`
    });
    out.push({
      prompt: `«Пусть он/она ...!» от «${v.word}» (${v.gloss}).`,
      correct_answer: third,
      distractors: [polite, presentForm(v, '3rd'), evidentialPast(v)],
      explanation: `3 лицо повелительного: -${h(v, 'сын', 'сін')} → ${third}.`
    });
  }
  return out;
}

const TOPICS = [
  { slug: 'kz-verb-tenses', drills: verbTensesDrills },
  { slug: 'kz-tense-present-detail', drills: presentDetailDrills },
  { slug: 'kz-tense-past-types', drills: pastTypesDrills },
  { slug: 'kz-tense-future-types', drills: futureTypesDrills },
  { slug: 'kz-conditional-mood', drills: conditionalDrills },
  { slug: 'kz-participle-esimshe', drills: esimsheDrills },
  { slug: 'kz-converb-kosemshe', drills: kosemsheDrills },
  { slug: 'kz-imperative', drills: imperativeDrills }
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
      if (countStmt.get(topic.id).c >= 18) {
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
