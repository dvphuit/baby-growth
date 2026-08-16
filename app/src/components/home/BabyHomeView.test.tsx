import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BabyHomeView } from './BabyHomeView';
import type { BabyActivity } from '@/types';

let records: BabyActivity[] = [];

vi.mock('@/store/useActivityStore', () => ({
  useActivityStore: (selector: (state: { babyActivities: BabyActivity[] }) => unknown) => selector({ babyActivities: records }),
}));

function feeding(id: string, amountMl: number, hour: number): BabyActivity {
  const now = new Date();
  now.setHours(hour, 0, 0, 0);
  return { id, owner: 'baby', type: 'feeding', amountMl, method: 'bottle', occurredAt: now.toISOString(), createdAt: now.toISOString() };
}

function renderView(onOpenQuickLog = vi.fn()) {
  render(<BabyHomeView onOpenScoreDetail={vi.fn()} onOpenQuickLog={onOpenQuickLog} onOpenAiChat={vi.fn()} />);
  return onOpenQuickLog;
}

describe('BabyHomeView', () => {
  beforeEach(() => { records = []; });

  it('shows honest empty states when there are no records', () => {
    renderView();
    expect(screen.getAllByText('Chưa ghi nhận').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Chưa có dữ liệu được ghi nhận.')).toBeInTheDocument();
    expect(screen.queryByText(/540 ml|12h 30p|Growth Score|AI/)).not.toBeInTheDocument();
  });

  it('derives today metrics from persisted activity records', () => {
    const now = new Date();
    records = [
      feeding('f1', 90, 8),
      feeding('f2', 60, 11),
      { id: 'd1', owner: 'baby', type: 'diaper', diaperKind: 'wet', occurredAt: now.toISOString(), createdAt: now.toISOString() },
      { id: 's1', owner: 'baby', type: 'sleep', durationMinutes: 90, occurredAt: now.toISOString(), createdAt: now.toISOString() },
    ];
    renderView();
    expect(screen.getByText('150 ml · 2 cữ')).toBeInTheDocument();
    expect(screen.getByText('1g 30p')).toBeInTheDocument();
    expect(screen.getByText('1 lần')).toBeInTheDocument();
  });

  it('opens Quick Log from the primary action', () => {
    const onOpenQuickLog = renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Ghi nhanh' }));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });
});
