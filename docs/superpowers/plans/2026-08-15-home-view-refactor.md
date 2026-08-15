# Home View Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `app/src/components/home/HomeView.tsx` into separate Mom/Baby mode views and focused Home sections without changing user-visible behavior.

**Architecture:** `HomeView` becomes a thin `profileMode` selector. `MomHomeView` and `BabyHomeView` own their existing store reads and compose presentational sections through explicit props; a shared `HomeAIBanner` removes duplicated AI-banner markup, and a tiny `homeViewModel.ts` helper centralizes the mood label used by two Baby sections.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, Zustand 5, Vite 7, Vitest 4, React Testing Library, jsdom.

## Global Constraints

- No UX redesign.
- No copy changes.
- No CSS class renaming or styling redesign.
- No Zustand schema or persistence changes.
- No changes to `currentStageData()`, `momData`, IndexedDB, or Google Drive sync behavior.
- No new Context or global state.
- No broad cleanup of unrelated Home dependencies.
- Preserve existing button IDs, `aria-label` values, semantic button elements, and `event.stopPropagation()` behavior.
- Preserve `/profile` navigation and all existing callback behavior.
- `DailyHabits` remains unchanged.
- Use behavior-focused tests; no broad snapshots.
- Final validation from `app/`: `npm test`, `npm run lint`, `npm run build`.

---

## File Structure

### Create

- `app/src/components/home/HomeView.test.tsx` — mode selection and public callback forwarding.
- `app/src/components/home/MomHomeView.tsx` — Mom-mode store boundary and composition.
- `app/src/components/home/MomHomeView.test.tsx` — Mom composition/store-boundary tests.
- `app/src/components/home/BabyHomeView.tsx` — Baby-mode store boundary, derived Home values, profile navigation, and composition.
- `app/src/components/home/BabyHomeView.test.tsx` — Baby composition/store-boundary tests.
- `app/src/components/home/HomeAIBanner.tsx` — shared AI banner for Mom and Baby modes.
- `app/src/components/home/HomeAIBanner.test.tsx` — shared copy/action/stop-propagation tests.
- `app/src/components/home/MomHealthMetrics.tsx` — Mom wellness/frozen-milk cards.
- `app/src/components/home/MomHealthMetrics.test.tsx` — Mom score display/action tests.
- `app/src/components/home/MomTodayTracker.tsx` — Mom pumping/sleep/EPDS tracker rows.
- `app/src/components/home/MomTodayTracker.test.tsx` — Mom tracker data/action tests.
- `app/src/components/home/BabyTodaySummary.tsx` — Baby progress/insight/growth summary.
- `app/src/components/home/BabyTodaySummary.test.tsx` — summary display/action tests.
- `app/src/components/home/BabyHealthMetrics.tsx` — Baby growth/mood cards and profile action.
- `app/src/components/home/BabyHealthMetrics.test.tsx` — metrics display/action tests.
- `app/src/components/home/BabyTodayTracker.tsx` — feeding/sleep/diaper/health/mood tracker rows.
- `app/src/components/home/BabyTodayTracker.test.tsx` — tracker fallback/data/action tests.
- `app/src/components/home/BabyCareResources.tsx` — care-guide header and three resource cards.
- `app/src/components/home/BabyCareResources.test.tsx` — resource toast-action tests.
- `app/src/components/home/homeViewModel.ts` — shared `getMoodLabel()` helper for Baby sections.
- `app/src/components/home/homeViewModel.test.ts` — mood-label mapping/fallback tests.

### Modify

- `app/src/components/home/HomeView.tsx` — remove Mom/Baby feature-store reads and all mode JSX; retain only `profileMode` selection and public prop forwarding.
- `app/src/components/home/MomHomeView.tsx` — progressively replace inline sections with focused components.
- `app/src/components/home/BabyHomeView.tsx` — progressively replace inline sections with focused components.

### Leave Unchanged

- `app/src/components/home/DailyHabits.tsx`
- `app/src/store/useBabyStore.ts`
- `app/src/store/useMomStore.ts`
- `app/src/store/useUIStore.ts`
- `app/src/types/index.ts`
- all CSS files and sync/persistence services

---

### Task 1: Establish the Mom/Baby Mode Boundary

**Files:**
- Create: `app/src/components/home/HomeView.test.tsx`
- Create: `app/src/components/home/MomHomeView.tsx`
- Create: `app/src/components/home/MomHomeView.test.tsx`
- Create: `app/src/components/home/BabyHomeView.tsx`
- Create: `app/src/components/home/BabyHomeView.test.tsx`
- Modify: `app/src/components/home/HomeView.tsx`

