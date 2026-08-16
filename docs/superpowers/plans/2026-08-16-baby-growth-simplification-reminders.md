# BabyGrowth Simplification & Local Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace demo/social/score behavior with persisted baby/mom activity tracking, a derived timeline/home experience, and opt-in local reminders while retaining Expenses, Zodiac, Growth and Google Drive sync.

**Architecture:** Add a persisted activity domain and a persisted reminder domain on top of the existing Zustand + IndexedDB storage. Home and Timeline become derived views of real records. Reminder scheduling lives in React while the existing Workbox service worker is an adapter for system notifications and notification actions; no backend is introduced.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, IndexedDB via existing `indexedDbStorage`, Vitest 4 + Testing Library, Workbox/Vite PWA, Chart.js.

## Global Constraints

- Keep the app local-first and backend-free.
- Keep Zodiac and Expenses.
- Do not enable any reminder by default.
- Support fixed reminders and relative reminders based on the latest relevant log.
- Reminder actions are `Đã xong`, `Nhắc lại sau`, and `Ghi nhanh`.
- System notifications are best effort; do not promise exact delivery while the PWA/browser is fully closed.
- Never show success before persistence succeeds.
- Never render demo/static health values as if they were user data.
- Do not turn Expenses into Timeline entries by default.
- Keep Google Drive `appDataFolder` sync and include new persisted domains.
- Do not add FCM, Cloud Functions, or another backend.
- Do not use Zodiac in health, milestone, reminder, or care logic.

---

## File Structure

### New files

- `app/src/store/useActivityStore.ts` — persisted baby/mom activity records and CRUD.
- `app/src/store/useReminderStore.ts` — persisted reminder definitions and occurrence state.
- `app/src/domain/activitySelectors.ts` — pure daily metrics and normalized activity helpers.
- `app/src/domain/timelineSelectors.ts` — normalize activity/growth/optional expense records into chronological timeline entries.
- `app/src/domain/reminderScheduler.ts` — pure due-time calculation and occurrence identity.
- `app/src/services/notificationService.ts` — browser permission/status and service-worker notification adapter.
- `app/src/hooks/useReminderLifecycle.ts` — check reminders on mount, resume, visibility changes, and active timer.
- `app/src/components/modals/ActivityLogModal.tsx` — real forms for feeding, sleep, diaper, mood, medicine/vitamin.
- `app/src/components/reminders/ReminderSettings.tsx` — opt-in reminder CRUD/settings.
- `app/src/components/reminders/ReminderList.tsx` — due/upcoming/in-app reminder UI and actions.
- Focused `.test.ts` / `.test.tsx` files beside the above modules.

### Existing files to modify

- `app/src/types/index.ts`
- `app/src/hooks/useAppModals.ts`
- `app/src/components/app/AppModals.tsx`
- `app/src/App.tsx`
- `app/src/components/common/Header.tsx`
- `app/src/components/common/BottomNav.tsx`
- `app/src/components/home/BabyHomeView.tsx`
- `app/src/components/home/MomHomeView.tsx`
- `app/src/components/timeline/TimelineView.tsx`
- `app/src/components/growth/GrowthView.tsx`
- `app/src/components/profile/ProfileView.tsx`
- `app/src/components/modals/NotificationModal.tsx`
- `app/src/services/googleDriveSync.ts`
- `app/src/sw.ts`
- existing tests under `app/src/**`.

---

### Task 1: Add persisted activity domain and pure daily selectors

**Files:**
- Modify: `app/src/types/index.ts`
- Create: `app/src/store/useActivityStore.ts`
- Create: `app/src/domain/activitySelectors.ts`
- Create: `app/src/domain/activitySelectors.test.ts`
- Create: `app/src/store/useActivityStore.test.ts`

**Interfaces:**
- Produces `BabyActivity`, `MomActivity`, `ActivityRecord`, `ActivityLogType`.
- Produces `useActivityStore` with `addBabyActivity`, `addMomActivity`, `updateActivity`, `deleteActivity`.
- Produces `selectBabyTodayMetrics(records, now)` and `selectMomTodayMetrics(records, now)`.

