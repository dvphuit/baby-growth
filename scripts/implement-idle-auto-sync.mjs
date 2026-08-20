import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();

async function replaceRequired(path, replacements) {
  let source = await readFile(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) {
      throw new Error(`Expected source fragment not found in ${path}: ${from}`);
    }
    source = source.replace(from, to);
  }
  await writeFile(path, source);
}

await writeFile(
  join(root, 'app', 'src', 'shared', 'lib', 'idleTask.ts'),
  `export interface IdleTaskOptions {\n  timeoutMs?: number;\n  fallbackDelayMs?: number;\n}\n\nexport function scheduleIdleTask(\n  task: () => void,\n  { timeoutMs = 2_000, fallbackDelayMs = 0 }: IdleTaskOptions = {},\n): () => void {\n  let settled = false;\n  const run = () => {\n    if (settled) return;\n    settled = true;\n    task();\n  };\n\n  if (typeof window.requestIdleCallback === 'function') {\n    const idleId = window.requestIdleCallback(run, { timeout: timeoutMs });\n    return () => {\n      if (settled) return;\n      settled = true;\n      window.cancelIdleCallback(idleId);\n    };\n  }\n\n  const timeoutId = window.setTimeout(run, fallbackDelayMs);\n  return () => {\n    if (settled) return;\n    settled = true;\n    window.clearTimeout(timeoutId);\n  };\n}\n`,
);

await writeFile(
  join(root, 'app', 'src', 'shared', 'lib', 'idleTask.test.ts'),
  `import { afterEach, describe, expect, it, vi } from 'vitest';\nimport { scheduleIdleTask } from './idleTask';\n\ndescribe('scheduleIdleTask', () => {\n  afterEach(() => {\n    vi.useRealTimers();\n    vi.unstubAllGlobals();\n  });\n\n  it('waits for the browser idle callback before running work', () => {\n    let idleCallback: IdleRequestCallback | null = null;\n    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {\n      idleCallback = callback;\n      return 7;\n    }));\n    vi.stubGlobal('cancelIdleCallback', vi.fn());\n    const task = vi.fn();\n\n    scheduleIdleTask(task, { timeoutMs: 3_000 });\n    expect(task).not.toHaveBeenCalled();\n\n    idleCallback?.({ didTimeout: false, timeRemaining: () => 50 });\n    expect(task).toHaveBeenCalledTimes(1);\n  });\n\n  it('cancels idle work before it starts', () => {\n    let idleCallback: IdleRequestCallback | null = null;\n    const cancelIdleCallback = vi.fn();\n    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {\n      idleCallback = callback;\n      return 9;\n    }));\n    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback);\n    const task = vi.fn();\n\n    const cancel = scheduleIdleTask(task);\n    cancel();\n    idleCallback?.({ didTimeout: false, timeRemaining: () => 50 });\n\n    expect(cancelIdleCallback).toHaveBeenCalledWith(9);\n    expect(task).not.toHaveBeenCalled();\n  });\n\n  it('uses a bounded timer fallback when requestIdleCallback is unavailable', () => {\n    vi.useFakeTimers();\n    vi.stubGlobal('requestIdleCallback', undefined);\n    const task = vi.fn();\n\n    scheduleIdleTask(task, { fallbackDelayMs: 25 });\n    expect(task).not.toHaveBeenCalled();\n    vi.advanceTimersByTime(25);\n    expect(task).toHaveBeenCalledTimes(1);\n  });\n});\n`,
);

await writeFile(
  join(root, 'app', 'src', 'features', 'sync', 'hooks', 'useAutoSyncLifecycle.ts'),
  `import { useEffect } from 'react';\nimport { reloadPage } from '@/services/appRuntime';\nimport { scheduleIdleTask } from '@/shared/lib/idleTask';\n\nconst AUTO_SYNC_START_IDLE_TIMEOUT_MS = 3_000;\nconst AUTO_SYNC_START_FALLBACK_MS = 750;\n\nexport function useAutoSyncLifecycle(): void {\n  useEffect(() => {\n    let disposed = false;\n    let stopAutoSync: (() => void) | undefined;\n\n    const cancelStart = scheduleIdleTask(() => {\n      void import('@/features/sync/googleDriveSync')\n        .then(({ startAutoSync }) => startAutoSync())\n        .then((stop) => {\n          if (disposed) {\n            stop();\n          } else {\n            stopAutoSync = stop;\n          }\n        })\n        .catch(() => {});\n    }, {\n      timeoutMs: AUTO_SYNC_START_IDLE_TIMEOUT_MS,\n      fallbackDelayMs: AUTO_SYNC_START_FALLBACK_MS,\n    });\n\n    const handleRemoteUpdate = () => reloadPage();\n    window.addEventListener('babygrowth:remote-updated', handleRemoteUpdate);\n\n    return () => {\n      disposed = true;\n      cancelStart();\n      stopAutoSync?.();\n      window.removeEventListener('babygrowth:remote-updated', handleRemoteUpdate);\n    };\n  }, []);\n}\n`,
);

