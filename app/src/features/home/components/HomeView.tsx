import { lazy, Suspense } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { BabyHomeView } from './BabyHomeView';

const MomHomeView = lazy(async () => ({
  default: (await import('./MomHomeView')).MomHomeView,
}));

interface HomeViewProps {
  onOpenQuickLog: () => void;
  onOpenPumping: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenQuickLog, onOpenPumping }) => {
  const profileMode = useUIStore((state) => state.profileMode);

  if (profileMode === 'mom') {
    return (
      <Suspense fallback={<div className="route-loading-state" role="status">Đang mở trang của Mẹ…</div>}>
        <MomHomeView onOpenPumping={onOpenPumping} />
      </Suspense>
    );
  }

  return <BabyHomeView onOpenQuickLog={onOpenQuickLog} />;
};
