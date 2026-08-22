import { parseAppSnapshot, type AppSnapshot } from './appSnapshot';
import { fingerprintAppSnapshot } from './syncSnapshotSerialization';

export interface SyncSnapshot {
  schemaVersion: 2;
  updatedAt: string;
  deviceId: string;
  fingerprint: string;
  data: AppSnapshot;
}

export type SyncSnapshotIntegrityReason =
  | 'invalid-envelope'
  | 'unsupported-schema'
  | 'invalid-data'
  | 'fingerprint-mismatch';

export class SyncSnapshotIntegrityError extends Error {
  readonly reason: SyncSnapshotIntegrityReason;

  constructor(reason: SyncSnapshotIntegrityReason, message: string) {
    super(message);
    this.name = 'SyncSnapshotIntegrityError';
    this.reason = reason;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && Number.isFinite(Date.parse(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}$/.test(value);
}

export function parseSyncSnapshot(value: unknown): SyncSnapshot {
  if (!isRecord(value)) {
    throw new SyncSnapshotIntegrityError(
      'invalid-envelope',
      'Tệp đồng bộ trên Google Drive không đúng định dạng BabyGrowth.',
    );
  }

  if (value.schemaVersion !== 2) {
    throw new SyncSnapshotIntegrityError(
      'unsupported-schema',
      'Tệp đồng bộ không thuộc persistence generation hiện tại của BabyGrowth.',
    );
  }

  if (!isValidTimestamp(value.updatedAt) || !isNonEmptyString(value.deviceId) || !isFingerprint(value.fingerprint)) {
    throw new SyncSnapshotIntegrityError(
      'invalid-envelope',
      'Metadata của tệp đồng bộ Google Drive bị hỏng hoặc không hợp lệ.',
    );
  }

  let data: AppSnapshot;
  try {
    data = parseAppSnapshot(value.data);
  } catch {
    throw new SyncSnapshotIntegrityError(
      'invalid-data',
      'Dữ liệu trong bản sao lưu Google Drive bị hỏng hoặc không hợp lệ.',
    );
  }

  const expectedFingerprint = fingerprintAppSnapshot(data);
  if (value.fingerprint !== expectedFingerprint) {
    throw new SyncSnapshotIntegrityError(
      'fingerprint-mismatch',
      'Bản sao lưu Google Drive không vượt qua kiểm tra toàn vẹn dữ liệu.',
    );
  }

  return {
    schemaVersion: 2,
    updatedAt: value.updatedAt,
    deviceId: value.deviceId,
    fingerprint: value.fingerprint,
    data,
  };
}
