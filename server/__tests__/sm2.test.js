import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '../srs/sm2.js';

const FRESH = { easiness_factor: 2.5, interval_days: 0, repetitions: 0 };
const NOW = new Date('2026-01-01T00:00:00Z');

describe('calculateNextReview (SM-2)', () => {
  it('first successful review sets interval to 1 day', () => {
    const result = calculateNextReview(FRESH, 4, NOW);
    expect(result.interval_days).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(result.due_date).toBe('2026-01-02');
  });

  it('second successful review sets interval to 6 days', () => {
    const afterFirst = calculateNextReview(FRESH, 4, NOW);
    const afterSecond = calculateNextReview(afterFirst, 4, NOW);
    expect(afterSecond.interval_days).toBe(6);
    expect(afterSecond.repetitions).toBe(2);
  });

  it('third+ successful review multiplies interval by easiness factor', () => {
    let progress = calculateNextReview(FRESH, 4, NOW);
    progress = calculateNextReview(progress, 4, NOW);
    const afterThird = calculateNextReview(progress, 4, NOW);
    expect(afterThird.interval_days).toBe(Math.round(6 * progress.easiness_factor));
    expect(afterThird.repetitions).toBe(3);
  });

  it('quality below 3 resets repetitions and interval to 1 day', () => {
    let progress = calculateNextReview(FRESH, 5, NOW);
    progress = calculateNextReview(progress, 5, NOW);
    const afterFail = calculateNextReview(progress, 1, NOW);
    expect(afterFail.repetitions).toBe(0);
    expect(afterFail.interval_days).toBe(1);
  });

  it('easiness factor never drops below 1.3', () => {
    let progress = FRESH;
    for (let i = 0; i < 10; i++) {
      progress = calculateNextReview(progress, 0, NOW);
    }
    expect(progress.easiness_factor).toBeGreaterThanOrEqual(1.3);
  });

  it('quality 5 increases easiness factor above default', () => {
    const result = calculateNextReview(FRESH, 5, NOW);
    expect(result.easiness_factor).toBeGreaterThan(2.5);
  });

  it('throws on out-of-range quality', () => {
    expect(() => calculateNextReview(FRESH, 6, NOW)).toThrow();
    expect(() => calculateNextReview(FRESH, -1, NOW)).toThrow();
  });

  it('caps the interval so many consecutive easy reviews never overflow Date', () => {
    let progress = FRESH;
    for (let i = 0; i < 40; i++) {
      progress = calculateNextReview(progress, 5, NOW);
    }
    expect(progress.interval_days).toBeLessThanOrEqual(3650);
    expect(() => new Date(progress.due_date)).not.toThrow();
    expect(Number.isNaN(new Date(progress.due_date).getTime())).toBe(false);
  });
});
