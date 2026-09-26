import {
  calculateGad7Score,
  getSeverityCategory,
  scoreGad7Answer
} from './gad7.helpers';

describe('GAD-7 scoring', () => {
  it('maps each answer choice to its matching point value', () => {
    expect(([0, 1, 2, 3] as const).map(scoreGad7Answer)).toEqual([0, 1, 2, 3]);
  });

  it('sums exactly seven answers and preserves the score for equivalent permutations', () => {
    const answers = [0, 1, 2, 3, 1, 2, 3] as const;

    expect(calculateGad7Score(answers)).toBe(12);
    expect(calculateGad7Score([3, 2, 1, 3, 2, 1, 0] as const)).toBe(12);
  });

  it('returns the minimum and maximum possible scores', () => {
    expect(calculateGad7Score([0, 0, 0, 0, 0, 0, 0])).toBe(0);
    expect(calculateGad7Score([3, 3, 3, 3, 3, 3, 3])).toBe(21);
  });

  it('classifies every severity boundary and representative interior total', () => {
    const expected: Array<[number, string]> = [
      [0, 'minimal'],
      [2, 'minimal'],
      [4, 'minimal'],
      [5, 'mild'],
      [7, 'mild'],
      [9, 'mild'],
      [10, 'moderate'],
      [12, 'moderate'],
      [14, 'moderate'],
      [15, 'moderately_severe'],
      [17, 'moderately_severe'],
      [19, 'moderately_severe'],
      [20, 'severe'],
      [21, 'severe']
    ];

    expected.forEach(([score, category]) => {
      expect(getSeverityCategory(score)).toBe(category);
    });
  });
});
