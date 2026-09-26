import { Inject, Injectable, InjectionToken } from '@angular/core';

import {
  Gad7Answers,
  Gad7Interpretation
} from '../gad7.helpers';
import {
  GAD7_STORAGE_KEY,
  GAD7_STORAGE_SCHEMA_VERSION,
  Gad7AssessmentRecord,
  Gad7AssessmentStorageEnvelope,
  deserializeGad7AssessmentEnvelope,
  serializeGad7AssessmentEnvelope
} from '../models/gad7-storage';

export interface Gad7StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const GAD7_BROWSER_STORAGE = new InjectionToken<Gad7StorageLike>(
  'GAD7_BROWSER_STORAGE',
  { providedIn: 'root', factory: () => window.localStorage }
);

export interface Gad7LoadResult {
  readonly records: readonly Gad7AssessmentRecord[];
  readonly error: unknown | null;
}

export interface Gad7SaveResult {
  readonly success: boolean;
  readonly record?: Gad7AssessmentRecord;
  readonly error?: unknown;
}

let fallbackIdSequence = 0;

@Injectable({ providedIn: 'root' })
export class Gad7AssessmentPersistenceService {
  constructor(@Inject(GAD7_BROWSER_STORAGE) private readonly storage: Gad7StorageLike) {}

  load(): Gad7LoadResult {
    let serialized: string | null;
    try {
      serialized = this.storage.getItem(GAD7_STORAGE_KEY);
    } catch (error) {
      return { records: [], error };
    }

    if (serialized === null) {
      return { records: [], error: null };
    }

    try {
      return { records: deserializeGad7AssessmentEnvelope(serialized).records, error: null };
    } catch (error) {
      // Issue #13 owns malformed and older-data policy. Do not repair or rewrite it here.
      return { records: [], error };
    }
  }

  save(answers: Gad7Answers, result: Gad7Interpretation): Gad7SaveResult {
    const loaded = this.load();
    if (loaded.error !== null) {
      return { success: false, error: loaded.error };
    }

    const record: Gad7AssessmentRecord = {
      id: createRecordId(),
      completedAt: new Date().toISOString(),
      answers,
      score: result.score,
      category: result.category,
      result: cloneResult(result)
    };
    const envelope: Gad7AssessmentStorageEnvelope = {
      version: GAD7_STORAGE_SCHEMA_VERSION,
      records: [record, ...loaded.records]
    };

    try {
      this.storage.setItem(GAD7_STORAGE_KEY, serializeGad7AssessmentEnvelope(envelope));
      return { success: true, record };
    } catch (error) {
      return { success: false, error };
    }
  }
}

function createRecordId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid === 'function') {
    return `gad7-${randomUuid.call(globalThis.crypto)}`;
  }
  fallbackIdSequence += 1;
  return `gad7-${Date.now()}-${fallbackIdSequence}`;
}

function cloneResult(result: Gad7Interpretation): Gad7Interpretation {
  return {
    ...result,
    gauge: {
      ...result.gauge,
      marker: { ...result.gauge.marker }
    }
  };
}
