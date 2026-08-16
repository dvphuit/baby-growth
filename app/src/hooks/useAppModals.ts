import { useState } from 'react';
import type { ActivityLogMode } from '@/components/modals/ActivityLogModal';

export type AddToast = (message: string, icon?: string) => void;
export type PostTagType = 'milestone' | 'feeding' | 'mom' | 'health' | 'general';

export interface AppModalController {
  isAiChatOpen: boolean;
  aiChatInitialQuestion: string | undefined;
  isNotificationOpen: boolean;
  isQuickLogOpen: boolean;
  isAddGrowthOpen: boolean;
  isAddPumpingOpen: boolean;
  isAddExpenseOpen: boolean;
  isAddPostOpen: boolean;
  isEditProfileOpen: boolean;
  activityLogMode: ActivityLogMode | null;
  presetPostTagType: PostTagType | undefined;
  lightboxSrc: string | null;
  lightboxIsVideo: boolean;
  openAiChat: (question?: string) => void;
  closeAiChat: () => void;
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
  openAddPost: (preset?: PostTagType) => void;
  closeAddPost: () => void;
  openEditProfile: () => void;
  closeEditProfile: () => void;
  closeActivityLog: () => void;
  openLightbox: (src: string, isVideo?: boolean) => void;
  closeLightbox: () => void;
  handleQuickAction: (actionType: string) => void;
}

export function useAppModals(_addToast: AddToast): AppModalController {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInitialQuestion, setAiChatInitialQuestion] = useState<string>();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddPumpingOpen, setIsAddPumpingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activityLogMode, setActivityLogMode] = useState<ActivityLogMode | null>(null);
  const [presetPostTagType, setPresetPostTagType] = useState<PostTagType>();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);

  const openAiChat = (question?: string) => {
    setAiChatInitialQuestion(question);
    setIsAiChatOpen(true);
  };

  const closeAiChat = () => {
    setIsAiChatOpen(false);
    setAiChatInitialQuestion(undefined);
  };

  const openAddPost = (preset?: PostTagType) => {
    setPresetPostTagType(preset);
    setIsAddPostOpen(true);
  };

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
      case 'moment':
      case 'diary':
      default:
        setPresetPostTagType('milestone');
        setIsAddPostOpen(true);
        break;
    }
  };

  return {
    isAiChatOpen,
    aiChatInitialQuestion,
    isNotificationOpen,
    isQuickLogOpen,
    isAddGrowthOpen,
    isAddPumpingOpen,
    isAddExpenseOpen,
    isAddPostOpen,
    isEditProfileOpen,
    activityLogMode,
    presetPostTagType,
    lightboxSrc,
    lightboxIsVideo,
    openAiChat,
    closeAiChat,
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
    openAddPost,
    closeAddPost: () => setIsAddPostOpen(false),
    openEditProfile: () => setIsEditProfileOpen(true),
    closeEditProfile: () => setIsEditProfileOpen(false),
    closeActivityLog: () => setActivityLogMode(null),
    openLightbox,
    closeLightbox: () => setLightboxSrc(null),
    handleQuickAction,
  };
}
