import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppModals } from './useAppModals';

describe('useAppModals', () => {
  it.each([
    ['growth', 'isAddGrowthOpen'],
    ['pumping', 'isAddPumpingOpen'],
    ['smart-expense', 'isAddExpenseOpen'],
    ['expense', 'isAddExpenseOpen'],
    ['moment', 'isAddPostOpen'],
    ['diary', 'isAddPostOpen'],
  ] as const)('maps %s to %s', (action, key) => {
    const { result } = renderHook(() => useAppModals(vi.fn()));
    act(() => result.current.handleQuickAction(action));
    expect(result.current[key]).toBe(true);
  });

  it.each([
    ['feeding', 'feeding'],
    ['baby-sleep', 'baby-sleep'],
    ['diaper', 'diaper'],
    ['mom-sleep', 'mom-sleep'],
    ['mom-mood', 'mom-mood'],
    ['medicine', 'medicine'],
  ] as const)('routes %s to the persisted activity modal %s', (action, expectedMode) => {
    const addToast = vi.fn();
    const { result } = renderHook(() => useAppModals(addToast));

    act(() => result.current.handleQuickAction(action));

    expect(result.current.activityLogMode).toBe(expectedMode);
    expect(addToast).not.toHaveBeenCalled();
  });

  it('opens vaccine reminders instead of showing a fake success toast', () => {
    const addToast = vi.fn();
    const { result } = renderHook(() => useAppModals(addToast));
    act(() => result.current.handleQuickAction('vaccine'));
    expect(result.current.isNotificationOpen).toBe(true);
    expect(addToast).not.toHaveBeenCalled();
  });

  it('preserves lightbox state semantics', () => {
    const { result } = renderHook(() => useAppModals(vi.fn()));

    act(() => result.current.openLightbox('/photo.jpg', true));
    expect(result.current.lightboxSrc).toBe('/photo.jpg');
    expect(result.current.lightboxIsVideo).toBe(true);

    act(() => result.current.closeLightbox());
    expect(result.current.lightboxSrc).toBeNull();
    expect(result.current.lightboxIsVideo).toBe(true);
  });
});