- [ ] **Step 1: Define activity types and failing selector tests**

Add discriminated record types. Core shape:

```ts
export type BabyActivityType = 'feeding' | 'sleep' | 'diaper' | 'medicine' | 'temperature' | 'health_note';
export type MomActivityType = 'pumping' | 'sleep' | 'mood' | 'recovery_note';

export interface ActivityBase {
  id: string;
  occurredAt: string;
  createdAt: string;
  note?: string;
}

export type BabyActivity =
  | (ActivityBase & { owner: 'baby'; type: 'feeding'; amountMl?: number; durationMinutes?: number; method?: 'bottle' | 'breast' | 'other'; side?: 'left' | 'right' | 'both' })
  | (ActivityBase & { owner: 'baby'; type: 'sleep'; startedAt?: string; endedAt?: string; durationMinutes: number })
  | (ActivityBase & { owner: 'baby'; type: 'diaper'; diaperKind: 'wet' | 'dirty' | 'both' })
  | (ActivityBase & { owner: 'baby'; type: 'medicine'; name: string; dose?: string })
  | (ActivityBase & { owner: 'baby'; type: 'temperature'; temperatureC: number })
  | (ActivityBase & { owner: 'baby'; type: 'health_note' });

export type MomActivity =
  | (ActivityBase & { owner: 'mom'; type: 'pumping'; amountMl: number; side: 'left' | 'right' | 'both' })
  | (ActivityBase & { owner: 'mom'; type: 'sleep'; durationMinutes: number })
  | (ActivityBase & { owner: 'mom'; type: 'mood'; mood: 'great' | 'good' | 'neutral' | 'low' | 'very_low' })
  | (ActivityBase & { owner: 'mom'; type: 'recovery_note' });
```

Tests must assert, for one local calendar day, total feeding amount/count, diaper count, sleep minutes, latest feeding, pumping total/count and latest pumping.

- [ ] **Step 2: Run selector tests and verify RED**

Run:

```bash
cd app && npm test -- src/domain/activitySelectors.test.ts
```

Expected: FAIL because selectors do not exist.

- [ ] **Step 3: Implement pure selectors with local-day boundaries**

Required signatures:

```ts
export function selectBabyTodayMetrics(records: BabyActivity[], now: Date): {
  feedingAmountMl: number;
  feedingCount: number;
  diaperCount: number;
  sleepMinutes: number;
  lastFeedingAt: string | null;
};

export function selectMomTodayMetrics(records: MomActivity[], now: Date): {
  pumpingAmountMl: number;
  pumpingCount: number;
  sleepMinutes: number;
  latestMood: MomActivity | null;
  lastPumpingAt: string | null;
};
```

Filter by local `startOfDay <= occurredAt < nextDay` rather than comparing UTC date strings.

- [ ] **Step 4: Add failing store tests**

Mock `indexedDbStorage` with an in-memory `StateStorage`. Assert each add method creates a UUID-like id, preserves `occurredAt`, stamps `createdAt`, and stores only real records; deleting removes the record.

- [ ] **Step 5: Run store test and verify RED**

```bash
cd app && npm test -- src/store/useActivityStore.test.ts
```

Expected: FAIL because `useActivityStore` does not exist.

- [ ] **Step 6: Implement persisted activity store**

Persist under `babygrowth_v3_activities` using existing `createJSONStorage(() => indexedDbStorage)`. Keep state minimal:

```ts
interface ActivityState {
  babyActivities: BabyActivity[];
  momActivities: MomActivity[];
  addBabyActivity(input: Omit<BabyActivity, 'id' | 'createdAt'>): BabyActivity;
  addMomActivity(input: Omit<MomActivity, 'id' | 'createdAt'>): MomActivity;
  updateActivity(id: string, patch: Partial<ActivityRecord>): void;
  deleteActivity(id: string): void;
}
```

Do not copy activities into `useTimelineStore`.

- [ ] **Step 7: Run focused tests**