await writeFile(
  join(root, 'app', 'src', 'features', 'sync', 'hooks', 'useAutoSyncLifecycle.test.tsx'),
  `import { act, renderHook, waitFor } from '@testing-library/react';\nimport { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';\nimport { startAutoSync } from '@/features/sync/googleDriveSync';\nimport { reloadPage } from '@/services/appRuntime';\nimport { useAutoSyncLifecycle } from './useAutoSyncLifecycle';\n\nvi.mock('@/features/sync/googleDriveSync', () => ({ startAutoSync: vi.fn() }));\nvi.mock('@/services/appRuntime', () => ({ reloadPage: vi.fn() }));\n\nconst startAutoSyncMock = vi.mocked(startAutoSync);\nconst reloadPageMock = vi.mocked(reloadPage);\nlet idleCallback: IdleRequestCallback | null = null;\n\nfunction runIdleCallback(): void {\n  const callback = idleCallback;\n  if (!callback) throw new Error('Idle callback was not scheduled');\n  act(() => {\n    callback({ didTimeout: false, timeRemaining: () => 50 });\n  });\n}\n\ndescribe('useAutoSyncLifecycle', () => {\n  beforeEach(() => {\n    idleCallback = null;\n    startAutoSyncMock.mockReset();\n    reloadPageMock.mockReset();\n    vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {\n      idleCallback = callback;\n      return 11;\n    }));\n    vi.stubGlobal('cancelIdleCallback', vi.fn());\n  });\n\n  afterEach(() => {\n    vi.unstubAllGlobals();\n  });\n\n  it('starts auto-sync only when the browser becomes idle and stops it on unmount', async () => {\n    const stop = vi.fn();\n    startAutoSyncMock.mockResolvedValue(stop);\n\n    const { unmount } = renderHook(() => useAutoSyncLifecycle());\n    expect(startAutoSyncMock).not.toHaveBeenCalled();\n\n    runIdleCallback();\n    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));\n\n    unmount();\n    expect(stop).toHaveBeenCalledTimes(1);\n  });\n\n  it('cancels startup when unmounted before the idle window', () => {\n    const { unmount } = renderHook(() => useAutoSyncLifecycle());\n    unmount();\n    runIdleCallback();\n\n    expect(window.cancelIdleCallback).toHaveBeenCalledWith(11);\n    expect(startAutoSyncMock).not.toHaveBeenCalled();\n  });\n\n  it('stops a late auto-sync start if unmounted before startup resolves', async () => {\n    const stop = vi.fn();\n    let resolveStart!: (stopFn: () => void) => void;\n    startAutoSyncMock.mockReturnValue(new Promise((resolve) => { resolveStart = resolve; }));\n\n    const { unmount } = renderHook(() => useAutoSyncLifecycle());\n    runIdleCallback();\n    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));\n    unmount();\n\n    await act(async () => {\n      resolveStart(stop);\n    });\n\n    expect(stop).toHaveBeenCalledTimes(1);\n  });\n\n  it('reloads when a remote update event is received before auto-sync starts', () => {\n    startAutoSyncMock.mockResolvedValue(vi.fn());\n    renderHook(() => useAutoSyncLifecycle());\n\n    window.dispatchEvent(new Event('babygrowth:remote-updated'));\n    expect(reloadPageMock).toHaveBeenCalledTimes(1);\n  });\n\n  it('removes the remote update listener on unmount', () => {\n    startAutoSyncMock.mockResolvedValue(vi.fn());\n    const { unmount } = renderHook(() => useAutoSyncLifecycle());\n    unmount();\n\n    window.dispatchEvent(new Event('babygrowth:remote-updated'));\n    expect(reloadPageMock).not.toHaveBeenCalled();\n  });\n\n  it('does not surface a rejected startup promise from the shell hook', async () => {\n    startAutoSyncMock.mockRejectedValue(new Error('sync unavailable'));\n    renderHook(() => useAutoSyncLifecycle());\n\n    runIdleCallback();\n    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));\n  });\n});\n`,
);

