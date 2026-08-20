import type { ProfileMode } from '@/types';

interface TimelinePreviewContentProps {
  owner: ProfileMode;
}

/**
 * Timeline preview is isolated from the Home dashboard startup path.
 * Timeline data/rendering can be moved here without affecting first paint.
 */
export function TimelinePreviewContent({ owner }: TimelinePreviewContentProps) {
  return (
    <section className="haven-home-timeline-preview" data-owner={owner} aria-label="Nhật ký trong ngày">
      <div className="route-loading-state" role="status">Đang chuẩn bị nhật ký…</div>
    </section>
  );
}
