export type SeverityCategory = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

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
