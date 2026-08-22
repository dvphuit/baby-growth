import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExpenseStore } from '@/features/expenses/store/useExpenseStore';
import { ExpensesView } from './ExpensesView';

const records = [
  {
    id: 'exp-1',
    amount: 500000,
    category: 'Sữa & ăn dặm',
    occurredAt: '2026-08-17T08:30:00.000Z',
    note: 'Sữa Meiji số 0 (sáng)',
    createdAt: '2026-08-17T08:30:00.000Z',
    updatedAt: '2026-08-17T08:30:00.000Z',
  },
  {
    id: 'exp-2',
    amount: 300000,
    category: 'Tã bỉm & vệ sinh',
    occurredAt: '2026-08-17T15:45:00.000Z',
    note: 'Bỉm Merries size M (chiều)',
    createdAt: '2026-08-17T15:45:00.000Z',
    updatedAt: '2026-08-17T15:45:00.000Z',
  },
  {
    id: 'exp-3',
    amount: 150000,
    category: 'Khác',
    occurredAt: '2026-08-16T10:00:00.000Z',
    note: 'Đồ chơi gặm nướu (hôm qua)',
    createdAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T10:00:00.000Z',
  },
];

describe('ExpensesView Component', () => {
  beforeEach(() => {
    useExpenseStore.setState({ expenses: records, monthlyBudget: 5_000_000 });
  });

  it('renders monthly summary hero, budget progress bar, and newest entries first', () => {
    const { container } = render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '950.000 đ' })).toBeInTheDocument();
    expect(screen.getByText(/3 khoản đã ghi/i)).toBeInTheDocument();
    expect(screen.getByText('5.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('19%')).toBeInTheDocument();
    expect(screen.getByText(/Còn: 4.050.000 đ/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dòng tiền tháng này' })).toBeInTheDocument();
    expect(container.querySelector('.haven-expense-card-decor')).toHaveAttribute('src', '/assets/decor/expense-wallet.png');

    const afternoonNote = screen.getByText('Bỉm Merries size M (chiều)');
    const morningNote = screen.getByText('Sữa Meiji số 0 (sáng)');
    const yesterdayNote = screen.getByText('Đồ chơi gặm nướu (hôm qua)');
    expect(afternoonNote.compareDocumentPosition(morningNote)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(morningNote.compareDocumentPosition(yesterdayNote)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('allows editing monthly budget inline', async () => {
    const user = userEvent.setup();
    const handleToast = vi.fn();
    render(<ExpensesView onOpenAddExpense={vi.fn()} onShowToast={handleToast} />);

    await user.click(screen.getByRole('button', { name: /5.000.000 đ/i }));
    const input = screen.getByRole('spinbutton', { name: /Số tiền ngân sách/i });
    await user.clear(input);
    await user.type(input, '10000');
    await user.click(screen.getByTitle('Lưu'));

    expect(screen.getByText('10.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(handleToast).toHaveBeenCalledWith(expect.stringContaining('10.000.000 đ'), '🎯');
    expect(useExpenseStore.getState().monthlyBudget).toBe(10_000_000);
  });

  it('allows filtering timeline by category', async () => {
    const user = userEvent.setup();
    render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    const filterSection = screen.getByLabelText(/Bộ lọc danh mục chi tiêu/i);
    await user.click(within(filterSection).getByRole('button', { name: /Sữa & ăn dặm/i }));

    expect(screen.getByText(/Đang lọc danh mục:/i)).toBeInTheDocument();
    expect(screen.getByText('Sữa Meiji số 0 (sáng)')).toBeInTheDocument();
    expect(screen.queryByText('Bỉm Merries size M (chiều)')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Bỏ lọc/i }));
    expect(screen.getByText('Bỉm Merries size M (chiều)')).toBeInTheDocument();
  });

  it('allows navigating months', async () => {
    const user = userEvent.setup();
    render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Tháng trước' }));
    expect(screen.getByRole('heading', { name: '0 đ' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hiện tại/i }));
    expect(screen.getByRole('heading', { name: '950.000 đ' })).toBeInTheDocument();
  });

  it('calls onOpenAddExpense from quick add', async () => {
    const user = userEvent.setup();
    const handleOpen = vi.fn();
    render(<ExpensesView onOpenAddExpense={handleOpen} />);

    await user.click(screen.getByRole('button', { name: /\+ Thêm khoản chi/i }));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
