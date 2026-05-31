// SM2 Spaced Repetition Algorithm
// Based on SuperMemo 2 algorithm by P.A. Wozniak

export interface SM2Data {
  easeFactor: number;  // >= 1.3, default 2.5
  interval: number;    // days between reviews
  repetitions: number; // consecutive correct answers
  nextReview: Date;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

/**
 * SM2 Algorithm implementation
 * quality: 0-5 rating (0=complete blackout, 5=perfect response)
 */
export function sm2(data: SM2Data, quality: number): SM2Result {
  let { easeFactor, interval, repetitions } = data;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}

/**
 * Calculate bonus points based on SM2 data
 * Higher ease factor and longer intervals = more bonus points
 */
export function calculateSM2Bonus(data: SM2Data): number {
  const basePoints = 1;
  const easeBonus = Math.floor((data.easeFactor - 1.3) * 2);
  const intervalBonus = Math.min(Math.floor(Math.log2(data.interval + 1)), 10);
  return basePoints + easeBonus + intervalBonus;
}

/**
 * Default SM2 data for new content
 */
export function defaultSM2Data(): SM2Data {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
  };
}