**Interfaces:**
- Preserve `HomeViewProps` exactly:

```ts
interface HomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}
```

- Produce `MomHomeViewProps`:

```ts
export interface MomHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}
```

- Produce `BabyHomeViewProps`:

```ts
export interface BabyHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}
```

- `MomHomeView` owns `useMomStore(s => s.momData)`.
- `BabyHomeView` owns `useBabyStore(s => s.currentStageData())`, `useBabyStore(s => s.dailyHabits)`, and `useNavigate()`.

- [ ] **Step 1: Write the failing `HomeView` mode-selection tests**

Create `HomeView.test.tsx`. Mock `useUIStore`, `MomHomeView`, and `BabyHomeView` so the test verifies selection and prop forwarding without feature markup:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeView } from './HomeView';

let profileMode: 'baby' | 'mom' = 'baby';

vi.mock('@/store/useUIStore', () => ({
  useUIStore: (selector: (state: { profileMode: 'baby' | 'mom' }) => unknown) =>
    selector({ profileMode }),
}));

vi.mock('./MomHomeView', () => ({
  MomHomeView: (props: {
    onOpenScoreDetail: () => void;
    onOpenAiChat: () => void;
    onOpenPumping: () => void;
  }) => (
    <div>
      Mom Home marker
      <button onClick={props.onOpenScoreDetail}>mom score</button>
      <button onClick={props.onOpenAiChat}>mom ai</button>
      <button onClick={props.onOpenPumping}>mom pumping</button>
    </div>
  ),
}));

vi.mock('./BabyHomeView', () => ({
  BabyHomeView: (props: {
    onOpenScoreDetail: () => void;
    onOpenQuickLog: () => void;
    onOpenAiChat: () => void;
  }) => (
    <div>
      Baby Home marker
      <button onClick={props.onOpenScoreDetail}>baby score</button>
      <button onClick={props.onOpenQuickLog}>baby quick log</button>
      <button onClick={props.onOpenAiChat}>baby ai</button>
    </div>
  ),
}));
```

Test both modes and representative callbacks:

```tsx
it('renders BabyHomeView in baby mode and forwards callbacks', () => {
  profileMode = 'baby';
  const onOpenScoreDetail = vi.fn();
  const onOpenQuickLog = vi.fn();
  const onOpenAiChat = vi.fn();

  render(
    <HomeView
      onOpenScoreDetail={onOpenScoreDetail}
      onOpenQuickLog={onOpenQuickLog}
      onOpenAiChat={onOpenAiChat}
      onOpenPumping={vi.fn()}
    />,
  );

  expect(screen.getByText('Baby Home marker')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'baby quick log' }));
  expect(onOpenQuickLog).toHaveBeenCalledTimes(1);
});

it('renders MomHomeView in mom mode and forwards callbacks', () => {
  profileMode = 'mom';
  const onOpenPumping = vi.fn();

  render(
    <HomeView
      onOpenScoreDetail={vi.fn()}
      onOpenQuickLog={vi.fn()}
      onOpenAiChat={vi.fn()}
      onOpenPumping={onOpenPumping}
    />,
  );

  expect(screen.getByText('Mom Home marker')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'mom pumping' }));
  expect(onOpenPumping).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/components/home/HomeView.test.tsx
```

Expected: FAIL because `MomHomeView.tsx` and `BabyHomeView.tsx` do not exist yet.

- [ ] **Step 3: Move the current Mom branch verbatim into `MomHomeView.tsx`**

Create `MomHomeView.tsx` by moving the entire current `if (isMom) { return (...) }` JSX into this component. Keep all existing Mom-mode strings, IDs, classes, styles, button types, and event handlers unchanged.

The component starts as:

```tsx
import { useMomStore } from '@/store/useMomStore';
import {
  ArrowRight,
  Bot,
  Heart,
  HeartPulse,
  Milk,
  Moon,
  MoreHorizontal,
  Plus,
  Settings,
} from 'lucide-react';

