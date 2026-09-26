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
