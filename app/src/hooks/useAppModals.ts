import { useState } from 'react';

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
  openLightbox: (src: string, isVideo?: boolean) => void;
  closeLightbox: () => void;
  handleQuickAction: (actionType: string) => void;
}

export function useAppModals(addToast: AddToast): AppModalController {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInitialQuestion, setAiChatInitialQuestion] = useState<string>();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddPumpingOpen, setIsAddPumpingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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
    openLightbox,
    closeLightbox: () => setLightboxSrc(null),
    handleQuickAction,
  };
}
