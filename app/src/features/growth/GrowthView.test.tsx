import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GrowthView } from './GrowthView';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import type { GrowthHistoryRecord } from '@/features/growth/domain/types';

// Mock chart.js so canvas doesn't throw in jsdom
vi.mock('./WHOChart', () => ({
  WHOChart: ({ metric }: { metric: string }) => (
    <div data-testid="who-chart-mock">
      <span>WHOChart metric: {metric}</span>
    </div>
  ),
}));

describe('GrowthView', () => {
  beforeEach(() => {
    useGrowthStore.getState().resetToDefaults();
  });

  it('renders the Home-style growth summary and honest empty state when no measurements exist', () => {
    const onOpenAddMeasurement = vi.fn();
    const { container } = render(<GrowthView onOpenAddMeasurement={onOpenAddMeasurement} />);

    expect(screen.getByRole('heading', { level: 2, name: /Hành trình/i })).toBeInTheDocument();
    expect(screen.getByText('NHỊP TĂNG TRƯỞNG')).toBeInTheDocument();
    expect(container.querySelector('.haven-growth-summary-card')).toBeInTheDocument();
    expect(container.querySelector('.haven-growth-add-btn')).toBeInTheDocument();
    expect(container.querySelector('.haven-growth-card-decor')).toHaveAttribute(
      'src',
      '/assets/decor/growth-measure.svg',
    );
    expect(screen.getByText('Chưa có số đo được ghi nhận')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Ghi lần cân đo đầu tiên/i }).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByTestId('who-chart-mock')).toBeInTheDocument();
    expect(screen.getByText(/WHOChart metric: weight/i)).toBeInTheDocument();
    expect(screen.queryByText('Phát triển thể chất')).not.toBeInTheDocument();
  });

  it('triggers onOpenAddMeasurement when clicking hero action button', () => {
    const onOpenAddMeasurement = vi.fn();
    render(<GrowthView onOpenAddMeasurement={onOpenAddMeasurement} />);

    const addBtn = screen.getAllByRole('button', { name: /\+ Thêm số đo/i })[0];
    fireEvent.click(addBtn);
    expect(onOpenAddMeasurement).toHaveBeenCalledTimes(1);
  });


  it('displays vital values and delta when measurements exist', () => {
    const initialHistory: GrowthHistoryRecord[] = [
      {
        id: 'gh-user-2',
        date: '2026-08-16',
        ageText: '8 tháng 26 ngày',
        weight: 9.0,
        height: 73.0,
        headCirc: 45.0,
        percentileLabel: '',
        status: 'optimal',
        note: 'Bé ăn ngủ ngoan',
      },
      {
        id: 'gh-user-1',
        date: '2026-08-01',
        ageText: '8 tháng 11 ngày',
        weight: 8.5,
        height: 71.0,
        headCirc: 44.5,
        percentileLabel: '',
        status: 'optimal',
        note: 'Lần đo trước',
      },
    ];

    const state = useGrowthStore.getState();
    const stage = state.stages[state.currentStage];
    stage.growthHistory = initialHistory;

    render(<GrowthView onOpenAddMeasurement={vi.fn()} />);

    // Current latest vitals
    expect(screen.getAllByText('9 kg').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('73 cm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('45 cm').length).toBeGreaterThanOrEqual(1);

    // Deltas
    expect(screen.getByText('+0.5 kg')).toBeInTheDocument();
    expect(screen.getByText('+2 cm')).toBeInTheDocument();
    expect(screen.getByText('+0.5 cm')).toBeInTheDocument();

    // History record rendered
    expect(screen.getByText('8 tháng 26 ngày')).toBeInTheDocument();
    expect(screen.getByText('Bé ăn ngủ ngoan')).toBeInTheDocument();
  });



  it('switches chart metric pills between Weight, Height, and Head Circumference', () => {
    render(<GrowthView onOpenAddMeasurement={vi.fn()} />);

    const weightPill = screen.getByRole('button', { name: /Cân nặng/i });
    const heightPill = screen.getByRole('button', { name: /Chiều cao/i });
    expect(weightPill).toHaveAttribute('aria-pressed', 'true');
    expect(heightPill).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(heightPill);
    expect(screen.getByText(/WHOChart metric: height/i)).toBeInTheDocument();
    expect(weightPill).toHaveAttribute('aria-pressed', 'false');
    expect(heightPill).toHaveAttribute('aria-pressed', 'true');

    const headPill = screen.getByRole('button', { name: /Vòng đầu/i });
    fireEvent.click(headPill);
    expect(screen.getByText(/WHOChart metric: headCirc/i)).toBeInTheDocument();
  });
});
