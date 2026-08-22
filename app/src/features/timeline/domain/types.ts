import type { StageKey } from '@/features/growth';
import type { ProfileMode } from '@/features/profile';

export type CalendarViewMode = 'collapsed' | 'expanded';

export interface CalendarRangeEvent {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  color: string;
  icon: string;
  badge: string;
  note: string;
}

export interface TimelineItem {
  id: string;
  owner?: ProfileMode;
  stage?: StageKey;
  date: string;
  timeFormatted: string;
  time: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  mediaItems?: TimelineMediaItem[];
  mediaUrl?: string | null;
  mediaType?: 'photo' | 'video' | null;
  stats: string[];
  likes: number;
  comments: number;
  userLiked: boolean;
  tag: string;
  tagType: 'milestone' | 'feeding' | 'mom' | 'health' | 'general';
  type?: 'growth' | 'mom' | 'daily' | 'milestone';
}

export interface TimelineMediaItem {
  id?: string;
  url?: string;
  blobId?: string;
  driveFileId?: string;
  type: 'photo' | 'video';
  name?: string;
  focalX?: number;
  focalY?: number;
}
