import {
  calculateGad7Score,
  getGad7Interpretation,
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

  it('returns complete deterministic interpretations for every band and boundary', () => {
    const expected = [
      [0, 'minimal', 'کمترین اضطراب', 'نیازی به اقدام خاصی نیست، اما مراقب حال خود باشید.', '😊', '#43a047'],
      [2, 'minimal', 'کمترین اضطراب', 'نیازی به اقدام خاصی نیست، اما مراقب حال خود باشید.', '😊', '#43a047'],
      [4, 'minimal', 'کمترین اضطراب', 'نیازی به اقدام خاصی نیست، اما مراقب حال خود باشید.', '😊', '#43a047'],
      [5, 'mild', 'اضطراب خفیف', 'تغییرات خلق و خوی خود را زیر نظر داشته باشید و در صورت نیاز با یک مشاور صحبت کنید.', '🙂', '#fdd835'],
      [7, 'mild', 'اضطراب خفیف', 'تغییرات خلق و خوی خود را زیر نظر داشته باشید و در صورت نیاز با یک مشاور صحبت کنید.', '🙂', '#fdd835'],
      [9, 'mild', 'اضطراب خفیف', 'تغییرات خلق و خوی خود را زیر نظر داشته باشید و در صورت نیاز با یک مشاور صحبت کنید.', '🙂', '#fdd835'],
      [10, 'moderate', 'اضطراب متوسط', 'صحبت با یک روانشناس توصیه می‌شود.', '😐', '#fb8c00'],
      [12, 'moderate', 'اضطراب متوسط', 'صحبت با یک روانشناس توصیه می‌شود.', '😐', '#fb8c00'],
      [14, 'moderate', 'اضطراب متوسط', 'صحبت با یک روانشناس توصیه می‌شود.', '😐', '#fb8c00'],
      [15, 'moderately_severe', 'اضطراب نسبتاً شدید', 'به شدت توصیه می‌شود از یک متخصص سلامت روان کمک بگیرید.', '😟', '#e53935'],
      [17, 'moderately_severe', 'اضطراب نسبتاً شدید', 'به شدت توصیه می‌شود از یک متخصص سلامت روان کمک بگیرید.', '😟', '#e53935'],
      [19, 'moderately_severe', 'اضطراب نسبتاً شدید', 'به شدت توصیه می‌شود از یک متخصص سلامت روان کمک بگیرید.', '😟', '#e53935'],
      [20, 'severe', 'اضطراب شدید', 'نیاز فوری به مداخله تخصصی روانشناسی یا روانپزشکی وجود دارد.', '😞', '#b71c1c'],
      [21, 'severe', 'اضطراب شدید', 'نیاز فوری به مداخله تخصصی روانشناسی یا روانپزشکی وجود دارد.', '😞', '#b71c1c']
    ] as const;

    expected.forEach(([score, category, severity, recommendation, emoji, color]) => {
      const result = getGad7Interpretation(score);

      expect(result).toEqual(jasmine.objectContaining({
        score,
        category,
        severity,
        recommendation,
        warning: null,
        emoji,
        gauge: {
          min: 0,
          max: 21,
          value: score,
          color,
          marker: jasmine.objectContaining({ color })
        }
      }));
      expect(getGad7Interpretation(score)).toEqual(result);
    });
  });

  it('rejects invalid, fractional, and out-of-range scores explicitly', () => {
    [-1, 22, 1.5, Number.NaN, Number.POSITIVE_INFINITY].forEach((score) => {
      expect(() => getGad7Interpretation(score)).toThrowError(/score must be an integer from 0 through 21/);
    });
  });
});
