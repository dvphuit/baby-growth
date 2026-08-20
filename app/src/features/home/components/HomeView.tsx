import { useUIStore } from '@/store/useUIStore';
import { BabyHomeView } from './BabyHomeView';
import { MomHomeView } from './MomHomeView';

interface HomeViewProps {
  onOpenQuickLog: () => void;
  onOpenPumping: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenQuickLog, onOpenPumping }) => {
  const profileMode = useUIStore((state) => state.profileMode);

  if (profileMode === 'mom') {
    return <MomHomeView onOpenPumping={onOpenPumping} />;
  }

  return <BabyHomeView onOpenQuickLog={onOpenQuickLog} />;
};
