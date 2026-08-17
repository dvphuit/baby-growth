import { useEffect } from 'react';
/** Haven mobile implementation keeps install guidance below the primary home story. */
import { useLocation } from 'react-router-dom';
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
import { useThemeColor } from './hooks/useThemeColor';
import { runDataMigration } from './services/dataMigration';
import { useBabyStore } from './store/useBabyStore';
import { OnboardingView } from './components/onboarding/OnboardingView';


export const AppContent: React.FC = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const familyData = useBabyStore((state) => state.familyData);
  const isInitialized = Boolean(familyData?.isInitialized && familyData?.childName);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => { void runDataMigration(); }, []);
  useAutoSyncLifecycle();

  const { toasts, addToast } = useToast();
  const modals = useAppModals(addToast);
  const isModalOpen = (
    modals.isNotificationOpen ||
    modals.isQuickLogOpen ||
    modals.isAddGrowthOpen ||
    modals.isAddPumpingOpen ||
    modals.isAddExpenseOpen ||
    modals.isEditProfileOpen ||
    modals.activityLogMode !== null ||
    modals.lightboxSrc !== null
  );

  useThemeColor({ pathname: location.pathname, isModalOpen });
  useReminderLifecycle({ onQuickLog: modals.handleQuickAction, onOpenNotifications: modals.openNotifications });

  if (!isInitialized) {
    return (
      <div className="app-container" id="appContainer">
        <ToastContainer toasts={toasts} />
        <OnboardingView onComplete={() => addToast('Chào mừng Ba Mẹ đến với Haven! Hồ sơ của Bé đã sẵn sàng.')} />
        <PWABadge />
      </div>
    );
  }

  return (
    <div className="app-container" id="appContainer">
      <ToastContainer toasts={toasts} />

      {!isProfilePage && <Header onOpenNotifications={modals.openNotifications} />}
      <main id="appMainContent" className="view-content-wrapper">
        <AppRoutes
          onOpenQuickLog={modals.openQuickLog}
          onOpenPumping={modals.openAddPumping}
          onShowToast={addToast}
          onOpenLightbox={modals.openLightbox}
          onOpenAddTimelineEntry={() => modals.handleQuickAction('diary')}
          onOpenAddGrowth={modals.openAddGrowth}
          onOpenAddExpense={modals.openAddExpense}
          onOpenEditProfile={modals.openEditProfile}
          onOpenNotifications={modals.openNotifications}
        />
        <PWAInstallPrompt />
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
