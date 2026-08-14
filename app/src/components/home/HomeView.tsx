import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '@/store/useBabyStore';
import { useMomStore } from '@/store/useMomStore';
import { useUIStore } from '@/store/useUIStore';
import {
  Sparkles,
  MoreHorizontal,
  ArrowRight,
  Milk,
  Moon,
  HeartPulse,
  Smile,
  Flame,
  Bot,
  Plus,
  Settings,
  BookOpen,
  Syringe,
  Eye,
  Heart,
  Activity,
  Baby,
} from 'lucide-react';

interface HomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenScoreDetail,
  onOpenQuickLog,
  onOpenAiChat,
  onOpenPumping,
}) => {
  const navigate = useNavigate();
  const profileMode = useUIStore(s => s.profileMode);
  const currentStageData = useBabyStore(s => s.currentStageData());
  const momData = useMomStore(s => s.momData);
  const isMom = profileMode === 'mom';

  if (isMom) {
    return (
      <div className="home-view-container">
        <div className="section-title-row">
          <span className="section-main-title">Chỉ số Sức khỏe & Phục hồi</span>
          <span className="section-more-btn">
            <MoreHorizontal size={14} />
          </span>
        </div>

        <div className="metrics-carousel-grid">
          <div
            className="freud-score-card"
            id="btnOpenMomScoreDetail"
            style={{ background: 'var(--color-mom-rose)', cursor: 'pointer' }}
            onClick={onOpenScoreDetail}
          >
            <div className="card-top-tag-row">
              <span className="card-top-pill-left">
                <Heart size={10} fill="currentColor" /> Wellness
              </span>
              <MoreHorizontal size={12} />
            </div>
            <div className="score-concentric-circles-box" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="score-inner-badge">
                <div className="num">{momData.wellnessScore}</div>
                <div className="lbl">Hồi phục tốt</div>
              </div>
            </div>
            <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              <span>Xem chi tiết</span>
              <ArrowRight size={10} />
            </div>
          </div>

          <div
            className="mood-highlight-card"
            style={{ background: 'linear-gradient(145deg, #E87A90 0%, #D95D77 100%)' }}
          >
            <div className="card-top-tag-row">
              <span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <Milk size={11} /> Sữa Đông
              </span>
              <MoreHorizontal size={12} />
            </div>
            <div>
              <div className="mood-card-title">4.85 L</div>
              <div style={{ fontSize: '10.5px', opacity: 0.9 }}>24 túi trữ an toàn</div>
            </div>
            <div className="mood-dots-track">
              <div className="mood-dot-step active"></div>
              <div className="mood-dot-step active"></div>
              <div className="mood-dot-step active"></div>
              <div className="mood-dot-step"></div>
            </div>
          </div>
        </div>

        <div className="carousel-indicators-dots">
          <div className="carousel-dot active"></div>
          <div className="carousel-dot"></div>
          <div className="carousel-dot"></div>
        </div>

        <div className="section-title-row">
          <span className="section-main-title">Nhật ký Hôm nay</span>
          <span className="section-more-btn">
            <MoreHorizontal size={14} />
          </span>
        </div>

        <div className="tracker-list-group">
          <div
            className="tracker-list-item"
            id="btnMomPumpingRow"
            onClick={onOpenPumping}
            style={{ cursor: 'pointer' }}
          >
            <div className="tracker-item-left">
              <div className="tracker-icon-circle rose">
                <Milk size={15} />
              </div>
              <div className="tracker-item-info">
                <span className="tracker-item-title">Hút sữa mẹ</span>
                <span className="tracker-item-sub">
                  {momData.pumping.todayTotal} ({momData.pumping.sessionsToday} cữ)
                </span>
              </div>
            </div>
            <div className="tracker-item-right">
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-mom-rose)' }}>
                +180ml
              </span>
            </div>
          </div>

          <div className="tracker-list-item">
            <div className="tracker-item-left">
              <div className="tracker-icon-circle purple">
                <Moon size={15} />
              </div>
              <div className="tracker-item-info">
                <span className="tracker-item-title">Nợ giấc ngủ</span>
                <span className="tracker-item-sub">{momData.mentalHealth.sleepDebt}</span>
              </div>
            </div>
            <div className="tracker-item-right">
              <div className="mini-score-pill">7.5h</div>
            </div>
          </div>

          <div className="tracker-list-item">
            <div className="tracker-item-left">
              <div className="tracker-icon-circle green">
                <HeartPulse size={15} />
              </div>
              <div className="tracker-item-info">
                <span className="tracker-item-title">Tâm lý & EPDS</span>
                <span className="tracker-item-sub">
                  {momData.mentalHealth.epdsScore} (Rất an toàn)
                </span>
              </div>
            </div>
            <div className="tracker-item-right">
              <span
                style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}
              >
                Tốt
              </span>
            </div>
          </div>
        </div>

        {/* AI Pediatric & Parenting Banner */}
        <div
          className="ai-chatbot-banner-card"
          id="btnOpenAiFromHome"
          onClick={onOpenAiChat}
          style={{ cursor: 'pointer' }}
        >
          <div className="ai-chatbot-banner-content">
            <div className="ai-banner-left">
              <span className="ai-banner-num">2,541</span>
              <span className="ai-banner-label">Tư vấn AI</span>
              <div className="ai-banner-sub-pills">
                <span className="ai-banner-pill">● 83 lượt miễn phí</span>
                <span className="ai-banner-pill ai-banner-pro">★ Bác sĩ Nhi & Sản 24/7</span>
              </div>
            </div>
            <div className="ai-banner-robot-art">
              <Bot size={28} strokeWidth={2} />
              <span className="ai-floating-speech-bubble">...</span>
            </div>
          </div>
          <div className="ai-banner-bottom-row">
            <div className="ai-banner-btn-circle">
              <Plus size={14} strokeWidth={2.4} />
            </div>
            <div className="ai-banner-btn-circle gear">
              <Settings size={12} strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BABY MODE HOME VIEW
  return (
    <div className="home-view-container">
      <div className="section-title-row">
        <span className="section-main-title">Chỉ số Sức khỏe</span>
        <span
          className="section-more-btn"
          onClick={() => navigate('/profile')}
          title="Xem hồ sơ chi tiết bé"
          style={{ cursor: 'pointer' }}
        >
          <MoreHorizontal size={14} />
        </span>
      </div>

      <div className="metrics-carousel-grid">
        <div
          className="freud-score-card"
          id="btnOpenFreudScore"
          onClick={onOpenScoreDetail}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-top-tag-row">
            <span className="card-top-pill-left">
              <Sparkles size={10} /> Growth
            </span>
            <MoreHorizontal size={12} />
          </div>
          <div className="score-concentric-circles-box">
            <div className="score-inner-badge">
              <div className="num">{currentStageData.growthScore || 92}</div>
              <div className="lbl">Healthy</div>
            </div>
          </div>
          <div style={{ fontSize: '9px', opacity: 0.9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <span>Xem chi tiết</span>
            <ArrowRight size={10} />
          </div>
        </div>

        <div
          className="mood-highlight-card"
          id="btnOpenMoodTracker"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-top-tag-row">
            <span className="card-top-pill-left" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <Smile size={11} strokeWidth={2.2} /> Mood
            </span>
            <MoreHorizontal size={12} />
          </div>
          <div>
            <div className="mood-card-title">Happy</div>
            <div style={{ fontSize: '10.5px', opacity: 0.9 }}>Bé vui vẻ, hoạt bát</div>
          </div>
          <div className="mood-dots-track">
            <div className="mood-dot-step"></div>
            <div className="mood-dot-step"></div>
            <div className="mood-dot-step active"></div>
            <div className="mood-dot-step"></div>
            <div className="mood-dot-step"></div>
          </div>
        </div>
      </div>

      <div className="carousel-indicators-dots">
        <div className="carousel-dot active"></div>
        <div className="carousel-dot"></div>
        <div className="carousel-dot"></div>
        <div className="carousel-dot"></div>
      </div>

      <div className="section-title-row">
        <span className="section-main-title">Nhật ký Hôm nay</span>
        <span className="section-more-btn">
          <MoreHorizontal size={14} />
        </span>
      </div>

      <div className="tracker-list-group">
        <div
          className="tracker-list-item"
          data-action="feeding"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="tracker-item-left">
            <div className="tracker-icon-circle sage">
              <Baby size={15} />
            </div>
            <div className="tracker-item-info">
              <span className="tracker-item-title">Cữ bú & Ăn dặm</span>
              <span className="tracker-item-sub">160ml Sữa mẹ (~1h trước)</span>
            </div>
          </div>
          <div className="tracker-item-right">
            <svg className="sparkline-svg" viewBox="0 0 50 20" fill="none">
              <path
                d="M2 15 Q 12 5, 25 12 T 48 3"
                stroke="#91A672"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div
          className="tracker-list-item"
          data-action="sleep"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="tracker-item-left">
            <div className="tracker-icon-circle purple">
              <Moon size={15} />
            </div>
            <div className="tracker-item-info">
              <span className="tracker-item-title">Giấc ngủ của Bé</span>
              <span className="tracker-item-sub">
                {currentStageData.todayVitals.sleepTotal || '13.5h'} (10h đêm + 2 nap)
              </span>
            </div>
          </div>
          <div className="tracker-item-right">
            <div className="mini-score-pill">{currentStageData.growthScore || 92}</div>
          </div>
        </div>

        <div
          className="tracker-list-item"
          data-action="diaper"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="tracker-item-left">
            <div className="tracker-icon-circle amber">
              <Flame size={15} />
            </div>
            <div className="tracker-item-info">
              <span className="tracker-item-title">Thay tã & Vệ sinh</span>
              <span className="tracker-item-sub">
                {currentStageData.todayVitals.diaperCount || 4} lần (3 ướt, 1 bẩn)
              </span>
            </div>
          </div>
          <div className="tracker-item-right">
            <span style={{ fontSize: '13px', letterSpacing: '2px', color: '#F5B842' }}>
              ●●●●
            </span>
          </div>
        </div>

        <div
          className="tracker-list-item"
          data-action="health"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="tracker-item-left">
            <div className="tracker-icon-circle green">
              <Activity size={15} />
            </div>
            <div className="tracker-item-info">
              <span className="tracker-item-title">Thân nhiệt & Thể trạng</span>
              <span className="tracker-item-sub">
                {currentStageData.todayVitals.temperature || '36.8 °C'} (Bình thường)
              </span>
            </div>
          </div>
          <div className="tracker-item-right">
            <span
              style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-overjoyed)' }}
            >
              Chuẩn
            </span>
          </div>
        </div>

        <div
          className="tracker-list-item"
          data-action="mood"
          onClick={onOpenQuickLog}
          style={{ cursor: 'pointer' }}
        >
          <div className="tracker-item-left">
            <div className="tracker-icon-circle rose">
              <Smile size={15} />
            </div>
            <div className="tracker-item-info">
              <span className="tracker-item-title">Tâm trạng Bé</span>
              <span className="tracker-item-sub">Ngoan → Hào hứng</span>
            </div>
          </div>
          <div className="tracker-item-right">
            <Smile size={18} color="var(--color-overjoyed)" strokeWidth={2.4} />
          </div>
        </div>
      </div>

      {/* AI Pediatric Chatbot Banner */}
      <div
        className="ai-chatbot-banner-card"
        id="btnOpenAiBanner"
        onClick={onOpenAiChat}
        style={{ cursor: 'pointer' }}
      >
        <div className="ai-chatbot-banner-content">
          <div className="ai-banner-left">
            <span className="ai-banner-num">2,541</span>
            <span className="ai-banner-label">Tư vấn AI</span>
            <div className="ai-banner-sub-pills">
              <span className="ai-banner-pill">● 83 lượt miễn phí</span>
              <span className="ai-banner-pill ai-banner-pro">★ Bác sĩ Nhi 24/7</span>
            </div>
          </div>
          <div className="ai-banner-robot-art">
            <Bot size={28} strokeWidth={2} />
            <span className="ai-floating-speech-bubble">...</span>
          </div>
        </div>
        <div className="ai-banner-bottom-row">
          <div className="ai-banner-btn-circle">
            <Plus size={14} strokeWidth={2.4} />
          </div>
          <div className="ai-banner-btn-circle gear">
            <Settings size={12} strokeWidth={2.2} />
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <span className="section-main-title">Cẩm nang Chăm sóc</span>
        <span
          className="card-action-link"
          style={{
            fontSize: '10.5px',
            color: 'var(--color-sage-dark)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Xem tất cả
        </span>
      </div>

      <div className="resources-horizontal-list">
        <div className="resource-item-card">
          <div className="resource-item-thumb">
            <BookOpen size={20} color="var(--color-sage-dark)" />
          </div>
          <span className="resource-tag-pill">Ăn dặm BLW</span>
          <div className="resource-item-title">Thực đơn ăn dặm giàu sắt từ 8 tháng?</div>
          <div className="resource-item-stats">
            <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 5.2k</span>
            <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 987</span>
          </div>
        </div>

        <div className="resource-item-card">
          <div className="resource-item-thumb">
            <Moon size={20} color="#9579EE" />
          </div>
          <span className="resource-tag-pill">Giấc ngủ</span>
          <div className="resource-item-title">Rèn bé tự ngủ xuyên đêm không quấy?</div>
          <div className="resource-item-stats">
            <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 8.4k</span>
            <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 1.4k</span>
          </div>
        </div>

        <div className="resource-item-card">
          <div className="resource-item-thumb">
            <Syringe size={20} color="#E87A90" />
          </div>
          <span className="resource-tag-pill">Tiêm chủng</span>
          <div className="resource-item-title">Lịch tiêm phòng quan trọng năm đầu đời</div>
          <div className="resource-item-stats">
            <span><Eye size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> 6.1k</span>
            <span><Heart size={11} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> 890</span>
          </div>
        </div>
      </div>
    </div>
  );
};
