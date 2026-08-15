import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BabyHomeView } from './BabyHomeView';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('./DailyHabits', () => ({
  DailyHabits: () => <div>Daily Habits marker</div>,
}));

vi.mock('@/store/useBabyStore', () => ({
  useBabyStore: (selector: (state: unknown) => unknown) =>
    selector({
      currentStageData: () => ({
        currentAgeText: '8 tháng 12 ngày',
        growthScore: 92,
        growthScoreLabel: 'Tối ưu',
        todayVitals: {
          milkTotal: '540 ml',
          sleepTotal: '12h 30p',
          diaperCount: 6,
          temperature: '36.8°C',
          mood: 'Happy',
          moodEmoji: '😊',
        },
      }),
      dailyHabits: [
        { id: '1', completed: true },
        { id: '2', completed: false },
      ],
    }),
}));

describe('BabyHomeView', () => {
  it('preserves baby landmarks and actions', () => {
    const onOpenScoreDetail = vi.fn();
    const onOpenQuickLog = vi.fn();
    const onOpenAiChat = vi.fn();

    render(
      <MemoryRouter>
        <BabyHomeView
          onOpenScoreDetail={onOpenScoreDetail}
          onOpenQuickLog={onOpenQuickLog}
          onOpenAiChat={onOpenAiChat}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tóm tắt hôm nay')).toBeInTheDocument();
    expect(screen.getByText('Daily Habits marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết điểm tăng trưởng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ chi tiết của bé' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mở tư vấn AI' }));

    expect(onOpenScoreDetail).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/profile');
    expect(onOpenAiChat).toHaveBeenCalledTimes(1);
  });
});
