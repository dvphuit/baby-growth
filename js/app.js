/**
 * Main Application Orchestrator
 * Baby & Child Growth Tracker (0 - 18 Years)
 * Exact Mockup Match (Freud.ai Warm & Earthy Minimalist Ecosystem)
 * Concise, non-wrapping micro-copy for optimal mobile layout
 */

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("appMainContent");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalContentContainer = document.getElementById("modalContentContainer");
  const toastContainer = document.getElementById("toastContainer");
  const mediaLightbox = document.getElementById("mediaLightbox");
  const lightboxContentBox = document.getElementById("lightboxContentBox");
  const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");

  // Sub-view trackers
  let currentSubView = null; // null | 'score-detail'
  let currentTimelineSubTab = "feed"; // 'feed' | 'mood-history'
  let activeCalendarDay = 26; // Tue 26

  // =========================================================================
  // 1. TOAST HELPER
  // =========================================================================
  function showToast(message, icon = "🌿") {
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-12px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  }

  // =========================================================================
  // 2. MODAL & LIGHTBOX HANDLERS
  // =========================================================================
  function openModal(contentHtml) {
    modalContentContainer.innerHTML = contentHtml;
    modalBackdrop.classList.add("open");
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
  }

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  function openLightbox(mediaSrc, isVideo = false) {
    if (isVideo) {
      lightboxContentBox.innerHTML = `<video src="${mediaSrc}" controls autoplay style="max-width:100%; max-height:70vh; border-radius:16px;"></video>`;
    } else {
      lightboxContentBox.innerHTML = `<img src="${mediaSrc}" alt="Enlarged photo" />`;
    }
    mediaLightbox.classList.add("open");
  }

  function closeLightbox() {
    mediaLightbox.classList.remove("open");
    lightboxContentBox.innerHTML = "";
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (mediaLightbox) {
    mediaLightbox.addEventListener("click", (e) => {
      if (e.target === mediaLightbox) closeLightbox();
    });
  }

  // =========================================================================
  // 3. HEADER & CONTROLLERS RENDERER
  // =========================================================================
  function renderHeader() {
    const header = document.getElementById("mainHeader");
    const state = window.store.state;
    const stageData = window.store.getCurrentStageData();
    const isMom = state.profileMode === "mom";

    const name = isMom ? MOCK_DATA.momData.name : MOCK_DATA.family.childName;
    const avatar = isMom ? MOCK_DATA.family.momAvatar : MOCK_DATA.family.childAvatar;
    const scoreVal = isMom ? MOCK_DATA.momData.wellnessScore : (stageData.growthScore || 92);

    header.innerHTML = `
      <!-- Top Date, Live AI Doctor & Notification Row -->
      <div class="header-date-row">
        <span class="header-date-text">
          <span>📅</span>
          <span>14 Tháng 8, 2026</span>
        </span>
        <div class="header-right-actions">
          <button class="header-ai-pill-btn" id="btnHeaderAiChat" title="Hỏi Bác sĩ AI">
            <span>🩺</span>
            <span>Bác sĩ AI</span>
            <span class="ai-live-dot"></span>
          </button>
          <div class="header-notification-btn" id="btnNotification" title="Thông báo">
            <span>🔔</span>
          </div>
        </div>
      </div>

      <!-- User Profile Row -->
      <div class="header-profile-row">
        <div class="header-profile-main">
          <div class="header-avatar-circle">
            <img class="header-avatar-img" src="${avatar}" alt="${name}" />
          </div>
          <div class="header-profile-meta">
            <div class="header-welcome-title">
              <span>Hi, ${name}!</span>
              <span style="font-size: 12px; color: var(--color-sage-dark);">✨</span>
            </div>
            <div class="header-status-pills">
              <span class="status-pill-badge pro">★ Pro</span>
              <span class="status-pill-badge score">${scoreVal}%</span>
              <span class="status-pill-badge mood">😊 Vui vẻ</span>
            </div>
          </div>
        </div>

        <!-- Dual Mode Pill Toggle -->
        <div class="dual-mode-toggle">
          <button class="dual-mode-btn ${!isMom ? "active" : ""}" id="btnModeBaby">👶 Bé</button>
          <button class="dual-mode-btn ${isMom ? "active" : ""}" id="btnModeMom">🤱 Mẹ</button>
        </div>
      </div>

      <!-- Pill Search Bar -->
      <div class="header-search-bar">
        <span style="font-size: 14px; color: var(--color-text-muted);">🔍</span>
        <input type="text" class="search-input-field" placeholder="Tìm cữ bú, chỉ số, lời khuyên..." />
        <span class="search-filter-icon" id="btnSearchFilter" title="Bộ lọc">⚙️</span>
      </div>

      ${!isMom ? `
        <!-- Age Simulator (4 Phases - Clean Single Line Titles) -->
        <div class="age-simulator-wrapper">
          <div class="age-simulator-label">
            <span>🌱 Giả lập độ tuổi (0 - 18 tuổi):</span>
            <span style="font-size: 8.5px; color: var(--color-sage-dark); font-weight: 700;">Đổi mốc</span>
          </div>
          <div class="age-stages-pills">
            <div class="stage-pill ${state.currentStage === "stage_0_1" ? "active" : ""}" data-stage="stage_0_1">
              <span class="stage-name">Sơ sinh</span>
              <span class="stage-age">0 - 12m</span>
            </div>
            <div class="stage-pill ${state.currentStage === "stage_1_5" ? "active" : ""}" data-stage="stage_1_5">
              <span class="stage-name">Mầm non</span>
              <span class="stage-age">1 - 5y</span>
            </div>
            <div class="stage-pill ${state.currentStage === "stage_6_12" ? "active" : ""}" data-stage="stage_6_12">
              <span class="stage-name">Tiểu học</span>
              <span class="stage-age">6 - 12y</span>
            </div>
            <div class="stage-pill ${state.currentStage === "stage_13_18" ? "active" : ""}" data-stage="stage_13_18">
              <span class="stage-name">Dậy thì</span>
              <span class="stage-age">13 - 18y</span>
            </div>
          </div>
        </div>
      ` : ""}
    `;

    // Attach listeners
    const btnBaby = document.getElementById("btnModeBaby");
    const btnMom = document.getElementById("btnModeMom");
    if (btnBaby) {
      btnBaby.addEventListener("click", () => {
        window.store.setProfileMode("baby");
        showToast("Chế độ Bé", "👶");
      });
    }
    if (btnMom) {
      btnMom.addEventListener("click", () => {
        window.store.setProfileMode("mom");
        showToast("Chế độ Mẹ sau sinh", "🤱");
      });
    }

    const stagePills = document.querySelectorAll(".stage-pill");
    stagePills.forEach(pill => {
      pill.addEventListener("click", () => {
        window.store.setStage(pill.dataset.stage);
        showToast(`Mốc: ${pill.querySelector(".stage-name").textContent}`, "🌱");
      });
    });

    const btnAiHeader = document.getElementById("btnHeaderAiChat");
    if (btnAiHeader) {
      btnAiHeader.addEventListener("click", openAiChatModal);
    }

    const btnNotif = document.getElementById("btnNotification");
    if (btnNotif) {
      btnNotif.addEventListener("click", () => {
        showToast("Nhắc nhở: Cữ bú tiếp theo lúc 10:30!", "🔔");
      });
    }
  }

  // =========================================================================
  // 4. TAB 1: HOME VIEW
  // =========================================================================
  function renderHomeTab() {
    if (currentSubView === "score-detail") {
      renderScoreDetailView();
      return;
    }

    const state = window.store.state;
    const stageData = window.store.getCurrentStageData();
    const isMom = state.profileMode === "mom";

    if (isMom) {
      const mom = window.store.state.momData;
      appContainer.innerHTML = `
        <div class="section-title-row">
          <span class="section-main-title">Chỉ số Sức khỏe & Phục hồi</span>
          <span class="section-more-btn">•••</span>
        </div>

        <div class="metrics-carousel-grid">
          <div class="freud-score-card" id="btnOpenMomScoreDetail" style="background: var(--color-mom-rose);">
            <div class="card-top-tag-row">
              <span class="card-top-pill-left">🌸 Wellness</span>
              <span>•••</span>
            </div>
            <div class="score-concentric-circles-box" style="background: rgba(255,255,255,0.2);">
              <div class="score-inner-badge">
                <div class="num">${mom.wellnessScore}</div>
                <div class="lbl">Hồi phục tốt</div>
              </div>
            </div>
            <div style="font-size: 9px; opacity: 0.9; text-align: center;">Xem chi tiết →</div>
          </div>

          <div class="mood-highlight-card" style="background: linear-gradient(145deg, #E87A90 0%, #D95D77 100%);">
            <div class="card-top-tag-row">
              <span class="card-top-pill-left" style="background: rgba(255,255,255,0.25);">🥛 Sữa Đông</span>
              <span>•••</span>
            </div>
            <div>
              <div class="mood-card-title">4.85 L</div>
              <div style="font-size: 10.5px; opacity: 0.9;">24 túi trữ an toàn</div>
            </div>
            <div class="mood-dots-track">
              <div class="mood-dot-step active"></div>
              <div class="mood-dot-step active"></div>
              <div class="mood-dot-step active"></div>
              <div class="mood-dot-step"></div>
            </div>
          </div>
        </div>

        <div class="carousel-indicators-dots">
          <div class="carousel-dot active"></div>
          <div class="carousel-dot"></div>
          <div class="carousel-dot"></div>
        </div>

        <div class="section-title-row">
          <span class="section-main-title">Nhật ký Hôm nay</span>
          <span class="section-more-btn">•••</span>
        </div>

        <div class="tracker-list-group">
          <div class="tracker-list-item" id="btnMomPumpingRow">
            <div class="tracker-item-left">
              <div class="tracker-icon-circle rose">🥛</div>
              <div class="tracker-item-info">
                <span class="tracker-item-title">Hút sữa mẹ</span>
                <span class="tracker-item-sub">${mom.pumping.todayTotal} (${mom.pumping.sessionsToday} cữ)</span>
              </div>
            </div>
            <div class="tracker-item-right">
              <span style="font-size: 11px; font-weight: 700; color: var(--color-mom-rose);">+180ml</span>
            </div>
          </div>

          <div class="tracker-list-item">
            <div class="tracker-item-left">
              <div class="tracker-icon-circle purple">🌙</div>
              <div class="tracker-item-info">
                <span class="tracker-item-title">Nợ giấc ngủ</span>
                <span class="tracker-item-sub">${mom.mentalHealth.sleepDebt}</span>
              </div>
            </div>
            <div class="tracker-item-right">
              <div class="mini-score-pill">7.5h</div>
            </div>
          </div>

          <div class="tracker-list-item">
            <div class="tracker-item-left">
              <div class="tracker-icon-circle green">🧘‍♀️</div>
              <div class="tracker-item-info">
                <span class="tracker-item-title">Tâm lý & EPDS</span>
                <span class="tracker-item-sub">${mom.mentalHealth.epdsScore} (Rất an toàn)</span>
              </div>
            </div>
            <div class="tracker-item-right">
              <span style="font-size: 10.5px; font-weight: 700; color: var(--color-overjoyed);">Tốt</span>
            </div>
          </div>
        </div>

        <!-- AI Pediatric & Parenting Banner -->
        <div class="ai-chatbot-banner-card" id="btnOpenAiFromHome">
          <div class="ai-chatbot-banner-content">
            <div class="ai-banner-left">
              <span class="ai-banner-num">2,541</span>
              <span class="ai-banner-label">Tư vấn AI</span>
              <div class="ai-banner-sub-pills">
                <span class="ai-banner-pill">● 83 lượt miễn phí</span>
                <span class="ai-banner-pill ai-banner-pro">★ Bác sĩ Nhi & Sản 24/7</span>
              </div>
            </div>
            <div class="ai-banner-robot-art">
              <span>🩺</span>
              <span class="ai-floating-speech-bubble">...</span>
            </div>
          </div>
          <div class="ai-banner-bottom-row">
            <div class="ai-banner-btn-circle">+</div>
            <div class="ai-banner-btn-circle gear">⚙️</div>
          </div>
        </div>
      `;

      const btnPump = document.getElementById("btnMomPumpingRow");
      if (btnPump) btnPump.addEventListener("click", openQuickLogModal);
      const btnAi = document.getElementById("btnOpenAiFromHome");
      if (btnAi) btnAi.addEventListener("click", openAiChatModal);
      return;
    }

    // BABY MODE HOME VIEW
    appContainer.innerHTML = `
      <div class="section-title-row">
        <span class="section-main-title">Chỉ số Sức khỏe</span>
        <span class="section-more-btn">•••</span>
      </div>

      <div class="metrics-carousel-grid">
        <div class="freud-score-card" id="btnOpenFreudScore">
          <div class="card-top-tag-row">
            <span class="card-top-pill-left">🌿 Growth</span>
            <span>•••</span>
          </div>
          <div class="score-concentric-circles-box">
            <div class="score-inner-badge">
              <div class="num">${stageData.growthScore || 92}</div>
              <div class="lbl">Healthy</div>
            </div>
          </div>
          <div style="font-size: 9px; opacity: 0.9; text-align: center;">Xem chi tiết →</div>
        </div>

        <div class="mood-highlight-card" id="btnOpenMoodTracker">
          <div class="card-top-tag-row">
            <span class="card-top-pill-left" style="background: rgba(255,255,255,0.25);">😊 Mood</span>
            <span>•••</span>
          </div>
          <div>
            <div class="mood-card-title">Happy</div>
            <div style="font-size: 10.5px; opacity: 0.9;">Bé vui vẻ, hoạt bát</div>
          </div>
          <div class="mood-dots-track">
            <div class="mood-dot-step"></div>
            <div class="mood-dot-step"></div>
            <div class="mood-dot-step active"></div>
            <div class="mood-dot-step"></div>
            <div class="mood-dot-step"></div>
          </div>
        </div>
      </div>

      <div class="carousel-indicators-dots">
        <div class="carousel-dot active"></div>
        <div class="carousel-dot"></div>
        <div class="carousel-dot"></div>
        <div class="carousel-dot"></div>
      </div>

      <div class="section-title-row">
        <span class="section-main-title">Nhật ký Hôm nay</span>
        <span class="section-more-btn">•••</span>
      </div>

      <div class="tracker-list-group">
        <div class="tracker-list-item" data-action="feeding">
          <div class="tracker-item-left">
            <div class="tracker-icon-circle sage">🍼</div>
            <div class="tracker-item-info">
              <span class="tracker-item-title">Cữ bú & Ăn dặm</span>
              <span class="tracker-item-sub">160ml Sữa mẹ (~1h trước)</span>
            </div>
          </div>
          <div class="tracker-item-right">
            <svg class="sparkline-svg" viewBox="0 0 50 20" fill="none">
              <path d="M2 15 Q 12 5, 25 12 T 48 3" stroke="#91A672" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <div class="tracker-list-item" data-action="sleep">
          <div class="tracker-item-left">
            <div class="tracker-icon-circle purple">🌙</div>
            <div class="tracker-item-info">
              <span class="tracker-item-title">Giấc ngủ của Bé</span>
              <span class="tracker-item-sub">13.5h (10h đêm + 2 nap)</span>
            </div>
          </div>
          <div class="tracker-item-right">
            <div class="mini-score-pill">${stageData.growthScore || 92}</div>
          </div>
        </div>

        <div class="tracker-list-item" data-action="diaper">
          <div class="tracker-item-left">
            <div class="tracker-icon-circle amber">🧷</div>
            <div class="tracker-item-info">
              <span class="tracker-item-title">Thay tã & Vệ sinh</span>
              <span class="tracker-item-sub">4 lần (3 ướt, 1 bẩn)</span>
            </div>
          </div>
          <div class="tracker-item-right">
            <span style="font-size: 13px; letter-spacing: 2px; color: #F5B842;">●●●●</span>
          </div>
        </div>

        <div class="tracker-list-item" data-action="health">
          <div class="tracker-item-left">
            <div class="tracker-icon-circle green">🌡️</div>
            <div class="tracker-item-info">
              <span class="tracker-item-title">Thân nhiệt & Thể trạng</span>
              <span class="tracker-item-sub">36.8 °C (Bình thường)</span>
            </div>
          </div>
          <div class="tracker-item-right">
            <span style="font-size: 10.5px; font-weight: 700; color: var(--color-overjoyed);">Chuẩn</span>
          </div>
        </div>

        <div class="tracker-list-item" data-action="mood">
          <div class="tracker-item-left">
            <div class="tracker-icon-circle rose">😊</div>
            <div class="tracker-item-info">
              <span class="tracker-item-title">Tâm trạng Bé</span>
              <span class="tracker-item-sub">Ngoan → Hào hứng</span>
            </div>
          </div>
          <div class="tracker-item-right">
            <span style="font-size: 15px;">🤩</span>
          </div>
        </div>
      </div>

      <!-- AI Pediatric Chatbot Banner -->
      <div class="ai-chatbot-banner-card" id="btnOpenAiBanner">
        <div class="ai-chatbot-banner-content">
          <div class="ai-banner-left">
            <span class="ai-banner-num">2,541</span>
            <span class="ai-banner-label">Tư vấn AI</span>
            <div class="ai-banner-sub-pills">
              <span class="ai-banner-pill">● 83 lượt miễn phí</span>
              <span class="ai-banner-pill ai-banner-pro">★ Bác sĩ Nhi 24/7</span>
            </div>
          </div>
          <div class="ai-banner-robot-art">
            <span>🤖</span>
            <span class="ai-floating-speech-bubble">...</span>
          </div>
        </div>
        <div class="ai-banner-bottom-row">
          <div class="ai-banner-btn-circle">+</div>
          <div class="ai-banner-btn-circle gear">⚙️</div>
        </div>
      </div>

      <div class="section-title-row">
        <span class="section-main-title">Cẩm nang Chăm sóc</span>
        <span class="card-action-link" style="font-size: 10.5px; color: var(--color-sage-dark); font-weight:700; cursor:pointer;">Xem tất cả</span>
      </div>

      <div class="resources-horizontal-list">
        <div class="resource-item-card">
          <div class="resource-item-thumb">🥗</div>
          <span class="resource-tag-pill">Ăn dặm BLW</span>
          <div class="resource-item-title">Thực đơn ăn dặm giàu sắt từ 8 tháng?</div>
          <div class="resource-item-stats">
            <span>👁️ 5.2k</span>
            <span>❤️ 987</span>
          </div>
        </div>

        <div class="resource-item-card">
          <div class="resource-item-thumb">🌙</div>
          <span class="resource-tag-pill">Giấc ngủ</span>
          <div class="resource-item-title">Rèn bé tự ngủ xuyên đêm không quấy?</div>
          <div class="resource-item-stats">
            <span>👁️ 8.4k</span>
            <span>❤️ 1.4k</span>
          </div>
        </div>

        <div class="resource-item-card">
          <div class="resource-item-thumb">💉</div>
          <span class="resource-tag-pill">Tiêm chủng</span>
          <div class="resource-item-title">Lịch tiêm phòng quan trọng năm đầu đời</div>
          <div class="resource-item-stats">
            <span>👁️ 6.1k</span>
            <span>❤️ 890</span>
          </div>
        </div>
      </div>
    `;

    const btnScore = document.getElementById("btnOpenFreudScore");
    if (btnScore) {
      btnScore.addEventListener("click", () => {
        currentSubView = "score-detail";
        renderHomeTab();
      });
    }

    const btnAi = document.getElementById("btnOpenAiBanner");
    if (btnAi) {
      btnAi.addEventListener("click", openAiChatModal);
    }

    const trackerRows = document.querySelectorAll(".tracker-list-item");
    trackerRows.forEach(row => {
      row.addEventListener("click", () => {
        openQuickLogModal();
      });
    });
    appendBottomSpacer();
  }

  // =========================================================================
  // 5. SCORE DETAIL VIEW (Screen 2 Exact Mockup Match)
  // =========================================================================
  function renderScoreDetailView() {
    const stageData = window.store.getCurrentStageData();

    appContainer.innerHTML = `
      <div class="score-fullscreen-view">
        <div class="score-full-top-bar">
          <button id="btnBackFromScore" style="background:transparent; border:none; color:#FFFFFF; font-size:18px; cursor:pointer;">
            〈
          </button>
          <span style="font-family: var(--font-family-display); font-size: 14.5px; font-weight: 700;">Growth Score</span>
          <span class="status-pill-badge" style="background: rgba(255,255,255,0.25); color:#FFFFFF;">Normal</span>
        </div>

        <div class="score-full-center-gauge">
          <div class="score-full-huge-number">${stageData.growthScore || 92}</div>
          <div class="score-full-status-label">${stageData.growthScoreLabel || "Phát triển Tối ưu"}</div>
        </div>

        <div style="text-align: center; margin-bottom: 16px;">
          <button style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-dark); color: #FFFFFF; border: none; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            📊
          </button>
        </div>

        <div class="score-history-sheet">
          <div class="score-history-header">
            <span style="font-family: var(--font-family-display); font-size: 13.5px; font-weight: 700; color: var(--color-primary-dark);">Lịch sử Điểm số</span>
            <span class="card-action-link" style="font-size: 10.5px; color: var(--color-sage-dark); font-weight:700; cursor:pointer;">Tất cả</span>
          </div>

          <div class="score-history-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="score-date-badge">
                <div class="month">TH8</div>
                <div class="day">14</div>
              </div>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">Phát triển tối ưu</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">Cân nặng 8.6kg, Ăn dặm tốt</div>
              </div>
            </div>
            <div class="score-badge-circle-right high">92</div>
          </div>

          <div class="score-history-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="score-date-badge">
                <div class="month">TH8</div>
                <div class="day">11</div>
              </div>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">Rất khỏe mạnh</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">Ngủ đủ 13.5h, vận động lẫy</div>
              </div>
            </div>
            <div class="score-badge-circle-right high">95</div>
          </div>

          <div class="score-history-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="score-date-badge">
                <div class="month">TH8</div>
                <div class="day">08</div>
              </div>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">Sốt nhẹ sau tiêm 6in1</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">Nhiệt độ 37.8°C, đã hạ sốt</div>
              </div>
            </div>
            <div class="score-badge-circle-right">75</div>
          </div>
        </div>
      </div>
    `;

    const backBtn = document.getElementById("btnBackFromScore");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        currentSubView = null;
        renderHomeTab();
      });
    }
    appendBottomSpacer();
  }

  // =========================================================================
  // 6. TAB 2: TIMELINE & JOURNAL WITH COLLAPSIBLE ORGANIC CALENDAR
  // =========================================================================
  function renderTimelineTab() {
    const state = window.store.state;

    // Calendar view state: 'collapsed' (default 7 days: -3 to +3) vs 'expanded' (full month)
    const isCollapsed = (state.calendarViewMode || "collapsed") === "collapsed";
    const selectedDate = state.selectedCalendarDate || "2025-01-28";
    const selectedDateObj = new Date(selectedDate);

    // Current month/year resolution
    const year = state.calendarYear !== undefined ? state.calendarYear : selectedDateObj.getFullYear();
    const month = state.calendarMonth !== undefined ? state.calendarMonth : selectedDateObj.getMonth();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthTitle = `${monthNames[month]} ${year}`;
    const rangeEvents = MOCK_DATA.calendarRangeEvents || [];

    // Subtab: Feed vs Mood history
    let subTabContentHtml = "";

    if (currentTimelineSubTab === "mood-history") {
      subTabContentHtml = `
        <div class="mood-history-container">
          <div class="mood-history-row-card">
            <div class="mood-date-col">
              <span class="mood-date-month">TH8</span>
              <span class="mood-date-num">14</span>
            </div>
            <div class="mood-info-col">
              <span class="mood-info-title">Overjoyed (Hào hứng)</span>
              <span class="mood-info-vitals">❤️ 96 bpm • 🫀 121 sys</span>
            </div>
            <div class="mood-face-circle overjoyed">🤩</div>
          </div>

          <div class="mood-history-row-card">
            <div class="mood-date-col">
              <span class="mood-date-month">TH8</span>
              <span class="mood-date-num">13</span>
            </div>
            <div class="mood-info-col">
              <span class="mood-info-title">Happy (Vui vẻ)</span>
              <span class="mood-info-vitals">❤️ 65 bpm • 🫀 111 sys</span>
            </div>
            <div class="mood-face-circle happy">😊</div>
          </div>

          <div class="mood-history-row-card">
            <div class="mood-date-col">
              <span class="mood-date-month">TH8</span>
              <span class="mood-date-num">12</span>
            </div>
            <div class="mood-info-col">
              <span class="mood-info-title">Neutral (Bình thường)</span>
              <span class="mood-info-vitals">❤️ 77 bpm • 🫀 115 sys</span>
            </div>
            <div class="mood-face-circle neutral">😐</div>
          </div>

          <div class="mood-history-row-card">
            <div class="mood-date-col">
              <span class="mood-date-month">TH8</span>
              <span class="mood-date-num">11</span>
            </div>
            <div class="mood-info-col">
              <span class="mood-info-title">Sad (Mọc răng)</span>
              <span class="mood-info-vitals">❤️ 99 bpm • 🫀 130 sys</span>
            </div>
            <div class="mood-face-circle sad">🙁</div>
          </div>

          <div class="mood-history-row-card">
            <div class="mood-date-col">
              <span class="mood-date-month">TH8</span>
              <span class="mood-date-num">10</span>
            </div>
            <div class="mood-info-col">
              <span class="mood-info-title">Depressed (Sau tiêm)</span>
              <span class="mood-info-vitals">❤️ 112 bpm • 🫀 140 sys</span>
            </div>
            <div class="mood-face-circle depressed">😭</div>
          </div>
        </div>
      `;
    } else {
      let calendarBodyHtml = "";

      if (isCollapsed) {
        // --- COLLAPSED MODE: 7 DAYS (-3 days, selected day, +3 days) ---
        const collapsedCells = [];
        const dayNamesShort = ["Sun", "Mo", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = -3; i <= 3; i++) {
          const d = new Date(selectedDateObj);
          d.setDate(selectedDateObj.getDate() + i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dt = String(d.getDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${dt}`;
          const dayName = dayNamesShort[d.getDay()];

          collapsedCells.push({
            dateObj: d,
            dateStr,
            dayNum: d.getDate(),
            dayName,
            isCenter: i === 0
          });
        }

        calendarBodyHtml = `
          <div class="calendar-collapsed-strip" id="calendarCollapsedStrip">
            ${collapsedCells.map((cell, colIndex) => {
              const isSelected = cell.dateStr === selectedDate;
              let activeRange = null;
              let rangeClass = "";

              for (const evt of rangeEvents) {
                if (cell.dateStr >= evt.startDate && cell.dateStr <= evt.endDate) {
                  activeRange = evt;
                  const isRangeStart = cell.dateStr === evt.startDate || colIndex === 0;
                  const isRangeEnd = cell.dateStr === evt.endDate || colIndex === 6;

                  if (isRangeStart && isRangeEnd) {
                    rangeClass = "range-single";
                  } else if (isRangeStart) {
                    rangeClass = "range-start";
                  } else if (isRangeEnd) {
                    rangeClass = "range-end";
                  } else {
                    rangeClass = "range-middle";
                  }
                  break;
                }
              }

              return `
                <div class="collapsed-date-cell ${isSelected ? "selected" : ""} ${activeRange ? "in-range" : ""}" data-date="${cell.dateStr}">
                  <span class="collapsed-weekday-label">${cell.dayName}</span>
                  <div class="collapsed-bubble-wrap">
                    ${activeRange ? `<div class="range-segment-bar ${rangeClass}"></div>` : ""}
                    <div class="date-bubble">${cell.dayNum}</div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      } else {
        // --- EXPANDED MODE: FULL MONTH GRID (35 - 42 cells) ---
        const firstDayRaw = new Date(year, month, 1).getDay(); // 0 = Sun
        const firstDayOffset = (firstDayRaw + 6) % 7; // 0 = Mon, ..., 6 = Sun
        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const cells = [];

        // Leading days from previous month
        for (let i = firstDayOffset - 1; i >= 0; i--) {
          const d = daysInPrevMonth - i;
          const prevMonthDate = new Date(year, month - 1, d);
          const y = prevMonthDate.getFullYear();
          const m = String(prevMonthDate.getMonth() + 1).padStart(2, "0");
          const dateStr = `${y}-${m}-${String(d).padStart(2, "0")}`;
          cells.push({
            dayNum: d,
            dateStr,
            isCurrentMonth: false,
            isPrevMonth: true,
            isNextMonth: false
          });
        }

        // Days of current month
        for (let d = 1; d <= daysInCurrentMonth; d++) {
          const m = String(month + 1).padStart(2, "0");
          const dateStr = `${year}-${m}-${String(d).padStart(2, "0")}`;
          cells.push({
            dayNum: d,
            dateStr,
            isCurrentMonth: true,
            isPrevMonth: false,
            isNextMonth: false
          });
        }

        // Trailing days from next month
        const remainingCells = (cells.length % 7 === 0) ? 0 : (7 - (cells.length % 7));
        const totalCellsNeeded = cells.length + remainingCells < 35 ? 35 : cells.length + remainingCells;
        const trailingCount = totalCellsNeeded - cells.length;

        for (let d = 1; d <= trailingCount; d++) {
          const nextMonthDate = new Date(year, month + 1, d);
          const y = nextMonthDate.getFullYear();
          const m = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
          const dateStr = `${y}-${m}-${String(d).padStart(2, "0")}`;
          cells.push({
            dayNum: d,
            dateStr,
            isCurrentMonth: false,
            isPrevMonth: false,
            isNextMonth: true
          });
        }

        const daysGridHtml = cells.map((cell, index) => {
          const colIndex = index % 7; // 0=Mo, ..., 6=Sun
          const isSelected = cell.dateStr === selectedDate;

          let activeRange = null;
          let rangeClass = "";

          for (const evt of rangeEvents) {
            if (cell.dateStr >= evt.startDate && cell.dateStr <= evt.endDate) {
              activeRange = evt;
              const isRangeStart = cell.dateStr === evt.startDate;
              const isRangeEnd = cell.dateStr === evt.endDate;
              const isRowStart = colIndex === 0;
              const isRowEnd = colIndex === 6;

              if (isRangeStart && isRangeEnd) {
                rangeClass = "range-single";
              } else if (isRangeStart) {
                rangeClass = "range-start";
              } else if (isRangeEnd) {
                rangeClass = "range-end";
              } else if (isRowStart) {
                rangeClass = "range-row-start";
              } else if (isRowEnd) {
                rangeClass = "range-row-end";
              } else {
                rangeClass = "range-middle";
              }
              break;
            }
          }

          const cellClasses = [
            "calendar-date-cell",
            cell.isCurrentMonth ? "current-month" : "other-month",
            activeRange ? "in-range" : "",
            isSelected ? "selected" : ""
          ].filter(Boolean).join(" ");

          return `
            <div class="${cellClasses}" data-date="${cell.dateStr}">
              ${activeRange ? `<div class="range-segment-bar ${rangeClass}"></div>` : ""}
              <div class="date-bubble">${cell.dayNum}</div>
            </div>
          `;
        }).join("");

        calendarBodyHtml = `
          <!-- Weekday Labels Row (Mo Tue Wed Thu Fri Sat Sun) -->
          <div class="calendar-weekdays-grid">
            <span class="calendar-weekday-label">Mo</span>
            <span class="calendar-weekday-label">Tue</span>
            <span class="calendar-weekday-label">Wed</span>
            <span class="calendar-weekday-label">Thu</span>
            <span class="calendar-weekday-label">Fri</span>
            <span class="calendar-weekday-label">Sat</span>
            <span class="calendar-weekday-label">Sun</span>
          </div>

          <!-- Calendar Days Grid with Bubble & Range Highlighting -->
          <div class="calendar-days-grid" id="calendarDaysGrid">
            ${daysGridHtml}
          </div>
        `;
      }

      // Active Range Event for Selected Date
      let selectedRangeBanner = "";
      const selectedRange = rangeEvents.find(evt => selectedDate >= evt.startDate && selectedDate <= evt.endDate);
      if (selectedRange) {
        selectedRangeBanner = `
          <div class="calendar-range-banner">
            <div class="calendar-range-left">
              <span class="calendar-range-icon">${selectedRange.icon || "🌱"}</span>
              <div class="calendar-range-info">
                <span class="calendar-range-badge">★ ${selectedRange.badge || "Sự kiện nổi bật"}</span>
                <span class="calendar-range-title">${selectedRange.title}</span>
                <span class="calendar-range-desc">${selectedRange.subtitle || selectedRange.note || ""}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Format Selected Date Label
      const selDay = selectedDateObj.getDate();
      const selMonth = selectedDateObj.getMonth() + 1;
      const selYear = selectedDateObj.getFullYear();
      const formattedDateLabel = `Ngày ${selDay} Tháng ${selMonth}, ${selYear}`;

      // Filter Timeline items for this selected date
      let matchingItems = state.timelineItems.filter(item => item.date === selectedDate);
      if (matchingItems.length === 0) {
        if (selectedDate === "2025-01-28" || selectedDate === "2026-08-14") {
          matchingItems = state.timelineItems.slice(0, 3);
        }
      }

      let entriesListHtml = "";
      if (matchingItems.length > 0) {
        entriesListHtml = `
          <div class="connected-timeline-stream">
            ${matchingItems.map(item => `
              <div class="timeline-stream-node">
                <div class="timeline-time-badge">${item.timeFormatted || (item.time ? item.time.split("•")[1] || item.time : "08:30")}</div>
                <div class="timeline-stream-card">
                  <div class="node-card-top-row">
                    <span class="node-card-tag-pill ${item.tagType || "milestone"}">${item.tag || "Nhật ký"}</span>
                    <span style="font-size: 10.5px; color: var(--color-text-muted); font-weight: 600;">${item.author || "Mẹ Thảo"}</span>
                  </div>

                  <div class="node-card-title">${item.title}</div>
                  <div class="node-card-body">${item.content}</div>

                  ${item.mediaUrl ? `
                    <div class="node-media-box" data-media-src="${item.mediaUrl}">
                      <img class="node-media-img" src="${item.mediaUrl}" alt="${item.title}" />
                    </div>
                  ` : ""}

                  ${item.stats && item.stats.length > 0 ? `
                    <div class="node-card-stats-row">
                      ${item.stats.map(st => `<span class="node-stat-chip">${st}</span>`).join("")}
                    </div>
                  ` : ""}

                  <div class="node-card-footer">
                    <div class="node-meta-left">
                      <span>✨ Ghi nhận AI</span>
                      <span>❤️ 98%</span>
                    </div>
                    <div class="node-meta-actions">
                      <button class="node-action-btn ${item.userLiked ? "liked" : ""}" data-like-id="${item.id}">
                        <span>${item.userLiked ? "❤️" : "🤍"}</span>
                        <span>${item.likes || 12}</span>
                      </button>
                      <button class="node-action-btn">
                        <span>💬</span>
                        <span>${item.comments || 3}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `;
      } else {
        entriesListHtml = `
          <div class="calendar-empty-day-box">
            <div class="calendar-empty-icon">📝</div>
            <div class="calendar-empty-title">Chưa có ghi chép ngày ${selDay}/${selMonth}</div>
            <div class="calendar-empty-sub">Hãy lưu lại cữ ăn, cữ ngủ hoặc những khoảnh khắc đáng yêu của bé hôm nay.</div>
            <button class="calendar-add-entry-btn" id="btnEmptyAddLog" data-date="${selectedDate}">
              <span>+ Thêm Nhật ký & Cữ sinh hoạt</span>
            </button>
          </div>
        `;
      }

      subTabContentHtml = `
        <!-- ORGANIC CALENDAR CARD (Collapsible & Expandable) -->
        <div class="organic-calendar-card">
          
          <!-- Month Header Row -->
          <div class="calendar-header-row">
            <div class="calendar-month-title">${monthTitle}</div>
            <div class="calendar-nav-group">
              <button class="calendar-view-toggle-btn" id="btnToggleCalendarMode" title="${isCollapsed ? "Xem cả tháng" : "Thu gọn 7 ngày"}">
                <span>${isCollapsed ? "Mở rộng ▾" : "Thu gọn ▴"}</span>
              </button>
              <button class="calendar-nav-btn" id="btnPrevCalendar" title="${isCollapsed ? "7 ngày trước" : "Tháng trước"}">‹</button>
              <button class="calendar-nav-btn" id="btnNextCalendar" title="${isCollapsed ? "7 ngày sau" : "Tháng sau"}">›</button>
              <button class="calendar-today-pill" id="btnQuickSwitchMonth" title="Chuyển mốc">
                ${year === 2025 && month === 0 ? "T8/2026" : "T1/2025"}
              </button>
            </div>
          </div>

          <!-- Calendar Body (7-day Collapsed Strip or Full Month Grid) -->
          ${calendarBodyHtml}

          <!-- Bottom Pull Handle -->
          <div class="calendar-expand-handle-row" id="btnHandleToggleView" title="${isCollapsed ? "Nhấn để xem cả tháng" : "Nhấn để thu gọn 7 ngày"}">
            <div class="calendar-expand-handle-pill"></div>
          </div>
        </div>

        <!-- Multi-Day Range Event Banner (if date falls in range) -->
        ${selectedRangeBanner}

        <!-- Schedule / Diary Section Header -->
        <div class="calendar-schedule-header">
          <div class="calendar-schedule-title">
            <span>📅</span>
            <span>${formattedDateLabel}</span>
          </div>
          <button class="calendar-add-entry-btn" id="btnCalendarAddEntry" data-date="${selectedDate}">
            <span>+ Viết nhật ký</span>
          </button>
        </div>

        <!-- Time Capsule Memory Flashback -->
        <div class="time-capsule-card">
          <div class="time-capsule-info">
            <span class="capsule-badge">✨ KỶ NIỆM NGÀY NÀY</span>
            <span class="capsule-title">Lần đầu Bé Bơ cất tiếng gọi "Mẹ"</span>
            <span class="capsule-desc">Khoảnh khắc xúc động cả gia đình lúc 09:15 sáng.</span>
          </div>
          <img class="capsule-thumb" src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&auto=format&fit=crop&q=80" alt="Flashback" />
        </div>

        <!-- Filter & Stream -->
        <div class="timeline-filter-row">
          <span class="timeline-filter-title">Lịch trình & Ghi chép</span>
          <span class="timeline-filter-dropdown">Tất cả cữ ∨</span>
        </div>

        ${entriesListHtml}
      `;
    }

    appContainer.innerHTML = `
      <div class="timeline-segmented-nav">
        <button class="timeline-segment-btn ${currentTimelineSubTab === "feed" ? "active" : ""}" data-subtab="feed">
          Lịch trình & Nhật ký
        </button>
        <button class="timeline-segment-btn ${currentTimelineSubTab === "mood-history" ? "active" : ""}" data-subtab="mood-history">
          Cảm xúc (Mood)
        </button>
      </div>

      ${subTabContentHtml}
    `;

    // Event Handlers for Timeline Tab
    const segmentBtns = document.querySelectorAll(".timeline-segment-btn");
    segmentBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        currentTimelineSubTab = btn.dataset.subtab;
        renderTimelineTab();
      });
    });

    // Toggle Collapsed / Expanded Mode Handlers
    const toggleModeBtn = document.getElementById("btnToggleCalendarMode");
    if (toggleModeBtn) {
      toggleModeBtn.addEventListener("click", () => {
        window.store.toggleCalendarViewMode();
        showToast(window.store.state.calendarViewMode === "expanded" ? "Đã mở rộng lịch cả tháng" : "Đã thu gọn lịch 7 ngày", "📅");
        renderTimelineTab();
      });
    }

    const handleToggleBtn = document.getElementById("btnHandleToggleView");
    if (handleToggleBtn) {
      handleToggleBtn.addEventListener("click", () => {
        window.store.toggleCalendarViewMode();
        showToast(window.store.state.calendarViewMode === "expanded" ? "Đã mở rộng lịch cả tháng" : "Đã thu gọn lịch 7 ngày", "📅");
        renderTimelineTab();
      });
    }

    // Calendar Navigation Handlers (7 days in collapsed mode, 1 month in expanded mode)
    const prevBtn = document.getElementById("btnPrevCalendar");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (isCollapsed) {
          const newDate = new Date(selectedDateObj);
          newDate.setDate(selectedDateObj.getDate() - 7);
          const y = newDate.getFullYear();
          const m = String(newDate.getMonth() + 1).padStart(2, "0");
          const d = String(newDate.getDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${d}`;
          window.store.setSelectedCalendarDate(dateStr);
          window.store.setCalendarMonth(y, newDate.getMonth());
          showToast(`Lùi 7 ngày (${d}/${m})`, "📅");
        } else {
          let newMonth = month - 1;
          let newYear = year;
          if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
          }
          window.store.setCalendarMonth(newYear, newMonth);
        }
        renderTimelineTab();
      });
    }

    const nextBtn = document.getElementById("btnNextCalendar");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (isCollapsed) {
          const newDate = new Date(selectedDateObj);
          newDate.setDate(selectedDateObj.getDate() + 7);
          const y = newDate.getFullYear();
          const m = String(newDate.getMonth() + 1).padStart(2, "0");
          const d = String(newDate.getDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${d}`;
          window.store.setSelectedCalendarDate(dateStr);
          window.store.setCalendarMonth(y, newDate.getMonth());
          showToast(`Tiến 7 ngày (${d}/${m})`, "📅");
        } else {
          let newMonth = month + 1;
          let newYear = year;
          if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
          }
          window.store.setCalendarMonth(newYear, newMonth);
        }
        renderTimelineTab();
      });
    }

    const switchMonthBtn = document.getElementById("btnQuickSwitchMonth");
    if (switchMonthBtn) {
      switchMonthBtn.addEventListener("click", () => {
        if (year === 2025 && month === 0) {
          window.store.setCalendarMonth(2026, 7); // Aug 2026
          window.store.setSelectedCalendarDate("2026-08-14");
          showToast("Đã chuyển sang Tháng 8, 2026", "📅");
        } else {
          window.store.setCalendarMonth(2025, 0); // Jan 2025
          window.store.setSelectedCalendarDate("2025-01-28");
          showToast("Đã chuyển sang Tháng 1, 2025 (Ảnh mẫu)", "📅");
        }
        renderTimelineTab();
      });
    }

    // Calendar Date Cell Click Handlers (works for both collapsed cells and month cells)
    const dateCells = document.querySelectorAll(".calendar-date-cell[data-date], .collapsed-date-cell[data-date]");
    dateCells.forEach(cell => {
      cell.addEventListener("click", () => {
        const clickedDate = cell.dataset.date;
        window.store.setSelectedCalendarDate(clickedDate);

        const clickedDateObj = new Date(clickedDate);
        if (clickedDateObj.getMonth() !== month || clickedDateObj.getFullYear() !== year) {
          window.store.setCalendarMonth(clickedDateObj.getFullYear(), clickedDateObj.getMonth());
        }

        const dateParts = clickedDate.split("-");
        showToast(`Đã chọn Ngày ${parseInt(dateParts[2], 10)} Tháng ${parseInt(dateParts[1], 10)}`, "📅");
        renderTimelineTab();
      });
    });

    // Add Entry for Selected Date Buttons
    const addEntryBtn = document.getElementById("btnCalendarAddEntry");
    if (addEntryBtn) {
      addEntryBtn.addEventListener("click", openQuickLogModal);
    }
    const emptyAddBtn = document.getElementById("btnEmptyAddLog");
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener("click", openQuickLogModal);
    }

    // Timeline Node Likes & Lightbox
    const likeBtns = document.querySelectorAll(".node-action-btn[data-like-id]");
    likeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        window.store.toggleLike(btn.dataset.likeId);
        renderTimelineTab();
      });
    });

    const mediaBoxes = document.querySelectorAll(".node-media-box");
    mediaBoxes.forEach(box => {
      box.addEventListener("click", () => {
        openLightbox(box.dataset.mediaSrc);
      });
    });

    appendBottomSpacer();
  }

  // =========================================================================
  // 7. TAB 3: REDESIGNED MOTOR MILESTONES ROADMAP & WHO PERCENTILES + INPUT
  // =========================================================================
  function renderGrowthTab() {
    const stageData = window.store.getCurrentStageData();
    const currentMetric = window.store.state.growthMetric;
    const motor = stageData.motorMilestones || {
      score: 94,
      scoreLabel: "Vận động Đạt chuẩn WHO",
      doctorNote: "Bé phát triển trương lực cơ tốt.",
      items: []
    };

    const items = motor.items || [];
    const activeItem = items.find(it => it.status === "in-progress") || items[0] || {};
    const vitals = stageData.todayVitals || { weight: "8.6 kg", height: "71.5 cm", headCirc: "44.2 cm" };
    const historyList = stageData.growthHistory || [];

    appContainer.innerHTML = `
      <!-- 1. REDESIGNED VISUAL MOTOR ROADMAP HERO CARD -->
      <div class="milestones-journey-hero-card">
        <div class="journey-top-row">
          <span class="journey-stage-badge">🌱 VẬN ĐỘNG • ${stageData.name.toUpperCase()}</span>
          <span class="journey-score-pill">${motor.score}% Chuẩn WHO</span>
        </div>

        <div class="journey-spotlight-title">
          Đang rèn luyện: ${activeItem.name ? activeItem.name.split(" ")[0] : "Bò"} 🐛
        </div>
        <div class="journey-spotlight-desc">
          ${motor.doctorNote}
        </div>

        <!-- Horizontal Connected Roadmap Trail (4 Stations) -->
        <div class="roadmap-trail-container">
          <div class="roadmap-trail-line">
            <div class="roadmap-trail-progress-fill" style="width: 70%;"></div>
          </div>

          ${items.map((step) => {
            const isDone = step.status === "completed";
            const isActive = step.status === "in-progress";

            return `
              <div class="roadmap-station-node" data-milestone-id="${step.id}">
                <div class="station-circle ${isDone ? "done" : isActive ? "active-step" : "locked"}">
                  <span>${step.icon}</span>
                  ${isDone ? `<div class="station-check-badge">✓</div>` : ""}
                </div>
                <span class="station-name-lbl">${step.name.split(" ")[0]}</span>
                <span class="station-status-text">${isDone ? "Đã đạt" : isActive ? "Đang tập" : "Sắp tới"}</span>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Action Buttons in Hero Card -->
        <div class="journey-action-bar">
          <button class="journey-btn-secondary" id="btnHeroOpenGrowthInput">
            <span>📏</span>
            <span>Nhập số đo</span>
          </button>
          <button class="journey-btn-primary" id="btnLogMilestoneGrowth">
            <span>🎉</span>
            <span>Đạt mốc</span>
          </button>
        </div>
      </div>

      <!-- 2. CURRENT GROWTH VITALS SUMMARY GRID -->
      <div class="section-title-row" style="margin-top: 4px; margin-bottom: 8px;">
        <span class="section-main-title">Chỉ Số Thể Trạng Hiện Tại</span>
        <button class="calendar-add-entry-btn" id="btnQuickAddVitals">
          <span>+ Ghi nhận mới</span>
        </button>
      </div>

      <div class="growth-vitals-grid">
        <div class="growth-vital-card" id="cardVitalWeight" title="Nhấn để cập nhật cân nặng">
          <span class="vital-card-label">⚖️ Cân nặng</span>
          <span class="vital-card-value">${vitals.weight || "8.6 kg"}</span>
          <span class="vital-card-badge">P50 Chuẩn WHO</span>
        </div>
        <div class="growth-vital-card" id="cardVitalHeight" title="Nhấn để cập nhật chiều cao">
          <span class="vital-card-label">📏 Chiều cao</span>
          <span class="vital-card-value">${vitals.height || "71.5 cm"}</span>
          <span class="vital-card-badge">P65 Tối ưu</span>
        </div>
        <div class="growth-vital-card" id="cardVitalHead" title="Nhấn để cập nhật vòng đầu">
          <span class="vital-card-label">🧢 Vòng đầu</span>
          <span class="vital-card-value">${vitals.headCirc || "44.2 cm"}</span>
          <span class="vital-card-badge">P50 Chuẩn</span>
        </div>
      </div>

      <!-- 3. WHO GROWTH PERCENTILES CHARTS CARD -->
      <div class="chart-card-container">
        <div class="card-header-row">
          <div class="card-title">
            <span>📈</span>
            <span>Đồ thị WHO (0 - 18 Tuổi)</span>
          </div>
          <button class="btn-chart-add-measurement" id="btnOpenGrowthInputChart">
            <span>+ Nhập số đo</span>
          </button>
        </div>

        <div class="chart-metric-selector-pills">
          <button class="metric-pill-choice ${currentMetric === "height" ? "active" : ""}" data-metric="height">Chiều cao</button>
          <button class="metric-pill-choice ${currentMetric === "weight" ? "active" : ""}" data-metric="weight">Cân nặng</button>
          <button class="metric-pill-choice ${currentMetric === "headCirc" ? "active" : ""}" data-metric="headCirc">Vòng đầu</button>
        </div>

        <div class="chart-canvas-wrapper">
          <canvas id="growthWhoChartCanvas"></canvas>
        </div>

        <div class="custom-chart-legend">
          <div class="legend-item">
            <div class="legend-dot child"></div>
            <span>Bé Bơ</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot p50"></div>
            <span>P50 Chuẩn</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot p97"></div>
            <span>P97 Cao</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot p3"></div>
            <span>P3 Thấp</span>
          </div>
        </div>
      </div>

      <!-- 4. MEASUREMENT HISTORY LOGS LIST -->
      <div class="growth-history-section">
        <div class="growth-history-header">
          <div class="growth-history-title">
            <span>📋</span>
            <span>Lịch Sử Cân Đo (${historyList.length} lần ghi)</span>
          </div>
          <button class="calendar-add-entry-btn" id="btnHistoryAddGrowth">
            <span>+ Thêm lần đo</span>
          </button>
        </div>

        <div class="growth-history-list">
          ${historyList.map(item => `
            <div class="growth-history-card">
              <div class="growth-history-top">
                <span class="growth-history-age">
                  <span>👶</span>
                  <span>${item.ageText}</span>
                </span>
                <span class="growth-history-date">📅 ${item.date}</span>
              </div>
              <div class="growth-history-stats-row">
                <span class="growth-stat-chip-val">⚖️ ${item.weight} kg</span>
                <span class="growth-stat-chip-val">📏 ${item.height} cm</span>
                ${item.headCirc ? `<span class="growth-stat-chip-val">🧢 ${item.headCirc} cm</span>` : ""}
                <span class="vital-card-badge" style="margin:0;">${item.percentileLabel || "Chuẩn WHO"}</span>
              </div>
              ${item.note ? `<div class="growth-history-note">💬 ${item.note}</div>` : ""}
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 5. 4-SKILL DEVELOPMENT MATRIX CARDS -->
      <div class="section-title-row" style="margin-top: 6px;">
        <span class="section-main-title">Kỹ Năng Vận Động</span>
        <span style="font-size: 10.5px; font-weight: 700; color: var(--color-sage-dark); cursor:pointer;">Đánh giá AI</span>
      </div>

      <div class="motor-skills-grid">
        <div class="skill-matrix-card">
          <div>
            <div class="skill-card-top">
              <div class="skill-icon-circle">🖐️</div>
              <div class="skill-name-title">Cầm nắm</div>
            </div>
            <div class="skill-rating-stars">★★★★★</div>
          </div>
          <span class="skill-status-tag">Thành thạo</span>
        </div>

        <div class="skill-matrix-card">
          <div>
            <div class="skill-card-top">
              <div class="skill-icon-circle">🦵</div>
              <div class="skill-name-title">Đứng vịn</div>
            </div>
            <div class="skill-rating-stars">★★★★☆</div>
          </div>
          <span class="skill-status-tag" style="background:#FEF3E2; color:#D96938;">Đang tập</span>
        </div>

        <div class="skill-matrix-card">
          <div>
            <div class="skill-card-top">
              <div class="skill-icon-circle">👁️</div>
              <div class="skill-name-title">Mắt - Tay</div>
            </div>
            <div class="skill-rating-stars">★★★★★</div>
          </div>
          <span class="skill-status-tag">Xuất sắc</span>
        </div>

        <div class="skill-matrix-card">
          <div>
            <div class="skill-card-top">
              <div class="skill-icon-circle">🗣️</div>
              <div class="skill-name-title">Giao tiếp</div>
            </div>
            <div class="skill-rating-stars">★★★★☆</div>
          </div>
          <span class="skill-status-tag">Tốt</span>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.chartManager.renderGrowthChart("growthWhoChartCanvas", stageData, currentMetric);
    }, 50);

    const metricBtns = document.querySelectorAll(".metric-pill-choice");
    metricBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        window.store.setGrowthMetric(btn.dataset.metric);
      });
    });

    const stationNodes = document.querySelectorAll(".roadmap-station-node");
    stationNodes.forEach(node => {
      node.addEventListener("click", () => {
        const mId = node.dataset.milestoneId;
        const matchedItem = items.find(it => it.id === mId);
        if (matchedItem) {
          openMilestoneDetailModal(matchedItem);
        }
      });
    });

    // Growth Input Modal Trigger Buttons
    const openInputButtons = [
      document.getElementById("btnHeroOpenGrowthInput"),
      document.getElementById("btnQuickAddVitals"),
      document.getElementById("btnOpenGrowthInputChart"),
      document.getElementById("btnHistoryAddGrowth"),
      document.getElementById("cardVitalWeight"),
      document.getElementById("cardVitalHeight"),
      document.getElementById("cardVitalHead")
    ];

    openInputButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener("click", openGrowthInputModal);
      }
    });

    const btnLogDone = document.getElementById("btnLogMilestoneGrowth");
    if (btnLogDone) {
      btnLogDone.addEventListener("click", () => {
        openMilestoneDetailModal(activeItem);
      });
    }
  }

  // =========================================================================
  // 7.1 DEDICATED GROWTH MEASUREMENT INPUT MODAL (WHO STANDARDS)
  // =========================================================================
  function openGrowthInputModal() {
    const stageData = window.store.getCurrentStageData();
    const vitals = stageData.todayVitals || {};
    const todayStr = new Date().toISOString().split("T")[0];
    const initialWeight = parseFloat(vitals.weight) || 8.6;
    const initialHeight = parseFloat(vitals.height) || 71.5;
    const initialHeadCirc = parseFloat(vitals.headCirc) || 44.2;

    const labels = (stageData.growthChart && stageData.growthChart.labels) || ["0m", "2m", "4m", "6m", "8m", "10m", "12m"];
    const currentLabelIdx = labels.length >= 5 ? 4 : labels.length - 1; // Default to 8m

    const modalHtml = `
      <div class="sheet-handle-bar"></div>
      <div class="sheet-header-row">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:24px;">📏</span>
          <div>
            <span class="sheet-title">Nhập Chỉ Số Tăng Trưởng</span>
            <div style="font-size:9.5px; color:var(--color-sage-dark); font-weight:700;">Chuẩn WHO & Đồ Thị Tăng Trưởng</div>
          </div>
        </div>
        <button class="sheet-close-btn" id="modalCloseBtn">✕</button>
      </div>

      <!-- Form Inputs -->
      <div class="growth-input-form-container">
        
        <!-- Date & Milestone Picker Row -->
        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div class="log-form-group" style="margin-bottom:0;">
            <label class="log-form-label">📅 Ngày đo:</label>
            <input type="date" class="log-input-control" id="inputGrowthDate" value="${todayStr}" />
          </div>
          <div class="log-form-group" style="margin-bottom:0;">
            <label class="log-form-label">👶 Cột mốc tháng:</label>
            <select class="log-input-control" id="selectGrowthMilestoneIdx">
              ${labels.map((lbl, idx) => `
                <option value="${idx}" ${idx === currentLabelIdx ? "selected" : ""}>Mốc ${lbl}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- 1. Weight Input with Stepper -->
        <div class="log-form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="log-form-label" style="margin:0;">⚖️ Cân nặng (kg):</label>
            <span style="font-size:10px; color:var(--color-sage-dark); font-weight:700;">WHO P50: 8.6 kg</span>
          </div>
          <div class="growth-stepper-control">
            <button type="button" class="stepper-btn" id="btnDecWeight">−</button>
            <input type="number" step="0.1" class="log-input-control" id="inputGrowthWeight" value="${initialWeight}" style="text-align:center; font-family:var(--font-family-display); font-size:18px; font-weight:800;" />
            <button type="button" class="stepper-btn" id="btnIncWeight">+</button>
          </div>
        </div>

        <!-- 2. Height Input with Stepper -->
        <div class="log-form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="log-form-label" style="margin:0;">📏 Chiều cao (cm):</label>
            <span style="font-size:10px; color:var(--color-sage-dark); font-weight:700;">WHO P50: 70.6 cm</span>
          </div>
          <div class="growth-stepper-control">
            <button type="button" class="stepper-btn" id="btnDecHeight">−</button>
            <input type="number" step="0.5" class="log-input-control" id="inputGrowthHeight" value="${initialHeight}" style="text-align:center; font-family:var(--font-family-display); font-size:18px; font-weight:800;" />
            <button type="button" class="stepper-btn" id="btnIncHeight">+</button>
          </div>
        </div>

        <!-- 3. Head Circumference Input with Stepper -->
        <div class="log-form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="log-form-label" style="margin:0;">🧢 Vòng đầu (cm):</label>
            <span style="font-size:10px; color:var(--color-sage-dark); font-weight:700;">WHO P50: 44.1 cm</span>
          </div>
          <div class="growth-stepper-control">
            <button type="button" class="stepper-btn" id="btnDecHead">−</button>
            <input type="number" step="0.2" class="log-input-control" id="inputGrowthHeadCirc" value="${initialHeadCirc}" style="text-align:center; font-family:var(--font-family-display); font-size:18px; font-weight:800;" />
            <button type="button" class="stepper-btn" id="btnIncHead">+</button>
          </div>
        </div>

        <!-- Live AI WHO Percentile Feedback Preview -->
        <div class="growth-ai-assessment-box" id="growthLiveAiFeedback">
          <span class="growth-ai-icon">💡</span>
          <div class="growth-ai-text" id="growthAiFeedbackText">
            <strong>Đánh giá nhanh WHO:</strong> Bé Bơ đạt <strong>P50</strong> cân nặng và <strong>P65</strong> chiều cao. Thể trạng phát triển cân đối và rất khỏe mạnh!
          </div>
        </div>

        <!-- Notes -->
        <div class="log-form-group">
          <label class="log-form-label">📝 Ghi chú sức khỏe / Lời dặn Bác sĩ:</label>
          <input type="text" class="log-input-control" id="inputGrowthNote" placeholder="Vd: Bé ăn dặm tốt, bú mẹ 780ml/ngày, lẫy thành thạo..." />
        </div>

        <!-- Submit Button -->
        <button class="log-btn-primary" id="btnSubmitGrowthForm">
          <span>Lưu Số Đo & Cập Nhật Biểu Đồ</span>
          <span>→</span>
        </button>
      </div>
    `;

    openModal(modalHtml);

    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Stepper Handlers
    const weightInput = document.getElementById("inputGrowthWeight");
    const heightInput = document.getElementById("inputGrowthHeight");
    const headInput = document.getElementById("inputGrowthHeadCirc");
    const feedbackText = document.getElementById("growthAiFeedbackText");

    function updateAiFeedback() {
      const w = parseFloat(weightInput.value) || 0;
      const h = parseFloat(heightInput.value) || 0;
      if (feedbackText) {
        feedbackText.innerHTML = `<strong>Đánh giá nhanh WHO:</strong> Với cân nặng <strong>${w} kg</strong> và chiều cao <strong>${h} cm</strong>, Bé Bơ nằm trong ngưỡng <strong>P50 - P65</strong> chuẩn quốc tế. Tăng trưởng thể chất tối ưu! ✨`;
      }
    }

    // Weight Steppers
    const btnIncW = document.getElementById("btnIncWeight");
    const btnDecW = document.getElementById("btnDecWeight");
    if (btnIncW) btnIncW.addEventListener("click", () => { weightInput.value = (parseFloat(weightInput.value || 0) + 0.1).toFixed(1); updateAiFeedback(); });
    if (btnDecW) btnDecW.addEventListener("click", () => { weightInput.value = Math.max(0.5, parseFloat(weightInput.value || 0) - 0.1).toFixed(1); updateAiFeedback(); });

    // Height Steppers
    const btnIncH = document.getElementById("btnIncHeight");
    const btnDecH = document.getElementById("btnDecHeight");
    if (btnIncH) btnIncH.addEventListener("click", () => { heightInput.value = (parseFloat(heightInput.value || 0) + 0.5).toFixed(1); updateAiFeedback(); });
    if (btnDecH) btnDecH.addEventListener("click", () => { heightInput.value = Math.max(10, parseFloat(heightInput.value || 0) - 0.5).toFixed(1); updateAiFeedback(); });

    // Head Steppers
    const btnIncHead = document.getElementById("btnIncHead");
    const btnDecHead = document.getElementById("btnDecHead");
    if (btnIncHead) btnIncHead.addEventListener("click", () => { headInput.value = (parseFloat(headInput.value || 0) + 0.2).toFixed(1); });
    if (btnDecHead) btnDecHead.addEventListener("click", () => { headInput.value = Math.max(10, parseFloat(headInput.value || 0) - 0.2).toFixed(1); });

    if (weightInput) weightInput.addEventListener("input", updateAiFeedback);
    if (heightInput) heightInput.addEventListener("input", updateAiFeedback);

    // Form Submit Handler
    const submitBtn = document.getElementById("btnSubmitGrowthForm");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const dateVal = document.getElementById("inputGrowthDate").value || todayStr;
        const milestoneIdx = parseInt(document.getElementById("selectGrowthMilestoneIdx").value, 10) || currentLabelIdx;
        const selectedLabel = labels[milestoneIdx] || `${milestoneIdx * 2}m`;
        const weightVal = parseFloat(weightInput.value) || initialWeight;
        const heightVal = parseFloat(heightInput.value) || initialHeight;
        const headVal = parseFloat(headInput.value) || initialHeadCirc;
        const noteVal = document.getElementById("inputGrowthNote").value || "Bé phát triển tốt theo chuẩn WHO.";

        window.store.addGrowthMeasurement({
          date: dateVal,
          ageText: `Cột mốc ${selectedLabel}`,
          labelIndex: milestoneIdx,
          weight: weightVal,
          height: heightVal,
          headCirc: headVal,
          note: noteVal
        });

        closeModal();
        showToast(`Đã lưu số đo: ${weightVal}kg • ${heightVal}cm`, "📏");
        renderGrowthTab();
      });
    }
  }

  function openMilestoneDetailModal(milestone) {
    const modalHtml = `
      <div class="sheet-handle-bar"></div>
      <div class="sheet-header-row">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:24px;">${milestone.icon || "🌟"}</span>
          <div>
            <span class="sheet-title">${milestone.name || "Cột mốc vận động"}</span>
            <div style="font-size:9.5px; color:var(--color-sage-dark); font-weight:700;">Chuẩn WHO & Viện Nhi</div>
          </div>
        </div>
        <button class="sheet-close-btn" id="modalCloseBtn">✕</button>
      </div>

      <div style="background:var(--color-canvas); border-radius:var(--radius-lg); padding:10px 12px; margin-bottom:12px; border:1px solid var(--color-border-subtle);">
        <div style="font-size:10px; color:var(--color-text-muted); margin-bottom:1px;">Độ tuổi chuẩn:</div>
        <div style="font-family:var(--font-family-display); font-size:13px; font-weight:700; color:var(--color-primary-dark);">${milestone.ageWindow || "6 - 8 tháng"}</div>
        <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px; line-height:1.4;">
          ${milestone.note || "Bé vận động tốt và phản xạ linh hoạt."}
        </div>
      </div>

      <div style="font-size:11.5px; font-weight:700; color:var(--color-primary-dark); margin-bottom:4px;">
        💡 Gợi ý bài tập từ Bác sĩ:
      </div>
      <ul style="font-size:10.5px; color:var(--color-text-secondary); line-height:1.5; padding-left:16px; margin-bottom:14px;">
        <li>Tập nằm sấp (Tummy time) 15-20 phút/ngày.</li>
        <li>Đặt đồ chơi cách tầm với 30-40cm để kích thích rướn người.</li>
        <li>Mát-xa nhẹ nhàng cơ đùi và sống lưng sau tắm ấm.</li>
      </ul>

      <button class="log-btn-primary" id="btnLogMilestoneDone">
        <span>Ghi Nhận Đã Đạt Cột Mốc 🎉</span>
        <span>→</span>
      </button>
    `;

    openModal(modalHtml);

    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const doneBtn = document.getElementById("btnLogMilestoneDone");
    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        window.store.addTimelineEntry({
          type: "milestone",
          author: MOCK_DATA.family.momName,
          authorAvatar: MOCK_DATA.family.momAvatar,
          title: `Cột mốc mới: ${milestone.name} ${milestone.icon || "🎉"}`,
          content: `Bé Bơ đã xuất sắc hoàn thành cột mốc vận động: ${milestone.name}!`,
          tag: "Cột mốc",
          tagType: "milestone"
        });
        closeModal();
        showToast(`Chúc mừng Bé đã đạt mốc!`, "🎉");
      });
    }
    appendBottomSpacer();
  }

  // =========================================================================
  // 8. TAB 4: EXPENSES & FUTURE PLANNING
  // =========================================================================
  function renderExpensesTab() {
    const stageData = window.store.getCurrentStageData();
    const exp = stageData.expenses || {
      totalMonth: "4,850,000 đ",
      budgetMonth: "6,000,000 đ",
      budgetPercent: 80,
      categories: []
    };

    appContainer.innerHTML = `
      <div class="expense-summary-hero">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div class="expense-hero-label">TỔNG CHI THÁNG NÀY</div>
            <div class="expense-hero-amount">${exp.totalMonth}</div>
          </div>
          <button id="btnQuickAddExpenseFromTab" style="background:#FFFFFF; color:var(--color-primary-dark); border:none; font-family:var(--font-family-display); font-size:10.5px; font-weight:700; padding:5px 10px; border-radius:var(--radius-pill); cursor:pointer; box-shadow:0 3px 8px rgba(0,0,0,0.18);">
            + Thêm chi
          </button>
        </div>
        
        <div class="budget-progress-box">
          <div class="budget-text-row">
            <span>Đã dùng: ${exp.budgetPercent}%</span>
            <span>Hạn mức: ${exp.budgetMonth}</span>
          </div>
          <div class="budget-bar-track">
            <div class="budget-bar-fill" style="width: ${exp.budgetPercent}%;"></div>
          </div>
        </div>
      </div>

      <div class="chart-card-container">
        <div class="card-header-row">
          <div class="card-title">
            <span>📊</span>
            <span>Danh mục Chi tiêu</span>
          </div>
        </div>

        <div class="chart-canvas-wrapper" style="height: 180px;">
          <canvas id="expenseDonutCanvas"></canvas>
        </div>

        <div class="expense-categories-list">
          ${(exp.categories || []).map(cat => `
            <div class="expense-cat-item">
              <div class="cat-item-left">
                <div class="cat-color-dot" style="background: ${cat.color};"></div>
                <span class="cat-name">${cat.name} (${cat.percent}%)</span>
              </div>
              <span class="cat-amount">${cat.amount}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="future-calc-card">
        <div class="future-calc-header">
          <span style="font-size: 18px;">🎓</span>
          <span class="future-calc-title">Quỹ Tương lai (18 Tuổi)</span>
        </div>

        <div class="slider-control-group">
          <div class="slider-label-row">
            <span>Tiết kiệm mỗi tháng:</span>
            <strong id="sliderSavingVal" style="color: var(--color-primary-dark);">3,000,000 đ</strong>
          </div>
          <input type="range" min="500000" max="20000000" step="500000" value="3000000" class="custom-range-slider" id="monthlySavingSlider" />
        </div>

        <div class="future-result-box">
          <span class="future-result-label">ƯỚC TÍNH TÍCH LŨY KHI 18 TUỔI</span>
          <div class="future-result-amount" id="futureAccumulatedVal">1,245,000,000 đ</div>
          <div style="font-size: 9.5px; color: var(--color-text-muted); margin-top: 3px;">
            *Giả định lãi kép 8.5%/năm qua quỹ đầu tư giáo dục.
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.chartManager.renderExpenseDonut("expenseDonutCanvas", stageData);
    }, 50);

    const slider = document.getElementById("monthlySavingSlider");
    const sliderValEl = document.getElementById("sliderSavingVal");
    const futureValEl = document.getElementById("futureAccumulatedVal");

    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        sliderValEl.textContent = `${val.toLocaleString("vi-VN")} đ`;
        
        const years = 18;
        const rate = 0.085 / 12;
        const n = years * 12;
        const fv = val * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
        futureValEl.textContent = `${Math.round(fv).toLocaleString("vi-VN")} đ`;
      });
    }

    const btnQuickAdd = document.getElementById("btnQuickAddExpenseFromTab");
    if (btnQuickAdd) {
      btnQuickAdd.addEventListener("click", openSmartExpenseCreatorModal);
    }
    appendBottomSpacer();
  }

  // =========================================================================
  // 9. SMART EXPENSE CREATOR MODAL (Concise Non-wrapping Buttons)
  // =========================================================================
  function openSmartExpenseCreatorModal() {
    let activeSubTab = "numpad"; // 'numpad' | 'voice' | 'recurring'
    let currentAmountStr = "380000";
    let selectedCategory = "🧷 Tã Bỉm";
    let selectedItemName = "Tã bỉm Moony Natural";

    function getCreatorModalHtml() {
      return `
        <div class="sheet-handle-bar"></div>
        <div class="sheet-header-row">
          <span class="sheet-title">Tạo Chi Tiêu Cho Bé</span>
          <button class="sheet-close-btn" id="modalCloseBtn">✕</button>
        </div>

        <!-- 3-Way Sub-Navigation Tabs -->
        <div class="expense-creator-subnav">
          <button class="expense-creator-subbtn ${activeSubTab === "numpad" ? "active" : ""}" data-subtab="numpad">
            🔢 Phím số
          </button>
          <button class="expense-creator-subbtn ${activeSubTab === "voice" ? "active" : ""}" data-subtab="voice">
            🎙️ Giọng nói
          </button>
          <button class="expense-creator-subbtn ${activeSubTab === "recurring" ? "active" : ""}" data-subtab="recurring">
            🔄 Định kỳ
          </button>
        </div>

        ${activeSubTab === "numpad" ? `
          <!-- Big Numerical Display Hero Box -->
          <div class="expense-display-hero-box">
            <div class="expense-display-cat-tag" id="expenseDisplayCatTag">
              ${selectedCategory}
            </div>
            <div class="expense-display-number" id="expenseDisplayNum">
              ${parseInt(currentAmountStr || "0", 10).toLocaleString("vi-VN")} đ
            </div>
            <div class="expense-display-note" id="expenseDisplayNote">
              Món: ${selectedItemName}
            </div>
          </div>

          <!-- 1-Tap Presets Grid (6 Most Common Parenting Expenses) -->
          <div style="font-size: 10px; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">Gợi ý 1-chạm:</div>
          <div class="expense-preset-chips-grid">
            <div class="preset-chip-btn ${selectedItemName.includes("bỉm") ? "active" : ""}" data-price="380000" data-cat="🧷 Tã Bỉm" data-name="Tã bỉm Moony">
              <span class="preset-chip-ico">🧷</span>
              <span class="preset-chip-title">Tã Bỉm</span>
              <span class="preset-chip-price">380k</span>
            </div>
            <div class="preset-chip-btn ${selectedItemName.includes("Sữa") ? "active" : ""}" data-price="450000" data-cat="🍼 Sữa" data-name="Sữa Meiji">
              <span class="preset-chip-ico">🍼</span>
              <span class="preset-chip-title">Sữa Bột</span>
              <span class="preset-chip-price">450k</span>
            </div>
            <div class="preset-chip-btn ${selectedItemName.includes("Tiêm") ? "active" : ""}" data-price="1250000" data-cat="💉 Y tế" data-name="Tiêm mũi 6in1">
              <span class="preset-chip-ico">💉</span>
              <span class="preset-chip-title">Tiêm Chủng</span>
              <span class="preset-chip-price">1.25tr</span>
            </div>
            <div class="preset-chip-btn ${selectedItemName.includes("Ăn dặm") ? "active" : ""}" data-price="180000" data-cat="🥗 Ăn dặm" data-name="Bột ăn dặm">
              <span class="preset-chip-ico">🥗</span>
              <span class="preset-chip-title">Ăn Dặm</span>
              <span class="preset-chip-price">180k</span>
            </div>
            <div class="preset-chip-btn ${selectedItemName.includes("Quần áo") ? "active" : ""}" data-price="300000" data-cat="👗 Quần áo" data-name="Bộ đồ Nous">
              <span class="preset-chip-ico">👗</span>
              <span class="preset-chip-title">Quần Áo</span>
              <span class="preset-chip-price">300k</span>
            </div>
            <div class="preset-chip-btn ${selectedItemName.includes("Đồ chơi") ? "active" : ""}" data-price="250000" data-cat="🧸 Đồ chơi" data-name="Sách & Đồ chơi">
              <span class="preset-chip-ico">🧸</span>
              <span class="preset-chip-title">Đồ Chơi</span>
              <span class="preset-chip-price">250k</span>
            </div>
          </div>

          <!-- Quick Increments Bar -->
          <div class="quick-adders-bar">
            <button class="quick-adder-btn" data-add="100000">+100k</button>
            <button class="quick-adder-btn" data-add="500000">+500k</button>
            <button class="quick-adder-btn" data-add="1000000">+1tr</button>
            <button class="quick-adder-btn" data-action="clear" style="color: #D96938;">Xóa</button>
          </div>

          <!-- Custom Round Numpad Grid -->
          <div class="numpad-container-grid">
            <button class="numpad-key-btn" data-key="1">1</button>
            <button class="numpad-key-btn" data-key="2">2</button>
            <button class="numpad-key-btn" data-key="3">3</button>
            <button class="numpad-key-btn" data-key="4">4</button>
            <button class="numpad-key-btn" data-key="5">5</button>
            <button class="numpad-key-btn" data-key="6">6</button>
            <button class="numpad-key-btn" data-key="7">7</button>
            <button class="numpad-key-btn" data-key="8">8</button>
            <button class="numpad-key-btn" data-key="9">9</button>
            <button class="numpad-key-btn" data-key="000">000</button>
            <button class="numpad-key-btn" data-key="0">0</button>
            <button class="numpad-key-btn backspace" data-key="backspace">⌫</button>
          </div>
        ` : activeSubTab === "voice" ? `
          <!-- Voice AI Expense Logging Box -->
          <div class="voice-expense-card">
            <div class="voice-mic-big-circle" id="btnRecordVoiceExpense">
              🎙️
            </div>
            <div class="voice-waveform-bars">
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
              <div class="waveform-bar"></div>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 12.5px; font-weight: 700; color: var(--color-primary-dark);">
              Chạm Micro để Nói
            </div>
            <div style="font-size: 10.5px; color: var(--color-text-muted); margin-top: 2px;">
              Vd: "Mua 2 bịch bỉm Moony 760 nghìn"
            </div>
          </div>

          <div class="voice-recognized-bubble" id="voiceRecognizedBox">
            🗣️ "Đã nhận diện: 2 bịch bỉm Moony 760,000 đ"
          </div>

          <div class="expense-display-hero-box" style="margin-top: 6px;">
            <div class="expense-display-cat-tag">🧷 Tã Bỉm</div>
            <div class="expense-display-number">760,000 đ</div>
            <div class="expense-display-note">Món: 2 bịch bỉm Moony Natural</div>
          </div>
        ` : `
          <!-- Recurring Subscriptions List -->
          <div style="font-size: 11px; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 6px;">
            Chi tiêu Định kỳ Hàng tháng
          </div>
          <div class="recurring-list-container">
            <div class="recurring-row-item">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">🏫 Học phí mầm non</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">4,500,000 đ • Ngày 05</div>
              </div>
              <div class="recurring-toggle-switch active"></div>
            </div>

            <div class="recurring-row-item">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">🛡️ Bảo hiểm sức khỏe</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">1,200,000 đ • Ngày 10</div>
              </div>
              <div class="recurring-toggle-switch active"></div>
            </div>

            <div class="recurring-row-item">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">🏊 Lớp bơi thủy liệu</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">800,000 đ • Ngày 15</div>
              </div>
              <div class="recurring-toggle-switch active"></div>
            </div>
          </div>
        `}

        <button class="log-btn-primary" id="btnConfirmSaveExpense">
          <span>Lưu Khoản Chi</span>
          <span>→</span>
        </button>
      `;
    }

    function renderModal() {
      openModal(getCreatorModalHtml());
      attachModalEvents();
    }

    function attachModalEvents() {
      const closeBtn = document.getElementById("modalCloseBtn");
      if (closeBtn) closeBtn.addEventListener("click", closeModal);

      const subBtns = document.querySelectorAll(".expense-creator-subbtn");
      subBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          activeSubTab = btn.dataset.subtab;
          renderModal();
        });
      });

      const presetBtns = document.querySelectorAll(".preset-chip-btn");
      presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          currentAmountStr = btn.dataset.price;
          selectedCategory = btn.dataset.cat;
          selectedItemName = btn.dataset.name;
          renderModal();
        });
      });

      const adderBtns = document.querySelectorAll(".quick-adder-btn");
      adderBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          if (btn.dataset.action === "clear") {
            currentAmountStr = "0";
          } else if (btn.dataset.add) {
            const addVal = parseInt(btn.dataset.add, 10);
            const cur = parseInt(currentAmountStr || "0", 10);
            currentAmountStr = String(cur + addVal);
          }
          const numEl = document.getElementById("expenseDisplayNum");
          if (numEl) {
            numEl.textContent = `${parseInt(currentAmountStr || "0", 10).toLocaleString("vi-VN")} đ`;
          }
        });
      });

      const numpadKeys = document.querySelectorAll(".numpad-key-btn");
      numpadKeys.forEach(btn => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.key;
          if (key === "backspace") {
            currentAmountStr = currentAmountStr.slice(0, -1);
            if (!currentAmountStr) currentAmountStr = "0";
          } else if (key === "000") {
            if (currentAmountStr !== "0") currentAmountStr += "000";
          } else {
            if (currentAmountStr === "0") currentAmountStr = key;
            else currentAmountStr += key;
          }
          const numEl = document.getElementById("expenseDisplayNum");
          if (numEl) {
            numEl.textContent = `${parseInt(currentAmountStr || "0", 10).toLocaleString("vi-VN")} đ`;
          }
        });
      });

      const voiceMic = document.getElementById("btnRecordVoiceExpense");
      if (voiceMic) {
        voiceMic.addEventListener("click", () => {
          showToast("Đang lắng nghe...", "🎙️");
          const recognizedBox = document.getElementById("voiceRecognizedBox");
          if (recognizedBox) {
            recognizedBox.innerHTML = `🗣️ <em>"Đã nhận: Tiêm 6in1 dịch vụ 1,250,000 đ"</em>`;
          }
        });
      }

      const toggles = document.querySelectorAll(".recurring-toggle-switch");
      toggles.forEach(t => {
        t.addEventListener("click", () => {
          t.classList.toggle("active");
          showToast("Cập nhật chi định kỳ!", "🔄");
        });
      });

      const saveBtn = document.getElementById("btnConfirmSaveExpense");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => {
          const finalAmt = parseInt(currentAmountStr || "380000", 10);
          window.store.addTimelineEntry({
            type: "expense",
            author: MOCK_DATA.family.momName,
            authorAvatar: MOCK_DATA.family.momAvatar,
            title: `Chi: ${selectedItemName} (-${finalAmt.toLocaleString("vi-VN")} đ)`,
            content: `Ghi nhận chi danh mục ${selectedCategory}.`,
            stats: [`-${finalAmt.toLocaleString("vi-VN")} đ`, selectedCategory],
            tag: "Chi tiêu",
            tagType: "expense"
          });
          closeModal();
          showToast(`Đã lưu chi: ${finalAmt.toLocaleString("vi-VN")} đ`, "💰");
        });
      }
    }

    renderModal();
  }

  // =========================================================================
  // 10. AI CHAT DOCTOR MODAL (Floating & Header Triggered)
  // =========================================================================
  function openAiChatModal() {
    const state = window.store.state;
    const aiKnowledge = MOCK_DATA.aiChatKnowledge;

    const chatModalHtml = `
      <div class="sheet-handle-bar"></div>
      <div class="ai-chat-header" style="border-radius: var(--radius-lg); margin-bottom: 8px;">
        <div class="ai-doc-info">
          <div class="ai-doc-avatar">🩺</div>
          <div class="ai-doc-name-col">
            <span class="ai-doc-name">${aiKnowledge.doctorName}</span>
            <span class="ai-doc-status">● Trực tuyến 24/7 (AI Nhi)</span>
          </div>
        </div>
        <button class="sheet-close-btn" id="modalCloseBtn" style="color: #FFFFFF; background: rgba(255,255,255,0.2);">✕</button>
      </div>

      <div class="ai-chat-messages-container" id="aiChatMessagesBox" style="height: 300px; max-height: 46vh;">
        ${state.chatMessages.map(msg => `
          <div class="chat-bubble ${msg.sender}">
            ${msg.text.replace(/\n/g, "<br>")}
            <div style="font-size: 8px; opacity: 0.7; margin-top: 3px; text-align: right;">${msg.time}</div>
          </div>
        `).join("")}
      </div>

      <div class="ai-suggestions-tray" style="margin: 6px 0; border-radius: var(--radius-md);">
        ${aiKnowledge.suggestedQuestions.map(q => `
          <div class="suggestion-pill-chip" data-question="${q}">${q}</div>
        `).join("")}
      </div>

      <div class="ai-chat-input-bar" style="border-radius: var(--radius-pill); border: 1px solid var(--color-border-subtle);">
        <input type="text" class="chat-input-field" id="chatInputField" placeholder="Hỏi sốt, ăn dặm, tâm lý..." />
        <button class="chat-send-btn" id="btnChatSend">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;

    openModal(chatModalHtml);

    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const chatBox = document.getElementById("aiChatMessagesBox");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

    const sendBtn = document.getElementById("btnChatSend");
    const inputField = document.getElementById("chatInputField");

    function handleSend(userText) {
      const text = userText || inputField.value.trim();
      if (!text) return;

      window.store.addChatMessage("user", text);
      if (inputField) inputField.value = "";

      const updatedMessages = window.store.state.chatMessages;
      if (chatBox) {
        chatBox.innerHTML = updatedMessages.map(msg => `
          <div class="chat-bubble ${msg.sender}">
            ${msg.text.replace(/\n/g, "<br>")}
            <div style="font-size: 8px; opacity: 0.7; margin-top: 3px; text-align: right;">${msg.time}</div>
          </div>
        `).join("");
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      setTimeout(() => {
        let reply = "Cảm ơn Ba/Mẹ! Theo phác đồ Nhi khoa chuẩn: Hãy theo dõi nhiệt độ và cho bé uống đủ nước. Nếu triệu chứng kéo dài trên 48h, mẹ đưa bé đi khám trực tiếp nhé!";
        
        const lower = text.toLowerCase();
        if (lower.includes("sốt") || lower.includes("tiêm")) {
          reply = aiKnowledge.mockReplies.sot;
        } else if (lower.includes("ăn dặm") || lower.includes("sắt") || lower.includes("thực đơn")) {
          reply = aiKnowledge.mockReplies.an_dam;
        } else if (lower.includes("ngủ") || lower.includes("đêm")) {
          reply = aiKnowledge.mockReplies.ngu;
        } else if (lower.includes("chiều cao") || lower.includes("dậy thì")) {
          reply = aiKnowledge.mockReplies.chieu_cao;
        }

        window.store.addChatMessage("ai", reply);

        const refreshedMessages = window.store.state.chatMessages;
        if (chatBox) {
          chatBox.innerHTML = refreshedMessages.map(msg => `
            <div class="chat-bubble ${msg.sender}">
              ${msg.text.replace(/\n/g, "<br>")}
              <div style="font-size: 8px; opacity: 0.7; margin-top: 3px; text-align: right;">${msg.time}</div>
            </div>
          `).join("");
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      }, 600);
    }

    if (sendBtn) sendBtn.addEventListener("click", () => handleSend());
    if (inputField) {
      inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend();
      });
    }

    const chipBtns = document.querySelectorAll(".suggestion-pill-chip");
    chipBtns.forEach(chip => {
      chip.addEventListener("click", () => {
        handleSend(chip.dataset.question);
      });
    });
  }

  // =========================================================================
  // 11. QUICK LOG BOTTOM SHEET MODAL (FAB HANDLER)
  // =========================================================================
  function openQuickLogModal() {
    const isMom = window.store.state.profileMode === "mom";

    const modalHtml = `
      <div class="sheet-handle-bar"></div>
      <div class="sheet-header-row">
        <span class="sheet-title">Ghi Nhanh ${isMom ? "(Mẹ)" : "(Bé)"}</span>
        <button class="sheet-close-btn" id="modalCloseBtn">✕</button>
      </div>

      <div class="quick-log-actions-grid">
        ${isMom ? `
          <div class="quick-action-item" data-action-type="pumping">
            <div class="action-icon-circle">🥛</div>
            <span class="action-item-label">Hút sữa</span>
          </div>
          <div class="quick-action-item" data-action-type="sleep">
            <div class="action-icon-circle">🌙</div>
            <span class="action-item-label">Giấc ngủ</span>
          </div>
          <div class="quick-action-item" data-action-type="mood">
            <div class="action-icon-circle">🧘‍♀️</div>
            <span class="action-item-label">Tâm lý</span>
          </div>
        ` : `
          <div class="quick-action-item" data-action-type="feeding">
            <div class="action-icon-circle">🍼</div>
            <span class="action-item-label">Cữ bú</span>
          </div>
          <div class="quick-action-item" data-action-type="diaper">
            <div class="action-icon-circle">🧷</div>
            <span class="action-item-label">Thay tã</span>
          </div>
          <div class="quick-action-item" data-action-type="sleep">
            <div class="action-icon-circle">🌙</div>
            <span class="action-item-label">Giấc ngủ</span>
          </div>
          <div class="quick-action-item" data-action-type="growth">
            <div class="action-icon-circle">📏</div>
            <span class="action-item-label">Cân đo</span>
          </div>
          <div class="quick-action-item" data-action-type="smart-expense">
            <div class="action-icon-circle">💰</div>
            <span class="action-item-label">Chi tiêu</span>
          </div>
          <div class="quick-action-item" data-action-type="moment">
            <div class="action-icon-circle">📸</div>
            <span class="action-item-label">Khoảnh khắc</span>
          </div>
        `}
      </div>

      <div id="quickLogSubFormContainer" style="margin-top: 8px;">
        <div style="text-align: center; color: var(--color-text-muted); font-size: 11px;">
          Chọn một mục phía trên để ghi chép
        </div>
      </div>
    `;

    openModal(modalHtml);

    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const actionItems = document.querySelectorAll(".quick-action-item");
    actionItems.forEach(item => {
      item.addEventListener("click", () => {
        if (item.dataset.actionType === "smart-expense") {
          openSmartExpenseCreatorModal();
        } else {
          renderSubForm(item.dataset.actionType);
        }
      });
    });
  }

  function renderSubForm(actionType) {
    const subContainer = document.getElementById("quickLogSubFormContainer");
    if (!subContainer) return;

    if (actionType === "feeding") {
      subContainer.innerHTML = `
        <div class="log-form-group">
          <label class="log-form-label">Lượng sữa / Thức ăn (ml/g):</label>
          <input type="number" class="log-input-control" id="inputFeedAmount" value="160" />
        </div>
        <div class="log-form-group">
          <label class="log-form-label">Loại cữ:</label>
          <select class="log-input-control" id="selectFeedType">
            <option value="Sữa mẹ bình">Sữa mẹ bình</option>
            <option value="Bú trực tiếp">Bú trực tiếp</option>
            <option value="Sữa công thức">Sữa công thức</option>
            <option value="Ăn dặm BLW">Ăn dặm BLW</option>
          </select>
        </div>
        <button class="log-btn-primary" id="btnSubmitLog">
          <span>Lưu Cữ Bú</span>
          <span>→</span>
        </button>
      `;
    } else if (actionType === "growth") {
      subContainer.innerHTML = `
        <div class="log-form-group">
          <label class="log-form-label">Cân nặng (kg):</label>
          <input type="number" step="0.1" class="log-input-control" id="inputWeight" value="8.8" />
        </div>
        <div class="log-form-group">
          <label class="log-form-label">Chiều cao (cm):</label>
          <input type="number" step="0.5" class="log-input-control" id="inputHeight" value="72.0" />
        </div>
        <button class="log-btn-primary" id="btnSubmitLog">
          <span>Cập nhật Tăng trưởng</span>
          <span>→</span>
        </button>
      `;
    } else if (actionType === "pumping") {
      subContainer.innerHTML = `
        <div class="log-form-group">
          <label class="log-form-label">Lượng sữa hút (ml):</label>
          <input type="number" class="log-input-control" id="inputPumpAmount" value="180" />
        </div>
        <div class="log-form-group">
          <label class="log-form-label">Bên hút:</label>
          <select class="log-input-control" id="selectPumpSide">
            <option value="2 bên">2 bên</option>
            <option value="Trái">Trái</option>
            <option value="Phải">Phải</option>
          </select>
        </div>
        <button class="log-btn-primary" id="btnSubmitLog">
          <span>Lưu Cữ Hút Sữa</span>
          <span>→</span>
        </button>
      `;
    } else if (actionType === "moment") {
      subContainer.innerHTML = `
        <div class="log-form-group">
          <label class="log-form-label">Tiêu đề:</label>
          <input type="text" class="log-input-control" id="inputMomentTitle" placeholder="Vd: Bé biết thơm má mẹ..." />
        </div>
        <div class="log-form-group">
          <label class="log-form-label">Chi tiết:</label>
          <textarea class="log-input-control" id="inputMomentDesc" style="height: 54px; padding: 6px 10px;" placeholder="Cảm xúc đáng yêu của con..."></textarea>
        </div>
        <button class="log-btn-primary" id="btnSubmitLog">
          <span>Đăng Nhật Ký</span>
          <span>→</span>
        </button>
      `;
    } else {
      subContainer.innerHTML = `
        <div class="log-form-group">
          <label class="log-form-label">Ghi chú:</label>
          <input type="text" class="log-input-control" id="inputGeneralNote" placeholder="Nội dung..." />
        </div>
        <button class="log-btn-primary" id="btnSubmitLog">
          <span>Lưu Ghi Chép</span>
          <span>→</span>
        </button>
      `;
    }

    const submitBtn = document.getElementById("btnSubmitLog");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const activeDate = window.store.state.selectedCalendarDate || "2025-01-28";
        const dateObj = new Date(activeDate);
        const dayLabel = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
        const timeNow = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

        if (actionType === "pumping") {
          const amt = document.getElementById("inputPumpAmount").value;
          const side = document.getElementById("selectPumpSide").value;
          window.store.addPumpingSession(amt, side);
        } else if (actionType === "growth") {
          const w = parseFloat(document.getElementById("inputWeight").value) || 8.8;
          const h = parseFloat(document.getElementById("inputHeight").value) || 72.0;
          window.store.addGrowthMeasurement({
            date: activeDate,
            weight: w,
            height: h,
            headCirc: 44.2,
            note: "Cập nhật nhanh qua thanh công cụ."
          });
        } else if (actionType === "moment") {
          const title = document.getElementById("inputMomentTitle").value || "Khoảnh khắc của bé";
          const desc = document.getElementById("inputMomentDesc").value || "Hôm nay con rất ngoan.";
          window.store.addTimelineEntry({
            type: "moment",
            date: activeDate,
            timeFormatted: timeNow,
            time: `${dayLabel} • ${timeNow}`,
            author: MOCK_DATA.family.momName,
            authorAvatar: MOCK_DATA.family.momAvatar,
            title: title + " 💖",
            content: desc,
            mediaUrl: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&auto=format&fit=crop&q=80",
            tag: "Khoảnh khắc",
            tagType: "moment"
          });
        } else {
          window.store.addTimelineEntry({
            type: "moment",
            date: activeDate,
            timeFormatted: timeNow,
            time: `${dayLabel} • ${timeNow}`,
            author: MOCK_DATA.family.momName,
            authorAvatar: MOCK_DATA.family.momAvatar,
            title: "Ghi chép: " + actionType,
            content: "Đã ghi nhận dữ liệu cữ sinh hoạt ngày " + dayLabel,
            tag: "Ghi chép",
            tagType: "moment"
          });
        }

        closeModal();
        showToast(`Đã lưu vào ngày ${dayLabel}!`, "🌿");
        if (window.store.state.currentTab === "timeline") {
          renderTimelineTab();
        }
      });
    }
  }

  // Helper to ensure bottom-safe-spacer is always appended to DOM
  function appendBottomSpacer() {
    if (!appContainer.querySelector(".bottom-safe-spacer")) {
      const spacer = document.createElement("div");
      spacer.className = "bottom-safe-spacer";
      appContainer.appendChild(spacer);
    }
  }

  // =========================================================================
  // 12. MAIN ROUTING & REACTIVE SUBSCRIPTION
  // =========================================================================
  function renderCurrentView() {
    renderHeader();
    const tab = window.store.state.currentTab;

    const navItems = document.querySelectorAll(".nav-tab-item");
    navItems.forEach(item => {
      if (item.dataset.tab === tab) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (tab === "home") renderHomeTab();
    else if (tab === "timeline") renderTimelineTab();
    else if (tab === "growth") renderGrowthTab();
    else if (tab === "expenses") renderExpensesTab();

    appendBottomSpacer();
  }

  window.store.subscribe((state, changedKey) => {
    if (changedKey === "currentTab") {
      currentSubView = null;
    }
    renderCurrentView();
  });

  const navTabs = document.querySelectorAll(".nav-tab-item");
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      currentSubView = null;
      window.store.setTab(tab.dataset.tab);
    });
  });

  const fabCenterBtn = document.getElementById("fabCenterBtn");
  if (fabCenterBtn) {
    fabCenterBtn.addEventListener("click", openQuickLogModal);
  }

  // Initial render
  renderCurrentView();
});
