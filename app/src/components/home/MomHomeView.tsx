import { useMomStore } from '@/store/useMomStore';
import { ArrowRight, Heart, HeartPulse, Milk, Moon, MoreHorizontal } from 'lucide-react';
import { HomeAIBanner } from './HomeAIBanner';

export interface MomHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const MomHomeView: React.FC<MomHomeViewProps> = ({
  onOpenScoreDetail,
  onOpenAiChat,
  onOpenPumping,
  onShowToast,
}) => {
  const momData = useMomStore((state) => state.momData);

  return (
    <div className="home-view-container">
      <div className="section-title-row">
        <span className="section-main-title">Chỉ số Sức khỏe & Phục hồi</span>
        <span className="section-more-btn"><MoreHorizontal size={14} /></span>
      </div>
      <div className="metrics-carousel-grid">
        <button type="button" className="freud-score-card" id="btnOpenMomScoreDetail" aria-label="Xem chi tiết chỉ số hồi phục của mẹ" style={{ background: 'var(--color-mom-rose)' }} onClick={onOpenScoreDetail}>
          <div className="card-top-tag-row"><span className="card-top-pill-left"><Heart size={10} fill="currentColor" /> Wellness</span><MoreHorizontal size={12} /></div>
          <div className="score-concentric-circles-box" style={{ background: 'rgba(255,255,255,0.2)' }}><div className="score-inner-badge"><div className="num">{momData.wellnessScore}</div><div className="lbl">Hồi phục tốt</div></div></div>
          <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><span>Xem chi tiết</span><ArrowRight size={10} /></div>
        </button>
        <div className="mood-highlight-card" style={{ background: 'linear-gradient(145deg, #E87A90 0%, #D95D77 100%)' }}>
          <div className="card-top-tag-row"><span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}><Milk size={11} /> Sữa Đông</span><MoreHorizontal size={12} /></div>
          <div><div className="mood-card-title">4.85 L</div><div style={{ fontSize: '10.5px', opacity: 0.9 }}>24 túi trữ an toàn</div></div>
          <div className="mood-dots-track"><div className="mood-dot-step active"></div><div className="mood-dot-step active"></div><div className="mood-dot-step active"></div><div className="mood-dot-step"></div></div>
        </div>
      </div>
      <div className="carousel-indicators-dots"><div className="carousel-dot active"></div><div className="carousel-dot"></div><div className="carousel-dot"></div></div>
      <div className="section-title-row"><span className="section-main-title">Nhật ký hôm nay</span><button type="button" className="section-action-button" aria-label="Thêm ghi chép hôm nay" onClick={onOpenPumping}>+ Thêm</button></div>
      <div className="tracker-list-group">
        <button type="button" className="tracker-list-item" id="btnMomPumpingRow" aria-label="Ghi nhận cữ hút sữa mẹ" onClick={onOpenPumping}>
          <div className="tracker-item-left"><div className="tracker-icon-circle rose"><Milk size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Hút sữa mẹ</span><span className="tracker-item-sub">{momData.pumping.todayTotal} ({momData.pumping.sessionsToday} cữ)</span></div></div>
          <div className="tracker-item-right"><span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-mom-rose)' }}>+180ml</span></div>
        </button>
        <div className="tracker-list-item"><div className="tracker-item-left"><div className="tracker-icon-circle purple"><Moon size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Nợ giấc ngủ</span><span className="tracker-item-sub">{momData.mentalHealth.sleepDebt}</span></div></div><div className="tracker-item-right"><div className="mini-score-pill">7.5h</div></div></div>
        <div className="tracker-list-item"><div className="tracker-item-left"><div className="tracker-icon-circle green"><HeartPulse size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Tâm lý & EPDS</span><span className="tracker-item-sub">{momData.mentalHealth.epdsScore} (Rất an toàn)</span></div></div><div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}>Tốt</span></div></div>
      </div>
      <HomeAIBanner description="Về phục hồi, giấc ngủ và sức khỏe của mẹ" openButtonId="btnOpenAiFromHome" onOpenAiChat={onOpenAiChat} onShowToast={onShowToast} />
    </div>
  );
};
