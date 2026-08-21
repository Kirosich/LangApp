import { db } from './db/index.js';

// Grammar drills per theory-reference topic slug (Stage 8, wave 2).
// Every Kazakh drill's correct_answer is built from a word/sentence the
// topic's own content already states as correct (бала/үй/кітап and the
// example sentences) -- distractors are the *other real variants of the
// same suffix family* (wrong vowel-harmony or voicing choice), matching
// the plan's explicit "-ке instead of -ге" standard: a plausible mistake,
// not random noise. English drills reuse the topic's own example/
// common_mistake sentences the same way.
const DRILLS = {
  'kz-case-atau': [
    { prompt: 'Выбери атау септік (именительный, без суффикса) слова «бала» (ребёнок).', correct_answer: 'бала', distractors: ['баланың', 'балаға', 'баладан'], explanation: '«бала» без суффикса — атау септік. «баланың» — ілік, «балаға» — барыс, «баладан» — шығыс.' },
    { prompt: 'Выбери атау септік слова «кітап» (книга).', correct_answer: 'кітап', distractors: ['кітапты', 'кітапта', 'кітаппен'], explanation: '«кітап» — атау септік. «кітапты» — табыс, «кітапта» — жатыс, «кітаппен» — көмектес.' },
    { prompt: 'Выбери атау септік слова «үй» (дом).', correct_answer: 'үй', distractors: ['үйдің', 'үйге', 'үйден'], explanation: '«үй» — атау септік (база, без суффикса). Остальные — уже с падежными окончаниями.' },
    { prompt: 'Выбери атау септік слова «адам» (человек).', correct_answer: 'адам', distractors: ['адамның', 'адамды', 'адаммен'], explanation: 'Без суффикса — атау септік. Остальные формы уже с падежными окончаниями (ілік, табыс, көмектес).' },
    { prompt: 'Выбери атау септік слова «мектеп» (школа).', correct_answer: 'мектеп', distractors: ['мектепке', 'мектепте', 'мектептен'], explanation: '«мектеп» — атау септік. «мектепке» — барыс, «мектепте» — жатыс, «мектептен» — шығыс.' }
  ],
  'kz-case-ilik': [
    { prompt: '«___ кітабы» — книга ребёнка. Вставь ілік септік слова «бала».', correct_answer: 'баланың', distractors: ['баланің', 'баладың', 'балатың'], explanation: 'бала — гласный на конце, задние гласные → -ның. -нің — не та гармония, -дың/-тың — не тот случай (стем не оканчивается на согласный).' },
    { prompt: '«___ есігі» — дверь дома. Вставь ілік септік слова «үй».', correct_answer: 'үйдің', distractors: ['үйнің', 'үйдың', 'үйтің'], explanation: 'үй заканчивается на й, передние гласные → -дің. -нің — не тот случай, -дың — не та гармония, -тің — не та звонкость.' },
    { prompt: '«___ беті» — страница книги. Вставь ілік септік слова «кітап».', correct_answer: 'кітаптың', distractors: ['кітаптің', 'кітапның', 'кітапдың'], explanation: 'кітап оканчивается на глухой п, задние гласные → -тың. -тің — не та гармония, -ның/-дың — не та звонкость.' },
    { prompt: 'Ілік септік слова «бала» (чей? — родительный падеж).', correct_answer: 'баланың', distractors: ['баланің', 'баладың', 'балатың'], explanation: 'Гармония + звонкость последнего звука определяют один из 6 вариантов -ның/-нің/-дың/-дің/-тың/-тің.' },
    { prompt: 'Ілік септік слова «кітап» (чей? — родительный падеж).', correct_answer: 'кітаптың', distractors: ['кітаптің', 'кітапның', 'кітапдің'], explanation: 'кітап — глухой согласный + задние гласные → -тың, не -тің/-ның/-дің.' }
  ],
  'kz-case-barys': [
    { prompt: 'Мен ___ кітап бердім. (я дал ребёнку книгу — «бала» в барыс септік)', correct_answer: 'балаға', distractors: ['балаге', 'балақа', 'балаке'], explanation: 'бала — гласный на конце, задние гласные → -ға. -ге — не та гармония, -қа/-ке — не та звонкость (нужны после глухих).' },
    { prompt: '___ барамын. (иду домой — «үй» в барыс септік)', correct_answer: 'үйге', distractors: ['үйға', 'үйқа', 'үйке'], explanation: 'үй — передние гласные, звонкий/сонорный конец → -ге. -ға — не та гармония, -қа/-ке — не та звонкость.' },
    { prompt: '___ қара. (посмотри на книгу — «кітап» в барыс септік)', correct_answer: 'кітапқа', distractors: ['кітапға', 'кітапге', 'кітапке'], explanation: 'кітап — глухой п, задние гласные → -қа. -ға/-ге — не та звонкость, -ке — не та гармония.' },
    { prompt: 'Барыс септік (куда?/кому?) слова «бала».', correct_answer: 'балаға', distractors: ['балаге', 'балақа', 'балаке'], explanation: 'Гласный конец + задние гласные → -ға (не -ге/-қа/-ке).' },
    { prompt: 'Барыс септік слова «үй».', correct_answer: 'үйге', distractors: ['үйға', 'үйқа', 'үйке'], explanation: 'Передние гласные + звонкий конец → -ге (не -ға/-қа/-ке).' }
  ],
  'kz-case-tabys': [
    { prompt: '___ көрдім. (увидел ребёнка — «бала» в табыс септік)', correct_answer: 'баланы', distractors: ['балані', 'балады', 'балаты'], explanation: 'Гласный конец + задние гласные → -ны. -ні — не та гармония, -ды/-ты — не тот случай.' },
    { prompt: '___ сатты. (продал дом — «үй» в табыс септік)', correct_answer: 'үйді', distractors: ['үйны', 'үйты', 'үйні'], explanation: 'й — сонорный конец, передние гласные → -ді. -ны — не та гармония, -ты — не та звонкость.' },
    { prompt: '___ оқимын. (читаю книгу — «кітап» в табыс септік)', correct_answer: 'кітапты', distractors: ['кітапті', 'кітапны', 'кітапды'], explanation: 'Глухой п + задние гласные → -ты. -ті — не та гармония, -ны/-ды — не та звонкость.' },
    { prompt: 'Табыс септік (кого/что? — конкретный объект) слова «бала».', correct_answer: 'баланы', distractors: ['балані', 'балады', 'балаты'], explanation: 'Гласный конец, задние гласные → -ны, не -ні/-ды/-ты.' },
    { prompt: 'Табыс септік слова «кітап».', correct_answer: 'кітапты', distractors: ['кітапті', 'кітапны', 'кітапды'], explanation: 'Глухой конец, задние гласные → -ты, не -ті/-ны/-ды.' }
  ],
  'kz-case-jatys': [
    { prompt: 'Мен ___ отырмын. (я сижу дома — «үй» в жатыс септік)', correct_answer: 'үйде', distractors: ['үйда', 'үйте', 'үйта'], explanation: 'й — звонкий/сонорный, передние гласные → -де. -да — не та гармония, -та/-те — не та звонкость.' },
    { prompt: 'Бұл сөз ___ жоқ. (этого слова нет в книге — «кітап» в жатыс септік)', correct_answer: 'кітапта', distractors: ['кітапда', 'кітапде', 'кітапте'], explanation: 'Глухой п, задние гласные → -та. -да/-де — не та звонкость, -те — не та гармония.' },
    { prompt: 'Жатыс септік (где?) слова «бала».', correct_answer: 'балада', distractors: ['баладе', 'балата', 'балате'], explanation: 'Гласный конец, задние гласные, звонкий → -да, не -де/-та/-те.' },
    { prompt: 'Жатыс септік слова «үй».', correct_answer: 'үйде', distractors: ['үйда', 'үйте', 'үйта'], explanation: 'Передние гласные, звонкий конец → -де, не -да/-та/-те.' },
    { prompt: 'Жатыс септік слова «кітап».', correct_answer: 'кітапта', distractors: ['кітапте', 'кітапда', 'кітапде'], explanation: 'Задние гласные, глухой конец → -та, не -те/-да/-де.' }
  ],
  'kz-case-shygys': [
    { prompt: '___ сұрадым. (спросил у ребёнка — «бала» в шығыс септік)', correct_answer: 'баладан', distractors: ['баладен', 'балатан', 'баланан'], explanation: 'Гласный конец, задние гласные → -дан. -ден — не та гармония, -тан — не та звонкость, -нан — только после сонорных м/н/ң.' },
    { prompt: '___ шықтым. (вышел из дома — «үй» в шығыс септік)', correct_answer: 'үйден', distractors: ['үйдан', 'үйтен', 'үйнен'], explanation: 'Передние гласные, й не входит в м/н/ң → обычный звонкий вариант -ден, не -дан/-тен/-нен.' },
    { prompt: '___ үзінді оқыдым. (прочитал отрывок из книги — «кітап» в шығыс септік)', correct_answer: 'кітаптан', distractors: ['кітаптен', 'кітапдан', 'кітапнан'], explanation: 'Глухой п, задние гласные → -тан. -тен — не та гармония, -дан/-нан — не та звонкость.' },
    { prompt: 'Шығыс септік (откуда?) слова «бала».', correct_answer: 'баладан', distractors: ['баладен', 'балатан', 'баланан'], explanation: 'Гласный конец, задние гласные, звонкий → -дан.' },
    { prompt: 'Шығыс септік слова «кітап».', correct_answer: 'кітаптан', distractors: ['кітаптен', 'кітапдан', 'кітапнан'], explanation: 'Глухой конец, задние гласные → -тан. -нан было бы для сонорных м/н/ң — здесь конец п.' }
  ],
  'kz-case-komektes': [
    { prompt: '___ сөйлестім. (поговорил с ребёнком — «бала» в көмектес септік)', correct_answer: 'баламен', distractors: ['балабен', 'балапен'], explanation: 'Гласный конец → -мен (звонкий/гласный вариант), не -бен/-пен.' },
    { prompt: '___ жұмыс істеймін. (работаю с книгой — «кітап» в көмектес септік)', correct_answer: 'кітаппен', distractors: ['кітапмен', 'кітапбен'], explanation: 'Глухой п → -пен, не -мен/-бен.' },
    { prompt: 'Көмектес септік (с кем/чем?) слова «үй».', correct_answer: 'үймен', distractors: ['үйбен', 'үйпен'], explanation: 'Звонкий/сонорный конец → -мен, не -бен/-пен.' },
    { prompt: 'Көмектес септік слова «бала».', correct_answer: 'баламен', distractors: ['балапен', 'балабен'], explanation: 'Гласный конец → -мен. Гармония гласных здесь не меняется, только звонкость начального согласного.' },
    { prompt: 'Көмектес септік слова «кітап».', correct_answer: 'кітаппен', distractors: ['кітапмен', 'кітапбен'], explanation: 'Глухой конец → -пен. Единственный падеж, где гласный суффикса всегда «е».' }
  ],
  'kz-affixes-personal-possessive': [
    { prompt: 'Мен студент___. (я студент — сообщаю, кто я, личный аффикс)', correct_answer: '-пін', distractors: ['-ім', '-сің', '-мыз'], explanation: '«студентпін» — личный аффикс 1 лица. -ім — притяжательный (чужая категория), -сің/-мыз — не то лицо.' },
    { prompt: 'Менің кітаб___. (моя книга — притяжательный аффикс)', correct_answer: '-ым', distractors: ['-мын', '-сің', '-ің'], explanation: '«кітабым» — притяжательный. -мын — личный аффикс (чужая категория, та самая частая ошибка), -сің/-ің — не то лицо.' },
    { prompt: 'Сен мұғалім___. (ты учитель — личный аффикс)', correct_answer: '-сің', distractors: ['-ің', '-пін', '-мыз'], explanation: '«мұғалімсің» — личный. -ің — притяжательный (чужая категория), -пін/-мыз — не то лицо.' },
    { prompt: 'Сенің үй___. (твой дом — притяжательный аффикс)', correct_answer: '-ің', distractors: ['-сің', '-ым', '-міз'], explanation: '«үйің» — притяжательный. -сің — личный (чужая категория), -ым/-міз — не то лицо.' },
    { prompt: '«Кітапмын» — известная ошибка новичков. Как правильно сказать «моя книга»?', correct_answer: 'менің кітабым', distractors: ['кітапмын', 'мен кітаппын', 'кітап менің'], explanation: 'Личный аффикс -мын нельзя вешать прямо на предмет владения — нужен притяжательный аффикс на слове-предмете: «менің кітабым».' }
  ],
  'kz-verb-tenses': [
    { prompt: 'Мен қазір мектепке бар___. (сейчас, настоящее время)', correct_answer: '-амын', distractors: ['-дым', '-армын', '-ды'], explanation: 'Осы шақ: основа + -а + личный аффикс → барамын.' },
    { prompt: 'Мен кеше мектепке бар___. (вчера, точно сам ходил)', correct_answer: '-дым', distractors: ['-амын', '-армын', '-ды'], explanation: 'Жедел өткен шақ: основа + -ды + личный аффикс → бардым.' },
    { prompt: 'Мен ертең, мүмкін, бар___. (завтра, предположительно)', correct_answer: '-армын', distractors: ['-амын', '-дым', '-ар'], explanation: 'Болжалды келер шақ: основа + -ар + личный аффикс → барармын, оттенок неуверенности.' },
    { prompt: '«Ертең барамын» (форма настоящего -амын) для завтрашнего дня — это ошибка?', correct_answer: 'Нет, -амын нормально используется и для ближайшего/уверенного будущего', distractors: ['Да, нужно обязательно -армын', 'Да, это разговорная ошибка', 'Нет, но так говорят только дети'], explanation: '-ар/-ер — это скорее оттенок предположения/неуверенности, а не единственная форма будущего времени.' },
    { prompt: 'Мен әрдайым мектепке бар___. (хожу всегда — привычное действие, настоящее)', correct_answer: '-амын', distractors: ['-дым', '-армын', '-ды'], explanation: 'Привычное/регулярное действие тоже осы шақ: барамын.' }
  ],
  'kz-negation': [
    { prompt: 'Мен бар___ймын. (я не иду — глагольное отрицание)', correct_answer: 'ма', distractors: ['ме', 'ба', 'па'], explanation: 'бар (задние гласные, звонкий) → -ма-. -ме — не та гармония, -ба/-па — не та звонкость.' },
    { prompt: 'Ол кел___ді. (он не пришёл — «кел» = приходить)', correct_answer: 'ме', distractors: ['ма', 'бе', 'пе'], explanation: 'кел (передние гласные) → -ме-, не -ма-/-бе-/-пе-.' },
    { prompt: 'Ол мұғалім ___. (он не учитель — именное отрицание)', correct_answer: 'емес', distractors: ['жоқ', 'ма', 'ме'], explanation: 'Именное сказуемое отрицается словом «емес», а не глагольным суффиксом -ма-/-ме-.' },
    { prompt: 'Үйде ешкім ___. (дома никого нет)', correct_answer: 'жоқ', distractors: ['емес', 'бар', 'жоқ па'], explanation: '«жоқ» — отсутствие. «бар» — прямой антоним (есть), «емес» — не тот тип отрицания (для именного сказуемого).' },
    { prompt: 'Отрицательный суффикс глагола -ма-/-ме- ставится:', correct_answer: 'перед суффиксом времени', distractors: ['после суффикса времени', 'в самом начале слова', 'только с сіз/сен'], explanation: 'бар-ма-й-мын: -ма- между основой и суффиксом времени, а не после него.' }
  ],
  'kz-question-particles': [
    { prompt: 'Сен студентсің ___? (вопрос да/нет)', correct_answer: 'бе', distractors: ['ма', 'па', 'ме'], explanation: 'студентсің заканчивается на звонкий/сонорный с передними гласными → бе.' },
    { prompt: 'Ол келді ___? (вопрос да/нет)', correct_answer: 'ме', distractors: ['ма', 'ба', 'пе'], explanation: 'келді — передние гласные, звонкий → ме, не ма/ба/пе.' },
    { prompt: 'Бұл кітап ___? (вопрос да/нет)', correct_answer: 'па', distractors: ['ба', 'ма', 'пе'], explanation: 'кітап — глухой п, задние гласные → па, не ба/ма/пе.' },
    { prompt: '«келдіме» слитно — это...', correct_answer: 'ошибка, частица пишется отдельно: келді ме', distractors: ['правильно, всегда слитно', 'верно только в вопросах', 'ошибка, нужно де'], explanation: 'Вопросительная частица всегда отдельное слово, даже если звучит слитно.' },
    { prompt: 'Бұл үй ___? (это дом?)', correct_answer: 'ме', distractors: ['ба', 'па', 'ма'], explanation: 'үй — сонорный конец, передние гласные → ме.' }
  ],
  'kz-postpositions': [
    { prompt: 'Мен сен ___ бәрін жасаймын. (ради тебя)', correct_answer: 'үшін', distractors: ['туралы', 'сияқты', 'кейін'], explanation: '«үшін» — для/ради. Остальные — другие послелоги из того же списка, но с другим значением.' },
    { prompt: 'Бұл фильм соғыс ___. (о войне)', correct_answer: 'туралы', distractors: ['үшін', 'бұрын', 'арқылы'], explanation: '«туралы» — о/про.' },
    { prompt: 'Түнде жұлдыздар шам ___ жанады. (как лампы)', correct_answer: 'сияқты', distractors: ['дейін', 'кейін', 'үшін'], explanation: '«сияқты» — как, подобно.' },
    { prompt: 'Кешке ___ жұмыс істеймін. (до вечера)', correct_answer: 'дейін', distractors: ['кейін', 'бұрын', 'үшін'], explanation: '«дейін» — до/вплоть до. «кейін» — прямая противоположность (после)!' },
    { prompt: 'Сабақтан ___ демаламын. (после урока отдыхаю)', correct_answer: 'кейін', distractors: ['бұрын', 'дейін', 'арқылы'], explanation: '«кейін» — после. «бұрын» — прямая противоположность (до/раньше)!' }
  ],
  'en-present-perfect-vs-past-simple': [
    { prompt: 'I ___ the report. (result matters now, no specific time given)', correct_answer: 'have finished', distractors: ['finished', 'had finished', 'finish'], explanation: 'No time marker + result matters now → Present Perfect.' },
    { prompt: 'I ___ the report yesterday at 5pm. (specific past time given)', correct_answer: 'finished', distractors: ['have finished', 'has finished', 'finishing'], explanation: 'A specific past time marker ("yesterday at 5pm") forces Past Simple, never Present Perfect.' },
    { prompt: '___ you ever been to Kazakhstan? (life experience, no specific time)', correct_answer: 'Have', distractors: ['Did', 'Has', 'Was'], explanation: '"ever" + life experience, no specific moment → Present Perfect ("Have you ever...").' },
    { prompt: 'I ___ him yesterday. (a time marker is given — pick the correct tense)', correct_answer: 'saw', distractors: ['have seen', 'has seen', 'was seeing'], explanation: 'Classic mistake: "I have seen him yesterday" is wrong — "yesterday" forces Past Simple.' },
    { prompt: 'She ___ here since 2020. (started in the past, still true now)', correct_answer: 'has lived', distractors: ['lived', 'is living', 'had lived'], explanation: '"since 2020" + still true now → Present Perfect.' }
  ],
  'en-conditionals': [
    { prompt: 'If you heat ice, it ___. (general truth, always works)', correct_answer: 'melts', distractors: ['will melt', 'would melt', 'melted'], explanation: 'Zero conditional: If + present, present.' },
    { prompt: 'If it rains tomorrow, I ___ home. (real future possibility)', correct_answer: 'will stay', distractors: ['stay', 'would stay', 'stayed'], explanation: 'First conditional: If + present, will + base form.' },
    { prompt: 'If I ___ more free time, I would learn Kazakh faster. (hypothesis about now, probably not true)', correct_answer: 'had', distractors: ['have', 'would have', 'has'], explanation: 'Second conditional: If + past simple, would + base form.' },
    { prompt: 'If I had started earlier, I ___ finished by now. (unreal past hypothesis)', correct_answer: 'would have', distractors: ['would', 'will have', 'had'], explanation: 'Third conditional: If + past perfect, would have + past participle.' },
    { prompt: 'If I ___ known, I would have called. (never put "would" right after if)', correct_answer: 'had', distractors: ['would have', 'would', 'have'], explanation: 'Common mistake: "would" never goes directly after "if" — the if-clause takes had + past participle.' }
  ],
  'en-phrasal-verbs-work': [
    { prompt: 'I ___ a new project this month. (взял на себя доп. обязанности)', correct_answer: 'took on', distractors: ['chased up', 'sorted out', 'wrapped up'], explanation: '"take on" — взять на себя.' },
    { prompt: 'Can you ___ the client for a reply? (напомнить/поторопить)', correct_answer: 'chase up', distractors: ['take on', 'sort out', 'burn out'], explanation: '"chase up" — напомнить/поторопить кого-то.' },
    { prompt: 'Let me ___ my manager first. (обсудить вкратце, спросить мнение)', correct_answer: 'run this by', distractors: ['chase this up with', 'wrap this up with', 'sort this out with'], explanation: '"run something by someone" — спросить чьё-то мнение вкратце.' },
    { prompt: 'We ___ the billing issue. (уладили)', correct_answer: 'sorted out', distractors: ['wrapped up', 'took on', 'chased up'], explanation: '"sort out" — разобраться, уладить.' },
    { prompt: 'She ___ after months of overtime. (перегорела)', correct_answer: 'burned out', distractors: ['wrapped up', 'sorted out', 'took on'], explanation: '"burn out" — перегореть от переработки.' }
  ],
  'en-phrasal-verbs-relationships': [
    { prompt: 'We ___ right away. (сразу поладили)', correct_answer: 'hit it off', distractors: ['made up', 'grew apart', 'fell for'], explanation: '"hit it off" — сразу поладить с кем-то.' },
    { prompt: 'He ___ her instantly. (влюбился)', correct_answer: 'fell for', distractors: ['hit it off with', 'looked up to', 'made up with'], explanation: '"fall for" — влюбиться (или попасться на обман).' },
    { prompt: 'They had a fight but ___ the next day. (помирились)', correct_answer: 'made up', distractors: ['broke up', 'grew apart', 'fell for'], explanation: '"make up" — помириться.' },
    { prompt: 'They ___ last month. (расстались)', correct_answer: 'broke up', distractors: ['made up', 'hit it off', 'grew apart'], explanation: '"break up" — расстаться.' },
    { prompt: "I've always ___ my older brother. (уважал, восхищался)", correct_answer: 'looked up to', distractors: ['fallen for', 'grown apart from', 'hit it off with'], explanation: '"look up to" — уважать, восхищаться кем-то.' }
  ],
  'en-phrasal-verbs-daily-life': [
    { prompt: 'We ___ milk. (закончилось)', correct_answer: 'ran out of', distractors: ['put off', 'caught up on', 'dropped by'], explanation: '"run out of" — закончиться (о запасах).' },
    { prompt: 'I keep ___ my dentist appointment. (откладываю)', correct_answer: 'putting off', distractors: ['running out of', 'catching up on', 'looking after'], explanation: '"put off" — отложить.' },
    { prompt: 'Can you ___ my cat this weekend? (присмотреть)', correct_answer: 'look after', distractors: ['catch up on', 'drop by', 'get by'], explanation: '"look after" — присматривать за кем-то/чем-то.' },
    { prompt: 'We ___ on a tight budget. (перебиваемся)', correct_answer: 'get by', distractors: ['run out', 'catch up', 'drop by'], explanation: '"get by" — перебиваться, справляться с ограниченными средствами.' },
    { prompt: 'I need to ___ sleep. (наверстать)', correct_answer: 'catch up on', distractors: ['put off', 'get by on', 'run out of'], explanation: '"catch up on" — наверстать упущенное.' }
  ],
  'en-reported-speech': [
    { prompt: '"I am tired," she said. → She said she ___ tired.', correct_answer: 'was', distractors: ['is', 'were', 'has been'], explanation: 'Backshift: present simple → past simple.' },
    { prompt: '"I will call you tomorrow," he said. → He said he ___ call me the next day.', correct_answer: 'would', distractors: ['will', 'was going to', 'can'], explanation: 'Backshift: will → would.' },
    { prompt: '"I saw him yesterday," she said. → She said she ___ seen him the day before.', correct_answer: 'had', distractors: ['has', 'was', 'did'], explanation: 'Backshift: past simple → past perfect.' },
    { prompt: '"The Earth goes round the Sun," he said. → He said the Earth ___ round the Sun. (general truth)', correct_answer: 'goes', distractors: ['went', 'was going', 'had gone'], explanation: 'Backshift is NOT applied when the reported statement is still a general truth.' },
    { prompt: '"I am working," she said. → She said she ___ working.', correct_answer: 'was', distractors: ['is', 'has been', 'were'], explanation: 'Backshift: present continuous → past continuous.' }
  ],
  'en-confused-word-pairs': [
    { prompt: 'The weather ___ my mood. (влияет — глагол)', correct_answer: 'affects', distractors: ['effects', "affect's", 'effect'], explanation: 'affect — глагол (влиять), effect — существительное (эффект, результат).' },
    { prompt: 'The dog wagged ___ tail. (его — притяжательное, без апострофа)', correct_answer: 'its', distractors: ["it's", "its'", 'it is'], explanation: 'its — притяжательное (без апострофа). it\'s = it is/it has.' },
    { prompt: "___ raining outside. (сокращение 'it is')", correct_answer: "It's", distractors: ['Its', 'Their', 'There'], explanation: "it's = it is/it has, в отличие от притяжательного its." },
    { prompt: '___ house is there. (притяжательное — чей дом)', correct_answer: 'Their', distractors: ['There', "They're", 'Its'], explanation: 'their — притяжательное, there — место, they\'re = they are.' },
    { prompt: '___ coming to the party? (who is)', correct_answer: "Who's", distractors: ['Whose', 'Its', 'Their'], explanation: "who's = who is/who has, whose — притяжательное (чей)." }
  ],
  'en-modals-deduction-politeness': [
    { prompt: 'The lights are off — they ___ left. (уверенное предположение о прошлом)', correct_answer: 'must have', distractors: ['must', 'could', 'should'], explanation: 'Уверенное предположение о прошлом: must have + past participle.' },
    { prompt: 'She ___ forgotten. (возможно, но не точно)', correct_answer: 'could have', distractors: ['must have', "can't have", 'should have'], explanation: 'could have / might have — неточное предположение.' },
    { prompt: "He ___ said that, it's not like him. (уверенное отрицание)", correct_answer: "can't have", distractors: ['must have', 'could have', "mustn't have"], explanation: "can't have — уверенное отрицание о прошлом." },
    { prompt: 'He ___ left already. (нужен вспомогательный have)', correct_answer: 'must have', distractors: ['must', 'must has', 'musts have'], explanation: 'Частая ошибка — "must left" без have; нужно "must have left".' },
    { prompt: '___ you mind closing the window? (вежливая просьба, B2)', correct_answer: 'Would', distractors: ['Could', 'Can', 'Will'], explanation: '"Would you mind...?" — мягкая вежливая форма просьбы.' }
  ]
};

