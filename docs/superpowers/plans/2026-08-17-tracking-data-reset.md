# Tracking Data Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a profile action that clears all post-onboarding tracking data, preserves the onboarding profile and birth measurements, and overwrites the Google Drive backup with the reset state.

**Architecture:** Each Zustand store exposes one focused `resetTrackingData` action. A coordinator pauses auto-sync, invokes all resets, waits for IndexedDB persistence, then calls an explicit Google Drive overwrite operation that bypasses normal conflict resolution. A dedicated Profile danger-zone component owns confirmation, progress, and success/partial-success messaging.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5 persisted to IndexedDB, Vitest 4, Testing Library, Google Drive REST API.

## Global Constraints

- Preserve only onboarding profile fields, the initialized flag, birth measurements/birth record, the age-derived stage, and Google Drive identity/sync configuration.
- Clear all post-onboarding tracking data and do not restore seed/demo records.
- Reset must be idempotent and must build fresh objects rather than mutating seed constants.
- Local reset remains committed if Google Drive upload fails.
- The reset snapshot must replace the remote backup without deleting the Drive AppData file.
- Do not modify or include the unrelated uncommitted `app/src/sw.ts` and `app/src/sw.test.ts` changes in feature commits.

---

### Task 1: Reset Baby and Mom Tracking State

**Files:**
- Modify: `app/src/store/useBabyStore.ts`
- Modify: `app/src/store/useMomStore.ts`
- Create: `app/src/store/trackingProfileReset.test.ts`

**Interfaces:**
- Consumes: existing `FamilyData`, `INITIAL_STAGES`, `INITIAL_DAILY_HABITS`, and `INITIAL_MOM_DATA`.
- Produces: `useBabyStore.getState().resetTrackingData(): void` and `useMomStore.getState().resetTrackingData(): void`.

- [ ] **Step 1: Write failing Baby-store preservation and clearing tests**

Create `trackingProfileReset.test.ts` with literal assertions that distinguish onboarding data from later tracking data:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useBabyStore } from './useBabyStore';
import { useMomStore } from './useMomStore';

