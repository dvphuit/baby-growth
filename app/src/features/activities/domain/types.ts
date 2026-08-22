export interface PumpingSession {
  time: string;
  amount: string;
  note: string;
}

export interface MomData {
  name: string;
  postpartumDay: string;
  wellnessScore: number;
  mentalHealth: {
    epdsScore: string;
    status: string;
    sleepDebt: string;
  };
  pumping: {
    todayTotal: string;
    sessionsToday: number;
    freezerStock: string;
    lastSession: string;
    time: string;
    history: PumpingSession[];
  };
  recovery: {
    uterusStatus: string;
    lochia: string;
    weightLoss: string;
  };
}

export type BabyActivityType = 'feeding' | 'sleep' | 'diaper' | 'medicine' | 'temperature' | 'health_note';

export type MomActivityType = 'pumping' | 'sleep' | 'mood' | 'recovery_note';

export type ActivityLogType = BabyActivityType | MomActivityType;

export interface ActivityBase {
  id: string;
  occurredAt: string;
  createdAt: string;
  note?: string;
}

export type BabyActivity =
  | (ActivityBase & {
      owner: 'baby';
      type: 'feeding';
      amountMl?: number;
      durationMinutes?: number;
      method?: 'formula' | 'breast_direct' | 'breast_bottle' | 'bottle' | 'breast' | 'other';
      side?: 'left' | 'right' | 'both';
    })
  | (ActivityBase & {
      owner: 'baby';
      type: 'sleep';
      startedAt?: string;
      endedAt?: string;
      durationMinutes: number;
      sleepKind?: 'nap' | 'night';
      sleepQuality?: 'restful' | 'normal' | 'restless';
      wakeCount?: number;
    })
  | (ActivityBase & {
      owner: 'baby';
      type: 'diaper';
      diaperKind: 'wet' | 'dirty' | 'both';
      stoolType?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      stoolColor?: 'yellow' | 'brown' | 'green' | 'red' | 'black' | 'pale';
      stoolFlags?: Array<'mucus' | 'blood'>;
    })
  | (ActivityBase & {
      owner: 'baby';
      type: 'medicine';
      name: string;
      dose?: string;
    })
  | (ActivityBase & {
      owner: 'baby';
      type: 'temperature';
      temperatureC: number;
      measurementSite?: 'rectal' | 'ear' | 'forehead' | 'oral' | 'axillary';
      symptoms?: Array<'lethargy' | 'breathing' | 'seizure' | 'rash' | 'dehydration'>;
    })
  | (ActivityBase & {
      owner: 'baby';
      type: 'health_note';
    });

export type MomActivity =
  | (ActivityBase & {
      owner: 'mom';
      type: 'pumping';
      amountMl: number;
      side: 'left' | 'right' | 'both';
    })
  | (ActivityBase & {
      owner: 'mom';
      type: 'sleep';
      durationMinutes: number;
    })
  | (ActivityBase & {
      owner: 'mom';
      type: 'mood';
      mood: 'great' | 'good' | 'neutral' | 'low' | 'very_low';
    })
  | (ActivityBase & {
      owner: 'mom';
      type: 'recovery_note';
    });

export type ActivityRecord = BabyActivity | MomActivity;
