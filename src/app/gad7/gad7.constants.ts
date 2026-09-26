export type SeverityCategory = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

export interface Gad7AnswerOption {
    value: 0 | 1 | 2 | 3;
    label: string;
}

export interface Gad7Question {
    prompt: string;
    options: Gad7AnswerOption[];
}

export const SEVERITY_LEVELS: Record<SeverityCategory, {
    severity: string;
    recommendation: string;
    gaugeColor: string;
    emoji: string;
}> = {
    minimal: {
        severity: 'کمترین اضطراب',
        recommendation: 'نیازی به اقدام خاصی نیست، اما مراقب حال خود باشید.',
        gaugeColor: '#43a047',
        emoji: '😊',
    },
    mild: {
        severity: 'اضطراب خفیف',
        recommendation: 'تغییرات خلق و خوی خود را زیر نظر داشته باشید و در صورت نیاز با یک مشاور صحبت کنید.',
        gaugeColor: '#fdd835',
        emoji: '🙂',
    },
    moderate: {
        severity: 'اضطراب متوسط',
        recommendation: 'صحبت با یک روانشناس توصیه می‌شود.',
        gaugeColor: '#fb8c00',
        emoji: '😐',
    },
    moderately_severe: {
        severity: 'اضطراب نسبتاً شدید',
        recommendation: 'به شدت توصیه می‌شود از یک متخصص سلامت روان کمک بگیرید.',
        gaugeColor: '#e53935',
        emoji: '😟',
    },
    severe: {
        severity: 'اضطراب شدید',
        recommendation: 'نیاز فوری به مداخله تخصصی روانشناسی یا روانپزشکی وجود دارد.',
        gaugeColor: '#b71c1c',
        emoji: '😞',
    }
};

export const questions: string[] = [
    'چند روز احساس نگرانی، عصبی بودن یا بی‌قراری داشته‌اید؟',
    'چند روز حس کردید که نمی‌توانید نگرانی و ترس خود را کنترل کنید؟',
    'چند روز برایتان سخت بوده است که آرام و بی‌تنش باشید؟',
    'چند روز حس کردید که نمیتوانید به موضوعات توجه کافی داشته باشید؟',
    'چند روز بی‌قراری مداوم حس کرده‌اید؟',
    'چند روز بدون دلیل خسته بوده‌اید؟',
    'چند روز ناگهانی و بی‌دلیل وجودتان پر از ترس شده؟'
];

export const answerOptions: Gad7AnswerOption[] = [
    { value: 0, label: '\u0627\u0635\u0644\u0627 \u062a\u062c\u0631\u0628\u0647 \u0646\u06a9\u0631\u062f\u0645' },
    { value: 1, label: '\u0686\u0646\u062f \u0631\u0648\u0632 \u062f\u0631 \u062f\u0648 \u0647\u0641\u062a\u0647 \u06af\u0630\u0634\u062a\u0647 \u062a\u062c\u0631\u0628\u0647 \u06a9\u0631\u062f\u0645' },
    { value: 2, label: '\u0628\u06cc\u0634\u062a\u0631 \u0627\u0632 \u06cc\u06a9 \u0647\u0641\u062a\u0647 \u062a\u062c\u0631\u0628\u0647 \u06a9\u0631\u062f\u0645' },
    { value: 3, label: '\u062a\u0642\u0631\u06cc\u0628\u0627 \u0647\u0631 \u0631\u0648\u0632 \u062a\u062c\u0631\u0628\u0647 \u06a9\u0631\u062f\u0645' }
];

export const questionEntries: Gad7Question[] = questions.map((prompt) => ({
    prompt,
    options: answerOptions
}));
