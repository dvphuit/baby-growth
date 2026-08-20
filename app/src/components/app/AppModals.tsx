import { lazy, Suspense, useEffect, useRef } from 'react';
import { ModalMotionScope } from '@/components/motion/ModalMotionScope';
import type { AddToast, AppModalController } from '@/hooks/useAppModals';
import type { ActivityLogMode } from '@/components/modals/ActivityLogModal';

const loadQuickLogModal = () => import('@/components/modals/QuickLogModal');
const loadActivityLogModal = () => import('@/components/modals/ActivityLogModal');
const loadAddGrowthModal = () => import('@/components/modals/AddGrowthModal');
const loadAddPumpingModal = () => import('@/components/modals/AddPumpingModal');
const loadAddExpenseModal = () => import('@/components/modals/AddExpenseModal');
const loadAddPostModal = () => import('@/components/modals/AddPostModal');

const QuickLogModal = lazy(async () => ({ default: (await loadQuickLogModal()).QuickLogModal }));
const ActivityLogModal = lazy(async () => ({ default: (await loadActivityLogModal()).ActivityLogModal }));
const AddGrowthModal = lazy(async () => ({ default: (await loadAddGrowthModal()).AddGrowthModal }));
const AddPumpingModal = lazy(async () => ({ default: (await loadAddPumpingModal()).AddPumpingModal }));
const AddExpenseModal = lazy(async () => ({ default: (await loadAddExpenseModal()).AddExpenseModal }));
const AddPostModal = lazy(async () => ({ default: (await loadAddPostModal()).AddPostModal }));
const EditProfileModal = lazy(async () => ({ default: (await import('@/components/modals/EditProfileModal')).EditProfileModal }));
const NotificationModal = lazy(async () => ({ default: (await import('@/components/modals/NotificationModal')).NotificationModal }));

const QUICK_LOG_SURFACE_ID = 'quick-log-surface';

const LazyModalFallback = () => (
  <div className="lazy-modal-loading" role="status" aria-live="polite">Đang mở…</div>
);

export interface AppModalsProps {
  modals: AppModalController;
  onSuccessToast: AddToast;
}

export function AppModals({ modals, onSuccessToast }: AppModalsProps) {
  const quickLogMounted = useRef(false);
  const activityMounted = useRef(false);
  const growthMounted = useRef(false);
  const pumpingMounted = useRef(false);
  const expenseMounted = useRef(false);
  const postMounted = useRef(false);
  const profileMounted = useRef(false);
  const notificationMounted = useRef(false);
  const lastActivityMode = useRef<ActivityLogMode>('feeding');

  if (modals.isQuickLogOpen) quickLogMounted.current = true;
  if (modals.activityLogMode) {
    activityMounted.current = true;
    lastActivityMode.current = modals.activityLogMode;
  }
  if (modals.isAddGrowthOpen) growthMounted.current = true;
  if (modals.isAddPumpingOpen) pumpingMounted.current = true;
  if (modals.isAddExpenseOpen) expenseMounted.current = true;
  if (modals.isAddPostOpen) postMounted.current = true;
  if (modals.isEditProfileOpen) profileMounted.current = true;
  if (modals.isNotificationOpen) notificationMounted.current = true;

  useEffect(() => {
    if (!modals.isQuickLogOpen) return;
    void Promise.all([
      loadActivityLogModal(),
      loadAddGrowthModal(),
      loadAddPumpingModal(),
      loadAddExpenseModal(),
      loadAddPostModal(),
    ]);
  }, [modals.isQuickLogOpen]);

  return (
    <Suspense fallback={<LazyModalFallback />}>
      {quickLogMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <QuickLogModal isOpen={modals.isQuickLogOpen} onClose={modals.closeQuickLog} onSelectAction={modals.handleQuickAction} />
        </ModalMotionScope>
      )}

      {activityMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <ActivityLogModal
            isOpen={Boolean(modals.activityLogMode)}
            mode={modals.activityLogMode ?? lastActivityMode.current}
            onClose={modals.closeActivityLog}
            onSaved={(message) => onSuccessToast(message, '✓')}
          />
        </ModalMotionScope>
      )}

      {growthMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddGrowthModal isOpen={modals.isAddGrowthOpen} onClose={modals.closeAddGrowth} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {pumpingMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPumpingModal isOpen={modals.isAddPumpingOpen} onClose={modals.closeAddPumping} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {expenseMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddExpenseModal isOpen={modals.isAddExpenseOpen} onClose={modals.closeAddExpense} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {postMounted.current && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPostModal isOpen={modals.isAddPostOpen} onClose={modals.closeAddPost} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {profileMounted.current && (
        <EditProfileModal isOpen={modals.isEditProfileOpen} onClose={modals.closeEditProfile} onSuccessToast={onSuccessToast} />
      )}

      {notificationMounted.current && (
        <NotificationModal isOpen={modals.isNotificationOpen} onClose={modals.closeNotifications} onQuickLog={modals.handleQuickAction} />
      )}
    </Suspense>
  );
}
