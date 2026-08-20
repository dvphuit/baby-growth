import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'motion/react';
import { havenLayoutTransition } from '@/components/motion/motionPresets';
import { TimelineMediaSyncBadge } from '@/components/timeline/TimelineMediaSyncBadge';
import { preloadTimelineMedia, useTimelineMediaUrl } from '@/hooks/useTimelineMediaUrl';
import type { TimelineMediaItem } from '@/types';

export interface MomentMediaPreviewState {
  items: TimelineMediaItem[];
  initialIndex: number;
  title: string;
  layoutId: string;
  originSrc: string;
  getLayoutId?: (index: number, media: TimelineMediaItem) => string;
}

interface MomentMediaPreviewProps {
  preview: MomentMediaPreviewState | null;
  onClose: () => void;
}

interface MomentMediaPreviewContentProps extends MomentMediaPreviewState {
  onClose: () => void;
}

const pagerTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 42,
  mass: 0.8,
};

const dismissTransition = {
  duration: 0.22,
  ease: 'easeIn' as const,
};

function MomentMediaSlideItem({
  media,
  title,
  index,
  isActive,
  isInitial,
  originSrc,
  layoutId,
  activeY,
  activeScale,
}: {
  media: TimelineMediaItem;
  title: string;
  index: number;
  isActive: boolean;
  isInitial: boolean;
  originSrc?: string;
  layoutId?: string;
  activeY: MotionValue<number>;
  activeScale: MotionValue<number>;
}) {
  const resolvedUrl = useTimelineMediaUrl(media);
  const src = (isInitial && originSrc) || resolvedUrl || media.url || '';
  const isVideo = media.type === 'video';

  return (
    <div className="moment-media-preview-slide">
      <motion.div
        className="moment-media-preview-slide-content"
        style={isActive ? { y: activeY, scale: activeScale } : undefined}
      >
        {isVideo ? (
          <motion.video
            layoutId={isActive ? layoutId : undefined}
            data-layout-id={isActive ? layoutId : undefined}
            className="moment-media-preview-asset"
            src={src || undefined}
            controls={isActive}
            playsInline
            preload="auto"
            style={{ borderRadius: 0 }}
          />
        ) : (
          <motion.img
            layoutId={isActive ? layoutId : undefined}
            data-layout-id={isActive ? layoutId : undefined}
            className="moment-media-preview-asset"
            src={src || undefined}
            alt={`${title}, ảnh ${index + 1}`}
            draggable={false}
            style={{ borderRadius: 0 }}
          />
        )}
      </motion.div>
    </div>
  );
}

