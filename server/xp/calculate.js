export const STREAK_BONUS_XP = 20;

export function xpForReview(quality) {
  if (quality >= 5) return 10;
  if (quality === 4) return 7;
  if (quality === 3) return 3;
  return 1;
}

// Level 1 is free (the default starting level at 0 XP). The threshold to
// reach any level N >= 2 is round(100 * N^1.5) cumulative XP — this keeps
// early levels fast and later ones increasingly expensive.
export function xpThresholdForLevel(level) {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level, 1.5));
}

export function calculateLevel(totalXp) {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function xpToNextLevel(totalXp) {
  const level = calculateLevel(totalXp);
  return xpThresholdForLevel(level + 1) - totalXp;
}

export function progressPercentToNextLevel(totalXp) {
  const level = calculateLevel(totalXp);
  const currentThreshold = xpThresholdForLevel(level);
  const nextThreshold = xpThresholdForLevel(level + 1);
  const span = nextThreshold - currentThreshold;
  if (span <= 0) return 100;
  return Math.round(((totalXp - currentThreshold) / span) * 100);
}
