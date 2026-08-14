import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useUIStore } from '@/store/useUIStore';

interface ScoreRingProps {
  onOpenScoreDetail: () => void;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ onOpenScoreDetail }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const profileMode = useUIStore(s => s.profileMode);
  const momData = useMomStore(s => s.momData);

  const isMom = profileMode === 'mom';
  const scoreVal = isMom ? momData.wellnessScore : (currentStageData.growthScore || 92);
  const scoreLabel = isMom
    ? 'Hồi phục Sau sinh Xuất sắc'
    : (currentStageData.growthScoreLabel || 'Phát triển Tối ưu');
  const ageLabel = isMom ? momData.postpartumDay : currentStageData.currentAgeText;

  return (
    <div className="score-hero-container" onClick={onOpenScoreDetail} style={{ cursor: 'pointer' }}>
      <div className="score-ring-outer-waves">
        <div className="score-wave-layer wave-3"></div>
        <div className="score-wave-layer wave-2"></div>
        <div className="score-wave-layer wave-1"></div>
        <div className="score-center-disk">
          <div className="score-number-display">{scoreVal}</div>
          <div className="score-scale-text">/ 100</div>
        </div>
      </div>

      <div className="score-meta-box">
        <div className="score-badge-pill">
          <span>🌿</span>
          <span>{scoreLabel}</span>
        </div>
        <h2 className="score-stage-title">{ageLabel}</h2>
        <p className="score-subtitle-desc">
          Đạt chuẩn WHO • Chạm để xem phân tích chi tiết &rarr;
        </p>
      </div>
    </div>
  );
};
