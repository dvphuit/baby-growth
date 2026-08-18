import type { TimelineItem, TimelineMediaItem } from '@/types';

export function getTimelineMediaItems(item: TimelineItem): TimelineMediaItem[] {
  const mediaItems = (item.mediaItems ?? []).filter((media) => media.blobId || media.driveFileId || media.url?.trim());
  if (mediaItems.length > 0) return mediaItems;
  if (!item.mediaUrl) return [];
  return [{ id: `legacy-${item.id}`, url: item.mediaUrl, type: item.mediaType === 'video' ? 'video' : 'photo' }];
}
