import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '@/store/useBabyStore';
import { DailyHabits } from './DailyHabits';
import { HomeAIBanner } from './HomeAIBanner';
import {
  Activity,
  ArrowRight,
  Baby,
  BookOpen,
  Eye,
  Flame,
  Heart,
  Moon,
  MoreHorizontal,
  Smile,
  Sparkles,
  Syringe,
} from 'lucide-react';

export interface BabyHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

const MOOD_LABELS: Record<string, string> = {
  Overjoyed: 'Rất vui',
  Happy: 'Vui vẻ',
  Neutral: 'Bình thường',
  Sad: 'Buồn',
  Depressed: 'Cần được quan tâm',
};

const getMoodLabel = (mood?: string) => {
  if (!mood) return 'Chưa cập nhật';
  return MOOD_LABELS[mood] ?? mood;
};

export const BabyHomeView: React.FC<BabyHomeViewProps> = ({
  onOpenScoreDetail,
  onOpenQuickLog,
  onOpenAiChat,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const currentStageData = useBabyStore((state) => state.currentStageData());
  const dailyHabits = useBabyStore((state) => state.dailyHabits);
  const completedHabitsCount = dailyHabits.filter((habit) => habit.completed).length;
  const totalHabitsCount = dailyHabits.length;
  const todayInsight = !currentStageData.todayVitals.milkTotal
    ? 'Hôm nay bé chưa có ghi chép về cữ bú.'
    : !currentStageData.todayVitals.sleepTotal
      ? 'Bé đã có ghi chép ăn uống; hãy cập nhật thêm giấc ngủ hôm nay.'
      : 'Các chỉ số chính của bé đang được theo dõi tốt hôm nay.';

  return (
    <div className="home-view-container">
      <div className="section-title-row">
        <span className="section-main-title">Tóm tắt hôm nay</span>
        <span className="today-progress-badge">{completedHabitsCount}/{totalHabitsCount || 0} việc</span>
      </div>
      <div className="today-summary-card">
        <div className="today-summary-copy">
          <span className="today-summary-eyebrow">Dành cho {currentStageData.currentAgeText}</span>
          <strong>{todayInsight}</strong>
          <span className="today-summary-meta">{currentStageData.growthScore != null ? `Điểm tăng trưởng ${currentStageData.growthScore}/100` : 'Chưa có điểm tăng trưởng'}</span>
        </div>
        <button type="button" className="today-summary-action" onClick={onOpenQuickLog}>+ Ghi chép</button>
      </div>
      <DailyHabits />
      <div className="section-title-row home-section-heading">
        <span className="section-main-title">Chỉ số sức khỏe</span>
        <button type="button" className="section-more-btn section-more-button" aria-label="Xem hồ sơ chi tiết của bé" onClick={() => navigate('/profile')}><MoreHorizontal size={14} /></button>
      </div>
      <div className="metrics-carousel-grid">
        <button type="button" className="freud-score-card" id="btnOpenFreudScore" aria-label="Xem chi tiết điểm tăng trưởng" onClick={onOpenScoreDetail}>
          <div className="card-top-tag-row"><span className="card-top-pill-left"><Sparkles size={10} /> Tăng trưởng</span><MoreHorizontal size={12} /></div>
          <div className="score-concentric-circles-box"><div className="score-inner-badge"><div className="num">{currentStageData.growthScore ?? '—'}</div><div className="lbl">{currentStageData.growthScoreLabel || 'Chưa cập nhật'}</div></div></div>
          <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><span>Xem chi tiết</span><ArrowRight size={10} /></div>
        </button>
        <button type="button" className="mood-highlight-card" id="btnOpenMoodTracker" aria-label="Cập nhật tâm trạng của bé" onClick={onOpenQuickLog}>
          <div className="card-top-tag-row"><span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}><Smile size={11} strokeWidth={2.2} /> Mood</span><MoreHorizontal size={12} /></div>
          <div><div className="mood-card-title">{getMoodLabel(currentStageData.todayVitals.mood)}</div><div style={{ fontSize: '10.5px', opacity: 0.9 }}>{currentStageData.todayVitals.mood ? 'Tâm trạng đã được ghi nhận hôm nay' : 'Hãy cập nhật tâm trạng của bé'}</div></div>
          <div className="mood-dots-track"><div className="mood-dot-step"></div><div className="mood-dot-step"></div><div className="mood-dot-step active"></div><div className="mood-dot-step"></div><div className="mood-dot-step"></div></div>
        </button>
      </div>
      <div className="carousel-indicators-dots"><div className="carousel-dot active"></div><div className="carousel-dot"></div><div className="carousel-dot"></div><div className="carousel-dot"></div></div>
      <div className="section-title-row"><span className="section-main-title">Nhật ký hôm nay</span><button type="button" className="section-action-button" aria-label="Thêm ghi chép hôm nay" onClick={onOpenQuickLog}>+ Thêm</button></div>
      <div className="tracker-list-group">
        <button type="button" className="tracker-list-item" data-action="feeding" aria-label="Cập nhật cữ bú và ăn dặm" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle sage"><Baby size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Cữ bú & Ăn dặm</span><span className="tracker-item-sub">{currentStageData.todayVitals.milkTotal ? `${currentStageData.todayVitals.milkTotal} trong ngày` : 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><svg className="sparkline-svg" viewBox="0 0 50 20" fill="none"><path d="M2 15 Q 12 5, 25 12 T 48 3" stroke="#91A672" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="sleep" aria-label="Cập nhật giấc ngủ của bé" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle purple"><Moon size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Giấc ngủ của Bé</span><span className="tracker-item-sub">{currentStageData.todayVitals.sleepTotal || 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><div className="mini-score-pill">{currentStageData.growthScore ?? '—'}</div></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="diaper" aria-label="Cập nhật thay tã và vệ sinh" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle amber"><Flame size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Thay tã & Vệ sinh</span><span className="tracker-item-sub">{currentStageData.todayVitals.diaperCount != null ? `${currentStageData.todayVitals.diaperCount} lần trong ngày` : 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: '#E89E23' }}>{currentStageData.todayVitals.diaperCount != null ? 'Đã ghi nhận' : 'Cập nhật'}</span></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="health" aria-label="Cập nhật thân nhiệt và thể trạng" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle green"><Activity size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Thân nhiệt & Thể trạng</span><span className="tracker-item-sub">{currentStageData.todayVitals.temperature || 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}>{currentStageData.todayVitals.temperature ? 'Bình thường' : 'Cập nhật'}</span></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="mood" aria-label="Cập nhật tâm trạng của bé" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle rose"><Smile size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Tâm trạng Bé</span><span className="tracker-item-sub">{currentStageData.todayVitals.mood ? `Đang ${getMoodLabel(currentStageData.todayVitals.mood).toLowerCase()}` : 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><span style={{ fontSize: '18px', lineHeight: 1 }}>{currentStageData.todayVitals.moodEmoji || '—'}</span></div>
        </button>
      </div>
      <HomeAIBanner description="Về giấc ngủ, bú và phát triển của bé" openButtonId="btnOpenAiBanner" onOpenAiChat={onOpenAiChat} onShowToast={onShowToast} />
      <div className="section-title-row"><span className="section-main-title">Cẩm nang Chăm sóc</span><button type="button" className="card-action-link" onClick={() => onShowToast?.('Cẩm nang chi tiết đang được hoàn thiện.')}>Xem tất cả</button></div>
      <div className="resources-horizontal-list">
        <button type="button" className="resource-item-card" onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}><div className="resource-item-thumb"><BookOpen size={20} color="var(--color-sage-dark)" /></div><span className="resource-tag-pill">Ăn dặm BLW</span><div className="resource-item-title">Thực đơn ăn dặm giàu sắt từ 8 tháng?</div><div className="resource-item-stats"><span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 5.2k</span><span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 987</span></div></button>
        <button type="button" className="resource-item-card" onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}><div className="resource-item-thumb"><Moon size={20} color="#9579EE" /></div><span className="resource-tag-pill">Giấc ngủ</span><div className="resource-item-title">Rèn bé tự ngủ xuyên đêm không quấy?</div><div className="resource-item-stats"><span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 8.4k</span><span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 1.4k</span></div></button>
        <button type="button" className="resource-item-card" onClick={() => onShowToast?.('Bài viết này sẽ mở trong phiên bản tiếp theo.')}><div className="resource-item-thumb"><Syringe size={20} color="#E87A90" /></div><span className="resource-tag-pill">Tiêm chủng</span><div className="resource-item-title">Lịch tiêm phòng quan trọng năm đầu đời</div><div className="resource-item-stats"><span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 6.1k</span><span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 890</span></div></button>
      </div>
    </div>
  );
};
