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
    expect(screen.getByRole('progressbar', { name: 'Tiến độ lượng sữa' }).parentElement).toHaveTextContent('0 ml');
    expect(screen.getByRole('progressbar', { name: 'Tiến độ giấc ngủ' }).parentElement).toHaveTextContent('0 phút');
    expect(screen.getByText('Chưa có dữ liệu được ghi nhận.')).toBeInTheDocument();
    expect(screen.queryByText(/540 ml|12h 30p|Growth Score|AI/)).not.toBeInTheDocument();
    expect(screen.queryByText(/hôm nay/i)).not.toBeInTheDocument();
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
    expect(screen.getByRole('progressbar', { name: 'Tiến độ lượng sữa' }).parentElement).toHaveTextContent('150 ml');
    expect(screen.getByRole('progressbar', { name: 'Tiến độ lượng sữa' }).parentElement).toHaveTextContent('2 cữ');
    expect(screen.getByRole('progressbar', { name: 'Tiến độ giấc ngủ' }).parentElement).toHaveTextContent('1g 30p');
    expect(screen.getByText('1 lần')).toBeInTheDocument();
  });

  it('opens Quick Log from the primary action', () => {
    const onOpenQuickLog = renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Ghi nhanh' }));
    expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
  });

  it('shows only today records in the home diary', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    records = [
      feeding('today-feeding', 90, 8),
      {
        id: 'yesterday-note', owner: 'baby', type: 'health_note', note: 'Nội dung của hôm qua',
        occurredAt: yesterday.toISOString(), createdAt: yesterday.toISOString(),
      },
    ];

    renderView();

    expect(screen.getByRole('heading', { name: 'Dòng thời gian' })).toBeInTheDocument();
    expect(screen.getByText('Cữ bú')).toBeInTheDocument();
    expect(screen.queryByText(/Nội dung của hôm qua/i)).not.toBeInTheDocument();
  });

  it('uses the shared notebook timeline in chronological order', () => {
    records = [feeding('late-feeding', 60, 11), feeding('early-feeding', 90, 7)];

    const { container } = render(
      <BabyHomeView onOpenScoreDetail={vi.fn()} onOpenQuickLog={vi.fn()} onOpenAiChat={vi.fn()} />,
    );

    expect(container.querySelector('.journal-story.owner-baby.haven-home-notebook')).toBeInTheDocument();
    expect(container.querySelector('.haven-activity-list')).not.toBeInTheDocument();
    expect([...container.querySelectorAll('.journal-story-time')].map((node) => node.textContent)).toEqual(['07:00', '11:00']);
  });
});
