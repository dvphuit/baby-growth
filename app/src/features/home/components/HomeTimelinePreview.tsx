import type { ProfileMode } from '@/types';

interface HomeTimelinePreviewProps {
  owner: ProfileMode;
}

/**
 * Lazy boundary target for Home timeline rendering.
 * Timeline rendering is intentionally kept outside the initial Home dashboard path.
 */
export function HomeTimelinePreview({ owner }: HomeTimelinePreviewProps) {
  return (
    <div className="haven-home-timeline-preview" data-owner={owner}>
      <div className="route-loading-state" role="status">Đang mở nhật ký…</div>
    </div>
  );
}
