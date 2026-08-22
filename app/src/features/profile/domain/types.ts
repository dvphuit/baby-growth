export type ProfileMode = 'baby' | 'mom';

export interface FamilyData {
  isInitialized?: boolean;
  childName: string;
  childFullName: string;
  birthDate: string;
  birthTime?: string;
  gender: 'boy' | 'girl';
  bloodType: string;
  childAvatar: string;
  momName: string;
  momAvatar: string;
  dadName?: string;
  dadAvatar?: string;
  birthWeight?: string;
  birthHeight?: string;
  headCircAtBirth?: string;
  hospital?: string;
  insuranceCode?: string;
  allergies?: string[];
  notes?: string;
}
