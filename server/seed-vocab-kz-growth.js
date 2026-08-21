// Kazakh vocabulary growth: A1 gap-filling (еда, числа/время had almost
// nothing) plus continued A2 depth plus a first pass into B1 (abstract
// everyday concepts, work/study, travel, tech, society/opinions).
// Each entry is reviewed individually for level, not stamped by theme.
import { db } from './db/index.js';

const KZ_CARDS = [
  // еда (was almost empty -- only "Су" existed)
  { term: 'нан', translation_ru: 'хлеб', transcription: null, theme: 'еда', example_sentence: 'Мен нан сатып алдым.', level: 'A1' },
  { term: 'ет', translation_ru: 'мясо', transcription: null, theme: 'еда', example_sentence: 'Біз кешке ет пісіреміз.', level: 'A1' },
  { term: 'балық', translation_ru: 'рыба', transcription: null, theme: 'еда', example_sentence: 'Ол балықты жақсы көреді.', level: 'A1' },
  { term: 'сүт', translation_ru: 'молоко', transcription: null, theme: 'еда', example_sentence: 'Балаға сүт бердім.', level: 'A1' },
  { term: 'май', translation_ru: 'масло', transcription: null, theme: 'еда', example_sentence: 'Нанға май жақтым.', level: 'A1' },
  { term: 'ірімшік', translation_ru: 'сыр', transcription: null, theme: 'еда', example_sentence: 'Мен ірімшікті ұнатамын.', level: 'A1' },
  { term: 'жұмыртқа', translation_ru: 'яйцо', transcription: null, theme: 'еда', example_sentence: 'Таңғы асқа жұмыртқа пісірдім.', level: 'A1' },
  { term: 'күріш', translation_ru: 'рис', transcription: null, theme: 'еда', example_sentence: 'Анам күріш пісіріп жатыр.', level: 'A1' },
  { term: 'картоп', translation_ru: 'картофель', transcription: null, theme: 'еда', example_sentence: 'Мен картоп қуырдым.', level: 'A1' },
  { term: 'пияз', translation_ru: 'лук', transcription: null, theme: 'еда', example_sentence: 'Тағамға пияз қостым.', level: 'A1' },
  { term: 'сарымсақ', translation_ru: 'чеснок', transcription: null, theme: 'еда', example_sentence: 'Бұл тағамда сарымсақ көп.', level: 'A2' },
  { term: 'жеміс', translation_ru: 'фрукты', transcription: null, theme: 'еда', example_sentence: 'Жеміс жеу пайдалы.', level: 'A1' },
  { term: 'көкөніс', translation_ru: 'овощи', transcription: null, theme: 'еда', example_sentence: 'Дүкеннен көкөніс сатып алдық.', level: 'A1' },
  { term: 'алма', translation_ru: 'яблоко', transcription: null, theme: 'еда', example_sentence: 'Алма өте тәтті екен.', level: 'A1' },
  { term: 'банан', translation_ru: 'банан', transcription: null, theme: 'еда', example_sentence: 'Балаға банан бердім.', level: 'A1' },
  { term: 'шай', translation_ru: 'чай', transcription: null, theme: 'еда', example_sentence: 'Мен шай ішкім келеді.', level: 'A1' },
  { term: 'кофе', translation_ru: 'кофе', transcription: null, theme: 'еда', example_sentence: 'Таңертең кофе ішемін.', level: 'A1' },
  { term: 'тұз', translation_ru: 'соль', transcription: null, theme: 'еда', example_sentence: 'Тағамға тұз қос.', level: 'A1' },
  { term: 'қант', translation_ru: 'сахар', transcription: null, theme: 'еда', example_sentence: 'Шайға қант саласың ба?', level: 'A1' },
  { term: 'бал', translation_ru: 'мёд', transcription: null, theme: 'еда', example_sentence: 'Мен нанды балмен жеймін.', level: 'A1' },
  { term: 'ас', translation_ru: 'еда, блюдо', transcription: null, theme: 'еда', example_sentence: 'Ас дайын болды.', level: 'A1' },
  { term: 'тағам', translation_ru: 'блюдо, пища', transcription: null, theme: 'еда', example_sentence: 'Бұл тағам өте дәмді.', level: 'A1' },
  { term: 'таңғы ас', translation_ru: 'завтрак', transcription: null, theme: 'еда', example_sentence: 'Таңғы асты бірге ішейік.', level: 'A1' },
  { term: 'түскі ас', translation_ru: 'обед', transcription: null, theme: 'еда', example_sentence: 'Түскі асқа не жейміз?', level: 'A1' },
  { term: 'кешкі ас', translation_ru: 'ужин', transcription: null, theme: 'еда', example_sentence: 'Кешкі ас сағат жетіде.', level: 'A1' },
  { term: 'тәтті', translation_ru: 'сладкий, десерт', transcription: null, theme: 'еда', example_sentence: 'Мен тәтті нәрсе жегім келеді.', level: 'A1' },
  { term: 'дәмді', translation_ru: 'вкусный', transcription: null, theme: 'еда', example_sentence: 'Анамның тамағы өте дәмді.', level: 'A1' },
  { term: 'ащы', translation_ru: 'острый, горький', transcription: null, theme: 'еда', example_sentence: 'Бұл тағам тым ащы.', level: 'A2' },
  { term: 'пісіру', translation_ru: 'готовить (еду)', transcription: null, theme: 'еда', example_sentence: 'Анам ас пісіріп жатыр.', level: 'A1' },
  { term: 'тамақтану', translation_ru: 'питаться, есть', transcription: null, theme: 'еда', example_sentence: 'Дұрыс тамақтану денсаулыққа пайдалы.', level: 'A2' },

  // числа/время (was almost empty -- only "Бір" existed)
  { term: 'екі', translation_ru: 'два', transcription: null, theme: 'числа/время', example_sentence: 'Менде екі бала бар.', level: 'A1' },
  { term: 'үш', translation_ru: 'три', transcription: null, theme: 'числа/время', example_sentence: 'Столда үш кітап жатыр.', level: 'A1' },
  { term: 'төрт', translation_ru: 'четыре', transcription: null, theme: 'числа/время', example_sentence: 'Бөлмеде төрт орындық бар.', level: 'A1' },
  { term: 'бес', translation_ru: 'пять', transcription: null, theme: 'числа/время', example_sentence: 'Сағат бесте кездесеміз.', level: 'A1' },
  { term: 'алты', translation_ru: 'шесть', transcription: null, theme: 'числа/время', example_sentence: 'Оның алты жасы бар.', level: 'A1' },
  { term: 'жеті', translation_ru: 'семь', transcription: null, theme: 'числа/время', example_sentence: 'Аптада жеті күн бар.', level: 'A1' },
  { term: 'сегіз', translation_ru: 'восемь', transcription: null, theme: 'числа/время', example_sentence: 'Мен сегізде тұрамын.', level: 'A1' },
  { term: 'тоғыз', translation_ru: 'девять', transcription: null, theme: 'числа/время', example_sentence: 'Сабақ тоғызда басталады.', level: 'A1' },
  { term: 'он', translation_ru: 'десять', transcription: null, theme: 'числа/время', example_sentence: 'Оның он жасы бар.', level: 'A1' },
  { term: 'жиырма', translation_ru: 'двадцать', transcription: null, theme: 'числа/время', example_sentence: 'Маған жиырма минут керек.', level: 'A1' },
  { term: 'отыз', translation_ru: 'тридцать', transcription: null, theme: 'числа/время', example_sentence: 'Оның отыз жасы бар.', level: 'A1' },
  { term: 'қырық', translation_ru: 'сорок', transcription: null, theme: 'числа/время', example_sentence: 'Бұл жол қырық шақырым.', level: 'A1' },
  { term: 'елу', translation_ru: 'пятьдесят', transcription: null, theme: 'числа/время', example_sentence: 'Бөлмеде елу орын бар.', level: 'A1' },
  { term: 'жүз', translation_ru: 'сто', transcription: null, theme: 'числа/время', example_sentence: 'Бұл кітапта жүз бет бар.', level: 'A1' },
  { term: 'мың', translation_ru: 'тысяча', transcription: null, theme: 'числа/время', example_sentence: 'Бұл қалада мың адам тұрады.', level: 'A1' },
  { term: 'сағат', translation_ru: 'час, часы', transcription: null, theme: 'числа/время', example_sentence: 'Қазір сағат нешеде?', level: 'A1' },
  { term: 'минут', translation_ru: 'минута', transcription: null, theme: 'числа/время', example_sentence: 'Бес минуттан кейін келемін.', level: 'A1' },
  { term: 'секунд', translation_ru: 'секунда', transcription: null, theme: 'числа/время', example_sentence: 'Бір секунд күте тұр.', level: 'A1' },
  { term: 'таңертең', translation_ru: 'утром', transcription: null, theme: 'числа/время', example_sentence: 'Таңертең спорт жасаймын.', level: 'A1' },
  { term: 'түс', translation_ru: 'полдень, день', transcription: null, theme: 'числа/время', example_sentence: 'Түсте демалыс уақыты.', level: 'A1' },
  { term: 'кеш', translation_ru: 'вечер', transcription: null, theme: 'числа/время', example_sentence: 'Кешке үйге барамын.', level: 'A1' },
  { term: 'түн', translation_ru: 'ночь', transcription: null, theme: 'числа/время', example_sentence: 'Түнде жақсы ұйықтадым.', level: 'A1' },
  { term: 'қазір', translation_ru: 'сейчас', transcription: null, theme: 'числа/время', example_sentence: 'Мен қазір бос емеспін.', level: 'A1' },
  { term: 'бүгін', translation_ru: 'сегодня', transcription: null, theme: 'числа/время', example_sentence: 'Бүгін ауа райы жақсы.', level: 'A1' },
  { term: 'ертең', translation_ru: 'завтра', transcription: null, theme: 'числа/время', example_sentence: 'Ертең кездесеміз.', level: 'A1' },
  { term: 'кеше', translation_ru: 'вчера', transcription: null, theme: 'числа/время', example_sentence: 'Кеше жаңбыр жауды.', level: 'A1' },
  { term: 'апта', translation_ru: 'неделя', transcription: null, theme: 'числа/время', example_sentence: 'Бір аптадан кейін демалысқа шығамын.', level: 'A1' },
  { term: 'ай', translation_ru: 'месяц; луна', transcription: 'екі мағынасы бар: «месяц» де, «луна» да', theme: 'числа/время', example_sentence: 'Бұл жоба бір айға созылады.', level: 'A1' },
  { term: 'жыл', translation_ru: 'год', transcription: null, theme: 'числа/время', example_sentence: 'Жаңа жыл құтты болсын!', level: 'A1' },
  { term: 'күнделікті', translation_ru: 'ежедневно', transcription: null, theme: 'числа/время', example_sentence: 'Мен күнделікті қазақша үйренемін.', level: 'A2' },

  // дом (расширение)
  { term: 'диван', translation_ru: 'диван', transcription: null, theme: 'дом', example_sentence: 'Диванда отырмын.', level: 'A1' },
  { term: 'үстел', translation_ru: 'стол', transcription: null, theme: 'дом', example_sentence: 'Кітап үстелде жатыр.', level: 'A1' },
  { term: 'орындық', translation_ru: 'стул', transcription: null, theme: 'дом', example_sentence: 'Орындыққа отыр.', level: 'A1' },
  { term: 'кереует', translation_ru: 'кровать', transcription: null, theme: 'дом', example_sentence: 'Мен кереуетте жатырмын.', level: 'A1' },
  { term: 'шкаф', translation_ru: 'шкаф', transcription: null, theme: 'дом', example_sentence: 'Киімді шкафқа іл.', level: 'A1' },
  { term: 'жуынатын бөлме', translation_ru: 'ванная комната', transcription: null, theme: 'дом', example_sentence: 'Жуынатын бөлме жоғарыда.', level: 'A2' },
  { term: 'дәретхана', translation_ru: 'туалет', transcription: null, theme: 'дом', example_sentence: 'Дәретхана қайда?', level: 'A2' },
  { term: 'балкон', translation_ru: 'балкон', transcription: null, theme: 'дом', example_sentence: 'Балконда гүл өсіріп жатырмын.', level: 'A1' },
  { term: 'баспалдақ', translation_ru: 'лестница', transcription: null, theme: 'дом', example_sentence: 'Баспалдақпен көтерілдім.', level: 'A2' },
  { term: 'пеш', translation_ru: 'печь, плита', transcription: null, theme: 'дом', example_sentence: 'Ас пеште пісіп жатыр.', level: 'A2' },

  // профессии (расширение)
  { term: 'инженер', translation_ru: 'инженер', transcription: null, theme: 'профессии', example_sentence: 'Ағам инженер болып жұмыс істейді.', level: 'A1' },
  { term: 'заңгер', translation_ru: 'юрист', transcription: null, theme: 'профессии', example_sentence: 'Ол заңгер болғысы келеді.', level: 'A2' },
  { term: 'студент', translation_ru: 'студент', transcription: null, theme: 'профессии', example_sentence: 'Мен университеттің студентімін.', level: 'A1' },
  { term: 'оқушы', translation_ru: 'ученик, школьник', transcription: null, theme: 'профессии', example_sentence: 'Ол мектептің оқушысы.', level: 'A1' },
  { term: 'бухгалтер', translation_ru: 'бухгалтер', transcription: null, theme: 'профессии', example_sentence: 'Апам бухгалтер болып істейді.', level: 'A2' },
  { term: 'полицей', translation_ru: 'полицейский', transcription: null, theme: 'профессии', example_sentence: 'Полицей көшеде тұр.', level: 'A2' },
  { term: 'аспаз', translation_ru: 'повар', transcription: null, theme: 'профессии', example_sentence: 'Мейрамханада аспаз жұмыс істейді.', level: 'A2' },
  { term: 'сәулетші', translation_ru: 'архитектор', transcription: null, theme: 'профессии', example_sentence: 'Ол ғимараттың сәулетшісі.', level: 'B1' },
  { term: 'бағдарламашы', translation_ru: 'программист', transcription: null, theme: 'профессии', example_sentence: 'Ағам бағдарламашы.', level: 'A2' },
  { term: 'журналист', translation_ru: 'журналист', transcription: null, theme: 'профессии', example_sentence: 'Ол белгілі журналист.', level: 'A2' },

  // тело (расширение)
  { term: 'мұрын', translation_ru: 'нос', transcription: null, theme: 'тело', example_sentence: 'Мұрным бітеліп қалды.', level: 'A1' },
  { term: 'ауыз', translation_ru: 'рот', transcription: null, theme: 'тело', example_sentence: 'Аузыңды аш.', level: 'A1' },
  { term: 'тіс', translation_ru: 'зуб', transcription: null, theme: 'тело', example_sentence: 'Тісім ауырады.', level: 'A1' },
  { term: 'шаш', translation_ru: 'волосы', transcription: null, theme: 'тело', example_sentence: 'Оның шашы ұзын.', level: 'A1' },
  { term: 'мойын', translation_ru: 'шея', transcription: null, theme: 'тело', example_sentence: 'Мойным қатты тұр.', level: 'A1' },
  { term: 'арқа', translation_ru: 'спина', transcription: null, theme: 'тело', example_sentence: 'Арқам ауырып тұр.', level: 'A1' },
  { term: 'іш', translation_ru: 'живот', transcription: null, theme: 'тело', example_sentence: 'Ішім ашты.', level: 'A1' },
  { term: 'саусақ', translation_ru: 'палец', transcription: null, theme: 'тело', example_sentence: 'Саусағымды кестім.', level: 'A1' },

  // погода (расширение)
  { term: 'боран', translation_ru: 'метель, буран', transcription: null, theme: 'погода', example_sentence: 'Далада боран тұрды.', level: 'B1' },
  { term: 'шық', translation_ru: 'роса', transcription: null, theme: 'погода', example_sentence: 'Таңертең шөпте шық жатыр.', level: 'A2' },
  { term: 'күн сәулесі', translation_ru: 'солнечный луч, свет', transcription: null, theme: 'погода', example_sentence: 'Терезеден күн сәулесі түсіп тұр.', level: 'A2' },
  { term: 'ауа райы болжамы', translation_ru: 'прогноз погоды', transcription: null, theme: 'погода', example_sentence: 'Ертеңгі ауа райы болжамын көрдің бе?', level: 'B1' },
  { term: 'ызғар', translation_ru: 'пронизывающий холод', transcription: null, theme: 'погода', example_sentence: 'Далада ызғар бар.', level: 'B1' },
  { term: 'самал', translation_ru: 'лёгкий ветерок', transcription: null, theme: 'погода', example_sentence: 'Жеңіл самал соғып тұр.', level: 'B1' },
  { term: 'нөсер', translation_ru: 'ливень', transcription: null, theme: 'погода', example_sentence: 'Кенеттен нөсер жауды.', level: 'B1' },
  { term: 'қырау', translation_ru: 'иней', transcription: null, theme: 'погода', example_sentence: 'Ағаштарда қырау жатыр.', level: 'B1' },
  { term: 'құрғақшылық', translation_ru: 'засуха', transcription: null, theme: 'погода', example_sentence: 'Бұл жылы құрғақшылық болды.', level: 'B1' },
  { term: 'жаңбырлы', translation_ru: 'дождливый', transcription: null, theme: 'погода', example_sentence: 'Бүгін жаңбырлы күн.', level: 'A2' },

  // природа (новая тема)
  { term: 'тау', translation_ru: 'гора', transcription: null, theme: 'природа', example_sentence: 'Алматының маңында тау көп.', level: 'A1' },
  { term: 'өзен', translation_ru: 'река', transcription: null, theme: 'природа', example_sentence: 'Өзен қаланың ортасынан ағады.', level: 'A1' },
  { term: 'көл', translation_ru: 'озеро', transcription: null, theme: 'природа', example_sentence: 'Біз көлге жүзуге бардық.', level: 'A1' },
  { term: 'теңіз', translation_ru: 'море', transcription: null, theme: 'природа', example_sentence: 'Жазда теңізге барамыз.', level: 'A1' },
  { term: 'орман', translation_ru: 'лес', transcription: null, theme: 'природа', example_sentence: 'Орманда саяхаттадық.', level: 'A1' },
  { term: 'дала', translation_ru: 'степь, поле', transcription: null, theme: 'природа', example_sentence: 'Қазақстанда дала көп.', level: 'A1' },
  { term: 'шөл', translation_ru: 'пустыня', transcription: null, theme: 'природа', example_sentence: 'Оңтүстікте шөл бар.', level: 'A2' },
  { term: 'бақ', translation_ru: 'сад', transcription: null, theme: 'природа', example_sentence: 'Үйдің артында бақ бар.', level: 'A2' },
  { term: 'саябақ', translation_ru: 'парк', transcription: null, theme: 'природа', example_sentence: 'Кешке саябақта серуендедік.', level: 'A2' },
  { term: 'ағаш', translation_ru: 'дерево', transcription: null, theme: 'природа', example_sentence: 'Аулада үлкен ағаш өседі.', level: 'A1' },
  { term: 'гүл', translation_ru: 'цветок', transcription: null, theme: 'природа', example_sentence: 'Мен оған гүл сыйладым.', level: 'A1' },
  { term: 'шөп', translation_ru: 'трава', transcription: null, theme: 'природа', example_sentence: 'Балалар шөпте ойнап жатыр.', level: 'A1' },
  { term: 'жапырақ', translation_ru: 'лист', transcription: null, theme: 'природа', example_sentence: 'Күзде жапырақтар түседі.', level: 'A2' },
  { term: 'тас', translation_ru: 'камень', transcription: null, theme: 'природа', example_sentence: 'Жолда үлкен тас жатыр.', level: 'A1' },
  { term: 'құм', translation_ru: 'песок', transcription: null, theme: 'природа', example_sentence: 'Балалар құммен ойнады.', level: 'A1' },
  { term: 'жер', translation_ru: 'земля', transcription: null, theme: 'природа', example_sentence: 'Бұл жер өте құнарлы.', level: 'A1' },
  { term: 'аспан', translation_ru: 'небо', transcription: null, theme: 'природа', example_sentence: 'Аспан бүгін ашық.', level: 'A1' },
  { term: 'жұлдыз', translation_ru: 'звезда', transcription: null, theme: 'природа', example_sentence: 'Түнде жұлдыздар жарқырайды.', level: 'A1' },
  { term: 'жануар', translation_ru: 'животное', transcription: null, theme: 'природа', example_sentence: 'Ол жануарларды жақсы көреді.', level: 'A1' },
  { term: 'ит', translation_ru: 'собака', transcription: null, theme: 'природа', example_sentence: 'Менің итім бар.', level: 'A1' },
  { term: 'мысық', translation_ru: 'кошка', transcription: null, theme: 'природа', example_sentence: 'Мысық үстелдің үстінде отыр.', level: 'A1' },
  { term: 'жылқы', translation_ru: 'лошадь', transcription: null, theme: 'природа', example_sentence: 'Ауылда жылқы көп.', level: 'A1' },
  { term: 'сиыр', translation_ru: 'корова', transcription: null, theme: 'природа', example_sentence: 'Сиыр сүт береді.', level: 'A1' },
  { term: 'қой', translation_ru: 'овца', transcription: null, theme: 'природа', example_sentence: 'Ауылда қой бақтық.', level: 'A1' },
  { term: 'құс', translation_ru: 'птица', transcription: null, theme: 'природа', example_sentence: 'Ағашта құс отыр.', level: 'A1' },
  { term: 'аю', translation_ru: 'медведь', transcription: null, theme: 'природа', example_sentence: 'Орманда аю бар.', level: 'A2' },
  { term: 'қасқыр', translation_ru: 'волк', transcription: null, theme: 'природа', example_sentence: 'Қасқыр далада жүр.', level: 'A2' },
  { term: 'түлкі', translation_ru: 'лиса', transcription: null, theme: 'природа', example_sentence: 'Түлкі қулығымен танымал.', level: 'A2' },
  { term: 'қоян', translation_ru: 'заяц', transcription: null, theme: 'природа', example_sentence: 'Қоян жылдам жүгіреді.', level: 'A2' },

  // путешествия (новая тема)
  { term: 'саяхат', translation_ru: 'путешествие', transcription: null, theme: 'путешествия', example_sentence: 'Біздің саяхатымыз тамаша болды.', level: 'A2' },
  { term: 'саяхаттау', translation_ru: 'путешествовать', transcription: null, theme: 'путешествия', example_sentence: 'Мен саяхаттауды жақсы көремін.', level: 'A2' },
  { term: 'турист', translation_ru: 'турист', transcription: null, theme: 'путешествия', example_sentence: 'Бұл қалада турист көп.', level: 'A2' },
  { term: 'билет', translation_ru: 'билет', transcription: null, theme: 'путешествия', example_sentence: 'Мен ұшаққа билет алдым.', level: 'A1' },
  { term: 'ұшақ', translation_ru: 'самолёт', transcription: null, theme: 'путешествия', example_sentence: 'Ұшақ сағат онда ұшады.', level: 'A1' },
  { term: 'пойыз', translation_ru: 'поезд', transcription: null, theme: 'путешествия', example_sentence: 'Пойызбен Астанаға бардым.', level: 'A1' },
  { term: 'әуежай', translation_ru: 'аэропорт', transcription: null, theme: 'путешествия', example_sentence: 'Біз әуежайға таксимен бардық.', level: 'A2' },
  { term: 'вокзал', translation_ru: 'вокзал', transcription: null, theme: 'путешествия', example_sentence: 'Вокзалда кездесеміз.', level: 'A2' },
  { term: 'паспорт', translation_ru: 'паспорт', transcription: null, theme: 'путешествия', example_sentence: 'Паспортыңды ұмытпа.', level: 'A1' },
  { term: 'виза', translation_ru: 'виза', transcription: null, theme: 'путешествия', example_sentence: 'Маған виза керек пе?', level: 'A2' },
  { term: 'багаж', translation_ru: 'багаж', transcription: null, theme: 'путешествия', example_sentence: 'Менің багажым ауыр.', level: 'A2' },
  { term: 'қонақүй', translation_ru: 'гостиница', transcription: null, theme: 'путешествия', example_sentence: 'Біз қонақүйде тұрдық.', level: 'A1' },
  { term: 'бөлме брондау', translation_ru: 'забронировать номер', transcription: null, theme: 'путешествия', example_sentence: 'Мен қонақүйден бөлме брондадым.', level: 'B1' },
  { term: 'демалыс', translation_ru: 'отдых, каникулы', transcription: null, theme: 'путешествия', example_sentence: 'Жазғы демалыс жақсы өтті.', level: 'A2' },
  { term: 'шетел', translation_ru: 'заграница', transcription: null, theme: 'путешествия', example_sentence: 'Ол шетелде оқыды.', level: 'A2' },
  { term: 'маршрут', translation_ru: 'маршрут', transcription: null, theme: 'путешествия', example_sentence: 'Біз маршрутты алдын ала жоспарладық.', level: 'B1' },
  { term: 'бағыт', translation_ru: 'направление', transcription: null, theme: 'путешествия', example_sentence: 'Бұл қай бағытқа кетеді?', level: 'A2' },
  { term: 'гид', translation_ru: 'гид, экскурсовод', transcription: null, theme: 'путешествия', example_sentence: 'Гид бізге қаланы көрсетті.', level: 'A2' },
  { term: 'экскурсия', translation_ru: 'экскурсия', transcription: null, theme: 'путешествия', example_sentence: 'Біз тау бойымен экскурсияға бардық.', level: 'A2' },
  { term: 'көрікті жерлер', translation_ru: 'достопримечательности', transcription: null, theme: 'путешествия', example_sentence: 'Бұл қаланың көрікті жерлері көп.', level: 'B1' },
  { term: 'жағажай', translation_ru: 'пляж', transcription: null, theme: 'путешествия', example_sentence: 'Біз жағажайда демалдық.', level: 'A2' },
  { term: 'кідіріс', translation_ru: 'остановка, пересадка (рейса)', transcription: null, theme: 'путешествия', example_sentence: 'Стамбулда кідіріс жасадық.', level: 'B1' },
  { term: 'рейс', translation_ru: 'авиарейс', transcription: null, theme: 'путешествия', example_sentence: 'Біздің рейсіміз кешікті.', level: 'A2' },
  { term: 'кеден', translation_ru: 'таможня', transcription: null, theme: 'путешествия', example_sentence: 'Кеденнен өттік.', level: 'B1' },
  { term: 'валюта айырбастау', translation_ru: 'обмен валюты', transcription: null, theme: 'путешествия', example_sentence: 'Мен валюта айырбастағым келеді.', level: 'B1' },
  { term: 'жол ақысы', translation_ru: 'плата за проезд, тариф', transcription: null, theme: 'путешествия', example_sentence: 'Автобустың жол ақысы қанша?', level: 'B1' },
  { term: 'көлік жалдау', translation_ru: 'арендовать машину', transcription: null, theme: 'путешествия', example_sentence: 'Біз көлік жалдадық.', level: 'B1' },
  { term: 'жол жүру құжаттары', translation_ru: 'проездные документы', transcription: null, theme: 'путешествия', example_sentence: 'Жол жүру құжаттарын тексеріңіз.', level: 'B1' },
  { term: 'жергілікті тұрғын', translation_ru: 'местный житель', transcription: null, theme: 'путешествия', example_sentence: 'Жергілікті тұрғындар өте мейірімді.', level: 'B1' },

  // технологии и интернет (новая тема)
  { term: 'компьютер', translation_ru: 'компьютер', transcription: null, theme: 'технологии и интернет', example_sentence: 'Мен компьютерде жұмыс істеймін.', level: 'A1' },
  { term: 'телефон', translation_ru: 'телефон', transcription: null, theme: 'технологии и интернет', example_sentence: 'Телефонымның батареясы бітті.', level: 'A1' },
  { term: 'интернет', translation_ru: 'интернет', transcription: null, theme: 'технологии и интернет', example_sentence: 'Үйде интернет жоқ.', level: 'A1' },
  { term: 'қосымша', translation_ru: 'приложение', transcription: null, theme: 'технологии и интернет', example_sentence: 'Мен жаңа қосымша жүктедім.', level: 'A2' },
  { term: 'сайт', translation_ru: 'сайт', transcription: null, theme: 'технологии и интернет', example_sentence: 'Бұл сайтта көп ақпарат бар.', level: 'A2' },
  { term: 'парола', translation_ru: 'пароль', transcription: null, theme: 'технологии и интернет', example_sentence: 'Паролымды ұмытып қалдым.', level: 'A2' },
  { term: 'логин', translation_ru: 'логин', transcription: null, theme: 'технологии и интернет', example_sentence: 'Логинді енгізіңіз.', level: 'A2' },
  { term: 'хабарлама', translation_ru: 'сообщение', transcription: null, theme: 'технологии и интернет', example_sentence: 'Саған хабарлама жібердім.', level: 'A2' },
  { term: 'хат', translation_ru: 'письмо', transcription: null, theme: 'технологии и интернет', example_sentence: 'Мен оған хат жаздым.', level: 'A2' },
  { term: 'электрондық пошта', translation_ru: 'электронная почта', transcription: null, theme: 'технологии и интернет', example_sentence: 'Электрондық поштаңызды жіберіңіз.', level: 'A2' },
  { term: 'жүктеу', translation_ru: 'скачать, загрузить', transcription: null, theme: 'технологии и интернет', example_sentence: 'Файлды жүктеп алдым.', level: 'B1' },
  { term: 'жаңарту', translation_ru: 'обновить, обновление', transcription: null, theme: 'технологии и интернет', example_sentence: 'Қосымшаны жаңарту керек.', level: 'B1' },
  { term: 'байланыс', translation_ru: 'связь, соединение', transcription: null, theme: 'технологии и интернет', example_sentence: 'Байланыс нашар.', level: 'A2' },
  { term: 'Wi-Fi-ға қосылу', translation_ru: 'подключиться к Wi-Fi', transcription: null, theme: 'технологии и интернет', example_sentence: 'Мен Wi-Fi-ға қосылдым.', level: 'A2' },
  { term: 'батарея заряды', translation_ru: 'заряд батареи', transcription: null, theme: 'технологии и интернет', example_sentence: 'Батарея заряды аз қалды.', level: 'A2' },
  { term: 'экран', translation_ru: 'экран', transcription: null, theme: 'технологии и интернет', example_sentence: 'Экран сынып қалды.', level: 'A1' },
  { term: 'пернетақта', translation_ru: 'клавиатура', transcription: null, theme: 'технологии и интернет', example_sentence: 'Пернетақта жұмыс істемей тұр.', level: 'A2' },
  { term: 'тінтуір', translation_ru: 'компьютерная мышь', transcription: null, theme: 'технологии и интернет', example_sentence: 'Тінтуірді басыңыз.', level: 'A2' },
  { term: 'бұлтта сақтау', translation_ru: 'облачное хранилище', transcription: null, theme: 'технологии и интернет', example_sentence: 'Суреттерімді бұлтта сақтаймын.', level: 'B1' },
  { term: 'желі', translation_ru: 'сеть', transcription: null, theme: 'технологии и интернет', example_sentence: 'Желі баяу жұмыс істеп тұр.', level: 'A2' },
  { term: 'әлеуметтік желі', translation_ru: 'социальная сеть', transcription: null, theme: 'технологии и интернет', example_sentence: 'Ол әлеуметтік желіде белсенді.', level: 'A2' },
  { term: 'парақша', translation_ru: 'страница, профиль', transcription: null, theme: 'технологии и интернет', example_sentence: 'Менің парақшамды көрдің бе?', level: 'A2' },
  { term: 'лайк басу', translation_ru: 'поставить лайк', transcription: null, theme: 'технологии и интернет', example_sentence: 'Постыма лайк бас.', level: 'A2' },
  { term: 'бөлісу', translation_ru: 'поделиться (постом)', transcription: null, theme: 'технологии и интернет', example_sentence: 'Мен бұл жаңалықпен бөлістім.', level: 'A2' },
  { term: 'жазылу', translation_ru: 'подписаться', transcription: null, theme: 'технологии и интернет', example_sentence: 'Арнаға жазылдым.', level: 'A2' },
  { term: 'қосу', translation_ru: 'включить', transcription: null, theme: 'технологии и интернет', example_sentence: 'Компьютерді қос.', level: 'A1' },
  { term: 'өшіру', translation_ru: 'выключить', transcription: null, theme: 'технологии и интернет', example_sentence: 'Телефонды өшір.', level: 'A1' },
  { term: 'бағдарлама', translation_ru: 'программа, ПО', transcription: null, theme: 'технологии и интернет', example_sentence: 'Бұл бағдарлама тегін.', level: 'A2' },
  { term: 'жасанды интеллект', translation_ru: 'искусственный интеллект', transcription: null, theme: 'технологии и интернет', example_sentence: 'Жасанды интеллект жылдам дамып жатыр.', level: 'B1' },

  // работа и учёба (новая/углублённая тема, помимо "профессии")
  { term: 'жұмыс', translation_ru: 'работа', transcription: null, theme: 'работа и учёба', example_sentence: 'Менің жұмысым қызық.', level: 'A1' },
  { term: 'жұмыс істеу', translation_ru: 'работать', transcription: null, theme: 'работа и учёба', example_sentence: 'Мен банкте жұмыс істеймін.', level: 'A1' },
  { term: 'кеңсе', translation_ru: 'офис', transcription: null, theme: 'работа и учёба', example_sentence: 'Кеңсе орталықта орналасқан.', level: 'A2' },
  { term: 'әріптес', translation_ru: 'коллега', transcription: null, theme: 'работа и учёба', example_sentence: 'Менің әріптестерім достық.', level: 'A2' },
  { term: 'бастық', translation_ru: 'начальник', transcription: null, theme: 'работа и учёба', example_sentence: 'Бастығым бүгін демалыста.', level: 'A2' },
  { term: 'қызметкер', translation_ru: 'сотрудник', transcription: null, theme: 'работа и учёба', example_sentence: 'Компанияда жүз қызметкер бар.', level: 'A2' },
  { term: 'жиналыс', translation_ru: 'собрание, совещание', transcription: null, theme: 'работа и учёба', example_sentence: 'Жиналыс сағат оннан басталады.', level: 'A2' },
  { term: 'тапсырма', translation_ru: 'задание, задача', transcription: null, theme: 'работа и учёба', example_sentence: 'Маған жаңа тапсырма берді.', level: 'A2' },
  { term: 'жоба', translation_ru: 'проект', transcription: null, theme: 'работа и учёба', example_sentence: 'Біз жаңа жобаны бастадық.', level: 'A2' },
  { term: 'мерзім', translation_ru: 'срок, дедлайн', transcription: null, theme: 'работа и учёба', example_sentence: 'Жобаның мерзімі ертең бітеді.', level: 'B1' },
  { term: 'демалыс күні', translation_ru: 'выходной день', transcription: null, theme: 'работа и учёба', example_sentence: 'Жексенбі — менің демалыс күнім.', level: 'A2' },
  { term: 'жалақы алу', translation_ru: 'получать зарплату', transcription: null, theme: 'работа и учёба', example_sentence: 'Мен ай сайын жалақы аламын.', level: 'A2' },
  { term: 'демалысқа шығу', translation_ru: 'уйти в отпуск', transcription: null, theme: 'работа и учёба', example_sentence: 'Мен шілдеде демалысқа шығамын.', level: 'B1' },
  { term: 'жұмыстан шығу', translation_ru: 'уволиться', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол жұмыстан шықты.', level: 'B1' },
  { term: 'жұмысқа орналасу', translation_ru: 'устроиться на работу', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол жаңа компанияға жұмысқа орналасты.', level: 'B1' },
  { term: 'тәжірибе', translation_ru: 'опыт (работы)', transcription: null, theme: 'работа и учёба', example_sentence: 'Менің үш жылдық тәжірибем бар.', level: 'A2' },
  { term: 'дағды', translation_ru: 'навык', transcription: null, theme: 'работа и учёба', example_sentence: 'Бұл жұмыс жаңа дағды талап етеді.', level: 'A2' },
  { term: 'маман', translation_ru: 'специалист', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол өз саласының жақсы маманы.', level: 'A2' },
  { term: 'мамандық', translation_ru: 'специальность, профессия', transcription: null, theme: 'работа и учёба', example_sentence: 'Сенің мамандығың қандай?', level: 'A2' },
  { term: 'университет', translation_ru: 'университет', transcription: null, theme: 'работа и учёба', example_sentence: 'Мен университетте оқимын.', level: 'A1' },
  { term: 'факультет', translation_ru: 'факультет', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол экономика факультетінде оқиды.', level: 'A2' },
  { term: 'курс', translation_ru: 'курс (обучения)', transcription: null, theme: 'работа и учёба', example_sentence: 'Мен ағылшын тілі курсына бардым.', level: 'A2' },
  { term: 'дәріс', translation_ru: 'лекция', transcription: null, theme: 'работа и учёба', example_sentence: 'Дәріс сағат тоғызда басталады.', level: 'A2' },
  { term: 'емтихан', translation_ru: 'экзамен', transcription: null, theme: 'работа и учёба', example_sentence: 'Ертең маған емтихан бар.', level: 'A1' },
  { term: 'сынақ', translation_ru: 'зачёт, тест', transcription: null, theme: 'работа и учёба', example_sentence: 'Сынақты сәтті тапсырдым.', level: 'A2' },
  { term: 'диплом', translation_ru: 'диплом', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол биыл диплом алды.', level: 'A2' },
  { term: 'білім', translation_ru: 'образование, знание', transcription: null, theme: 'работа и учёба', example_sentence: 'Білім — үлкен байлық.', level: 'A2' },
  { term: 'оқу', translation_ru: 'учёба, учиться', transcription: null, theme: 'работа и учёба', example_sentence: 'Маған оқу қатты ұнайды.', level: 'A1' },
  { term: 'үй тапсырмасы', translation_ru: 'домашнее задание', transcription: null, theme: 'работа и учёба', example_sentence: 'Үй тапсырмасын жасадым.', level: 'A1' },
  { term: 'кесте', translation_ru: 'расписание', transcription: null, theme: 'работа и учёба', example_sentence: 'Сабақ кестесін көрдің бе?', level: 'A2' },
  { term: 'семестр', translation_ru: 'семестр', transcription: null, theme: 'работа и учёба', example_sentence: 'Жаңа семестр басталды.', level: 'A2' },
  { term: 'стипендия', translation_ru: 'стипендия', transcription: null, theme: 'работа и учёба', example_sentence: 'Ол жақсы оқығаны үшін стипендия алады.', level: 'B1' },
  { term: 'топ', translation_ru: 'учебная группа', transcription: null, theme: 'работа и учёба', example_sentence: 'Біздің топта он бес адам бар.', level: 'A2' },
  { term: 'оқытушы', translation_ru: 'преподаватель (вуза)', transcription: null, theme: 'работа и учёба', example_sentence: 'Оқытушымыз өте білімді.', level: 'A2' },

  // общество и мнения (новая тема, базовый B1)
  { term: 'пікір', translation_ru: 'мнение', transcription: null, theme: 'общество и мнения', example_sentence: 'Менің пікірімше, бұл дұрыс емес.', level: 'B1' },
  { term: 'көзқарас', translation_ru: 'точка зрения, взгляд', transcription: null, theme: 'общество и мнения', example_sentence: 'Оның көзқарасы қызық.', level: 'B1' },
  { term: 'келісу', translation_ru: 'соглашаться', transcription: null, theme: 'общество и мнения', example_sentence: 'Мен сенімен келісемін.', level: 'A2' },
  { term: 'келіспеу', translation_ru: 'не соглашаться', transcription: null, theme: 'общество и мнения', example_sentence: 'Мен бұл пікірмен келіспеймін.', level: 'A2' },
  { term: 'ұсыну', translation_ru: 'предлагать', transcription: null, theme: 'общество и мнения', example_sentence: 'Мен жаңа идея ұсынамын.', level: 'A2' },
  { term: 'кеңес беру', translation_ru: 'советовать', transcription: null, theme: 'общество и мнения', example_sentence: 'Досым маған кеңес берді.', level: 'A2' },
  { term: 'талқылау', translation_ru: 'обсуждать', transcription: null, theme: 'общество и мнения', example_sentence: 'Біз бұл мәселені талқыладық.', level: 'B1' },
  { term: 'пікірталас', translation_ru: 'дискуссия, спор', transcription: null, theme: 'общество и мнения', example_sentence: 'Қызу пікірталас болды.', level: 'B1' },
  { term: 'мәселе', translation_ru: 'проблема, вопрос (тема)', transcription: null, theme: 'общество и мнения', example_sentence: 'Бұл маңызды мәселе.', level: 'A2' },
  { term: 'шешім қабылдау', translation_ru: 'принимать решение', transcription: null, theme: 'общество и мнения', example_sentence: 'Шешім қабылдау оңай емес.', level: 'B1' },
  { term: 'құқық', translation_ru: 'право', transcription: null, theme: 'общество и мнения', example_sentence: 'Әркімнің білім алуға құқығы бар.', level: 'B1' },
  { term: 'міндет', translation_ru: 'обязанность, долг', transcription: null, theme: 'общество и мнения', example_sentence: 'Бұл менің міндетім.', level: 'B1' },
  { term: 'қоғам', translation_ru: 'общество', transcription: null, theme: 'общество и мнения', example_sentence: 'Қоғам өзгеріп жатыр.', level: 'B1' },
  { term: 'мәдениет', translation_ru: 'культура', transcription: null, theme: 'общество и мнения', example_sentence: 'Қазақ мәдениеті бай.', level: 'A2' },
  { term: 'дәстүр', translation_ru: 'традиция', transcription: null, theme: 'общество и мнения', example_sentence: 'Бұл біздің отбасының дәстүрі.', level: 'A2' },
  { term: 'әдет-ғұрып', translation_ru: 'обычаи', transcription: null, theme: 'общество и мнения', example_sentence: 'Әр елдің өз әдет-ғұрпы бар.', level: 'B1' },
  { term: 'құндылық', translation_ru: 'ценность (моральная)', transcription: null, theme: 'общество и мнения', example_sentence: 'Отбасы — үлкен құндылық.', level: 'B1' },
  { term: 'жауапкершілік', translation_ru: 'ответственность', transcription: null, theme: 'общество и мнения', example_sentence: 'Ол өз жауапкершілігін сезінеді.', level: 'B1' },
  { term: 'теңдік', translation_ru: 'равенство', transcription: null, theme: 'общество и мнения', example_sentence: 'Теңдік үшін күресу керек.', level: 'B1' },
  { term: 'бостандық', translation_ru: 'свобода', transcription: null, theme: 'общество и мнения', example_sentence: 'Бостандық — маңызды құндылық.', level: 'B1' },
  { term: 'сенім', translation_ru: 'доверие', transcription: null, theme: 'общество и мнения', example_sentence: 'Оларда бір-біріне сенім бар.', level: 'B1' },
  { term: 'күмән', translation_ru: 'сомнение', transcription: null, theme: 'общество и мнения', example_sentence: 'Менде күмән бар.', level: 'B1' },
  { term: 'болжам', translation_ru: 'предположение, прогноз', transcription: null, theme: 'общество и мнения', example_sentence: 'Бұл тек болжам.', level: 'B1' },
  { term: 'себеп', translation_ru: 'причина', transcription: null, theme: 'общество и мнения', example_sentence: 'Кешігудің себебі не?', level: 'A2' },
  { term: 'салдар', translation_ru: 'последствие', transcription: null, theme: 'общество и мнения', example_sentence: 'Бұл шешімнің салдары үлкен.', level: 'B1' },
  { term: 'нәтиже', translation_ru: 'результат', transcription: null, theme: 'общество и мнения', example_sentence: 'Жұмыстың нәтижесі жақсы болды.', level: 'A2' },
  { term: 'қоғамдық пікір', translation_ru: 'общественное мнение', transcription: null, theme: 'общество и мнения', example_sentence: 'Қоғамдық пікір өзгерді.', level: 'B1' }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM cards WHERE language = ? AND term = ?');
  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence, level, status)
     VALUES ('kz', @term, @translation_ru, @transcription, @theme, @example_sentence, @level, 'backlog')`
  );

  const skipped = [];
  let inserted = 0;
  const insertAll = db.transaction((items) => {
    for (const card of items) {
      if (existsStmt.get('kz', card.term)) {
        skipped.push(card.term);
        continue; // idempotent + dedup: skip if this term already exists (active/backlog/mastered)
      }
      insertCard.run({ ...card, transcription: card.transcription ?? null });
      inserted += 1;
    }
  });

  insertAll(KZ_CARDS);
  console.log(`Inserted ${inserted} new Kazakh backlog cards (${KZ_CARDS.length} candidates, ${skipped.length} already existed).`);
  if (skipped.length > 0) console.log('Skipped (already in DB):', skipped);

  const byLevel = db
    .prepare("SELECT level, COUNT(*) AS count FROM cards WHERE language = 'kz' GROUP BY level ORDER BY level")
    .all();
  console.table(byLevel);
  console.log('Total kz cards now:', db.prepare("SELECT COUNT(*) c FROM cards WHERE language = 'kz'").get().c);
}

seed();
