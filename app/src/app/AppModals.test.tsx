import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppModalController } from '@/hooks/useAppModals';
import { AppModals } from './AppModals';

vi.mock('@/components/modals/QuickLogModal', () => ({
  QuickLogModal: ({ onClose, onSelectAction }: { onClose: () => void; onSelectAction: (action: string) => void }) => (
    <div><span>Quick Log marker</span><button onClick={onClose}>close quick log</button><button onClick={() => onSelectAction('growth')}>select growth</button></div>
  ),
}));
vi.mock('@/components/modals/ActivityLogModal', () => ({
  ActivityLogModal: ({ mode, onClose, onSaved }: { mode: string; onClose: () => void; onSaved: (message: string) => void }) => (
    <div><span>Activity marker {mode}</span><button onClick={onClose}>close activity</button><button onClick={() => onSaved('saved activity')}>save activity</button></div>
  ),
}));
vi.mock('@/components/modals/AddGrowthModal', () => ({
  AddGrowthModal: ({ onClose, onSuccessToast }: { onClose: () => void; onSuccessToast: (message: string, icon?: string) => void }) => (
    <div><span>Add Growth marker</span><button onClick={onClose}>close growth modal</button><button onClick={() => onSuccessToast('saved growth', '📏')}>success growth</button></div>
  ),
}));
vi.mock('@/components/modals/AddPumpingModal', () => ({ AddPumpingModal: () => <span>Add Pumping marker</span> }));
vi.mock('@/features/expenses', () => ({ AddExpenseModal: () => <span>Add Expense marker</span> }));
vi.mock('@/components/modals/AddPostModal', () => ({ AddPostModal: () => <span>Add Post marker</span> }));
vi.mock('@/components/modals/EditProfileModal', () => ({ EditProfileModal: () => <span>Edit Profile marker</span> }));
vi.mock('@/components/modals/NotificationModal', () => ({
  NotificationModal: ({ onClose, onQuickLog }: { onClose: () => void; onQuickLog?: (action: string) => void }) => (
    <div><span>Notification marker</span><button onClick={onClose}>close notifications</button><button onClick={() => onQuickLog?.('feeding')}>notification quick log</button></div>
  ),
}));

function createController(overrides: Partial<AppModalController> = {}): AppModalController {
  return {
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
    ...overrides,
  };
}

describe('AppModals', () => {
  it('renders no modal surface when every modal is closed', () => {
    render(<AppModals modals={createController()} onSuccessToast={vi.fn()} />);
    expect(screen.queryByText(/marker/)).not.toBeInTheDocument();
  });

  it('renders Quick Log and forwards callbacks', async () => {
    const user = userEvent.setup();
    const modals = createController({ isQuickLogOpen: true, isAnyModalOpen: true });
    render(<AppModals modals={modals} onSuccessToast={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'close quick log' }));
    await user.click(screen.getByRole('button', { name: 'select growth' }));
    expect(modals.closeQuickLog).toHaveBeenCalledTimes(1);
    expect(modals.handleQuickAction).toHaveBeenCalledWith('growth');
  });

  it('renders a real activity modal and forwards success', async () => {
    const user = userEvent.setup();
    const onSuccessToast = vi.fn();
    const modals = createController({ activityLogMode: 'feeding', isAnyModalOpen: true });
    render(<AppModals modals={modals} onSuccessToast={onSuccessToast} />);

    expect(await screen.findByText('Activity marker feeding')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'save activity' }));
    expect(onSuccessToast).toHaveBeenCalledWith('saved activity', '✓');
  });

  it('renders the moment composer when opened from Home', async () => {
    render(<AppModals modals={createController({ isAddPostOpen: true, isAnyModalOpen: true })} onSuccessToast={vi.fn()} />);
    expect(await screen.findByText('Add Post marker')).toBeInTheDocument();
  });

  it('routes reminder quick log actions back through the controller', async () => {
    const user = userEvent.setup();
    const modals = createController({ isNotificationOpen: true, isAnyModalOpen: true });
    render(<AppModals modals={modals} onSuccessToast={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'notification quick log' }));
    expect(modals.handleQuickAction).toHaveBeenCalledWith('feeding');
  });
});
