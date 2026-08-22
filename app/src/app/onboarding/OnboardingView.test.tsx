import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseAppSnapshot } from '@/features/sync/appSnapshot';
import { resetChildStoresToDefaults, useProfileStore } from '@/features/profile';
import * as googleDriveSync from '@/features/sync';
import { OnboardingView } from './OnboardingView';

vi.mock('@/features/sync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/sync')>()),
  isGoogleConfigured: vi.fn(() => true),
  isGoogleConnected: vi.fn(() => false),
  requestGoogleAccessToken: vi.fn().mockResolvedValue(undefined),
  checkDriveBackup: vi.fn().mockResolvedValue({ found: false }),
  restoreDriveBackup: vi.fn().mockResolvedValue(undefined),
  setAutoSyncEnabled: vi.fn().mockResolvedValue(undefined),
  syncWithGoogleDrive: vi.fn().mockResolvedValue({ status: 'uploaded' }),
}));

describe('OnboardingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetChildStoresToDefaults();
    vi.mocked(googleDriveSync.isGoogleConfigured).mockReturnValue(true);
    vi.mocked(googleDriveSync.isGoogleConnected).mockReturnValue(false);
    vi.mocked(googleDriveSync.checkDriveBackup).mockResolvedValue({ found: false });
  });

  it('renders Kinly Google Drive sign-in step initially', () => {
    render(<OnboardingView />);

    expect(screen.getByText('THIẾT LẬP LẦN ĐẦU · KINLY')).toBeInTheDocument();
    expect(screen.queryByText(/HAVEN BABY/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Đăng nhập Google Drive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập bằng Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Riêng tư theo quyền truy cập Google Drive/i)).toBeInTheDocument();
  });

  it('authenticates with Google Drive and proceeds to profile form when no backup is found', async () => {
    render(<OnboardingView />);

    const signInBtn = screen.getByRole('button', { name: /Đăng nhập bằng Google/i });
    fireEvent.click(signInBtn);

    await waitFor(() => {
      expect(googleDriveSync.requestGoogleAccessToken).toHaveBeenCalledTimes(1);
      expect(googleDriveSync.setAutoSyncEnabled).toHaveBeenCalledWith(true);
      expect(googleDriveSync.checkDriveBackup).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Khởi tạo hồ sơ Bé/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Tên gọi ở nhà của Bé/i)).toBeInTheDocument();
    });
  });

  it('shows backup found screen and allows restoring generation-2 data', async () => {
    const onComplete = vi.fn();
    const backupDate = '2025-02-01T10:00:00Z';
    const backupData = parseAppSnapshot({
      generation: 2,
      exportedAt: backupDate,
      profile: {
        familyData: {
          isInitialized: true,
          childName: 'Bé Đậu Đậu',
          childFullName: 'Bé Đậu Đậu',
          birthDate: '2025-01-15',
          gender: 'girl',
          bloodType: 'O+',
          childAvatar: '/assets/avatars/baby_avatar.jpg',
          momName: '',
          momAvatar: '/assets/avatars/mom_avatar.jpg',
        },
        profileMode: 'baby',
      },
      activities: { baby: [], mom: [], medicationCatalog: [] },
      growth: { currentStage: 'stage_0_1', stages: {}, completedHabitIds: [] },
      timeline: { items: [] },
      expenses: { records: [], monthlyBudget: 5_000_000 },
      reminders: { items: [], occurrenceStates: {}, systemNotificationsEnabled: false },
    });
    vi.mocked(googleDriveSync.checkDriveBackup).mockResolvedValue({
      found: true,
      remoteFileId: 'file-123',
      childName: 'Bé Đậu Đậu',
      birthDate: '2025-01-15',
      updatedAt: backupDate,
      snapshot: {
        schemaVersion: 2,
        updatedAt: backupDate,
        deviceId: 'device-1',
        fingerprint: 'fp-1',
        data: backupData,
      },
    });

    render(<OnboardingView onComplete={onComplete} />);

    const signInBtn = screen.getByRole('button', { name: /Đăng nhập bằng Google/i });
    fireEvent.click(signInBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Tìm thấy bản sao lưu!/i })).toBeInTheDocument();
      expect(screen.getByText('Bé Đậu Đậu')).toBeInTheDocument();
    });

    const restoreBtn = screen.getByRole('button', { name: /Khôi phục dữ liệu ngay/i });
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(googleDriveSync.restoreDriveBackup).toHaveBeenCalledWith(
        expect.objectContaining({ schemaVersion: 2, fingerprint: 'fp-1' }),
        'file-123',
      );
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('allows dev bypass when Google Client ID is not configured', () => {
    vi.mocked(googleDriveSync.isGoogleConfigured).mockReturnValue(false);

    render(<OnboardingView />);

    expect(screen.getByText(/Google Client ID chưa cấu hình/i)).toBeInTheDocument();
    const bypassBtn = screen.getByRole('button', { name: /Bỏ qua & Thiết lập Offline/i });
    fireEvent.click(bypassBtn);

    expect(screen.getByRole('heading', { name: /Khởi tạo hồ sơ Bé/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên gọi ở nhà của Bé/i)).toBeInTheDocument();
    expect(screen.getByText(/Avatar minh họa Kinly/i)).toBeInTheDocument();
  });

  it('submits profile form, initializes child profile, and triggers cloud sync', async () => {
    const onComplete = vi.fn();
    vi.mocked(googleDriveSync.isGoogleConnected).mockReturnValue(true);

    render(<OnboardingView onComplete={onComplete} />);

    expect(screen.getByRole('heading', { name: /Khởi tạo hồ sơ Bé/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Tên gọi ở nhà của Bé/i);
    fireEvent.change(nameInput, { target: { value: 'Bé Bơ' } });

    const submitBtn = screen.getByRole('button', { name: /Bắt đầu hành trình cùng Bé/i });
    fireEvent.click(submitBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);

    const profile = useProfileStore.getState();
    expect(profile.familyData.isInitialized).toBe(true);
    expect(profile.familyData.childName).toBe('Bé Bơ');
    expect(googleDriveSync.syncWithGoogleDrive).toHaveBeenCalledWith({ interactive: false });
  });
});
