import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppModalController } from '@/hooks/useAppModals';
import { AppContent } from './App';

const setCurrentSubView = vi.fn();
const addToast = vi.fn();
const useAutoSyncLifecycleMock = vi.fn();

const modalController: AppModalController = {
  isAiChatOpen: false,
  aiChatInitialQuestion: undefined,
  isNotificationOpen: false,
  isQuickLogOpen: false,
  isAddGrowthOpen: false,
  isAddPumpingOpen: false,
  isAddExpenseOpen: false,
  isAddPostOpen: false,
  isEditProfileOpen: false,
  presetPostTagType: undefined,
  lightboxSrc: null,
  lightboxIsVideo: false,
  openAiChat: vi.fn(),
  closeAiChat: vi.fn(),
  openNotifications: vi.fn(),
  closeNotifications: vi.fn(),
  openQuickLog: vi.fn(),
  closeQuickLog: vi.fn(),
  openAddGrowth: vi.fn(),
  closeAddGrowth: vi.fn(),
  openAddPumping: vi.fn(),
  closeAddPumping: vi.fn(),
  openAddExpense: vi.fn(),
  closeAddExpense: vi.fn(),
  openAddPost: vi.fn(),
  closeAddPost: vi.fn(),
  openEditProfile: vi.fn(),
  closeEditProfile: vi.fn(),
  openLightbox: vi.fn(),
  closeLightbox: vi.fn(),
  handleQuickAction: vi.fn(),
};

vi.mock('@/store/useUIStore', () => ({
  useUIStore: () => ({ currentSubView: null, setCurrentSubView }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toasts: [], addToast, dismissToast: vi.fn() }),
}));

vi.mock('@/hooks/useAutoSyncLifecycle', () => ({
  useAutoSyncLifecycle: () => useAutoSyncLifecycleMock(),
}));

vi.mock('@/hooks/useAppModals', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/hooks/useAppModals')>();
  return { ...original, useAppModals: () => modalController };
});

vi.mock('@/services/googleDriveSync', () => ({ startAutoSync: vi.fn().mockResolvedValue(vi.fn()) }));

vi.mock('@/components/app/AppRoutes', () => ({
  AppRoutes: () => <div>App Routes marker</div>,
}));
vi.mock('@/components/app/AppModals', () => ({
  AppModals: () => <div>App Modals marker</div>,
}));
vi.mock('@/components/common/Header', () => ({
  Header: () => <div>Header marker</div>,
}));
vi.mock('@/components/common/BottomNav', () => ({
  BottomNav: () => <div>Bottom Nav marker</div>,
}));
vi.mock('@/components/common/Toast', () => ({
  ToastContainer: () => <div>Toast marker</div>,
}));
vi.mock('@/components/common/Lightbox', () => ({
  Lightbox: () => <div>Lightbox marker</div>,
}));
vi.mock('@/components/common/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => <div>PWA Prompt marker</div>,
}));
vi.mock('@/components/common/AppVersionBadge', () => ({
  AppVersionBadge: () => <div>Version marker</div>,
}));
vi.mock('./PWABadge', () => ({
  default: () => <div>PWA Badge marker</div>,
}));
vi.mock('@/components/home/HomeView', () => ({
  HomeView: () => <div>Legacy Home marker</div>,
}));

describe('AppContent', () => {
  it('composes the thin shell around extracted routes and modals', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>,
    );

    expect(screen.getByText('Header marker')).toBeInTheDocument();
    expect(screen.getByText('App Routes marker')).toBeInTheDocument();
    expect(screen.getByText('App Modals marker')).toBeInTheDocument();
    expect(screen.getByText('Bottom Nav marker')).toBeInTheDocument();
    expect(screen.getByText('Lightbox marker')).toBeInTheDocument();
    expect(screen.getByText('PWA Prompt marker')).toBeInTheDocument();
    expect(screen.getByText('Version marker')).toBeInTheDocument();
    expect(screen.getByText('PWA Badge marker')).toBeInTheDocument();
    expect(useAutoSyncLifecycleMock).toHaveBeenCalledTimes(1);
  });

  it('hides the main header on the profile route', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AppContent />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Header marker')).not.toBeInTheDocument();
    expect(screen.getByText('App Routes marker')).toBeInTheDocument();
  });
});
