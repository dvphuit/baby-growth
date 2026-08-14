import { useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useState } from 'react';
import { AI_CHAT_KNOWLEDGE } from '../../data/seedData';
import { Stethoscope, X, Send } from 'lucide-react';

interface AIDoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export const AIDoctorChatModal: React.FC<AIDoctorChatModalProps> = ({
  isOpen,
  onClose,
  initialQuestion,
}) => {
  const chatMessages = useChatStore(s => s.chatMessages);
  const addChatMessage = useChatStore(s => s.addChatMessage);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = useCallback(
    (textToSend?: string) => {
      const text = (textToSend || inputText).trim();
      if (!text) return;

      addChatMessage('user', text);
      setInputText('');

      // AI answer generator
      setTimeout(() => {
        let reply =
          'Cảm ơn Ba/Mẹ! Theo phác đồ Nhi khoa chuẩn: Hãy theo dõi nhiệt độ và cho bé uống đủ nước. Nếu triệu chứng kéo dài trên 48h, mẹ đưa bé đi khám trực tiếp nhé!';

        const lower = text.toLowerCase();
        if (lower.includes('sốt') || lower.includes('tiêm')) {
          reply = AI_CHAT_KNOWLEDGE.mockReplies.sot;
        } else if (lower.includes('ăn dặm') || lower.includes('sắt') || lower.includes('thực đơn')) {
          reply = AI_CHAT_KNOWLEDGE.mockReplies.an_dam;
        } else if (lower.includes('ngủ') || lower.includes('đêm')) {
          reply = AI_CHAT_KNOWLEDGE.mockReplies.ngu;
        } else if (lower.includes('chiều cao') || lower.includes('dậy thì')) {
          reply = AI_CHAT_KNOWLEDGE.mockReplies.chieu_cao;
        } else if (lower.includes('kích sữa') || lower.includes('hút sữa') || lower.includes('sữa mẹ')) {
          reply =
            'Để kích sữa mẹ dồi dào: 1. Uống 3 lít nước ấm/ngày. 2. Hút cữ đều đặn mỗi 3 giờ. 3. Massage ngực bằng khăn ấm 5 phút trước khi hút. 4. Giữ tinh thần thư giãn, ngủ đủ giấc.';
        }

        addChatMessage('ai', reply);
      }, 600);
    },
    [inputText, addChatMessage]
  );

  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion, isOpen, handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bottom-sheet">
        <div className="sheet-handle-bar"></div>
        <div
          className="ai-chat-header"
          style={{ borderRadius: 'var(--radius-lg)', marginBottom: '8px' }}
        >
          <div className="ai-doc-info">
            <div className="ai-doc-avatar">
              <Stethoscope size={18} color="#FFFFFF" />
            </div>
            <div className="ai-doc-name-col">
              <span className="ai-doc-name">{AI_CHAT_KNOWLEDGE.doctorName}</span>
              <span className="ai-doc-status">● Trực tuyến 24/7 (AI Nhi)</span>
            </div>
          </div>
          <button
            className="sheet-close-btn"
            id="modalCloseBtn"
            onClick={onClose}
            style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="ai-chat-messages-container"
          id="aiChatMessagesBox"
          style={{ height: '300px', maxHeight: '46vh' }}
        >
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
              <div
                style={{
                  fontSize: '8px',
                  opacity: 0.7,
                  marginTop: '3px',
                  textAlign: 'right',
                }}
              >
                {msg.time}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div
          className="ai-suggestions-tray"
          style={{ margin: '6px 0', borderRadius: 'var(--radius-md)' }}
        >
          {AI_CHAT_KNOWLEDGE.suggestedQuestions.map((q, idx) => (
            <div
              key={idx}
              className="suggestion-pill-chip"
              onClick={() => handleSendMessage(q)}
            >
              {q}
            </div>
          ))}
        </div>

        <div
          className="ai-chat-input-bar"
          style={{
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <input
            type="text"
            className="chat-input-field"
            id="chatInputField"
            placeholder="Hỏi sốt, ăn dặm, tâm lý..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button
            className="chat-send-btn"
            id="btnChatSend"
            onClick={() => handleSendMessage()}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