export interface MomHomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const MomHomeView: React.FC<MomHomeViewProps> = ({
  onOpenScoreDetail,
  onOpenAiChat,
  onOpenPumping,
  onShowToast,
}) => {
  const momData = useMomStore((state) => state.momData);

  return (
    <div className="home-view-container">
      {/* Move the existing Mom-mode markup here without copy/DOM changes. */}
    </div>
  );
};
```

Do not “improve” hardcoded display values such as `4.85 L`, `24 túi trữ an toàn`, `+180ml`, or `7.5h` in this task; preserving them is part of behavior preservation.

- [ ] **Step 4: Move the current Baby branch verbatim into `BabyHomeView.tsx`**

Create `BabyHomeView.tsx`. Move the existing Baby-mode JSX and existing calculations here. Keep `DailyHabits` unchanged.

The top-level logic must remain:

```tsx
const navigate = useNavigate();
const currentStageData = useBabyStore((state) => state.currentStageData());
const dailyHabits = useBabyStore((state) => state.dailyHabits);
const completedHabitsCount = dailyHabits.filter((habit) => habit.completed).length;
const totalHabitsCount = dailyHabits.length;
const todayInsight = !currentStageData.todayVitals.milkTotal
  ? 'Hôm nay bé chưa có ghi chép về cữ bú.'
  : !currentStageData.todayVitals.sleepTotal
    ? 'Bé đã có ghi chép ăn uống; hãy cập nhật thêm giấc ngủ hôm nay.'
    : 'Các chỉ số chính của bé đang được theo dõi tốt hôm nay.';
```

Keep the existing local mood mapping/helper in this file for now. It will move only when two extracted sections need it.

- [ ] **Step 5: Reduce `HomeView.tsx` to mode selection only**

`HomeView.tsx` becomes:

```tsx
import { useUIStore } from '@/store/useUIStore';
import { BabyHomeView } from './BabyHomeView';
import { MomHomeView } from './MomHomeView';

interface HomeViewProps {
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenAiChat: () => void;
  onOpenPumping: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
  const profileMode = useUIStore((state) => state.profileMode);

  if (profileMode === 'mom') {
    return (
      <MomHomeView
        onOpenScoreDetail={props.onOpenScoreDetail}
        onOpenAiChat={props.onOpenAiChat}
        onOpenPumping={props.onOpenPumping}
        onShowToast={props.onShowToast}
      />
    );
  }

  return (
    <BabyHomeView
      onOpenScoreDetail={props.onOpenScoreDetail}
      onOpenQuickLog={props.onOpenQuickLog}
      onOpenAiChat={props.onOpenAiChat}
      onShowToast={props.onShowToast}
    />
  );
};
```

- [ ] **Step 6: Add mode-view smoke tests before further extraction**

Create `MomHomeView.test.tsx` with a mocked `useMomStore` fixture and verify the current Mom landmarks/actions still exist:

```tsx
expect(screen.getByRole('button', { name: 'Xem chi tiết chỉ số hồi phục của mẹ' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Ghi nhận cữ hút sữa mẹ' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Mở tư vấn AI' })).toBeInTheDocument();
```

Create `BabyHomeView.test.tsx` with mocked `useBabyStore` and `useNavigate` fixtures and verify:

```tsx
expect(screen.getByText('Tóm tắt hôm nay')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Xem chi tiết điểm tăng trưởng' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Xem hồ sơ chi tiết của bé' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Mở tư vấn AI' })).toBeInTheDocument();
```

Mock `DailyHabits` to a marker in this test so the test remains focused on Baby Home composition rather than its store behavior.

- [ ] **Step 7: Run all Task 1 tests**

Run:

```bash
npm test -- src/components/home/HomeView.test.tsx src/components/home/MomHomeView.test.tsx src/components/home/BabyHomeView.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/components/home/HomeView.tsx src/components/home/HomeView.test.tsx src/components/home/MomHomeView.tsx src/components/home/MomHomeView.test.tsx src/components/home/BabyHomeView.tsx src/components/home/BabyHomeView.test.tsx
git commit -m "refactor(home): split mom and baby views"
```

---

### Task 2: Extract the Shared AI Banner

**Files:**
- Create: `app/src/components/home/HomeAIBanner.tsx`
- Create: `app/src/components/home/HomeAIBanner.test.tsx`
- Modify: `app/src/components/home/MomHomeView.tsx`
- Modify: `app/src/components/home/BabyHomeView.tsx`

**Interfaces:**

```ts
export interface HomeAIBannerProps {
  description: string;
  openButtonId: string;
  onOpenAiChat: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}
```

The shared component owns the exact fixed copy:

```text
Hỏi trợ lý AI
Gợi ý dựa trên ghi chép hôm nay
AI chỉ mang tính tham khảo
Mở tư vấn
Tùy chỉnh
Tùy chỉnh trợ lý AI sẽ có trong bản cập nhật sau.
```

- [ ] **Step 1: Write failing `HomeAIBanner` tests**

Create `HomeAIBanner.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeAIBanner } from './HomeAIBanner';

