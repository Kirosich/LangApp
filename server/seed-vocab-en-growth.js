// English vocabulary growth: staying B2-C1 (no new A1/A2 layer), five
// new themes per the plan -- idiomatic metaphors, nuanced emotional/
// relationship psychology (deeper than the existing 5-word эмоции
// theme), academic/research vocabulary for reading papers, modern
// social-media/digital-communication vocabulary, and conversational
// hedges/intensifiers. A handful of genuinely common B1 items are
// mixed in only where they're a real bridge (esp. social media terms
// that are common regardless of level), not a full basic layer.
import { db } from './db/index.js';

const EN_CARDS = [
  // устойчивые метафоры и образные выражения
  { term: 'to hit the nail on the head', translation_ru: 'попасть в самую точку', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'You hit the nail on the head with that comment.', level: 'B2' },
  { term: 'to be in the same boat', translation_ru: 'быть в одинаковом положении', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "Don't worry, we're all in the same boat here.", level: 'B2' },
  { term: 'the tip of the iceberg', translation_ru: 'верхушка айсберга', transcription: 'намёк, что проблема глубже', theme: 'устойчивые метафоры и образные выражения', example_sentence: 'This complaint is just the tip of the iceberg.', level: 'B2' },
  { term: 'to open a can of worms', translation_ru: 'затронуть сложную, запутанную тему', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "Let's not open that can of worms right now.", level: 'C1' },
  { term: 'to burn bridges', translation_ru: 'сжечь мосты', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "Don't burn bridges with your old employer.", level: 'B2' },
  { term: 'to be at a crossroads', translation_ru: 'быть на распутье', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'She feels like she\'s at a crossroads in her career.', level: 'B2' },
  { term: 'to weather the storm', translation_ru: 'пережить трудности', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'The company managed to weather the storm.', level: 'C1' },
  { term: 'to be under the weather', translation_ru: 'неважно себя чувствовать', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "I'm a bit under the weather today.", level: 'B2' },
  { term: 'to break the ice', translation_ru: 'растопить лёд (в общении)', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'He told a joke to break the ice.', level: 'B2' },
  { term: 'to go the extra mile', translation_ru: 'приложить дополнительные усилия', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'She always goes the extra mile for clients.', level: 'B2' },
  { term: 'to hit a wall', translation_ru: 'упереться в тупик', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "I've hit a wall with this problem.", level: 'B2' },
  { term: 'to be on thin ice', translation_ru: 'быть в шатком положении, рисковать', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "You're on thin ice after missing another deadline.", level: 'C1' },
  { term: 'to have your cake and eat it too', translation_ru: 'хотеть и то, и другое сразу', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "You can't have your cake and eat it too.", level: 'C1' },
  { term: 'to bite the bullet', translation_ru: 'стиснуть зубы и сделать', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "I'll just bite the bullet and call him.", level: 'C1' },
  { term: 'to throw in the towel', translation_ru: 'сдаться', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'After three failed attempts, he threw in the towel.', level: 'B2' },
  { term: 'to be a game changer', translation_ru: 'в корне менять ситуацию', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'This update is a real game changer.', level: 'B2' },
  { term: 'to raise the bar', translation_ru: 'поднять планку', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Their new product raised the bar for the industry.', level: 'B2' },
  { term: 'to move the goalposts', translation_ru: 'менять правила на ходу', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'It feels like they keep moving the goalposts.', level: 'C1' },
  { term: 'to be a double whammy', translation_ru: 'двойной удар (о неудаче)', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Losing the client and the funding was a double whammy.', level: 'C1' },
  { term: 'to scratch the surface', translation_ru: 'затронуть лишь поверхностно', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "We've only scratched the surface of the problem.", level: 'B2' },
  { term: 'to connect the dots', translation_ru: 'соединить факты, понять взаимосвязь', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'It took me a while to connect the dots.', level: 'B2' },
  { term: 'to read the room', translation_ru: 'чувствовать настроение окружающих', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'He completely failed to read the room.', level: 'B2' },
  { term: 'to be the elephant in the room', translation_ru: 'очевидная, но замалчиваемая проблема', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "Let's talk about the elephant in the room.", level: 'C1' },
  { term: 'to jump on the bandwagon', translation_ru: 'присоединиться к тренду', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Everyone jumped on the bandwagon after it went viral.', level: 'B2' },
  { term: 'to be a wake-up call', translation_ru: 'стать тревожным сигналом', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'That health scare was a real wake-up call.', level: 'B2' },
  { term: 'to fall through the cracks', translation_ru: 'остаться незамеченным, "проскользнуть"', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "Somehow the request fell through the cracks.", level: 'C1' },
  { term: 'to be set in stone', translation_ru: 'быть неизменным, окончательным', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "The plan isn't set in stone yet.", level: 'B2' },
  { term: 'to be up in the air', translation_ru: 'быть неопределённым', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Our travel plans are still up in the air.', level: 'B2' },
  { term: 'to turn a blind eye', translation_ru: 'закрывать на что-то глаза', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Management turned a blind eye to the issue.', level: 'B2' },
  { term: 'to be a slippery slope', translation_ru: 'скользкий путь (к нежелательным последствиям)', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Cutting corners here is a slippery slope.', level: 'C1' },
  { term: 'to hit close to home', translation_ru: 'задевать за живое', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'That comment hit close to home.', level: 'B2' },
  { term: 'to be par for the course', translation_ru: 'быть обычным делом, ожидаемым', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Delays like this are par for the course.', level: 'C1' },
  { term: 'to come full circle', translation_ru: 'вернуться к исходной точке', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'His career has come full circle.', level: 'B2' },
  { term: 'to be at the end of your rope', translation_ru: 'быть на пределе', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "I'm at the end of my rope with this project.", level: 'C1' },
  { term: 'to keep something at bay', translation_ru: 'сдерживать, не подпускать', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Regular exercise keeps stress at bay.', level: 'C1' },
  { term: 'to be a blessing in disguise', translation_ru: 'неожиданное благо', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Losing that job was a blessing in disguise.', level: 'B2' },
  { term: 'to take something with a grain of salt', translation_ru: 'относиться скептически', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Take that review with a grain of salt.', level: 'B2' },
  { term: 'to be walking on eggshells', translation_ru: 'вести себя крайне осторожно (чтобы не задеть)', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: "I feel like I'm walking on eggshells around him.", level: 'C1' },
  { term: 'to spill the beans', translation_ru: 'выболтать секрет', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'Someone spilled the beans about the surprise party.', level: 'B2' },
  { term: 'to be the last straw', translation_ru: 'последняя капля', transcription: null, theme: 'устойчивые метафоры и образные выражения', example_sentence: 'That email was the last straw for me.', level: 'B2' },

  // эмоциональный интеллект и психология отношений
  { term: 'self-awareness', translation_ru: 'самосознание', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Therapy helped him build more self-awareness.', level: 'B2' },
  { term: 'emotional regulation', translation_ru: 'эмоциональная саморегуляция', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'She practices emotional regulation before difficult conversations.', level: 'C1' },
  { term: 'empathy', translation_ru: 'эмпатия, сочувствие', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He listened with a lot of empathy.', level: 'B2' },
  { term: 'attachment style', translation_ru: 'тип привязанности', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Understanding your attachment style helps in relationships.', level: 'C1' },
  { term: 'boundaries', translation_ru: 'личные границы', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "It's healthy to have clear boundaries.", level: 'B2' },
  { term: 'to set boundaries', translation_ru: 'устанавливать границы', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'She finally set boundaries with her family.', level: 'B2' },
  { term: 'codependency', translation_ru: 'созависимость', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Their relationship shows signs of codependency.', level: 'C1' },
  { term: "to validate someone's feelings", translation_ru: 'подтвердить, признать чьи-то чувства', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "Just validate her feelings before offering advice.", level: 'C1' },
  { term: 'to gaslight', translation_ru: 'газлайтить, манипулировать восприятием реальности', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He accused her of gaslighting him.', level: 'C1' },
  { term: 'to project', translation_ru: 'проецировать (свои чувства на другого)', transcription: 'психологический термин', theme: 'эмоциональный интеллект и психология отношений', example_sentence: "I think you're projecting your own fears onto me.", level: 'C1' },
  { term: 'resentment', translation_ru: 'обида, затаённая злость', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "There's still some resentment between them.", level: 'B2' },
  { term: 'vulnerability', translation_ru: 'уязвимость (эмоциональная)', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Opening up takes real vulnerability.', level: 'B2' },
  { term: 'emotionally unavailable', translation_ru: 'эмоционально недоступный', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He came across as emotionally unavailable.', level: 'C1' },
  { term: 'self-esteem', translation_ru: 'самооценка', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'The criticism hurt her self-esteem.', level: 'B2' },
  { term: 'self-worth', translation_ru: 'чувство собственной ценности', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "Don't tie your self-worth to your job title.", level: 'B2' },
  { term: 'insecurity', translation_ru: 'неуверенность в себе', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'His insecurity showed in every meeting.', level: 'B2' },
  { term: 'to overthink', translation_ru: 'слишком много размышлять, накручивать себя', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "Try not to overthink it.", level: 'B2' },
  { term: 'to shut down', translation_ru: 'эмоционально закрываться', transcription: 'о человеке, не о технике', theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He shuts down whenever we argue.', level: 'B2' },
  { term: 'to ruminate', translation_ru: 'зацикливаться на мыслях', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "She kept ruminating over what he'd said.", level: 'C1' },
  { term: 'closure', translation_ru: 'психологическое завершение (ситуации/отношений)', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'She needed closure after the breakup.', level: 'C1' },
  { term: 'to hold a grudge', translation_ru: 'затаить обиду', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "I don't hold a grudge, honestly.", level: 'B2' },
  { term: 'reciprocity', translation_ru: 'взаимность', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Good friendships are built on reciprocity.', level: 'C1' },
  { term: 'to reciprocate', translation_ru: 'отвечать взаимностью', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He never reciprocates the effort.', level: 'B2' },
  { term: 'mutual respect', translation_ru: 'взаимное уважение', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Their partnership is built on mutual respect.', level: 'B2' },
  { term: 'toxic relationship', translation_ru: 'токсичные отношения', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'She finally left the toxic relationship.', level: 'B2' },
  { term: 'to enable', translation_ru: 'потакать, покрывать (плохое поведение)', transcription: 'психологический смысл, не "включать"', theme: 'эмоциональный интеллект и психология отношений', example_sentence: "You're just enabling his behavior.", level: 'C1' },
  { term: 'to compartmentalize', translation_ru: 'разграничивать, "раскладывать по полочкам" (эмоции/дела)', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'He compartmentalizes work and home life.', level: 'C1' },
  { term: 'to communicate openly', translation_ru: 'открыто общаться', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "We try to communicate openly about money.", level: 'B2' },
  { term: 'active listening', translation_ru: 'активное слушание', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Active listening improved our meetings a lot.', level: 'B2' },
  { term: 'to be on the same wavelength', translation_ru: 'быть на одной волне (эмоционально)', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "We've always been on the same wavelength.", level: 'B2' },
  { term: 'attachment issues', translation_ru: 'проблемы с привязанностью', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'His attachment issues stem from childhood.', level: 'C1' },
  { term: 'emotional baggage', translation_ru: 'эмоциональный багаж (непроработанные травмы)', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Everyone carries some emotional baggage.', level: 'C1' },
  { term: 'to process emotions', translation_ru: 'прорабатывать эмоции', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'It takes time to process emotions like that.', level: 'B2' },
  { term: 'self-sabotage', translation_ru: 'самосаботаж', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "He keeps self-sabotaging his own progress.", level: 'C1' },
  { term: 'to seek validation', translation_ru: 'искать одобрения', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: "She's always seeking validation online.", level: 'C1' },
  { term: 'people-pleasing', translation_ru: 'стремление угодить всем', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'His people-pleasing left him exhausted.', level: 'C1' },
  { term: 'emotional intelligence', translation_ru: 'эмоциональный интеллект', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Emotional intelligence matters as much as skill.', level: 'B2' },
  { term: 'to feel triggered', translation_ru: 'испытывать острую эмоциональную реакцию', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'That comment really triggered her.', level: 'C1' },
  { term: 'secure attachment', translation_ru: 'надёжная привязанность', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Secure attachment makes conflict easier to handle.', level: 'C1' },
  { term: 'to lean into discomfort', translation_ru: 'не избегать дискомфорта, проживать его', transcription: null, theme: 'эмоциональный интеллект и психология отношений', example_sentence: 'Growth means learning to lean into discomfort.', level: 'C1' },

  // академическая/научная лексика
  { term: 'hypothesis', translation_ru: 'гипотеза', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The study set out to test this hypothesis.', level: 'B2' },
  { term: 'methodology', translation_ru: 'методология', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The methodology is explained in section two.', level: 'B2' },
  { term: 'empirical', translation_ru: 'эмпирический, основанный на опыте', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'We need empirical evidence, not opinions.', level: 'C1' },
  { term: 'correlation', translation_ru: 'корреляция', transcription: null, theme: 'академическая/научная лексика', example_sentence: "There's a strong correlation between the two variables.", level: 'B2' },
  { term: 'causation', translation_ru: 'причинно-следственная связь', transcription: 'correlation ≠ causation', theme: 'академическая/научная лексика', example_sentence: 'Correlation does not imply causation.', level: 'C1' },
  { term: 'a variable', translation_ru: 'переменная', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'They controlled for several variables.', level: 'B2' },
  { term: 'sample size', translation_ru: 'размер выборки', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The sample size was too small to be reliable.', level: 'B2' },
  { term: 'peer-reviewed', translation_ru: 'рецензируемый (о статье)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'It was published in a peer-reviewed journal.', level: 'C1' },
  { term: 'a citation', translation_ru: 'цитирование, ссылка', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'Every claim needs a proper citation.', level: 'B2' },
  { term: 'to cite', translation_ru: 'цитировать, ссылаться на', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'She cited three studies to support her point.', level: 'B2' },
  { term: 'bibliography', translation_ru: 'библиография', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'Check the bibliography at the end of the paper.', level: 'B2' },
  { term: 'an abstract', translation_ru: 'аннотация (статьи)', transcription: 'сущ., не про "абстрактный"', theme: 'академическая/научная лексика', example_sentence: 'Read the abstract before the full paper.', level: 'B2' },
  { term: 'findings', translation_ru: 'результаты (исследования)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The findings surprised the researchers.', level: 'B2' },
  { term: 'to conduct research', translation_ru: 'проводить исследование', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'They conducted research over five years.', level: 'B2' },
  { term: 'a data set', translation_ru: 'набор данных', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The data set includes over ten thousand entries.', level: 'B2' },
  { term: 'to extrapolate', translation_ru: 'экстраполировать', transcription: null, theme: 'академическая/научная лексика', example_sentence: "It's risky to extrapolate from such a small sample.", level: 'C1' },
  { term: 'bias', translation_ru: 'предвзятость, смещение (в исследовании)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The survey design introduced bias.', level: 'C1' },
  { term: 'to substantiate', translation_ru: 'обосновать, подтвердить', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The claim was never substantiated.', level: 'C1' },
  { term: 'a claim', translation_ru: 'утверждение (в аргументации)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The paper makes a bold claim.', level: 'B2' },
  { term: 'counterargument', translation_ru: 'контраргумент', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The author addresses the main counterargument.', level: 'B2' },
  { term: 'to draw a conclusion', translation_ru: 'сделать вывод', transcription: null, theme: 'академическая/научная лексика', example_sentence: "It's too early to draw a conclusion.", level: 'B2' },
  { term: 'a theoretical framework', translation_ru: 'теоретическая база', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The study uses a clear theoretical framework.', level: 'C1' },
  { term: 'qualitative', translation_ru: 'качественный (о данных/методе)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'They used qualitative interviews, not surveys.', level: 'C1' },
  { term: 'quantitative', translation_ru: 'количественный', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The quantitative data backs up the theory.', level: 'C1' },
  { term: 'a paradigm', translation_ru: 'парадигма', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'This represents a shift in scientific paradigm.', level: 'C1' },
  { term: 'a phenomenon', translation_ru: 'явление, феномен', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'This is a well-documented phenomenon.', level: 'B2' },
  { term: 'to postulate', translation_ru: 'постулировать, выдвигать (тезис)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The theory postulates a common cause.', level: 'C1' },
  { term: 'an anomaly', translation_ru: 'аномалия, отклонение', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The result turned out to be an anomaly.', level: 'B2' },
  { term: 'a longitudinal study', translation_ru: 'лонгитюдное исследование', transcription: 'исследование в течение долгого времени', theme: 'академическая/научная лексика', example_sentence: 'It was a ten-year longitudinal study.', level: 'C1' },
  { term: 'to replicate', translation_ru: 'воспроизвести (исследование)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'Other labs failed to replicate the results.', level: 'C1' },
  { term: 'inconclusive', translation_ru: 'неубедительный, неоднозначный (о результатах)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The evidence remains inconclusive.', level: 'C1' },
  { term: 'a control group', translation_ru: 'контрольная группа', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The control group received no treatment.', level: 'B2' },
  { term: 'statistically significant', translation_ru: 'статистически значимый', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The difference was statistically significant.', level: 'C1' },
  { term: 'to peer review', translation_ru: 'рецензировать', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'Two experts peer reviewed the manuscript.', level: 'C1' },
  { term: 'a footnote', translation_ru: 'сноска', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The detail is explained in a footnote.', level: 'B2' },
  { term: 'an appendix', translation_ru: 'приложение (в документе)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The raw data is in the appendix.', level: 'B2' },
  { term: 'to synthesize', translation_ru: 'синтезировать, обобщать (информацию)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The review synthesizes findings from 40 studies.', level: 'C1' },
  { term: 'a thesis statement', translation_ru: 'тезис (главная мысль работы)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'Your thesis statement needs to be clearer.', level: 'B2' },
  { term: 'plagiarism', translation_ru: 'плагиат', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'The university has a strict policy on plagiarism.', level: 'B2' },
  { term: 'to corroborate', translation_ru: 'подтвердить, подкрепить (доказательствами)', transcription: null, theme: 'академическая/научная лексика', example_sentence: 'New evidence corroborates the earlier findings.', level: 'C1' },

  // лексика соцсетей и цифровой коммуникации
  { term: 'to go viral', translation_ru: 'стать вирусным (о контенте)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'The video went viral overnight.', level: 'B2' },
  { term: 'engagement', translation_ru: 'вовлечённость (в соцсетях)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Engagement dropped after the algorithm change.', level: 'B2' },
  { term: 'a follower', translation_ru: 'подписчик', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'She has over ten thousand followers.', level: 'B1' },
  { term: 'to follow', translation_ru: 'подписаться (на аккаунт)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I followed him after that stream.', level: 'B1' },
  { term: 'to unfollow', translation_ru: 'отписаться', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I unfollowed a few accounts to clean up my feed.', level: 'B1' },
  { term: 'a hashtag', translation_ru: 'хэштег', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'The hashtag started trending within hours.', level: 'B1' },
  { term: 'a feed', translation_ru: 'лента (новостей)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'My feed is full of ads lately.', level: 'B1' },
  { term: 'an algorithm', translation_ru: 'алгоритм', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'The algorithm decides what you see first.', level: 'B2' },
  { term: 'doomscrolling', translation_ru: 'бесконечный просмотр негативных новостей', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I caught myself doomscrolling again last night.', level: 'C1' },
  { term: 'a filter bubble', translation_ru: 'информационный пузырь', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Algorithms tend to create a filter bubble.', level: 'C1' },
  { term: 'clickbait', translation_ru: 'кликбейт', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: "That headline is pure clickbait.", level: 'B2' },
  { term: 'a troll', translation_ru: 'тролль (в интернете)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: "Don't feed the trolls.", level: 'B1' },
  { term: 'to troll', translation_ru: 'троллить кого-то', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'He was just trolling in the comments.', level: 'B1' },
  { term: 'cancel culture', translation_ru: 'культура отмены', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'They had a heated debate about cancel culture.', level: 'C1' },
  { term: 'to cancel someone', translation_ru: '"отменить" кого-то публично', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'The internet tried to cancel him over one tweet.', level: 'C1' },
  { term: 'a screenshot', translation_ru: 'скриншот', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Send me a screenshot of the error.', level: 'B1' },
  { term: 'to screenshot', translation_ru: 'сделать скриншот', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I screenshotted the whole conversation.', level: 'B1' },
  { term: 'a DM', translation_ru: 'личное сообщение', transcription: 'direct message', theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Just send me a DM.', level: 'B1' },
  { term: "to slide into someone's DMs", translation_ru: 'написать кому-то в личные сообщения (флиртуя)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'He slid into her DMs after the event.', level: 'C1' },
  { term: 'a meme', translation_ru: 'мем', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'He sends me a meme every morning.', level: 'B1' },
  { term: 'to go offline', translation_ru: 'быть офлайн, отключиться', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I need to go offline for the weekend.', level: 'B1' },
  { term: 'screen time', translation_ru: 'время у экрана', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: "I'm trying to cut down my screen time.", level: 'B2' },
  { term: 'digital detox', translation_ru: 'цифровой детокс', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'We did a digital detox on vacation.', level: 'B2' },
  { term: 'an influencer', translation_ru: 'инфлюенсер', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'She works with several influencers.', level: 'B1' },
  { term: 'content creator', translation_ru: 'создатель контента', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: "He's a full-time content creator now.", level: 'B1' },
  { term: 'to livestream', translation_ru: 'вести прямую трансляцию', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'We livestream every Friday night.', level: 'B1' },
  { term: 'a notification', translation_ru: 'уведомление', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I turned off notifications to focus.', level: 'B1' },
  { term: 'to mute', translation_ru: 'заглушить, отключить уведомления', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I muted that group chat.', level: 'B2' },
  { term: 'to block someone', translation_ru: 'заблокировать кого-то', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'She blocked him after the argument.', level: 'B1' },
  { term: 'FOMO', translation_ru: 'страх упустить что-то', transcription: 'fear of missing out', theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'I get FOMO every time I skip an event.', level: 'B2' },
  { term: 'an echo chamber', translation_ru: 'эхо-камера (пузырь единомышленников)', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Social media can become an echo chamber.', level: 'C1' },
  { term: 'to ghost someone', translation_ru: 'внезапно пропасть, прекратить общение без объяснений', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'He ghosted her after the third date.', level: 'B2' },
  { term: 'a group chat', translation_ru: 'групповой чат', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: "We planned the trip in the group chat.", level: 'B1' },
  { term: 'to go dark', translation_ru: 'пропасть из сети, перестать отвечать', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'He went dark for a whole week.', level: 'B2' },
  { term: 'digital footprint', translation_ru: 'цифровой след', transcription: null, theme: 'лексика соцсетей и цифровой коммуникации', example_sentence: 'Think about your digital footprint before posting.', level: 'B2' },

  // разговорные усилители и хеджирование
  { term: 'kind of', translation_ru: 'вроде, типа', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "I'm kind of tired today.", level: 'B1' },
  { term: 'sort of', translation_ru: 'вроде, отчасти', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'It sort of makes sense now.', level: 'B1' },
  { term: 'to some extent', translation_ru: 'в некоторой степени', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'To some extent, I agree with you.', level: 'B2' },
  { term: 'presumably', translation_ru: 'предположительно, по всей видимости', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'Presumably, the flight will be delayed again.', level: 'B2' },
  { term: 'more or less', translation_ru: 'более-менее', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "That's more or less what happened.", level: 'B1' },
  { term: 'at the end of the day', translation_ru: 'в конце концов, по сути', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "At the end of the day, it's your decision.", level: 'B2' },
  { term: 'I guess', translation_ru: 'наверное, пожалуй', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "I guess that could work.", level: 'B1' },
  { term: "I'd say", translation_ru: 'я бы сказал', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "I'd say we're about halfway done.", level: 'B1' },
  { term: 'if that makes sense', translation_ru: 'если это имеет смысл', transcription: 'после объяснения', theme: 'разговорные усилители и хеджирование', example_sentence: "It's more about tone, if that makes sense.", level: 'B2' },
  { term: 'to be fair', translation_ru: 'если честно, справедливости ради', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'To be fair, he did warn us.', level: 'B2' },
  { term: 'honestly', translation_ru: 'честно говоря', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "Honestly, I wasn't expecting that.", level: 'B1' },
  { term: 'technically', translation_ru: 'формально говоря', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "Technically, you're right, but it's not the point.", level: 'B2' },
  { term: 'basically', translation_ru: 'по сути, в основном', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "Basically, we're starting over.", level: 'B1' },
  { term: 'more of a... than a...', translation_ru: 'скорее... чем...', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "It's more of a suggestion than a rule.", level: 'B2' },
  { term: 'loosely speaking', translation_ru: 'вольно говоря, приблизительно', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'Loosely speaking, the two ideas are similar.', level: 'C1' },
  { term: "for what it's worth", translation_ru: 'как бы то ни было, на всякий случай скажу', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "For what it's worth, I think you did the right thing.", level: 'C1' },
  { term: 'if anything', translation_ru: 'если уж на то пошло', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'If anything, it got worse over time.', level: 'C1' },
  { term: 'by and large', translation_ru: 'в общем и целом', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'By and large, the feedback was positive.', level: 'C1' },
  { term: 'more often than not', translation_ru: 'чаще всего', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'More often than not, he arrives late.', level: 'B2' },
  { term: 'to a degree', translation_ru: 'до некоторой степени', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'That explanation works, to a degree.', level: 'B2' },
  { term: "I wouldn't go that far", translation_ru: 'я бы не стал заходить так далеко', transcription: 'мягкое несогласие', theme: 'разговорные усилители и хеджирование', example_sentence: "I wouldn't go that far, but I see your point.", level: 'C1' },
  { term: 'a gray area', translation_ru: 'спорная зона, неоднозначность', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "This policy is a bit of a gray area.", level: 'C1' },
  { term: 'give or take', translation_ru: 'плюс-минус, примерно', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "It'll take an hour, give or take.", level: 'B2' },
  { term: 'all things being equal', translation_ru: 'при прочих равных', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "All things being equal, I'd choose the cheaper option.", level: 'C1' },
  { term: 'in a manner of speaking', translation_ru: 'в каком-то смысле, образно говоря', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "It was a victory, in a manner of speaking.", level: 'C1' },
  { term: 'not necessarily', translation_ru: 'не обязательно', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: 'Not necessarily -- it depends on the context.', level: 'B1' },
  { term: 'as far as I can tell', translation_ru: 'насколько я могу судить', transcription: null, theme: 'разговорные усилители и хеджирование', example_sentence: "As far as I can tell, everything's working fine.", level: 'B2' },
  { term: 'fairly', translation_ru: 'довольно, весьма (смягчающий усилитель)', transcription: 'например: fairly confident', theme: 'разговорные усилители и хеджирование', example_sentence: "I'm fairly confident this will work.", level: 'B1' }
];

function seed() {
  const existsStmt = db.prepare('SELECT id FROM cards WHERE language = ? AND term = ?');
  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence, level, status)
     VALUES ('en', @term, @translation_ru, @transcription, @theme, @example_sentence, @level, 'backlog')`
  );

  const skipped = [];
  let inserted = 0;
  const insertAll = db.transaction((items) => {
    for (const card of items) {
      if (existsStmt.get('en', card.term)) {
        skipped.push(card.term);
        continue; // idempotent + dedup: skip if this term already exists (active/backlog/mastered)
      }
      insertCard.run({ ...card, transcription: card.transcription ?? null });
      inserted += 1;
    }
  });

  insertAll(EN_CARDS);
  console.log(`Inserted ${inserted} new English backlog cards (${EN_CARDS.length} candidates, ${skipped.length} already existed).`);
  if (skipped.length > 0) console.log('Skipped (already in DB):', skipped);

  const byLevel = db
    .prepare("SELECT level, COUNT(*) AS count FROM cards WHERE language = 'en' GROUP BY level ORDER BY level")
    .all();
  console.table(byLevel);
  console.log('Total en cards now:', db.prepare("SELECT COUNT(*) c FROM cards WHERE language = 'en'").get().c);
}

seed();
