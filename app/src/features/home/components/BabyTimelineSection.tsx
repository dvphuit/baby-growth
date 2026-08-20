import { IdleHomeTimelinePreview } from './IdleHomeTimelinePreview';

interface BabyTimelineSectionProps {
  owner?: 'baby' | 'mom';
}

export function BabyTimelineSection({ owner = 'baby' }: BabyTimelineSectionProps) {
  return <IdleHomeTimelinePreview owner={owner} />;
}
