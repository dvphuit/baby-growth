import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const helperPath = 'app/src/shared/lib/idleTask.ts';
let helper = await readFile(helperPath, 'utf8');
const unsafeCancel = '      window.cancelIdleCallback(idleId);';
const safeCancel = `      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }`;
if (!helper.includes(unsafeCancel)) {
  throw new Error('Expected idle cancellation fragment was not generated');
}
helper = helper.replace(unsafeCancel, safeCancel);
await writeFile(helperPath, helper);

await writeFile('app/src/shared/lib/idleTask.test.ts', `import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleIdleTask } from './idleTask';

describe('scheduleIdleTask', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('waits for an idle callback before running work', () => {
    const task = vi.fn();
    const idleCallbacks: IdleRequestCallback[] = [];
    const cancelIdle = vi.fn();
    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return 17;
    }));
    vi.stubGlobal('cancelIdleCallback', cancelIdle);

    const cancel = scheduleIdleTask(task, { timeoutMs: 2000 });
    expect(task).not.toHaveBeenCalled();

    idleCallbacks[0]?.({
      didTimeout: false,
      timeRemaining: () => 10,
    });
    expect(task).toHaveBeenCalledTimes(1);

    cancel();
    expect(cancelIdle).not.toHaveBeenCalled();
  });

  it('cancels queued idle work before it starts', () => {
    const task = vi.fn();
    const idleCallbacks: IdleRequestCallback[] = [];
    const cancelIdle = vi.fn();
    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return 17;
    }));
    vi.stubGlobal('cancelIdleCallback', cancelIdle);

    const cancel = scheduleIdleTask(task);
    cancel();
    idleCallbacks[0]?.({
      didTimeout: false,
      timeRemaining: () => 10,
    });

    expect(cancelIdle).toHaveBeenCalledWith(17);
    expect(task).not.toHaveBeenCalled();
  });

  it('uses a bounded timer fallback when idle callbacks are unavailable', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);
    const task = vi.fn();

    scheduleIdleTask(task, { fallbackDelayMs: 25 });
    vi.advanceTimersByTime(24);
    expect(task).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
`);

await writeFile('app/src/features/sync/hooks/useAutoSyncLifecycle.test.tsx', `import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startAutoSync } from '@/features/sync/googleDriveSync';
import { reloadPage } from '@/services/appRuntime';
import { useAutoSyncLifecycle } from './useAutoSyncLifecycle';

vi.mock('@/features/sync/googleDriveSync', () => ({ startAutoSync: vi.fn() }));
vi.mock('@/services/appRuntime', () => ({ reloadPage: vi.fn() }));

const startAutoSyncMock = vi.mocked(startAutoSync);
const reloadPageMock = vi.mocked(reloadPage);
let idleCallbacks: IdleRequestCallback[] = [];
let nextIdleId = 1;
const cancelIdleCallbackMock = vi.fn();

function runNextIdleCallback(): void {
  const callback = idleCallbacks.shift();
  if (!callback) throw new Error('No idle callback was scheduled');
  act(() => {
    callback({ didTimeout: false, timeRemaining: () => 10 });
  });
}

describe('useAutoSyncLifecycle', () => {
  beforeEach(() => {
    startAutoSyncMock.mockReset();
    reloadPageMock.mockReset();
    cancelIdleCallbackMock.mockReset();
    idleCallbacks = [];
    nextIdleId = 1;
    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return nextIdleId++;
    }));
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallbackMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts auto-sync during idle time and stops it on unmount', async () => {
    const stop = vi.fn();
    startAutoSyncMock.mockResolvedValue(stop);

    const { unmount } = renderHook(() => useAutoSyncLifecycle());
    expect(startAutoSyncMock).not.toHaveBeenCalled();

    runNextIdleCallback();
    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));

    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('cancels startup when unmounted before the idle callback', () => {
    startAutoSyncMock.mockResolvedValue(vi.fn());
    const { unmount } = renderHook(() => useAutoSyncLifecycle());

    unmount();
    runNextIdleCallback();

    expect(cancelIdleCallbackMock).toHaveBeenCalledTimes(1);
    expect(startAutoSyncMock).not.toHaveBeenCalled();
  });

  it('stops a late auto-sync start if unmounted before startup resolves', async () => {
    const stop = vi.fn();
    let resolveStart!: (stopFn: () => void) => void;
    startAutoSyncMock.mockReturnValue(new Promise((resolve) => { resolveStart = resolve; }));

    const { unmount } = renderHook(() => useAutoSyncLifecycle());
    runNextIdleCallback();
    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));
    unmount();

    await act(async () => {
      resolveStart(stop);
    });

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('reloads when a remote update event is received', () => {
    startAutoSyncMock.mockResolvedValue(vi.fn());
    const { unmount } = renderHook(() => useAutoSyncLifecycle());

    window.dispatchEvent(new Event('babygrowth:remote-updated'));
    expect(reloadPageMock).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('removes the remote update listener on unmount', () => {
    startAutoSyncMock.mockResolvedValue(vi.fn());
    const { unmount } = renderHook(() => useAutoSyncLifecycle());
    unmount();

    window.dispatchEvent(new Event('babygrowth:remote-updated'));
    expect(reloadPageMock).not.toHaveBeenCalled();
  });

  it('does not surface a rejected startup promise from the shell hook', async () => {
    startAutoSyncMock.mockRejectedValue(new Error('sync unavailable'));
    const { unmount } = renderHook(() => useAutoSyncLifecycle());

    runNextIdleCallback();
    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));
    unmount();
  });
});
`);

await rm(fileURLToPath(import.meta.url));
