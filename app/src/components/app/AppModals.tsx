import { lazy, Suspense } from 'react';
import type { AddToast, AppModalController } from '@/hooks/useAppModals';

const QuickLogModal = lazy(async () => ({ default: (await import('@/components/modals/QuickLogModal')).QuickLogModal }));
const ActivityLogModal = lazy(async () => ({ default: (await import('@/components/modals/ActivityLogModal')).ActivityLogModal }));
const AddGrowthModal = lazy(async () => ({ default: (await import('@/components/modals/AddGrowthModal')).AddGrowthModal }));
const AddPumpingModal = lazy(async () => ({ default: (await import('@/components/modals/AddPumpingModal')).AddPumpingModal }));
const AddExpenseModal = lazy(async () => ({ default: (await import('@/components/modals/AddExpenseModal')).AddExpenseModal }));
const AddPostModal = lazy(async () => ({ default: (await import('@/components/modals/AddPostModal')).AddPostModal }));
const EditProfileModal = lazy(async () => ({ default: (await import('@/components/modals/EditProfileModal')).EditProfileModal }));
const AIDoctorChatModal = lazy(async () => ({ default: (await import('@/components/modals/AIDoctorChatModal')).AIDoctorChatModal }));
const NotificationModal = lazy(async () => ({ default: (await import('@/components/modals/NotificationModal')).NotificationModal }));

const LazyModalFallback = () => (
  <div className="lazy-modal-loading" role="status" aria-live="polite">Đang mở…</div>
);

export interface AppModalsProps {
  modals: AppModalController;
  onSuccessToast: AddToast;
}

export function AppModals({ modals, onSuccessToast }: AppModalsProps) {
  return (
    <Suspense fallback={<LazyModalFallback />}>
      {modals.isQuickLogOpen && (
        <QuickLogModal isOpen={modals.isQuickLogOpen} onClose={modals.closeQuickLog} onSelectAction={modals.handleQuickAction} />
      )}

      {modals.activityLogMode && (
        <ActivityLogModal
          isOpen
          mode={modals.activityLogMode}
          onClose={modals.closeActivityLog}
          onSaved={(message) => onSuccessToast(message, '✓')}
        />
      )}

      {modals.isAddGrowthOpen && (
        <AddGrowthModal isOpen={modals.isAddGrowthOpen} onClose={modals.closeAddGrowth} onSuccessToast={onSuccessToast} />
      )}

      {modals.isAddPumpingOpen && (
        <AddPumpingModal isOpen={modals.isAddPumpingOpen} onClose={modals.closeAddPumping} onSuccessToast={onSuccessToast} />
      )}

      {modals.isAddExpenseOpen && (
        <AddExpenseModal isOpen={modals.isAddExpenseOpen} onClose={modals.closeAddExpense} onSuccessToast={onSuccessToast} />
      )}

      {modals.isAddPostOpen && (
        <AddPostModal isOpen={modals.isAddPostOpen} onClose={modals.closeAddPost} onSuccessToast={onSuccessToast} presetTagType={modals.presetPostTagType} />
      )}

      {modals.isEditProfileOpen && (
        <EditProfileModal isOpen={modals.isEditProfileOpen} onClose={modals.closeEditProfile} onSuccessToast={onSuccessToast} />
      )}

      {modals.isAiChatOpen && (
        <AIDoctorChatModal isOpen={modals.isAiChatOpen} onClose={modals.closeAiChat} initialQuestion={modals.aiChatInitialQuestion} />
      )}

      {modals.isNotificationOpen && (
        <NotificationModal isOpen={modals.isNotificationOpen} onClose={modals.closeNotifications} onQuickLog={modals.handleQuickAction} />
      )}
    </Suspense>
  );
}
