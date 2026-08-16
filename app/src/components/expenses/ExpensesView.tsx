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
    <div className="expenses-view-container">
      <section className="expense-summary-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="expense-hero-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wallet size={12} /> TỔNG CHI THÁNG NÀY</div>
            <div className="expense-hero-amount">{formatCurrency(totalMonth)}</div>
          </div>
          <button type="button" id="btnQuickAddExpenseFromTab" className="btn-primary-small" onClick={onOpenAddExpense}><Plus size={13} /> Thêm chi</button>
        </div>
      </section>

      <section className="app-card" style={{ marginTop: 12 }}>
        <div className="section-header-row"><h3 className="section-title">Theo danh mục</h3></div>
        {categoryTotals.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 4px' }}><p>Chưa có chi tiêu trong tháng này.</p></div>
        ) : (
          <div className="expense-categories-list">
            {categoryTotals.map(([category, amount]) => (
              <div key={category} className="expense-cat-item">
                <span className="cat-name">{category}</span>
                <span className="cat-amount">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="app-card" style={{ marginTop: 12 }}>
        <div className="section-header-row"><h3 className="section-title">Giao dịch gần đây</h3></div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 4px' }}>
            <p>Chưa có khoản chi nào được ghi nhận.</p>
            <button type="button" className="log-btn-primary" onClick={onOpenAddExpense}>+ Thêm khoản chi đầu tiên</button>
          </div>
        ) : (
          <div className="timeline-list">
            {recent.map((record) => (
              <article key={record.id} className="timeline-item-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <strong>{record.category}</strong>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                      {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(record.occurredAt))}
                    </div>
                    {record.note && <div style={{ fontSize: 12, marginTop: 4 }}>{record.note}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatCurrency(record.amount)}</strong>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', marginTop: 7 }}>
                      <button type="button" className="metric-pill-choice" aria-label={`Sửa ${record.category}`} onClick={() => handleEdit(record.id, record.amount, record.note)}><Pencil size={13} /></button>
                      <button type="button" className="metric-pill-choice" aria-label={`Xóa ${record.category}`} onClick={() => deleteExpense(record.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
