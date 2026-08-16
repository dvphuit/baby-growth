import { useMemo } from 'react';
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
  const labels: Record<string, string> = {
    great: 'Rất tốt', good: 'Tốt', neutral: 'Bình thường', low: 'Không tốt', very_low: 'Rất không tốt',
  };
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

  return (
    <div className="home-view-container">
      <section className="app-card" aria-labelledby="mom-today-title">
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow">HÔM NAY</div>
            <h2 id="mom-today-title" className="section-title">Theo dõi Mẹ</h2>
          </div>
          <button type="button" className="btn-primary-small" onClick={onOpenPumping}>+ Hút sữa</button>
        </div>

        <div className="vitals-grid" style={{ marginTop: 12 }}>
          <div className="vital-item"><span className="vital-label">Hút sữa</span><strong>{metrics.pumpingCount ? `${metrics.pumpingAmountMl} ml · ${metrics.pumpingCount} cữ` : 'Chưa ghi nhận'}</strong></div>
          <div className="vital-item"><span className="vital-label">Ngủ</span><strong>{formatMinutes(metrics.sleepMinutes)}</strong></div>
          <div className="vital-item"><span className="vital-label">Tâm trạng</span><strong>{moodLabel(latestMood)}</strong></div>
          <div className="vital-item"><span className="vital-label">Cữ hút gần nhất</span><strong>{metrics.lastPumpingAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(metrics.lastPumpingAt)) : 'Chưa ghi nhận'}</strong></div>
        </div>
      </section>

      <section className="app-card" aria-labelledby="mom-recent-title">
        <div className="section-header-row"><h3 id="mom-recent-title" className="section-title">Gần đây</h3></div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '18px 0' }}><p>Chưa có dữ liệu được ghi nhận.</p></div>
        ) : (
          <div className="timeline-list">
            {recent.map((record) => (
              <div key={record.id} className="timeline-item-card" style={{ padding: 12 }}>
                <strong>{activityLabel(record.type)}</strong>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(record.occurredAt))}
                  {record.note ? ` · ${record.note}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
