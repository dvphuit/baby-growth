import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppModalController } from '@/hooks/useAppModals';
import { AppContent } from './App';

const addToast = vi.fn();
const useAutoSyncLifecycleMock = vi.fn();
const useReminderLifecycleMock = vi.fn();
const runDataMigrationMock = vi.fn().mockResolvedValue({ migrated: false, version: 1 });

const modalController: AppModalController = {
  isNotificationOpen: false,
  isQuickLogOpen: false,
  isAddGrowthOpen: false,
  isAddPumpingOpen: false,
  isAddExpenseOpen: false,
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
  openEditProfile: vi.fn(),
  closeEditProfile: vi.fn(),
  closeActivityLog: vi.fn(),
  openLightbox: vi.fn(),
  closeLightbox: vi.fn(),
  handleQuickAction: vi.fn(),
};

vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ toasts: [], addToast, dismissToast: vi.fn() }) }));
vi.mock('@/hooks/useAutoSyncLifecycle', () => ({ useAutoSyncLifecycle: () => useAutoSyncLifecycleMock() }));
vi.mock('@/hooks/useReminderLifecycle', () => ({ useReminderLifecycle: (options: unknown) => useReminderLifecycleMock(options) }));
vi.mock('@/services/dataMigration', () => ({ runDataMigration: () => runDataMigrationMock() }));
vi.mock('@/hooks/useAppModals', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/hooks/useAppModals')>();
  return { ...original, useAppModals: () => modalController };
});

vi.mock('@/components/app/AppRoutes', () => ({ AppRoutes: () => <div>App Routes marker</div> }));
vi.mock('@/components/app/AppModals', () => ({ AppModals: () => <div>App Modals marker</div> }));
vi.mock('@/components/common/Header', () => ({ Header: () => <div>Header marker</div> }));
vi.mock('@/components/common/BottomNav', () => ({ BottomNav: () => <div>Bottom Nav marker</div> }));
vi.mock('@/components/common/Toast', () => ({ ToastContainer: () => <div>Toast marker</div> }));
vi.mock('@/components/common/Lightbox', () => ({ Lightbox: () => <div>Lightbox marker</div> }));
vi.mock('@/components/common/PWAInstallPrompt', () => ({ PWAInstallPrompt: () => <div>PWA Prompt marker</div> }));
vi.mock('@/components/common/AppVersionBadge', () => ({ AppVersionBadge: () => <div>Version marker</div> }));
vi.mock('./PWABadge', () => ({ default: () => <div>PWA Badge marker</div> }));

describe('AppContent', () => {
  it('composes the shell and mounts sync/reminder lifecycles', () => {
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

  it('hides the main header on the profile route', () => {
    render(<MemoryRouter initialEntries={['/profile']}><AppContent /></MemoryRouter>);
    expect(screen.queryByText('Header marker')).not.toBeInTheDocument();
    expect(screen.getByText('App Routes marker')).toBeInTheDocument();
  });
});
