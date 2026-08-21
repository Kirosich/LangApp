import { calculateLevel } from './calculate.js';

// Credits XP to the per-language stats row, additive alongside whatever
// already updates the old app-wide `user_stats` (id=1) -- callers do
// both, not one or the other, so nothing regresses while the new
// tracking accumulates. Every current XP-awarding code path (card
// review, card master, reading/dialogue/theory-topic "mark as read")
// already knows the language of the specific thing it's crediting, so
// this never has to guess.
export function creditLanguageXp(db, language, amount) {
  const stats = db.prepare('SELECT total_xp FROM user_stats_by_language WHERE language = ?').get(language);
  const newTotalXp = stats.total_xp + amount;
  const newLevel = calculateLevel(newTotalXp);
  db.prepare('UPDATE user_stats_by_language SET total_xp = ?, current_level = ? WHERE language = ?').run(
    newTotalXp,
    newLevel,
    language
  );
  return newTotalXp;
}
