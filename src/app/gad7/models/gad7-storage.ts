import { Gad7Answers, Gad7Interpretation } from '../gad7.helpers';

/** The only browser-storage namespace reserved for GAD-7 assessment history. */
export const GAD7_STORAGE_KEY = 'gad7.assessment-history';

/** Version of the persisted envelope understood by the current contract. */
export const GAD7_STORAGE_SCHEMA_VERSION = 1 as const;

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

/**
 * Converts a validated version-1 envelope to its storage representation.
 * No browser, Angular, HTTP, or environment dependency belongs at this edge.
 */
export function serializeGad7AssessmentEnvelope(
  envelope: Gad7AssessmentStorageEnvelope
): string {
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
  return JSON.parse(serialized) as Gad7AssessmentStorageEnvelope;
}
