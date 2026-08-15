import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MomHomeView } from './MomHomeView';

vi.mock('@/store/useMomStore', () => ({
  useMomStore: (selector: (state: unknown) => unknown) =>
    selector({
      momData: {
        wellnessScore: 88,
        pumping: { todayTotal: '540 ml', sessionsToday: 3 },
        mentalHealth: { sleepDebt: '2.5h', epdsScore: '4/30' },
      },
    }),
}));

describe('MomHomeView', () => {
  it('preserves mom landmarks and actions', () => {
    const onOpenScoreDetail = vi.fn();
    const onOpenPumping = vi.fn();
    const onOpenAiChat = vi.fn();

    render(
      <MomHomeView
        onOpenScoreDetail={onOpenScoreDetail}
        onOpenPumping={onOpenPumping}
        onOpenAiChat={onOpenAiChat}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết chỉ số hồi phục của mẹ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ghi nhận cữ hút sữa mẹ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mở tư vấn AI' }));

    expect(onOpenScoreDetail).toHaveBeenCalledTimes(1);
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
    expect(onOpenAiChat).toHaveBeenCalledTimes(1);
    expect(screen.getByText('540 ml (3 cữ)')).toBeInTheDocument();
  });
});
