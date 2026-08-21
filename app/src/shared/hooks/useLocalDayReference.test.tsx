import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalDayReference } from './useLocalDayReference';

describe('useLocalDayReference', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the same reference during the day and updates after local midnight', () => {
    vi.setSystemTime(new Date(2026, 7, 21, 23, 59, 59, 500));
    const { result, unmount } = renderHook(() => useLocalDayReference());
    const initial = result.current;

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe(initial);

    vi.setSystemTime(new Date(2026, 7, 22, 0, 0, 0, 100));
    act(() => vi.advanceTimersToNextTimer());
    expect(result.current).not.toBe(initial);
    expect(result.current.getDate()).toBe(22);

    unmount();
  });

  it('refreshes the day reference when the app regains focus on a new day', () => {
    vi.setSystemTime(new Date(2026, 7, 21, 12, 0, 0));
    const { result, unmount } = renderHook(() => useLocalDayReference());
    const initial = result.current;

    vi.setSystemTime(new Date(2026, 7, 22, 9, 0, 0));
    act(() => window.dispatchEvent(new Event('focus')));

    expect(result.current).not.toBe(initial);
    expect(result.current.getDate()).toBe(22);

    unmount();
  });
});
