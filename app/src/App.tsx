import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUIStore } from './store/useUIStore';
import { lazy, Suspense, useState, useEffect } from 'react';

// Common Components
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { Lightbox } from './components/common/Lightbox';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import PWABadge from './PWABadge';

// Tab Views & Pages
import { HomeView } from './components/home/HomeView';

// Modals


// Hooks
import { useToast } from './hooks/useToast';
import { startAutoSync } from './services/googleDriveSync';

// Lazy-loaded routes and modal surfaces
const ScoreDetailView = lazy(async () => ({
  default: (await import('./components/home/ScoreDetailView')).ScoreDetailView,
}));
const TimelineView = lazy(async () => ({
  default: (await import('./components/timeline/TimelineView')).TimelineView,
}));
const GrowthView = lazy(async () => ({
  default: (await import('./components/growth/GrowthView')).GrowthView,
}));
const ExpensesView = lazy(async () => ({
  default: (await import('./components/expenses/ExpensesView')).ExpensesView,
}));
const ProfileView = lazy(async () => ({
  default: (await import('./components/profile/ProfileView')).ProfileView,
}));
const QuickLogModal = lazy(async () => ({
  default: (await import('./components/modals/QuickLogModal')).QuickLogModal,
}));
const AddGrowthModal = lazy(async () => ({
  default: (await import('./components/modals/AddGrowthModal')).AddGrowthModal,
}));
const AddPumpingModal = lazy(async () => ({
  default: (await import('./components/modals/AddPumpingModal')).AddPumpingModal,
}));
const AddExpenseModal = lazy(async () => ({
  default: (await import('./components/modals/AddExpenseModal')).AddExpenseModal,
}));
const AddPostModal = lazy(async () => ({
  default: (await import('./components/modals/AddPostModal')).AddPostModal,
}));
const AIDoctorChatModal = lazy(async () => ({
  default: (await import('./components/modals/AIDoctorChatModal')).AIDoctorChatModal,
}));
const NotificationModal = lazy(async () => ({
  default: (await import('./components/modals/NotificationModal')).NotificationModal,
}));
const EditProfileModal = lazy(async () => ({
  default: (await import('./components/modals/EditProfileModal')).EditProfileModal,
}));

const RouteLoadingFallback = () => (
  <div className="route-loading-state" role="status" aria-live="polite">
    Đang mở trang…
  </div>
);

const LazyModalFallback = () => (
  <div className="lazy-modal-loading" role="status" aria-live="polite">
    Đang mở…
  </div>
);

// Local state

