import { db } from './db/index.js';

// Optional theme -> theory-reference-topic links (Stage 3 of the roadmap).
// Not every card theme needs one -- only pairs with a genuine grammar
// connection are linked, curated by hand rather than name-matched.
const LINKS = [
  { language: 'kz', theme: 'глаголы', topic_slug: 'kz-verb-tenses' },
  { language: 'kz', theme: 'глаголы движения', topic_slug: 'kz-verb-tenses' },
  { language: 'kz', theme: 'вопросительные слова', topic_slug: 'kz-question-particles' },
  { language: 'kz', theme: 'семья', topic_slug: 'kz-affixes-personal-possessive' },
  { language: 'kz', theme: 'покупки и деньги', topic_slug: 'kz-case-tabys' },
  { language: 'en', theme: 'карьера', topic_slug: 'en-phrasal-verbs-work' },
  { language: 'en', theme: 'синонимы', topic_slug: 'en-confused-word-pairs' }
];

const insert = db.prepare(
  `INSERT OR REPLACE INTO theory_theme_links (language, theme, topic_slug) VALUES (@language, @theme, @topic_slug)`
);

const insertAll = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertAll(LINKS);
console.log(`Linked ${LINKS.length} theme(s) to theory topics.`);
