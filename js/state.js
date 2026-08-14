/**
 * State Management Module
 * Baby & Child Growth Tracker (0 - 18 Years)
 * Reactive global store with event emitters
 */

class AppState {
  constructor() {
    const rawFeed = (typeof MOCK_DATA !== "undefined" && (MOCK_DATA.timelineEntries || MOCK_DATA.timelineFeed)) || [];
    const momInitial = (typeof MOCK_DATA !== "undefined" && MOCK_DATA.momData) ? { ...MOCK_DATA.momData } : {};

    this.state = {
      currentStage: "stage_0_1", // "stage_0_1" | "stage_1_5" | "stage_6_12" | "stage_13_18"
      profileMode: "baby", // "baby" | "mom"
      currentTab: "home", // "home" | "timeline" | "growth" | "expenses"
      growthMetric: "height", // "height" | "weight" | "headCirc"
      timelineItems: [...rawFeed],
      selectedCalendarDate: "2025-01-28", // Matches the screenshot's active day
      calendarYear: 2025,
      calendarMonth: 0, // 0 = January
      calendarViewMode: "collapsed", // "collapsed" (default 7 days: -3 to +3) | "expanded" (full month)
      chatMessages: [
        {
          id: "m_init_1",
          sender: "ai",
          text: "Xin chào Mẹ Thảo! Tôi là Bác sĩ Freud AI (Chuyên khoa Nhi & Sản phụ khoa). Hôm nay Bé Bơ ăn ngủ thế nào? Tôi có thể hỗ trợ gì cho gia đình mình?",
          time: "09:00"
        }
      ],
      previewMode: "phone" // "phone" | "fullscreen"
    };

    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
  }

  // Notify all subscribers
  notify(changedKey) {
    this.listeners.forEach(fn => fn(this.state, changedKey));
  }

  // Get current active stage data
  getCurrentStageData() {
    if (typeof MOCK_DATA === "undefined" || !MOCK_DATA.stages) return {};
    return MOCK_DATA.stages[this.state.currentStage] || MOCK_DATA.stages["stage_0_1"] || {};
  }

  // Set Stage (0-12m, 1-5y, 6-12y, 13-18y)
  setStage(stageId) {
    if (this.state.currentStage === stageId) return;
    this.state.currentStage = stageId;
    this.notify("currentStage");
  }

  // Set Profile Mode (Baby vs Mom)
  setProfileMode(mode) {
    if (this.state.profileMode === mode) return;
    this.state.profileMode = mode;
    this.notify("profileMode");
  }

  // Set Current Tab Navigation
  setTab(tabId) {
    if (this.state.currentTab === tabId) return;
    this.state.currentTab = tabId;
    this.notify("currentTab");
  }

  // Set Growth Metric (Height vs Weight vs Head Circumference)
  setGrowthMetric(metric) {
    if (this.state.growthMetric === metric) return;
    this.state.growthMetric = metric;
    this.notify("growthMetric");
  }

  // Set Timeline Filter
  setTimelineFilter(filter) {
    this.state.timelineFilter = filter;
    this.notify("timelineFilter");
  }

  // Set Current Mood
  setMood(mood) {
    this.state.currentMood = mood;
    this.notify("currentMood");
  }

  // Set Desktop Preview Mode (Phone Frame vs Fullscreen)
  setPreviewMode(mode) {
    this.state.previewMode = mode;
    this.notify("previewMode");
  }

  // Set Calendar Month & Year
  setCalendarMonth(year, month) {
    this.state.calendarYear = year;
    this.state.calendarMonth = month;
    this.notify("calendarMonth");
  }

  // Set Selected Calendar Date (YYYY-MM-DD)
  setSelectedCalendarDate(dateStr) {
    this.state.selectedCalendarDate = dateStr;
    this.notify("selectedCalendarDate");
  }

  // Set Calendar View Mode ('collapsed' | 'expanded')
  setCalendarViewMode(mode) {
    this.state.calendarViewMode = mode;
    this.notify("calendarViewMode");
  }

  // Toggle Calendar View Mode
  toggleCalendarViewMode() {
    this.state.calendarViewMode = this.state.calendarViewMode === "collapsed" ? "expanded" : "collapsed";
    this.notify("calendarViewMode");
  }

  // Add a new timeline post / quick action record
  addTimelineEntry(entry) {
    const newEntry = {
      id: "tl_" + Date.now(),
      stage: this.state.currentStage,
      time: "Vừa xong, hôm nay",
      likes: 1,
      comments: 0,
      userLiked: true,
      ...entry
    };
    this.state.timelineItems.unshift(newEntry);
    this.notify("timelineItems");
  }

  // Toggle Like on Timeline
  toggleLike(entryId) {
    const item = this.state.timelineItems.find(i => i.id === entryId);
    if (item) {
      item.userLiked = !item.userLiked;
      item.likes += item.userLiked ? 1 : -1;
      this.notify("timelineItems");
    }
  }