it('renders mode-specific description and opens AI chat', () => {
  const onOpenAiChat = vi.fn();

  render(
    <HomeAIBanner
      description="Về giấc ngủ, bú và phát triển của bé"
      openButtonId="btnOpenAiBanner"
      onOpenAiChat={onOpenAiChat}
    />,
  );

  expect(screen.getByText('Về giấc ngủ, bú và phát triển của bé')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mở tư vấn AI' }));
  expect(onOpenAiChat).toHaveBeenCalledTimes(1);
});

it('preserves the customize toast message', () => {
  const onShowToast = vi.fn();
  render(
    <HomeAIBanner
      description="Về phục hồi, giấc ngủ và sức khỏe của mẹ"
      openButtonId="btnOpenAiFromHome"
      onOpenAiChat={vi.fn()}
      onShowToast={onShowToast}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh trợ lý AI' }));
  expect(onShowToast).toHaveBeenCalledWith(
    'Tùy chỉnh trợ lý AI sẽ có trong bản cập nhật sau.',
  );
});
```

Add a parent click-spy test to verify both action buttons still call `event.stopPropagation()`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/components/home/HomeAIBanner.test.tsx
```

Expected: FAIL because `HomeAIBanner.tsx` does not exist.

- [ ] **Step 3: Implement `HomeAIBanner` by moving duplicated markup once**

Create the component using the current banner DOM/classes exactly. The action handlers must remain:

```tsx
onClick={(event) => {
  event.stopPropagation();
  onOpenAiChat();
}}
```

and:

```tsx
onClick={(event) => {
  event.stopPropagation();
  onShowToast?.('Tùy chỉnh trợ lý AI sẽ có trong bản cập nhật sau.');
}}
```

Assign `id={openButtonId}` to the “Mở tư vấn” button so Mom keeps `btnOpenAiFromHome` and Baby keeps `btnOpenAiBanner`.

- [ ] **Step 4: Replace both inline banners**

In `MomHomeView.tsx`:

```tsx
<HomeAIBanner
  description="Về phục hồi, giấc ngủ và sức khỏe của mẹ"
  openButtonId="btnOpenAiFromHome"
  onOpenAiChat={onOpenAiChat}
  onShowToast={onShowToast}
/>
```

In `BabyHomeView.tsx`:

```tsx
<HomeAIBanner
  description="Về giấc ngủ, bú và phát triển của bé"
  openButtonId="btnOpenAiBanner"
  onOpenAiChat={onOpenAiChat}
  onShowToast={onShowToast}
/>
```

- [ ] **Step 5: Run banner and mode-view tests**

Run:

```bash
npm test -- src/components/home/HomeAIBanner.test.tsx src/components/home/MomHomeView.test.tsx src/components/home/BabyHomeView.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/components/home/HomeAIBanner.tsx src/components/home/HomeAIBanner.test.tsx src/components/home/MomHomeView.tsx src/components/home/BabyHomeView.tsx
git commit -m "refactor(home): share ai banner"
```

---

### Task 3: Extract Mom Health and Tracker Sections

**Files:**
- Create: `app/src/components/home/MomHealthMetrics.tsx`
- Create: `app/src/components/home/MomHealthMetrics.test.tsx`
- Create: `app/src/components/home/MomTodayTracker.tsx`
- Create: `app/src/components/home/MomTodayTracker.test.tsx`
- Modify: `app/src/components/home/MomHomeView.tsx`

**Interfaces:**

```ts
export interface MomHealthMetricsProps {
  wellnessScore: number;
  onOpenScoreDetail: () => void;
}

export interface MomTodayTrackerProps {
  todayTotal: string;
  sessionsToday: number;
  sleepDebt: string;
  epdsScore: string;
  onOpenPumping: () => void;
}
```

- [ ] **Step 1: Write failing `MomHealthMetrics` tests**

Verify exact behavior:

```tsx
render(<MomHealthMetrics wellnessScore={88} onOpenScoreDetail={onOpenScoreDetail} />);
expect(screen.getByText('88')).toBeInTheDocument();
expect(screen.getByText('4.85 L')).toBeInTheDocument();
expect(screen.getByText('24 túi trữ an toàn')).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết chỉ số hồi phục của mẹ' }));
expect(onOpenScoreDetail).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Write failing `MomTodayTracker` tests**

Verify:

```tsx
render(
  <MomTodayTracker
    todayTotal="540 ml"
    sessionsToday={3}
    sleepDebt="2.5h"
    epdsScore="4/30"
    onOpenPumping={onOpenPumping}
  />,
);
expect(screen.getByText('540 ml (3 cữ)')).toBeInTheDocument();
expect(screen.getByText('2.5h')).toBeInTheDocument();
expect(screen.getByText('4/30 (Rất an toàn)')).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: 'Ghi nhận cữ hút sữa mẹ' }));
expect(onOpenPumping).toHaveBeenCalledTimes(1);
```

Also click the `+ Thêm` button and assert the same callback fires.

- [ ] **Step 3: Run both focused tests and verify RED**

Run:

```bash
npm test -- src/components/home/MomHealthMetrics.test.tsx src/components/home/MomTodayTracker.test.tsx
```

Expected: FAIL because both production components are missing.

- [ ] **Step 4: Implement `MomHealthMetrics`**

Move the Mom section title, two metric cards, and carousel indicators exactly as they exist. Keep the hardcoded frozen-milk values unchanged.

- [ ] **Step 5: Implement `MomTodayTracker`**

Move the `Nhật ký hôm nay` heading and all three Mom tracker rows. Preserve:

```text
+180ml
7.5h
(Rất an toàn)
Tốt
```

and all existing classes/aria labels.

- [ ] **Step 6: Reduce `MomHomeView` to composition**

The body becomes:

```tsx
return (
  <div className="home-view-container">
    <MomHealthMetrics
      wellnessScore={momData.wellnessScore}
      onOpenScoreDetail={onOpenScoreDetail}
    />
    <MomTodayTracker
      todayTotal={momData.pumping.todayTotal}
      sessionsToday={momData.pumping.sessionsToday}
      sleepDebt={momData.mentalHealth.sleepDebt}
      epdsScore={momData.mentalHealth.epdsScore}
      onOpenPumping={onOpenPumping}
    />
    <HomeAIBanner
      description="Về phục hồi, giấc ngủ và sức khỏe của mẹ"
      openButtonId="btnOpenAiFromHome"
      onOpenAiChat={onOpenAiChat}
      onShowToast={onShowToast}
    />
  </div>
);
```

- [ ] **Step 7: Run Mom tests**

Run:

```bash
npm test -- src/components/home/MomHealthMetrics.test.tsx src/components/home/MomTodayTracker.test.tsx src/components/home/MomHomeView.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/components/home/MomHealthMetrics.tsx src/components/home/MomHealthMetrics.test.tsx src/components/home/MomTodayTracker.tsx src/components/home/MomTodayTracker.test.tsx src/components/home/MomHomeView.tsx
git commit -m "refactor(home): split mom home sections"
```

---

### Task 4: Extract Baby Summary and Health Metrics

**Files:**
- Create: `app/src/components/home/BabyTodaySummary.tsx`
- Create: `app/src/components/home/BabyTodaySummary.test.tsx`
- Create: `app/src/components/home/BabyHealthMetrics.tsx`
- Create: `app/src/components/home/BabyHealthMetrics.test.tsx`
- Create: `app/src/components/home/homeViewModel.ts`
- Create: `app/src/components/home/homeViewModel.test.ts`
- Modify: `app/src/components/home/BabyHomeView.tsx`
- Modify: `app/src/components/home/BabyHomeView.test.tsx`

**Interfaces:**

```ts
export function getMoodLabel(mood?: string): string;

