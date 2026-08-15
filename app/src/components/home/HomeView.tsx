import { useUIStore } from '@/store/useUIStore';
import { BabyHomeView } from './BabyHomeView';
import { MomHomeView } from './MomHomeView';

interface HomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
  const profileMode = useUIStore((state) => state.profileMode);

  if (profileMode === 'mom') {
    return (
      <MomHomeView
        onOpenScoreDetail={props.onOpenScoreDetail}
        onOpenAiChat={props.onOpenAiChat}
        onOpenPumping={props.onOpenPumping}
        onShowToast={props.onShowToast}
      />
    );
  }

  return (
    <BabyHomeView
      onOpenScoreDetail={props.onOpenScoreDetail}
      onOpenQuickLog={props.onOpenQuickLog}
      onOpenAiChat={props.onOpenAiChat}
      onShowToast={props.onShowToast}
    />
  );
};
