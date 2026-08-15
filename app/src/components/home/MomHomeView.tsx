import { useMomStore } from '@/store/useMomStore';
import { HomeAIBanner } from './HomeAIBanner';
import { MomHealthMetrics } from './MomHealthMetrics';
import { MomTodayTracker } from './MomTodayTracker';

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
      <MomHealthMetrics wellnessScore={momData.wellnessScore} onOpenScoreDetail={onOpenScoreDetail} />
      <MomTodayTracker
        todayTotal={momData.pumping.todayTotal}
        sessionsToday={momData.pumping.sessionsToday}
        sleepDebt={momData.mentalHealth.sleepDebt}
        epdsScore={momData.mentalHealth.epdsScore}
        onOpenPumping={onOpenPumping}
      />
      <HomeAIBanner
        description="Về phục hồi, giấc ngủ và sức khỏe của mẹ"
        openButtonId="btnOpenAiFromHome"
        onOpenAiChat={onOpenAiChat}
        onShowToast={onShowToast}
      />
    </div>
  );
};
