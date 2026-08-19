import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MomHomeView } from './MomHomeView';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { MomActivity, TimelineItem } from '@/types';

let records: MomActivity[] = [];

vi.mock('@/store/useActivityStore', () => ({
  useActivityStore: (selector: (state: { momActivities: MomActivity[] }) => unknown) => selector({ momActivities: records }),
}));

describe('MomHomeView', () => {
  beforeEach(() => {
    records = [];
    useTimelineStore.setState({ timelineItems: [] });
  });

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

  it('shows only mom moments from today on the mom Home timeline', () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const base: TimelineItem = {
      id: 'mom-home-moment', owner: 'mom', date, timeFormatted: '16:20', time: `${date} • 16:20`,
      author: 'Mẹ', authorAvatar: '/mom.jpg', title: 'Một phút thư giãn', content: 'Mẹ nghỉ một chút.',
      mediaItems: [], mediaUrl: null, mediaType: null, stats: [], likes: 0, comments: 0, userLiked: false,
      tag: 'Của mẹ', tagType: 'mom', type: 'mom',
    };
    useTimelineStore.setState({ timelineItems: [
      base,
      { ...base, id: 'baby-hidden', owner: 'baby', title: 'Khoảnh khắc của bé', tagType: 'general', type: 'daily' },
    ] });

    render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Một phút thư giãn, 16:20' })).toBeInTheDocument();
    expect(screen.queryByText('Khoảnh khắc của bé')).not.toBeInTheDocument();
  });

  it('allows clicking mom timeline items on Home to view detail and edit', () => {
    const now = new Date().toISOString();
    records = [
      { id: 'pump-test', owner: 'mom', type: 'pumping', amountMl: 120, side: 'both', occurredAt: now, createdAt: now },
    ];
    const { container } = render(<MomHomeView onOpenScoreDetail={vi.fn()} onOpenPumping={vi.fn()} onOpenAiChat={vi.fn()} />);

    const itemButton = container.querySelector('.journal-story-main') as HTMLButtonElement;
    expect(itemButton).toBeInTheDocument();
    fireEvent.click(itemButton);

    // Verify detail dialog is opened
    expect(screen.getByRole('dialog', { name: /Hút sữa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chỉnh sửa/i })).toBeInTheDocument();

    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeInTheDocument();
  });
});
