import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeView } from '@/components/home/HomeView';
import type { AddToast } from '@/hooks/useAppModals';

const ScoreDetailView = lazy(async () => ({
  default: (await import('@/components/home/ScoreDetailView')).ScoreDetailView,
}));
const TimelineView = lazy(async () => ({
  default: (await import('@/components/timeline/TimelineView')).TimelineView,
}));
const GrowthView = lazy(async () => ({
  default: (await import('@/components/growth/GrowthView')).GrowthView,
}));
const ExpensesView = lazy(async () => ({
  default: (await import('@/components/expenses/ExpensesView')).ExpensesView,
}));
const ProfileView = lazy(async () => ({
  default: (await import('@/components/profile/ProfileView')).ProfileView,
}));

const RouteLoadingFallback = () => (
  <div className="route-loading-state" role="status" aria-live="polite">
    Đang mở trang…
  </div>
);

export interface AppRoutesProps {
  currentSubView: string | null;
  onBackFromScoreDetail: () => void;
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast: AddToast;
  onOpenLightbox: (src: string, isVideo?: boolean) => void;
  onOpenAddTimelineEntry: () => void;
  onOpenAddGrowth: () => void;
  onOpenAddExpense: () => void;
  onOpenEditProfile: () => void;
}

export function AppRoutes({
  currentSubView,
  onBackFromScoreDetail,
  onOpenScoreDetail,
  onOpenQuickLog,
  onOpenAiChat,
  onOpenPumping,
  onShowToast,
  onOpenLightbox,
  onOpenAddTimelineEntry,
  onOpenAddGrowth,
  onOpenAddExpense,
  onOpenEditProfile,
}: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            currentSubView === 'score-detail' ? (
              <ScoreDetailView onBack={onBackFromScoreDetail} />
            ) : (
              <HomeView
                onOpenScoreDetail={onOpenScoreDetail}
                onOpenQuickLog={onOpenQuickLog}
                onOpenAiChat={onOpenAiChat}
                onOpenPumping={onOpenPumping}
                onShowToast={onShowToast}
              />
            )
          }
        />
        <Route
          path="/timeline"
          element={
            <TimelineView
              onOpenLightbox={onOpenLightbox}
              onOpenAddEntry={onOpenAddTimelineEntry}
            />
          }
        />
        <Route
          path="/growth"
          element={<GrowthView onOpenAddMeasurement={onOpenAddGrowth} />}
        />
        <Route
          path="/expenses"
          element={<ExpensesView onOpenAddExpense={onOpenAddExpense} />}
        />
        <Route
          path="/profile"
          element={
            <ProfileView
              onOpenEditProfile={onOpenEditProfile}
              onShowToast={onShowToast}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
