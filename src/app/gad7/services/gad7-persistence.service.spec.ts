import { Gad7Interpretation, Gad7Answers } from '../gad7.helpers';
import {
  GAD7_STORAGE_KEY,
  GAD7_STORAGE_SCHEMA_VERSION,
  Gad7AssessmentRecord
} from '../models/gad7-storage';
import {
  Gad7AssessmentPersistenceService,
  Gad7StorageLike
} from './gad7-persistence.service';

describe('Gad7AssessmentPersistenceService', () => {
  let storage: MemoryStorage;
  let service: Gad7AssessmentPersistenceService;
  const answers = [3, 0, 2, 1, 0, 3, 1] as Gad7Answers;
  const result: Gad7Interpretation = {
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
      marker: { color: '#fb8c00', type: 'triangle', size: 10, label: 'نمره شما' }
    }
  };

  beforeEach(() => {
    storage = new MemoryStorage();
    service = new Gad7AssessmentPersistenceService(storage);
  });

  it('saves one completed record through the versioned GAD-7 envelope', () => {
    const outcome = service.save(answers, result);
    const record = outcome.record as Gad7AssessmentRecord;
    const stored = JSON.parse(storage.getItem(GAD7_STORAGE_KEY) as string);

    expect(outcome.success).toBeTrue();
    expect(record.answers).toEqual(answers);
    expect(record.score).toBe(10);
    expect(record.category).toBe('moderate');
    expect(new Date(record.completedAt).toISOString()).toBe(record.completedAt);
    expect(stored.version).toBe(GAD7_STORAGE_SCHEMA_VERSION);
    expect(stored.records).toEqual([record]);
  });

  it('loads empty storage without creating unrelated keys', () => {
    expect(service.load()).toEqual(jasmine.objectContaining({ records: [], status: 'missing', error: null }));
    expect(storage.keys()).toEqual([]);
  });

  it('reports malformed storage without overwriting the raw value', () => {
    const raw = '{not-json';
    storage.setItem(GAD7_STORAGE_KEY, raw);

    const outcome = service.load();

    expect(outcome.records).toEqual([]);
    expect(outcome.status).toBe('invalid');
    expect(outcome.diagnostic?.code).toBe('malformed-json');
    expect(storage.getItem(GAD7_STORAGE_KEY)).toBe(raw);
  });

  it('keeps recovered records available and preserves them on a later save', () => {
    const valid = service.save(answers, result).record as Gad7AssessmentRecord;
    storage.setItem(GAD7_STORAGE_KEY, JSON.stringify({
      version: 1,
      records: [valid, { ...valid, id: 7 }]
    }));

    const loaded = service.load();
    const saved = service.save(answers, result);
    const savedRecord = saved.record as Gad7AssessmentRecord;

    expect(loaded.status).toBe('recovered');
    expect(loaded.records.map((record) => record.id)).toEqual([valid.id]);
    expect(saved.success).toBeTrue();
    expect(service.load().records.map((record) => record.id)).toEqual([
      savedRecord.id,
      valid.id
    ]);
  });

  it('ignores unsupported versions and leaves their raw data untouched', () => {
    const raw = JSON.stringify({ version: 2, records: [] });
    storage.setItem(GAD7_STORAGE_KEY, raw);

    const outcome = service.load();

    expect(outcome.records).toEqual([]);
    expect(outcome.status).toBe('unsupported');
    expect(outcome.diagnostic?.code).toBe('unsupported-version');
    expect(storage.getItem(GAD7_STORAGE_KEY)).toBe(raw);
  });

  it('preserves multiple records newest first, including zero and maximum scores', () => {
    const zero = { ...result, score: 0, category: 'minimal' as const, gauge: { ...result.gauge, value: 0 } };
    const maximum = { ...result, score: 21, category: 'severe' as const, gauge: { ...result.gauge, value: 21 } };

    const first = service.save(answers, zero).record as Gad7AssessmentRecord;
    const second = service.save([3, 3, 3, 3, 3, 3, 3], maximum).record as Gad7AssessmentRecord;

    expect(service.load().records.map((record) => record.id)).toEqual([second.id, first.id]);
    expect(service.load().records.map((record) => record.score)).toEqual([21, 0]);
    expect(second.id).not.toBe(first.id);
  });

  it('reloads records from the same storage as a refresh or browser restart equivalent', () => {
    service.save(answers, result);
    const reloaded = new Gad7AssessmentPersistenceService(storage);

    expect(reloaded.load().records).toHaveSize(1);
    expect(reloaded.load().records[0].answers).toEqual(answers);
  });

  it('uses only the GAD-7 key and does not read unrelated storage', () => {
    storage.setItem('phq9.assessment-history', JSON.stringify({ records: [{ id: 'wrong' }] }));

    expect(service.load()).toEqual(jasmine.objectContaining({
      records: [],
      status: 'missing',
      error: null
    }));
    expect(storage.getItem(GAD7_STORAGE_KEY)).toBeNull();
  });

  it('returns a failure without replacing existing data when storage writes fail', () => {
    service.save(answers, result);
    const before = storage.getItem(GAD7_STORAGE_KEY);
    storage.failWrites = true;

    const outcome = service.save(answers, result);

    expect(outcome.success).toBeFalse();
    expect(outcome.record).toBeUndefined();
    expect(storage.getItem(GAD7_STORAGE_KEY)).toBe(before);
  });

  it('returns an empty collection when storage reads fail', () => {
    storage.failReads = true;

    expect(service.load()).toEqual(jasmine.objectContaining({ records: [] }));
    expect(service.load().error).toBeTruthy();
  });
});

class MemoryStorage implements Storage, Gad7StorageLike {
  private readonly values = new Map<string, string>();
  failReads = false;
  failWrites = false;

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null {
    if (this.failReads) throw new Error('read failed');
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('write failed');
    this.values.set(key, value);
  }
  keys(): string[] { return [...this.values.keys()]; }
}
