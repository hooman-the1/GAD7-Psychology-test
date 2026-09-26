import { Gad7Answers, Gad7Interpretation } from '../gad7.helpers';

/** The only browser-storage namespace reserved for GAD-7 assessment history. */
export const GAD7_STORAGE_KEY = 'gad7.assessment-history';

/** Version of the persisted envelope understood by the current contract. */
export const GAD7_STORAGE_SCHEMA_VERSION = 1 as const;

const GAD7_MIN_SCORE = 0;
const GAD7_MAX_SCORE = 21;
const INVALID_GAD7_SCORE_MESSAGE =
  'GAD-7 score must be an integer between 0 and 21';

/** A completed result copied at submission time for read-only display. */
export type Gad7ResultSnapshot = Gad7Interpretation;

export interface Gad7AssessmentRecord {
  readonly id: string;
  /** UTC ISO-8601 timestamp, including the trailing Z timezone designator. */
  readonly completedAt: string;
  readonly answers: Gad7Answers;
  readonly score: number;
  readonly category: Gad7ResultSnapshot['category'];
  readonly result: Gad7ResultSnapshot;
}

export interface Gad7AssessmentStorageEnvelope {
  readonly version: typeof GAD7_STORAGE_SCHEMA_VERSION;
  readonly records: readonly Gad7AssessmentRecord[];
}

export type Gad7StorageStatus =
  | 'valid'
  | 'recovered'
  | 'missing'
  | 'invalid'
  | 'unsupported';

export type Gad7StorageDiagnosticCode =
  | 'malformed-json'
  | 'invalid-envelope'
  | 'invalid-records'
  | 'unsupported-version'
  | 'storage-inaccessible';

export interface Gad7StorageDiagnostic {
  readonly code: Gad7StorageDiagnosticCode;
  readonly message: string;
}

export interface Gad7StorageInspection {
  readonly records: readonly Gad7AssessmentRecord[];
  readonly status: Gad7StorageStatus;
  readonly diagnostic: Gad7StorageDiagnostic | null;
  readonly rejectedRecordCount: number;
}

/**
 * Converts a validated version-1 envelope to its storage representation.
 * No browser, Angular, HTTP, or environment dependency belongs at this edge.
 */
export function serializeGad7AssessmentEnvelope(
  envelope: Gad7AssessmentStorageEnvelope
): string {
  envelope.records.forEach((record) => validateGad7Score(record.score));
  return JSON.stringify(envelope);
}

/**
 * Converts the JSON boundary back to the version-1 contract shape.
 *
 * Structural validation, malformed-input recovery, and version migration are
 * deliberately owned by Issue #13. Callers must treat this as a boundary
 * conversion for data that has already passed that policy.
 */
export function deserializeGad7AssessmentEnvelope(
  serialized: string
): Gad7AssessmentStorageEnvelope {
  const inspected = inspectGad7AssessmentStorage(serialized);
  if (inspected.status !== 'valid') {
    throw new TypeError(inspected.diagnostic?.message ?? 'Invalid GAD-7 storage data');
  }
  return {
    version: GAD7_STORAGE_SCHEMA_VERSION,
    records: inspected.records
  };
}

/**
 * Safely inspects untrusted browser-storage text. Version 1 is the only
 * recognized schema; undefined legacy formats and future versions are kept
 * untouched by the persistence service and are intentionally not guessed.
 */
export function inspectGad7AssessmentStorage(serialized: string): Gad7StorageInspection {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    return inspection([], 'invalid', diagnostic('malformed-json'), 0);
  }

  if (!isRecord(parsed) || Array.isArray(parsed) || typeof parsed.version !== 'number') {
    return inspection([], 'invalid', diagnostic('invalid-envelope'), 0);
  }

  if (parsed.version !== GAD7_STORAGE_SCHEMA_VERSION) {
    return inspection([], 'unsupported', diagnostic('unsupported-version'), 0);
  }

  if (!Array.isArray(parsed.records)) {
    return inspection([], 'invalid', diagnostic('invalid-envelope'), 0);
  }

  const records: Gad7AssessmentRecord[] = [];
  for (const candidate of parsed.records) {
    if (isValidGad7AssessmentRecord(candidate)) {
      records.push(candidate);
    }
  }

  const rejectedRecordCount = parsed.records.length - records.length;
  if (rejectedRecordCount > 0) {
    return inspection(
      records,
      records.length > 0 ? 'recovered' : 'invalid',
      diagnostic('invalid-records'),
      rejectedRecordCount
    );
  }

  return inspection(records, 'valid', null, 0);
}

function validateGad7Score(score: number): void {
  if (!Number.isInteger(score) || score < GAD7_MIN_SCORE || score > GAD7_MAX_SCORE) {
    throw new RangeError(INVALID_GAD7_SCORE_MESSAGE);
  }
}

function inspection(
  records: readonly Gad7AssessmentRecord[],
  status: Gad7StorageStatus,
  diagnosticValue: Gad7StorageDiagnostic | null,
  rejectedRecordCount: number
): Gad7StorageInspection {
  return { records, status, diagnostic: diagnosticValue, rejectedRecordCount };
}

function diagnostic(code: Gad7StorageDiagnosticCode): Gad7StorageDiagnostic {
  const messages: Record<Gad7StorageDiagnosticCode, string> = {
    'malformed-json': 'GAD-7 storage contains malformed JSON',
    'invalid-envelope': 'GAD-7 storage envelope is invalid',
    'invalid-records': 'GAD-7 storage contains invalid records',
    'unsupported-version': 'GAD-7 storage version is unsupported',
    'storage-inaccessible': 'GAD-7 storage could not be read'
  };
  return { code, message: messages[code] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidGad7AssessmentRecord(value: unknown): value is Gad7AssessmentRecord {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  if (!isIsoTimestamp(value.completedAt)) return false;
  if (!isGad7Answers(value.answers)) return false;
  if (!isValidScore(value.score)) return false;
  if (!isSeverityCategory(value.category)) return false;
  return isValidResult(value.result);
}

function isGad7Answers(value: unknown): value is Gad7Answers {
  return Array.isArray(value)
    && value.length === 7
    && value.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3);
}

function isValidScore(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isInteger(value)
    && value >= GAD7_MIN_SCORE
    && value <= GAD7_MAX_SCORE;
}

function isSeverityCategory(value: unknown): value is Gad7ResultSnapshot['category'] {
  return value === 'minimal'
    || value === 'mild'
    || value === 'moderate'
    || value === 'moderately_severe'
    || value === 'severe';
}

function isValidResult(value: unknown): value is Gad7ResultSnapshot {
  if (!isRecord(value)
    || !isValidScore(value.score)
    || !isSeverityCategory(value.category)
    || typeof value.severity !== 'string'
    || value.severity.length === 0
    || typeof value.recommendation !== 'string'
    || value.recommendation.length === 0
    || value.warning !== null
    || typeof value.emoji !== 'string'
    || value.emoji.length === 0
    || !isRecord(value.gauge)) {
    return false;
  }

  const gauge = value.gauge;
  if (gauge.min !== 0 || gauge.max !== 21 || !isValidScore(gauge.value)
    || typeof gauge.color !== 'string' || gauge.color.length === 0
    || !isRecord(gauge.marker)) {
    return false;
  }

  const marker = gauge.marker;
  return typeof marker.color === 'string'
    && marker.color.length > 0
    && marker.type === 'triangle'
    && marker.size === 10
    && typeof marker.label === 'string'
    && marker.label.length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}
