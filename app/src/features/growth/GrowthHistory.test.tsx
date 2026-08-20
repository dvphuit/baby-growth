import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GrowthHistory } from './GrowthHistory';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import type { GrowthHistoryRecord } from '@/types';

describe('GrowthHistory', () => {
  beforeEach(() => {
    useGrowthStore.getState().resetToDefaults();
  });

  it('renders empty state when there are no user measurements', () => {
    const onOpenAddMeasurement = vi.fn();
    render(<GrowthHistory onOpenAddMeasurement={onOpenAddMeasurement} />);

    expect(screen.getByText('Chưa có dữ liệu đo lường')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Ghi lần cân đo đầu tiên' });
    fireEvent.click(btn);
    expect(onOpenAddMeasurement).toHaveBeenCalledTimes(1);
  });

  it('renders user records and supports deletion with confirm dialog', () => {
    const testRecord: GrowthHistoryRecord = {
      id: 'gh-test-del-1',
      date: '2026-08-15',
      ageText: '8 tháng 25 ngày',
      weight: 8.8,
      height: 72.0,
      headCirc: 44.5,
      percentileLabel: '',
      status: 'optimal',
      note: 'Khám định kỳ',
    };

    const state = useGrowthStore.getState();
    const stage = state.stages[state.currentStage];
    stage.growthHistory = [testRecord];

    // Mock confirm dialog to true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<GrowthHistory onOpenAddMeasurement={vi.fn()} />);

    expect(screen.getByText('8 tháng 25 ngày')).toBeInTheDocument();
    expect(screen.getByText('8.8 kg')).toBeInTheDocument();
    expect(screen.getByText('72 cm')).toBeInTheDocument();
    expect(screen.getByText('Khám định kỳ')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Xóa số đo ngày 2026-08-15' });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Xóa bản ghi cân đo ngày 2026-08-15?');
    // Record should now be deleted from history
    expect(screen.queryByText('8 tháng 25 ngày')).not.toBeInTheDocument();
  });
});