export interface BabyTodaySummaryProps {
  currentAgeText: string;
  completedHabitsCount: number;
  totalHabitsCount: number;
  todayInsight: string;
  growthScore?: number | null;
  onOpenQuickLog: () => void;
}

export interface BabyHealthMetricsProps {
  growthScore?: number | null;
  growthScoreLabel?: string;
  mood?: string;
  onOpenScoreDetail: () => void;
  onOpenQuickLog: () => void;
  onOpenProfile: () => void;
}
```

- [ ] **Step 1: Write the pure mood-label tests**

Create `homeViewModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getMoodLabel } from './homeViewModel';

describe('getMoodLabel', () => {
  it.each([
    ['Overjoyed', 'Rất vui'],
    ['Happy', 'Vui vẻ'],
    ['Neutral', 'Bình thường'],
    ['Sad', 'Buồn'],
    ['Depressed', 'Cần được quan tâm'],
  ])('maps %s to %s', (input, expected) => {
    expect(getMoodLabel(input)).toBe(expected);
  });

  it('returns the original value for unknown moods', () => {
    expect(getMoodLabel('Curious')).toBe('Curious');
  });

  it('returns the existing empty fallback', () => {
    expect(getMoodLabel()).toBe('Chưa cập nhật');
  });
});
```

- [ ] **Step 2: Write failing `BabyTodaySummary` tests**

Verify both score states and quick-log action:

```tsx
expect(screen.getByText('2/5 việc')).toBeInTheDocument();
expect(screen.getByText('Dành cho 8 tháng 12 ngày')).toBeInTheDocument();
expect(screen.getByText('Điểm tăng trưởng 92/100')).toBeInTheDocument();
```

and with `growthScore={null}`:

```tsx
expect(screen.getByText('Chưa có điểm tăng trưởng')).toBeInTheDocument();
```

- [ ] **Step 3: Write failing `BabyHealthMetrics` tests**

Verify:

```tsx
expect(screen.getByText('92')).toBeInTheDocument();
expect(screen.getByText('Tối ưu')).toBeInTheDocument();
expect(screen.getByText('Rất vui')).toBeInTheDocument();
```

Click and assert all three actions:

```text
Xem chi tiết điểm tăng trưởng -> onOpenScoreDetail
Cập nhật tâm trạng của bé     -> onOpenQuickLog
Xem hồ sơ chi tiết của bé     -> onOpenProfile
```

Also verify existing fallbacks: score `—`, label `Chưa cập nhật`, empty mood `Chưa cập nhật`.

- [ ] **Step 4: Run Task 4 focused tests and verify RED**

Run:

```bash
npm test -- src/components/home/homeViewModel.test.ts src/components/home/BabyTodaySummary.test.tsx src/components/home/BabyHealthMetrics.test.tsx
```

Expected: FAIL because the new production files are missing.

- [ ] **Step 5: Implement `homeViewModel.ts`**

```ts
const MOOD_LABELS: Record<string, string> = {
  Overjoyed: 'Rất vui',
  Happy: 'Vui vẻ',
  Neutral: 'Bình thường',
  Sad: 'Buồn',
  Depressed: 'Cần được quan tâm',
};

