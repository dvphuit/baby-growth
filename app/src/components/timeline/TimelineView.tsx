import { useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { useBabyStore } from '@/store/useBabyStore';
import { getRealGrowthHistory } from '@/domain/growthSelectors';
import { buildTimelineEntries, filterTimelineByLocalDate } from '@/domain/timelineSelectors';

interface TimelineViewProps { onOpenLightbox: (src: string, isVideo?: boolean) => void; onOpenAddEntry: () => void; }

function localDateInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
function ownerLabel(owner: 'baby' | 'mom' | 'system'): string { return owner === 'baby' ? 'Bé' : owner === 'mom' ? 'Mẹ' : 'Hệ thống'; }

export const TimelineView: React.FC<TimelineViewProps> = ({ onOpenAddEntry }) => {
  const babyActivities = useActivityStore((state) => state.babyActivities);
  const momActivities = useActivityStore((state) => state.momActivities);
  const rawGrowthHistory = useBabyStore((state) => state.currentStageData().growthHistory);
  const growthHistory = useMemo(() => getRealGrowthHistory(rawGrowthHistory), [rawGrowthHistory]);
  const [selectedDate, setSelectedDate] = useState(localDateInputValue);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'baby' | 'mom'>('all');
  const entries = useMemo(() => buildTimelineEntries({ babyActivities, momActivities, growthHistory }), [babyActivities, momActivities, growthHistory]);
  const visibleEntries = useMemo(() => {
    const dayEntries = filterTimelineByLocalDate(entries, selectedDate);
    return ownerFilter === 'all' ? dayEntries : dayEntries.filter((entry) => entry.owner === ownerFilter);
  }, [entries, ownerFilter, selectedDate]);

  return (
    <div className="timeline-view-wrapper">
      <section className="app-card">
        <div className="section-header-row"><div><div className="section-eyebrow">NHẬT KÝ</div><h2 className="section-title"><CalendarDays size={17} style={{ verticalAlign: 'middle', marginRight: 6 }} />Lịch sử thực tế</h2></div><button type="button" className="btn-primary-small" onClick={onOpenAddEntry}><Plus size={14} /> Ghi chú</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginTop: 12 }}>
          <input aria-label="Ngày nhật ký" className="log-input-control" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <select aria-label="Lọc người" className="log-input-control" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value as typeof ownerFilter)}><option value="all">Tất cả</option><option value="baby">Bé</option><option value="mom">Mẹ</option></select>
        </div>
      </section>
      <section className="app-card" style={{ marginTop: 12 }}>
        {visibleEntries.length === 0 ? <div className="empty-state" style={{ padding: '24px 4px' }}><p>Không có ghi nhận nào trong ngày này.</p></div> : (
          <div className="timeline-list">{visibleEntries.map((entry) => (
            <article key={entry.id} className="timeline-item-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><div><div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 4 }}><span className="timeline-tag">{ownerLabel(entry.owner)}</span><strong>{entry.title}</strong></div>{entry.detail && <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{entry.detail}</div>}</div><time style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--color-text-muted)' }}>{new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.occurredAt))}</time></div>
              {entry.stats.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>{entry.stats.map((stat) => <span key={stat} className="timeline-stat-pill">{stat}</span>)}</div>}
            </article>
          ))}</div>
        )}
      </section>
    </div>
  );
};