await replaceRequired(
  join(root, 'app', 'src', 'features', 'sync', 'googleDriveSync.ts'),
  [
    [
      "import { logDiagnostic } from '@/app/diagnostics/diagnosticLog';",
      "import { logDiagnostic } from '@/app/diagnostics/diagnosticLog';\nimport { scheduleIdleTask } from '@/shared/lib/idleTask';",
    ],
    [
      'const AUTO_SYNC_DEBOUNCE_MS = 1200;',
      'const AUTO_SYNC_DEBOUNCE_MS = 3_500;\nconst AUTO_SYNC_IDLE_TIMEOUT_MS = 3_000;',
    ],
    [
      'let autoSyncDebounceTimer: number | null = null;\nlet autoSyncInFlight: Promise<void> | null = null;',
      'let autoSyncDebounceTimer: number | null = null;\nlet cancelAutoSyncIdle: (() => void) | null = null;\nlet autoSyncInFlight: Promise<void> | null = null;',
    ],
    [
      `function clearPendingAutoSync(): void {\n  if (autoSyncDebounceTimer !== null) {\n    window.clearTimeout(autoSyncDebounceTimer);\n    autoSyncDebounceTimer = null;\n  }\n}`,
      `function clearPendingAutoSync(): void {\n  if (autoSyncDebounceTimer !== null) {\n    window.clearTimeout(autoSyncDebounceTimer);\n    autoSyncDebounceTimer = null;\n  }\n  cancelAutoSyncIdle?.();\n  cancelAutoSyncIdle = null;\n}`,
    ],
    [
      `function scheduleAutoSync(delay = AUTO_SYNC_DEBOUNCE_MS): void {\n  if (suppressAutoSync) return;\n  if (autoSyncDebounceTimer !== null) window.clearTimeout(autoSyncDebounceTimer);\n  autoSyncDebounceTimer = window.setTimeout(() => {\n    autoSyncDebounceTimer = null;\n    void runAutoSync();\n  }, delay);\n}`,
      `function scheduleAutoSync(delay = AUTO_SYNC_DEBOUNCE_MS): void {\n  if (suppressAutoSync) return;\n  clearPendingAutoSync();\n  autoSyncDebounceTimer = window.setTimeout(() => {\n    autoSyncDebounceTimer = null;\n    cancelAutoSyncIdle = scheduleIdleTask(() => {\n      cancelAutoSyncIdle = null;\n      void runAutoSync();\n    }, { timeoutMs: AUTO_SYNC_IDLE_TIMEOUT_MS });\n  }, delay);\n}`,
    ],
    [
      `      if (autoSyncTimer !== null) window.clearInterval(autoSyncTimer);\n      if (autoSyncDebounceTimer !== null) window.clearTimeout(autoSyncDebounceTimer);\n      autoSyncTimer = null;\n      autoSyncDebounceTimer = null;\n      autoSyncStop = null;`,
      `      if (autoSyncTimer !== null) window.clearInterval(autoSyncTimer);\n      clearPendingAutoSync();\n      autoSyncTimer = null;\n      autoSyncStop = null;`,
    ],
  ],
);

await writeFile(
  join(root, 'app', 'src', 'features', 'sync', 'autoSyncPerformance.test.mjs'),
  `import { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nimport { describe, expect, it } from 'vitest';\n\nconst ROOT = process.cwd();\nconst source = (path) => readFileSync(join(ROOT, 'src', path), 'utf8');\n\ndescribe('auto-sync performance contract', () => {\n  it('defers startup and snapshot-producing sync work to idle time', () => {\n    const lifecycle = source('features/sync/hooks/useAutoSyncLifecycle.ts');\n    const sync = source('features/sync/googleDriveSync.ts');\n\n    expect(lifecycle).toContain('scheduleIdleTask');\n    expect(lifecycle).toContain('AUTO_SYNC_START_IDLE_TIMEOUT_MS = 3_000');\n    expect(sync).toContain('AUTO_SYNC_DEBOUNCE_MS = 3_500');\n    expect(sync).toContain('cancelAutoSyncIdle = scheduleIdleTask');\n    expect(sync).toContain('clearPendingAutoSync();');\n  });\n});\n`,
);

await rm(join(root, '.github', 'workflows', 'implement-idle-auto-sync.yml'));
await rm(fileURLToPath(import.meta.url));