  // Add a chat message
  addChatMessage(sender, text) {
    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    this.state.chatMessages.push({
      id: "msg_" + Date.now(),
      sender,
      text,
      time: nowTime
    });
    this.notify("chatMessages");
  }

  // Record New Growth Measurement (Weight, Height, Head Circumference)
  addGrowthMeasurement(measurement) {
    const stageData = this.getCurrentStageData();
    const weightNum = parseFloat(measurement.weight) || 0;
    const heightNum = parseFloat(measurement.height) || 0;
    const headCircNum = parseFloat(measurement.headCirc) || 0;
    const dateStr = measurement.date || new Date().toISOString().split("T")[0];
    const ageLabel = measurement.ageText || stageData.currentAgeText || "8 tháng";
    const note = measurement.note || "Bé phát triển khỏe mạnh theo chuẩn WHO.";

    // 1. Update Today Vitals
    if (stageData.todayVitals) {
      if (weightNum > 0) stageData.todayVitals.weight = `${weightNum} kg`;
      if (heightNum > 0) stageData.todayVitals.height = `${heightNum} cm`;
      if (headCircNum > 0) stageData.todayVitals.headCirc = `${headCircNum} cm`;
    }

    // 2. Update WHO Growth Chart Series
    if (stageData.growthChart && stageData.growthChart.labels) {
      const idx = measurement.labelIndex !== undefined ? measurement.labelIndex : (stageData.growthChart.labels.length - 3);
      if (idx >= 0 && idx < stageData.growthChart.labels.length) {
        if (heightNum > 0 && stageData.growthChart.height) stageData.growthChart.height.child[idx] = heightNum;
        if (weightNum > 0 && stageData.growthChart.weight) stageData.growthChart.weight.child[idx] = weightNum;
        if (headCircNum > 0 && stageData.growthChart.headCirc) stageData.growthChart.headCirc.child[idx] = headCircNum;
      }
    }

    // 3. Add to Growth History Logs
    if (!Array.isArray(stageData.growthHistory)) {
      stageData.growthHistory = [];
    }

    const newRecord = {
      id: "gh_" + Date.now(),
      date: dateStr,
      ageText: ageLabel,
      weight: weightNum,
      height: heightNum,
      headCirc: headCircNum,
      percentileLabel: "P50 - P65 (Chuẩn WHO Tối ưu)",
      status: "optimal",
      note: note
    };
    stageData.growthHistory.unshift(newRecord);

    // 4. Add to Timeline Feed
    const dateParts = dateStr.split("-");
    const formattedDay = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;
    const timeNow = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    this.addTimelineEntry({
      type: "growth",
      date: dateStr,
      timeFormatted: timeNow,
      time: `${formattedDay} • ${timeNow}`,
      author: MOCK_DATA.family.momName,
      authorAvatar: MOCK_DATA.family.momAvatar,
      title: `Cập nhật số đo mới: ${weightNum}kg • ${heightNum}cm 📏`,
      content: `Bé Bơ vừa được ba mẹ đo chỉ số phát triển: Cân nặng ${weightNum}kg, Chiều cao ${heightNum}cm, Vòng đầu ${headCircNum}cm. ${note}`,
      stats: [`${weightNum} kg`, `${heightNum} cm`, `Vòng đầu: ${headCircNum} cm`],
      tag: "Cân đo WHO",
      tagType: "milestone"
    });

    this.notify("growthData");
  }

  // Record Mother Pumping session
  addPumpingSession(amountMl, side = "2 bên") {
    const num = parseInt(amountMl, 10) || 0;
    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    
    if (!this.state.momData.pumping) {
      this.state.momData.pumping = { todayTotal: "0 ml", sessionsToday: 0, history: [] };
    }
    if (!Array.isArray(this.state.momData.pumping.history)) {
      this.state.momData.pumping.history = [];
    }

    this.state.momData.pumping.lastSession = `${num} ml`;
    this.state.momData.pumping.time = `Lúc ${nowTime} (${side})`;
    const currentTotal = parseInt(this.state.momData.pumping.todayTotal, 10) || 0;
    this.state.momData.pumping.todayTotal = `${currentTotal + num} ml`;
    this.state.momData.pumping.sessionsToday += 1;
    this.state.momData.pumping.history.unshift({
      time: nowTime,
      amount: `${num} ml`,
      note: `Hút bên: ${side}`
    });

    // Add to timeline
    this.addTimelineEntry({
      type: "mom",
      author: MOCK_DATA.family.momName,
      authorAvatar: MOCK_DATA.family.momAvatar,
      time: nowTime,
      title: `Cữ hút sữa mới: +${num} ml (${side}) 🥛`,
      content: `Vừa hoàn thành cữ hút sữa lúc ${nowTime}. Tổng lượng sữa mẹ hôm nay đạt ${this.state.momData.pumping.todayTotal}!`,
      mediaUrl: null,
      mediaType: null,
      tag: "Sữa Mẹ",
      tagType: "mom",
      stats: [`+${num} ml`, `Tổng ${this.state.momData.pumping.todayTotal}`]
    });

    this.notify("momData");
  }
}

// Global App State Instance
window.store = new AppState();
