import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { havenRouteTransition, havenRouteVariants } from '@/shared/motion/motionPresets';
import { HomeView } from '@/features/home';
import type { AddToast } from '@/app/hooks/useAppModals';

const TimelineView = lazy(async () => ({ default: (await import('@/features/timeline')).TimelineView }));
const GrowthView = lazy(async () => ({ default: (await import('@/features/growth')).GrowthView }));
const ExpensesView = lazy(async () => ({ default: (await import('@/features/expenses')).ExpensesView }));
const ProfileView = lazy(async () => ({ default: (await import('@/features/profile')).ProfileView }));
const GoogleDriveDataView = lazy(async () => ({ default: (await import('@/features/profile')).GoogleDriveDataView }));

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

export function AppRoutes({
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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="app-route-motion"
        variants={havenRouteVariants}
        initial="initial"
        animate="animate"
        exit="exit"
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
    </AnimatePresence>
  );
}
