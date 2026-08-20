export type MedicationKind = 'vitamin' | 'probiotic' | 'medicine';
export type MedicationDoseUnit = 'giọt' | 'ml' | 'gói' | 'viên' | 'lần xịt';

export interface MedicationCatalogItem {
  id: string;
  name: string;
  detail: string;
  kind: MedicationKind;
  builtIn: boolean;
  infoUrl?: string;
  preferredDoseUnit?: MedicationDoseUnit;
  lastDose?: string;
}

export const DEFAULT_MEDICATION_CATALOG: MedicationCatalogItem[] = [
  {
    id: 'medication-d3',
    name: 'D3',
    detail: 'Vitamin D3',
    kind: 'vitamin',
    builtIn: true,
    preferredDoseUnit: 'giọt',
    infoUrl: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/',
  },
  {
    id: 'medication-d3k2',
    name: 'D3K2',
    detail: 'Vitamin D3 + K2',
    kind: 'vitamin',
    builtIn: true,
    preferredDoseUnit: 'giọt',
    infoUrl: 'https://ods.od.nih.gov/factsheets/VitaminK-Consumer/',
  },
  {
    id: 'medication-biogaia',
    name: 'BioGaia',
    detail: 'Men vi sinh',
    kind: 'probiotic',
    builtIn: true,
    preferredDoseUnit: 'giọt',
    infoUrl: 'https://www.biogaia.com/products/protectis-baby-drops',
  },
  {
    id: 'medication-iron',
    name: 'Sắt',
    detail: 'Bổ sung sắt theo chỉ định',
    kind: 'vitamin',
    builtIn: true,
    preferredDoseUnit: 'giọt',
    infoUrl: 'https://www.nhs.uk/conditions/vitamins-and-minerals/iron/',
  },
  {
    id: 'medication-zinc',
    name: 'Kẽm',
    detail: 'Thường dùng khi tiêu chảy theo bác sĩ',
    kind: 'vitamin',
    builtIn: true,
    preferredDoseUnit: 'ml',
    infoUrl: 'https://www.who.int/tools/elena/interventions/zinc-diarrhoea',
  },
  {
    id: 'medication-paracetamol',
    name: 'Paracetamol',
    detail: 'Hạ sốt, giảm đau theo cân nặng',
    kind: 'medicine',
    builtIn: true,
    preferredDoseUnit: 'ml',
    infoUrl: 'https://www.nhs.uk/medicines/paracetamol-for-children/',
  },
  {
    id: 'medication-ors',
    name: 'Oresol',
    detail: 'Bù nước và điện giải',
    kind: 'medicine',
    builtIn: true,
    preferredDoseUnit: 'gói',
    infoUrl: 'https://www.nhs.uk/conditions/diarrhoea-and-vomiting/',
  },
  {
    id: 'medication-saline',
    name: 'Nước muối sinh lý',
    detail: 'Vệ sinh mũi khi nghẹt',
    kind: 'medicine',
    builtIn: true,
    preferredDoseUnit: 'giọt',
    infoUrl: 'https://www.nhs.uk/conditions/baby/health/colds-coughs-and-ear-infections-in-children/',
  },
];

export function createDefaultMedicationCatalog(): MedicationCatalogItem[] {
  return DEFAULT_MEDICATION_CATALOG.map((item) => ({ ...item }));
}

export function normalizeMedicationName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN');
}

export function mergeMedicationCatalog(
  persisted: MedicationCatalogItem[] | undefined,
): MedicationCatalogItem[] {
  const savedItems = persisted ?? [];
  const savedById = new Map(savedItems.map((item) => [item.id, item]));
  const builtIns = DEFAULT_MEDICATION_CATALOG.map((item) => ({
    ...item,
    lastDose: savedById.get(item.id)?.lastDose,
  }));
  const builtInIds = new Set(DEFAULT_MEDICATION_CATALOG.map((item) => item.id));
  return [...builtIns, ...savedItems.filter((item) => !builtInIds.has(item.id))];
}
