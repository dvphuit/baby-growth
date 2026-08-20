import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppModalController } from '@/app/hooks/useAppModals';
import { initializeChildProfile, resetChildStoresToDefaults } from '@/features/profile';
import { AppContent } from './App';

const addToast = vi.fn();
const useAutoSyncLifecycleMock = vi.fn();
const useReminderLifecycleMock = vi.fn();

const modalController: AppModalController = {
  isAnyModalOpen: false,
  isNotificationOpen: false,
  isQuickLogOpen: false,
  isAddGrowthOpen: false,
  isAddPumpingOpen: false,
  isAddExpenseOpen: false,
  isAddPostOpen: false,
  isEditProfileOpen: false,
  activityLogMode: null,
  lightboxSrc: null,
  lightboxIsVideo: false,
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
  closeAddPost: vi.fn(),
  openEditProfile: vi.fn(),
  closeEditProfile: vi.fn(),
  closeActivityLog: vi.fn(),
  openLightbox: vi.fn(),
  closeLightbox: vi.fn(),
  handleQuickAction: vi.fn(),
};

vi.mock('@/shared/hooks/useToast', () => ({ useToast: () => ({ toasts: [], addToast, dismissToast: vi.fn() }) }));
vi.mock('@/features/sync/hooks/useAutoSyncLifecycle', () => ({ useAutoSyncLifecycle: () => useAutoSyncLifecycleMock() }));
vi.mock('@/features/reminders/hooks/useReminderLifecycle', () => ({ useReminderLifecycle: (options: unknown) => useReminderLifecycleMock(options) }));
vi.mock('@/app/hooks/useAppModals', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/app/hooks/useAppModals')>();
  return { ...original, useAppModals: () => modalController };
});
vi.mock('./AppRoutes', () => ({ AppRoutes: () => <div>App Routes marker</div> }));
vi.mock('./AppModals', () => ({ AppModals: () => <div>App Modals marker</div> }));
vi.mock('@/shared/ui/Header', () => ({ Header: () => <div>Header marker</div> }));
vi.mock('@/shared/ui/BottomNav', () => ({ BottomNav: () => <div>Bottom Nav marker</div> }));
vi.mock('@/shared/ui/Toast', () => ({ ToastContainer: () => <div>Toast marker</div> }));
vi.mock('@/shared/ui/Lightbox', () => ({ Lightbox: () => <div>Lightbox marker</div> }));
vi.mock('@/shared/ui/PWAInstallPrompt', () => ({ PWAInstallPrompt: () => <div>PWA Prompt marker</div> }));
vi.mock('@/shared/ui/AppVersionBadge', () => ({ AppVersionBadge: () => <div>Version marker</div> }));
vi.mock('@/PWABadge', () => ({ default: () => <div>PWA Badge marker</div> }));

describe('AppContent', () => {
  it('renders onboarding view when baby profile is not initialized', () => {
    resetChildStoresToDefaults();
    render(<MemoryRouter initialEntries={['/']}><AppContent /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /Đăng nhập Google Drive/i })).toBeInTheDocument();
    expect(screen.queryByText('Header marker')).not.toBeInTheDocument();
  });

  it('composes the shell and mounts sync/reminder lifecycles when initialized', () => {
    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2025-11-20' });
    render(<MemoryRouter initialEntries={['/']}><AppContent /></MemoryRouter>);

    expect(screen.getByText('Header marker')).toBeInTheDocument();
    expect(screen.getByText('App Routes marker')).toBeInTheDocument();
    expect(screen.getByText('App Modals marker')).toBeInTheDocument();
    expect(screen.getByText('Bottom Nav marker')).toBeInTheDocument();
    expect(screen.getByText('Lightbox marker')).toBeInTheDocument();
    expect(screen.getByText('PWA Prompt marker')).toBeInTheDocument();
    expect(screen.getByText('Version marker')).toBeInTheDocument();
    expect(screen.getByText('PWA Badge marker')).toBeInTheDocument();
    expect(useAutoSyncLifecycleMock).toHaveBeenCalledTimes(1);
    expect(useReminderLifecycleMock).toHaveBeenCalledTimes(1);
  });

  it('hides the main header on profile routes when initialized', () => {
    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2025-11-20' });
    render(<MemoryRouter initialEntries={['/profile/google-drive']}><AppContent /></MemoryRouter>);

    expect(screen.queryByText('Header marker')).not.toBeInTheDocument();
    expect(screen.getByText('App Routes marker')).toBeInTheDocument();
  });
});
