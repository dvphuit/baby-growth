import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { preloadTimelineMedia } from '@/features/timeline/hooks/useTimelineMediaUrl';
import { TimelineMediaAsset } from './TimelineMediaAsset';

const localMedia = vi.hoisted(() => ({ getLocalMedia: vi.fn() }));
const driveMedia = vi.hoisted(() => ({ downloadTimelineMediaFromDrive: vi.fn() }));

vi.mock('@/data/localDb', () => localMedia);
vi.mock('@/features/sync/googleDriveSync', () => driveMedia);

describe('TimelineMediaAsset', () => {
  beforeEach(() => {
    localMedia.getLocalMedia.mockReset();
    driveMedia.downloadTimelineMediaFromDrive.mockReset();
    localMedia.getLocalMedia.mockResolvedValue(new Blob(['image-bytes'], { type: 'image/jpeg' }));
    driveMedia.downloadTimelineMediaFromDrive.mockResolvedValue(new Blob(['drive-image'], { type: 'image/jpeg' }));
  });

  it('creates and revokes a temporary object URL for local media', async () => {
    const createObjectURL = vi.fn(() => 'blob:local-photo');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const view = render(<TimelineMediaAsset media={{ blobId: 'photo-1', type: 'photo' }} alt="Bé" />);

    await waitFor(() => expect(screen.getByRole('img', { name: 'Bé' })).toHaveAttribute('src', 'blob:local-photo'));
    expect(localMedia.getLocalMedia).toHaveBeenCalledWith('photo-1');
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:local-photo');
  });

  it('falls back to Google Drive when the local file is unavailable', async () => {
    localMedia.getLocalMedia.mockResolvedValue(null);
    const createObjectURL = vi.fn(() => 'blob:drive-photo');
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    render(<TimelineMediaAsset media={{ blobId: 'photo-1', driveFileId: 'drive-1', type: 'photo' }} alt="Bé" />);

    await waitFor(() => expect(screen.getByRole('img', { name: 'Bé' })).toHaveAttribute('src', 'blob:drive-photo'));
    expect(driveMedia.downloadTimelineMediaFromDrive).toHaveBeenCalledWith('drive-1', { interactive: false });
  });

  it('releases an object URL after a preloaded media consumer unmounts', async () => {
    const createObjectURL = vi.fn(() => 'blob:preloaded-photo');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const media = { blobId: 'photo-preloaded', type: 'photo' as const };

    await expect(preloadTimelineMedia(media)).resolves.toBe('blob:preloaded-photo');
    const view = render(<TimelineMediaAsset media={media} alt="Ảnh preload" />);

    await waitFor(() => expect(screen.getByRole('img', { name: 'Ảnh preload' })).toHaveAttribute('src', 'blob:preloaded-photo'));
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preloaded-photo');
  });

  it('deduplicates concurrent reads for the same media asset', async () => {
    let resolveBlob!: (blob: Blob) => void;
    localMedia.getLocalMedia.mockReturnValue(new Promise<Blob>((resolve) => { resolveBlob = resolve; }));
    const createObjectURL = vi.fn(() => 'blob:shared-photo');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const media = { blobId: 'photo-shared', type: 'photo' as const };

    const view = render(
      <>
        <TimelineMediaAsset media={media} alt="Ảnh A" />
        <TimelineMediaAsset media={media} alt="Ảnh B" />
      </>,
    );

    await waitFor(() => expect(localMedia.getLocalMedia).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveBlob(new Blob(['shared-image'], { type: 'image/jpeg' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Ảnh A' })).toHaveAttribute('src', 'blob:shared-photo');
      expect(screen.getByRole('img', { name: 'Ảnh B' })).toHaveAttribute('src', 'blob:shared-photo');
    });
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});
