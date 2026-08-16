import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from './store/useUIStore';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { Lightbox } from './components/common/Lightbox';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { AppVersionBadge } from './components/common/AppVersionBadge';
import { AppRoutes } from './components/app/AppRoutes';
import { AppModals } from './components/app/AppModals';
import PWABadge from './PWABadge';
import { useToast } from './hooks/useToast';
import { useAutoSyncLifecycle } from './hooks/useAutoSyncLifecycle';
import { useAppModals } from './hooks/useAppModals';
import { useReminderLifecycle } from './hooks/useReminderLifecycle';

export const AppContent: React.FC = () => {
  const { currentSubView, setCurrentSubView } = useUIStore();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useAutoSyncLifecycle();

  const { toasts, addToast } = useToast();
  const modals = useAppModals(addToast);
  useReminderLifecycle({ onQuickLog: modals.handleQuickAction });

  return (
    <div className="app-container" id="appContainer">
      <ToastContainer toasts={toasts} />

      {!isProfilePage && (
        <Header
          onOpenAiChat={() => modals.openAiChat()}
          onOpenNotifications={modals.openNotifications}
        />
      )}

      <main id="appMainContent" className="view-content-wrapper">
        <PWAInstallPrompt />

        <AppRoutes
          currentSubView={currentSubView}
          onBackFromScoreDetail={() => setCurrentSubView(null)}
          onOpenScoreDetail={() => setCurrentSubView('score-detail')}
          onOpenQuickLog={modals.openQuickLog}
          onOpenAiChat={() => modals.openAiChat()}
          onOpenPumping={modals.openAddPumping}
          onShowToast={addToast}
          onOpenLightbox={modals.openLightbox}
          onOpenAddTimelineEntry={() => modals.openAddPost(undefined)}
          onOpenAddGrowth={modals.openAddGrowth}
          onOpenAddExpense={modals.openAddExpense}
          onOpenEditProfile={modals.openEditProfile}
        />

        <div className="bottom-safe-spacer"></div>
      </main>

      <AppVersionBadge />

      <BottomNav onOpenQuickLog={modals.openQuickLog} />

      <Lightbox mediaSrc={modals.lightboxSrc} isVideo={modals.lightboxIsVideo} onClose={modals.closeLightbox} />

      <AppModals modals={modals} onSuccessToast={addToast} />

      <PWABadge />
    </div>
  );
};

export default AppContent;
