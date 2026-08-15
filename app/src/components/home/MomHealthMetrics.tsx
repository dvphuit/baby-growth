import { ArrowRight, Heart, Milk, MoreHorizontal } from 'lucide-react';

export interface MomHealthMetricsProps {
  wellnessScore: number;
  onOpenScoreDetail: () => void;
}

export const MomHealthMetrics: React.FC<MomHealthMetricsProps> = ({ wellnessScore, onOpenScoreDetail }) => (
  <>
    <div className="section-title-row">
      <span className="section-main-title">Chỉ số Sức khỏe & Phục hồi</span>
      <span className="section-more-btn"><MoreHorizontal size={14} /></span>
    </div>
    <div className="metrics-carousel-grid">
      <button type="button" className="freud-score-card" id="btnOpenMomScoreDetail" aria-label="Xem chi tiết chỉ số hồi phục của mẹ" style={{ background: 'var(--color-mom-rose)' }} onClick={onOpenScoreDetail}>
        <div className="card-top-tag-row"><span className="card-top-pill-left"><Heart size={10} fill="currentColor" /> Wellness</span><MoreHorizontal size={12} /></div>
        <div className="score-concentric-circles-box" style={{ background: 'rgba(255,255,255,0.2)' }}><div className="score-inner-badge"><div className="num">{wellnessScore}</div><div className="lbl">Hồi phục tốt</div></div></div>
        <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><span>Xem chi tiết</span><ArrowRight size={10} /></div>
      </button>
      <div className="mood-highlight-card" style={{ background: 'linear-gradient(145deg, #E87A90 0%, #D95D77 100%)' }}>
        <div className="card-top-tag-row"><span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}><Milk size={11} /> Sữa Đông</span><MoreHorizontal size={12} /></div>
        <div><div className="mood-card-title">4.85 L</div><div style={{ fontSize: '10.5px', opacity: 0.9 }}>24 túi trữ an toàn</div></div>
        <div className="mood-dots-track"><div className="mood-dot-step active"></div><div className="mood-dot-step active"></div><div className="mood-dot-step active"></div><div className="mood-dot-step"></div></div>
      </div>
    </div>
    <div className="carousel-indicators-dots"><div className="carousel-dot active"></div><div className="carousel-dot"></div><div className="carousel-dot"></div></div>
  </>
);
