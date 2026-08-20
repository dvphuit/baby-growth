import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppVersionBadge } from '@/shared/ui/AppVersionBadge';
import { BottomNav } from '@/shared/ui/BottomNav';
import { Header } from '@/shared/ui/Header';
import { Lightbox } from '@/shared/ui/Lightbox';
import { PullToRefresh } from '@/shared/ui/PullToRefresh';
import { PWAInstallPrompt } from '@/shared/ui/PWAInstallPrompt';
import { ToastContainer } from '@/shared/ui/Toast';
import { OnboardingView } from '@/app/onboarding/OnboardingView';
import { useAppModals } from '@/app/hooks/useAppModals';
import { useAutoSyncLifecycle } from '@/features/sync/hooks/useAutoSyncLifecycle';
import { useReminderLifecycle } from '@/features/reminders/hooks/useReminderLifecycle';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useToast } from '@/shared/hooks/useToast';
import PWABadge from '@/PWABadge';
import { installGlobalDiagnosticLogging, logDiagnostic } from '@/app/diagnostics/diagnosticLog';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { AppModals } from './AppModals';
import { AppRoutes } from './AppRoutes';

export const AppContent: React.FC = () => {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  const familyData = useProfileStore((state) => state.familyData);
  const isInitialized = Boolean(familyData?.isInitialized && familyData?.childName);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    logDiagnostic('app', 'info', 'App started', {
      version: import.meta.env.VITE_APP_VERSION,
      build: import.meta.env.VITE_BUILD_SHA,
      online: navigator.onLine,
    });
    return installGlobalDiagnosticLogging();
  }, []);
  useEffect(() => {
    logDiagnostic('navigation', 'info', 'Route changed', { path: location.pathname });
  }, [location.pathname]);
  useAutoSyncLifecycle();

  const { toasts, addToast } = useToast();
  const modals = useAppModals();

  useThemeColor({ pathname: location.pathname, isModalOpen: modals.isAnyModalOpen });
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
        <PullToRefresh onRefresh={() => window.location.reload()}>
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
          <div className="bottom-safe-spacer" />
        </PullToRefresh>
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
