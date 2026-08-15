import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '@/store/useBabyStore';
import { DailyHabits } from './DailyHabits';
import { HomeAIBanner } from './HomeAIBanner';
import { BabyTodaySummary } from './BabyTodaySummary';
import { BabyHealthMetrics } from './BabyHealthMetrics';
import { getMoodLabel } from './homeViewModel';
import { Activity, Baby, BookOpen, Eye, Flame, Heart, Moon, Smile, Syringe } from 'lucide-react';

export interface BabyHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const BabyHomeView: React.FC<BabyHomeViewProps> = ({ onOpenScoreDetail, onOpenQuickLog, onOpenAiChat, onShowToast }) => {
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
      <BabyTodaySummary currentAgeText={currentStageData.currentAgeText} completedHabitsCount={completedHabitsCount} totalHabitsCount={totalHabitsCount} todayInsight={todayInsight} growthScore={currentStageData.growthScore} onOpenQuickLog={onOpenQuickLog} />
      <DailyHabits />
      <BabyHealthMetrics growthScore={currentStageData.growthScore} growthScoreLabel={currentStageData.growthScoreLabel} mood={currentStageData.todayVitals.mood} onOpenScoreDetail={onOpenScoreDetail} onOpenQuickLog={onOpenQuickLog} onOpenProfile={() => navigate('/profile')} />
      <div className="section-title-row"><span className="section-main-title">Nhật ký hôm nay</span><button type="button" className="section-action-button" aria-label="Thêm ghi chép hôm nay" onClick={onOpenQuickLog}>+ Thêm</button></div>
      <div className="tracker-list-group">
        <button type="button" className="tracker-list-item" data-action="feeding" aria-label="Cập nhật cữ bú và ăn dặm" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle sage"><Baby size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Cữ bú & Ăn dặm</span><span className="tracker-item-sub">{currentStageData.todayVitals.milkTotal ? `${currentStageData.todayVitals.milkTotal} trong ngày` : 'Chưa cập nhật'}</span></div></div>
          <div className="tracker-item-right"><svg className="sparkline-svg" viewBox="0 0 50 20" fill="none"><path d="M2 15 Q 12 5, 25 12 T 48 3" stroke="#91A672" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="sleep" aria-label="Cập nhật giấc ngủ của bé" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle purple"><Moon size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Giấc ngủ của Bé</span><span className="tracker-item-sub">{currentStageData.todayVitals.sleepTotal || 'Chưa cập nhật'}</span></div></div><div className="tracker-item-right"><div className="mini-score-pill">{currentStageData.growthScore ?? '—'}</div></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="diaper" aria-label="Cập nhật thay tã và vệ sinh" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle amber"><Flame size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Thay tã & Vệ sinh</span><span className="tracker-item-sub">{currentStageData.todayVitals.diaperCount != null ? `${currentStageData.todayVitals.diaperCount} lần trong ngày` : 'Chưa cập nhật'}</span></div></div><div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: '#E89E23' }}>{currentStageData.todayVitals.diaperCount != null ? 'Đã ghi nhận' : 'Cập nhật'}</span></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="health" aria-label="Cập nhật thân nhiệt và thể trạng" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle green"><Activity size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Thân nhiệt & Thể trạng</span><span className="tracker-item-sub">{currentStageData.todayVitals.temperature || 'Chưa cập nhật'}</span></div></div><div className="tracker-item-right"><span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}>{currentStageData.todayVitals.temperature ? 'Bình thường' : 'Cập nhật'}</span></div>
        </button>
        <button type="button" className="tracker-list-item" data-action="mood" aria-label="Cập nhật tâm trạng của bé" onClick={onOpenQuickLog}>
          <div className="tracker-item-left"><div className="tracker-icon-circle rose"><Smile size={15} /></div><div className="tracker-item-info"><span className="tracker-item-title">Tâm trạng Bé</span><span className="tracker-item-sub">{currentStageData.todayVitals.mood ? `Đang ${getMoodLabel(currentStageData.todayVitals.mood).toLowerCase()}` : 'Chưa cập nhật'}</span></div></div><div className="tracker-item-right"><span style={{ fontSize: '18px', lineHeight: 1 }}>{currentStageData.todayVitals.moodEmoji || '—'}</span></div>
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
