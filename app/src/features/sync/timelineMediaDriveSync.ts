import { getLocalMedia, waitForLocalRecordWrites } from '@/data/localDb';
import { uploadTimelineMediaToDrive } from '@/features/sync/googleDriveSync';
import { logDiagnostic } from '@/app/diagnostics/diagnosticLog';
import { publishTimelineMediaSyncProgress } from './timelineMediaSyncProgress';
import { useTimelineStore } from '@/features/timeline/store/useTimelineStore';
import type { TimelineItem, TimelineMediaItem } from '@/types';

const TIMELINE_STORAGE_KEY = 'babygrowth_v4_timeline';

async function waitForTimelineHydration(): Promise<void> {
  if (useTimelineStore.persist.hasHydrated()) return;
  await useTimelineStore.persist.rehydrate();
}

export async function syncTimelineMediaToDrive(
  options: { interactive?: boolean } = {},
): Promise<number> {
  logDiagnostic('drive-sync', 'info', 'Timeline media sync started', { interactive: options.interactive !== false });
  await waitForTimelineHydration();
  const timelineItems = useTimelineStore.getState().timelineItems;
  let uploadedCount = 0;
  let firstUploadError: unknown = null;

  const nextTimelineItems: TimelineItem[] = [];
  for (const item of timelineItems) {
    let itemChanged = false;
    const nextMediaItems: TimelineMediaItem[] = [];
    for (const media of item.mediaItems ?? []) {
      if (!media.blobId || media.driveFileId) {
        nextMediaItems.push(media);
        continue;
      }
      const mediaId = media.id || media.blobId;
      publishTimelineMediaSyncProgress(mediaId, { status: 'queued', progress: 0 });
      const blob = await getLocalMedia(media.blobId);
      if (!blob) {
        logDiagnostic('drive-sync', 'warn', 'Local media blob is missing', { mediaId: media.id, blobId: media.blobId });
        publishTimelineMediaSyncProgress(mediaId, {
          status: 'error',
          progress: 0,
          error: 'Không tìm thấy media trên thiết bị để đồng bộ.',
        });
        nextMediaItems.push(media);
        continue;
      }
      publishTimelineMediaSyncProgress(mediaId, { status: 'uploading', progress: 0 });
      try {
        const driveFileId = await uploadTimelineMediaToDrive(mediaId, blob, {
          name: media.name,
          interactive: options.interactive,
          onProgress: (progress) => publishTimelineMediaSyncProgress(mediaId, { status: 'uploading', progress }),
        });
        publishTimelineMediaSyncProgress(mediaId, { status: 'synced', progress: 100 });
        nextMediaItems.push({ ...media, driveFileId });
        uploadedCount += 1;
        itemChanged = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải media lên Google Drive.';
        publishTimelineMediaSyncProgress(mediaId, { status: 'error', progress: 0, error: message });
        logDiagnostic('drive-sync', 'error', 'Timeline media upload failed', { mediaId, error });
        firstUploadError ??= error;
        nextMediaItems.push(media);
      }
    }
    nextTimelineItems.push(itemChanged ? { ...item, mediaItems: nextMediaItems } : item);
  }

  if (uploadedCount > 0) {
    useTimelineStore.setState({ timelineItems: nextTimelineItems });
    await waitForLocalRecordWrites([TIMELINE_STORAGE_KEY]);
  }
  if (firstUploadError) throw firstUploadError;
  logDiagnostic('drive-sync', 'info', 'Timeline media sync completed', { uploadedCount, timelineItemCount: timelineItems.length });
  return uploadedCount;
}
