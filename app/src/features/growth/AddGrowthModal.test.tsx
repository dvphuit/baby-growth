import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';
import { AddGrowthModal } from './AddGrowthModal';

describe('AddGrowthModal', () => {
  beforeEach(() => {
    useGrowthStore.getState().resetToDefaults();
  });

  it('renders the themed metric cards and updates a measurement', async () => {
    const user = userEvent.setup();
    render(
      <AddGrowthModal
        isOpen
        onClose={vi.fn()}
        onSuccessToast={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Cân đo tăng trưởng' }))
      .toHaveClass('kinly-themed-sheet', 'growth-bottom-sheet');

    const weightInput = screen.getByRole('spinbutton', { name: 'Cân nặng (kg)' });
    const weightCard = weightInput.closest('.growth-metric-card');
    expect(weightCard).toHaveClass('tone-weight');
    expect(screen.getByRole('spinbutton', { name: 'Chiều cao (cm)' }).closest('.growth-metric-card'))
      .toHaveClass('tone-height');
    expect(screen.getByRole('spinbutton', { name: 'Vòng đầu (cm)' }).closest('.growth-metric-card'))
      .toHaveClass('tone-head');

    const initialWeight = Number(weightInput.getAttribute('value'));
    await user.click(screen.getByRole('button', { name: 'Tăng cân nặng' }));
    expect(weightInput).toHaveValue(initialWeight + 0.1);
  });
});
