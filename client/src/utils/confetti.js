import confetti from 'canvas-confetti';

export function celebrateLevelUp() {
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#818cf8', '#c4b5fd', '#f0abfc'] });
}

export function celebrateBadge() {
  confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 }, colors: ['#fbbf24', '#f59e0b', '#fde68a'] });
}
