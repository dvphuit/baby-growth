import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MomentMediaPreview } from '@/features/timeline/components/MomentMediaPreview';
import type { TimelineMediaItem } from '@/types';

describe('MomentMediaPreview', () => {
  it('opens the tapped media with the active shared-layout identity', () => {
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
      { id: 'photo-2', type: 'photo', url: 'https://example.com/two.jpg' },
      { id: 'photo-3', type: 'photo', url: 'https://example.com/three.jpg' },
    ];

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 1,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-2',
          originSrc: items[1].url ?? '',
          getLayoutId: (index, media) => `moment-test-${media.id ?? index}`,
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Khoảnh khắc, ảnh 2' })).toHaveAttribute(
      'src',
      'https://example.com/two.jpg',
    );
    expect(screen.getByRole('img', { name: 'Khoảnh khắc, ảnh 2' })).toHaveAttribute(
      'data-layout-id',
      'moment-test-photo-2',
    );
  });

  it('updates the active shared-layout identity while navigating', async () => {
    const onClose = vi.fn();
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
      { id: 'photo-2', type: 'photo', url: 'https://example.com/two.jpg' },
      { id: 'video-3', type: 'video', url: 'https://example.com/three.mp4' },
    ];

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 0,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-1',
          originSrc: items[0].url ?? '',
          getLayoutId: (index, media) => `moment-test-${media.id ?? index}`,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Khoảnh khắc, ảnh 1' })).toHaveAttribute(
      'data-layout-id',
      'moment-test-photo-1',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Media kế tiếp' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Khoảnh khắc, ảnh 2' })).toHaveAttribute(
      'src',
      'https://example.com/two.jpg',
    );
    expect(screen.getByRole('img', { name: 'Khoảnh khắc, ảnh 2' })).toHaveAttribute(
      'data-layout-id',
      'moment-test-photo-2',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xem media 3' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    const videoElement = document.querySelector('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', 'https://example.com/three.mp4');
    expect(videoElement).toHaveAttribute('data-layout-id', 'moment-test-video-3');

    fireEvent.click(screen.getByRole('button', { name: 'Media trước' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('settles at the latest page after rapid navigation', () => {
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
      { id: 'photo-2', type: 'photo', url: 'https://example.com/two.jpg' },
      { id: 'photo-3', type: 'photo', url: 'https://example.com/three.jpg' },
    ];

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 0,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-1',
          originSrc: items[0].url ?? '',
        }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Media kế tiếp' }));
    fireEvent.click(screen.getByRole('button', { name: 'Media kế tiếp' }));

    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('renders media beyond the visible thumbnail set', () => {
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
      { id: 'photo-2', type: 'photo', url: 'https://example.com/two.jpg' },
      { id: 'photo-3', type: 'photo', url: 'https://example.com/three.jpg' },
      { id: 'photo-4', type: 'photo', url: 'https://example.com/four.jpg' },
      { id: 'photo-5', type: 'photo', url: 'https://example.com/five.jpg' },
      { id: 'photo-6', type: 'photo', url: 'https://example.com/six.jpg' },
      { id: 'photo-7', type: 'photo', url: 'https://example.com/seven.jpg' },
    ];
    const visibleItems = items.slice(0, 4);

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 3,
          title: 'Khoảnh khắc 7 ảnh',
          layoutId: 'moment-timeline-entry1-photo-4',
          originSrc: items[3].url ?? '',
          getLayoutId: (index) => {
            const targetIndex = Math.min(index, visibleItems.length - 1);
            const targetMedia = visibleItems[targetIndex] ?? items[0];
            return `moment-timeline-entry1-${targetMedia.id ?? targetIndex}`;
          },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('4 / 7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Media kế tiếp' }));
    expect(screen.getByText('5 / 7')).toBeInTheDocument();

    const activeImg = screen.getByRole('img', { name: 'Khoảnh khắc 7 ảnh, ảnh 5' });
    expect(activeImg).toBeInTheDocument();
    expect(activeImg).toHaveAttribute('src', 'https://example.com/five.jpg');
  });

  it('closes preview after the close button animation finishes', async () => {
    const onClose = vi.fn();
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
    ];

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 0,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-1',
          originSrc: items[0].url ?? '',
        }}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đóng preview' }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('closes preview when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
    ];

    render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 0,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-1',
          originSrc: items[0].url ?? '',
        }}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đóng xem media' }));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('unmounts cleanly and restores document.body overflow when preview becomes null', async () => {
    const onClose = vi.fn();
    const items: TimelineMediaItem[] = [
      { id: 'photo-1', type: 'photo', url: 'https://example.com/one.jpg' },
    ];

    const { rerender } = render(
      <MomentMediaPreview
        preview={{
          items,
          initialIndex: 0,
          title: 'Khoảnh khắc',
          layoutId: 'moment-test-photo-1',
          originSrc: items[0].url ?? '',
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Xem media Khoảnh khắc' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<MomentMediaPreview preview={null} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Xem media Khoảnh khắc' })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });
});
