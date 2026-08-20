import { beforeEach, describe, expect, it, vi } from 'vitest';

const localDb = vi.hoisted(() => ({
  getLocalMedia: vi.fn(),
  waitForLocalRecordWrites: vi.fn(),
  indexedDbStorage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));
const drive = vi.hoisted(() => ({ uploadTimelineMediaToDrive: vi.fn() }));

vi.mock('./localDb', () => localDb);
vi.mock('@/features/sync/googleDriveSync', () => drive);

import { useTimelineStore } from '@/store/useTimelineStore';
import { syncTimelineMediaToDrive } from './timelineMediaDriveSync';
import { getTimelineMediaSyncProgress, resetTimelineMediaSyncProgress } from './timelineMediaSyncProgress';

describe('syncTimelineMediaToDrive', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localDb.getLocalMedia.mockResolvedValue(new Blob(['image-bytes'], { type: 'image/jpeg' }));
    localDb.waitForLocalRecordWrites.mockResolvedValue(undefined);
    drive.uploadTimelineMediaToDrive.mockResolvedValue('drive-file-1');
    resetTimelineMediaSyncProgress();
    await useTimelineStore.persist.rehydrate();
    useTimelineStore.getState().resetTrackingData();
  });

  it('uploads local blobs and persists their Drive file ids in the timeline', async () => {
    useTimelineStore.getState().addTimelineItem({
      title: 'Khoảnh khắc',
      mediaItems: [{ id: 'media-1', blobId: 'media-1', type: 'photo', name: 'baby.jpg' }],
    });

    await expect(syncTimelineMediaToDrive({ interactive: false })).resolves.toBe(1);

    expect(drive.uploadTimelineMediaToDrive).toHaveBeenCalledWith(
      'media-1',
      expect.any(Blob),
      { name: 'baby.jpg', interactive: false, onProgress: expect.any(Function) },
    );
    expect(useTimelineStore.getState().timelineItems[0].mediaItems?.[0].driveFileId).toBe('drive-file-1');
    expect(getTimelineMediaSyncProgress('media-1')).toEqual({ status: 'synced', progress: 100, error: undefined });
    expect(localDb.waitForLocalRecordWrites).toHaveBeenCalledWith(['babygrowth_v4_timeline']);
  });

  it('publishes upload progress and keeps an error status when Drive rejects a file', async () => {
    drive.uploadTimelineMediaToDrive.mockImplementation(async (_id, _blob, options) => {
      options.onProgress?.(47);
      throw new Error('Drive đang bận');
    });
    useTimelineStore.getState().addTimelineItem({
      title: 'Khoảnh khắc lỗi',
      mediaItems: [{ id: 'media-error', blobId: 'media-error', type: 'video' }],
    });

    await expect(syncTimelineMediaToDrive()).rejects.toThrow('Drive đang bận');

    expect(getTimelineMediaSyncProgress('media-error')).toEqual({
      status: 'error', progress: 0, error: 'Drive đang bận',
    });
    expect(useTimelineStore.getState().timelineItems[0].mediaItems?.[0].driveFileId).toBeUndefined();
  });

  it('does not upload media that already has a Drive id', async () => {
    useTimelineStore.getState().addTimelineItem({
      title: 'Đã đồng bộ',
      mediaItems: [{ id: 'media-1', blobId: 'media-1', driveFileId: 'drive-file-1', type: 'photo' }],
    });

    await expect(syncTimelineMediaToDrive()).resolves.toBe(0);
    expect(drive.uploadTimelineMediaToDrive).not.toHaveBeenCalled();
  });
});
