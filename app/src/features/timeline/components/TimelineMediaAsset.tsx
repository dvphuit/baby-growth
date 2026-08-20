import type { CSSProperties } from 'react';
import type { TimelineMediaItem } from '@/types';
import { useTimelineMediaUrl } from '@/features/timeline/hooks/useTimelineMediaUrl';

interface TimelineMediaAssetProps {
  media: TimelineMediaItem;
  alt?: string;
  className?: string;
  imageStyle?: CSSProperties;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export function TimelineMediaAsset({
  media,
  alt = '',
  className,
  imageStyle,
  controls = false,
  preload = 'metadata',
}: TimelineMediaAssetProps) {
  const src = useTimelineMediaUrl(media);
  if (!src) return null;
  return media.type === 'video'
    ? <video className={className} src={src} controls={controls} preload={preload} />
    : <img className={className} src={src} alt={alt} style={imageStyle} loading="lazy" decoding="async" />;
}
