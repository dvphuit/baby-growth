import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');

describe('auto-sync performance contract', () => {
  it('defers startup and snapshot-producing sync work to idle time', () => {
    const lifecycle = source('features/sync/hooks/useAutoSyncLifecycle.ts');
    const sync = source('features/sync/googleDriveSync.ts');

    expect(lifecycle).toContain('scheduleIdleTask');
    expect(lifecycle).toContain('AUTO_SYNC_START_IDLE_TIMEOUT_MS = 3_000');
    expect(lifecycle).toContain("import('../appSnapshot')");
    expect(lifecycle).toContain('waitForAppSnapshotRuntime()');
    expect(lifecycle.indexOf('waitForAppSnapshotRuntime()')).toBeLessThan(lifecycle.indexOf("import('../googleDriveSync')"));
    expect(sync).toContain('AUTO_SYNC_DEBOUNCE_MS = 3_500');
    expect(sync).toContain('cancelAutoSyncIdle = scheduleIdleTask');
    expect(sync).toContain('clearPendingAutoSync();');
  });

  it('moves local snapshot serialization and fingerprinting off the main thread', () => {
    const sync = source('features/sync/googleDriveSync.ts');
    const adapter = source('features/sync/syncSnapshotWorker.ts');
    const worker = source('features/sync/syncSnapshot.worker.ts');

    expect(sync).toContain('serializeSyncSnapshotOffMainThread');
    expect(sync).toContain('preparedLocal.payload');
    expect(sync).not.toContain('fingerprint: hash(JSON.stringify(data))');
    expect(sync).not.toContain('JSON.stringify(snapshot)');
    expect(adapter).toContain("new Worker(new URL('./syncSnapshot.worker.ts', import.meta.url)");
    expect(worker).toContain('serializeSyncSnapshotPayload');
  });
});
