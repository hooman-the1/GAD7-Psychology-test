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
  Gad7StorageDiagnostic,
  Gad7StorageStatus,
  inspectGad7AssessmentStorage,
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
  readonly status: Gad7StorageStatus | 'inaccessible';
  readonly diagnostic: Gad7StorageDiagnostic | null;
  readonly error: Gad7StorageDiagnostic | null;
  readonly rejectedRecordCount: number;
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
      const diagnostic: Gad7StorageDiagnostic = {
        code: 'storage-inaccessible',
        message: 'GAD-7 storage could not be read'
      };
      return { records: [], status: 'inaccessible', diagnostic, error: diagnostic, rejectedRecordCount: 0 };
    }

    if (serialized === null) {
      return { records: [], status: 'missing', diagnostic: null, error: null, rejectedRecordCount: 0 };
    }

    const inspected = inspectGad7AssessmentStorage(serialized);
    return {
      records: inspected.records,
      status: inspected.status,
      diagnostic: inspected.diagnostic,
      error: inspected.diagnostic,
      rejectedRecordCount: inspected.rejectedRecordCount
    };
  }

  save(answers: Gad7Answers, result: Gad7Interpretation): Gad7SaveResult {
    const loaded = this.load();
    if (loaded.status === 'inaccessible' || loaded.status === 'invalid' || loaded.status === 'unsupported') {
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
