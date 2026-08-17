/**
 * Haven design direction: an espresso context header, one reassuring daily focus,
 * compact mixed metrics, and an anchored recent-activity surface for baby care.
 */
import { useMemo } from 'react';
import { ChevronRight, Clock, Layers, Milk, Moon, Plus, Sparkles } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { getRecentBabyActivities, selectBabyTodayMetrics } from '@/domain/activitySelectors';

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

function activityLabel(type: string): string {
  const labels: Record<string, string> = {
    feeding: 'Cữ bú', sleep: 'Giấc ngủ', diaper: 'Thay tã', medicine: 'Thuốc / vitamin', temperature: 'Nhiệt độ', health_note: 'Ghi chú sức khỏe',
  };
  return labels[type] ?? type;
}

export const BabyHomeView: React.FC<BabyHomeViewProps> = ({ onOpenQuickLog }) => {
  const records = useActivityStore((state) => state.babyActivities);
  const metrics = useMemo(() => selectBabyTodayMetrics(records, new Date()), [records]);
  const recent = useMemo(() => getRecentBabyActivities(records, 5), [records]);
  const feedingFocus = metrics.feedingCount ? `${metrics.feedingAmountMl} ml` : 'Sẵn sàng';
  const feedingDetail = metrics.feedingCount ? `${metrics.feedingCount} cữ bú hôm nay` : 'Bắt đầu ghi lại nhịp sinh hoạt của Bé';

  return (
    <div className="haven-home haven-home-baby">
      <section className="haven-summary-card" aria-labelledby="baby-today-title">
        <div className="haven-summary-copy">
          <span className="haven-eyebrow">NHỊP SINH HOẠT HÔM NAY</span>
          <h2 id="baby-today-title">Theo dõi Bé<br />thật nhẹ nhàng.</h2>
          <p>{feedingDetail}</p>
        </div>
        <div className="haven-summary-orbit" aria-label={`Sữa hôm nay ${feedingFocus}`}>
          <strong>{feedingFocus}</strong>
          <span>Sữa hôm nay</span>
        </div>
        <button type="button" className="haven-summary-action" aria-label="+ Ghi nhanh" onClick={onOpenQuickLog}>
          Ghi nhanh <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
        </button>
      </section>

      <section className="haven-metrics-sheet" aria-label="Tóm tắt chỉ số của Bé">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">TÓM TẮT NHẸ NHÀNG</span><h3>Những điều đáng chú ý</h3></div><span className="haven-sheet-date">Hôm nay</span></div>
        <div className="haven-metric-grid">
          <article className="haven-metric-card haven-metric-sage">
            <span className="haven-metric-icon"><Milk size={13} /></span>
            <span className="haven-metric-label">Sữa</span>
            <strong>{metrics.feedingCount ? `${metrics.feedingAmountMl} ml` : '—'}</strong>
            <small>{metrics.feedingCount ? `${metrics.feedingCount} cữ` : 'Chưa ghi nhận'}</small>
            {metrics.feedingCount ? <span className="haven-sr-only">{`${metrics.feedingAmountMl} ml · ${metrics.feedingCount} cữ`}</span> : null}
          </article>
          <article className="haven-metric-card haven-metric-lilac">
            <span className="haven-metric-icon"><Moon size={13} /></span>
            <span className="haven-metric-label">Ngủ</span>
            <strong>{metrics.sleepMinutes ? formatMinutes(metrics.sleepMinutes) : '—'}</strong>
            <small>{metrics.sleepMinutes ? 'Tổng thời gian' : 'Chưa ghi nhận'}</small>
          </article>
          <article className="haven-metric-card haven-metric-yellow">
            <span className="haven-metric-icon"><Layers size={13} /></span>
            <span className="haven-metric-label">Tã</span>
            <strong>{metrics.diaperCount || '—'}</strong>
            <small>{metrics.diaperCount ? 'Lần thay tã' : 'Chưa ghi nhận'}</small>
            {metrics.diaperCount ? <span className="haven-sr-only">{`${metrics.diaperCount} lần`}</span> : null}
          </article>
          <article className="haven-metric-card haven-metric-clay">
            <span className="haven-metric-icon"><Clock size={13} /></span>
            <span className="haven-metric-label">Cữ gần nhất</span>
            <strong>{metrics.lastFeedingAt ? formatTime(metrics.lastFeedingAt) : '—'}</strong>
            <small>{metrics.lastFeedingAt ? 'Thời điểm ghi nhận' : 'Chưa ghi nhận'}</small>
          </article>
        </div>
      </section>

      <section className="haven-activity-surface" aria-labelledby="baby-recent-title">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">NHẬT KÝ NHỊP SỐNG</span><h3 id="baby-recent-title">Gần đây</h3></div><button type="button" className="haven-text-action" onClick={onOpenQuickLog}>Thêm mục</button></div>
        {recent.length === 0 ? (
          <div className="haven-empty-state">
            <span><Sparkles size={18} /></span>
            <strong>Chưa có khoảnh khắc nào được ghi lại</strong>
            <span className="haven-sr-only">Chưa có dữ liệu được ghi nhận.</span>
            <p>Ghi một hoạt động nhỏ để bắt đầu quan sát nhịp sinh hoạt của Bé.</p>
            <button type="button" className="haven-empty-action" onClick={onOpenQuickLog}>Ghi hoạt động đầu tiên</button>
          </div>
        ) : (
          <div className="haven-activity-list">
            {recent.map((record) => (
              <article key={record.id} className="haven-activity-row">
                <span className="haven-activity-dot" aria-hidden="true"></span>
                <div>
                  <strong>{activityLabel(record.type)}</strong>
                  <p>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(record.occurredAt))}{record.note ? ` · ${record.note}` : ''}</p>
                </div>
                <span className="haven-chevron"><ChevronRight size={14} /></span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

