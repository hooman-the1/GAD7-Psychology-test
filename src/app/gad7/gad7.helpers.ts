import { SEVERITY_LEVELS, SeverityCategory } from './gad7.constants';

export type Gad7AnswerValue = 0 | 1 | 2 | 3;
export type Gad7Answers = readonly [
    Gad7AnswerValue,
    Gad7AnswerValue,
    Gad7AnswerValue,
    Gad7AnswerValue,
    Gad7AnswerValue,
    Gad7AnswerValue,
    Gad7AnswerValue
];

export interface Gad7GaugeConfiguration {
    min: 0;
    max: 21;
    value: number;
    color: string;
    marker: {
        color: string;
        type: 'triangle';
        size: 10;
        label: string;
    };
}

export interface Gad7Interpretation {
    score: number;
    category: SeverityCategory;
    severity: string;
    recommendation: string;
    warning: null;
    emoji: string;
    gauge: Gad7GaugeConfiguration;
}

export function scoreGad7Answer(answer: Gad7AnswerValue): number {
    switch (answer) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
    }
}

export function calculateGad7Score(answers: Gad7Answers): number {
    return answers.reduce<number>((total, answer) => total + scoreGad7Answer(answer), 0);
}

export function getSeverityCategory(score: number): SeverityCategory {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately_severe';
    return 'severe';
}

export function getSeverityText(category: SeverityCategory): string {
    return SEVERITY_LEVELS[category]?.severity || '';
}

export function getRecommendationText(category: SeverityCategory): string {
    return SEVERITY_LEVELS[category]?.recommendation || '';
}

export function getGaugeColor(category: SeverityCategory): string {
    return SEVERITY_LEVELS[category]?.gaugeColor || '#000000';
}

export function getEmojiIcon(category: SeverityCategory): string {
    return SEVERITY_LEVELS[category]?.emoji || '';
}

export function getGaugeMarkers(value: number, color: string) {
    return {
        [value]: {
            color,
            type: 'triangle',
            size: 10,
            label: 'نمره شما',
        }
    };
}

const INTERPRETATION_LEVELS = SEVERITY_LEVELS;

const INTERPRETATION_COLORS: Record<SeverityCategory, string> = {
    minimal: '#43a047',
    mild: '#fdd835',
    moderate: '#fb8c00',
    moderately_severe: '#e53935',
    severe: '#b71c1c'
};

export function getGad7Interpretation(score: number): Gad7Interpretation {
    if (!Number.isInteger(score) || score < 0 || score > 21) {
        throw new RangeError('score must be an integer from 0 through 21');
    }

    const category = getSeverityCategory(score);
    const color = INTERPRETATION_COLORS[category];
    const level = INTERPRETATION_LEVELS[category];

    return {
        score,
        category,
        severity: level.severity,
        recommendation: level.recommendation,
        warning: null,
        emoji: level.emoji,
        gauge: {
            min: 0,
            max: 21,
            value: score,
            color,
            marker: {
                color,
                type: 'triangle',
                size: 10,
                label: 'نمره شما'
            }
        }
    };
}
