import { describe, it, expect } from 'vitest';
import { xpForReview, xpThresholdForLevel, calculateLevel, xpToNextLevel, progressPercentToNextLevel } from './calculate.js';

describe('xpForReview', () => {
  it('awards 10 XP for quality 5', () => expect(xpForReview(5)).toBe(10));
  it('awards 7 XP for quality 4', () => expect(xpForReview(4)).toBe(7));
  it('awards 3 XP for quality 3', () => expect(xpForReview(3)).toBe(3));
  it('awards 1 XP for quality below 3 (no penalty)', () => {
    expect(xpForReview(2)).toBe(1);
    expect(xpForReview(0)).toBe(1);
  });
});

describe('level curve', () => {
  it('level 1 requires 0 XP', () => expect(xpThresholdForLevel(1)).toBe(0));
  it('the XP gap between consecutive levels keeps growing', () => {
    const t2 = xpThresholdForLevel(2);
    const t3 = xpThresholdForLevel(3);
    const t4 = xpThresholdForLevel(4);
    const t5 = xpThresholdForLevel(5);
    expect(t3 - t2).toBeGreaterThan(0);
    expect(t4 - t3).toBeGreaterThan(t3 - t2);
    expect(t5 - t4).toBeGreaterThan(t4 - t3);
  });

  it('calculateLevel stays at 1 below the level-2 threshold', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(xpThresholdForLevel(2) - 1)).toBe(1);
  });

  it('calculateLevel advances exactly at a threshold', () => {
    expect(calculateLevel(xpThresholdForLevel(2))).toBe(2);
    expect(calculateLevel(xpThresholdForLevel(5))).toBe(5);
  });

  it('xpToNextLevel counts down to 0 right at the threshold', () => {
    expect(xpToNextLevel(xpThresholdForLevel(2) - 5)).toBe(5);
    expect(xpToNextLevel(xpThresholdForLevel(2))).toBe(xpThresholdForLevel(3) - xpThresholdForLevel(2));
  });

  it('progressPercentToNextLevel is 0 right after leveling and near 100 right before', () => {
    expect(progressPercentToNextLevel(xpThresholdForLevel(3))).toBe(0);
    const almostThere = progressPercentToNextLevel(xpThresholdForLevel(4) - 1);
    expect(almostThere).toBeGreaterThanOrEqual(99);
    expect(almostThere).toBeLessThanOrEqual(100);
  });
});
