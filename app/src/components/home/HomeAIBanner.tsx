import { Bot, Plus, Settings } from 'lucide-react';

export interface HomeAIBannerProps {
  description: string;
  openButtonId: string;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const HomeAIBanner: React.FC<HomeAIBannerProps> = ({
  description,
  openButtonId,
  onOpenAiChat,
  onShowToast,
}) => (
  <div className="ai-chatbot-banner-card">
    <div className="ai-chatbot-banner-content">
      <div className="ai-banner-left">
        <span className="ai-banner-num">Hỏi trợ lý AI</span>
        <span className="ai-banner-label">{description}</span>
        <div className="ai-banner-sub-pills">
          <span className="ai-banner-pill">Gợi ý dựa trên ghi chép hôm nay</span>
          <span className="ai-banner-pill ai-banner-pro">AI chỉ mang tính tham khảo</span>
        </div>
      </div>
      <div className="ai-banner-robot-art">
        <Bot size={28} strokeWidth={2} />
        <span className="ai-floating-speech-bubble">...</span>
      </div>
    </div>
    <div className="ai-banner-bottom-row">
      <button
        type="button"
        className="ai-banner-btn-circle ai-banner-action"
        id={openButtonId}
        aria-label="Mở tư vấn AI"
        onClick={(event) => {
          event.stopPropagation();
          onOpenAiChat();
        }}
      >
        <Plus size={14} strokeWidth={2.4} />
        <span>Mở tư vấn</span>
      </button>
      <button
        type="button"
        className="ai-banner-btn-circle gear ai-banner-action"
        aria-label="Tùy chỉnh trợ lý AI"
        onClick={(event) => {
          event.stopPropagation();
          onShowToast?.('Tùy chỉnh trợ lý AI sẽ có trong bản cập nhật sau.');
        }}
      >
        <Settings size={12} strokeWidth={2.2} />
        <span>Tùy chỉnh</span>
      </button>
    </div>
  </div>
);
