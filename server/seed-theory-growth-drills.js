// 5 multiple-choice drills per new topic from seed-theory-growth.js (24
// topics x 5 = 120), matching the density and quality bar of the
// original 100 drills (server/seed-theory-drills.js): distractors are
// realistic grammatical near-misses, not random noise.
import { db } from './db/index.js';

const DRILLS_BY_SLUG = {
  'kz-tense-present-detail': [
    { prompt: 'Выбери форму настоящего времени глагола "бару" (идти) для "мен" (я).', correct_answer: 'барамын', distractors: ['барады', 'барасың', 'барған'], explanation: '-амын для 1-го лица. барады — 3-е лицо, барасың — 2-е лицо, барған — прошедшее причастие.' },
    { prompt: 'Выбери правильную форму "оқу" (учиться, гласная основа) для "ол" (он/она).', correct_answer: 'оқиды', distractors: ['оқады', 'оқасың', 'оқыды'], explanation: 'После гласной основы аффикс -й, не -а: оқи-ды, а не "оқа-ды". оқыды — прошедшее время.' },
    { prompt: 'Какой аффикс настоящего времени после согласной основы твёрдого ряда (напр. "бар")?', correct_answer: '-а', distractors: ['-е', '-й', '-ды'], explanation: 'Твёрдый ряд → -а (барады). Мягкий ряд → -е. -й — после гласной. -ды — прошедшее время.' },
    { prompt: 'Выбери форму "келу" (приходить) для "сен" (ты).', correct_answer: 'келесің', distractors: ['келемін', 'келеді', 'келдің'], explanation: '-есің — 2-е лицо мягкого ряда. келемін — 1-е лицо, келеді — 3-е лицо, келдің — прошедшее.' },
    { prompt: 'Какая основа требует аффикса -й в настоящем времени?', correct_answer: 'заканчивающаяся на гласную', distractors: ['заканчивающаяся на глухую согласную', 'заканчивающаяся на звонкую согласную', 'любая основа мягкого ряда'], explanation: '-й добавляется после гласной (оқу→оқи-), чтобы избежать стечения гласных.' }
  ],
  'kz-tense-past-types': [
    { prompt: '"Ол кеше келді" — какое это прошедшее время и почему?', correct_answer: 'категорическое, говорящий уверен/был свидетелем', distractors: ['очевидное, говорящий узнал с чужих слов', 'будущее время', 'условное наклонение'], explanation: '-ды/-ді — категорическое прошедшее, используется, когда говорящий сам знает факт напрямую.' },
    { prompt: 'Выбери форму очевидного (неочевидного для говорящего) прошедшего от "келу".', correct_answer: 'келген', distractors: ['келді', 'келеді', 'келсін'], explanation: '-ген — очевидное/причастное прошедшее. келді — категорическое, келеді — настоящее-будущее, келсін — повелительное.' },
    { prompt: '"Ол, оказывается, кітап оқыған" передаёт что?', correct_answer: 'говорящий не был свидетелем, узнал позже', distractors: ['говорящий лично видел', 'действие происходит сейчас', 'действие точно произойдёт завтра'], explanation: '-ған подчёркивает, что говорящий не наблюдал действие напрямую.' },
    { prompt: 'Выбери категорическое прошедшее от "жазу" (писать) для 3-го лица.', correct_answer: 'жазды', distractors: ['жазған', 'жазады', 'жазсын'], explanation: '-ды — категорическое прошедшее. жазған — очевидное прошедшее, жазады — наст.-буд., жазсын — повелительное.' },
    { prompt: 'В чём разница между "барды" и "барған"?', correct_answer: 'источник уверенности говорящего (сам видел vs узнал)', distractors: ['время суток действия', 'вежливость обращения', 'число участников действия'], explanation: 'Оба про прошлое, но -ды — прямое знание, -ған — опосредованное/результативное.' }
  ],
  'kz-tense-future-types': [
    { prompt: 'Выбери категорическое (уверенное) будущее от "бару" для "мен".', correct_answer: 'барамын', distractors: ['барармын', 'барар', 'барған'], explanation: '-амын — уверенное намерение. барармын/барар — предположительное будущее.' },
    { prompt: '"Жаңбыр жауар" означает:', correct_answer: 'наверное, пойдёт дождь (предположение)', distractors: ['дождь точно пойдёт', 'дождь уже идёт', 'дождь шёл вчера'], explanation: '-ар/-ер — болжалды (предположительное) будущее.' },
    { prompt: 'Для твёрдого личного плана "я точно приду" лучше использовать:', correct_answer: 'келемін', distractors: ['келермін', 'келген', 'келсін'], explanation: '-емін — категорическое, уверенное. келермін звучит как предположение.' },
    { prompt: 'Какая форма будущего времени менее уверенная?', correct_answer: '-ар/-ер/-р', distractors: ['-амын/-емін', '-ды/-ді', '-ған/-ген'], explanation: '-ар/-ер — болжалды (предположительное) будущее, самое неуверенное из перечисленных.' },
    { prompt: 'Выбери правильный перевод "Жаңбыр жауар":', correct_answer: 'Наверное, пойдёт дождь.', distractors: ['Дождь идёт.', 'Дождь шёл.', 'Дождь точно пойдёт.'], explanation: 'Болжалды келер шақ выражает предположение, не уверенность.' }
  ],
  'kz-imperative': [
    { prompt: 'Как сказать "Приходи!" (обращение на "ты")?', correct_answer: 'Кел!', distractors: ['Келіңіз!', 'Келемін', 'Келсін'], explanation: 'Прямая основа без суффикса — повелительное 2-го лица неформальное.' },
    { prompt: 'Как вежливо попросить "Приходите!" (на "вы")?', correct_answer: 'Келіңіз!', distractors: ['Кел!', 'Келейік!', 'Келеді'], explanation: '-іңіз — вежливая форма повелительного наклонения.' },
    { prompt: 'Как сказать "Пойдёмте!" (давайте вместе)?', correct_answer: 'Барайық!', distractors: ['Бар!', 'Барыңыз!', 'Барсын!'], explanation: '-йық/-айық — форма 1-го лица множественного числа побуждения ("давайте").' },
    { prompt: '"Ол келсін" переводится как:', correct_answer: 'Пусть он придёт.', distractors: ['Он придёт.', 'Он пришёл.', 'Он, возможно, придёт.'], explanation: '-сын/-сін — повелительное 3-го лица ("пусть").' },
    { prompt: 'К незнакомому человеку старше по возрасту нужно обратиться:', correct_answer: 'Келіңіз! (вежливая форма)', distractors: ['Кел! (прямая форма)', 'Келеді (наст.-буд. время)', 'Келген (прошедшее причастие)'], explanation: 'Прямая основа без -ыңыз/-іңіз к незнакомцу звучит грубо.' }
  ],
  'kz-conditional-mood': [
    { prompt: 'Выбери условную форму "болу" (быть) — "если будет".', correct_answer: 'болса', distractors: ['болды', 'болады', 'болған'], explanation: '-са/-се — шартты рай (условное наклонение).' },
    { prompt: '"Уақытым болса, келемін" переводится:', correct_answer: 'Если будет время, приду.', distractors: ['Время было, я пришёл.', 'Времени нет, я не приду.', 'Я хочу, чтобы было время.'], explanation: '-са выражает условие "если", не факт и не желание.' },
    { prompt: 'Какой аффикс образует шартты рай (условное наклонение)?', correct_answer: '-са/-се', distractors: ['-ған/-ген', '-атын/-етін', '-ар/-ер'], explanation: '-са/-се — единственный маркер условного наклонения.' },
    { prompt: '"Жаңбыр жаумаса, серуендейміз" означает:', correct_answer: 'Если не будет дождя, погуляем.', distractors: ['Дождь не идёт, поэтому гуляем.', 'Дождь шёл, поэтому не гуляли.', 'Мы гуляем под дождём.'], explanation: '-са + отрицание -ма/-ме = "если не...".' },
    { prompt: 'Шартты рай (-са/-се) выражает:', correct_answer: 'условие ("если")', distractors: ['желание ("хотел бы")', 'приказ ("сделай!")', 'предположение о прошлом'], explanation: 'Не путать с қалау рай (желание) — у них разные аффиксы и значения.' }
  ],
  'kz-participle-esimshe': [
    { prompt: '"оқитын кітап" переводится как:', correct_answer: 'книга, которую читают / читаемая книга', distractors: ['прочитанная книга', 'книга, которая будет прочитана', 'непрочитанная книга'], explanation: '-атын/-етін — обычное/повторяющееся действие как определение.' },
    { prompt: '"оқыған кітап" переводится как:', correct_answer: 'прочитанная книга', distractors: ['книга, которую читают', 'книга для чтения', 'нечитаная книга'], explanation: '-ған/-ген — завершённое действие как определение.' },
    { prompt: 'Есімше выполняет функцию:', correct_answer: 'определения перед существительным (как прилагательное)', distractors: ['сказуемого предложения', 'обстоятельства времени', 'союза между предложениями'], explanation: 'Есімше превращает глагол в определение, аналог причастия.' },
    { prompt: 'Выбери есімше от "келу" (приходить) для "человек, который обычно приходит":', correct_answer: 'келетін адам', distractors: ['келген адам', 'келді адам', 'келсін адам'], explanation: '-етін — обычное/повторяющееся действие. -ген — уже завершённое.' },
    { prompt: 'В чём отличие "сатып алған зат" от простого прошедшего времени "сатып алды"?', correct_answer: 'есімше определяет существительное, а не является сказуемым', distractors: ['есімше про будущее, а простое прошедшее про настоящее', 'разницы нет, это синонимы', 'есімше используется только в вопросах'], explanation: '"сатып алған зат" — "купленная вещь" (определение), "сатып алды" — "купил" (сказуемое).' }
  ],
  'kz-converb-kosemshe': [
    { prompt: '"Үйге келіп, тамақ іштім" — что означает "келіп"?', correct_answer: 'придя (добавочное действие перед основным)', distractors: ['придёт', 'приходил бы', 'если придёт'], explanation: '-ып/-іп — көсемше, показывает последовательное добавочное действие.' },
    { prompt: '"Жүріп келеді" означает:', correct_answer: 'идёт (пешком, движется) — одновременное действие', distractors: ['пришёл давно', 'придёт завтра', 'шёл вчера'], explanation: '-а/-е/-й форма көсемше показывает одновременность.' },
    { prompt: 'Основная функция көсемше:', correct_answer: 'показать добавочное действие рядом с основным', distractors: ['образовать множественное число', 'показать принадлежность', 'задать вопрос'], explanation: 'Көсемше — деепричастие, не самостоятельное законченное сказуемое.' },
    { prompt: '"Тұрып, барып, көрдім" — сколько отдельных предложений здесь?', correct_answer: 'одно предложение с цепочкой действий', distractors: ['три отдельных предложения', 'два предложения', 'вопросительное предложение'], explanation: '-ып/-іп соединяет глаголы в одну цепочку действий одного предложения.' },
    { prompt: 'Какой аффикс көсемше показывает одновременность действия?', correct_answer: '-а/-е/-й', distractors: ['-ып/-іп/-п', '-ған/-ген', '-са/-се'], explanation: '-а/-е/-й — одновременность ("делая"), -ып/-іп/-п — последовательность ("сделав").' }
  ],
  'kz-plural-suffix': [
    { prompt: 'Выбери множественное число от "үй" (дом).', correct_answer: 'үйлер', distractors: ['үйдер', 'үйтер', 'үйлар'], explanation: 'После гласной/сонорной — -лер (мягкий ряд для үй).' },
    { prompt: 'Выбери множественное число от "қыз" (девочка).', correct_answer: 'қыздар', distractors: ['қызлар', 'қыздер', 'қызтар'], explanation: 'После звонкой согласной -з — аффикс -дар.' },
    { prompt: 'Выбери множественное число от "кітап" (книга).', correct_answer: 'кітаптар', distractors: ['кітапдар', 'кітаплар', 'кітаптер'], explanation: 'После глухой согласной -п — аффикс -тар (твёрдый ряд).' },
    { prompt: '"Бес кітап" (пять книг) — почему без -тар?', correct_answer: 'после числительных множественное число не используется', distractors: ['это ошибка, так неправильно', '"бес" отменяет падеж', '"кітап" не имеет множественного числа'], explanation: 'После числительного смысл множественности уже понятен, суффикс избыточен.' },
    { prompt: 'Какой аффикс множественного числа выбирается для основы на глухую согласную?', correct_answer: '-тар/-тер', distractors: ['-лар/-лер', '-дар/-дер', '-нар/-нер'], explanation: 'Глухая согласная → -тар/-тер, звонкая → -дар/-дер, гласная/сонорная → -лар/-лер.' }
  ],
  'kz-possessive-extended': [
    { prompt: 'Выбери "моя книга".', correct_answer: 'кітабым', distractors: ['кітабың', 'кітабы', 'кітабымыз'], explanation: '-ым — 1 лицо ед. числа (кітап+ым → кітабым, п озвончается).' },
    { prompt: 'Выбери "его книга".', correct_answer: 'кітабы', distractors: ['кітабым', 'кітабың', 'кітабыңыз'], explanation: '-сы/-ы — 3-е лицо.' },
    { prompt: 'Почему "атасы" (его дед), а не "атайы"?', correct_answer: 'после гласной основы вставляется -с-', distractors: ['это исключение без правила', '"ата" не принимает притяжательный аффикс', 'всегда используется -йы'], explanation: '3-е лицо после гласной основы: обязательная вставная -с- (ата+сы → атасы).' },
    { prompt: 'Выбери "наша книга".', correct_answer: 'кітабымыз', distractors: ['кітабыңыз', 'кітаптарымыз', 'кітабы'], explanation: '-ымыз — 1 лицо множественное число.' },
    { prompt: 'Тәуелдік жалғау (притяжательный аффикс) присоединяется:', correct_answer: 'напрямую к существительному', distractors: ['только вместе с отдельным словом "менің"', 'только к глаголам', 'только во множественном числе'], explanation: 'В отличие от русского "моя книга" (два слова), казахский обходится одним словом с аффиксом.' }
  ],
  'kz-conjunctions': [
    { prompt: 'Выбери союз "но".', correct_answer: 'бірақ', distractors: ['немесе', 'сондықтан', 'себебі'], explanation: 'бірақ — противительный союз "но".' },
    { prompt: 'Выбери союз "поэтому".', correct_answer: 'сондықтан', distractors: ['бірақ', 'немесе', 'және'], explanation: 'сондықтан вводит следствие.' },
    { prompt: 'Выбери союз "или".', correct_answer: 'немесе', distractors: ['бірақ', 'себебі', 'және'], explanation: 'немесе — разделительный союз.' },
    { prompt: '"Шаршадым, ___ үйде қалдым" (Устал, ___ остался дома) — какой союз?', correct_answer: 'сондықтан', distractors: ['бірақ', 'немесе', 'себебі'], explanation: 'сондықтан = поэтому, вводит следствие из первой части.' },
    { prompt: 'себебі и өйткені оба означают:', correct_answer: 'потому что', distractors: ['но', 'или', 'поэтому'], explanation: 'Оба — причинные союзы, различаются позицией в предложении, не значением.' }
  ],
  'kz-emphatic-particles': [
    { prompt: '"Мен айттым ғой" — роль частицы "ғой"?', correct_answer: 'смягчение/напоминание ("же", "ведь")', distractors: ['вопрос', 'отрицание', 'ограничение'], explanation: 'ғой — модальная частица напоминания/смягчения.' },
    { prompt: '"Тек сен келдің" означает:', correct_answer: 'Пришёл только ты.', distractors: ['Ты тоже пришёл.', 'Ты не пришёл.', 'Пришли все, кроме тебя.'], explanation: 'тек = только, ограничительная частица.' },
    { prompt: 'Частицы ма/ме/ба/бе/па/пе используются для:', correct_answer: 'образования вопроса', distractors: ['образования множественного числа', 'смягчения приказа', 'обозначения прошедшего времени'], explanation: 'Это вопросительные частицы.' },
    { prompt: 'Выбери частицу ограничения ("только").', correct_answer: 'тек', distractors: ['ғой', 'ма', 'және'], explanation: 'тек — единственная частица из списка со значением "только".' },
    { prompt: 'Почему "ғой" сложно перевести одним словом?', correct_answer: 'это модальная частица, смысл передаётся интонацией/контекстом', distractors: ['у неё нет значения вообще', 'она используется только в письменной речи', 'она заменяет глагол'], explanation: 'Модальные частицы часто не имеют прямого эквивалента в русском.' }
  ],
  'kz-comparative': [
    { prompt: 'Выбери сравнительную степень от "үлкен" (большой).', correct_answer: 'үлкенірек', distractors: ['ең үлкен', 'үлкендер', 'үлкенде'], explanation: '-ірек — сравнительная степень. "ең үлкен" — превосходная степень.' },
    { prompt: '"Бұл үйден үлкенірек" означает:', correct_answer: 'Больше, чем этот дом.', distractors: ['Самый большой дом.', 'Такой же большой, как этот дом.', 'Меньше, чем этот дом.'], explanation: '-ден/-дан ("чем") + сравнительная степень.' },
    { prompt: 'Какое слово образует превосходную степень ("самый")?', correct_answer: 'ең', distractors: ['тек', 'ғой', 'өте'], explanation: 'ең ставится перед прилагательным для превосходной степени: ең үлкен — самый большой.' },
    { prompt: 'Выбери сравнительную форму "жылдам" (быстрый) для "иди быстрее".', correct_answer: 'жылдамырақ', distractors: ['ең жылдам', 'жылдамдар', 'жылдамда'], explanation: '-ырақ — сравнительная степень (вставная гласная для удобства произношения).' },
    { prompt: '-рақ/-рек — это степень:', correct_answer: 'сравнительная ("более")', distractors: ['превосходная ("самый")', 'уменьшительная', 'множественного числа'], explanation: 'Не путать со словом "ең", которое даёт превосходную степень.' }
  ],
  'en-past-perfect': [
    { prompt: '"When I arrived, the meeting ___ already started." Choose the correct form.', correct_answer: 'had', distractors: ['has', 'was', 'have'], explanation: 'Past Perfect (had + past participle) shows the meeting started before I arrived.' },
    { prompt: 'Choose the correct form: "By the time she called, I ___ dinner."', correct_answer: 'had already eaten', distractors: ['have already eaten', 'was already eating', 'eat already'], explanation: '"By the time" + past marks a deadline in the past; the earlier action needs Past Perfect.' },
    { prompt: 'Which tense do we use for an action completed before another past action?', correct_answer: 'Past Perfect', distractors: ['Past Simple', 'Present Perfect', 'Past Continuous'], explanation: 'Past Perfect specifically marks "earlier than another past point".' },
    { prompt: '"When I arrived, the meeting started." vs "When I arrived, the meeting had started." — what changes?', correct_answer: 'In the second, the meeting started before I arrived; in the first, at that moment.', distractors: ['No difference, just style', 'The first is about the future', 'The second is a question'], explanation: 'Past Simple in both clauses suggests simultaneity; Past Perfect shows the meeting started earlier.' },
    { prompt: 'Choose the correct form: "She ___ never seen snow before that winter."', correct_answer: 'had', distractors: ['has', 'was', 'did'], explanation: 'Past Perfect for an experience true up until a point in the past.' }
  ],
  'en-future-forms': [
    { prompt: '"Look at those clouds, it ___ rain." Choose the best form.', correct_answer: 'is going to', distractors: ['will', 'is raining', 'rains'], explanation: '"Going to" is used for predictions based on present evidence (the clouds).' },
    { prompt: '"I\'m meeting him at 5pm tomorrow." What does this express?', correct_answer: 'An already arranged plan', distractors: ['A spontaneous decision', 'A prediction with no evidence', 'A general fact'], explanation: 'Present Continuous for future = a fixed, arranged plan.' },
    { prompt: 'Choose the correct form for a decision made right now: "The phone\'s ringing -- I ___ get it."', correct_answer: "'ll", distractors: ['am going to', 'am getting', 'get'], explanation: '"Will" for spontaneous decisions made at the moment of speaking.' },
    { prompt: '"I think it ___ rain tomorrow." (a guess, no strong evidence)', correct_answer: 'will', distractors: ['is going to', 'is raining', 'rains'], explanation: '"Will" for predictions/opinions without visible evidence.' },
    { prompt: '"I will meet him at 5pm tomorrow" (as an already-arranged plan) sounds:', correct_answer: 'unnatural -- like a decision made right now', distractors: ['perfectly natural and standard', 'grammatically incorrect', 'used only in questions'], explanation: 'For pre-arranged plans, Present Continuous ("I\'m meeting him") is the natural choice.' }
  ],
  'en-perfect-continuous': [
    { prompt: '"I\'ve been working on this report all day." What\'s emphasized?', correct_answer: 'the duration/process of the action', distractors: ['the exact result', 'that the action is finished', 'a future plan'], explanation: 'Present Perfect Continuous highlights the ongoing process, not just the outcome.' },
    { prompt: '"She was tired because she ___ running." Choose the correct form.', correct_answer: 'had been', distractors: ['has been', 'was', 'has'], explanation: 'Past Perfect Continuous for a process leading up to a past result.' },
    { prompt: 'Which verb does NOT normally take the continuous form?', correct_answer: 'know', distractors: ['work', 'run', 'wait'], explanation: 'Stative verbs like "know", "believe", "own" don\'t normally take continuous forms.' },
    { prompt: 'Choose the correct sentence.', correct_answer: 'I have known him for years.', distractors: ['I have been knowing him for years.', 'I am knowing him for years.', 'I know him since years.'], explanation: '"Know" is stative -- Present Perfect Continuous ("have been knowing") is not standard.' },
    { prompt: 'Present Perfect Continuous is best used for:', correct_answer: 'an action started in the past, ongoing or just finished, with visible effect now', distractors: ['an action completed long ago with no connection to now', 'a future scheduled event', 'a hypothetical situation'], explanation: 'The focus is duration and present relevance, not a finished, disconnected past event.' }
  ],
  'en-articles-basics': [
    { prompt: '"I bought ___ book. ___ book was expensive." Choose the correct articles.', correct_answer: 'a / The', distractors: ['the / A', 'a / A', 'the / The'], explanation: 'First mention = "a" (indefinite); second mention, now known = "the" (definite).' },
    { prompt: '"I like ___ music." (music in general)', correct_answer: '— (no article)', distractors: ['the', 'a', 'an'], explanation: 'Uncountable nouns used in a general sense take zero article.' },
    { prompt: 'Which article is used for something unique or already known from context?', correct_answer: 'the', distractors: ['a', 'an', '— (no article)'], explanation: '"The" marks a specific, identifiable thing.' },
    { prompt: '"She\'s ___ engineer." Choose the correct article.', correct_answer: 'an', distractors: ['a', 'the', '— (no article)'], explanation: '"Engineer" starts with a vowel sound, so "an", and professions need an article.' },
    { prompt: 'When is the zero article typically used?', correct_answer: 'with uncountable nouns and plurals in a general sense', distractors: ['with all singular nouns', 'only in questions', 'only with proper nouns of people'], explanation: 'Zero article marks generality, not a specific instance.' }
  ],
  'en-articles-common-mistakes': [
    { prompt: 'Choose the correct sentence.', correct_answer: 'I work at a marketing agency.', distractors: ['I work in marketing agency.', 'I work at marketing agency.', 'I work in a marketing.'], explanation: '"Agency" is countable singular -- it needs an article; "at" fits a specific workplace.' },
    { prompt: 'Choose the correct sentence.', correct_answer: 'I have free time today.', distractors: ['I have a free time today.', 'I have the free time today.', 'I have frees time today.'], explanation: '"Free time" is uncountable -- no "a" is possible with it.' },
    { prompt: '"She\'s ___ engineer." Why does this need an article?', correct_answer: 'professions/job titles require an article in English', distractors: ["it doesn't need one", 'only plural professions need one', 'only informal speech uses one'], explanation: 'Unlike Russian, English marks professions with a/an: "She\'s an engineer", not "She\'s engineer".' },
    { prompt: 'Which noun below can NEVER take "a/an"?', correct_answer: 'information', distractors: ['agency', 'engineer', 'meeting'], explanation: '"Information" is uncountable; "a/an" only pairs with countable singular nouns.' },
    { prompt: 'Choose the correct sentence.', correct_answer: 'Can you give me some advice?', distractors: ['Can you give me an advice?', 'Can you give me the advices?', 'Can you give me a advice?'], explanation: '"Advice" is uncountable -- no "a/an", and no regular plural "-s".' }
  ],
  'en-prepositions-place-time': [
    { prompt: '"I\'ll see you ___ the office ___ 9am." Choose the correct prepositions.', correct_answer: 'at / at', distractors: ['in / on', 'on / in', 'at / in'], explanation: '"At" for a specific point -- both a place-point (the office) and a precise time (9am).' },
    { prompt: '"She lives ___ Almaty, ___ Abay street." Choose the correct prepositions.', correct_answer: 'in / on', distractors: ['at / in', 'on / at', 'in / in'], explanation: '"In" for a city (space), "on" for a street (surface).' },
    { prompt: '"The meeting is ___ Monday ___ March." Choose the correct prepositions.', correct_answer: 'on / in', distractors: ['in / on', 'at / on', 'on / at'], explanation: '"On" for days, "in" for months/longer periods.' },
    { prompt: 'Which preposition goes with an exact clock time?', correct_answer: 'at', distractors: ['on', 'in', '— (none needed)'], explanation: '"At" + precise time: at 5pm, at noon.' },
    { prompt: 'Choose the correct preposition: "I work ___ the advertising industry."', correct_answer: 'in', distractors: ['at', 'on', 'for'], explanation: '"In" fits a broad field/industry, not a specific point.' }
  ],
  'en-prepositions-work': [
    { prompt: '"I work ___ a marketing agency." (physically located there)', correct_answer: 'at', distractors: ['for', 'in', 'on'], explanation: '"At" marks the physical workplace.' },
    { prompt: '"I work ___ a great company." (the employer)', correct_answer: 'for', distractors: ['at', 'in', 'to'], explanation: '"For" marks who employs you.' },
    { prompt: '"She works ___ the marketing department." Choose the correct preposition.', correct_answer: 'in', distractors: ['at', 'for', 'on'], explanation: '"In" fits a department/division (a space you\'re part of).' },
    { prompt: 'Choose the sentence describing your employer, not your workplace.', correct_answer: 'I work for a great company.', distractors: ['I work at a great company.', 'I work on a great company.', 'I work in a great company.'], explanation: '"For" = employer; "at" would describe the physical location instead.' },
    { prompt: '"I work ___ advertising." (the field/industry)', correct_answer: 'in', distractors: ['at', 'for', 'on'], explanation: 'Industries/fields take "in", like "in an industry".' }
  ],
  'en-dependent-prepositions': [
    { prompt: '"She\'s interested ___ psychology." Choose the correct preposition.', correct_answer: 'in', distractors: ['at', 'on', 'for'], explanation: '"Interested in" is a fixed pair -- must be memorized.' },
    { prompt: '"He\'s really good ___ maths." Choose the correct preposition.', correct_answer: 'at', distractors: ['in', 'on', 'for'], explanation: '"Good at" is fixed -- not "good in", despite direct translation logic.' },
    { prompt: '"I\'m afraid ___ spiders." Choose the correct preposition.', correct_answer: 'of', distractors: ['from', 'at', 'for'], explanation: '"Afraid of" is the standard fixed pairing.' },
    { prompt: '"He\'s responsible ___ the whole project." Choose the correct preposition.', correct_answer: 'for', distractors: ['of', 'at', 'to'], explanation: '"Responsible for" is the fixed dependent preposition.' },
    { prompt: '"This design is similar ___ the last one." Choose the correct preposition.', correct_answer: 'to', distractors: ['with', 'as', 'from'], explanation: '"Similar to" is fixed -- not "similar with" or "similar as".' }
  ],
  'en-subject-verb-agreement': [
    { prompt: '"She ___ two cats." Choose the correct verb form.', correct_answer: 'has', distractors: ['have', 'having', 'is have'], explanation: '3rd person singular (she) requires "has", not "have".' },
    { prompt: '"They ___ one dog." Choose the correct verb form.', correct_answer: 'have', distractors: ['has', 'having', 'is having'], explanation: '"They" is plural -- takes "have", not "has".' },
    { prompt: '"___ book is interesting." (one book) Choose the correct word.', correct_answer: 'This', distractors: ['These', 'Those', 'Them'], explanation: 'Singular noun needs the singular demonstrative "this".' },
    { prompt: '"___ books are interesting." (several books) Choose the correct word.', correct_answer: 'These', distractors: ['This', 'That', 'It'], explanation: 'Plural noun needs the plural demonstrative "these".' },
    { prompt: 'Choose the correct sentence.', correct_answer: 'He has a meeting at 3pm.', distractors: ['He have a meeting at 3pm.', 'He having a meeting at 3pm.', 'He haves a meeting at 3pm.'], explanation: '3rd person singular subject "he" always pairs with "has", never "have".' }
  ],
  'en-adverb-word-order': [
    { prompt: 'Choose the correctly placed sentence.', correct_answer: "I've already eaten.", distractors: ["I already've eaten.", "I've eaten have already.", "Already've I eaten."], explanation: '"Already" typically goes between the auxiliary ("have") and the main verb.' },
    { prompt: '"Have you finished ___?" Choose the correct word.', correct_answer: 'yet', distractors: ['already', 'still', 'just'], explanation: '"Yet" is the natural choice in questions about something expected but not confirmed done.' },
    { prompt: '"I\'m ___ waiting." (the situation continues) Choose the correct word.', correct_answer: 'still', distractors: ['yet', 'already', 'just'], explanation: '"Still" shows an ongoing situation, same position as "already".' },
    { prompt: '"She ___ left." (very recently) Choose the correct word.', correct_answer: 'just', distractors: ['yet', 'still', 'already'], explanation: '"Just" marks something that happened a moment ago, placed before the main verb.' },
    { prompt: 'In "I have already finished," where does "already" go?', correct_answer: 'between the auxiliary and the main verb', distractors: ['always at the very start of the sentence', 'always at the very end', 'never with Present Perfect'], explanation: 'Standard position: auxiliary + already + main verb.' }
  ],
  'en-modals-obligation': [
    { prompt: '"I ___ call her back, I promised." (personal sense of duty) Choose the correct modal.', correct_answer: 'must', distractors: ['have to', 'should', 'need'], explanation: '"Must" fits a personal, felt obligation, often from the speaker\'s own conviction.' },
    { prompt: '"I ___ submit the report by Friday." (a rule set by someone else) Choose the correct modal.', correct_answer: 'have to', distractors: ['must', 'should', 'need'], explanation: '"Have to" fits an external obligation/rule, not the speaker\'s personal feeling.' },
    { prompt: '"You ___ rest more." (friendly advice) Choose the correct modal.', correct_answer: 'should', distractors: ['must', 'have to', 'need to'], explanation: '"Should" is for advice/recommendation, not strict obligation.' },
    { prompt: '"You ___ smoke here." (it\'s forbidden) Choose the correct form.', correct_answer: 'must not', distractors: ["don't have to", "shouldn't necessarily", "don't need to"], explanation: '"Must not" = prohibition (forbidden).' },
    { prompt: '"You ___ come if you don\'t want to." (it\'s optional) Choose the correct form.', correct_answer: "don't have to", distractors: ['must not', "mustn't", "shouldn't"], explanation: '"Don\'t have to" = no obligation (optional) -- completely different from "must not" (forbidden).' }
  ],
  'en-mixed-conditionals': [
    { prompt: '"If I had studied medicine, I ___ a doctor now." Choose the correct form.', correct_answer: 'would be', distractors: ['would have been', 'will be', 'had been'], explanation: 'Mixed conditional: past condition (had studied) + present result (would be).' },
    { prompt: '"I wish I ___ Kazakh fluently." (a wish about the present) Choose the correct form.', correct_answer: 'spoke', distractors: ['had spoken', 'will speak', 'speak'], explanation: '"Wish" + past simple for a wish about the present.' },
    { prompt: '"I wish I ___ earlier." (regret about the past) Choose the correct form.', correct_answer: 'had started', distractors: ['started', 'would start', 'start'], explanation: '"Wish" + past perfect for regret about the past.' },
    { prompt: 'Choose the correct sentence expressing annoyance at someone else\'s habit.', correct_answer: 'I wish you would stop doing that.', distractors: ['I wish you stop doing that.', 'I wish you stopped doing that.', 'I wish you have stopped doing that.'], explanation: '"Wish" + "would" is for complaining about someone else\'s repeated behavior, not your own state.' },
    { prompt: 'A mixed conditional combines:', correct_answer: 'a condition and a result from different time periods', distractors: ['two present conditions', 'two future results', 'a question and an answer'], explanation: 'E.g. a past condition leading to a present result, unlike standard conditionals where both parts match in time.' }
  ]
};

