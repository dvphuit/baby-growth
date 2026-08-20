import { lazy, Suspense, useEffect } from 'react';
import { ModalMotionScope } from '@/components/motion/ModalMotionScope';
import type { AddToast, AppModalController } from '@/hooks/useAppModals';

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
      {modals.isQuickLogOpen && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <QuickLogModal isOpen={modals.isQuickLogOpen} onClose={modals.closeQuickLog} onSelectAction={modals.handleQuickAction} />
        </ModalMotionScope>
      )}

      {modals.activityLogMode && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <ActivityLogModal
            isOpen
            mode={modals.activityLogMode}
            onClose={modals.closeActivityLog}
            onSaved={(message) => onSuccessToast(message, '✓')}
          />
        </ModalMotionScope>
      )}

      {modals.isAddGrowthOpen && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddGrowthModal isOpen={modals.isAddGrowthOpen} onClose={modals.closeAddGrowth} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {modals.isAddPumpingOpen && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPumpingModal isOpen={modals.isAddPumpingOpen} onClose={modals.closeAddPumping} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {modals.isAddExpenseOpen && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddExpenseModal isOpen={modals.isAddExpenseOpen} onClose={modals.closeAddExpense} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {modals.isAddPostOpen && (
        <ModalMotionScope layoutId={QUICK_LOG_SURFACE_ID}>
          <AddPostModal isOpen={modals.isAddPostOpen} onClose={modals.closeAddPost} onSuccessToast={onSuccessToast} />
        </ModalMotionScope>
      )}

      {modals.isEditProfileOpen && (
        <EditProfileModal isOpen={modals.isEditProfileOpen} onClose={modals.closeEditProfile} onSuccessToast={onSuccessToast} />
      )}

      {modals.isNotificationOpen && (
        <NotificationModal isOpen={modals.isNotificationOpen} onClose={modals.closeNotifications} onQuickLog={modals.handleQuickAction} />
      )}
    </Suspense>
  );
}
