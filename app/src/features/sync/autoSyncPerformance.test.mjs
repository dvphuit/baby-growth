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
    expect(sync).toContain('AUTO_SYNC_DEBOUNCE_MS = 3_500');
    expect(sync).toContain('cancelAutoSyncIdle = scheduleIdleTask');
    expect(sync).toContain('clearPendingAutoSync();');
  });
});
