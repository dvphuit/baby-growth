# Home View Refactor Design

## Goal

Refactor `app/src/components/home/HomeView.tsx` into smaller, focused components without changing user-visible behavior, routes, store schemas, or data semantics.

## Non-goals

- No UX redesign.
- No copy changes.
- No CSS class renaming or styling redesign.
- No Zustand schema or persistence changes.
- No changes to `currentStageData()`, `momData`, IndexedDB, or Google Drive sync behavior.
- No new Context or global state.
- No broad cleanup of unrelated Home dependencies.

## Architecture

Use a mode-first, section-second structure:

```text
HomeView
├── MomHomeView
│   ├── MomHealthMetrics
│   ├── MomTodayTracker
│   └── HomeAIBanner
└── BabyHomeView
    ├── BabyTodaySummary
    ├── DailyHabits
    ├── BabyHealthMetrics
    ├── BabyTodayTracker
    ├── HomeAIBanner
    └── BabyCareResources
```

`HomeView` becomes a thin mode selector. It reads `profileMode` and renders either `MomHomeView` or `BabyHomeView`.

`MomHomeView` owns the Mom-mode store read from `useMomStore` and passes normalized values/callbacks to Mom sections.

`BabyHomeView` owns Baby-mode store reads from `useBabyStore` and passes normalized values/callbacks to Baby sections. `DailyHabits` remains unchanged and continues to own its existing behavior.

## Component Boundaries

### `HomeView`

Responsibilities:

- Read `profileMode` from `useUIStore`.
- Preserve the existing public props:
  - `onOpenScoreDetail`
  - `onOpenQuickLog`
  - `onOpenAiChat`
  - `onOpenPumping`
  - `onShowToast`
- Render `MomHomeView` when `profileMode === 'mom'`; otherwise render `BabyHomeView`.

It must not read Mom/Baby feature stores after the refactor.

### `MomHomeView`

Responsibilities:

- Read `momData` from `useMomStore`.
- Render the Mom-mode Home composition.
- Forward callbacks to Mom sections.

Sections:

- `MomHealthMetrics`: wellness score and frozen-milk summary.
- `MomTodayTracker`: pumping, sleep debt, and EPDS rows.
- `HomeAIBanner`: shared reusable AI banner configured with Mom copy.

### `BabyHomeView`

Responsibilities:

- Read `currentStageData` and `dailyHabits` from `useBabyStore`.
- Compute only Baby Home view-model values already computed in `HomeView` today:
  - completed habit count
  - total habit count
  - today insight text
- Own profile navigation through `useNavigate`.
- Render the Baby-mode Home composition.

Sections:

- `BabyTodaySummary`: progress badge, age, today insight, growth-score text, quick-log action.
- `DailyHabits`: existing component, unchanged.
- `BabyHealthMetrics`: growth card, mood card, profile-navigation action.
- `BabyTodayTracker`: feeding, sleep, diaper, health, and mood rows.
- `HomeAIBanner`: shared reusable AI banner configured with Baby copy.
- `BabyCareResources`: care-guide header and resource cards.

### `HomeAIBanner`

Shared presentational component for both modes.

Props should be explicit and small:

- description/copy string
- `onOpenAiChat`
- optional `onShowToast`

It preserves existing button labels, IDs, aria labels, event propagation behavior, and customize-toast message.

## Data Flow

Data flow remains one-way and explicit.

- `HomeView` selects mode only.
- `MomHomeView` reads Mom store data.
- `BabyHomeView` reads Baby store data.
- Section components receive plain props and callbacks.
- No section introduces a new store dependency solely for convenience.
- `DailyHabits` is the exception because it already owns its existing state/store behavior.

Do not introduce a generic `actions` object or shared Home context. Each component receives only the callbacks it uses.

## Behavior Preservation

The refactor must preserve:

- Exact Mom/Baby mode selection behavior.
- Exact route navigation to `/profile` from Baby health metrics.
- Exact callback wiring for score detail, quick log, pumping, AI chat, and toast actions.
- Existing button IDs, `aria-label` values, and semantic button elements.
- Existing text/copy and fallback strings.
- Existing optional behavior when `onShowToast` is omitted.
- Existing `event.stopPropagation()` behavior in AI banner actions.
- Existing CSS class names and DOM class structure wherever practical so visual output is unchanged.

## Error Handling

No new error model is introduced.

- Optional toast callbacks remain optional.
- No new retry, fallback UI, error boundary, or store error state is added.
- Existing navigation and callback failures are not reinterpreted by these components.

## Testing Strategy

Use Vitest + React Testing Library already present in the repository. Tests focus on behavior boundaries rather than broad snapshots.

### `HomeView`

Verify mode selection:

- `profileMode='mom'` renders `MomHomeView`.
- Baby/default mode renders `BabyHomeView`.
- Existing callbacks are forwarded to the selected view.

### `MomHomeView`

Verify:

- wellness/mom data appears in the correct sections.
- score-detail action is forwarded.
- pumping actions are forwarded.
- AI open action is forwarded.
- customize AI action preserves the current toast message.

### `BabyHomeView`

Verify:

- summary values derived from `currentStageData` and habits are correct.
- quick-log actions are forwarded.
- score-detail action is forwarded.
- profile navigation targets `/profile`.
- AI open action is forwarded.
- care-resource actions preserve current toast messages.

### Section tests

Add focused tests only where a section has meaningful conditional rendering or callback wiring. Avoid snapshots and avoid retesting Zustand internals.

`HomeAIBanner` should have a direct test for its shared copy and both actions because it is used in both modes.

## Verification

Final verification commands from `app/`:

```bash
npm test
npm run lint
npm run build
```

All must pass before integration.

## Acceptance Criteria

- `HomeView.tsx` is a thin mode selector.
- Mom and Baby modes live in separate view components.
- Large, independently understandable Home sections are extracted according to this spec.
- Shared AI banner duplication is removed without changing behavior.
- No user-visible behavior, route, copy, store schema, persistence, or sync semantics change.
- New focused tests cover mode selection and important callback/conditional-rendering boundaries.
- `npm test`, `npm run lint`, and `npm run build` pass.
