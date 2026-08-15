import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '@/store/useBabyStore';
import { DailyHabits } from './DailyHabits';
import { HomeAIBanner } from './HomeAIBanner';
import { BabyTodaySummary } from './BabyTodaySummary';
import { BabyHealthMetrics } from './BabyHealthMetrics';
import { BabyTodayTracker } from './BabyTodayTracker';
import { BabyCareResources } from './BabyCareResources';

export interface BabyHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

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
      <BabyTodaySummary
        currentAgeText={currentStageData.currentAgeText}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={totalHabitsCount}
        todayInsight={todayInsight}
        growthScore={currentStageData.growthScore}
        onOpenQuickLog={onOpenQuickLog}
      />
      <DailyHabits />
      <BabyHealthMetrics
        growthScore={currentStageData.growthScore}
        growthScoreLabel={currentStageData.growthScoreLabel}
        mood={currentStageData.todayVitals.mood}
        onOpenScoreDetail={onOpenScoreDetail}
        onOpenQuickLog={onOpenQuickLog}
        onOpenProfile={() => navigate('/profile')}
      />
      <BabyTodayTracker
        milkTotal={currentStageData.todayVitals.milkTotal}
        sleepTotal={currentStageData.todayVitals.sleepTotal}
        diaperCount={currentStageData.todayVitals.diaperCount}
        temperature={currentStageData.todayVitals.temperature}
        mood={currentStageData.todayVitals.mood}
        moodEmoji={currentStageData.todayVitals.moodEmoji}
        growthScore={currentStageData.growthScore}
        onOpenQuickLog={onOpenQuickLog}
      />
      <HomeAIBanner
        description="Về giấc ngủ, bú và phát triển của bé"
        openButtonId="btnOpenAiBanner"
        onOpenAiChat={onOpenAiChat}
        onShowToast={onShowToast}
      />
      <BabyCareResources onShowToast={onShowToast} />
    </div>
  );
};
