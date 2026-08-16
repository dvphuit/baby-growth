import { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useExpenseStore } from '@/store/useExpenseStore';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

function localDateTimeInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const CATEGORIES = ['Tã bỉm & vệ sinh', 'Sữa & ăn dặm', 'Y tế & tiêm chủng', 'Quần áo & đồ dùng', 'Sách & đồ chơi', 'Khác'];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [occurredAt, setOccurredAt] = useState(localDateTimeInputValue);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Số tiền phải lớn hơn 0.');
      return;
    }

    addExpense({
      amount: Math.round(amountValue),
      category,
      occurredAt: new Date(occurredAt).toISOString(),
      note: note.trim() || undefined,
    });
    onSuccessToast(`Đã lưu chi tiêu ${Math.round(amountValue).toLocaleString('vi-VN')} đ.`);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Thêm chi tiêu">
      <form onSubmit={handleSubmit}>
        <div className="log-form-group">
          <label className="log-form-label">Số tiền (đ)</label>
          <input className="log-input-control" type="number" min="1" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ví dụ 380000" required />
        </div>
        <div className="log-form-group">
          <label className="log-form-label">Danh mục</label>
          <select className="log-input-control" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="log-form-group">
          <label className="log-form-label">Thời điểm</label>
          <input className="log-input-control" type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} required />
        </div>
        <div className="log-form-group">
          <label className="log-form-label">Ghi chú</label>
          <textarea className="log-input-control" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Không bắt buộc" />
        </div>
        {error && <p role="alert" style={{ color: '#B42318', fontSize: 13 }}>{error}</p>}
        <button type="submit" className="log-btn-primary">Lưu chi tiêu</button>
      </form>
    </BottomSheet>
  );
};
