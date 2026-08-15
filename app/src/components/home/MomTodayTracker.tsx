import { HeartPulse, Milk, Moon } from 'lucide-react';

export interface MomTodayTrackerProps {
  todayTotal: string;
  sessionsToday: number;
  sleepDebt: string;
  epdsScore: string;
  onOpenPumping: () => void;
}

export const MomTodayTracker: React.FC<MomTodayTrackerProps> = ({ todayTotal, sessionsToday, sleepDebt, epdsScore, onOpenPumping }) => (
  <>
    <div className="section-title-row"><span className="section-main-title">Nhật ký hôm nay</span><button type="button" className="section-action-button" aria-label="Thêm ghi chép hôm nay" onClick={onOpenPumping}>+ Thêm</button></div>
    <div className="tracker-list-group">
      <button type="button" className="tracker-list-item" id="btnMomPumpingRow" aria-label="Ghi nhận cữ hút sữa mẹ" onClick={onOpenPumping}>
        <div className="tracker-item-left"><div className="tracker-icon-circle rose"><Milk size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Hút sữa mẹ</span><span className="tracker-item-sub">{todayTotal} ({sessionsToday} cữ)</span></div></div>
        <div className="tracker-item-right"><span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-mom-rose)' }}>+180ml</span></div>
      </button>
      <div className="tracker-list-item"><div className="tracker-item-left"><div className="tracker-icon-circle purple"><Moon size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Nợ giấc ngủ</span><span className="tracker-item-sub">{sleepDebt}</span></div></div><div className="tracker-item-right"><div className="mini-score-pill">7.5h</div></div></div>
      <div className="tracker-list-item"><div className="tracker-item-left"><div className="tracker-icon-circle green"><HeartPulse size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Tâm lý & EPDS</span><span className="tracker-item-sub">{epdsScore} (Rất an toàn)</span></div></div><div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}>Tốt</span></div></div>
    </div>
  </>
);
