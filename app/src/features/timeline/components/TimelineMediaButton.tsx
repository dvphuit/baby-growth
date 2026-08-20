import type { CSSProperties } from 'react';
import { Image as ImageIcon, Play, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { TimelineMediaSyncBadge } from '@/features/timeline/components/TimelineMediaSyncBadge';
import { useTimelineMediaUrl } from '@/features/timeline/hooks/useTimelineMediaUrl';
import { havenLayoutTransition } from '@/shared/motion/motionPresets';
import type { TimelineMediaItem } from '@/types';

export interface TimelineMediaButtonProps {
  media: TimelineMediaItem;
  className: string;
  ariaLabel: string;
  alt: string;
  onOpen?: (src: string, isVideo: boolean) => void;
  imageStyle?: CSSProperties;
  playSize: number;
  showKind?: boolean;
  moreCount?: number;
  layoutId?: string;
}

export function TimelineMediaButton({
  media,
  className,
  ariaLabel,
  alt,
  onOpen,
  imageStyle,
  playSize,
  showKind = false,
  moreCount = 0,
  layoutId,
}: TimelineMediaButtonProps) {
  const src = useTimelineMediaUrl(media);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (src && onOpen) onOpen(src, media.type === 'video');
      }}
      aria-label={ariaLabel}
      disabled={!src}
    >
      {src && (
        media.type === 'video' ? (
          <>
            <motion.video
              layoutId={layoutId}
              data-layout-id={layoutId}
              transition={havenLayoutTransition}
              src={src}
              preload="metadata"
              style={{ borderRadius: 11 }}
            />
            <span className="journal-media-play">
              <Play size={playSize} fill="currentColor" />
            </span>
            {showKind && (
              <span className="journal-story-media-kind">
                <Video size={13} /> Video
              </span>
            )}
          </>
        ) : (
          <>
            <motion.img
              layoutId={layoutId}
              data-layout-id={layoutId}
              transition={havenLayoutTransition}
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              style={{ ...imageStyle, borderRadius: 11 }}
            />
            {showKind && (
              <span className="journal-story-media-kind">
                <ImageIcon size={13} /> Ảnh
              </span>
            )}
          </>
        )
      )}
      {moreCount > 0 && <span className="journal-media-more">+{moreCount}</span>}
      {moreCount === 0 && <TimelineMediaSyncBadge media={media} />}
    </button>
  );
}
