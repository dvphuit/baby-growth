import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Clock3, HeartPulse, Layers, Milk, Moon, Pill, Plus, Sparkles, Thermometer } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { SegmentClock } from './SegmentClock';
import { useBabyStore } from '@/store/useBabyStore';
import { useFamily } from '@/hooks/useFamily';
import { getBabyActivitiesForDay, selectBabyTodayMetrics } from '@/domain/activitySelectors';
import { getMilkTarget, getSleepTarget } from '@/domain/dailyCareTargets';
import { getRealGrowthHistory } from '@/domain/growthSelectors';
import { NotebookStory } from '@/components/timeline/NotebookStory';
import type { BabyActivity } from '@/types';

export interface BabyHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
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

function progressPercent(value: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

type ActivityPresentation = { label: string; tone: string; Icon: LucideIcon };

function activityPresentation(type: BabyActivity['type']): ActivityPresentation {
  const values: Record<BabyActivity['type'], ActivityPresentation> = {
    feeding: { label: 'Cữ bú', tone: 'apricot', Icon: Milk },
    sleep: { label: 'Giấc ngủ', tone: 'lavender', Icon: Moon },
    diaper: { label: 'Thay tã', tone: 'sage', Icon: Layers },
    medicine: { label: 'Thuốc / vitamin', tone: 'rose', Icon: Pill },
    temperature: { label: 'Nhiệt độ', tone: 'coral', Icon: Thermometer },
    health_note: { label: 'Ghi chú sức khỏe', tone: 'blue', Icon: HeartPulse },
  };
  return values[type];
}

function activityDetail(record: BabyActivity): string {
  if (record.type === 'feeding') {
    const details = [record.amountMl ? `${record.amountMl} ml` : '', record.durationMinutes ? `${record.durationMinutes} phút` : ''].filter(Boolean);
    return details.join(' · ');
  }
  if (record.type === 'sleep') return `Ngủ ${formatMinutes(record.durationMinutes)}`;
  if (record.type === 'diaper') return record.diaperKind === 'wet' ? 'Tã ướt' : record.diaperKind === 'dirty' ? 'Tã bẩn' : 'Ướt và bẩn';
  if (record.type === 'medicine') return [record.name, record.dose].filter(Boolean).join(' · ');
  if (record.type === 'temperature') return `${record.temperatureC}°C`;
  return '';
}

export const BabyHomeView: React.FC<BabyHomeViewProps> = ({ onOpenQuickLog }) => {
  const records = useActivityStore((state) => state.babyActivities);
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const family = useFamily();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(() => selectBabyTodayMetrics(records, now), [records, now]);
  const dayActivities = useMemo(() => getBabyActivitiesForDay(records, now), [records, now]);
  const timelineActivities = useMemo(() => [...dayActivities].reverse(), [dayActivities]);
  const latestGrowth = useMemo(
    () => getRealGrowthHistory(currentStageData.growthHistory)[0] ?? null,
    [currentStageData.growthHistory],
  );
  const weightKg = latestGrowth?.weight
    || Number.parseFloat(currentStageData.todayVitals.weight)
    || Number.parseFloat(family.birthWeight || '')
    || null;
  const milkTarget = getMilkTarget(family.birthDate, weightKg, now);
  const sleepTarget = getSleepTarget(family.birthDate, now);
  const milkProgress = progressPercent(metrics.feedingAmountMl, milkTarget.targetMl);
  const sleepProgress = progressPercent(metrics.sleepMinutes, sleepTarget.minMinutes);

  return (
    <div className="haven-home haven-home-baby">
      <section className="haven-daily-summary-card" aria-labelledby="baby-daily-title">
        <div className="haven-daily-ambient" aria-hidden="true" />
        <div className="haven-clock-row">
          <div className="haven-daily-hero-copy">
            <h2 id="baby-daily-title" className="haven-live-clock"><SegmentClock time={formatClock(now)} /></h2>
          </div>
          <button type="button" className="haven-daily-add-btn" aria-label="+ Ghi nhanh" onClick={onOpenQuickLog}>
            <span><Plus size={22} strokeWidth={2.8} /></span>
          </button>
        </div>

        <div className="haven-care-progress-grid">
          <article className="haven-care-progress haven-care-progress-milk">
            <img className="haven-card-decor" src="/assets/decor/care-milk.png" alt="" aria-hidden="true" />
            <div className="haven-care-progress-heading">
              <span className="haven-care-icon"><Milk size={18} /></span>
              <div><span>Sữa đã ghi</span><small>{metrics.feedingCount} cữ</small></div>
            </div>
            <div className="haven-care-progress-value">
              <strong>{metrics.feedingAmountMl.toLocaleString('vi-VN')} <small>ml</small></strong>
              <span>{milkTarget.label}</span>
            </div>
            <div className="haven-care-track" role="progressbar" aria-label="Tiến độ lượng sữa" aria-valuemin={0} aria-valuemax={100} aria-valuenow={milkProgress}>
              <span style={{ width: `${milkProgress}%` }} />
            </div>
            <p>
              {metrics.feedingCount > 0 && metrics.feedingAmountMl === 0
                ? 'Cữ bú mẹ trực tiếp không quy đổi sang ml.'
                : milkTarget.detail}
            </p>
          </article>

          <article className="haven-care-progress haven-care-progress-sleep">
            <img className="haven-card-decor" src="/assets/decor/care-sleep.png" alt="" aria-hidden="true" />
            <div className="haven-care-progress-heading">
              <span className="haven-care-icon"><Moon size={18} /></span>
              <div><span>Giấc ngủ</span><small>Bao gồm giấc ngày</small></div>
            </div>
            <div className="haven-care-progress-value">
              <strong>{metrics.sleepMinutes ? formatMinutes(metrics.sleepMinutes) : '0 phút'}</strong>
              <span>{sleepTarget.label}</span>
            </div>
            <div className="haven-care-track" role="progressbar" aria-label="Tiến độ giấc ngủ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={sleepProgress}>
              <span style={{ width: `${sleepProgress}%` }} />
            </div>
            <p>Tiến độ tính đến mốc thấp của khoảng tham khảo.</p>
          </article>
        </div>

        <div className="haven-daily-secondary-strip">
          <div className="haven-secondary-metric haven-secondary-metric-diaper">
            <img className="haven-card-decor" src="/assets/decor/care-diaper.png" alt="" aria-hidden="true" />
            <Layers size={14} /><span>Thay tã</span><strong>{metrics.diaperCount} lần</strong>
          </div>
          <span className="haven-secondary-divider" />
          <div className="haven-secondary-metric haven-secondary-metric-clock">
            <img className="haven-card-decor" src="/assets/decor/care-clock.png" alt="" aria-hidden="true" />
            <Clock3 size={14} /><span>Cữ gần nhất</span><strong>{metrics.lastFeedingAt ? formatTime(metrics.lastFeedingAt) : '—'}</strong>
          </div>
        </div>

        <p className="haven-care-reference">
          Mốc tham khảo từ <a href="https://www.cdc.gov/sleep/about/index.html" target="_blank" rel="noreferrer">CDC</a>, <a href="https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/" target="_blank" rel="noreferrer">NHS</a> và <a href="https://www.healthychildren.org/English/ages-stages/baby/formula-feeding/Pages/Amount-and-Schedule-of-Formula-Feedings.aspx" target="_blank" rel="noreferrer">AAP</a>. Nhu cầu thực tế của mỗi bé có thể khác.
        </p>
      </section>

      <section className="haven-activity-surface" aria-labelledby="baby-recent-title">
        <div className="haven-sheet-heading">
          <div><span className="haven-eyebrow">NHẬT KÝ TRONG NGÀY</span><h3 id="baby-recent-title">Dòng thời gian</h3></div>
          <button type="button" className="haven-text-action" onClick={onOpenQuickLog}><Plus size={12} /> Thêm</button>
        </div>
        {dayActivities.length === 0 ? (
          <div className="haven-empty-state">
            <span><Sparkles size={18} /></span>
            <strong>Chưa có hoạt động nào được ghi</strong>
            <span className="haven-sr-only">Chưa có dữ liệu được ghi nhận.</span>
            <p>Ghi một hoạt động nhỏ để bắt đầu quan sát nhịp sinh hoạt của Bé.</p>
            <button type="button" className="haven-empty-action" onClick={onOpenQuickLog}>Ghi hoạt động đầu tiên</button>
          </div>
        ) : (
          <NotebookStory entries={timelineActivities} owner="baby" className="haven-home-notebook">
            <section className="journal-period">
              <div className="journal-period-items">
                {timelineActivities.map((record) => {
                  const { label, tone, Icon } = activityPresentation(record.type);
                  const detail = activityDetail(record);
                  return (
                    <article key={record.id} className={`journal-story-item tone-${tone}`}>
                      <time className="journal-story-time" dateTime={record.occurredAt}>{formatTime(record.occurredAt)}</time>
                      <span className="journal-story-icon" aria-hidden="true"><Icon size={16} /></span>
                      <div className="journal-story-content">
                        <div className="journal-story-main">
                          <span className="journal-story-heading">
                            <strong className="journal-story-title">{label}</strong>
                            {detail && <><span className="journal-story-separator" aria-hidden="true">·</span><span className="journal-story-summary">{detail}</span></>}
                          </span>
                          {record.note && <span className="journal-story-detail">{record.note}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </NotebookStory>
        )}
      </section>
    </div>
  );
};