function seedDrills() {
  const getTopic = db.prepare('SELECT id FROM theory_topics WHERE slug = ?');
  const existsStmt = db.prepare('SELECT 1 FROM theory_drills WHERE topic_id = ? AND prompt = ?');
  const insert = db.prepare(
    `INSERT INTO theory_drills (topic_id, prompt, correct_answer, distractors, explanation, position)
     VALUES (@topic_id, @prompt, @correct_answer, @distractors, @explanation, @position)`
  );

  let inserted = 0;
  let skippedNoTopic = 0;

  const insertAll = db.transaction(() => {
    for (const [slug, drills] of Object.entries(DRILLS)) {
      const topic = getTopic.get(slug);
      if (!topic) {
        skippedNoTopic += drills.length;
        continue;
      }
      drills.forEach((drill, position) => {
        if (existsStmt.get(topic.id, drill.prompt)) return; // idempotent
        insert.run({
          topic_id: topic.id,
          prompt: drill.prompt,
          correct_answer: drill.correct_answer,
          distractors: JSON.stringify(drill.distractors),
          explanation: drill.explanation ?? null,
          position
        });
        inserted += 1;
      });
    }
  });

  insertAll();
  console.log(`Seeded ${inserted} theory drills.${skippedNoTopic ? ` Skipped ${skippedNoTopic} (topic not found — run seed-theory-kz/en first).` : ''}`);
}

seedDrills();
