import { useBabyStore } from '@/store/useBabyStore';
import { useUIStore } from '@/store/useUIStore';

interface AIAdviceCardProps {
  onOpenAiChat: () => void;
  onAskQuestion: (q: string) => void;
}

export const AIAdviceCard: React.FC<AIAdviceCardProps> = ({ onOpenAiChat, onAskQuestion }) => {
  const currentStageData = useBabyStore(s => s.currentStageData());
  const profileMode = useUIStore(s => s.profileMode);
  const isMom = profileMode === 'mom';

  const adviceText = isMom
    ? 'Mẹ Thảo nên duy trì uống 2.5 - 3 lít nước ấm mỗi ngày và bổ sung ngũ cốc lợi sữa. Tránh căng thẳng để hormone Oxytocin tiết ra dồi dào nhé!'
    : `Bé Bơ (${currentStageData.currentAgeText}) đang ở giai đoạn phát triển vận động thô vượt bậc. Hãy khuyến khích con bò trườn tìm đồ chơi nhiều màu sắc và giữ tư thế ngồi lưng thẳng.`;

  const sampleQuestions = isMom
    ? [
        'Làm sao kích sữa về nhiều sau 3 tháng?',
        'Thực đơn bồi bổ cho mẹ sau sinh?',
      ]
    : [
        'Bé 8 tháng sốt 38.2°C sau tiêm 6in1 thì sao?',
        'Thực đơn ăn dặm giàu sắt cho bé 8 tháng?',
      ];

  return (
    <div className="ai-advice-section">
      <div className="ai-advice-card">
        <div className="ai-advice-header">
          <div className="ai-doctor-avatar-tag">
            <span className="doctor-emoji">🩺</span>
            <span className="doctor-tag-title">Gợi ý từ Trợ lý Freud AI</span>
          </div>
          <span className="ai-live-badge">Thông tin tham khảo</span>
        </div>

        <p className="ai-advice-body-text">{adviceText}</p>

        <div className="ai-sample-chips-row">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              className="ai-sample-chip-btn"
              onClick={() => onAskQuestion(q)}
            >
              <span>💡</span>
              <span>{q}</span>
            </button>
          ))}
        </div>

        <button className="ai-advice-chat-cta" onClick={onOpenAiChat}>
          <span>💬</span>
          <span>Trò chuyện với Trợ lý AI &rarr;</span>
        </button>
      </div>
    </div>
  );
};
