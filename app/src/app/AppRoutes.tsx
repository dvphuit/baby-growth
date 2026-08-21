import { lazy, memo, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { havenRouteTransition, havenRouteVariants } from '@/shared/motion/motionPresets';
import { HomeView } from '@/features/home';
import type { AddToast } from '@/app/hooks/useAppModals';

const loadTimelineFeature = () => import('@/features/timeline');
const loadGrowthFeature = () => import('@/features/growth');
const loadExpensesFeature = () => import('@/features/expenses');
const loadProfileFeature = () => import('@/features/profile');

const TimelineView = lazy(async () => ({ default: (await loadTimelineFeature()).TimelineView }));
const GrowthView = lazy(async () => ({ default: (await loadGrowthFeature()).GrowthView }));
const ExpensesView = lazy(async () => ({ default: (await loadExpensesFeature()).ExpensesView }));
const ProfileView = lazy(async () => ({ default: (await loadProfileFeature()).ProfileView }));
const GoogleDriveDataView = lazy(async () => ({ default: (await loadProfileFeature()).GoogleDriveDataView }));

export function preloadAppRoute(pathname: string): void {
  switch (pathname) {
    case '/timeline':
      void loadTimelineFeature();
      return;
    case '/growth':
      void loadGrowthFeature();
      return;
    case '/expenses':
      void loadExpensesFeature();
      return;
    case '/profile':
    case '/profile/google-drive':
      void loadProfileFeature();
      return;
    default:
      return;
  }
}

const RouteLoadingFallback = () => <div className="route-loading-state" role="status" aria-live="polite">Đang mở trang…</div>;

export interface AppRoutesProps {
  onOpenQuickLog: () => void;
  onOpenPumping: () => void;
  onShowToast: AddToast;
  onOpenLightbox: (src: string, isVideo?: boolean) => void;
  onOpenAddTimelineEntry: () => void;
  onOpenAddGrowth: () => void;
  onOpenAddExpense: () => void;
  onOpenEditProfile: () => void;
  onOpenNotifications: () => void;
}

export const AppRoutes = memo(function AppRoutes({
  onOpenQuickLog,
  onOpenPumping,
  onShowToast,
  onOpenLightbox,
  onOpenAddTimelineEntry,
  onOpenAddGrowth,
  onOpenAddExpense,
  onOpenEditProfile,
  onOpenNotifications,
}: AppRoutesProps) {
  const location = useLocation();
  const shouldAnimateEntrance = location.key !== 'default';

  return (
    <motion.div
      key={location.pathname}
      className="app-route-motion"
      variants={havenRouteVariants}
      initial={shouldAnimateEntrance ? 'initial' : false}
      animate="animate"
      transition={havenRouteTransition}
    >
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomeView onOpenQuickLog={onOpenQuickLog} onOpenPumping={onOpenPumping} />} />
          <Route path="/timeline" element={<TimelineView onOpenLightbox={onOpenLightbox} onOpenAddEntry={onOpenAddTimelineEntry} />} />
          <Route path="/growth" element={<GrowthView onOpenAddMeasurement={onOpenAddGrowth} />} />
          <Route path="/expenses" element={<ExpensesView onOpenAddExpense={onOpenAddExpense} onShowToast={onShowToast} />} />
          <Route path="/profile" element={<ProfileView onOpenEditProfile={onOpenEditProfile} onOpenNotifications={onOpenNotifications} onShowToast={onShowToast} />} />
          <Route path="/profile/google-drive" element={<GoogleDriveDataView onOpenLightbox={onOpenLightbox} onShowToast={onShowToast} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </motion.div>
  );
});
