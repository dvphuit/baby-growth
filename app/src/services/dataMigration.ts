import { getLocalRecord, setLocalRecord } from './localDb';

const MIGRATION_KEY = 'babygrowth_v3_migration';
const MIGRATION_VERSION = 1;

export interface MigrationResult {
  migrated: boolean;
  version: number;
}

/**
 * V3 intentionally does not transform legacy timeline/chat seed content into
 * activity records. Legacy v2 stores remain untouched so existing profile,
 * growth, pumping and expense data can still be read by their current stores.
 */
export async function runDataMigration(): Promise<MigrationResult> {
  const raw = await getLocalRecord(MIGRATION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { version?: number };
      if ((parsed.version ?? 0) >= MIGRATION_VERSION) {
        return { migrated: false, version: parsed.version ?? MIGRATION_VERSION };
      }
    } catch {
      // Replace malformed marker only; never alter user domain records here.
    }
  }

  await setLocalRecord(MIGRATION_KEY, JSON.stringify({
    version: MIGRATION_VERSION,
    migratedAt: new Date().toISOString(),
    policy: 'non-destructive-no-demo-conversion',
  }));
  return { migrated: true, version: MIGRATION_VERSION };
}
