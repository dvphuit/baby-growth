import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimelineStore } from '@/store/useTimelineStore';
import { GoogleDriveDataView } from './GoogleDriveDataView';

const drive = vi.hoisted(() => ({
  checkDriveBackup: vi.fn(),
  deleteTimelineMediaFromDrive: vi.fn(),
  downloadTimelineMediaFromDrive: vi.fn(),
  getLastSyncedAt: vi.fn(),
  isGoogleConnected: vi.fn(),
  listTimelineMediaFromDrive: vi.fn(),
  requestGoogleAccessToken: vi.fn(),
}));

vi.mock('@/services/googleDriveSync', () => drive);
describe('GoogleDriveDataView', () => {
  beforeEach(() => {
    drive.isGoogleConnected.mockReturnValue(true);
    drive.listTimelineMediaFromDrive.mockResolvedValue([{
      id: 'drive-1', name: 'baby.jpg', mimeType: 'image/jpeg', size: 2048,
      createdTime: '2026-08-18T08:00:00.000Z', modifiedTime: '2026-08-18T09:00:00.000Z',
    }]);
    drive.checkDriveBackup.mockResolvedValue({ found: true, updatedAt: '2026-08-18T09:00:00.000Z' });
    drive.getLastSyncedAt.mockResolvedValue('2026-08-18T09:00:00.000Z');
    drive.deleteTimelineMediaFromDrive.mockResolvedValue(undefined);
    drive.downloadTimelineMediaFromDrive.mockResolvedValue(new Blob(['image-bytes'], { type: 'image/jpeg' }));
    drive.requestGoogleAccessToken.mockResolvedValue(undefined);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:drive-preview'), revokeObjectURL: vi.fn() });
    useTimelineStore.getState().resetTrackingData();
  });

  it('lists, previews, and deletes private Drive media', async () => {
    const onOpenLightbox = vi.fn();
    useTimelineStore.getState().addTimelineItem({
      title: 'Nụ cười đầu ngày',
      mediaItems: [{ id: 'media-1', driveFileId: 'drive-1', type: 'photo', name: 'baby.jpg' }],
    });
    render(<MemoryRouter><GoogleDriveDataView onOpenLightbox={onOpenLightbox} onShowToast={vi.fn()} /></MemoryRouter>);

    expect(await screen.findByText('baby.jpg')).toBeInTheDocument();
    expect(screen.getByText('Đang dùng trong “Nụ cười đầu ngày”')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh baby.jpg' }));
    await waitFor(() => expect(onOpenLightbox).toHaveBeenCalledWith('blob:drive-preview', false));

    fireEvent.click(screen.getByRole('button', { name: 'Xóa baby.jpg khỏi Google Drive' }));
    expect(screen.getByRole('dialog', { name: 'Xóa media khỏi Drive?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa media' }));

    await waitFor(() => expect(drive.deleteTimelineMediaFromDrive).toHaveBeenCalledWith('drive-1', { interactive: true }));
    await waitFor(() => expect(screen.queryByText('baby.jpg')).not.toBeInTheDocument());
    expect(useTimelineStore.getState().timelineItems[0].mediaItems).toEqual([]);
  });
});