```bash
cd app && npm test -- src/domain/activitySelectors.test.ts src/store/useActivityStore.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/types/index.ts app/src/store/useActivityStore.ts app/src/store/useActivityStore.test.ts app/src/domain/activitySelectors.ts app/src/domain/activitySelectors.test.ts
git commit -m "feat: add persisted baby and mom activities"
```

---

### Task 2: Replace toast-only Quick Log paths with real persisted forms

**Files:**
- Create: `app/src/components/modals/ActivityLogModal.tsx`
- Create: `app/src/components/modals/ActivityLogModal.test.tsx`
- Modify: `app/src/hooks/useAppModals.ts`
- Modify: `app/src/components/app/AppModals.tsx`
- Modify: `app/src/components/app/AppModals.test.tsx`

**Interfaces:**
- Consumes `useActivityStore.addBabyActivity` and `addMomActivity`.
- Produces modal modes `feeding | baby-sleep | diaper | mom-mood | medicine`.
- `onSaved()` fires only after the store write completes.

- [ ] **Step 1: Write failing UI tests**

Cover:

```ts
it('persists a feeding record before success');
it('persists baby sleep instead of showing a toast only');
it('persists diaper kind');
it('persists mom mood');
it('persists medicine name and dose');
```

The tests should render the modal, fill required fields, submit, assert the relevant store method was called, and then assert `onSaved`.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd app && npm test -- src/components/modals/ActivityLogModal.test.tsx src/components/app/AppModals.test.tsx
```

- [ ] **Step 3: Implement `ActivityLogModal`**

Keep one focused modal with type-specific fields. Validate required values:

- feeding: at least amount or duration;
- sleep: duration > 0;
- diaper: kind required;
- mood: mood required;
- medicine: name required.

Use `datetime-local` initialized to current local time and convert to ISO only on submit.

- [ ] **Step 4: Route Quick Log actions through the real modal**

Replace `sleep`, `diaper`, and `mood` toast-only branches in `useAppModals.handleQuickAction`. Route `feeding` to this modal instead of `AddPostModal`. Keep growth, pumping and expense paths intact. Add medicine/vitamin route.

- [ ] **Step 5: Run focused tests**

```bash
cd app && npm test -- src/components/modals/ActivityLogModal.test.tsx src/components/app/AppModals.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/components/modals/ActivityLogModal.tsx app/src/components/modals/ActivityLogModal.test.tsx app/src/hooks/useAppModals.ts app/src/components/app/AppModals.tsx app/src/components/app/AppModals.test.tsx
git commit -m "feat: persist quick log activities"
```

---

### Task 3: Make Home summaries derive from real records and show honest empty states

**Files:**
- Modify: `app/src/components/home/BabyHomeView.tsx`
- Modify: `app/src/components/home/MomHomeView.tsx`
- Modify or remove usage of: `app/src/components/home/BabyTodaySummary.tsx`
- Modify or remove usage of: `app/src/components/home/DailyHabits.tsx`
- Modify or remove usage of: `app/src/components/home/BabyHealthMetrics.tsx`
- Modify or remove usage of: `app/src/components/home/BabyTodayTracker.tsx`
- Modify or remove usage of: `app/src/components/home/MomHealthMetrics.tsx`
- Modify or remove usage of: `app/src/components/home/MomTodayTracker.tsx`
- Create: `app/src/components/home/HomeViews.test.tsx`

**Interfaces:**
- Consumes `selectBabyTodayMetrics`, `selectMomTodayMetrics`, and reminder selectors from Task 5 once available.
- Until Task 5, render a placeholder reminder slot only when there is a real reminder API; do not fabricate entries.

- [ ] **Step 1: Write failing Home tests**

Assert:

- no activity -> `Chưa ghi nhận` rather than demo ml/hours/counts;
- feeding record updates feeding total and last feeding;
- diaper/sleep records update counters;
- pumping records update mom totals;
- no frozen-stock hard-coded `4.85 L` or hard-coded `+180ml`/`7.5h` strings.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd app && npm test -- src/components/home/HomeViews.test.tsx
```

- [ ] **Step 3: Simplify Baby Home**

Render only:

1. compact Today summary from real activity/growth data;
2. Quick Log call-to-action;
3. recent real activities (up to five);
4. reminder section only when real reminder data exists.

