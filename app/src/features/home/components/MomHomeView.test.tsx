import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MomHomeView } from './MomHomeView';
import type { MomActivity } from '@/types';

let records: MomActivity[] = [];

vi.mock('@/features/activities/store/useActivityStore', () => ({
  useActivityStore: (selector: (state: { momActivities: MomActivity[] }) => unknown) => selector({ momActivities: records }),
}));

vi.mock('./IdleHomeTimelinePreview', () => ({
  IdleHomeTimelinePreview: ({
    owner,
    onAddActivity,
  }: {
    owner: 'baby' | 'mom';
    onAddActivity: () => void;
  }) => (
    <button
      type="button"
      data-testid="idle-home-timeline"
      data-owner={owner}
      onClick={onAddActivity}
    >
      Deferred timeline
    </button>
  ),
}));

function renderView(onOpenPumping = vi.fn()) {
  render(<MomHomeView onOpenPumping={onOpenPumping} />);
  return onOpenPumping;
}

describe('MomHomeView', () => {
  beforeEach(() => {
    records = [];
  });

  it('shows honest empty states instead of wellness demo values', () => {
    renderView();
    expect(screen.getAllByText('Chưa ghi nhận').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('0 hoạt động')).toBeInTheDocument();
    expect(screen.queryByText(/4.85 L|7.5h|Wellness|EPDS/)).not.toBeInTheDocument();
    expect(screen.queryByText(/hôm nay/i)).not.toBeInTheDocument();
  });

  it('derives pumping, sleep and mood from persisted records', () => {
    const now = new Date().toISOString();
    records = [
      { id: 'p1', owner: 'mom', type: 'pumping', amountMl: 120, side: 'both', occurredAt: now, createdAt: now },
      { id: 'p2', owner: 'mom', type: 'pumping', amountMl: 80, side: 'left', occurredAt: now, createdAt: now },
      { id: 's1', owner: 'mom', type: 'sleep', durationMinutes: 180, occurredAt: now, createdAt: now },
      { id: 'm1', owner: 'mom', type: 'mood', mood: 'good', occurredAt: now, createdAt: now },
    ];

    renderView();

    expect(screen.getByText('200 ml · 2 cữ')).toBeInTheDocument();
    expect(screen.getByText('3g 0p')).toBeInTheDocument();
    expect(screen.getByText('Tốt')).toBeInTheDocument();
    expect(screen.getByText('4 hoạt động')).toBeInTheDocument();
  });

  it('keeps pumping as a primary action', () => {
    const onOpenPumping = renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Hút sữa' }));
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
  });

  it('counts only current-day activities before the timeline runtime loads', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    records = [
      { id: 'today-mood', owner: 'mom', type: 'mood', mood: 'good', occurredAt: now.toISOString(), createdAt: now.toISOString() },
      { id: 'old-note', owner: 'mom', type: 'recovery_note', note: 'Ghi chú hôm qua', occurredAt: yesterday.toISOString(), createdAt: yesterday.toISOString() },
    ];

    renderView();

    expect(screen.getByText('1 hoạt động')).toBeInTheDocument();
    expect(screen.queryByText(/Ghi chú hôm qua/i)).not.toBeInTheDocument();
  });

  it('delegates the mom timeline to the shared idle boundary', () => {
    const onOpenPumping = renderView();
    const timelineBoundary = screen.getByTestId('idle-home-timeline');

    expect(timelineBoundary).toHaveAttribute('data-owner', 'mom');
    fireEvent.click(timelineBoundary);
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
  });
});
