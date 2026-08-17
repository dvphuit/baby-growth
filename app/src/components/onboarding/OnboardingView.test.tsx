import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingView } from './OnboardingView';
import { useBabyStore } from '@/store/useBabyStore';

describe('OnboardingView', () => {
  beforeEach(() => {
    useBabyStore.getState().resetToDefaults();
  });

  it('renders onboarding form and requires baby name', () => {
    const onComplete = vi.fn();
    render(<OnboardingView onComplete={onComplete} />);

    expect(screen.getByText('CHÀO MỪNG ĐẾN VỚI HAVEN')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bắt đầu hành trình/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bắt đầu hành trình cùng Bé/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Tên gọi ở nhà của Bé/i);
    expect(nameInput).toBeInTheDocument();
  });

  it('submits form and initializes child profile in store', () => {
    const onComplete = vi.fn();
    render(<OnboardingView onComplete={onComplete} />);

    const nameInput = screen.getByLabelText(/Tên gọi ở nhà của Bé/i);
    fireEvent.change(nameInput, { target: { value: 'Bé Bơ' } });

    const submitBtn = screen.getByRole('button', { name: /Bắt đầu hành trình cùng Bé/i });
    fireEvent.click(submitBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);

    const state = useBabyStore.getState();
    expect(state.familyData.isInitialized).toBe(true);
    expect(state.familyData.childName).toBe('Bé Bơ');
  });
});
