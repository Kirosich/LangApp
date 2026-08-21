// Movies/series section, first batch: Inception (Nolan) and Snatch (Guy
// Ritchie) -- picked per the user's stated taste, not invented. Both
// anchor the English track (natural fit, English-language originals).
//
// Copyright boundary (see CLAUDE.md): media_entries below store only
// factual metadata (title/year/genre/one-line setting) -- nothing here
// summarizes the plot scene-by-scene or quotes dialogue. media_texts are
// 100% original short stories "in the spirit of" the genre/premise, with
// invented character names (Maren/Denny/Vic, not Cobb/Turkish/Tommy) and
// no retelling of actual film events.
import { db } from './db/index.js';

const ENTRIES = [
  {
    title: 'Inception',
    type: 'movie',
    year: 2010,
    genre: 'sci-fi heist thriller',
    language_focus: 'en',
    one_line_theme:
      "A team of thieves who extract secrets from people's subconscious through shared dreaming take on a job to plant an idea instead of stealing one.",
    new_cards: [
      { term: 'subconscious', translation_ru: 'подсознание', transcription: null, theme: 'кино и медиа', example_sentence: 'The idea took root in his subconscious.', level: 'C1' },
      { term: 'an extraction', translation_ru: 'изъятие, похищение (информации/идеи)', transcription: 'в переносном смысле, не только медицинском', theme: 'кино и медиа', example_sentence: 'The team specializes in extraction, not implantation.', level: 'C1' },
      { term: 'to plant an idea', translation_ru: 'внедрить идею (кому-то в голову)', transcription: null, theme: 'кино и медиа', example_sentence: "It's nearly impossible to plant an idea convincingly.", level: 'C1' },
      { term: 'a heist', translation_ru: 'ограбление, дерзкая операция', transcription: null, theme: 'кино и медиа', example_sentence: 'They planned the heist for months.', level: 'B2' },
      { term: 'layered', translation_ru: 'многослойный (и в переносном смысле)', transcription: null, theme: 'кино и медиа', example_sentence: 'The story felt layered, with meaning hidden beneath meaning.', level: 'C1' },
      { term: 'a catalyst', translation_ru: 'катализатор, толчок к событиям', transcription: null, theme: 'кино и медиа', example_sentence: 'One small choice became the catalyst for everything that followed.', level: 'C1' },
      { term: 'disorienting', translation_ru: 'дезориентирующий', transcription: null, theme: 'кино и медиа', example_sentence: 'The shifting gravity made the scene disorienting to watch.', level: 'C1' },
      { term: 'to blur the line between', translation_ru: 'стирать грань между', transcription: null, theme: 'кино и медиа', example_sentence: 'The film blurs the line between dream and reality.', level: 'C1' }
    ],
    linked_terms: ['premise', 'notion', 'ambiguous', 'subtle', 'plausible'],
    texts: [
      {
        title: "The Architect's Last Job",
        level: 'C1',
        body: `Maren had built dreams for eleven years, but this job felt different. The client wasn't paying her to steal a secret — he wanted her to leave one behind, buried so deep the target would believe it was his own idea.

The team gathered in a rented warehouse outside the city. A chemist mixed the sedative. A forger sketched faces the dream would need. Maren studied the blueprints one last time: three layers, each one further from waking than the last.

"Once we're under," she said, "time moves differently down there. What feels like an hour up here could feel like a week where we're going."

Nobody answered. They'd all done this enough times to know the real risk wasn't the dream itself — it was forgetting which layer was real once you surfaced.

The chemist started the drip. The room dimmed at the edges, the way it always did just before the world folded in on itself.

"See you on the other side," Maren whispered, and let the dream take her.`,
        questions: [
          { prompt: "What is the team's job in this story?", correct_answer: "To plant an idea in someone's mind through a dream, not steal one", distractors: ['To steal a physical object from a vault', 'To wake someone from a coma', "To erase someone's memory entirely"] },
          { prompt: 'How many layers does the dream have?', correct_answer: 'Three', distractors: ['One', 'Two', 'Five'] },
          { prompt: 'According to Maren, what is the real risk of the job?', correct_answer: 'Forgetting which layer is real after waking up', distractors: ['Running out of sedative', 'Being caught by the police', 'The client not paying them'] },
          { prompt: 'What does the chemist do at the start of the operation?', correct_answer: 'Starts the drip (administers the sedative)', distractors: ["Sketches the target's face", 'Studies the blueprints', 'Leaves the warehouse'] }
        ]
      }
    ]
  },
  {
    title: 'Snatch',
    type: 'movie',
    year: 2000,
    genre: 'crime comedy caper',
    language_focus: 'en',
    one_line_theme:
      "A chaotic web of boxing promoters, diamond smugglers, and small-time crooks collide across London's criminal underworld.",
    new_cards: [
      { term: 'a con artist', translation_ru: 'мошенник, аферист', transcription: null, theme: 'кино и медиа', example_sentence: 'He was a con artist who could talk his way out of anything.', level: 'C1' },
      { term: 'to double-cross', translation_ru: 'обмануть, «кинуть» сообщника', transcription: null, theme: 'кино и медиа', example_sentence: 'Everyone in this business is one deal away from being double-crossed.', level: 'C1' },
      { term: 'shady', translation_ru: 'подозрительный, тёмный (о делах/людях)', transcription: null, theme: 'кино и медиа', example_sentence: 'The whole deal sounded shady from the start.', level: 'B2' },
      { term: 'a middleman', translation_ru: 'посредник', transcription: null, theme: 'кино и медиа', example_sentence: 'Nobody trusted the middleman, but everyone needed him.', level: 'B2' },
      { term: 'to pull off', translation_ru: 'провернуть (дело)', transcription: null, theme: 'кино и медиа', example_sentence: 'Pulling off a job like that takes nerve.', level: 'B2' },
      { term: 'a small-time crook', translation_ru: 'мелкий жулик', transcription: null, theme: 'кино и медиа', example_sentence: 'He was just a small-time crook looking for one big score.', level: 'C1' },
      { term: 'to be in over one’s head', translation_ru: 'оказаться втянутым не по силам', transcription: null, theme: 'кино и медиа', example_sentence: 'By the second day, he was clearly in over his head.', level: 'C1' },
      { term: 'a loose end', translation_ru: 'незавершённое дело, опасная зацепка', transcription: null, theme: 'кино и медиа', example_sentence: 'There was one loose end nobody wanted to deal with.', level: 'C1' }
    ],
    linked_terms: ['to turn a blind eye', 'to be on thin ice', 'at the end of the day', 'to be a double whammy'],
    texts: [
      {
        title: 'The Lock-Up on Cobalt Street',
        level: 'C1',
        body: `Denny ran the lock-up on Cobalt Street the way other men ran a corner shop — regular hours, familiar faces, and absolutely no questions about what was inside the crates.

That Tuesday, a middleman named Vic showed up with a proposition. Something valuable had gone missing from the wrong people, and it was, allegedly, sitting in a duffel bag somewhere in Denny's neighborhood. Vic wanted help finding it before anyone else did.

"Everyone's looking for the same bag," Vic said, "and half of them are lying about why."

Denny had been around long enough to know that in this business, nobody told you the whole truth up front — you found out the real story once you were already in over your head. Still, curiosity was a dangerous habit, and Denny had never quite managed to break it.

By Thursday, three separate crews had asked him the same question, each one convinced the others were trying to double-cross them. Denny just kept his lock-up open, his mouth shut, and his eyes on the door.

Some loose ends, he figured, were better left alone.`,
        questions: [
          { prompt: 'What does Denny run on Cobalt Street?', correct_answer: 'A lock-up (storage garage)', distractors: ['A corner shop', 'A boxing gym', 'A pawn shop'] },
          { prompt: 'What does Vic ask Denny for help with?', correct_answer: 'Finding a missing bag of something valuable', distractors: ['Fixing a boxing match', 'Smuggling diamonds across the border', 'Collecting a debt'] },
          { prompt: 'How many crews ask Denny about the same thing by Thursday?', correct_answer: 'Three', distractors: ['One', 'Two', 'Five'] },
          { prompt: 'What does Denny decide to do at the end?', correct_answer: 'Stay quiet and mind his own business', distractors: ['Join one of the crews', 'Call the police', 'Try to find the bag himself'] }
        ]
      }
    ]
  }
];

