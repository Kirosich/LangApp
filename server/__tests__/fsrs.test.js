import { describe, it, expect } from 'vitest';
import { qualityToGrade, cardFromProgress, progressFieldsFromCard, nextReview } from '../srs/fsrs.js';

const NOW = new Date('2026-01-01T00:00:00Z');

describe('qualityToGrade', () => {
  it('maps the app\'s existing 1/3/4/5 quality buttons onto FSRS grades 1-4', () => {
    expect(qualityToGrade(1)).toBe(1); // Заново -> Again
    expect(qualityToGrade(3)).toBe(2); // Трудно -> Hard
    expect(qualityToGrade(4)).toBe(3); // Хорошо -> Good
    expect(qualityToGrade(5)).toBe(4); // Легко -> Easy
  });

  it('throws on a quality with no mapping', () => {
    expect(() => qualityToGrade(0)).toThrow();
    expect(() => qualityToGrade(2)).toThrow();
    expect(() => qualityToGrade(6)).toThrow();
  });
});

describe('nextReview', () => {
  it('a brand-new card (existingCard=null) schedules a short first interval, not months away', () => {
    const { card } = nextReview({ existingCard: null, quality: 4, now: NOW });
    const daysUntilDue = (card.due.getTime() - NOW.getTime()) / 86400000;
    expect(daysUntilDue).toBeGreaterThan(0);
    expect(daysUntilDue).toBeLessThan(7); // first-ever "Good" should not jump to weeks/months
    expect(card.reps).toBe(1);
    expect(card.lapses).toBe(0);
  });

  it('a fresh card rated Again (quality=1) stays short and does not count as a lapse yet', () => {
    const { card } = nextReview({ existingCard: null, quality: 1, now: NOW });
    const daysUntilDue = (card.due.getTime() - NOW.getTime()) / 86400000;
    expect(daysUntilDue).toBeLessThan(1); // due same day / minutes away, not tomorrow-plus
    expect(card.state).not.toBe(2); // not "Review" -- still in (re)learning
  });

  it('repeated Good ratings grow the interval each time (no ease-hell style permanent stall)', () => {
    let existingCard = null;
    let previousIntervalDays = 0;
    let now = NOW;
    let grew = 0;

    for (let i = 0; i < 6; i++) {
      const result = nextReview({ existingCard, quality: 4, now });
      const intervalDays = (result.card.due.getTime() - now.getTime()) / 86400000;
      if (intervalDays > previousIntervalDays) grew += 1;
      previousIntervalDays = intervalDays;
      existingCard = result.card;
      now = result.card.due; // simulate reviewing again exactly when due
    }

    expect(grew).toBeGreaterThanOrEqual(4); // most reviews in an all-"Good" streak should lengthen the interval
  });

  it('a mature card (5th rep, all Good) rated Easy does not fall back to a short interval', () => {
    let existingCard = null;
    let now = NOW;
    for (let i = 0; i < 4; i++) {
      const result = nextReview({ existingCard, quality: 4, now });
      existingCard = result.card;
      now = result.card.due;
    }
    const { card } = nextReview({ existingCard, quality: 5, now });
    const daysUntilDue = (card.due.getTime() - now.getTime()) / 86400000;
    expect(daysUntilDue).toBeGreaterThan(5); // "Easy" on an already-mature card should not be "tomorrow"
  });

  it('a lapse (Again on a Review-state card) increments lapses and drops back out of Review', () => {
    let existingCard = null;
    let now = NOW;
    for (let i = 0; i < 3; i++) {
      const result = nextReview({ existingCard, quality: 4, now });
      existingCard = result.card;
      now = result.card.due;
    }
    expect(existingCard.state).toBe(2); // Review, established

    const { card } = nextReview({ existingCard, quality: 1, now });
    expect(card.lapses).toBe(existingCard.lapses + 1);
    expect(card.state).toBe(3); // Relearning
  });

  it('higher request_retention schedules a shorter interval than the default for the same history', () => {
    const base = nextReview({ existingCard: null, quality: 4, now: NOW, requestRetention: 0.9 });
    const strict = nextReview({ existingCard: null, quality: 4, now: NOW, requestRetention: 0.97 });
    expect(strict.card.due.getTime()).toBeLessThanOrEqual(base.card.due.getTime());
  });

  it('reviewLog carries the FSRS grade and elapsed/scheduled days for review_log', () => {
    const { reviewLog } = nextReview({ existingCard: null, quality: 4, now: NOW });
    expect(reviewLog.rating).toBe(3); // Good
    expect(typeof reviewLog.elapsed_days).toBe('number');
    expect(typeof reviewLog.scheduled_days).toBe('number');
  });
});

describe('cardFromProgress / progressFieldsFromCard round-trip', () => {
  it('returns null for a progress row that has never been through FSRS', () => {
    expect(cardFromProgress({ fsrs_state: null })).toBeNull();
    expect(cardFromProgress(null)).toBeNull();
  });

  it('round-trips a card through progress columns and back without drift', () => {
    const { card } = nextReview({ existingCard: null, quality: 4, now: NOW });
    const row = progressFieldsFromCard(card);
    const restored = cardFromProgress(row);

    expect(restored.stability).toBe(card.stability);
    expect(restored.difficulty).toBe(card.difficulty);
    expect(restored.state).toBe(card.state);
    expect(restored.reps).toBe(card.reps);
    expect(restored.lapses).toBe(card.lapses);
    expect(restored.due.getTime()).toBe(card.due.getTime());
  });

  it('a restored card produces the same next review as continuing with the original in-memory card', () => {
    const { card: firstCard } = nextReview({ existingCard: null, quality: 4, now: NOW });
    const restored = cardFromProgress(progressFieldsFromCard(firstCard));

    const laterNow = new Date(firstCard.due.getTime());
    const fromOriginal = nextReview({ existingCard: firstCard, quality: 4, now: laterNow });
    const fromRestored = nextReview({ existingCard: restored, quality: 4, now: laterNow });

    expect(fromRestored.card.due.getTime()).toBe(fromOriginal.card.due.getTime());
    expect(fromRestored.card.stability).toBe(fromOriginal.card.stability);
  });
});
