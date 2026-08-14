import { useExpenseStore } from '@/store/useExpenseStore';
import { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import {
  Layers,
  Milk,
  Syringe,
  Utensils,
  Shirt,
  Gamepad2,
  Mic,
  RefreshCw,
  Delete,
  ArrowRight,
  Hash,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const addExpenseItem = useExpenseStore(s => s.addExpenseItem);

  const [activeSubTab, setActiveSubTab] = useState<'numpad' | 'voice' | 'recurring'>('numpad');
  const [currentAmountStr, setCurrentAmountStr] = useState<string>('380000');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tã Bỉm');
  const [selectedItemName, setSelectedItemName] = useState<string>('Tã bỉm Moony Natural');
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);

  const presets = [
    { price: '380000', cat: 'Tã Bỉm', name: 'Tã bỉm Moony', icon: <Layers size={14} />, title: 'Tã Bỉm', priceLbl: '380k' },
    { price: '450000', cat: 'Sữa', name: 'Sữa Meiji', icon: <Milk size={14} />, title: 'Sữa Bột', priceLbl: '450k' },
    { price: '1250000', cat: 'Y tế', name: 'Tiêm mũi 6in1', icon: <Syringe size={14} />, title: 'Tiêm Chủng', priceLbl: '1.25tr' },
    { price: '180000', cat: 'Ăn dặm', name: 'Bột ăn dặm', icon: <Utensils size={14} />, title: 'Ăn Dặm', priceLbl: '180k' },
    { price: '300000', cat: 'Quần áo', name: 'Bộ đồ Nous', icon: <Shirt size={14} />, title: 'Quần Áo', priceLbl: '300k' },
    { price: '250000', cat: 'Đồ chơi', name: 'Sách & Đồ chơi', icon: <Gamepad2 size={14} />, title: 'Đồ Chơi', priceLbl: '250k' },
  ];

  const handleNumpadKey = (key: string) => {
    if (key === 'backspace') {
      setCurrentAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (key === '000') {
      setCurrentAmountStr((prev) => (prev === '0' ? '0' : prev + '000'));
    } else {
      setCurrentAmountStr((prev) => (prev === '0' ? key : prev + key));
    }
  };

  const handleQuickAdd = (addVal: number) => {
    const current = parseInt(currentAmountStr || '0', 10);
    setCurrentAmountStr(String(current + addVal));
  };

  const handleSubmit = () => {
    const num = parseInt(currentAmountStr || '0', 10);
    if (num <= 0) {
      alert('Vui lòng nhập số tiền chi tiêu!');
      return;
    }

    addExpenseItem(selectedCategory, num);
    onSuccessToast(`Đã thêm chi tiêu: ${num.toLocaleString('vi-VN')} đ (${selectedCategory}) 💳`);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Tạo Chi Tiêu Cho Bé">
      {/* 3-Way Sub-Navigation Tabs */}
      <div className="expense-creator-subnav">
        <button
          className={`expense-creator-subbtn ${activeSubTab === 'numpad' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('numpad')}
        >
          <Hash size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
          Phím số
        </button>
        <button
          className={`expense-creator-subbtn ${activeSubTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('voice')}
        >
          <Mic size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
          Giọng nói
        </button>
        <button
          className={`expense-creator-subbtn ${activeSubTab === 'recurring' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('recurring')}
        >
          <RefreshCw size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
          Định kỳ
        </button>
      </div>

      {activeSubTab === 'numpad' && (
        <>
          {/* Big Numerical Display Hero Box */}
          <div className="expense-display-hero-box">
            <div className="expense-display-cat-tag" id="expenseDisplayCatTag">
              {selectedCategory}
            </div>
            <div className="expense-display-number" id="expenseDisplayNum">
              {parseInt(currentAmountStr || '0', 10).toLocaleString('vi-VN')} đ
            </div>
            <div className="expense-display-note" id="expenseDisplayNote">
              Món: {selectedItemName}
            </div>
          </div>

          {/* 1-Tap Presets Grid */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              marginBottom: '4px',
            }}
          >
            Gợi ý 1-chạm:
          </div>
          <div className="expense-preset-chips-grid">
            {presets.map((p, idx) => (
              <div
                key={idx}
                className={`preset-chip-btn ${selectedItemName === p.name ? 'active' : ''}`}
                onClick={() => {
                  setCurrentAmountStr(p.price);
                  setSelectedCategory(p.cat);
                  setSelectedItemName(p.name);
                }}
              >
                <span className="preset-chip-ico">{p.icon}</span>
                <span className="preset-chip-title">{p.title}</span>
                <span className="preset-chip-price">{p.priceLbl}</span>
              </div>
            ))}
          </div>

          {/* Quick Increments Bar */}
          <div className="quick-adders-bar">
            <button className="quick-adder-btn" onClick={() => handleQuickAdd(100000)}>
              +100k
            </button>
            <button className="quick-adder-btn" onClick={() => handleQuickAdd(500000)}>
              +500k
            </button>
            <button className="quick-adder-btn" onClick={() => handleQuickAdd(1000000)}>
              +1tr
            </button>
            <button
              className="quick-adder-btn"
              onClick={() => setCurrentAmountStr('0')}
              style={{ color: '#D96938' }}
            >
              Xóa
            </button>
          </div>

          {/* Custom Round Numpad Grid */}
          <div className="numpad-container-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((k) => (
              <button key={k} className="numpad-key-btn" onClick={() => handleNumpadKey(k)}>
                {k}
              </button>
            ))}
            <button
              className="numpad-key-btn backspace"
              onClick={() => handleNumpadKey('backspace')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Delete size={18} />
            </button>
          </div>
        </>
      )}

      {activeSubTab === 'voice' && (
        <>
          <div className="voice-expense-card">
            <div
              className={`voice-mic-big-circle ${isVoiceRecording ? 'recording' : ''}`}
              onClick={() => setIsVoiceRecording(!isVoiceRecording)}
            >
              <Mic size={28} />
            </div>
            <div className="voice-waveform-bars">
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--color-primary-dark)',
              }}
            >
              {isVoiceRecording ? 'Đang lắng nghe...' : 'Chạm Micro để Nói'}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Vd: "Mua 2 bịch bỉm Moony 760 nghìn"
            </div>
          </div>

          <div className="voice-recognized-bubble" id="voiceRecognizedBox">
            🗣️ "Đã nhận diện: 2 bịch bỉm Moony 760,000 đ"
          </div>

          <div className="expense-display-hero-box" style={{ marginTop: '6px' }}>
            <div className="expense-display-cat-tag">Tã Bỉm</div>
            <div className="expense-display-number">760,000 đ</div>
            <div className="expense-display-note">Món: 2 bịch bỉm Moony Natural</div>
          </div>
        </>
      )}

      {activeSubTab === 'recurring' && (
        <>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              marginBottom: '6px',
            }}
          >
            Chi tiêu Định kỳ Hàng tháng
          </div>
          <div className="recurring-list-container">
            <div className="recurring-row-item">
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  🏫 Học phí mầm non
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  4,500,000 đ • Ngày 05
                </div>
              </div>
              <div className="recurring-toggle-switch active"></div>
            </div>

            <div className="recurring-row-item">
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  🛡️ Bảo hiểm sức khỏe
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  1,200,000 đ • Ngày 10
                </div>
              </div>
              <div className="recurring-toggle-switch active"></div>
            </div>

            <div className="recurring-row-item">
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  🏊 Lớp bơi thủy liệu
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  800,000 đ • Ngày 15
                </div>
              </div>
              <div className="recurring-toggle-switch active"></div>
            </div>
          </div>
        </>
      )}

      <button className="log-btn-primary" onClick={handleSubmit}>
        <span>Lưu Khoản Chi</span>
        <ArrowRight size={14} />
      </button>
    </BottomSheet>
  );
};