Remove Home AI banner and generic care-resource blocks from the primary flow.

- [ ] **Step 4: Simplify Mom Home**

Render real pumping/sleep/mood/recovery records. Remove hard-coded wellness interpretation and freezer stock. If no record exists, use empty state plus quick action.

- [ ] **Step 5: Run tests**

```bash
cd app && npm test -- src/components/home/HomeViews.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/components/home app/src/domain/activitySelectors.ts
git commit -m "refactor: derive home summaries from real records"
```

---

### Task 4: Replace social/demo Timeline with a derived chronological history

**Files:**
- Create: `app/src/domain/timelineSelectors.ts`
- Create: `app/src/domain/timelineSelectors.test.ts`
- Modify: `app/src/components/timeline/TimelineView.tsx`
- Modify: `app/src/components/timeline/TimelineFeed.tsx`
- Modify: `app/src/store/useTimelineStore.ts`
- Modify: `app/src/types/index.ts`

**Interfaces:**
- Produces `DerivedTimelineEntry` without likes/comments/userLiked.
- Consumes activities from Task 1, growth history from `useBabyStore`, and expense data only when `showExpensesInTimeline` is true.

- [ ] **Step 1: Write failing normalization/sort tests**

Use mixed baby, mom and growth records. Assert descending event-time sort and readable tags. Assert an empty date returns `[]`, not unrelated fallback data.

- [ ] **Step 2: Run selector test and verify RED**

```bash
cd app && npm test -- src/domain/timelineSelectors.test.ts
```

- [ ] **Step 3: Implement derived timeline adapter**

Define:

```ts
export interface DerivedTimelineEntry {
  id: string;
  occurredAt: string;
  owner: 'baby' | 'mom' | 'system';
  type: string;
  title: string;
  detail: string;
  stats: string[];
}
```

Do not include social state.

- [ ] **Step 4: Simplify `useTimelineStore` to UI-only state**

Retain calendar date/range/filter concerns that Timeline actually needs. Remove `toggleLike` and social state mutations. Preserve legacy data only for migration compatibility; do not render hard-coded/demo records in the new feed.

- [ ] **Step 5: Rewrite Timeline UI around real entries**

Remove:

- mood-history hard-coded tab/data;
- Time Capsule demo;
- `Ghi nhận AI` labels;
- like/comment buttons;
- hard-coded 2025/2026 shortcut behavior;
- fallback to first seed records.

Keep a simple calendar/date filter only where it helps navigate actual records.

- [ ] **Step 6: Run selector and Timeline tests**

```bash
cd app && npm test -- src/domain/timelineSelectors.test.ts src/components/timeline
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/domain/timelineSelectors.ts app/src/domain/timelineSelectors.test.ts app/src/components/timeline app/src/store/useTimelineStore.ts app/src/types/index.ts
git commit -m "refactor: derive timeline from persisted records"
```

---

### Task 5: Add opt-in reminder store and pure scheduler

**Files:**
- Modify: `app/src/types/index.ts`
- Create: `app/src/store/useReminderStore.ts`
- Create: `app/src/store/useReminderStore.test.ts`
- Create: `app/src/domain/reminderScheduler.ts`
- Create: `app/src/domain/reminderScheduler.test.ts`

**Interfaces:**
- Produces `Reminder`, `ReminderType`, `ReminderOccurrence`.
- Produces `getReminderOccurrence(reminder, activities, now)` and `getDueOccurrences(...)`.
- Store methods: `createReminder`, `updateReminder`, `deleteReminder`, `completeOccurrence`, `snoozeOccurrence`, `markSurfaced`.

- [ ] **Step 1: Define reminder types and failing scheduler tests**

Core model:

```ts
export type ReminderType = 'feeding' | 'pumping' | 'medicine' | 'vaccination' | 'appointment' | 'custom';
export type ReminderMode = 'fixed' | 'relative';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  enabled: boolean;
  mode: ReminderMode;
  triggerAt?: string;
  intervalMinutes?: number;
  repeat?: 'none' | 'daily';
  quickLogAction?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderOccurrenceState {
  occurrenceId: string;
  reminderId: string;
  dueAt: string;
  surfacedAt?: string;
  completedAt?: string;
  snoozedUntil?: string;
}
```

