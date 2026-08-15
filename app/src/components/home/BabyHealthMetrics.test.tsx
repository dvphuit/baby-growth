import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BabyHealthMetrics } from './BabyHealthMetrics';

describe('BabyHealthMetrics', () => {
  it('renders growth and mood and forwards actions', () => {
    const onOpenScoreDetail = vi.fn();
    const onOpenQuickLog = vi.fn();
    const onOpenProfile = vi.fn();
    render(<BabyHealthMetrics growthScore={92} growthScoreLabel="Tối ưu" mood="Overjoyed" onOpenScoreDetail={onOpenScoreDetail} onOpenQuickLog={onOpenQuickLog} onOpenProfile={onOpenProfile} />);
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('Tối ưu')).toBeInTheDocument();
    expect(screen.getByText('Rất vui')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết điểm tăng trưởng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật tâm trạng của bé' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ chi tiết của bé' }));
    expect(onOpenScoreDetail).toHaveBeenCalledTimes(1);
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
    expect(onOpenProfile).toHaveBeenCalledTimes(1);
  });

  it('preserves empty fallbacks', () => {
    render(<BabyHealthMetrics growthScore={null} growthScoreLabel="" mood="" onOpenScoreDetail={vi.fn()} onOpenQuickLog={vi.fn()} onOpenProfile={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getAllByText('Chưa cập nhật').length).toBeGreaterThanOrEqual(2);
  });
});
