import {
  parseAppSnapshot,
  type AppSnapshot,
} from './appSnapshotSchema';

export { APP_SNAPSHOT_GENERATION, isAppSnapshot, parseAppSnapshot } from './appSnapshotSchema';
export type { AppSnapshot } from './appSnapshotSchema';

export interface AppSnapshotRuntime {
  exportSnapshot: (now: Date) => AppSnapshot;
  applySnapshot: (snapshot: AppSnapshot) => void;
  subscribeChanges: (listener: () => void) => () => void;
}

let appSnapshotRuntime: AppSnapshotRuntime | null = null;

export function configureAppSnapshotRuntime(runtime: AppSnapshotRuntime): void {
  appSnapshotRuntime = runtime;
}

function requireAppSnapshotRuntime(): AppSnapshotRuntime {
  if (!appSnapshotRuntime) {
    throw new Error('App snapshot runtime has not been configured.');
  }
  return appSnapshotRuntime;
}

export function exportAppSnapshot(now = new Date()): AppSnapshot {
  return requireAppSnapshotRuntime().exportSnapshot(now);
}

export function applyAppSnapshot(snapshot: AppSnapshot): void {
  requireAppSnapshotRuntime().applySnapshot(parseAppSnapshot(snapshot));
}

export function subscribeAppSnapshotChanges(listener: () => void): () => void {
  return requireAppSnapshotRuntime().subscribeChanges(listener);
}