function MomentMediaPreviewContent({
  items,
  initialIndex,
  title,
  layoutId,
  originSrc,
  getLayoutId,
  onClose,
}: MomentMediaPreviewContentProps) {
  const safeInitialIndex = Math.max(0, Math.min(items.length - 1, initialIndex));
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
  const [isClosing, setIsClosing] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const activeIndexRef = useRef(safeInitialIndex);
  activeIndexRef.current = activeIndex;

  const stageRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 240], [1, 0.25]);
  const dragScale = useTransform(y, [0, 240], [1, 0.88]);

  const panDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const panStartX = useRef(0);
  const trackAnimationRef = useRef<{ stop: () => void } | null>(null);
  const closingRef = useRef(false);
  const dismissingRef = useRef(false);

  useEffect(() => {
    items.forEach((item) => {
      void preloadTimelineMedia(item);
    });
  }, [items]);

  const goTo = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(items.length - 1, index));
    const width = containerWidth || stageRef.current?.clientWidth || window.innerWidth;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    if (width > 0) {
      trackAnimationRef.current?.stop();
      trackAnimationRef.current = animate(x, -nextIndex * width, pagerTransition);
    }
  }, [containerWidth, items.length, x]);

  const dismiss = useCallback(() => {
    if (closingRef.current || dismissingRef.current) return;

    dismissingRef.current = true;
    setIsDismissing(true);
    const dismissDistance = Math.max(window.innerHeight, stageRef.current?.clientHeight ?? 0) + 120;
    void animate(y, dismissDistance, dismissTransition).then(onClose);
  }, [onClose, y]);

  const requestClose = useCallback(() => {
    if (closingRef.current || dismissingRef.current) return;

    closingRef.current = true;
    setIsClosing(true);
  }, []);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (!stageRef.current) return;
      const newWidth = stageRef.current.clientWidth;
      setContainerWidth(newWidth);
      if (newWidth > 0) x.set(-activeIndexRef.current * newWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [x]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
      if (event.key === 'ArrowRight' && activeIndexRef.current < items.length - 1) goTo(activeIndexRef.current + 1);
      if (event.key === 'ArrowLeft' && activeIndexRef.current > 0) goTo(activeIndexRef.current - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goTo, items.length, requestClose]);

  const handlePanStart = () => {
    panDirection.current = null;
    trackAnimationRef.current?.stop();
    trackAnimationRef.current = null;
    panStartX.current = x.get();
  };

  const handlePan = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const width = containerWidth || stageRef.current?.clientWidth || window.innerWidth;
    if (width <= 0) return;

    if (!panDirection.current && (Math.abs(info.offset.x) > 6 || Math.abs(info.offset.y) > 6)) {
      if (Math.abs(info.offset.x) >= Math.abs(info.offset.y)) {
        panDirection.current = 'horizontal';
      } else if (info.offset.y > 0) {
        panDirection.current = 'vertical';
      }
    }

    if (panDirection.current === 'horizontal') {
      let offset = info.offset.x;
      if (
        (activeIndexRef.current === 0 && offset > 0)
        || (activeIndexRef.current === items.length - 1 && offset < 0)
      ) {
        offset *= 0.35;
      }
      x.set(panStartX.current + offset);
    } else if (panDirection.current === 'vertical') {
      y.set(Math.max(0, info.offset.y));
    }
  };

  const handlePanEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const width = containerWidth || stageRef.current?.clientWidth || window.innerWidth;
    const currentDirection = panDirection.current;
    panDirection.current = null;

    if (currentDirection === 'vertical') {
      if (info.offset.y > 80 || info.velocity.y > 350) {
        dismiss();
      } else {
        animate(y, 0, havenLayoutTransition);
        if (width > 0) {
          trackAnimationRef.current = animate(x, -activeIndexRef.current * width, pagerTransition);
        }
      }
      return;
    }

    if (currentDirection === 'horizontal' && width > 0) {
      const swipeThreshold = Math.min(width * 0.18, 60);
      const velocityThreshold = 220;

      let targetIndex = activeIndexRef.current;
      if (
        (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold)
        && activeIndexRef.current < items.length - 1
      ) {
        targetIndex = activeIndexRef.current + 1;
      } else if (
        (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold)
        && activeIndexRef.current > 0
      ) {
        targetIndex = activeIndexRef.current - 1;
      }

      activeIndexRef.current = targetIndex;
      setActiveIndex(targetIndex);
      trackAnimationRef.current = animate(x, -targetIndex * width, pagerTransition);
      return;
    }

    if (width > 0) {
      trackAnimationRef.current = animate(x, -activeIndexRef.current * width, pagerTransition);
    }
    animate(y, 0, havenLayoutTransition);
  };

  const activeMedia = items[activeIndex] ?? items[0];

  return (
    <motion.div
      className="moment-media-preview-page"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem media ${title}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: isDismissing || isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (closingRef.current) onClose();
      }}
    >
      <motion.button
        type="button"
        className="moment-media-preview-backdrop"
        aria-label="Đóng xem media"
        onClick={requestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: backdropOpacity }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
      <section className="moment-media-preview-frame">
        <motion.header
          className="moment-media-preview-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div>
            <strong>{title}</strong>
            <span>{activeIndex + 1} / {items.length}</span>
          </div>
          <motion.button
            type="button"
            aria-label="Đóng preview"
            onClick={requestClose}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
          >
            <X size={19} />
          </motion.button>
        </motion.header>

        <div className="moment-media-preview-stage" ref={stageRef}>
          <motion.div
            className="moment-media-preview-track"
            style={{ x }}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
          >
            {items.map((media, index) => (
              <MomentMediaSlideItem
                key={media.id ?? media.blobId ?? index}
                media={media}
                title={title}
                index={index}
                isActive={index === activeIndex}
                isInitial={index === safeInitialIndex}
                originSrc={originSrc}
                layoutId={index === safeInitialIndex ? layoutId : getLayoutId?.(index, media)}
                activeY={y}
                activeScale={dragScale}
              />
            ))}
          </motion.div>

          {items.length > 1 && (
            <>
              {activeIndex > 0 && (
                <button
                  type="button"
                  className="moment-media-preview-nav prev"
                  aria-label="Media trước"
                  onClick={(event) => {
                    event.stopPropagation();
                    goTo(activeIndex - 1);
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {activeIndex < items.length - 1 && (
                <button
                  type="button"
                  className="moment-media-preview-nav next"
                  aria-label="Media kế tiếp"
                  onClick={(event) => {
                    event.stopPropagation();
                    goTo(activeIndex + 1);
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}
        </div>

        <motion.footer
          className="moment-media-preview-footer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <TimelineMediaSyncBadge media={activeMedia} className="in-preview" />
          <div className="moment-media-preview-indicator" aria-label={`Media ${activeIndex + 1} trên ${items.length}`}>
            {items.length <= 9 ? items.map((media, index) => (
              <motion.button
                layout
                type="button"
                key={media.id ?? media.blobId ?? media.driveFileId ?? `${media.url}-${index}`}
                className={index === activeIndex ? 'is-active' : ''}
                aria-label={`Xem media ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => goTo(index)}
                transition={havenLayoutTransition}
              />
            )) : <span>{activeIndex + 1} / {items.length}</span>}
          </div>
        </motion.footer>
      </section>
    </motion.div>
  );
}

export function MomentMediaPreview({ preview, onClose }: MomentMediaPreviewProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {preview && preview.items.length > 0 && (
        <MomentMediaPreviewContent
          key={preview.layoutId}
          {...preview}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
