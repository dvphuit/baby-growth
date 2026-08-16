import { useMemo } from 'react';
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

  return (
    <div className="home-view-container">
      <section className="app-card" aria-labelledby="baby-today-title">
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow">HÔM NAY</div>
            <h2 id="baby-today-title" className="section-title">Theo dõi Bé</h2>
          </div>
          <button type="button" className="btn-primary-small" onClick={onOpenQuickLog}>+ Ghi nhanh</button>
        </div>

        <div className="vitals-grid" style={{ marginTop: 12 }}>
          <div className="vital-item"><span className="vital-label">Sữa</span><strong>{metrics.feedingCount ? `${metrics.feedingAmountMl} ml · ${metrics.feedingCount} cữ` : 'Chưa ghi nhận'}</strong></div>
          <div className="vital-item"><span className="vital-label">Ngủ</span><strong>{formatMinutes(metrics.sleepMinutes)}</strong></div>
          <div className="vital-item"><span className="vital-label">Tã</span><strong>{metrics.diaperCount ? `${metrics.diaperCount} lần` : 'Chưa ghi nhận'}</strong></div>
          <div className="vital-item"><span className="vital-label">Cữ bú gần nhất</span><strong>{formatTime(metrics.lastFeedingAt)}</strong></div>
        </div>
      </section>

      <section className="app-card" aria-labelledby="baby-recent-title">
        <div className="section-header-row"><h3 id="baby-recent-title" className="section-title">Gần đây</h3></div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '18px 0' }}>
            <p>Chưa có dữ liệu được ghi nhận.</p>
            <button type="button" className="log-btn-primary" onClick={onOpenQuickLog}>+ Ghi hoạt động đầu tiên</button>
          </div>
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