export function getMoodLabel(mood?: string): string {
  if (!mood) return 'Chưa cập nhật';
  return MOOD_LABELS[mood] ?? mood;
}
```

Remove the duplicate helper from `BabyHomeView.tsx` after both Baby sections use this module.

- [ ] **Step 6: Implement `BabyTodaySummary`**

Move the exact `Tóm tắt hôm nay` heading/progress badge and `.today-summary-card` markup. Keep:

```tsx
{growthScore != null
  ? `Điểm tăng trưởng ${growthScore}/100`
  : 'Chưa có điểm tăng trưởng'}
```

and the exact `+ Ghi chép` button.

- [ ] **Step 7: Implement `BabyHealthMetrics`**

Move the `Chỉ số sức khỏe` section title, profile button, metric cards, and carousel indicators. Use `getMoodLabel(mood)` for mood copy. Preserve IDs:

```text
btnOpenFreudScore
btnOpenMoodTracker
```

- [ ] **Step 8: Update `BabyHomeView` composition and preserve navigation ownership**

Keep `useNavigate()` in `BabyHomeView` and pass:

```tsx
<BabyHealthMetrics
  growthScore={currentStageData.growthScore}
  growthScoreLabel={currentStageData.growthScoreLabel}
  mood={currentStageData.todayVitals.mood}
  onOpenScoreDetail={onOpenScoreDetail}
  onOpenQuickLog={onOpenQuickLog}
  onOpenProfile={() => navigate('/profile')}
/>
```

Use:

```tsx
<BabyTodaySummary
  currentAgeText={currentStageData.currentAgeText}
  completedHabitsCount={completedHabitsCount}
  totalHabitsCount={totalHabitsCount}
  todayInsight={todayInsight}
  growthScore={currentStageData.growthScore}
  onOpenQuickLog={onOpenQuickLog}