Tests:

- fixed reminder becomes due at configured time;
- daily fixed reminder produces stable occurrence id per date;
- relative feeding uses latest feeding activity + interval;
- relative pumping uses latest pumping activity + interval;
- disabled reminder yields no occurrence;
- completed occurrence does not fire again;
- snooze changes effective due time for current occurrence only.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd app && npm test -- src/domain/reminderScheduler.test.ts
```

- [ ] **Step 3: Implement scheduler as pure functions**

No browser APIs in `reminderScheduler.ts`. Inject `now` into every calculation for deterministic tests.

- [ ] **Step 4: Add failing reminder-store tests**

Assert all reminders default to `enabled: false` unless explicitly enabled by user action. Persist under `babygrowth_v3_reminders`.

- [ ] **Step 5: Implement reminder store**

Keep definitions and occurrence state together so duplicate prevention survives reload.

- [ ] **Step 6: Run focused tests**

```bash
cd app && npm test -- src/domain/reminderScheduler.test.ts src/store/useReminderStore.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/types/index.ts app/src/domain/reminderScheduler.ts app/src/domain/reminderScheduler.test.ts app/src/store/useReminderStore.ts app/src/store/useReminderStore.test.ts
git commit -m "feat: add local reminder scheduler"
```

---

### Task 6: Implement notification adapter, lifecycle and service-worker actions

**Files:**
- Create: `app/src/services/notificationService.ts`
- Create: `app/src/services/notificationService.test.ts`
- Create: `app/src/hooks/useReminderLifecycle.ts`
- Create: `app/src/hooks/useReminderLifecycle.test.tsx`
- Modify: `app/src/sw.ts`
- Modify: `app/src/App.tsx`

**Interfaces:**
- `getNotificationCapability(): 'unsupported' | 'default' | 'granted' | 'denied'`.
- `requestSystemNotificationPermission(): Promise<NotificationPermission>` called only from an explicit user enable action.
- `showReminderNotification(occurrence, reminder): Promise<boolean>`.
- SW action payload routes to `complete`, `snooze`, or `quick-log` via URL/message.

- [ ] **Step 1: Write failing notification-service tests**

Mock `Notification`, `navigator.serviceWorker.ready`, and registration `showNotification`. Assert no permission request happens during `showReminderNotification`; denied/unsupported returns false; granted sends title/body/tag/data/actions.

- [ ] **Step 2: Run and verify RED**

```bash
cd app && npm test -- src/services/notificationService.test.ts
```

- [ ] **Step 3: Implement browser adapter**

Use a stable `tag` derived from `occurrenceId` to let browsers coalesce duplicates. Include action identifiers `complete`, `snooze`, `quick-log` where supported.

- [ ] **Step 4: Extend `sw.ts`**

Add `notificationclick` handling. For all actions, focus an existing same-origin client or open `/`. Append/query-route the reminder action, e.g. `/?reminderAction=quick-log&reminderId=...&occurrenceId=...`; React consumes and clears it. For `complete` and `snooze`, if direct IndexedDB access is not shared safely, route the action back to the app instead of duplicating persistence logic in the service worker.

- [ ] **Step 5: Write failing lifecycle tests**

Assert due checks happen on mount, `visibilitychange` to visible, `focus`, and a low-frequency active timer. Assert already surfaced occurrences are not surfaced again.

- [ ] **Step 6: Implement `useReminderLifecycle`**

Read reminder + activity stores, compute due occurrences, mark surfaced, render system notification only when permission is already granted. Process service-worker URL actions on app startup/resume.

- [ ] **Step 7: Mount lifecycle in `App.tsx` and run tests**

```bash
cd app && npm test -- src/services/notificationService.test.ts src/hooks/useReminderLifecycle.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/services/notificationService.ts app/src/services/notificationService.test.ts app/src/hooks/useReminderLifecycle.ts app/src/hooks/useReminderLifecycle.test.tsx app/src/sw.ts app/src/App.tsx
git commit -m "feat: add best-effort system reminders"
```

---

### Task 7: Replace hard-coded Notification modal with real reminder settings and in-app center

**Files:**
- Create: `app/src/components/reminders/ReminderSettings.tsx`
- Create: `app/src/components/reminders/ReminderSettings.test.tsx`
- Create: `app/src/components/reminders/ReminderList.tsx`
- Create: `app/src/components/reminders/ReminderList.test.tsx`
- Modify: `app/src/components/modals/NotificationModal.tsx`
- Modify: `app/src/components/profile/ProfileView.tsx`
- Modify: `app/src/hooks/useAppModals.ts`

**Interfaces:**
- Settings can create fixed/relative feeding, pumping, medicine, vaccination, appointment, custom reminders.
- Suggested intervals appear as editable starting values only; reminders remain disabled until user confirms.
- Due list exposes complete/snooze/quick-log.

- [ ] **Step 1: Write failing settings tests**

Assert:

- no reminder is enabled initially;
- enabling system notifications is an explicit user action that calls `requestSystemNotificationPermission`;
- suggested feeding/pumping intervals are editable;
- fixed date/time and relative mode save correctly.

- [ ] **Step 2: Write failing in-app reminder tests**

Assert Due/Overdue/Upcoming states and each action mutates occurrence state correctly. `Ghi nhanh` routes to the correct Quick Log form.

- [ ] **Step 3: Run and verify RED**

```bash
cd app && npm test -- src/components/reminders
```

- [ ] **Step 4: Implement Settings and List**

Do not use medical-prescriptive wording for interval suggestions. Label them as editable suggestions/defaults.

- [ ] **Step 5: Replace NotificationModal static array**

Render `ReminderList`; include a path/button to settings. Add Profile entry to reminder settings.

- [ ] **Step 6: Run tests**

```bash
cd app && npm test -- src/components/reminders src/components/modals/NotificationModal.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/components/reminders app/src/components/modals/NotificationModal.tsx app/src/components/profile/ProfileView.tsx app/src/hooks/useAppModals.ts
git commit -m "feat: add real in-app reminder center"
```

---

### Task 8: Remove mock AI/score/social surfaces while preserving Zodiac, Growth and Expenses

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/components/common/Header.tsx`
- Modify: `app/src/components/app/AppRoutes.tsx`
- Modify: `app/src/components/growth/GrowthView.tsx`
- Modify: `app/src/components/profile/ProfileView.tsx`
- Modify: `app/src/components/common/BottomNav.tsx`
- Delete from active routing/imports (and delete files if unreferenced):
  - `app/src/components/modals/AIDoctorChatModal.tsx`
  - `app/src/components/growth/ScoreDetailView.tsx`
  - `app/src/components/home/AIAdviceCard.tsx`
  - `app/src/components/home/HomeAIBanner.tsx`
