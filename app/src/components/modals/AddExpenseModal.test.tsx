import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddExpenseModal } from './AddExpenseModal';
import { useBabyStore } from '@/store/useBabyStore';

describe('AddExpenseModal Component', () => {
  beforeEach(() => {
    useBabyStore.setState({
      expenseRecords: [],
    });
  });

  it('renders multi-select category chips and unit badge', () => {
    render(
      <AddExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccessToast={vi.fn()}
      />
    );

    // Categories
    expect(screen.getByRole('button', { name: /Sữa & ăn dặm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tã bỉm & vệ sinh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Y tế & tiêm chủng/i })).toBeInTheDocument();

    // Unit badge
    expect(screen.getByText(/×1.000 đ/i)).toBeInTheDocument();
  });

  it('supports toggling categories and defaults to Khác when empty', async () => {
    const user = userEvent.setup();
    const handleSuccessToast = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        onSuccessToast={handleSuccessToast}
      />
    );

    // Initial selected is 'Sữa & ăn dặm'. Unselect it -> should become 'Khác'
    const milkBtn = screen.getByRole('button', { name: /Sữa & ăn dặm/i });
    await user.click(milkBtn);

    const khacBtn = screen.getByRole('button', { name: /^Khác/i });
    expect(khacBtn).toHaveAttribute('aria-pressed', 'true');

    // Enter amount in thousands: 150
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Lưu khoản chi/i });
    await user.click(submitBtn);

    expect(handleSuccessToast).toHaveBeenCalledWith(expect.stringContaining('150.000 đ'));
    const expenses = useBabyStore.getState().expenseRecords;
    expect(expenses.length).toBe(1);
    expect(expenses[0].category).toBe('Khác');
  });

  it('supports multi-selecting categories in a single expense', async () => {
    const user = userEvent.setup();
    const handleSuccessToast = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        onSuccessToast={handleSuccessToast}
      />
    );

    // Initial selected is 'Sữa & ăn dặm'. Also select 'Tã bỉm & vệ sinh'
    const diaperBtn = screen.getByRole('button', { name: /Tã bỉm & vệ sinh/i });
    await user.click(diaperBtn);

    // Enter amount in thousands: 500
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: '0' }));

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Lưu khoản chi/i });
    await user.click(submitBtn);

    expect(handleSuccessToast).toHaveBeenCalledWith(expect.stringContaining('500.000 đ'));
    const expenses = useBabyStore.getState().expenseRecords;
    expect(expenses.length).toBe(1);
    expect(expenses[0].category).toBe('Sữa & ăn dặm, Tã bỉm & vệ sinh');
  });

  it('allows entering amount in thousands (x1000) via keypad and displays formula', async () => {
    const user = userEvent.setup();
    const handleSuccessToast = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        onSuccessToast={handleSuccessToast}
      />
    );

    // Enter amount in thousands: 3, 5, 0 -> 350k = 350.000 đ
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));

    // Input formula should display 350
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('350.000')).toBeInTheDocument();

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Lưu khoản chi/i });
    await user.click(submitBtn);

    expect(handleSuccessToast).toHaveBeenCalledWith(expect.stringContaining('350.000 đ'));
    expect(handleClose).toHaveBeenCalled();

    const expenses = useBabyStore.getState().expenseRecords;
    expect(expenses.length).toBe(1);
    expect(expenses[0].amount).toBe(350000);
    expect(expenses[0].category).toBe('Sữa & ăn dặm');
  });

  it('supports calculator math expression like 50*2+60*3', async () => {
    const user = userEvent.setup();
    const handleSuccessToast = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        onSuccessToast={handleSuccessToast}
      />
    );

    // Enter formula: 50 * 2 + 60 * 3
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'Nhân' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Cộng' }));
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'Nhân' }));
    await user.click(screen.getByRole('button', { name: '3' }));

    // Formula displayed: 50 × 2 + 60 × 3
    expect(screen.getByText('50 × 2 + 60 × 3')).toBeInTheDocument();
    // Live calculated total: 50*2 + 60*3 = 280k = 280.000 đ
    expect(screen.getByText('280.000')).toBeInTheDocument();

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Lưu khoản chi/i });
    await user.click(submitBtn);

    expect(handleSuccessToast).toHaveBeenCalledWith(expect.stringContaining('280.000 đ'));
    const expenses = useBabyStore.getState().expenseRecords;
    expect(expenses[0].amount).toBe(280000);
  });

  it('supports editing an existing expense', async () => {
    const user = userEvent.setup();
    const handleSuccessToast = vi.fn();
    const handleClose = vi.fn();

    const existingRecord = {
      id: 'exp-123',
      amount: 180000,
      category: 'Tã bỉm & vệ sinh',
      occurredAt: new Date().toISOString(),
      note: 'Bỉm dán Moony',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useBabyStore.setState({
      expenseRecords: [existingRecord],
    });

    render(
      <AddExpenseModal
        isOpen={true}
        editingExpense={existingRecord}
        onClose={handleClose}
        onSuccessToast={handleSuccessToast}
      />
    );

    expect(screen.getByText('Sửa khoản chi')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText('180.000')).toBeInTheDocument();

    // Quick add +50k
    await user.click(screen.getByRole('button', { name: '+50k' }));

    const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    await user.click(submitBtn);

    expect(handleSuccessToast).toHaveBeenCalledWith(expect.stringContaining('230.000 đ'));
    expect(handleClose).toHaveBeenCalled();

    const updated = useBabyStore.getState().expenseRecords.find((r) => r.id === 'exp-123');
    expect(updated?.amount).toBe(230000);
  });
});
