import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import type { GrowthHistoryRecord, TimelineItem } from '@/types';
import { TimelineView } from './TimelineView';

function createMoment(overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id: 'moment-test', owner: 'baby', date: '2026-08-18', timeFormatted: '09:15',
    time: '18/08/2026 • 09:15', author: 'Mẹ', authorAvatar: '/mom.jpg',
    title: 'Nụ cười buổi sáng', content: 'Bé cười rất tươi khi vừa thức dậy.',
    mediaUrl: 'https://example.com/moment.jpg', mediaType: 'photo', stats: [],
    likes: 0, comments: 0, userLiked: false, tag: 'Khoảnh khắc', tagType: 'general', type: 'daily',
    ...overrides,
  };
}

describe('TimelineView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 18, 10, 0, 0));
    useActivityStore.getState().resetTrackingData();
    useTimelineStore.getState().resetTrackingData();
    useBabyStore.getState().resetToDefaults();
    useUIStore.setState({ profileMode: 'baby' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('follows the baby and mom switch in the app bar without duplicate controls', () => {
    render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    expect(screen.queryByRole('tablist', { name: 'Chọn nhật ký' })).not.toBeInTheDocument();
    expect(screen.getByText('Chưa có nhật ký của bé trong ngày này')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ghi mới|Ghi thêm|Ghi lại khoảnh khắc/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Tóm tắt nhật ký đang xem')).not.toBeInTheDocument();

    act(() => {
      useUIStore.setState({ profileMode: 'mom' });
    });
    expect(screen.getByText('Chưa có nhật ký của mẹ trong ngày này')).toBeInTheDocument();
    expect(screen.getByText('Ghi nhận mới sẽ được thêm từ Trang chủ.')).toBeInTheDocument();
  });

  it('renders seven quick-select days and supports a date range in the full calendar', () => {
    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    const strip = screen.getByRole('group', { name: '7 ngày quanh ngày đang chọn' });
    const dayButtons = within(strip).getAllByRole('button');
    expect(dayButtons).toHaveLength(7);
    expect(dayButtons[0]).toHaveAccessibleName(/15 tháng 8, 2026/i);
    expect(dayButtons[0]).toHaveClass('weekend');
    expect(dayButtons[1]).toHaveClass('weekend');
    expect(dayButtons[3]).toHaveAttribute('aria-pressed', 'true');
    expect(dayButtons[6]).toHaveAccessibleName(/21 tháng 8, 2026/i);

    fireEvent.pointerDown(strip, { clientX: 100 });
    fireEvent.pointerMove(strip, { clientX: 190 });
    fireEvent.pointerUp(strip, { clientX: 240 });
    fireEvent.transitionEnd(container.querySelector('.journal-week-track')!);
    expect(screen.getByRole('button', { name: /11 tháng 8, 2026/i })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Hôm nay' }));
    expect(screen.getByRole('button', { name: /18 tháng 8, 2026/i })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Mở lịch' }));
    expect(container.querySelector('.journal-calendar-switch')).toHaveClass('expanded');
    expect(screen.getByRole('grid', { name: 'Chọn khoảng ngày' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thu gọn' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('gridcell', { name: /Chủ Nhật, 16 tháng 8, 2026/i }));
    fireEvent.click(screen.getByRole('gridcell', { name: /Thứ Ba, 18 tháng 8, 2026/i }));
    expect(screen.getByText('Chưa có nhật ký của bé trong khoảng này')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /16 tháng 8, 2026.*18 tháng 8, 2026/i })).toBeInTheDocument();
    expect(container.querySelector('.journal-day-header > div')).not.toBeInTheDocument();
  });

  it('shows a modal detail, dismisses outside, and edits the selected record', () => {
    const feeding = useActivityStore.getState().addBabyActivity({
      owner: 'baby', type: 'feeding', occurredAt: new Date(2026, 7, 18, 8, 0, 0).toISOString(),
      amountMl: 90, method: 'bottle', note: 'Bú sáng',
    });
    useActivityStore.getState().addBabyActivity({
      owner: 'baby', type: 'diaper', occurredAt: new Date(2026, 7, 18, 9, 0, 0).toISOString(),
      diaperKind: 'wet', note: 'Tã sáng',
    });
    render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Cữ bú/ }));
    const feedingDetail = screen.getByRole('dialog', { name: 'Cữ bú' });
    expect(feedingDetail).toHaveAttribute('aria-modal', 'true');
    expect(within(feedingDetail).getByText('Bú sáng')).toBeInTheDocument();

    const backdrop = document.querySelector('.haven-dialog-backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.pointerDown(backdrop!);
    expect(screen.getByRole('dialog', { name: 'Cữ bú' })).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(screen.queryByRole('dialog', { name: 'Cữ bú' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Thay tã/ }));
    const diaperDetail = screen.getByRole('dialog', { name: 'Thay tã' });
    expect(diaperDetail).toBeInTheDocument();
    expect(within(diaperDetail).getByText('Tã sáng')).toBeInTheDocument();

    fireEvent.click(diaperDetail.querySelector('.haven-dialog-secondary')!);
    fireEvent.click(screen.getByRole('button', { name: /Cữ bú/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }));
    fireEvent.change(screen.getByLabelText('Lượng sữa (ml)'), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText('Ghi chú'), { target: { value: 'Bú rất tốt' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    const updated = useActivityStore.getState().babyActivities.find((record) => record.id === feeding.id);
    expect(updated).toMatchObject({ amountMl: 120, note: 'Bú rất tốt' });
    expect(screen.getAllByText('120 ml').length).toBeGreaterThanOrEqual(1);
    expect(within(screen.getByRole('dialog', { name: 'Cữ bú' })).getByText('Bú rất tốt')).toBeInTheDocument();
  });

  it('edits a growth timeline item and keeps growth data in sync', () => {
    const growthRecord: GrowthHistoryRecord = {
      id: 'growth-edit-test', date: '2026-08-18', ageText: '8 tháng', weight: 9,
      height: 72, headCirc: 44.5, percentileLabel: '', status: 'optimal', note: 'Lần đo sáng',
    };
    const state = useBabyStore.getState();
    useBabyStore.setState({
      stages: {
        ...state.stages,
        [state.currentStage]: { ...state.stages[state.currentStage], growthHistory: [growthRecord] },
      },
    });
    render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Cân đo tăng trưởng/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }));
    fireEvent.change(screen.getByLabelText('Cân nặng (kg)'), { target: { value: '9.4' } });
    fireEvent.change(screen.getByLabelText('Ghi chú'), { target: { value: 'Đã cập nhật số đo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    const updated = useBabyStore.getState().currentStageData().growthHistory[0];
    expect(updated).toMatchObject({ id: growthRecord.id, weight: 9.4, note: 'Đã cập nhật số đo' });
    expect(useBabyStore.getState().currentStageData().todayVitals.weight).toBe('9.4 kg');
  });

  it('renders a photo moment, opens media, and edits its story', () => {
    const onOpenLightbox = vi.fn();
    useTimelineStore.setState({ timelineItems: [createMoment()] });
    render(<TimelineView onOpenLightbox={onOpenLightbox} onOpenAddEntry={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mở ảnh Nụ cười buổi sáng' }));
    expect(onOpenLightbox).toHaveBeenCalledWith('https://example.com/moment.jpg', false);

    fireEvent.click(screen.getByRole('button', { name: /Nụ cười buổi sáng, 09:15/ }));
    const detail = screen.getByRole('dialog', { name: 'Nụ cười buổi sáng' });
    expect(within(detail).getByText('Bé cười rất tươi khi vừa thức dậy.')).toBeInTheDocument();
    fireEvent.click(within(detail).getByRole('button', { name: 'Chỉnh sửa' }));
    expect(detail.querySelector('.journal-edit-media-row')).toBeInTheDocument();
    expect(within(detail).getByLabelText('Chọn từ thư viện')).toHaveAttribute('multiple');
    expect(within(detail).getByLabelText('Chụp ảnh')).toHaveAttribute('capture', 'environment');
    fireEvent.change(screen.getByLabelText('Tiêu đề'), { target: { value: 'Nụ cười đầu ngày' } });
    fireEvent.change(screen.getByLabelText('Câu chuyện'), { target: { value: 'Một khoảnh khắc thật dịu dàng.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(useTimelineStore.getState().timelineItems[0]).toMatchObject({
      title: 'Nụ cười đầu ngày', content: 'Một khoảnh khắc thật dịu dàng.',
    });
    expect(screen.getByRole('dialog', { name: 'Nụ cười đầu ngày' })).toBeInTheDocument();
  });

  it('shows multiple photo and video frames in a face-aware bento grid', () => {
    const onOpenLightbox = vi.fn();
    useTimelineStore.setState({ timelineItems: [createMoment({
      mediaItems: [
        { id: 'photo-one', url: 'https://example.com/one.jpg', type: 'photo', focalX: 42, focalY: 31 },
        { id: 'video-two', url: 'https://example.com/two.mp4', type: 'video' },
      ],
      mediaUrl: 'https://example.com/one.jpg',
      mediaType: 'photo',
    })] });
    const { container } = render(<TimelineView onOpenLightbox={onOpenLightbox} onOpenAddEntry={vi.fn()} />);

    const bento = container.querySelector('.journal-story-media-bento.count-2');
    const frames = [...container.querySelectorAll<HTMLElement>('.journal-story-media-bento .journal-story-media')];
    expect(bento).toBeInTheDocument();
    expect(frames).toHaveLength(2);
    expect(frames[0].querySelector('img')).toHaveStyle({ objectPosition: '42% 31%' });
    fireEvent.click(screen.getByRole('button', { name: 'Mở video 2 của Nụ cười buổi sáng' }));
    expect(onOpenLightbox).toHaveBeenCalledWith('https://example.com/two.mp4', true);

    fireEvent.click(screen.getByRole('button', { name: /Nụ cười buổi sáng, 09:15/ }));
    expect(screen.getByRole('dialog', { name: 'Nụ cười buổi sáng' }).querySelectorAll('.journal-detail-media-item')).toHaveLength(2);
  });

  it('uses one Daily Story structure for care records and moments', () => {
    useActivityStore.getState().addBabyActivity({
      owner: 'baby', type: 'feeding', occurredAt: new Date(2026, 7, 18, 8, 0, 0).toISOString(),
      amountMl: 90, method: 'bottle', note: 'Bú sáng',
    });
    useTimelineStore.setState({ timelineItems: [createMoment()] });
    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    expect(container.querySelector('.journal-story')).toBeInTheDocument();
    expect(container.querySelector('.journal-timeline')).not.toBeInTheDocument();
    const nodes = [...container.querySelectorAll('.journal-story-item')];
    expect(nodes).toHaveLength(2);
    nodes.forEach((node) => {
      expect(node.querySelector('.journal-story-content')).toBeInTheDocument();
      expect(node.querySelector('.journal-story-main')).toBeInTheDocument();
      expect(node.querySelector('.journal-story-title')).toBeInTheDocument();
    });
    expect(container.querySelector('.journal-story-item.is-moment .journal-story-media')).toBeInTheDocument();
  });

  it('orders a day by time periods without rendering period labels', () => {
    [8, 14, 20].forEach((hour, index) => {
      useActivityStore.getState().addBabyActivity({
        owner: 'baby', type: 'diaper', occurredAt: new Date(2026, 7, 18, hour, 0, 0).toISOString(),
        diaperKind: 'wet', note: `Ghi nhận ${index + 1}`,
      });
    });
    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    expect(screen.queryByText('Buổi sáng')).not.toBeInTheDocument();
    expect(screen.queryByText('Buổi chiều')).not.toBeInTheDocument();
    expect(screen.queryByText('Buổi tối')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.journal-period')).toHaveLength(3);
    expect(container.querySelectorAll('.journal-story')).toHaveLength(1);
    expect(container.querySelectorAll('.journal-period-items')).toHaveLength(3);
  });

  it('starts the notebook gradient at night when the first entry is at midnight', () => {
    [0, 7].forEach((hour) => {
      useActivityStore.getState().addBabyActivity({
        owner: 'baby', type: 'diaper', occurredAt: new Date(2026, 7, 18, hour, 0, 0).toISOString(),
        diaperKind: 'wet', note: `Ghi nhận lúc ${hour}h`,
      });
    });
    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    const story = container.querySelector<HTMLElement>('.journal-story');
    expect(story?.style.getPropertyValue('--journal-time-gradient')).toMatch(
      /^linear-gradient\(180deg, #e4e6ef 0%/,
    );
  });

  it('starts the notebook gradient at the actual first-entry time', () => {
    [7, 11].forEach((hour) => {
      useActivityStore.getState().addBabyActivity({
        owner: 'baby', type: 'diaper', occurredAt: new Date(2026, 7, 18, hour, 0, 0).toISOString(),
        diaperKind: 'wet', note: `Ghi nhận lúc ${hour}h`,
      });
    });
    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);

    const gradient = container.querySelector<HTMLElement>('.journal-story')
      ?.style.getPropertyValue('--journal-time-gradient');
    expect(gradient).toMatch(/^linear-gradient\(180deg, #feeee1 0%/);
    expect(gradient).not.toContain('#e4e6ef 0%');
  });

  it('anchors a distant 07:00 entry to its own daytime color', () => {
    [1, 7].forEach((hour) => {
      useActivityStore.getState().addBabyActivity({
        owner: 'baby', type: 'diaper', occurredAt: new Date(2026, 7, 18, hour, 0, 0).toISOString(),
        diaperKind: 'wet', note: `Ghi nhận lúc ${hour}h`,
      });
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getRect(this: HTMLElement) {
      if (this.classList.contains('journal-story')) {
        return { top: 0, bottom: 240, left: 0, right: 320, width: 320, height: 240, x: 0, y: 0, toJSON: () => ({}) };
      }
      if (this.classList.contains('journal-story-icon')) {
        const occurredAt = this.closest('.journal-story-item')?.querySelector('time')?.dateTime ?? '';
        const top = new Date(occurredAt).getHours() === 1 ? 40 : 140;
        return { top, bottom: top + 32, left: 70, right: 102, width: 32, height: 32, x: 70, y: top, toJSON: () => ({}) };
      }
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) };
    });

    const { container } = render(<TimelineView onOpenLightbox={vi.fn()} onOpenAddEntry={vi.fn()} />);
    const gradient = container.querySelector<HTMLElement>('.journal-story')
      ?.style.getPropertyValue('--journal-time-gradient');

    expect(gradient).toContain('#feeee1 58.3%');
    expect(gradient).toMatch(/#feeee1 58\.3%, #feeee1 100%\)$/);
  });

  it('filters moments by the app bar profile and opens video media', async () => {
    const onOpenLightbox = vi.fn();
    useTimelineStore.setState({ timelineItems: [
      createMoment(),
      createMoment({
        id: 'mom-video', owner: 'mom', title: 'Một phút của mẹ', content: 'Mẹ tập thở.',
        timeFormatted: '10:20', time: '18/08/2026 • 10:20', mediaUrl: 'https://example.com/mom.mp4', mediaType: 'video',
        tag: 'Của mẹ', tagType: 'mom', type: 'mom',
      }),
    ] });
    render(<TimelineView onOpenLightbox={onOpenLightbox} onOpenAddEntry={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Nụ cười buổi sáng, 09:15/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Một phút của mẹ, 10:20/ })).not.toBeInTheDocument();

    await act(async () => useUIStore.setState({ profileMode: 'mom' }));
    expect(screen.queryByRole('button', { name: /Nụ cười buổi sáng, 09:15/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở video Một phút của mẹ' }));
    expect(onOpenLightbox).toHaveBeenCalledWith('https://example.com/mom.mp4', true);
  });
});
