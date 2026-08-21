import { lazy, Suspense, useEffect, useState } from 'react';
import { LayoutGroup } from 'motion/react';
import { ModalMotionScope } from '@/shared/motion/ModalMotionScope';
import type { ActivityLogMode } from '@/features/activities';
import type { AddToast, AppModalController } from '@/app/hooks/useAppModals';

const loadQuickLogModal = () => import('@/features/activities');
const loadActivityLogModal = () => import('@/features/activities');
const loadAddGrowthModal = () => import('@/features/growth');
const loadAddPumpingModal = () => import('@/features/activities');
const loadAddExpenseModal = () => import('@/features/expenses');
const loadAddPostModal = () => import('@/features/timeline');

const QuickLogModal = lazy(async () => ({ default: (await loadQuickLogModal()).QuickLogModal }));
const ActivityLogModal = lazy(async () => ({ default: (await loadActivityLogModal()).ActivityLogModal }));
const AddGrowthModal = lazy(async () => ({ default: (await loadAddGrowthModal()).AddGrowthModal }));
const AddPumpingModal = lazy(async () => ({ default: (await loadAddPumpingModal()).AddPumpingModal }));
const AddExpenseModal = lazy(async () => ({ default: (await loadAddExpenseModal()).AddExpenseModal }));
const AddPostModal = lazy(async () => ({ default: (await loadAddPostModal()).AddPostModal }));
const EditProfileModal = lazy(async () => ({ default: (await import('@/features/profile')).EditProfileModal }));
const NotificationModal = lazy(async () => ({ default: (await import('@/features/reminders')).NotificationModal }));

const QUICK_LOG_SURFACE_ID = 'quick-log-surface';
const MODAL_EXIT_RETENTION_MS = 280;
const MODAL_PREFETCH_FALLBACK_MS = 220;

const LazyModalFallback = () => (
  <div className="lazy-modal-loading" role="status" aria-live="polite">Đang mở…</div>
);

function useRetained(open: boolean, retentionMs = MODAL_EXIT_RETENTION_MS): boolean {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;

    const timeoutId = window.setTimeout(() => setMounted(false), retentionMs);
    return () => window.clearTimeout(timeoutId);
  }, [mounted, open, retentionMs]);

  return open || mounted;
}

function prefetchQuickLogDestinations(): void {
  void Promise.all([
    loadAddGrowthModal(),
    loadAddExpenseModal(),
    loadAddPostModal(),
  ]);
}

function scheduleQuickLogPrefetch(): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(prefetchQuickLogDestinations, { timeout: 800 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(prefetchQuickLogDestinations, MODAL_PREFETCH_FALLBACK_MS);
  return () => window.clearTimeout(timeoutId);
}

export interface AppModalsProps {
  modals: AppModalController;
  onSuccessToast: AddToast;
}

export function AppModals({ modals, onSuccessToast }: AppModalsProps) {
  const quickLogMounted = useRetained(modals.isQuickLogOpen);
  const activityMounted = useRetained(Boolean(modals.activityLogMode));
  const growthMounted = useRetained(modals.isAddGrowthOpen);
  const pumpingMounted = useRetained(modals.isAddPumpingOpen);
  const expenseMounted = useRetained(modals.isAddExpenseOpen);
  const postMounted = useRetained(modals.isAddPostOpen);
  const profileMounted = useRetained(modals.isEditProfileOpen);
  const notificationMounted = useRetained(modals.isNotificationOpen);
  const [lastActivityMode, setLastActivityMode] = useState<ActivityLogMode>(modals.activityLogMode ?? 'feeding');

  useEffect(() => {
    if (modals.activityLogMode) setLastActivityMode(modals.activityLogMode);
  }, [modals.activityLogMode]);

  useEffect(() => {
    if (!modals.isQuickLogOpen) return;
    return scheduleQuickLogPrefetch();
  }, [modals.isQuickLogOpen]);

  return (
    <Suspense fallback={<LazyModalFallback />}>
      <LayoutGroup id="quick-log-modals">
      {quickLogMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <QuickLogModal isOpen={modals.isQuickLogOpen} onClose={modals.closeQuickLog} onSelectAction={modals.handleQuickAction} />
        </ModalMotionScope>
      )}
      {activityMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <ActivityLogModal
            isOpen={Boolean(modals.activityLogMode)}
            mode={modals.activityLogMode ?? lastActivityMode}
            onClose={modals.closeActivityLog}
            onSaved={(message) => onSuccessToast(message, '✓')}
          />
        </ModalMotionScope>
      )}
      {growthMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddGrowthModal isOpen={modals.isAddGrowthOpen} onClose={modals.closeAddGrowth} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}
      {pumpingMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPumpingModal isOpen={modals.isAddPumpingOpen} onClose={modals.closeAddPumping} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}
      {expenseMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddExpenseModal isOpen={modals.isAddExpenseOpen} onClose={modals.closeAddExpense} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}
      {postMounted && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPostModal isOpen={modals.isAddPostOpen} onClose={modals.closeAddPost} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}
      </LayoutGroup>
      {profileMounted && (
        <EditProfileModal isOpen={modals.isEditProfileOpen} onClose={modals.closeEditProfile} onSuccessToast={onSuccessToast} />
      )}
      {notificationMounted && (
        <NotificationModal isOpen={modals.isNotificationOpen} onClose={modals.closeNotifications} onQuickLog={modals.handleQuickAction} />
      )}
    </Suspense>
  );
}
