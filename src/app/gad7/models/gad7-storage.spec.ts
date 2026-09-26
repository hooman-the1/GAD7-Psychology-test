import {
  GAD7_STORAGE_KEY,
  GAD7_STORAGE_SCHEMA_VERSION,
  Gad7AssessmentRecord,
  Gad7AssessmentStorageEnvelope,
  deserializeGad7AssessmentEnvelope,
  serializeGad7AssessmentEnvelope
} from './gad7-storage';

describe('GAD-7 assessment storage contract', () => {
  const representativeRecord: Gad7AssessmentRecord = {
    id: 'gad7-2026-09-26T10:20:30.000Z-001',
    completedAt: '2026-09-26T10:20:30.000Z',
    answers: [3, 0, 2, 1, 0, 3, 1],
    score: 10,
    category: 'moderate',
    result: {
      score: 10,
      category: 'moderate',
      severity: 'اضطراب متوسط',
      recommendation: 'صحبت با یک روانشناس توصیه می‌شود.',
      warning: null,
      emoji: '🟠',
      gauge: {
        min: 0,
        max: 21,
        value: 10,
        color: '#fb8c00',
        marker: {
          color: '#fb8c00',
          type: 'triangle',
          size: 10,
          label: 'نمره شما'
        }
      }
    }
  };

  function envelope(record = representativeRecord): Gad7AssessmentStorageEnvelope {
    return {
      version: GAD7_STORAGE_SCHEMA_VERSION,
      records: [record]
    };
  }

  it('defines a GAD-7-specific key and numeric version one', () => {
    expect(GAD7_STORAGE_KEY).toBe('gad7.assessment-history');
    expect(GAD7_STORAGE_KEY).not.toContain('phq9');
    expect(GAD7_STORAGE_SCHEMA_VERSION).toBe(1);
  });

  it('serializes a representative record as a stable JSON envelope', () => {
    expect(serializeGad7AssessmentEnvelope(envelope())).toBe(JSON.stringify(envelope()));
  });

  it('preserves all-zero answers and a non-zero answer permutation', () => {
    const zeroRecord: Gad7AssessmentRecord = {
      ...representativeRecord,
      id: 'gad7-zero',
      answers: [0, 0, 0, 0, 0, 0, 0],
      score: 0,
      category: 'minimal',
      result: { ...representativeRecord.result, score: 0, category: 'minimal', emoji: '🟢' }
    };
    const permutationRecord: Gad7AssessmentRecord = {
      ...representativeRecord,
      id: 'gad7-permutation',
      answers: [1, 3, 0, 2, 1, 0, 2]
    };

    const parsed = deserializeGad7AssessmentEnvelope(
      serializeGad7AssessmentEnvelope({ version: 1, records: [zeroRecord, permutationRecord] })
    );

    expect(parsed.records.map((record) => record.answers)).toEqual([
      [0, 0, 0, 0, 0, 0, 0],
      [1, 3, 0, 2, 1, 0, 2]
    ]);
  });

  it('preserves Persian text and emoji through a round trip', () => {
    const parsed = deserializeGad7AssessmentEnvelope(
      serializeGad7AssessmentEnvelope(envelope())
    );

    expect(parsed.records[0].result.severity).toBe('اضطراب متوسط');
    expect(parsed.records[0].result.recommendation).toBe('صحبت با یک روانشناس توصیه می‌شود.');
    expect(parsed.records[0].result.emoji).toBe('🟠');
  });

  it('keeps the storage contract independent from Angular and copied application code', () => {
    const serialized = serializeGad7AssessmentEnvelope(envelope());

    expect(serialized).not.toContain('copied-from-main-repo');
    expect(serialized).not.toContain('phq9');
    expect(serialized).not.toContain('HttpClient');
    expect(serialized).not.toContain('SessionID');
    expect(serialized).not.toContain('localStorage');
  });
});
