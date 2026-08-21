import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    const { result } = renderHook(() => useAppModals());
    act(() => result.current.handleQuickAction(action));
    expect(result.current[key]).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it.each([
    ['feeding', 'feeding'],
    ['baby-sleep', 'baby-sleep'],
    ['diaper', 'diaper'],
    ['mom-sleep', 'mom-sleep'],
    ['mom-mood', 'mom-mood'],
    ['medicine', 'medicine'],
  ] as const)('routes %s to the persisted activity modal %s', (action, expectedMode) => {
    const { result } = renderHook(() => useAppModals());

    act(() => result.current.handleQuickAction(action));

    expect(result.current.activityLogMode).toBe(expectedMode);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it('opens and closes the pumping modal through the controller API', () => {
    const { result } = renderHook(() => useAppModals());

    act(() => result.current.openAddPumping());
    expect(result.current.isAddPumpingOpen).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);

    act(() => result.current.closeAddPumping());
    expect(result.current.isAddPumpingOpen).toBe(false);
    expect(result.current.isAnyModalOpen).toBe(false);
  });

  it('opens vaccine reminders', () => {
    const { result } = renderHook(() => useAppModals());
    act(() => result.current.handleQuickAction('vaccine'));
    expect(result.current.isNotificationOpen).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it('preserves lightbox state semantics', () => {
    const { result } = renderHook(() => useAppModals());

    act(() => result.current.openLightbox('/photo.jpg', true));
    expect(result.current.lightboxSrc).toBe('/photo.jpg');
    expect(result.current.lightboxIsVideo).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);

    act(() => result.current.closeLightbox());
    expect(result.current.lightboxSrc).toBeNull();
    expect(result.current.lightboxIsVideo).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(false);
  });

  it('keeps action references stable while modal state changes', () => {
    const { result } = renderHook(() => useAppModals());
    const openQuickLog = result.current.openQuickLog;
    const closeQuickLog = result.current.closeQuickLog;
    const handleQuickAction = result.current.handleQuickAction;
    const openLightbox = result.current.openLightbox;

    act(() => result.current.openQuickLog());

    expect(result.current.openQuickLog).toBe(openQuickLog);
    expect(result.current.closeQuickLog).toBe(closeQuickLog);
    expect(result.current.handleQuickAction).toBe(handleQuickAction);
    expect(result.current.openLightbox).toBe(openLightbox);
  });
});