describe('tracking profile reset', () => {
  beforeEach(() => {
    useBabyStore.getState().resetToDefaults();
  });

  it('keeps the onboarding profile and exactly one birth measurement', () => {
    useBabyStore.getState().initializeChildProfile({
      childName: 'Bơ', childFullName: 'Nguyễn An', birthDate: '2026-01-05', birthTime: '07:30',
      gender: 'girl', bloodType: 'A+', childAvatar: '/baby.jpg', momName: 'Mai', momAvatar: '/mom.jpg',
      birthWeight: '3.2 kg', birthHeight: '49 cm', headCircAtBirth: '34 cm', hospital: 'Từ Dũ',
    }, { weight: 3.2, height: 49, headCirc: 34 });
    useBabyStore.getState().addGrowthMeasurement({ weight: 5.1, height: 58, headCirc: 38, date: '2026-03-05' });
    useBabyStore.getState().addExpenseRecord({ amount: 120000, category: 'Sữa', occurredAt: '2026-03-06', note: '' });
    useBabyStore.getState().setMonthlyExpenseBudget(9_000_000);

    useBabyStore.getState().resetTrackingData();

    const state = useBabyStore.getState();
    expect(state.familyData).toMatchObject({ childName: 'Bơ', childFullName: 'Nguyễn An', momName: 'Mai', isInitialized: true });
    expect(state.currentStageData().growthHistory).toHaveLength(1);
    expect(state.currentStageData().growthHistory[0]).toMatchObject({ date: '2026-01-05', weight: 3.2, height: 49, headCirc: 34 });
    expect(state.expenseRecords).toEqual([]);
    expect(state.monthlyExpenseBudget).toBe(5_000_000);
    expect(state.currentStageData().todayVitals).toMatchObject({ temperature: '', sleepTotal: '', milkTotal: '', diaperCount: 0, weight: '3.2 kg' });
    expect(state.currentStageData().motorMilestones.items.every((item) => item.status === 'upcoming')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the Baby-store test and verify RED**

Run: `cd app && npm test -- src/store/trackingProfileReset.test.ts`

Expected: FAIL because `resetTrackingData` does not exist.

- [ ] **Step 3: Implement the Baby-store reset action**

Add `resetTrackingData: () => void` to `BabyStoreState`. Implement it by cloning `INITIAL_STAGES` and `INITIAL_DAILY_HABITS`, deriving the current stage from the preserved birth date with the same age boundaries used by onboarding, and rebuilding one `gh_birth` record from `birthWeight`, `birthHeight`, and `headCircAtBirth`. Preserve only these `FamilyData` fields:

```ts
const preservedFamily: FamilyData = {
  isInitialized: true,
  childName, childFullName, birthDate, birthTime, gender, bloodType,
  childAvatar, momName, momAvatar, birthWeight, birthHeight,
  headCircAtBirth, hospital,
};
```

Set expense records to `[]`, budget to `5_000_000`, all tracking vitals to empty/zero except birth weight/height/head circumference, and all milestone statuses to `upcoming` with `dateAchieved: null`. Never assign `INITIAL_STAGES` directly; use `structuredClone(INITIAL_STAGES)`.

- [ ] **Step 4: Add failing Mom-store preservation test**

Append:

```ts
it('keeps Mom identity while clearing Mom tracking metrics', () => {
  useMomStore.setState({ momData: {
    ...useMomStore.getState().momData,
    name: 'Mai',
    wellnessScore: 92,
    pumping: { ...useMomStore.getState().momData.pumping, todayTotal: '180 ml', sessionsToday: 2, history: [{ time: '09:00', amount: '90 ml', note: '' }] },
  }});

  useMomStore.getState().resetTrackingData();

  const mom = useMomStore.getState().momData;
  expect(mom.name).toBe('Mai');
  expect(mom.pumping.history).toEqual([]);
  expect(mom.pumping.sessionsToday).toBe(0);
  expect(mom.pumping.todayTotal).toBe('0 ml');
});
```

- [ ] **Step 5: Run the Mom test and verify RED**

Run: `cd app && npm test -- src/store/trackingProfileReset.test.ts`

Expected: Baby test passes; Mom test fails because its reset action does not exist.

- [ ] **Step 6: Implement Mom reset and verify GREEN**

Add `resetTrackingData: () => void` to `MomStoreState`. Set `momData` to a fresh clone of `INITIAL_MOM_DATA` with `name` copied from the current state. Ensure `INITIAL_MOM_DATA.pumping.todayTotal` is normalized to `'0 ml'` and history is empty in the resulting state.

Run: `cd app && npm test -- src/store/trackingProfileReset.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add app/src/store/useBabyStore.ts app/src/store/useMomStore.ts app/src/store/trackingProfileReset.test.ts
git commit -m "feat: reset profile tracking state"
```

---

### Task 2: Reset Auxiliary Stores to Clean Operational State

**Files:**
- Modify: `app/src/store/useActivityStore.ts`
- Modify: `app/src/store/useTimelineStore.ts`
- Modify: `app/src/store/useChatStore.ts`
- Modify: `app/src/store/useReminderStore.ts`
- Modify: `app/src/store/useUIStore.ts`
- Create: `app/src/store/trackingStoreReset.test.ts`

**Interfaces:**
- Consumes: existing store state and date utilities.
- Produces: `resetTrackingData(): void` on each auxiliary store.

- [ ] **Step 1: Write a failing behavior test covering every persisted auxiliary store**

Create real records with public actions, invoke each wished-for reset action, and assert consumer-visible state:

```ts
expect(useActivityStore.getState()).toMatchObject({ babyActivities: [], momActivities: [] });
expect(useTimelineStore.getState().timelineItems).toEqual([]);
expect(useChatStore.getState().chatMessages).toEqual([]);
expect(useReminderStore.getState()).toMatchObject({ reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false });
expect(useUIStore.getState()).toMatchObject({ currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby' });
```

The test must add at least one activity, timeline item, chat message, reminder, and non-default UI selection before reset so removing any reset implementation makes the test fail.

- [ ] **Step 2: Run the auxiliary-store test and verify RED**

Run: `cd app && npm test -- src/store/trackingStoreReset.test.ts`

Expected: FAIL because the reset actions are missing or because Chat/Timeline currently restore seeded content.

- [ ] **Step 3: Implement minimal reset actions**

Add `resetTrackingData: () => void` to each store interface and initializer:

```ts
// Activity
resetTrackingData: () => set({ babyActivities: [], momActivities: [] }),

// Chat
resetTrackingData: () => set({ chatMessages: [] }),

// Reminder
resetTrackingData: () => set({ reminders: [], occurrenceStates: {}, systemNotificationsEnabled: false }),

// UI
resetTrackingData: () => set({ currentTab: 'home', currentSubView: null, searchQuery: '', profileMode: 'baby' }),
```

Timeline resets `timelineItems` to `[]`, calendar selection to today/current month, view to `collapsed`, filter to `all`, and sub-tab to `feed`.

- [ ] **Step 4: Run auxiliary tests and verify GREEN**

Run: `cd app && npm test -- src/store/trackingStoreReset.test.ts`

Expected: PASS with no demo Timeline or Chat entries.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/src/store/useActivityStore.ts app/src/store/useTimelineStore.ts app/src/store/useChatStore.ts app/src/store/useReminderStore.ts app/src/store/useUIStore.ts app/src/store/trackingStoreReset.test.ts
git commit -m "feat: reset persisted tracking stores"
```

---

### Task 3: Make Reset Persistence and Drive Overwrite Explicit

**Files:**
- Modify: `app/src/services/localDb.ts`
- Create: `app/src/services/localDb.test.ts`
- Modify: `app/src/services/googleDriveSync.ts`
- Create: `app/src/services/googleDriveSync.test.ts`

**Interfaces:**
- Produces: `waitForLocalRecordWrites(keys: readonly string[]): Promise<void>`.
- Produces: `runWithAutoSyncPaused<T>(operation: () => Promise<T>): Promise<T>`.
- Produces: `overwriteDriveBackupWithLocalData(options?: { interactive?: boolean }): Promise<SyncSnapshot>`.

- [ ] **Step 1: Write a failing local-write flush test**

Use a deferred IndexedDB write or spy on the backing write promise, call `indexedDbStorage.setItem('key', 'value')`, then assert `waitForLocalRecordWrites(['key'])` remains pending until that write resolves. Also assert it resolves immediately when no writes are pending.

- [ ] **Step 2: Run localDb test and verify RED**

Run: `cd app && npm test -- src/services/localDb.test.ts`

Expected: FAIL because `waitForLocalRecordWrites` is missing.

- [ ] **Step 3: Track pending writes in localDb**

Maintain `Map<string, Promise<void>>` entries around `writeValue` and `removeValue`. Only delete an entry in `finally` when the map still points at that same promise. Implement:

```ts
export async function waitForLocalRecordWrites(keys: readonly string[]): Promise<void> {
  await Promise.all(keys.map((key) => pendingRecordWrites.get(key) ?? Promise.resolve()));
}
```

Use the same tracking path for `indexedDbStorage.setItem`, `indexedDbStorage.removeItem`, `setLocalRecord`, and `removeLocalRecord`.

- [ ] **Step 4: Write failing Drive overwrite tests**

Stub `VITE_GOOGLE_CLIENT_ID`, Google token callback, `getAllLocalRecords`, and `fetch`. Cover both an existing remote file and no remote file. Assert that overwrite:

```ts
expect(fetch).toHaveBeenCalledWith(
  expect.stringContaining('/upload/drive/v3/files/remote-1?uploadType=multipart'),
  expect.objectContaining({ method: 'PATCH' }),
);
expect(setLocalRecord).toHaveBeenCalledWith(
  'babygrowth_v2_sync_meta',
  expect.stringContaining('lastSyncedFingerprint'),
);
```

Also test that `runWithAutoSyncPaused` restores auto-sync suppression after a rejected operation.

- [ ] **Step 5: Run Drive tests and verify RED**

Run: `cd app && npm test -- src/services/googleDriveSync.test.ts`

Expected: FAIL because overwrite and pause APIs are missing.

- [ ] **Step 6: Implement explicit pause and overwrite operations**

`runWithAutoSyncPaused` must clear any pending debounce timer, set `suppressAutoSync = true`, await the callback, and restore the previous suppression value in `finally`.

`overwriteDriveBackupWithLocalData` must:

```ts
const local = await getLocalSnapshot();
const remoteFile = await findSyncFile(interactive);
const savedFile = await writeRemoteSnapshot(local, remoteFile, interactive);
await saveSyncedState(local, savedFile.id);
publishSyncState({ status: 'synced', conflict: null, error: null, lastSyncedAt: new Date().toISOString() });
return local;
```

It must not call the normal conflict resolver and must not delete the remote file.

- [ ] **Step 7: Verify service tests GREEN**

Run: `cd app && npm test -- src/services/localDb.test.ts src/services/googleDriveSync.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add app/src/services/localDb.ts app/src/services/localDb.test.ts app/src/services/googleDriveSync.ts app/src/services/googleDriveSync.test.ts
git commit -m "feat: persist and upload reset snapshots"
```

---

### Task 4: Coordinate an Idempotent Local-and-Cloud Reset

**Files:**
- Create: `app/src/services/trackingDataReset.ts`
- Create: `app/src/services/trackingDataReset.test.ts`

**Interfaces:**
- Consumes: every store's `resetTrackingData()`, `SYNC_KEYS`, `waitForLocalRecordWrites`, `runWithAutoSyncPaused`, and `overwriteDriveBackupWithLocalData`.
- Produces:

```ts
export type TrackingDataResetResult =
  | { status: 'synced' }
  | { status: 'local-only'; error: string };

export async function resetTrackingData(): Promise<TrackingDataResetResult>;
```

- [ ] **Step 1: Write failing coordinator ordering and partial-success tests**

Mock only persistence and Drive boundaries; use real store reset actions. Assert that all stores are clean before `overwriteDriveBackupWithLocalData` runs, that `waitForLocalRecordWrites` receives `SYNC_KEYS`, and that a rejected Drive upload returns `{ status: 'local-only', error: 'Drive unavailable' }` while local stores remain reset.

Call the coordinator twice and assert the second result leaves exactly one birth record and no recreated demo content.

- [ ] **Step 2: Run coordinator tests and verify RED**

Run: `cd app && npm test -- src/services/trackingDataReset.test.ts`

Expected: FAIL because the coordinator does not exist.

- [ ] **Step 3: Implement the coordinator**

Inside `runWithAutoSyncPaused`, invoke Baby, Mom, Activity, Timeline, Chat, Reminder, and UI resets. Then await `waitForLocalRecordWrites(SYNC_KEYS)`. Catch only the Drive overwrite error to produce `local-only`; allow local reset/persistence failures to reject so the UI can keep its confirmation open.

- [ ] **Step 4: Run coordinator tests and verify GREEN**

Run: `cd app && npm test -- src/services/trackingDataReset.test.ts`

Expected: PASS, including ordering, partial success, and idempotence.

- [ ] **Step 5: Commit Task 4**

```bash
git add app/src/services/trackingDataReset.ts app/src/services/trackingDataReset.test.ts
git commit -m "feat: coordinate tracking data reset"
```

---

### Task 5: Add Profile Danger Zone and Confirmation Flow

**Files:**
- Create: `app/src/components/profile/ResetTrackingDataSection.tsx`
- Create: `app/src/components/profile/ResetTrackingDataSection.test.tsx`
- Modify: `app/src/components/profile/ProfileView.tsx`
- Modify: `app/src/styles/profile.css`

**Interfaces:**
- Consumes: `resetTrackingData(): Promise<TrackingDataResetResult>`, `BottomSheet`, React Router navigation, and `onShowToast(msg, icon?)`.
- Produces: `<ResetTrackingDataSection onShowToast={onShowToast} />` rendered at the bottom of Profile.

- [ ] **Step 1: Write failing confirmation-flow tests**

Mock `resetTrackingData` and render inside `MemoryRouter`. Verify:

1. Clicking “Đặt lại dữ liệu theo dõi” opens copy that names deleted data, preserved profile/birth data, and replacement of the Drive backup.
2. Cancel closes without invoking reset.
3. Confirm invokes reset once and disables both confirmation actions while pending.
4. `{ status: 'synced' }` navigates Home and shows `Đã đặt lại dữ liệu và đồng bộ Google Drive.`
5. `{ status: 'local-only' }` navigates Home and shows a warning containing the returned error.
6. A rejected local reset keeps the sheet open and renders an alert.

- [ ] **Step 2: Run component test and verify RED**

Run: `cd app && npm test -- src/components/profile/ResetTrackingDataSection.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the focused danger-zone component**

Use `BottomSheet` with local `isOpen`, `isResetting`, and `error` state. Guard duplicate submissions at the start of the confirm handler:

```ts
if (isResetting) return;
setIsResetting(true);
setError(null);
try {
  const result = await resetTrackingData();
  if (result.status === 'synced') onShowToast('Đã đặt lại dữ liệu và đồng bộ Google Drive.', '✓');
  else onShowToast(`Đã đặt lại dữ liệu cục bộ. Cần đồng bộ lại Google Drive: ${result.error}`, '⚠️');
  navigate('/');
} catch (resetError) {
  setError(resetError instanceof Error ? resetError.message : 'Không thể đặt lại dữ liệu.');
} finally {
  setIsResetting(false);
}
```

Disable closing/cancel and confirm controls while reset is pending. Use `role="alert"` for local failure text.

- [ ] **Step 4: Integrate with Profile and add scoped styles**

Destructure the existing `onShowToast` prop in `ProfileView`, render the section after `GoogleSyncCard`, and add `profile-reset-*` classes in `profile.css` using existing danger/error color tokens. Do not add inline red hex values when a token exists.

- [ ] **Step 5: Run Profile tests and verify GREEN**

Run: `cd app && npm test -- src/components/profile/ResetTrackingDataSection.test.tsx src/components/app/AppRoutes.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 5**

```bash
git add app/src/components/profile/ResetTrackingDataSection.tsx app/src/components/profile/ResetTrackingDataSection.test.tsx app/src/components/profile/ProfileView.tsx app/src/styles/profile.css
git commit -m "feat: add tracking data reset action"
```

---

### Task 6: Full Verification

**Files:**
- Verify only; fix only files already in scope if failures expose a feature regression.

**Interfaces:**
- Consumes: completed reset feature.
- Produces: evidence that tests, lint, build, and feature diff are clean.

- [ ] **Step 1: Run the full test suite**

Run: `cd app && npm test`

Expected: all test files and tests pass with zero failures.

- [ ] **Step 2: Run lint and production build**

Run: `cd app && npm run lint && npm run build`

Expected: both commands exit 0.

- [ ] **Step 3: Inspect scope and whitespace**

Run:

```bash
git diff --check
git status --short
git log --oneline -8
```

Expected: no whitespace errors; feature commits contain only planned reset files; the pre-existing PWA files remain separate unless intentionally committed by the user.

- [ ] **Step 4: Manually exercise the production build**

Serve `app/dist`, open Profile, seed one item in each tracking category, confirm reset, and verify the Home/Profile surfaces retain the onboarding names and birth measurement while Timeline, expenses, reminders, chat, activities, and Mom pumping history are empty. Verify the UI reports either full sync success or the explicit local-only warning.
