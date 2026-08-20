
export const MoodHistory: React.FC = () => {
  const history = [
    { date: 'Hôm nay (14/08)', mood: '🤩 Hào hứng', desc: 'Ăn hết bát cháo bơ yến mạch, cười đùa vui vẻ', score: 95, color: '#7EAF50' },
    { date: 'Hôm qua (13/08)', mood: '😊 Vui vẻ', desc: 'Tập ngồi thẳng 15 phút, bú mẹ 5 cữ đều', score: 90, color: '#8DA06F' },
    { date: '12/08/2026', mood: '😐 Bình thường', desc: 'Hơi mè nheo cữ trưa do mọc răng, chiều chơi ngoan', score: 82, color: '#F5B842' },
    { date: '11/08/2026', mood: '🙁 Mệt mỏi', desc: 'Ấm nhẹ sau tiêm 6in1, ngủ nhiều', score: 75, color: '#E97332' },
    { date: '10/08/2026', mood: '🤩 Hào hứng', desc: 'Đi dạo công viên cùng ba mẹ, hóng chuyện ríu rít', score: 96, color: '#7EAF50' },
  ];

  return (
    <div className="mood-history-list-wrapper">
      <div className="section-header-row" style={{ marginTop: '8px' }}>
        <h3 className="section-title">Nhật ký diễn biến cảm xúc (7 ngày)</h3>
      </div>
      <div className="mood-history-cards">
        {history.map((h, idx) => (
          <div key={idx} className="mood-history-card-item">
            <div className="mood-history-row-top">
              <span className="mood-history-date">{h.date}</span>
              <span
                className="mood-history-badge"
                style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
              >
                {h.mood}
              </span>
            </div>
            <p className="mood-history-desc">{h.desc}</p>
            <div className="mood-history-score-bar">
              <div
                className="mood-history-score-fill"
                style={{ width: `${h.score}%`, backgroundColor: h.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
