// Groups all theory_topics into named categories and adds 24 new topics
// (12 kz, 12 en) filling real gaps -- especially the English weak spots
// already on record in CLAUDE.md profile: Past Perfect (routinely
// skipped), articles/prepositions, has/have and this/these agreement,
// word order with "already". A category's own level range isn't stored
// -- it's computed from its topics at read time, so it can't drift.
import { db } from './db/index.js';

// Existing 20 topics -> category. Not touching level -- these were
// hand-placed when the deck was originally seeded.
const EXISTING_CATEGORIES = {
  'kz-case-atau': 'Падежи',
  'kz-case-ilik': 'Падежи',
  'kz-case-barys': 'Падежи',
  'kz-case-tabys': 'Падежи',
  'kz-case-jatys': 'Падежи',
  'kz-case-shygys': 'Падежи',
  'kz-case-komektes': 'Падежи',
  'kz-affixes-personal-possessive': 'Морфология: словообразование и число',
  'kz-verb-tenses': 'Глагол: время и наклонение',
  'kz-negation': 'Отрицание и вопрос',
  'kz-question-particles': 'Отрицание и вопрос',
  'kz-postpositions': 'Служебные слова',
  'en-present-perfect-vs-past-simple': 'Tenses',
  'en-conditionals': 'Conditionals',
  'en-phrasal-verbs-work': 'Phrasal verbs',
  'en-phrasal-verbs-relationships': 'Phrasal verbs',
  'en-phrasal-verbs-daily-life': 'Phrasal verbs',
  'en-reported-speech': 'Reported speech',
  'en-confused-word-pairs': 'Confused words',
  'en-modals-deduction-politeness': 'Modals'
};

