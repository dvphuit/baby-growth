import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MilestoneRoadmap } from './MilestoneRoadmap';
import { useGrowthStore } from '@/features/growth/store/useGrowthStore';

describe('MilestoneRoadmap', () => {
  beforeEach(() => {
    useGrowthStore.getState().resetToDefaults();
  });

  it('renders milestone cards and allows toggling status', () => {
    render(<MilestoneRoadmap />);

    expect(screen.getByText('CỘT MỐC VẬN ĐỘNG')).toBeInTheDocument();
    expect(screen.getByText('Phát triển thể chất')).toBeInTheDocument();

    // Check first milestone
    const rollTitle = screen.getByText(/Lẫy & Lật người/i);
    expect(rollTitle).toBeInTheDocument();

    const toggleBtn = screen.getAllByRole('button', { name: /Trạng thái:/i })[0];
    expect(toggleBtn).toBeInTheDocument();

    // Toggle milestone
    fireEvent.click(toggleBtn);

    // Store was updated
    const state = useGrowthStore.getState();
    const stage = state.currentStageData();
    expect(stage.motorMilestones.items[0].status).not.toBe('upcoming');
  });
});


