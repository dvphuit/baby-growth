import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppModals } from './useAppModals';

describe('useAppModals', () => {
  it('opens and closes AI chat while resetting the initial question', () => {
    const { result } = renderHook(() => useAppModals(vi.fn()));

    act(() => result.current.openAiChat('Bé ngủ bao lâu?'));
    expect(result.current.isAiChatOpen).toBe(true);
    expect(result.current.aiChatInitialQuestion).toBe('Bé ngủ bao lâu?');

    act(() => result.current.closeAiChat());
    expect(result.current.isAiChatOpen).toBe(false);
    expect(result.current.aiChatInitialQuestion).toBeUndefined();
  });

  it.each([
    ['growth', 'isAddGrowthOpen'],
    ['pumping', 'isAddPumpingOpen'],
    ['smart-expense', 'isAddExpenseOpen'],
    ['expense', 'isAddExpenseOpen'],
  ] as const)('maps %s to %s', (action, key) => {
    const { result } = renderHook(() => useAppModals(vi.fn()));
    act(() => result.current.handleQuickAction(action));
    expect(result.current[key]).toBe(true);
  });

  it.each([
    ['feeding', 'feeding'],
    ['moment', 'milestone'],
    ['diary', 'milestone'],
    ['unknown', 'milestone'],
  ] as const)('maps %s to the expected post preset', (action, preset) => {
    const { result } = renderHook(() => useAppModals(vi.fn()));
    act(() => result.current.handleQuickAction(action));
    expect(result.current.isAddPostOpen).toBe(true);
    expect(result.current.presetPostTagType).toBe(preset);
  });

  it.each([
    ['sleep', 'Đã lưu cữ ngủ 1.5 giờ của bé 😴', '🌙'],
    ['diaper', 'Đã ghi nhận 1 lần thay tã sạch sẽ 🧷', '🧷'],
    ['vaccine', 'Đã lưu lịch tiêm phòng vắc-xin 💉', '💉'],
    ['medicine', 'Đã đánh dấu uống 1 giọt Vitamin D3 K2 💊', '💊'],
    ['mood', 'Đã cập nhật tâm lý tích cực ✨', '😊'],
  ] as const)('keeps %s as a toast-only quick action', (action, message, icon) => {
    const addToast = vi.fn();
    const { result } = renderHook(() => useAppModals(addToast));

    act(() => result.current.handleQuickAction(action));

    expect(addToast).toHaveBeenCalledWith(message, icon);
    expect(result.current.isAddPostOpen).toBe(false);
    expect(result.current.isAddGrowthOpen).toBe(false);
    expect(result.current.isAddPumpingOpen).toBe(false);
    expect(result.current.isAddExpenseOpen).toBe(false);
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

  it('assigns an explicit undefined post preset when opening a generic post', () => {
    const { result } = renderHook(() => useAppModals(vi.fn()));

    act(() => result.current.openAddPost('feeding'));
    act(() => result.current.closeAddPost());
    expect(result.current.presetPostTagType).toBe('feeding');

    act(() => result.current.openAddPost(undefined));
    expect(result.current.presetPostTagType).toBeUndefined();
    expect(result.current.isAddPostOpen).toBe(true);
  });
});
