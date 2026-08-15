import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BabyHomeView } from './BabyHomeView';

const navigate = vi.fn();
let milkTotal = '540 ml';
let sleepTotal = '12h 30p';

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
          milkTotal,
          sleepTotal,
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

const renderView = () =>
  render(
    <MemoryRouter>
      <BabyHomeView
        onOpenScoreDetail={vi.fn()}
        onOpenQuickLog={vi.fn()}
        onOpenAiChat={vi.fn()}
      />
    </MemoryRouter>,
  );

describe('BabyHomeView', () => {
  beforeEach(() => {
    navigate.mockReset();
    milkTotal = '540 ml';
    sleepTotal = '12h 30p';
  });

  it('preserves baby composition and profile navigation', () => {
    const onOpenScoreDetail = vi.fn();
    const onOpenAiChat = vi.fn();

    render(
      <MemoryRouter>
        <BabyHomeView
          onOpenScoreDetail={onOpenScoreDetail}
          onOpenQuickLog={vi.fn()}
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

  it('shows the no-feeding insight when milk is empty', () => {
    milkTotal = '';
    renderView();
    expect(screen.getByText('Hôm nay bé chưa có ghi chép về cữ bú.')).toBeInTheDocument();
  });

  it('asks for sleep when feeding exists but sleep is empty', () => {
    sleepTotal = '';
    renderView();
    expect(screen.getByText('Bé đã có ghi chép ăn uống; hãy cập nhật thêm giấc ngủ hôm nay.')).toBeInTheDocument();
  });

  it('shows the tracked-well insight when feeding and sleep both exist', () => {
    renderView();
    expect(screen.getByText('Các chỉ số chính của bé đang được theo dõi tốt hôm nay.')).toBeInTheDocument();
  });
});
