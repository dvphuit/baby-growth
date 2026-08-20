import type {
  FamilyData,
  StageData,
  MomData,
  CalendarRangeEvent,
  TimelineItem,
  DailyHabit,
} from '../types';

export const FAMILY_DATA: FamilyData = {
  isInitialized: false,
  childName: '',
  childFullName: '',
  birthDate: '',
  birthTime: '08:30',
  gender: 'boy',
  bloodType: 'O+',
  childAvatar: '/assets/avatars/baby_avatar.jpg',
  momName: '',
  momAvatar: '/assets/avatars/mom_avatar.jpg',
  birthWeight: '',
  birthHeight: '',
  headCircAtBirth: '',
  hospital: '',
  insuranceCode: '',
  allergies: [],
  notes: '',
};

export const INITIAL_STAGES: Record<string, StageData> = {
  stage_0_1: {
    id: 'stage_0_1',
    name: 'Sơ sinh & Nhũ nhi',
    ageRange: '0 - 12 Tháng',
    currentAgeText: '',
    growthScore: 0,
    growthScoreLabel: 'Đang theo dõi',
    wellnessCategory: 'Normal',
    todayVitals: {
      weight: '', height: '', headCirc: '', temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, mood: '', moodEmoji: '',
    },
    growthChart: {
      labels: ['0m', '2m', '4m', '6m', '8m', '10m', '12m'],
      height: {
        child: [null, null, null, null, null, null, null],
        whoP50: [49.9, 58.4, 63.9, 67.6, 70.6, 73.3, 75.7],
        whoP97: [53.4, 62.2, 68.0, 71.9, 75.0, 77.9, 80.5],
        whoP3: [46.3, 54.7, 59.9, 63.3, 66.2, 68.7, 71.0],
      },
      weight: {
        child: [null, null, null, null, null, null, null],
        whoP50: [3.3, 5.6, 7.0, 7.9, 8.6, 9.2, 9.6],
        whoP97: [4.3, 7.1, 8.7, 9.8, 10.5, 11.2, 11.8],
        whoP3: [2.5, 4.4, 5.6, 6.4, 7.0, 7.5, 7.9],
      },
      headCirc: {
        child: [null, null, null, null, null, null, null],
        whoP50: [34.5, 38.3, 41.0, 42.8, 44.1, 45.1, 45.9],
        whoP97: [36.7, 40.5, 43.2, 45.0, 46.3, 47.3, 48.1],
        whoP3: [32.2, 36.1, 38.8, 40.6, 41.9, 42.8, 43.6],
      },
    },
    growthHistory: [],
    motorMilestones: {
      score: 0,
      scoreLabel: 'Theo dõi cột mốc',
      doctorNote: '',
      items: [
        { id: 'roll', name: 'Lẫy & Lật người (Rolling)', ageWindow: '3 - 5 tháng', icon: '🔄', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Bé tự lật sấp và ngẩng cao đầu 90 độ vững vàng.' },
        { id: 'sit', name: 'Ngồi vững không tựa (Sitting)', ageWindow: '6 - 8 tháng', icon: '🧘', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Ngồi chơi đồ chơi vững 10-15 phút không cần gối đỡ.' },
        { id: 'crawl', name: 'Bò trườn & Khám phá (Crawling)', ageWindow: '7 - 10 tháng', icon: '🐛', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Bé biết nhổm mông và đẩy người tiến lên phía trước.' },
        { id: 'stand_walk', name: 'Đứng vịn & Chập chững đi (Walking)', ageWindow: '9 - 14 tháng', icon: '🚶', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Mục tiêu quan trọng cột mốc 1 tuổi.' },
      ],
    },
    expenses: { totalMonth: '0 đ', budgetMonth: '0 đ', budgetPercent: 0, categories: [], monthlyHistory: [] },
  },
  stage_1_5: {
    id: 'stage_1_5',
    name: 'Mầm non & Khám phá',
    ageRange: '1 - 5 Tuổi',
    currentAgeText: '',
    growthScore: 0,
    growthScoreLabel: 'Đang theo dõi',
    wellnessCategory: 'Normal',
    todayVitals: {
      weight: '', height: '', headCirc: '', temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, mood: '', moodEmoji: '',
    },
    growthChart: {
      labels: ['1y', '2y', '3y', '4y', '5y'],
      height: { child: [null, null, null, null, null], whoP50: [75.7, 87.1, 96.1, 103.3, 110.0], whoP97: [80.5, 92.5, 102.1, 109.8, 117.0], whoP3: [71.0, 81.7, 90.1, 96.8, 103.0] },
      weight: { child: [null, null, null, null, null], whoP50: [9.6, 12.2, 14.3, 16.3, 18.3], whoP97: [11.8, 14.9, 17.6, 20.3, 23.1], whoP3: [7.9, 9.9, 11.5, 12.9, 14.4] },
      headCirc: { child: [null, null, null, null, null], whoP50: [45.9, 48.0, 49.2, 50.1, 50.7], whoP97: [48.1, 50.2, 51.5, 52.4, 53.1], whoP3: [43.6, 45.8, 46.9, 47.7, 48.3] },
    },
    growthHistory: [],
    motorMilestones: {
      score: 0,
      scoreLabel: 'Theo dõi cột mốc',
      doctorNote: '',
      items: [
        { id: 'run', name: 'Chạy nhảy & Leo cầu thang', ageWindow: '18 - 24 tháng', icon: '🏃', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Leo trèo nhanh nhẹn, giữ thăng bằng tốt.' },
        { id: 'spoon', name: 'Tự xúc ăn & Cầm bút màu', ageWindow: '2 - 3 tuổi', icon: '🎨', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Biết cầm thìa ăn gọn gàng và vẽ vòng tròn.' },
        { id: 'talk', name: 'Nói câu dài & Kể chuyện', ageWindow: '2.5 - 4 tuổi', icon: '🗣️', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: "Hát thuộc các bài đồng dao và hỏi 'Tại sao?' liên tục." },
        { id: 'social', name: 'Chơi hòa nhập & Kết bạn', ageWindow: '3 - 5 tuổi', icon: '🤝', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Biết chia sẻ đồ chơi với bạn ở lớp mầm non.' },
      ],
    },
    expenses: { totalMonth: '0 đ', budgetMonth: '0 đ', budgetPercent: 0, categories: [], monthlyHistory: [] },
  },
  stage_6_12: {
    id: 'stage_6_12',
    name: 'Tiểu học & Phát triển',
    ageRange: '6 - 12 Tuổi',
    currentAgeText: '',
    growthScore: 0,
    growthScoreLabel: 'Đang theo dõi',
    wellnessCategory: 'Normal',
    todayVitals: {
      weight: '', height: '', headCirc: '', temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, mood: '', moodEmoji: '',
    },
    growthChart: {
      labels: ['6y', '7y', '8y', '9y', '10y', '11y', '12y'],
      height: { child: [null, null, null, null, null, null, null], whoP50: [115.5, 121.7, 127.3, 132.6, 137.8, 143.5, 149.8], whoP97: [123.7, 130.4, 136.5, 142.3, 148.0, 154.5, 161.5], whoP3: [107.4, 113.1, 118.2, 123.0, 127.7, 132.6, 138.2] },
      weight: { child: [null, null, null, null, null, null, null], whoP50: [20.5, 22.9, 25.6, 28.6, 31.9, 35.6, 40.0], whoP97: [27.0, 30.7, 35.1, 40.1, 45.8, 52.3, 59.5], whoP3: [16.0, 17.7, 19.5, 21.6, 23.8, 26.3, 29.2] },
      headCirc: { child: [null, null, null, null, null, null, null], whoP50: [51.2, 51.6, 52.0, 52.3, 52.6, 53.0, 53.3], whoP97: [53.5, 53.9, 54.3, 54.6, 54.9, 55.3, 55.7], whoP3: [48.9, 49.3, 49.7, 50.0, 50.3, 50.7, 51.0] },
    },
    growthHistory: [],
    motorMilestones: {
      score: 0,
      scoreLabel: 'Theo dõi cột mốc',
      doctorNote: '',
      items: [
        { id: 'bike', name: 'Đi xe đạp 2 bánh & Bơi lội', ageWindow: '6 - 8 tuổi', icon: '🚴', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Phối hợp tay chân nhịp nhàng, thể lực dẻo dai.' },
        { id: 'write', name: 'Viết chữ nét đều & Tư thế ngồi', ageWindow: '6 - 7 tuổi', icon: '✍️', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Ngồi thẳng lưng, cầm bút đúng cách chống gù vẹo.' },
        { id: 'sport', name: 'Chơi thể thao đồng đội (Bóng đá/Bóng rổ)', ageWindow: '7 - 10 tuổi', icon: '⚽', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Tăng chiều cao vượt trội, học tinh thần đồng đội.' },
      ],
    },
    expenses: { totalMonth: '0 đ', budgetMonth: '0 đ', budgetPercent: 0, categories: [], monthlyHistory: [] },
  },
  stage_13_18: {
    id: 'stage_13_18',
    name: 'Dậy thì & Bứt phá',
    ageRange: '13 - 18 Tuổi',
    currentAgeText: '',
    growthScore: 0,
    growthScoreLabel: 'Đang theo dõi',
    wellnessCategory: 'Normal',
    todayVitals: {
      weight: '', height: '', headCirc: '', temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, mood: '', moodEmoji: '',
    },
    growthChart: {
      labels: ['13y', '14y', '15y', '16y', '17y', '18y'],
      height: { child: [null, null, null, null, null, null], whoP50: [156.2, 163.8, 170.1, 173.4, 175.2, 176.1], whoP97: [168.0, 176.0, 182.0, 185.0, 187.0, 188.0], whoP3: [144.0, 151.0, 157.0, 161.0, 163.0, 164.0] },
      weight: { child: [null, null, null, null, null, null], whoP50: [45.8, 51.5, 56.8, 60.8, 64.0, 66.5], whoP97: [66.0, 73.0, 79.0, 84.0, 88.0, 91.0], whoP3: [33.0, 37.5, 42.0, 45.5, 48.0, 50.0] },
      headCirc: { child: [null, null, null, null, null, null], whoP50: [54.0, 54.6, 55.1, 55.5, 55.8, 56.0], whoP97: [56.4, 57.0, 57.5, 57.9, 58.2, 58.5], whoP3: [51.6, 52.2, 52.7, 53.1, 53.4, 53.6] },
    },
    growthHistory: [],
    motorMilestones: {
      score: 0,
      scoreLabel: 'Theo dõi cột mốc',
      doctorNote: '',
      items: [
        { id: 'growth_spurt', name: 'Bứt phá chiều cao dậy thì (Peak Spurt)', ageWindow: '13 - 15 tuổi', icon: '⚡', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Giai đoạn vàng tăng 8-12cm/năm nếu đủ dinh dưỡng và giấc ngủ.' },
        { id: 'fitness', name: 'Thể lực dẻo dai & Sức bền', ageWindow: '14 - 18 tuổi', icon: '🏋️', status: 'upcoming', statusLabel: 'Sắp tới', dateAchieved: null, note: 'Duy trì tập thể dục ít nhất 60 phút mỗi ngày.' },
      ],
    },
    expenses: { totalMonth: '0 đ', budgetMonth: '0 đ', budgetPercent: 0, categories: [], monthlyHistory: [] },
  },
};

export const INITIAL_MOM_DATA: MomData = {
  name: '',
  postpartumDay: '',
  wellnessScore: 0,
  mentalHealth: { epdsScore: '', status: 'Tâm lý ổn định', sleepDebt: '0h' },
  pumping: { todayTotal: '0 ml', sessionsToday: 0, freezerStock: '0 ml', lastSession: '0 ml', time: '', history: [] },
  recovery: { uterusStatus: 'Hồi phục tốt', lochia: 'Bình thường', weightLoss: '' },
};

export const CALENDAR_RANGE_EVENTS: CalendarRangeEvent[] = [];
export const INITIAL_TIMELINE_ITEMS: TimelineItem[] = [];
export const INITIAL_DAILY_HABITS: DailyHabit[] = [];
