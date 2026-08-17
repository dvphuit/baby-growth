import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpensesView } from './ExpensesView';
import { useBabyStore } from '@/store/useBabyStore';

describe('ExpensesView Component', () => {
  beforeEach(() => {
    useBabyStore.setState({
      monthlyExpenseBudget: 5_000_000,
      expenseRecords: [
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
      ],
    });
  });

  it('renders monthly summary hero, budget progress bar (default 5tr), and sorts newest timeline entries first', () => {
    render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    // Total: 500k + 300k + 150k = 950k
    expect(screen.getByRole('heading', { name: '950.000 đ' })).toBeInTheDocument();
    expect(screen.getByText(/3 khoản đã ghi/i)).toBeInTheDocument();

    // Budget progress bar (950k / 5tr = 19%)
    expect(screen.getByText('5.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('19%')).toBeInTheDocument();
    expect(screen.getByText(/Còn: 4.050.000 đ/i)).toBeInTheDocument();

    // Verify ordering: afternoon expense (15:45) appears before morning expense (08:30)
    const afternoonNote = screen.getByText('Bỉm Merries size M (chiều)');
    const morningNote = screen.getByText('Sữa Meiji số 0 (sáng)');
    const yesterdayNote = screen.getByText('Đồ chơi gặm nướu (hôm qua)');

    expect(afternoonNote).toBeInTheDocument();
    expect(morningNote).toBeInTheDocument();
    expect(yesterdayNote).toBeInTheDocument();

    // Check DOM order: afternoon precedes morning
    expect(afternoonNote.compareDocumentPosition(morningNote)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    // Morning precedes yesterday
    expect(morningNote.compareDocumentPosition(yesterdayNote)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('allows editing monthly budget inline', async () => {
    const user = userEvent.setup();
    const handleToast = vi.fn();
    render(<ExpensesView onOpenAddExpense={vi.fn()} onShowToast={handleToast} />);

    // Click budget button to open input
    const budgetBtn = screen.getByRole('button', { name: /5.000.000 đ/i });
    await user.click(budgetBtn);

    const input = screen.getByRole('spinbutton', { name: /Số tiền ngân sách/i });
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '10000'); // 10,000k = 10,000,000 đ

    const saveBtn = screen.getByTitle('Lưu');
    await user.click(saveBtn);

    // Should update to 10.000.000 đ and calculate new % (950k / 10tr = 10%)
    expect(screen.getByText('10.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(handleToast).toHaveBeenCalledWith(
      expect.stringContaining('10.000.000 đ'),
      '🎯'
    );
  });

  it('allows filtering timeline by category pills on click', async () => {
    const user = userEvent.setup();
    render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    // Click category pill in summary filter section
    const filterSection = screen.getByLabelText(/Bộ lọc danh mục chi tiêu/i);
    const milkFilterPill = within(filterSection).getByRole('button', { name: /Sữa & ăn dặm/i });
    await user.click(milkFilterPill);

    // Filter indicator should show
    expect(screen.getByText(/Đang lọc danh mục:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bỏ lọc/i })).toBeInTheDocument();

    // Timeline should only show milk expense
    expect(screen.getByText('Sữa Meiji số 0 (sáng)')).toBeInTheDocument();
    expect(screen.queryByText('Bỉm Merries size M (chiều)')).not.toBeInTheDocument();

    // Click "Bỏ lọc"
    await user.click(screen.getByRole('button', { name: /Bỏ lọc/i }));
    expect(screen.queryByText(/Đang lọc danh mục:/i)).not.toBeInTheDocument();
    expect(screen.getByText('Bỉm Merries size M (chiều)')).toBeInTheDocument();
  });

  it('allows navigating months', async () => {
    const user = userEvent.setup();
    render(<ExpensesView onOpenAddExpense={vi.fn()} />);

    const prevMonthBtn = screen.getByRole('button', { name: 'Tháng trước' });
    await user.click(prevMonthBtn);

    // Should show 0 đ for past month where there were no records
    expect(screen.getByRole('heading', { name: '0 đ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hiện tại/i })).toBeInTheDocument();

    // Reset back
    await user.click(screen.getByRole('button', { name: /Hiện tại/i }));
    expect(screen.getByRole('heading', { name: '950.000 đ' })).toBeInTheDocument();
  });

  it('calls onOpenAddExpense when quick add button is clicked', async () => {
    const user = userEvent.setup();
    const handleOpen = vi.fn();
    render(<ExpensesView onOpenAddExpense={handleOpen} />);

    const addBtn = screen.getByRole('button', { name: /\+ Thêm khoản chi/i });
    await user.click(addBtn);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
