import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Clock3, HeartPulse, Milk, Moon, Plus, Smile, Sparkles, UserRound } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { SegmentClock } from './SegmentClock';
import { getMomActivitiesForDay, selectMomTodayMetrics } from '@/domain/activitySelectors';
import { NotebookStory } from '@/components/timeline/NotebookStory';
import { HomeMomentStoryItem } from '@/components/timeline/HomeMomentStoryItem';
import { MomentMediaPreview, type MomentMediaPreviewState } from '@/components/timeline/MomentMediaPreview';
import { TimelineEntryDialog, type JournalTimelineEntry } from '@/components/timeline/TimelineEntryDialog';
import { isTimelineMomentOnLocalDay, timelineMomentOccurredAt, timelineMomentOwner } from '@/domain/timelineMedia';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { MomActivity } from '@/types';

export interface MomHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

function formatMinutes(total: number): string {
  if (total <= 0) return 'Chưa ghi nhận';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours > 0 ? `${hours}g ${minutes}p` : `${minutes} phút`;
}

function formatTime(iso: string | null): string {
  if (!iso) return 'Chưa ghi nhận';
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function formatDay(date: Date): string {
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
  const calendarDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} · ${calendarDate}`;
}

function moodLabel(value: string | undefined): string {
  const labels: Record<string, string> = { great: 'Rất tốt', good: 'Tốt', neutral: 'Bình thường', low: 'Không tốt', very_low: 'Rất không tốt' };
  return value ? labels[value] ?? value : 'Chưa ghi nhận';
}

type ActivityPresentation = { label: string; tone: string; Icon: LucideIcon };

function activityPresentation(type: MomActivity['type']): ActivityPresentation {
  const values: Record<MomActivity['type'], ActivityPresentation> = {
    pumping: { label: 'Hút sữa', tone: 'blue', Icon: Milk },
    sleep: { label: 'Giấc ngủ', tone: 'lavender', Icon: Moon },
    mood: { label: 'Tâm trạng', tone: 'rose', Icon: Smile },
    recovery_note: { label: 'Phục hồi', tone: 'neutral', Icon: HeartPulse },
  };
  return values[type];
}

function activityDetail(record: MomActivity): string {
  if (record.type === 'pumping') return `${record.amountMl} ml`;
  if (record.type === 'sleep') return `Đã ngủ ${formatMinutes(record.durationMinutes)}`;
  if (record.type === 'mood') return `Mẹ cảm thấy ${moodLabel(record.mood).toLowerCase()}`;
  return '';
}

export const MomHomeView: React.FC<MomHomeViewProps> = ({ onOpenPumping }) => {
  const records = useActivityStore((state) => state.momActivities);
  const timelineItems = useTimelineStore((state) => state.timelineItems);
  const [now, setNow] = useState(() => new Date());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [momentPreview, setMomentPreview] = useState<MomentMediaPreviewState | null>(null);
  const selectedRecord = selectedRecordId
    ? records.find((item) => item.id === selectedRecordId) ?? null
    : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(() => selectMomTodayMetrics(records, now), [records, now]);
  const dayActivities = useMemo(() => getMomActivitiesForDay(records, now), [records, now]);
  const dayMoments = useMemo(
    () => timelineItems.filter((item) => timelineMomentOwner(item) === 'mom' && isTimelineMomentOnLocalDay(item, now)),
    [now, timelineItems],
  );
  const timelineEntries = useMemo(() => [
    ...dayActivities.map((record) => ({ kind: 'activity' as const, occurredAt: record.occurredAt, record })),
    ...dayMoments.map((item) => ({ kind: 'moment' as const, occurredAt: timelineMomentOccurredAt(item), item })),
  ].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()), [dayActivities, dayMoments]);
  const selectedMoment = selectedMomentId
    ? timelineItems.find((item) => item.id === selectedMomentId) ?? null
    : null;
  const selectedMomentEntry: JournalTimelineEntry | null = selectedMoment ? {
    id: `moment-${selectedMoment.id}`,
    occurredAt: timelineMomentOccurredAt(selectedMoment),
    owner: timelineMomentOwner(selectedMoment),
    type: 'moment',
    title: selectedMoment.title,
    detail: selectedMoment.content,
    stats: selectedMoment.stats ?? [],
    moment: selectedMoment,
  } : null;
  const latestMood = metrics.latestMood?.type === 'mood' ? metrics.latestMood.mood : undefined;
  const pumpingTotal = metrics.pumpingCount ? `${metrics.pumpingAmountMl} ml` : 'Chưa ghi nhận';

  const summaryMetrics = [
    {
      key: 'pumping', label: 'Hút sữa', value: metrics.pumpingCount ? `${metrics.pumpingAmountMl} ml` : '—',
      detail: metrics.pumpingCount ? `${metrics.pumpingCount} cữ` : 'Chưa ghi nhận', tone: 'rose', Icon: Milk,
    },
    {
      key: 'sleep', label: 'Giấc ngủ', value: metrics.sleepMinutes ? formatMinutes(metrics.sleepMinutes) : '—',
      detail: metrics.sleepMinutes ? 'Tổng trong ngày' : 'Chưa ghi nhận', tone: 'lilac', Icon: Moon,
    },
    {
      key: 'mood', label: 'Tâm trạng', value: latestMood ? moodLabel(latestMood) : '—',
      detail: latestMood ? 'Gần nhất' : 'Chưa ghi nhận', tone: 'honey', Icon: Smile,
    },
    {
      key: 'latest', label: 'Cữ gần nhất', value: metrics.lastPumpingAt ? formatTime(metrics.lastPumpingAt) : '—',
      detail: metrics.lastPumpingAt ? 'Thời điểm hút' : 'Chưa ghi nhận', tone: 'clay', Icon: Clock3,
    },
  ];

  return (
    <div className="haven-home haven-home-mom">
      <section className="haven-daily-summary-card haven-daily-summary-card-mom" aria-labelledby="mom-today-title">
        <div className="haven-daily-ambient" aria-hidden="true" />
        <div className="haven-daily-topline">
          <span className="haven-daily-date"><UserRound size={13} /> {formatDay(now)}</span>
          <span className="haven-daily-count">{timelineEntries.length} hoạt động</span>
        </div>

        <div className="haven-clock-row">
          <div className="haven-daily-hero-copy">
            <span className="haven-daily-eyebrow"><Sparkles size={11} /> NHỊP CỦA MẸ</span>
            <h2 id="mom-today-title" className="haven-live-clock"><SegmentClock time={formatClock(now)} /></h2>
          </div>
          <button type="button" className="haven-daily-add-btn" aria-label="+ Hút sữa" onClick={onOpenPumping}>
            <span><Plus size={22} strokeWidth={2.8} /></span>
          </button>
        </div>

        <div className="haven-daily-metrics" aria-label="Tóm tắt chỉ số của Mẹ">
          {summaryMetrics.map(({ key, label, value, detail, tone, Icon }) => (
            <article className="haven-daily-metric" key={key}>
              <span className={`haven-daily-metric-icon ${tone}`}><Icon size={15} /></span>
              <div>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            </article>
          ))}
          {metrics.pumpingCount ? <span className="haven-sr-only">{`${pumpingTotal} · ${metrics.pumpingCount} cữ`}</span> : null}
        </div>
      </section>

      <section className="haven-activity-surface haven-activity-surface-mom" aria-labelledby="mom-recent-title">
        <div className="haven-sheet-heading">
          <div><span className="haven-eyebrow">NHẬT KÝ TRONG NGÀY</span><h3 id="mom-recent-title">Dòng thời gian</h3></div>
          <button type="button" className="haven-text-action" onClick={onOpenPumping}><Plus size={12} /> Thêm</button>
        </div>
        {timelineEntries.length === 0 ? (
          <div className="haven-empty-state haven-empty-state-mom">
            <span><Sparkles size={18} /></span>
            <strong>Mẹ chưa ghi hoạt động nào</strong>
            <p>Ghi một hoạt động nhỏ để quan sát nhịp nghỉ ngơi và phục hồi của Mẹ.</p>
            <button type="button" className="haven-empty-action" onClick={onOpenPumping}>Ghi hoạt động đầu tiên</button>
          </div>
        ) : (
          <NotebookStory entries={timelineEntries} owner="mom" className="haven-home-notebook">
            <section className="journal-period">
              <div className="journal-period-items">
                {timelineEntries.map((timelineEntry) => {
                  if (timelineEntry.kind === 'moment') {
                    return (
                      <HomeMomentStoryItem
                        key={`moment-${timelineEntry.item.id}`}
                        item={timelineEntry.item}
                        occurredAt={timelineEntry.occurredAt}
                        formattedTime={formatTime(timelineEntry.occurredAt)}
                        onOpenEntry={() => {
                          setSelectedRecordId(null);
                          setSelectedMomentId(timelineEntry.item.id);
                        }}
                        onOpenMedia={(items, initialIndex, title, layoutId, originSrc, getLayoutId) => setMomentPreview({
                          items, initialIndex, title, layoutId, originSrc, getLayoutId,
                        })}
                      />
                    );
                  }
                  const record = timelineEntry.record;
                  const { label, tone, Icon } = activityPresentation(record.type);
                  const detail = activityDetail(record);
                  return (
                    <article key={record.id} className={`journal-story-item tone-${tone}`}>
                      <time className="journal-story-time" dateTime={record.occurredAt}>{formatTime(record.occurredAt)}</time>
                      <span className="journal-story-icon" aria-hidden="true"><Icon size={16} /></span>
                      <div className="journal-story-content">
                        <button
                          type="button"
                          className="journal-story-main"
                          onClick={() => {
                            setSelectedMomentId(null);
                            setSelectedRecordId(record.id);
                          }}
                          aria-label={`${label}, ${formatTime(record.occurredAt)}`}
                        >
                          <span className="journal-story-heading">
                            <strong className="journal-story-title">{label}</strong>
                            {detail && <><span className="journal-story-separator" aria-hidden="true">·</span><span className="journal-story-summary">{detail}</span></>}
                          </span>
                          {record.note && <span className="journal-story-detail">{record.note}</span>}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </NotebookStory>
        )}
      </section>
      <TimelineEntryDialog
        open={selectedRecord !== null || selectedMomentEntry !== null}
        entry={selectedMomentEntry ?? selectedRecord}
        onClose={() => {
          setSelectedRecordId(null);
          setSelectedMomentId(null);
        }}
        onOpenMomentMedia={(items, initialIndex, title, layoutId, originSrc, getLayoutId) => setMomentPreview({
          items, initialIndex, title, layoutId, originSrc, getLayoutId,
        })}
      />
      <MomentMediaPreview preview={momentPreview} onClose={() => setMomentPreview(null)} />
    </div>
  );
};