// New topics. Each: slug, language, category, title, level, summary,
// sections (explanation/example/common_mistake, in that order_index).
const NEW_TOPICS = [
  // --- Kazakh: Глагол: время и наклонение ---
  {
    slug: 'kz-tense-present-detail', language: 'kz', category: 'Глагол: время и наклонение', level: 'A2',
    title: 'Осы шақ: аффиксы -а/-е/-й подробно',
    summary: 'Как образуется настоящее время и почему выбор гласного/й зависит от основы.',
    sections: [
      { type: 'explanation', content: 'Осы шақ (настоящее время) образуется добавлением аффикса -а/-е (после согласного) или -й (после гласного) к основе глагола, плюс личное окончание. Выбор гласного зависит от гармонии гласных: твёрдый ряд → -а, мягкий ряд → -е. После гласной основы всегда -й.' },
      { type: 'example', content: 'бару (идти) → барамын (я иду), барасың (ты идёшь), барады (он идёт)\nкелу (приходить) → келемін (я прихожу), келесің (ты приходишь), келеді (он приходит)\nоқу (учиться, гласная основа) → оқимын (я учусь), оқисың, оқиды' },
      { type: 'common_mistake', content: 'Частая ошибка — использовать -а/-е там, где основа заканчивается на гласную: нужно -й (оқу → оқиды, а не "оқады").' }
    ]
  },
  {
    slug: 'kz-tense-past-types', language: 'kz', category: 'Глагол: время и наклонение', level: 'B1',
    title: 'Өткен шақ: категорическое vs очевидное прошедшее',
    summary: 'Разница между -ды/-ді (был свидетелем) и -ған/-ген (узнал не напрямую).',
    sections: [
      { type: 'explanation', content: 'В казахском два основных прошедших времени различаются по источнику знания. Категорическое прошедшее (-ды/-ді/-ты/-ті) — говорящий сам был свидетелем или уверен в факте. Очевидное/причастное прошедшее (-ған/-ген/-қан/-кен) — говорящий не был свидетелем напрямую, узнал с чужих слов, либо подчёркивает результат, видимый сейчас.' },
      { type: 'example', content: 'Ол келді. — Он пришёл (я это видел/точно знаю).\nОл келген. — Он, оказывается, приходил (я узнал об этом позже, не видел сам).' },
      { type: 'common_mistake', content: 'Путают формы, считая, что разница только стилистическая — на самом деле это разные источники достоверности, как эвиденциальность в других языках.' }
    ]
  },
  {
    slug: 'kz-tense-future-types', language: 'kz', category: 'Глагол: время и наклонение', level: 'B1',
    title: 'Келер шақ: болжалды vs категорическое будущее',
    summary: 'Уверенный план (-амын/-емін) против предположения (-ар/-ер).',
    sections: [
      { type: 'explanation', content: 'Категорическое будущее (через настояще-будущее -амын/-емін) используется для уверенных планов. Болжалды (предположительное) будущее (-ар/-ер/-р) выражает предположение, а не твёрдое намерение — часто переводится как «наверное сделаю».' },
      { type: 'example', content: 'Мен ертең барамын. — Я завтра пойду (уверен, план).\nЖаңбыр жауар. — Наверное, пойдёт дождь (предположение).' },
      { type: 'common_mistake', content: 'Использование -ар/-ер для твёрдых личных планов звучит неуверенно — для «я точно приду» лучше -амын/-емін, не -армын.' }
    ]
  },
  {
    slug: 'kz-imperative', language: 'kz', category: 'Глагол: время и наклонение', level: 'A2',
    title: 'Бұйрық рай — повелительное наклонение',
    summary: 'Прямая просьба на "ты" и вежливая форма на -ыңыз/-іңіз.',
    sections: [
      { type: 'explanation', content: 'Повелительное наклонение образуется без суффикса для 2-го лица ("сен"-формы: чистая основа глагола) и с -ыңыз/-іңіз для вежливой формы. Для 1-го и 3-го лица используются другие аффиксы (-йық/-айық для «давай(те)», -сын/-сін для «пусть»).' },
      { type: 'example', content: 'Кел! — Приходи!\nКеліңіз! — Приходите (вежливо)!\nБарайық! — Пойдём(те)!\nОл келсін. — Пусть он придёт.' },
      { type: 'common_mistake', content: 'Форма на -ыңыз обязательна при обращении на «вы» — использование прямой основы («Кел!») к незнакомому человеку звучит грубо.' }
    ]
  },
  {
    slug: 'kz-conditional-mood', language: 'kz', category: 'Глагол: время и наклонение', level: 'B1',
    title: 'Шартты рай — условное наклонение',
    summary: 'Аффикс -са/-се для условия "если".',
    sections: [
      { type: 'explanation', content: 'Условное наклонение образуется аффиксом -са/-се, добавленным к основе глагола, и выражает условие («если»). Часто сочетается с частицей «онда» (тогда) во второй части предложения.' },
      { type: 'example', content: 'Уақытым болса, келемін. — Если будет время, приду.\nЖаңбыр жаумаса, серуендейміз. — Если не будет дождя, погуляем.' },
      { type: 'common_mistake', content: 'Шартты рай — это не то же самое, что «қаласа» (хотел бы): -са/-се всегда про условие «если», а не про желание.' }
    ]
  },
  {
    slug: 'kz-participle-esimshe', language: 'kz', category: 'Глагол: время и наклонение', level: 'B1',
    title: 'Есімше — причастие',
    summary: 'Как глагол превращается в определение перед существительным.',
    sections: [
      { type: 'explanation', content: 'Есімше превращает глагол в определение, похожее по функции на прилагательное. Основные формы: -атын/-етін (обычное/повторяющееся действие), -ған/-ген/-қан/-кен (завершённое действие).' },
      { type: 'example', content: 'оқитын кітап — книга, которую читают/читаемая книга\nоқыған кітап — прочитанная книга\nкелетін адам — приходящий человек' },
      { type: 'common_mistake', content: 'Есімше на -ған путают с формой прошедшего времени -ды/-ді — разница в том, что есімше определяет существительное («сатып алған зат» — купленная вещь), а не сказуемое предложения.' }
    ]
  },
  {
    slug: 'kz-converb-kosemshe', language: 'kz', category: 'Глагол: время и наклонение', level: 'B1',
    title: 'Көсемше — деепричастие',
    summary: 'Добавочное действие: -ып/-іп/-п и -а/-е/-й.',
    sections: [
      { type: 'explanation', content: 'Көсемше показывает добавочное действие, происходящее одновременно или перед основным. Частые формы: -ып/-іп/-п (последовательность действий, «сделав»), -а/-е/-й (одновременность, «делая»).' },
      { type: 'example', content: 'Үйге келіп, тамақ іштім. — Придя домой, я поел.\nЖүріп келеді. — Идёт (движется пешком, одновременное действие).' },
      { type: 'common_mistake', content: 'Форма на -ып/-іп часто используется просто для соединения глаголов в цепочку («тұрып, барып, көрдім» — встал, пошёл, увидел) — это одно предложение с несколькими действиями, не отдельные фразы.' }
    ]
  },
  // --- Kazakh: Морфология: словообразование и число ---
  {
    slug: 'kz-plural-suffix', language: 'kz', category: 'Морфология: словообразование и число', level: 'A1',
    title: 'Көптік жалғау — множественное число',
    summary: 'Выбор -лар/-лер, -дар/-дер, -тар/-тер по гармонии и звонкости.',
    sections: [
      { type: 'explanation', content: 'Множественное число образуется аффиксом -лар/-лер (после сонорных и гласных), -дар/-дер (после звонких согласных), -тар/-тер (после глухих согласных). Выбор варианта зависит от гармонии гласных и последнего звука основы.' },
      { type: 'example', content: 'бала → балалар (дети)\nүй → үйлер (дома)\nкітап → кітаптар (книги)\nқыз → қыздар (девочки)' },
      { type: 'common_mistake', content: 'После числительных множественное число обычно НЕ используется: «бес кітап» (пять книг), а не «бес кітаптар».' }
    ]
  },
  {
    slug: 'kz-possessive-extended', language: 'kz', category: 'Морфология: словообразование и число', level: 'B1',
    title: 'Тәуелдік жалғау расширенно: 1-3 лицо',
    summary: 'Полный набор притяжательных аффиксов и вставная -с- после гласной.',
    sections: [
      { type: 'explanation', content: 'Притяжательные аффиксы показывают принадлежность и присоединяются напрямую к существительному, без отдельного слова вроде «мой». Полный набор: 1 л. ед. -(ы)м, 2 л. ед. -(ы)ң, 2 л. вежл. -(ы)ңыз, 3 л. -(с)ы/-(с)і, 1 л. мн. -(ы)мыз.' },
      { type: 'example', content: 'кітабым — моя книга\nкітабың — твоя книга\nкітабы — его/её книга\nкітабымыз — наша книга' },
      { type: 'common_mistake', content: '3-е лицо (-сы/-сі после гласной, -ы/-і после согласной) путают между собой — после гласной основы обязательна вставная -с- (ата → атасы, а не "атайы").' }
    ]
  },
  // --- Kazakh: Служебные слова ---
  {
    slug: 'kz-conjunctions', language: 'kz', category: 'Служебные слова', level: 'A2',
    title: 'Жалғаулықтар — союзы',
    summary: 'бірақ, немесе, сондықтан, себебі, және.',
    sections: [
      { type: 'explanation', content: 'Основные сочинительные и подчинительные союзы: бірақ (но), немесе (или), сондықтан (поэтому), себебі/өйткені (потому что), және (и). Они ставятся между частями предложения так же, как в русском.' },
      { type: 'example', content: 'Мен келгім келді, бірақ уақытым болмады. — Я хотел прийти, но не было времени.\nШаршадым, сондықтан үйде қалдым. — Устал, поэтому остался дома.' },
      { type: 'common_mistake', content: 'себебі и өйткені взаимозаменяемы по смыслу, но себебі чаще ставится в начале объясняющей части, а өйткені — после утверждения; оба варианта корректны.' }
    ]
  },
  {
    slug: 'kz-emphatic-particles', language: 'kz', category: 'Служебные слова', level: 'B1',
    title: 'Күшейткіш демеуліктер: ғой, ма, тек',
    summary: 'Модальные частицы, добавляющие оттенки смысла.',
    sections: [
      { type: 'explanation', content: 'Частицы добавляют оттенки смысла без изменения основного значения предложения. «ғой» — смягчение/напоминание («же», «ведь»), «ма/ме/ба/бе/па/пе» — вопрос, «тек» — ограничение («только»).' },
      { type: 'example', content: 'Мен айттым ғой. — Я же говорил.\nТек сен келдің. — Пришёл только ты.' },
      { type: 'common_mistake', content: '«ғой» не переводится буквально одним словом — это модальная частица, её смысл передаётся интонацией/добавочными словами в русском переводе.' }
    ]
  },
  // --- Kazakh: Сравнение ---
  {
    slug: 'kz-comparative', language: 'kz', category: 'Сравнение', level: 'A2',
    title: 'Салыстырмалы шырай — сравнительная степень',
    summary: 'Аффикс -рақ/-рек и послелог -ден/-дан для сравнения.',
    sections: [
      { type: 'explanation', content: 'Сравнительная степень прилагательного образуется аффиксом -рақ/-рек (после согласного), -ырақ/-ірек (для облегчения произношения). Для сравнения используется послелог «-ден/-дан» (чем).' },
      { type: 'example', content: 'үлкен → үлкенірек (побольше)\nЖылдамырақ жүр. — Иди быстрее.\nБұл үйден үлкенірек. — Больше, чем этот дом.' },
      { type: 'common_mistake', content: '-рақ/-рек — это не превосходная степень («самый»), а именно сравнительная («более»). Для превосходной степени используется отдельное слово «ең» перед прилагательным (ең үлкен — самый большой).' }
    ]
  },

  // --- English: Tenses ---
  {
    slug: 'en-past-perfect', language: 'en', category: 'Tenses', level: 'B2',
    title: 'Past Perfect: когда и почему',
    summary: 'Показывает, что одно прошедшее событие случилось раньше другого.',
    sections: [
      { type: 'explanation', content: 'Past Perfect (had + past participle) показывает действие, завершившееся ДО другого момента в прошлом. Он нужен, когда важно показать порядок двух прошедших событий, а не просто перечислить их.' },
      { type: 'example', content: 'When I arrived, the meeting had already started. — Когда я пришёл, встреча уже началась (началась раньше моего прихода).\nShe had finished the report before her manager asked for it.' },
      { type: 'common_mistake', content: "Самая частая ошибка — использовать простой Past Simple для обоих событий, теряя разницу в порядке: 'When I arrived, the meeting started' звучит так, будто встреча началась в момент прихода, а не раньше." }
    ]
  },
  {
    slug: 'en-future-forms', language: 'en', category: 'Tenses', level: 'B1',
    title: 'Future forms: will vs going to vs present continuous',
    summary: 'Предсказание, заранее принятое решение или уже договорённый план.',
    sections: [
      { type: 'explanation', content: 'Will — решение в момент речи или предсказание без доказательств. Going to — заранее принятое решение или предсказание на основе текущих признаков. Present Continuous — уже запланированное, договорённое событие (обычно с конкретным временем).' },
      { type: 'example', content: "I think it will rain. — Я думаю, пойдёт дождь (предсказание).\nLook at those clouds, it's going to rain. — Вот-вот пойдёт дождь (видно по признакам).\nI'm meeting him at 5pm. — Я встречаюсь с ним в 5 (уже договорено)." },
      { type: 'common_mistake', content: "Will не используется для уже принятых планов с конкретным временем — 'I will meet him at 5pm tomorrow' звучит так, будто решение принимается прямо сейчас, а не заранее." }
    ]
  },
  {
    slug: 'en-perfect-continuous', language: 'en', category: 'Tenses', level: 'C1',
    title: 'Perfect Continuous tenses',
    summary: 'Акцент на длительности процесса, а не на результате.',
    sections: [
      { type: 'explanation', content: 'Present/Past Perfect Continuous (have/had + been + -ing) подчёркивает длительность действия, ведущего к результату, а не сам результат. Present Perfect Continuous — действие началось в прошлом и либо продолжается, либо только что закончилось, с видимым эффектом сейчас.' },
      { type: 'example', content: "I've been working on this report all day. — Я весь день работаю над отчётом (акцент на процессе).\nShe was tired because she had been running. — Она устала, потому что бежала (перед этим, процесс)." },
      { type: 'common_mistake', content: "Perfect Continuous не используется со стативными глаголами (know, believe, own) — там просто Perfect: 'I have known him for years', не 'have been knowing'." }
    ]
  },
  // --- English: Articles ---
  {
    slug: 'en-articles-basics', language: 'en', category: 'Articles', level: 'B1',
    title: 'Articles: a/an/the/zero article — базовые правила',
    summary: 'Впервые упомянутое vs уже известное vs неисчисляемое/общее.',
    sections: [
      { type: 'explanation', content: "'A/an' — впервые упоминаемый, неопределённый, один из многих. 'The' — конкретный, уже известный из контекста или единственный в своём роде. Нулевой артикль — с неисчисляемыми и множественным числом в общем смысле, а также с большинством имён собственных." },
      { type: 'example', content: "I bought a book. The book was expensive. — Купил книгу (любую). Эта книга была дорогой (уже конкретная, упомянутая).\nI like music. (не 'the music' — музыка вообще)" },
      { type: 'common_mistake', content: "Частая ошибка — добавлять 'the' перед неисчисляемыми/множественными в общем смысле: 'I like the music' вместо 'I like music', если речь не о конкретной музыке." }
    ]
  },
  {
    slug: 'en-articles-common-mistakes', language: 'en', category: 'Articles', level: 'B2',
    title: 'Articles: типичные ошибки',
    summary: 'Должности, места работы и неисчисляемые слова вроде "free time".',
    sections: [
      { type: 'explanation', content: "Артикль часто пропускается или добавляется лишний перед устойчивыми выражениями и должностями/местами работы. Правило: с исчисляемым существительным в единственном числе артикль обязателен почти всегда, даже если по-русски он 'не нужен по смыслу'." },
      { type: 'example', content: "I work at a marketing agency. (не 'in marketing agency' — нужен артикль и правильный предлог)\nI have free time today. (не 'a free time' — 'free time' неисчисляемое)\nShe's an engineer. (профессия — 'a/an' обязателен)" },
      { type: 'common_mistake', content: "'Free time', 'information', 'advice' — неисчисляемые, артикль 'a' с ними невозможен в принципе, даже с прилагательным перед ними." }
    ]
  },
  // --- English: Prepositions ---
  {
    slug: 'en-prepositions-place-time', language: 'en', category: 'Prepositions', level: 'B1',
    title: 'Prepositions of place and time: in/on/at',
    summary: 'Точка vs пространство vs поверхность; точное время vs дни vs периоды.',
    sections: [
      { type: 'explanation', content: "Для места: 'at' — точка (at the office), 'in' — внутри пространства (in the room, in a city), 'on' — поверхность (on the table, on the street). Для времени: 'at' — точное время (at 5pm), 'on' — дни (on Monday), 'in' — более длинные периоды (in March, in 2024)." },
      { type: 'example', content: "I'll see you at the office at 9am on Monday in March.\nShe lives in Almaty, on Abay street." },
      { type: 'common_mistake', content: "'At a company' vs 'in an industry' — при описании работы 'at' используется с конкретной компанией, 'in' — с отраслью/сферой: 'I work at a marketing agency, in the advertising industry.'" }
    ]
  },
  {
    slug: 'en-prepositions-work', language: 'en', category: 'Prepositions', level: 'B2',
    title: 'Prepositions с работой: at/for/in a company',
    summary: 'Где физически работаешь, на кого работаешь, в какой сфере.',
    sections: [
      { type: 'explanation', content: "'At a company' — где физически работаешь (место). 'For a company' — на кого работаешь (работодатель). 'In an industry/department' — сфера или отдел." },
      { type: 'example', content: "I work at a marketing agency. I work for a great company. I work in advertising.\nShe works in the marketing department." },
      { type: 'common_mistake', content: "'I work in a marketing agency' звучит естественно тоже, но 'at' — более типичный выбор носителя для конкретной небольшой организации; путаница чаще идёт от прямого перевода 'в компании' → 'in'." }
    ]
  },
  {
    slug: 'en-dependent-prepositions', language: 'en', category: 'Prepositions', level: 'B2',
    title: 'Dependent prepositions: interested in, good at, afraid of',
    summary: 'Фиксированные предлоги при прилагательных и глаголах — надо просто запомнить.',
    sections: [
      { type: 'explanation', content: 'Многие прилагательные и глаголы требуют конкретного, фиксированного предлога, который нужно просто запомнить — логики перевода тут часто нет. Список нужно учить как единое устойчивое сочетание.' },
      { type: 'example', content: 'interested in, good at, afraid of, responsible for, similar to, married to, depend on, believe in, apologize for.' },
      { type: 'common_mistake', content: "Прямой перевод с русского часто подсказывает неверный предлог: 'good in' (по аналогии с 'хорош в чём-то') вместо правильного 'good at'." }
    ]
  },
  // --- English: Agreement & word order ---
  {
    slug: 'en-subject-verb-agreement', language: 'en', category: 'Agreement & word order', level: 'B1',
    title: 'Subject-verb agreement: has/have, this/these',
    summary: 'Глагол и указательное местоимение должны согласовываться по числу.',
    sections: [
      { type: 'explanation', content: 'Глагол должен согласовываться с подлежащим по числу и лицу: he/she/it + has, I/you/we/they + have. Указательные местоимения тоже согласуются по числу: this/that — единственное, these/those — множественное.' },
      { type: 'example', content: 'She has two cats. They have one dog.\nThis book is interesting. These books are interesting.' },
      { type: 'common_mistake', content: "В быстрой речи 3-е лицо ед. числа часто теряет -s/has: 'He have' вместо 'He has' — частая ошибка при переносе логики с языков без обязательного согласования." }
    ]
  },
  {
    slug: 'en-adverb-word-order', language: 'en', category: 'Agreement & word order', level: 'B2',
    title: 'Word order with adverbs: already, still, yet, just',
    summary: 'Куда ставить already/still/just (перед глаголом) и yet (в конец).',
    sections: [
      { type: 'explanation', content: "'Already' обычно стоит перед смысловым глаголом, но после вспомогательного/be: 'I have already finished' / 'She is already here'. 'Still' — та же позиция. 'Yet' — в конце предложения, обычно в вопросах и отрицаниях. 'Just' — перед смысловым глаголом, как already." },
      { type: 'example', content: "I've already eaten. Have you finished yet? I'm still waiting. She just left." },
      { type: 'common_mistake', content: "'Already' в конце предложения ('I finished already') — разговорный американский вариант, встречается, но в письменной/нейтральной речи стандартная позиция — перед глаголом или после вспомогательного." }
    ]
  },
  // --- English: Modals ---
  {
    slug: 'en-modals-obligation', language: 'en', category: 'Modals', level: 'B1',
    title: 'Modals of obligation: must, have to, should, need to',
    summary: 'Личное чувство долга vs внешнее правило vs совет vs практическая нужда.',
    sections: [
      { type: 'explanation', content: "'Must' — сильное обязательство, часто личное мнение говорящего или правило. 'Have to' — внешнее обязательство (правило, обстоятельства). 'Should' — совет, рекомендация, не строгое обязательство. 'Need to' — практическая необходимость." },
      { type: 'example', content: 'I must call her back, I promised. (личное чувство долга)\nI have to submit the report by Friday. (внешнее правило)\nYou should rest more. (совет)' },
      { type: 'common_mistake', content: "Отрицание меняет смысл кардинально: 'must not' — запрет (нельзя), а 'don't have to' — просто отсутствие необходимости (можно, но не обязательно). Их часто путают." }
    ]
  },
  // --- English: Conditionals ---
  {
    slug: 'en-mixed-conditionals', language: 'en', category: 'Conditionals', level: 'C1',
    title: 'Mixed conditionals and wish / if only',
    summary: 'Условие и результат из разных времён; желание про настоящее vs сожаление о прошлом.',
    sections: [
      { type: 'explanation', content: "Смешанные условные предложения комбинируют разные времена, когда условие и результат относятся к разным периодам (например, прошлое условие → настоящий результат). 'Wish' + past simple — желание изменить настоящее; 'wish' + past perfect — сожаление о прошлом." },
      { type: 'example', content: 'If I had studied medicine, I would be a doctor now. (прошлое условие → настоящий результат)\nI wish I spoke Kazakh fluently. (желание про настоящее)\nI wish I had started earlier. (сожаление о прошлом)' },
      { type: 'common_mistake', content: "После 'wish' не используется 'would' для описания собственного текущего состояния: 'I wish I would speak Kazakh' неверно — 'would' после wish используется только для выражения раздражения чужим поведением ('I wish you would stop doing that')." }
    ]
  }
];

