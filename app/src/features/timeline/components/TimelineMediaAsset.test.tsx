import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimelineMediaAsset } from './TimelineMediaAsset';

const localMedia = vi.hoisted(() => ({ getLocalMedia: vi.fn() }));
const driveMedia = vi.hoisted(() => ({ downloadTimelineMediaFromDrive: vi.fn() }));

vi.mock('@/data/localDb', () => localMedia);
vi.mock('@/features/sync', () => driveMedia);

describe('TimelineMediaAsset', () => {
  beforeEach(() => {
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
});
