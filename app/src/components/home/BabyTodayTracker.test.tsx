import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BabyTodayTracker } from './BabyTodayTracker';

describe('BabyTodayTracker', () => {
  it('renders populated values and forwards quick-log actions', () => {
    const onOpenQuickLog = vi.fn();

    render(
      <BabyTodayTracker
        milkTotal="540 ml"
        sleepTotal="12h 30p"
        diaperCount={6}
        temperature="36.8°C"
        mood="Happy"
        moodEmoji="😊"
        growthScore={92}
        onOpenQuickLog={onOpenQuickLog}
      />,
    );

    expect(screen.getByText('540 ml trong ngày')).toBeInTheDocument();
    expect(screen.getByText('12h 30p')).toBeInTheDocument();
    expect(screen.getByText('6 lần trong ngày')).toBeInTheDocument();
    expect(screen.getByText('36.8°C')).toBeInTheDocument();
    expect(screen.getByText('Đang vui vẻ')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();

    const actionNames = [
      'Thêm ghi chép hôm nay',
      'Cập nhật cữ bú và ăn dặm',
      'Cập nhật giấc ngủ của bé',
      'Cập nhật thay tã và vệ sinh',
      'Cập nhật thân nhiệt và thể trạng',
      'Cập nhật tâm trạng của bé',
    ];
    actionNames.forEach((name) => fireEvent.click(screen.getByRole('button', { name })));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(actionNames.length);
  });

  it('preserves empty-value fallbacks and treats zero diapers as recorded', () => {
    const { rerender } = render(
      <BabyTodayTracker
        milkTotal=""
        sleepTotal=""
        diaperCount={null}
        temperature=""
        mood=""
        moodEmoji=""
        growthScore={null}
        onOpenQuickLog={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Chưa cập nhật').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('Cập nhật').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(
      <BabyTodayTracker
        milkTotal=""
        sleepTotal=""
        diaperCount={0}
        temperature=""
        mood=""
        moodEmoji=""
        growthScore={null}
        onOpenQuickLog={vi.fn()}
      />,
    );

    expect(screen.getByText('0 lần trong ngày')).toBeInTheDocument();
    expect(screen.getByText('Đã ghi nhận')).toBeInTheDocument();
  });
});
