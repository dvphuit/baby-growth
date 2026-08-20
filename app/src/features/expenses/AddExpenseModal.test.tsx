import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExpenseStore } from '@/store/useExpenseStore';
import { AddExpenseModal } from './AddExpenseModal';

function renderModal(overrides: Partial<React.ComponentProps<typeof AddExpenseModal>> = {}) {
  const props: React.ComponentProps<typeof AddExpenseModal> = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccessToast: vi.fn(),
    ...overrides,
  };
  render(<AddExpenseModal {...props} />);
  return props;
}

async function enterAmount(value: string): Promise<void> {
  const user = userEvent.setup();
  for (const digit of value) await user.click(screen.getByRole('button', { name: digit }));
}

describe('AddExpenseModal Component', () => {
  beforeEach(() => {
    useExpenseStore.setState({ expenses: [], monthlyBudget: 5_000_000 });
  });

  it('renders multi-select category chips and unit badge', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Sữa & ăn dặm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tã bỉm & vệ sinh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Y tế & tiêm chủng/i })).toBeInTheDocument();
    expect(screen.getByText(/×1.000 đ/i)).toBeInTheDocument();
  });

  it('defaults to Khác when the selected category is removed', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /Sữa & ăn dặm/i }));
    expect(screen.getByRole('button', { name: /^Khác/i })).toHaveAttribute('aria-pressed', 'true');
    await enterAmount('150');
    await user.click(screen.getByRole('button', { name: /Lưu khoản chi/i }));

    expect(props.onSuccessToast).toHaveBeenCalledWith(expect.stringContaining('150.000 đ'));
    expect(useExpenseStore.getState().expenses).toHaveLength(1);
    expect(useExpenseStore.getState().expenses[0]?.category).toBe('Khác');
  });

  it('stores multiple selected categories in one expense', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /Tã bỉm & vệ sinh/i }));
    await enterAmount('500');
    await user.click(screen.getByRole('button', { name: /Lưu khoản chi/i }));

    expect(useExpenseStore.getState().expenses[0]?.category).toBe('Sữa & ăn dặm, Tã bỉm & vệ sinh');
  });

  it('converts keypad thousands into VND', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await enterAmount('350');
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('350.000')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Lưu khoản chi/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useExpenseStore.getState().expenses[0]).toMatchObject({
      amount: 350000,
      category: 'Sữa & ăn dặm',
    });
  });

  it('supports calculator expressions', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'Nhân' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Cộng' }));
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'Nhân' }));
    await user.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByText('50 × 2 + 60 × 3')).toBeInTheDocument();
    expect(screen.getByText('280.000')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Lưu khoản chi/i }));
    expect(useExpenseStore.getState().expenses[0]?.amount).toBe(280000);
  });

  it('updates an existing expense', async () => {
    const user = userEvent.setup();
    const now = new Date().toISOString();
    const existingRecord = {
      id: 'exp-123',
      amount: 180000,
      category: 'Tã bỉm & vệ sinh',
      occurredAt: now,
      note: 'Bỉm dán Moony',
      createdAt: now,
      updatedAt: now,
    };
    useExpenseStore.setState({ expenses: [existingRecord] });
    renderModal({ editingExpense: existingRecord });

    expect(screen.getByText('Sửa khoản chi')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '+50k' }));
    await user.click(screen.getByRole('button', { name: /Lưu thay đổi/i }));

    expect(useExpenseStore.getState().expenses.find((record) => record.id === existingRecord.id)?.amount).toBe(230000);
  });
});
