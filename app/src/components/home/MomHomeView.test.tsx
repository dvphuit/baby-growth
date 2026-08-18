import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MomHomeView } from './MomHomeView';
import type { MomActivity } from '@/types';

let records: MomActivity[] = [];

vi.mock('@/store/useActivityStore', () => ({
  useActivityStore: (selector: (state: { momActivities: MomActivity[] }) => unknown) => selector({ momActivities: records }),
}));

describe('MomHomeView', () => {
  beforeEach(() => { records = []; });

  it('shows honest empty states instead of wellness demo values', () => {
    render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />);
    expect(screen.getAllByText('Chưa ghi nhận').length).toBeGreaterThanOrEqual(4);
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
    render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />);
    expect(screen.getByText('200 ml · 2 cữ')).toBeInTheDocument();
    expect(screen.getByText('3g 0p')).toBeInTheDocument();
    expect(screen.getByText('Tốt')).toBeInTheDocument();
  });

  it('keeps pumping as a primary action', () => {
    const onOpenPumping = vi.fn();
    render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={onOpenPumping} onOpenAiChat={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '+ Hút sữa' }));
    expect(onOpenPumping).toHaveBeenCalledTimes(1);
  });

  it('does not show previous-day records in today diary', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    records = [
      { id: 'today-mood', owner: 'mom', type: 'mood', mood: 'good', occurredAt: now.toISOString(), createdAt: now.toISOString() },
      { id: 'old-note', owner: 'mom', type: 'recovery_note', note: 'Ghi chú hôm qua', occurredAt: yesterday.toISOString(), createdAt: yesterday.toISOString() },
    ];

    render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Dòng thời gian' })).toBeInTheDocument();
    expect(screen.getAllByText('Tâm trạng').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Ghi chú hôm qua/i)).not.toBeInTheDocument();
  });

  it('uses the shared notebook timeline for mom activities', () => {
    const early = new Date();
    early.setHours(7, 0, 0, 0);
    const late = new Date();
    late.setHours(18, 0, 0, 0);
    records = [
      { id: 'late-mood', owner: 'mom', type: 'mood', mood: 'good', occurredAt: late.toISOString(), createdAt: late.toISOString() },
      { id: 'early-pump', owner: 'mom', type: 'pumping', amountMl: 90, side: 'both', occurredAt: early.toISOString(), createdAt: early.toISOString() },
    ];

    const { container } = render(
      <MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />,
    );

    expect(container.querySelector('.journal-story.owner-mom.haven-home-notebook')).toBeInTheDocument();
    expect(container.querySelector('.haven-activity-list')).not.toBeInTheDocument();
    expect([...container.querySelectorAll('.journal-story-time')].map((node) => node.textContent)).toEqual(['07:00', '18:00']);
  });
});
