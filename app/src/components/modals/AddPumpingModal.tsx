import { useMomStore } from '@/store/useMomStore';
import { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Milk, ArrowRight } from 'lucide-react';

interface AddPumpingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const AddPumpingModal: React.FC<AddPumpingModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const addPumpingSession = useMomStore(s => s.addPumpingSession);

  const [amount, setAmount] = useState<string>('180');
  const [side, setSide] = useState<string>('2 bên');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10) || 0;
    if (amt <= 0) {
      alert('Vui lòng nhập lượng sữa hút được!');
      return;
    }

    addPumpingSession(amt, side);
    onSuccessToast(`Đã lưu cữ hút sữa: +${amt}ml (${side}) 🥛`);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Ghi Nhận Cữ Hút Sữa Mẹ">
      <form onSubmit={handleSubmit}>
        <div className="log-form-group">
          <label className="log-form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Milk size={13} color="var(--color-mom-rose)" /> Lượng sữa vắt / hút được (ml)
          </label>
          <input
            type="number"
            required
            className="log-input-control"
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-family-display)',
              fontSize: '18px',
              fontWeight: 800,
            }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="180"
          />
        </div>

        <div className="log-form-group">
          <label className="log-form-label">Bên ngực hút</label>
          <div className="chart-metric-selector-pills" style={{ marginBottom: 0 }}>
            {['2 bên', 'Ngực trái', 'Ngực phải'].map((s) => (
              <button
                type="button"
                key={s}
                className={`metric-pill-choice ${side === s ? 'active' : ''}`}
                onClick={() => setSide(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="log-btn-primary">
          <span>Lưu Cữ Hút Sữa</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </BottomSheet>
  );
};
