export interface ExpenseCategoryDef {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  tone: 'sage' | 'amber' | 'rose' | 'coral' | 'lavender' | 'blue' | 'meadow' | 'clay';
  color: string;
  bgLight: string;
  borderColor: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  {
    id: 'milk-food',
    name: 'Sữa & ăn dặm',
    shortName: 'Sữa & Ăn',
    iconName: 'Milk',
    tone: 'sage',
    color: '#4B6637',
    bgLight: '#EDF4E3',
    borderColor: '#CBE0B4',
  },
  {
    id: 'diaper-hygiene',
    name: 'Tã bỉm & vệ sinh',
    shortName: 'Tã bỉm',
    iconName: 'Layers',
    tone: 'amber',
    color: '#9E6700',
    bgLight: '#FEF7E8',
    borderColor: '#F7DF9B',
  },
  {
    id: 'medical-vaccine',
    name: 'Y tế & tiêm chủng',
    shortName: 'Y tế & Tiêm',
    iconName: 'HeartPulse',
    tone: 'rose',
    color: '#9C3246',
    bgLight: '#FCECEF',
    borderColor: '#F4C0CA',
  },
  {
    id: 'clothes-gear',
    name: 'Quần áo & đồ dùng',
    shortName: 'Quần áo',
    iconName: 'Shirt',
    tone: 'coral',
    color: '#A44512',
    bgLight: '#FEF0E7',
    borderColor: '#F8C8A6',
  },
  {
    id: 'toys-books',
    name: 'Sách & đồ chơi',
    shortName: 'Đồ chơi',
    iconName: 'Gamepad2',
    tone: 'lavender',
    color: '#5E3EB3',
    bgLight: '#F2EDFD',
    borderColor: '#D5C4FA',
  },
  {
    id: 'large-gear',
    name: 'Thiết bị & đồ lớn',
    shortName: 'Đồ lớn',
    iconName: 'Package',
    tone: 'blue',
    color: '#2A57A7',
    bgLight: '#EDF3FD',
    borderColor: '#B6D0FB',
  },
  {
    id: 'daycare-education',
    name: 'Trông trẻ & học phí',
    shortName: 'Học phí',
    iconName: 'GraduationCap',
    tone: 'meadow',
    color: '#3D721A',
    bgLight: '#EEF8E7',
    borderColor: '#BCE1A1',
  },
  {
    id: 'mom-family',
    name: 'Mẹ & gia đình',
    shortName: 'Mẹ & Nhà',
    iconName: 'Heart',
    tone: 'rose',
    color: '#8A3B49',
    bgLight: '#FBF0F2',
    borderColor: '#F3C4CC',
  },
  {
    id: 'other',
    name: 'Khác',
    shortName: 'Khác',
    iconName: 'Wallet',
    tone: 'clay',
    color: '#68432E',
    bgLight: '#F5ECE5',
    borderColor: '#DEC9BA',
  },
];

// Presets are in thousands (k), matching the x1000 input standard
export const PRESET_ADD_AMOUNTS = [
  { label: '+50k', value: 50 },
  { label: '+100k', value: 100 },
  { label: '+200k', value: 200 },
  { label: '+500k', value: 500 },
  { label: '+1tr', value: 1000 },
];

export function getExpenseCategory(categoryName: string): ExpenseCategoryDef {
  const normalized = (categoryName || '').toLowerCase().trim();
  
  // Exact name match
  const exact = EXPENSE_CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized || c.shortName.toLowerCase() === normalized
  );
  if (exact) return exact;

  // Fuzzy match
  if (normalized.includes('sữa') || normalized.includes('ăn')) return EXPENSE_CATEGORIES[0];
  if (normalized.includes('tã') || normalized.includes('bỉm') || normalized.includes('vệ sinh')) return EXPENSE_CATEGORIES[1];
  if (normalized.includes('y tế') || normalized.includes('tiêm') || normalized.includes('thuốc') || normalized.includes('bác sĩ')) return EXPENSE_CATEGORIES[2];
  if (normalized.includes('quần') || normalized.includes('áo') || normalized.includes('mặc')) return EXPENSE_CATEGORIES[3];
  if (normalized.includes('chơi') || normalized.includes('sách') || normalized.includes('truyện')) return EXPENSE_CATEGORIES[4];
  if (normalized.includes('thiết bị') || normalized.includes('xe đẩy') || normalized.includes('cũi') || normalized.includes('ghế')) return EXPENSE_CATEGORIES[5];
  if (normalized.includes('học') || normalized.includes('trông') || normalized.includes('trường') || normalized.includes('gửi trẻ')) return EXPENSE_CATEGORIES[6];
  if (normalized.includes('mẹ') || normalized.includes('gia đình')) return EXPENSE_CATEGORIES[7];

  return EXPENSE_CATEGORIES[8]; // Fallback to 'Khác'
}
