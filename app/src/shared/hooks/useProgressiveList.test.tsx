import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProgressiveList } from './useProgressiveList';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useProgressiveList', () => {
  it('reveals bounded batches and resets when the list scope changes', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result, rerender } = renderHook(
      ({ totalCount, resetKey }) => useProgressiveList({
        totalCount,
        initialCount: 12,
        batchSize: 8,
        resetKey,
      }),
      { initialProps: { totalCount: 40, resetKey: 'first' } },
    );

    expect(result.current.visibleCount).toBe(12);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.autoLoadAvailable).toBe(false);

    act(() => result.current.revealMore());
    expect(result.current.visibleCount).toBe(20);

    rerender({ totalCount: 40, resetKey: 'second' });
    expect(result.current.visibleCount).toBe(12);

    rerender({ totalCount: 7, resetKey: 'second' });
    expect(result.current.visibleCount).toBe(7);
    expect(result.current.hasMore).toBe(false);
  });
});
