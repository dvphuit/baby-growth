import type { TimelineItem, TimelineMediaItem } from '@/types';

export function timelineMomentOccurredAt(item: Pick<TimelineItem, 'date' | 'timeFormatted'>): string {
  const [year, month, day] = item.date.split('-').map(Number);
  const [hour = 0, minute = 0] = item.timeFormatted.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0);
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

export function timelineMomentOwner(item: TimelineItem): 'baby' | 'mom' {
  return item.owner ?? (item.tagType === 'mom' || item.type === 'mom' ? 'mom' : 'baby');
}

export function isTimelineMomentOnLocalDay(item: TimelineItem, date: Date): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return item.date === `${year}-${month}-${day}`;
}

export function getTimelineMediaItems(item: TimelineItem): TimelineMediaItem[] {
  const mediaItems = (item.mediaItems ?? []).filter((media) => media.blobId || media.driveFileId || media.url?.trim());
  if (mediaItems.length > 0) return mediaItems;
  if (!item.mediaUrl) return [];
  return [{ id: `legacy-${item.id}`, url: item.mediaUrl, type: item.mediaType === 'video' ? 'video' : 'photo' }];
}
