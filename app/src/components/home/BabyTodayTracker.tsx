import { Activity, Baby, Flame, Moon, Smile } from 'lucide-react';
import { getMoodLabel } from './homeViewModel';

export interface BabyTodayTrackerProps {
  milkTotal: string;
  sleepTotal: string;
  diaperCount?: number | null;
  temperature: string;
  mood: string;
  moodEmoji: string;
  growthScore?: number | null;
  onOpenQuickLog: () => void;
}

export const BabyTodayTracker: React.FC<BabyTodayTrackerProps> = ({
  milkTotal,
  sleepTotal,
  diaperCount,
  temperature,
  mood,
  moodEmoji,
  growthScore,
  onOpenQuickLog,
}) => (
  <>
    <div className="section-title-row">
      <span className="section-main-title">Nhật ký hôm nay</span>
      <button
        type="button"
        className="section-action-button"
        aria-label="Thêm ghi chép hôm nay"
        onClick={onOpenQuickLog}
      >
        + Thêm
      </button>
    </div>

    <div className="tracker-list-group">
      <button
        type="button"
        className="tracker-list-item"
        data-action="feeding"
        aria-label="Cập nhật cữ bú và ăn dặm"
        onClick={onOpenQuickLog}
      >
        <div className="tracker-item-left">
          <div className="tracker-icon-circle sage"><Baby size={15} /></div>
          <div className="tracker-item-info">
            <span className="tracker-item-title">Cữ bú & Ăn dặm</span>
            <span className="tracker-item-sub">{milkTotal ? `${milkTotal} trong ngày` : 'Chưa cập nhật'}</span>
          </div>
        </div>
        <div className="tracker-item-right">
          <svg className="sparkline-svg" viewBox="0 0 50 20" fill="none">
            <path d="M2 15 Q 12 5, 25 12 T 48 3" stroke="#91A672" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      <button
        type="button"
        className="tracker-list-item"
        data-action="sleep"
        aria-label="Cập nhật giấc ngủ của bé"
        onClick={onOpenQuickLog}
      >
        <div className="tracker-item-left">
          <div className="tracker-icon-circle purple"><Moon size={15} /></div>
          <div className="tracker-item-info">
            <span className="tracker-item-title">Giấc ngủ của Bé</span>
            <span className="tracker-item-sub">{sleepTotal || 'Chưa cập nhật'}</span>
          </div>
        </div>
        <div className="tracker-item-right"><div className="mini-score-pill">{growthScore ?? '—'}</div></div>
      </button>

      <button
        type="button"
        className="tracker-list-item"
        data-action="diaper"
        aria-label="Cập nhật thay tã và vệ sinh"
        onClick={onOpenQuickLog}
      >
        <div className="tracker-item-left">
          <div className="tracker-icon-circle amber"><Flame size={15} /></div>
          <div className="tracker-item-info">
            <span className="tracker-item-title">Thay tã & Vệ sinh</span>
            <span className="tracker-item-sub">{diaperCount != null ? `${diaperCount} lần trong ngày` : 'Chưa cập nhật'}</span>
          </div>
        </div>
        <div className="tracker-item-right">
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#E89E23' }}>
            {diaperCount != null ? 'Đã ghi nhận' : 'Cập nhật'}
          </span>
        </div>
      </button>

      <button
        type="button"
        className="tracker-list-item"
        data-action="health"
        aria-label="Cập nhật thân nhiệt và thể trạng"
        onClick={onOpenQuickLog}
      >
        <div className="tracker-item-left">
          <div className="tracker-icon-circle green"><Activity size={15} /></div>
          <div className="tracker-item-info">
            <span className="tracker-item-title">Thân nhiệt & Thể trạng</span>
            <span className="tracker-item-sub">{temperature || 'Chưa cập nhật'}</span>
          </div>
        </div>
        <div className="tracker-item-right">
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}>
            {temperature ? 'Bình thường' : 'Cập nhật'}
          </span>
        </div>
      </button>

      <button
        type="button"
        className="tracker-list-item"
        data-action="mood"
        aria-label="Cập nhật tâm trạng của bé"
        onClick={onOpenQuickLog}
      >
        <div className="tracker-item-left">
          <div className="tracker-icon-circle rose"><Smile size={15} /></div>
          <div className="tracker-item-info">
            <span className="tracker-item-title">Tâm trạng Bé</span>
            <span className="tracker-item-sub">{mood ? `Đang ${getMoodLabel(mood).toLowerCase()}` : 'Chưa cập nhật'}</span>
          </div>
        </div>
        <div className="tracker-item-right"><span style={{ fontSize: '18px', lineHeight: 1 }}>{moodEmoji || '—'}</span></div>
      </button>
    </div>
  </>
);