function seed() {
  const updateCategory = db.prepare('UPDATE theory_topics SET category = ? WHERE slug = ?');
  let categorized = 0;
  const backfill = db.transaction((entries) => {
    for (const [slug, category] of entries) {
      categorized += updateCategory.run(category, slug).changes;
    }
  });
  backfill(Object.entries(EXISTING_CATEGORIES));

  const existsStmt = db.prepare('SELECT id FROM theory_topics WHERE slug = ?');
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM theory_topics WHERE language = ?');
  const insertTopic = db.prepare(
    `INSERT INTO theory_topics (language, slug, title, level, category, order_index, summary)
     VALUES (@language, @slug, @title, @level, @category, @order_index, @summary)`
  );
  const insertSection = db.prepare(
    `INSERT INTO theory_sections (topic_id, section_type, content, order_index) VALUES (?, ?, ?, ?)`
  );

  let inserted = 0;
  const skipped = [];
  const insertAll = db.transaction((topics) => {
    const nextOrder = { kz: maxOrder.get('kz').m, en: maxOrder.get('en').m };
    for (const topic of topics) {
      if (existsStmt.get(topic.slug)) {
        skipped.push(topic.slug);
        continue;
      }
      nextOrder[topic.language] += 1;
      const info = insertTopic.run({
        language: topic.language,
        slug: topic.slug,
        title: topic.title,
        level: topic.level,
        category: topic.category,
        order_index: nextOrder[topic.language],
        summary: topic.summary
      });
      topic.sections.forEach((section, i) => {
        insertSection.run(info.lastInsertRowid, section.type, section.content, i);
      });
      inserted += 1;
    }
  });

  insertAll(NEW_TOPICS);

  console.log(`Categorized ${categorized} existing topics.`);
  console.log(`Inserted ${inserted} new topics (${NEW_TOPICS.length} candidates, ${skipped.length} already existed).`);
  if (skipped.length > 0) console.log('Skipped (already in DB):', skipped);

  const byCategory = db
    .prepare(
      `SELECT language, category, GROUP_CONCAT(DISTINCT level) AS levels, COUNT(*) AS topics
       FROM theory_topics GROUP BY language, category ORDER BY language, category`
    )
    .all();
  console.table(byCategory);
}

seed();
