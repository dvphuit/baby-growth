import { BottomSheet } from '../common/BottomSheet';
import { Syringe, Sparkles, Milk, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const alerts = [
    {
      id: 'a1',
      icon: <Syringe size={16} color="#E87A90" />,
      title: 'Lịch tiêm phòng sắp tới',
      desc: 'Mũi Cúm mùa & Viêm màng não BC vào ngày 20/08/2026.',
      time: '2 giờ trước',
      badge: 'Y tế',
    },
    {
      id: 'a2',
      icon: <Sparkles size={16} color="var(--color-sage-dark)" />,
      title: 'Tuần Wonder Week 37',
      desc: 'Bé đang có bước nhảy vọt về vận động (Tập ngồi vững 15p).',
      time: 'Hôm qua',
      badge: 'Cột mốc',
    },
    {
      id: 'a3',
      icon: <Milk size={16} color="var(--color-mom-rose)" />,
      title: 'Nhắc nhở cữ hút sữa',
      desc: 'Đã đến cữ hút sữa chiều lúc 15:00. Hãy uống 1 ly nước ấm nhé!',
      time: '14:50',
      badge: 'Sữa Mẹ',
    },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Thông báo & Nhắc nhở thông minh">
      <div className="notifications-list-container">
        {alerts.map((a) => (
          <div key={a.id} className="notification-card-item">
            <div className="notif-icon-circle">{a.icon}</div>
            <div className="notif-content-box">
              <div className="notif-top-row">
                <h5 className="notif-title">{a.title}</h5>
                <span className="notif-badge">{a.badge}</span>
              </div>
              <p className="notif-desc">{a.desc}</p>
              <span className="notif-time" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} /> {a.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
};