function seed() {
  const existsEntry = db.prepare('SELECT id FROM media_entries WHERE title = ?');
  const insertEntry = db.prepare(
    `INSERT INTO media_entries (title, type, year, genre, language_focus, one_line_theme)
     VALUES (@title, @type, @year, @genre, @language_focus, @one_line_theme)`
  );
  const existsCard = db.prepare('SELECT id FROM cards WHERE language = ? AND term = ?');
  const insertCard = db.prepare(
    `INSERT INTO cards (language, term, translation_ru, transcription, theme, example_sentence, level, status)
     VALUES ('en', @term, @translation_ru, @transcription, @theme, @example_sentence, @level, 'backlog')`
  );
  const linkVocab = db.prepare('INSERT OR IGNORE INTO media_vocab_links (media_entry_id, card_id) VALUES (?, ?)');
  const insertText = db.prepare(
    `INSERT INTO media_texts (media_entry_id, title, level, body, comprehension_questions, order_index)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  let entriesInserted = 0;
  let cardsInserted = 0;

  const run = db.transaction(() => {
    for (const entry of ENTRIES) {
      if (existsEntry.get(entry.title)) {
        console.log(`Skipping "${entry.title}" -- already exists.`);
        continue;
      }

      const entryInfo = insertEntry.run(entry);
      const entryId = entryInfo.lastInsertRowid;
      entriesInserted += 1;

      for (const card of entry.new_cards) {
        let cardId;
        const existing = existsCard.get('en', card.term);
        if (existing) {
          cardId = existing.id;
        } else {
          const cardInfo = insertCard.run({ ...card, transcription: card.transcription ?? null });
          cardId = cardInfo.lastInsertRowid;
          cardsInserted += 1;
        }
        linkVocab.run(entryId, cardId);
      }

      for (const linkedTerm of entry.linked_terms) {
        const existing = existsCard.get('en', linkedTerm);
        if (existing) linkVocab.run(entryId, existing.id);
        else console.log(`WARNING: linked term not found: ${linkedTerm}`);
      }

      entry.texts.forEach((text, i) => {
        insertText.run(entryId, text.title, text.level, text.body, JSON.stringify(text.questions), i);
      });
    }
  });

  run();

  console.log(`Inserted ${entriesInserted} media entries, ${cardsInserted} new vocab cards.`);
  console.table(
    db
      .prepare(
        `SELECT m.id, m.title, m.language_focus,
                (SELECT COUNT(*) FROM media_vocab_links v WHERE v.media_entry_id = m.id) AS vocab,
                (SELECT COUNT(*) FROM media_texts t WHERE t.media_entry_id = m.id) AS texts
         FROM media_entries m`
      )
      .all()
  );
}

seed();