/>
```

- [ ] **Step 9: Strengthen `BabyHomeView.test.tsx` around derived data/navigation**

Use separate store fixtures to verify the three existing `todayInsight` branches:

```text
milkTotal=''                              -> Hôm nay bé chưa có ghi chép về cữ bú.
milkTotal='540 ml', sleepTotal=''         -> Bé đã có ghi chép ăn uống; hãy cập nhật thêm giấc ngủ hôm nay.
milkTotal='540 ml', sleepTotal='12h 30p'  -> Các chỉ số chính của bé đang được theo dõi tốt hôm nay.
```

Click the profile action exposed by the mocked `BabyHealthMetrics` and assert:

```ts
expect(navigate).toHaveBeenCalledWith('/profile');
```

- [ ] **Step 10: Run Task 4 and Baby composition tests**

Run:

```bash
npm test -- src/components/home/homeViewModel.test.ts src/components/home/BabyTodaySummary.test.tsx src/components/home/BabyHealthMetrics.test.tsx src/components/home/BabyHomeView.test.tsx
```

Expected: PASS.

- [ ] **Step 11: Commit Task 4**

```bash
git add src/components/home/homeViewModel.ts src/components/home/homeViewModel.test.ts src/components/home/BabyTodaySummary.tsx src/components/home/BabyTodaySummary.test.tsx src/components/home/BabyHealthMetrics.tsx src/components/home/BabyHealthMetrics.test.tsx src/components/home/BabyHomeView.tsx src/components/home/BabyHomeView.test.tsx
git commit -m "refactor(home): split baby summary and metrics"
```

---

### Task 5: Extract Baby Tracker and Care Resources

**Files:**
- Create: `app/src/components/home/BabyTodayTracker.tsx`
- Create: `app/src/components/home/BabyTodayTracker.test.tsx`
- Create: `app/src/components/home/BabyCareResources.tsx`
- Create: `app/src/components/home/BabyCareResources.test.tsx`
- Modify: `app/src/components/home/BabyHomeView.tsx`

**Interfaces:**

```ts
export interface BabyTodayTrackerProps {
  milkTotal: string;
  sleepTotal: string;
  diaperCount?: number | null;
  temperature: string;
  mood: string;
  moodEmoji: string;
  growthScore?: number | null;
  onOpenQuickLog: () => void;
}

export interface BabyCareResourcesProps {
  onShowToast?: (message: string, icon?: string) => void;
}
```

- [ ] **Step 1: Write failing `BabyTodayTracker` populated-state test**

Use:

```tsx
render(
  <BabyTodayTracker
    milkTotal="540 ml"
    sleepTotal="12h 30p"
    diaperCount={6}
    temperature="36.8°C"
    mood="Happy"
    moodEmoji="😊"
    growthScore={92}
    onOpenQuickLog={onOpenQuickLog}
  />,
);
```

Assert:

```text
540 ml trong ngày
12h 30p
6 lần trong ngày
36.8°C
Đang vui vẻ
😊
92
```

Click `+ Thêm` and every tracker button aria-label; each must call `onOpenQuickLog`.

- [ ] **Step 2: Add tracker fallback tests**

Render empty values and assert existing fallbacks:

```text
Chưa cập nhật
Cập nhật
—
```

For `diaperCount={0}`, assert `0 lần trong ngày` and `Đã ghi nhận`, preserving the current `!= null` semantics.

- [ ] **Step 3: Write failing `BabyCareResources` tests**

Verify the header and all three titles remain:

```text
Cẩm nang Chăm sóc
Thực đơn ăn dặm giàu sắt từ 8 tháng?
Rèn bé tự ngủ xuyên đêm không quấy?
Lịch tiêm phòng quan trọng năm đầu đời
```

Click `Xem tất cả` and assert:

```ts
expect(onShowToast).toHaveBeenCalledWith('Cẩm nang chi tiết đang được hoàn thiện.');
```

Click each resource card and assert the existing message:

```ts
expect(onShowToast).toHaveBeenCalledWith('Bài viết này sẽ mở trong phiên bản tiếp theo.');
```

Also render without `onShowToast` and ensure clicks do not throw.

- [ ] **Step 4: Run focused tests and verify RED**

Run:

```bash
npm test -- src/components/home/BabyTodayTracker.test.tsx src/components/home/BabyCareResources.test.tsx
```

Expected: FAIL because the production components are missing.

- [ ] **Step 5: Implement `BabyTodayTracker`**

Move the exact `Nhật ký hôm nay` heading and all five tracker rows. Import and use `getMoodLabel` from `homeViewModel.ts`. Preserve all `data-action`, aria labels, class names, sparkline SVG path, inline status text, and fallback conditions.

- [ ] **Step 6: Implement `BabyCareResources`**

Move the exact care-guide heading and the three resource cards. Keep the explicit three buttons rather than introducing a data-driven renderer in this refactor; this minimizes DOM changes and scope.

- [ ] **Step 7: Finish `BabyHomeView` composition**

After `DailyHabits`, summary, and health metrics, wire:

```tsx
<BabyTodayTracker
  milkTotal={currentStageData.todayVitals.milkTotal}
  sleepTotal={currentStageData.todayVitals.sleepTotal}
  diaperCount={currentStageData.todayVitals.diaperCount}
  temperature={currentStageData.todayVitals.temperature}
  mood={currentStageData.todayVitals.mood}
  moodEmoji={currentStageData.todayVitals.moodEmoji}
  growthScore={currentStageData.growthScore}
  onOpenQuickLog={onOpenQuickLog}
