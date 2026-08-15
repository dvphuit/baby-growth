import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BabyTodaySummary } from './BabyTodaySummary';

describe('BabyTodaySummary', () => {
  it('renders summary data and forwards quick log', () => {
    const onOpenQuickLog = vi.fn();
    render(<BabyTodaySummary currentAgeText="8 tháng 12 ngày" completedHabitsCount={2} totalHabitsCount={5} todayInsight="Insight" growthScore={92} onOpenQuickLog={onOpenQuickLog} />);
    expect(screen.getByText('2/5 việc')).toBeInTheDocument();
    expect(screen.getByText('Dành cho 8 tháng 12 ngày')).toBeInTheDocument();
    expect(screen.getByText('Điểm tăng trưởng 92/100')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+ Ghi chép' }));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('preserves missing score fallback', () => {
    render(<BabyTodaySummary currentAgeText="8 tháng" completedHabitsCount={0} totalHabitsCount={0} todayInsight="Insight" growthScore={null} onOpenQuickLog={vi.fn()} />);
    expect(screen.getByText('Chưa có điểm tăng trưởng')).toBeInTheDocument();
  });
});