- Retain: expense components/store and Zodiac calculation.

**Interfaces:**
- Bottom nav remains `Hôm nay | Nhật ký | + | Tăng trưởng | Chi tiêu`.
- Profile remains via avatar/header.
- Growth retains measurements/chart/history/simple milestones only.

- [ ] **Step 1: Add/adjust failing route and header tests**

Assert there is no AI Assistant/Pro/Growth Score entry point, and bottom nav still contains Expenses. Assert Profile still renders Zodiac from DOB.

- [ ] **Step 2: Run and verify RED**

```bash
cd app && npm test -- src/components/app/AppRoutes.test.tsx src/App.test.tsx
```

- [ ] **Step 3: Remove AI and score wiring**

Remove AI callbacks/modal registration and Score Detail route/subview. Remove Pro badge/score/mood cosmetics from Header. Keep notification and profile affordances.

- [ ] **Step 4: Simplify Growth**

Remove score card/history, static stars, AI evaluation, and hard-coded doctor exercises. Keep measurement cards, WHO chart, growth history, and simple milestone list.

- [ ] **Step 5: Keep Zodiac and Expenses explicitly covered by tests**

Do not delete expense route/components/store. Keep DOB-derived Zodiac display and ensure no health/reminder selector imports it.

- [ ] **Step 6: Run focused tests**

