/**
 * Haven design direction: an espresso context header, one reassuring daily focus,
 * compact mixed metrics, and an anchored recent-activity surface for maternal care.
 */
import { useMemo } from 'react';
import { ChevronRight, Clock, Milk, Moon, Plus, Smile, Sparkles } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { getRecentMomActivities, selectMomTodayMetrics } from '@/domain/activitySelectors';

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

function moodLabel(value: string | undefined): string {
  const labels: Record<string, string> = { great: 'Rất tốt', good: 'Tốt', neutral: 'Bình thường', low: 'Không tốt', very_low: 'Rất không tốt' };
  return value ? labels[value] ?? value : 'Chưa ghi nhận';
}

function activityLabel(type: string): string {
  const labels: Record<string, string> = { pumping: 'Hút sữa', sleep: 'Giấc ngủ', mood: 'Tâm trạng', recovery_note: 'Phục hồi' };
  return labels[type] ?? type;
}

export const MomHomeView: React.FC<MomHomeViewProps> = ({ onOpenPumping }) => {
  const records = useActivityStore((state) => state.momActivities);
  const metrics = useMemo(() => selectMomTodayMetrics(records, new Date()), [records]);
  const recent = useMemo(() => getRecentMomActivities(records, 5), [records]);
  const latestMood = metrics.latestMood?.type === 'mood' ? metrics.latestMood.mood : undefined;
  const pumpingFocus = metrics.pumpingCount ? `${metrics.pumpingAmountMl} ml` : 'Chậm lại';
  const pumpingDetail = metrics.pumpingCount ? `${metrics.pumpingCount} cữ hút hôm nay` : 'Một nhịp chậm cũng có thể là đủ';

  return (
    <div className="haven-home haven-home-mom">
      <section className="haven-summary-card haven-summary-card-mom" aria-labelledby="mom-today-title">
        <div className="haven-summary-copy"><span className="haven-eyebrow">CHĂM SÓC MẸ HÔM NAY</span><h2 id="mom-today-title">Một nhịp chậm<br />vẫn rất đủ đầy.</h2><p>{pumpingDetail}</p></div>
        <div className="haven-summary-orbit" aria-label={`Hút sữa hôm nay ${pumpingFocus}`}><strong>{pumpingFocus}</strong><span>Hút sữa hôm nay</span></div>
        <button type="button" className="haven-summary-action" aria-label="+ Hút sữa" onClick={onOpenPumping}>
          Hút sữa <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
        </button>
      </section>

      <section className="haven-metrics-sheet" aria-label="Tóm tắt chỉ số của Mẹ">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">TÓM TẮT NHẸ NHÀNG</span><h3>Những điều đáng chú ý</h3></div><span className="haven-sheet-date">Hôm nay</span></div>
        <div className="haven-metric-grid">
          <article className="haven-metric-card haven-metric-rose">
            <span className="haven-metric-icon"><Milk size={13} /></span>
            <span className="haven-metric-label">Hút sữa</span>
            <strong>{metrics.pumpingCount ? `${metrics.pumpingAmountMl} ml` : '—'}</strong>
            <small>{metrics.pumpingCount ? `${metrics.pumpingCount} cữ` : 'Chưa ghi nhận'}</small>
            {metrics.pumpingCount ? <span className="haven-sr-only">{`${metrics.pumpingAmountMl} ml · ${metrics.pumpingCount} cữ`}</span> : null}
          </article>
          <article className="haven-metric-card haven-metric-lilac">
            <span className="haven-metric-icon"><Moon size={13} /></span>
            <span className="haven-metric-label">Ngủ</span>
            <strong>{metrics.sleepMinutes ? formatMinutes(metrics.sleepMinutes) : '—'}</strong>
            <small>{metrics.sleepMinutes ? 'Tổng thời gian' : 'Chưa ghi nhận'}</small>
          </article>
          <article className="haven-metric-card haven-metric-yellow">
            <span className="haven-metric-icon"><Smile size={13} /></span>
            <span className="haven-metric-label">Tâm trạng</span>
            <strong>{latestMood ? moodLabel(latestMood) : '—'}</strong>
            <small>{latestMood ? 'Lần ghi nhận gần nhất' : 'Chưa ghi nhận'}</small>
          </article>
          <article className="haven-metric-card haven-metric-clay">
            <span className="haven-metric-icon"><Clock size={13} /></span>
            <span className="haven-metric-label">Cữ gần nhất</span>
            <strong>{metrics.lastPumpingAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(metrics.lastPumpingAt)) : '—'}</strong>
            <small>{metrics.lastPumpingAt ? 'Thời điểm ghi nhận' : 'Chưa ghi nhận'}</small>
          </article>
        </div>
      </section>

      <section className="haven-activity-surface" aria-labelledby="mom-recent-title">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">NHẬT KÝ NHỊP SỐNG</span><h3 id="mom-recent-title">Gần đây</h3></div><button type="button" className="haven-text-action" onClick={onOpenPumping}>Thêm mục</button></div>
        {recent.length === 0 ? (
          <div className="haven-empty-state">
            <span><Sparkles size={18} /></span>
            <strong>Chưa có khoảnh khắc nào được ghi lại</strong>
            <p>Ghi một hoạt động nhỏ để bắt đầu quan sát nhịp phục hồi của Mẹ.</p>
            <button type="button" className="haven-empty-action" onClick={onOpenPumping}>Ghi hoạt động đầu tiên</button>
          </div>
        ) : (
          <div className="haven-activity-list">
            {recent.map((record) => (
              <article key={record.id} className="haven-activity-row">
                <span className="haven-activity-dot haven-activity-dot-mom" aria-hidden="true"></span>
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

