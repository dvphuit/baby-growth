import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBabyStore } from '@/store/useBabyStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useUIStore } from '@/store/useUIStore';
import { AddPostModal } from './AddPostModal';

describe('AddPostModal', () => {
  beforeEach(() => {
    useTimelineStore.getState().resetTrackingData();
    useBabyStore.getState().resetToDefaults();
    useUIStore.setState({ profileMode: 'mom' });
  });

  it('creates a dated video moment for the active profile', () => {
    const onClose = vi.fn();
    const onSuccessToast = vi.fn();
    render(<AddPostModal isOpen onClose={onClose} onSuccessToast={onSuccessToast} />);

    fireEvent.change(screen.getByLabelText('Ngày'), { target: { value: '2026-08-17' } });
    fireEvent.change(screen.getByLabelText('Thời gian'), { target: { value: '20:30' } });
    fireEvent.change(screen.getByLabelText('Tiêu đề khoảnh khắc'), { target: { value: 'Mẹ và một phút bình yên' } });
    fireEvent.change(screen.getByLabelText('Câu chuyện'), { target: { value: 'Một đoạn video ngắn trước giờ ngủ.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByPlaceholderText('Hoặc dán URL video'), { target: { value: 'https://example.com/moment.mp4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu khoảnh khắc' }));

    expect(useTimelineStore.getState().timelineItems[0]).toMatchObject({
      owner: 'mom', date: '2026-08-17', timeFormatted: '20:30',
      title: 'Mẹ và một phút bình yên', content: 'Một đoạn video ngắn trước giờ ngủ.',
      mediaUrl: 'https://example.com/moment.mp4', mediaType: 'video',
    });
    expect(onSuccessToast).toHaveBeenCalledWith('Đã lưu khoảnh khắc “Mẹ và một phút bình yên”.');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stores multiple photos and videos in one moment', () => {
    render(<AddPostModal isOpen onClose={vi.fn()} onSuccessToast={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Tiêu đề khoảnh khắc'), { target: { value: 'Một buổi chiều nhiều khoảnh khắc' } });
    fireEvent.change(screen.getByPlaceholderText('Hoặc dán URL ảnh'), { target: { value: 'https://example.com/photo.jpg' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm media từ URL' }));
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByPlaceholderText('Hoặc dán URL video'), { target: { value: 'https://example.com/video.mp4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu khoảnh khắc' }));

    expect(useTimelineStore.getState().timelineItems[0]).toMatchObject({
      mediaUrl: 'https://example.com/photo.jpg',
      mediaType: 'photo',
      mediaItems: [
        { url: 'https://example.com/photo.jpg', type: 'photo' },
        { url: 'https://example.com/video.mp4', type: 'video' },
      ],
    });
  });

  it('offers gallery and rear-camera media inputs', () => {
    render(<AddPostModal isOpen onClose={vi.fn()} onSuccessToast={vi.fn()} />);

    expect(screen.getByLabelText('Chọn từ thư viện')).toHaveAttribute('multiple');
    expect(screen.getByLabelText('Chọn từ thư viện')).toHaveAttribute('accept', 'image/*,video/*');
    expect(screen.getByLabelText('Chụp ảnh')).toHaveAttribute('capture', 'environment');
    expect(screen.getByLabelText('Chụp ảnh')).toHaveAttribute('accept', 'image/*');
  });
});
