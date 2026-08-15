import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startAutoSync } from '@/services/googleDriveSync';
import { reloadPage } from '@/services/appRuntime';
import { useAutoSyncLifecycle } from './useAutoSyncLifecycle';

vi.mock('@/services/googleDriveSync', () => ({ startAutoSync: vi.fn() }));
vi.mock('@/services/appRuntime', () => ({ reloadPage: vi.fn() }));

const startAutoSyncMock = vi.mocked(startAutoSync);
const reloadPageMock = vi.mocked(reloadPage);

describe('useAutoSyncLifecycle', () => {
  beforeEach(() => {
    startAutoSyncMock.mockReset();
    reloadPageMock.mockReset();
  });

  it('starts auto-sync once and stops it on unmount', async () => {
    const stop = vi.fn();
    startAutoSyncMock.mockResolvedValue(stop);

    const { unmount } = renderHook(() => useAutoSyncLifecycle());
    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));

    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('stops a late auto-sync start if unmounted before startup resolves', async () => {
    const stop = vi.fn();
    let resolveStart!: (stopFn: () => void) => void;
    startAutoSyncMock.mockReturnValue(new Promise((resolve) => { resolveStart = resolve; }));

    const { unmount } = renderHook(() => useAutoSyncLifecycle());
    unmount();

    await act(async () => {
      resolveStart(stop);
    });

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('reloads when a remote update event is received', () => {
    startAutoSyncMock.mockResolvedValue(vi.fn());
    renderHook(() => useAutoSyncLifecycle());

    window.dispatchEvent(new Event('babygrowth:remote-updated'));
    expect(reloadPageMock).toHaveBeenCalledTimes(1);
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
    renderHook(() => useAutoSyncLifecycle());

    await waitFor(() => expect(startAutoSyncMock).toHaveBeenCalledTimes(1));
  });
});