function seed() {
  const topicIdStmt = db.prepare('SELECT id FROM theory_topics WHERE slug = ?');
  const existingCountStmt = db.prepare('SELECT COUNT(*) AS c FROM theory_drills WHERE topic_id = ?');
  const insertDrill = db.prepare(
    `INSERT INTO theory_drills (topic_id, prompt, correct_answer, distractors, explanation, position)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
  const missingTopics = [];
  const alreadyHadDrills = [];

  const insertAll = db.transaction(() => {
    for (const [slug, drills] of Object.entries(DRILLS_BY_SLUG)) {
      const topic = topicIdStmt.get(slug);
      if (!topic) {
        missingTopics.push(slug);
        continue;
      }
      if (existingCountStmt.get(topic.id).c > 0) {
        alreadyHadDrills.push(slug);
        continue; // idempotent: don't duplicate if this topic already has drills
      }
      drills.forEach((drill, i) => {
        insertDrill.run(topic.id, drill.prompt, drill.correct_answer, JSON.stringify(drill.distractors), drill.explanation, i);
      });
      inserted += drills.length;
    }
  });

  insertAll();

  console.log(`Inserted ${inserted} drills across ${Object.keys(DRILLS_BY_SLUG).length - missingTopics.length - alreadyHadDrills.length} topics.`);
  if (missingTopics.length > 0) console.log('Topics not found (run seed-theory-growth.js first):', missingTopics);
  if (alreadyHadDrills.length > 0) console.log('Topics that already had drills, skipped:', alreadyHadDrills);

  console.log('Total drills now:', db.prepare('SELECT COUNT(*) c FROM theory_drills').get().c);
}

seed();