/>
<HomeAIBanner
  description="Về giấc ngủ, bú và phát triển của bé"
  openButtonId="btnOpenAiBanner"
  onOpenAiChat={onOpenAiChat}
  onShowToast={onShowToast}
/>
<BabyCareResources onShowToast={onShowToast} />
```

- [ ] **Step 8: Run all Baby tests**

Run:

```bash
npm test -- src/components/home/BabyTodaySummary.test.tsx src/components/home/BabyHealthMetrics.test.tsx src/components/home/BabyTodayTracker.test.tsx src/components/home/BabyCareResources.test.tsx src/components/home/BabyHomeView.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit Task 5**

```bash
git add src/components/home/BabyTodayTracker.tsx src/components/home/BabyTodayTracker.test.tsx src/components/home/BabyCareResources.tsx src/components/home/BabyCareResources.test.tsx src/components/home/BabyHomeView.tsx
git commit -m "refactor(home): split baby tracker and resources"
```

---

### Task 6: Integration Regression Pass and Final Verification

**Files:**
- Modify only if a regression test exposes a real issue:
  - `app/src/components/home/HomeView.test.tsx`
  - `app/src/components/home/MomHomeView.test.tsx`
  - `app/src/components/home/BabyHomeView.test.tsx`
  - extracted Home section files/tests from Tasks 2–5

**Interfaces:**
- No new production interfaces in this task.
- This task verifies the final architecture and behavior contract from the design spec.

- [ ] **Step 1: Add one final public-surface regression test per mode**

In `HomeView.test.tsx`, keep the mode-selection mocks and verify `onShowToast` is forwarded to the selected mode by adding a mock-mode button that invokes:

```ts
props.onShowToast?.('probe', '🧪');
```

Assert the original `HomeView` callback receives both arguments.

In `MomHomeView.test.tsx`, verify current Mom fixture values still render through extracted sections.

In `BabyHomeView.test.tsx`, verify `DailyHabits` marker remains in the Baby composition between summary/metrics flow without changing `DailyHabits` itself.

- [ ] **Step 2: Run the complete Home test set**

Run:

```bash
npm test -- src/components/home
```

Expected: all Home tests PASS.

- [ ] **Step 3: Run the complete project test suite**

Run:

```bash
npm test
```

Expected: all project tests PASS with zero failures.

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS with zero ESLint errors.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite production bundle both PASS.

- [ ] **Step 6: Review the final diff for scope drift**

Run from repository root:

```bash
git diff master...HEAD -- app/src/components/home docs/superpowers
```

Confirm:

```text
HomeView.tsx is a thin mode selector.
MomHomeView.tsx and BabyHomeView.tsx own only their mode store reads/composition.
DailyHabits.tsx is unchanged.
No CSS file changed.
No store/type/persistence/sync file changed.
No copy, route, aria-label, button ID, or callback semantics changed.
No generic actions/context abstraction was introduced.
```

- [ ] **Step 7: Commit any final test-only adjustments**

If Step 1 required changes, commit only those test adjustments:

```bash
git add src/components/home/*.test.ts src/components/home/*.test.tsx
git commit -m "test(home): cover refactored home composition"
```

If there are no changes, do not create an empty commit.

- [ ] **Step 8: Re-run fresh verification after the last commit**

Run:

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected: tests/lint/build PASS and `git status --short` is empty.
