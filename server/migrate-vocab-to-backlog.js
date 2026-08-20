import { db } from './db/index.js';

// One-off data fix: the B2-C1/A1-A2 vocab batch (see seed-vocab-advanced.js)
// was seeded as immediately-active. Move the brand-new standalone themes
// into the backlog so they trickle in gradually instead of flooding the
// due queue. Themes that merged into pre-existing categories (бытовое,
// глаголы) and "эмоции" (kept active on purpose, to exercise the backlog
// mechanism end-to-end right away) are left untouched.
const THEMES_TO_BACKLOG = {
  en: ['синонимы', 'абстракции', 'деловая лексика', 'идиомы'],
  kz: ['семья', 'тело', 'дом', 'транспорт', 'профессии']
};

function run() {
  const selectIds = db.prepare(`SELECT id FROM cards WHERE language = ? AND theme = ? AND status = 'active'`);
  const clearProgress = db.prepare('DELETE FROM progress WHERE card_id = ?');
  const backlogCard = db.prepare(`UPDATE cards SET status = 'backlog', activated_at = NULL WHERE id = ?`);

  let total = 0;
  const migrate = db.transaction(() => {
    for (const [language, themes] of Object.entries(THEMES_TO_BACKLOG)) {
      for (const theme of themes) {
        const ids = selectIds.all(language, theme).map((r) => r.id);
        for (const id of ids) {
          clearProgress.run(id);
          backlogCard.run(id);
          total += 1;
        }
      }
    }
  });
  migrate();

  console.log(`Moved ${total} cards to backlog.`);
}

run();
