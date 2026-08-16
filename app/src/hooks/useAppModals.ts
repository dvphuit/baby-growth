import { useState } from 'react';
import type { ActivityLogMode } from '@/components/modals/ActivityLogModal';

export type AddToast = (message: string, icon?: string) => void;

export interface AppModalController {
  isNotificationOpen: boolean;
  isQuickLogOpen: boolean;
  isAddGrowthOpen: boolean;
  isAddPumpingOpen: boolean;
  isAddExpenseOpen: boolean;
  isEditProfileOpen: boolean;
  activityLogMode: ActivityLogMode | null;
  lightboxSrc: string | null;
  lightboxIsVideo: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  openQuickLog: () => void;
  closeQuickLog: () => void;
  openAddGrowth: () => void;
  closeAddGrowth: () => void;
  openAddPumping: () => void;
  closeAddPumping: () => void;
  openAddExpense: () => void;
  closeAddExpense: () => void;
  openEditProfile: () => void;
  closeEditProfile: () => void;
  closeActivityLog: () => void;
  openLightbox: (src: string, isVideo?: boolean) => void;
  closeLightbox: () => void;
  handleQuickAction: (actionType: string) => void;
}

export function useAppModals(addToast: AddToast): AppModalController {
  // Keep the dependency in the public hook signature for compatibility with the app shell.
  // Quick actions no longer emit optimistic success toasts; forms emit after persistence.
  void addToast;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddPumpingOpen, setIsAddPumpingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activityLogMode, setActivityLogMode] = useState<ActivityLogMode | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);

  const openLightbox = (src: string, isVideo?: boolean) => {
    setLightboxSrc(src);
    setLightboxIsVideo(Boolean(isVideo));
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'growth':
        setIsAddGrowthOpen(true);
        break;
      case 'feeding':
      case 'baby-sleep':
      case 'diaper':
      case 'mom-sleep':
      case 'mom-mood':
      case 'medicine':
        setActivityLogMode(actionType);
        break;
      case 'moment':
      case 'diary':
        setActivityLogMode('baby-note');
        break;
      case 'pumping':
        setIsAddPumpingOpen(true);
        break;
      case 'smart-expense':
      case 'expense':
        setIsAddExpenseOpen(true);
        break;
      case 'vaccine':
        setIsNotificationOpen(true);
        break;
      default:
        setIsQuickLogOpen(true);
        break;
    }
  };

  return {
    isNotificationOpen,
    isQuickLogOpen,
    isAddGrowthOpen,
    isAddPumpingOpen,
    isAddExpenseOpen,
    isEditProfileOpen,
    activityLogMode,
    lightboxSrc,
    lightboxIsVideo,
    openNotifications: () => setIsNotificationOpen(true),
    closeNotifications: () => setIsNotificationOpen(false),
    openQuickLog: () => setIsQuickLogOpen(true),
    closeQuickLog: () => setIsQuickLogOpen(false),
    openAddGrowth: () => setIsAddGrowthOpen(true),
    closeAddGrowth: () => setIsAddGrowthOpen(false),
    openAddPumping: () => setIsAddPumpingOpen(true),
    closeAddPumping: () => setIsAddPumpingOpen(false),
    openAddExpense: () => setIsAddExpenseOpen(true),
    closeAddExpense: () => setIsAddExpenseOpen(false),
    openEditProfile: () => setIsEditProfileOpen(true),
    closeEditProfile: () => setIsEditProfileOpen(false),
    closeActivityLog: () => setActivityLogMode(null),
    openLightbox,
    closeLightbox: () => setLightboxSrc(null),
    handleQuickAction,
  };
}