export const AppContent: React.FC = () => {
  const { currentSubView, setCurrentSubView } = useUIStore();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  // Automatically scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    void startAutoSync();
    const handleRemoteUpdate = () => window.location.reload();
    window.addEventListener('babygrowth:remote-updated', handleRemoteUpdate);
    return () => window.removeEventListener('babygrowth:remote-updated', handleRemoteUpdate);
  }, []);

  // Toast System
  const { toasts, addToast } = useToast();

  // Modal States
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInitialQuestion, setAiChatInitialQuestion] = useState<string | undefined>();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddPumpingOpen, setIsAddPumpingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [presetPostTagType, setPresetPostTagType] = useState<
    'milestone' | 'feeding' | 'mom' | 'health' | 'general' | undefined
  >();

  // Lightbox State
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);

  const handleSelectQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'growth':
        setIsAddGrowthOpen(true);
        break;
      case 'feeding':
        setPresetPostTagType('feeding');
        setIsAddPostOpen(true);
        break;
      case 'pumping':
        setIsAddPumpingOpen(true);
        break;
      case 'smart-expense':
      case 'expense':
        setIsAddExpenseOpen(true);
        break;
      case 'sleep':
        addToast('Đã lưu cữ ngủ 1.5 giờ của bé 😴', '🌙');
        break;
      case 'diaper':
        addToast('Đã ghi nhận 1 lần thay tã sạch sẽ 🧷', '🧷');
        break;
      case 'vaccine':
        addToast('Đã lưu lịch tiêm phòng vắc-xin 💉', '💉');
        break;
      case 'medicine':
        addToast('Đã đánh dấu uống 1 giọt Vitamin D3 K2 💊', '💊');
        break;
      case 'mood':
        addToast('Đã cập nhật tâm lý tích cực ✨', '😊');
        break;
      case 'moment':
      case 'diary':
      default:
        setPresetPostTagType('milestone');
        setIsAddPostOpen(true);
        break;
    }
  };

  return (
    <div className="app-container" id="appContainer">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />

      {/* Main Sticky Header (Hidden on dedicated full pages like /profile) */}
      {!isProfilePage && (
        <Header
          onOpenAiChat={() => {
            setAiChatInitialQuestion(undefined);
            setIsAiChatOpen(true);
          }}
          onOpenNotifications={() => setIsNotificationOpen(true)}
        />
      )}

      {/* Main Dynamic View Content */}
      <main id="appMainContent" className="view-content-wrapper">
        {/* PWA Install Banner */}
        <PWAInstallPrompt />

        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
          {/* Tab 1: Trang chủ (Home) */}
          <Route
            path="/"
            element={
              currentSubView === 'score-detail' ? (
                <ScoreDetailView onBack={() => setCurrentSubView(null)} />
              ) : (
                <HomeView
                  onOpenScoreDetail={() => setCurrentSubView('score-detail')}
                  onOpenQuickLog={() => setIsQuickLogOpen(true)}
                  onOpenAiChat={() => setIsAiChatOpen(true)}
                  onOpenPumping={() => setIsAddPumpingOpen(true)}
                  onShowToast={addToast}
                />
              )
            }
          />

          {/* Tab 2: Timeline & Nhật ký */}
          <Route
            path="/timeline"
            element={
              <TimelineView
                onOpenLightbox={(src, isVideo) => {
                  setLightboxSrc(src);
                  setLightboxIsVideo(Boolean(isVideo));
                }}
                onOpenAddEntry={() => {
                  setPresetPostTagType(undefined);
                  setIsAddPostOpen(true);
                }}
              />
            }
          />

          {/* Tab 3: Tăng trưởng (Growth & WHO Charts) */}
          <Route
            path="/growth"
            element={<GrowthView onOpenAddMeasurement={() => setIsAddGrowthOpen(true)} />}
          />

          {/* Tab 4: Chi tiêu (Expenses & Fund) */}
          <Route
            path="/expenses"
            element={<ExpensesView onOpenAddExpense={() => setIsAddExpenseOpen(true)} />}
          />

          {/* Baby Profile Page */}
          <Route
            path="/profile"
            element={
              <ProfileView
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onShowToast={addToast}
              />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Physical Spacer to prevent content overlapping with bottom dock */}
        <div className="bottom-safe-spacer"></div>
      </main>

      {/* Bottom Navigation Dock */}
      <BottomNav onOpenQuickLog={() => setIsQuickLogOpen(true)} />

      {/* Lightbox Modal */}
      <Lightbox
        mediaSrc={lightboxSrc}
        isVideo={lightboxIsVideo}
        onClose={() => setLightboxSrc(null)}
      />

      <Suspense fallback={<LazyModalFallback />}>
        {/* Quick Action FAB Bottom Sheet */}
        {isQuickLogOpen && (
          <QuickLogModal
            isOpen={isQuickLogOpen}
            onClose={() => setIsQuickLogOpen(false)}
            onSelectAction={handleSelectQuickAction}
          />
        )}

        {/* Add Growth Measurement Modal */}
        {isAddGrowthOpen && (
          <AddGrowthModal
            isOpen={isAddGrowthOpen}
            onClose={() => setIsAddGrowthOpen(false)}
            onSuccessToast={addToast}
          />
        )}

        {/* Add Pumping Session Modal */}
        {isAddPumpingOpen && (
          <AddPumpingModal
            isOpen={isAddPumpingOpen}
            onClose={() => setIsAddPumpingOpen(false)}
            onSuccessToast={addToast}
          />
        )}

        {/* Add Expense Modal */}
        {isAddExpenseOpen && (
          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            onSuccessToast={addToast}
          />
        )}

        {/* Add Post Modal */}
        {isAddPostOpen && (
          <AddPostModal
            isOpen={isAddPostOpen}
            onClose={() => setIsAddPostOpen(false)}
            onSuccessToast={addToast}
            presetTagType={presetPostTagType}
          />
        )}

        {/* Edit Baby Profile Modal */}
        {isEditProfileOpen && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            onSuccessToast={addToast}
          />
        )}

        {/* AI Doctor Chat Drawer */}
        {isAiChatOpen && (
          <AIDoctorChatModal
            isOpen={isAiChatOpen}
            onClose={() => {
              setIsAiChatOpen(false);
              setAiChatInitialQuestion(undefined);
            }}
            initialQuestion={aiChatInitialQuestion}
          />
        )}

        {/* Notifications Modal */}
        {isNotificationOpen && (
          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        )}
      </Suspense>

      {/* PWA Update / Offline Ready Badge */}
      <PWABadge />
    </div>
  );
};

export default AppContent;
