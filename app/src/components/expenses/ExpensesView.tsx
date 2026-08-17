/**
 * Haven expenses direction: one calm monthly focus, a readable category rhythm,
 * and lightweight transaction rows that retain BabyGrowth's real CRUD behavior.
 */
import { useMemo } from 'react';
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useExpenseStore } from '@/store/useExpenseStore';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
}

function isSameMonth(iso: string, now: Date): boolean {
  const date = new Date(iso);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString('vi-VN')} đ`;
}

function categorySymbol(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('sữa') || normalized.includes('ăn')) return '◌';
  if (normalized.includes('y tế') || normalized.includes('thuốc')) return '✦';
  if (normalized.includes('học') || normalized.includes('đồ chơi')) return '◒';
  if (normalized.includes('tã')) return '◔';
  return '◈';
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddExpense }) => {
  const expenses = useExpenseStore((state) => state.expenses);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const now = new Date();
  const monthExpenses = expenses.filter((record) => isSameMonth(record.occurredAt, now));
  const totalMonth = monthExpenses.reduce((sum, record) => sum + record.amount, 0);
  const categoryTotals = (() => {
    const totals = new Map<string, number>();
    monthExpenses.forEach((record) => totals.set(record.category, (totals.get(record.category) ?? 0) + record.amount));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  })();
  const recent = useMemo(() => [...expenses].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 20), [expenses]);
  const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(now);
  const topCategory = categoryTotals[0];

  const handleEdit = (id: string, currentAmount: number, currentNote?: string) => {
    const amountInput = window.prompt('Số tiền mới (đ)', String(currentAmount));
    if (amountInput === null) return;
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const note = window.prompt('Ghi chú', currentNote ?? '');
    if (note === null) return;
    updateExpense(id, { amount: Math.round(amount), note: note.trim() || undefined });
  };

  return (
    <div className="haven-expenses">
      <section className="haven-expense-hero" aria-labelledby="expense-title">
        <div className="haven-expense-hero-copy"><span className="haven-eyebrow">NHỊP CHI TIÊU</span><h2 id="expense-title">Tháng này<br />mình đã chi</h2><strong>{formatCurrency(totalMonth)}</strong><p>{monthLabel} · {monthExpenses.length ? `${monthExpenses.length} khoản đã ghi` : 'Chưa có khoản nào'}</p></div>
        <div className="haven-expense-orbit"><Wallet size={22} strokeWidth={2.1} /><span>{topCategory ? topCategory[0] : 'Bình tĩnh theo dõi'}</span></div>
        <button type="button" id="btnQuickAddExpenseFromTab" className="haven-expense-add" aria-label="+ Thêm khoản chi" onClick={onOpenAddExpense}><Plus size={15} /> Thêm khoản chi</button>
      </section>

      <section className="haven-expense-breakdown" aria-labelledby="expense-category-title">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">PHÂN BỔ THÁNG NÀY</span><h3 id="expense-category-title">Theo danh mục</h3></div><span className="haven-sheet-date">{categoryTotals.length} nhóm</span></div>
        {categoryTotals.length === 0 ? (
          <div className="haven-empty-state haven-expense-empty"><span>◈</span><strong>Chưa có chi tiêu trong tháng này</strong><p>Ghi lại một khoản nhỏ để nhìn rõ hơn nhịp chi tiêu của gia đình.</p><button type="button" className="haven-empty-action" onClick={onOpenAddExpense}>Thêm khoản chi đầu tiên</button></div>
        ) : (
          <div className="haven-expense-category-list">
            {categoryTotals.map(([category, amount], index) => {
              const percent = totalMonth ? Math.round((amount / totalMonth) * 100) : 0;
              return <article key={category} className={`haven-expense-category haven-expense-tone-${index % 4}`}><span className="haven-expense-symbol">{categorySymbol(category)}</span><div className="haven-expense-category-copy"><div><strong>{category}</strong><span>{percent}% tổng chi</span></div><div className="haven-expense-track"><i style={{ width: `${percent}%` }}></i></div></div><b>{formatCurrency(amount)}</b></article>;
            })}
          </div>
        )}
      </section>

      <section className="haven-expense-recent" aria-labelledby="expense-recent-title">
        <div className="haven-sheet-heading"><div><span className="haven-eyebrow">NHẬT KÝ GIA ĐÌNH</span><h3 id="expense-recent-title">Khoản chi gần đây</h3></div><button type="button" className="haven-text-action" onClick={onOpenAddExpense}>Thêm mục</button></div>
        {recent.length === 0 ? (
          <div className="haven-empty-state haven-expense-empty"><span>✦</span><strong>Chưa có khoản chi nào được ghi nhận</strong><p>Mỗi khoản nhỏ giúp bức tranh chi tiêu rõ ràng hơn.</p><button type="button" className="haven-empty-action" onClick={onOpenAddExpense}>Thêm khoản chi đầu tiên</button></div>
        ) : (
          <div className="haven-expense-recent-list">
            {recent.map((record) => (<article key={record.id} className="haven-expense-row"><span className="haven-expense-symbol">{categorySymbol(record.category)}</span><div className="haven-expense-row-copy"><strong>{record.category}</strong><p>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(record.occurredAt))}{record.note ? ` · ${record.note}` : ''}</p></div><div className="haven-expense-row-actions"><b>{formatCurrency(record.amount)}</b><span><button type="button" aria-label={`Sửa ${record.category}`} onClick={() => handleEdit(record.id, record.amount, record.note)}><Pencil size={12} /></button><button type="button" aria-label={`Xóa ${record.category}`} onClick={() => deleteExpense(record.id)}><Trash2 size={12} /></button></span></div></article>))}
          </div>
        )}
      </section>
    </div>
  );
};
