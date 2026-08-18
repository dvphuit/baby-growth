import { getLocalMedia, waitForLocalRecordWrites } from './localDb';
import { uploadTimelineMediaToDrive } from './googleDriveSync';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { TimelineItem, TimelineMediaItem } from '@/types';

const TIMELINE_STORAGE_KEY = 'babygrowth_v2_timeline';

async function waitForTimelineHydration(): Promise<void> {
  if (useTimelineStore.persist.hasHydrated()) return;
  await useTimelineStore.persist.rehydrate();
}

export async function syncTimelineMediaToDrive(
  options: { interactive?: boolean } = {},
): Promise<number> {
  await waitForTimelineHydration();
  const timelineItems = useTimelineStore.getState().timelineItems;
  let uploadedCount = 0;

  const nextTimelineItems: TimelineItem[] = [];
  for (const item of timelineItems) {
    let itemChanged = false;
    const nextMediaItems: TimelineMediaItem[] = [];
    for (const media of item.mediaItems ?? []) {
      if (!media.blobId || media.driveFileId) {
        nextMediaItems.push(media);
        continue;
      }
      const blob = await getLocalMedia(media.blobId);
      if (!blob) {
        nextMediaItems.push(media);
        continue;
      }
      const driveFileId = await uploadTimelineMediaToDrive(media.id || media.blobId, blob, {
        name: media.name,
        interactive: options.interactive,
      });
      nextMediaItems.push({ ...media, driveFileId });
      uploadedCount += 1;
      itemChanged = true;
    }
    nextTimelineItems.push(itemChanged ? { ...item, mediaItems: nextMediaItems } : item);
  }

  if (uploadedCount > 0) {
    useTimelineStore.setState({ timelineItems: nextTimelineItems });
    await waitForLocalRecordWrites([TIMELINE_STORAGE_KEY]);
  }
  return uploadedCount;
}
