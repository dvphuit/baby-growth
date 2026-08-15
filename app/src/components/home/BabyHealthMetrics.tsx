import { ArrowRight, MoreHorizontal, Smile, Sparkles } from 'lucide-react';
import { getMoodLabel } from './homeViewModel';

export interface BabyHealthMetricsProps {
  growthScore?: number | null;
  growthScoreLabel?: string;
  mood?: string;
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenProfile: () => void;
}

export const BabyHealthMetrics: React.FC<BabyHealthMetricsProps> = ({ growthScore, growthScoreLabel, mood, onOpenScoreDetail, onOpenQuickLog, onOpenProfile }) => (
  <>
    <div className="section-title-row home-section-heading"><span className="section-main-title">Chỉ số sức khỏe</span><button type="button" className="section-more-btn section-more-button" aria-label="Xem hồ sơ chi tiết của bé" onClick={onOpenProfile}><MoreHorizontal size={14} /></button></div>
    <div className="metrics-carousel-grid">
      <button type="button" className="freud-score-card" id="btnOpenFreudScore" aria-label="Xem chi tiết điểm tăng trưởng" onClick={onOpenScoreDetail}>
        <div className="card-top-tag-row"><span className="card-top-pill-left"><Sparkles size={10} /> Tăng trưởng</span><MoreHorizontal size={12} /></div>
        <div className="score-concentric-circles-box"><div className="score-inner-badge"><div className="num">{growthScore ?? '—'}</div><div className="lbl">{growthScoreLabel || 'Chưa cập nhật'}</div></div></div>
        <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><span>Xem chi tiết</span><ArrowRight size={10} /></div>
      </button>
      <button type="button" className="mood-highlight-card" id="btnOpenMoodTracker" aria-label="Cập nhật tâm trạng của bé" onClick={onOpenQuickLog}>
        <div className="card-top-tag-row"><span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}><Smile size={11} strokeWidth={2.2} /> Mood</span><MoreHorizontal size={12} /></div>
        <div><div className="mood-card-title">{getMoodLabel(mood)}</div><div style={{ fontSize: '10.5px', opacity: 0.9 }}>{mood ? 'Tâm trạng đã được ghi nhận hôm nay' : 'Hãy cập nhật tâm trạng của bé'}</div></div>
        <div className="mood-dots-track"><div className="mood-dot-step"></div><div className="mood-dot-step"></div><div className="mood-dot-step active"></div><div className="mood-dot-step"></div><div className="mood-dot-step"></div></div>
      </button>
    </div>
    <div className="carousel-indicators-dots"><div className="carousel-dot active"></div><div className="carousel-dot"></div><div className="carousel-dot"></div><div className="carousel-dot"></div></div>
  </>
);
