import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppModalController } from '@/hooks/useAppModals';
import { AppModals } from './AppModals';

vi.mock('@/components/modals/QuickLogModal', () => ({
  QuickLogModal: ({ onClose, onSelectAction }: { onClose: () => void; onSelectAction: (action: string) => void }) => (
    <div>
      <span>Quick Log marker</span>
      <button onClick={onClose}>close quick log</button>
      <button onClick={() => onSelectAction('growth')}>select growth</button>
    </div>
  ),
}));

vi.mock('@/components/modals/AddGrowthModal', () => ({
  AddGrowthModal: ({ onClose, onSuccessToast }: { onClose: () => void; onSuccessToast: (message: string, icon?: string) => void }) => (
    <div>
      <span>Add Growth marker</span>
      <button onClick={onClose}>close growth modal</button>
      <button onClick={() => onSuccessToast('saved growth', '📏')}>success growth</button>
    </div>
  ),
}));

vi.mock('@/components/modals/AddPumpingModal', () => ({
  AddPumpingModal: () => <span>Add Pumping marker</span>,
}));

vi.mock('@/components/modals/AddExpenseModal', () => ({
  AddExpenseModal: () => <span>Add Expense marker</span>,
}));

vi.mock('@/components/modals/AddPostModal', () => ({
  AddPostModal: ({ presetTagType }: { presetTagType?: string }) => (
    <span>Add Post marker {presetTagType ?? 'none'}</span>
  ),
}));

vi.mock('@/components/modals/EditProfileModal', () => ({
  EditProfileModal: ({ onClose, onSuccessToast }: { onClose: () => void; onSuccessToast: (message: string) => void }) => (
    <div>
      <span>Edit Profile marker</span>
      <button onClick={onClose}>close edit profile</button>
      <button onClick={() => onSuccessToast('profile saved')}>success profile</button>
    </div>
  ),
}));

vi.mock('@/components/modals/AIDoctorChatModal', () => ({
  AIDoctorChatModal: ({ initialQuestion }: { initialQuestion?: string }) => (
    <span>AI Chat marker {initialQuestion ?? 'none'}</span>
  ),
}));

vi.mock('@/components/modals/NotificationModal', () => ({
  NotificationModal: ({ onClose }: { onClose: () => void }) => (
    <div>
      <span>Notification marker</span>
      <button onClick={onClose}>close notifications</button>
    </div>
  ),
}));

function createController(overrides: Partial<AppModalController> = {}): AppModalController {
  return {
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
    ...overrides,
  };
}

describe('AppModals', () => {
  it('renders no modal surface when every modal is closed', () => {
    render(<AppModals modals={createController()} onSuccessToast={vi.fn()} />);
    expect(screen.queryByText(/marker/)).not.toBeInTheDocument();
  });

  it('renders Quick Log and forwards close and action callbacks', async () => {
    const user = userEvent.setup();
    const modals = createController({ isQuickLogOpen: true });
    render(<AppModals modals={modals} onSuccessToast={vi.fn()} />);

    expect(await screen.findByText('Quick Log marker')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'close quick log' }));
    await user.click(screen.getByRole('button', { name: 'select growth' }));
    expect(modals.closeQuickLog).toHaveBeenCalledTimes(1);
    expect(modals.handleQuickAction).toHaveBeenCalledWith('growth');
  });

  it('forwards Add Growth close and success callbacks', async () => {
    const user = userEvent.setup();
    const onSuccessToast = vi.fn();
    const modals = createController({ isAddGrowthOpen: true });
    render(<AppModals modals={modals} onSuccessToast={onSuccessToast} />);

    expect(await screen.findByText('Add Growth marker')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'close growth modal' }));
    await user.click(screen.getByRole('button', { name: 'success growth' }));
    expect(modals.closeAddGrowth).toHaveBeenCalledTimes(1);
    expect(onSuccessToast).toHaveBeenCalledWith('saved growth', '📏');
  });

  it('forwards the post preset and AI initial question', async () => {
    const modals = createController({
      isAddPostOpen: true,
      presetPostTagType: 'feeding',
      isAiChatOpen: true,
      aiChatInitialQuestion: 'Bé bú đủ chưa?',
    });
    render(<AppModals modals={modals} onSuccessToast={vi.fn()} />);

    expect(await screen.findByText('Add Post marker feeding')).toBeInTheDocument();
    expect(await screen.findByText('AI Chat marker Bé bú đủ chưa?')).toBeInTheDocument();
  });

  it('forwards notification close and edit-profile close/success callbacks', async () => {
    const user = userEvent.setup();
    const onSuccessToast = vi.fn();
    const modals = createController({ isNotificationOpen: true, isEditProfileOpen: true });
    render(<AppModals modals={modals} onSuccessToast={onSuccessToast} />);

    expect(await screen.findByText('Notification marker')).toBeInTheDocument();
    expect(await screen.findByText('Edit Profile marker')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'close notifications' }));
    await user.click(screen.getByRole('button', { name: 'close edit profile' }));
    await user.click(screen.getByRole('button', { name: 'success profile' }));
    expect(modals.closeNotifications).toHaveBeenCalledTimes(1);
    expect(modals.closeEditProfile).toHaveBeenCalledTimes(1);
    expect(onSuccessToast).toHaveBeenCalledWith('profile saved');
  });
});