```bash
cd app && npm test -- src/components/app/AppRoutes.test.tsx src/App.test.tsx src/components/growth src/components/profile
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A app/src
git commit -m "refactor: remove mock ai scores and social ui"
```

---

### Task 9: Add sync/migration coverage for new domains and verify full product

**Files:**
- Modify: `app/src/services/googleDriveSync.ts`
- Modify or create: `app/src/services/googleDriveSync.test.ts`
- Create: `app/src/services/dataMigration.ts`
- Create: `app/src/services/dataMigration.test.ts`
- Modify: `app/src/App.tsx` or app bootstrap module to run migration once.

**Interfaces:**
- Sync keys include `babygrowth_v3_activities` and `babygrowth_v3_reminders` plus retained profile/baby/mom/expense/UI keys.
- Migration is idempotent and does not migrate demo/static Timeline content into activities.

- [ ] **Step 1: Write failing sync snapshot tests**

Assert new activity/reminder stores are included in local snapshots, remote apply, fingerprints, and auto-sync change triggers. Ensure Expenses are included in sync; if the current expense data lives inside the baby store it remains covered, otherwise add its dedicated key.

- [ ] **Step 2: Write failing migration tests**

Cases:

- re-running migration does not duplicate records;
- valid existing pumping/growth/expense/profile data remains available;
- hard-coded mood/time-capsule/AI/social content is not converted into user activity;
- a migration marker prevents repeat destructive work.

- [ ] **Step 3: Run tests and verify RED**

```bash
cd app && npm test -- src/services/googleDriveSync.test.ts src/services/dataMigration.test.ts
```

- [ ] **Step 4: Update sync keys and snapshot schema handling**

Keep backward compatibility with existing schema-1 remote files. If adding keys without changing snapshot shape, missing new keys must read as empty rather than invalidating older backups.

- [ ] **Step 5: Implement idempotent migration**

Use a marker such as `babygrowth_v3_migration`. Do not invent activity records from seed/demo UI. Prefer preserving legacy stores untouched over destructive cleanup.

- [ ] **Step 6: Run focused tests**

```bash
cd app && npm test -- src/services/googleDriveSync.test.ts src/services/dataMigration.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run full verification**

```bash
cd app && npm test
cd app && npm run lint
cd app && npm run build
```

Expected: all tests pass, ESLint returns zero errors, TypeScript/Vite production build succeeds.

- [ ] **Step 8: Search for disallowed/demo surfaces**

```bash
cd app && grep -R "Trợ lý Freud\|Growth Score\|Ghi nhận AI\|Time Capsule\|4.85 L\|+180ml\|7.5h" -n src || true
```

Expected: no active product UI matches; test fixtures/documented migration strings are acceptable only when clearly non-rendered.

- [ ] **Step 9: Commit**

```bash
git add app/src app/package-lock.json app/package.json
git commit -m "chore: migrate and sync real tracker data"
```

---

## Final Acceptance Checklist

- [ ] Feeding, baby sleep, diaper, mom mood, medicine/vitamin, pumping, growth and expense actions persist real data.
- [ ] Home metrics are calculated from persisted records or show `Chưa ghi nhận`.
- [ ] Timeline is derived from real data and has no likes/comments/AI/time-capsule demo.
- [ ] Expenses remain navigable and functional.
- [ ] Zodiac remains visible in Profile and isolated from health/reminder logic.
- [ ] Reminder types: feeding, pumping, medicine, vaccination, appointment, custom.
- [ ] Fixed and latest-log-relative reminders work.
- [ ] Reminders are opt-in, with editable suggested defaults.
- [ ] Complete, snooze, and quick-log actions work.
- [ ] Permission is requested only from explicit user action.
- [ ] In-app reminders survive unsupported/denied system notification permissions.
- [ ] Service worker can display notifications and route action clicks when browser support permits.
- [ ] New stores are included in Google Drive sync.
- [ ] Migration is idempotent and does not turn demo content into user history.
- [ ] `npm test`, `npm run lint`, and `npm run build` pass.
