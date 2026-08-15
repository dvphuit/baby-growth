# App Shell Refactor Design

## Goal

Refactor the BabyGrowth application shell so `App.tsx` becomes a thin composition root while preserving existing user-visible behavior, route URLs, persisted state, IndexedDB keys, and Google Drive synchronization semantics.

This refactor also introduces Vitest, React Testing Library, and jsdom to validate the newly extracted boundaries.

## Current Problem

`app/src/App.tsx` currently owns multiple responsibilities at once:

- route composition and route-specific callbacks
- Google Drive auto-sync startup/cleanup
- toast plumbing
- lightbox state
- quick-action dispatch
- modal state for all application modals
- modal lazy-loading and rendering
- top-level layout composition

This makes the file difficult to reason about and makes behavior-preserving changes harder to test in isolation.

## Scope

### In scope

- Extract app-shell responsibilities into focused modules.
- Add Vitest + React Testing Library + jsdom.
- Add focused tests for extracted shell behavior.
- Preserve existing lazy-loading behavior for routes and modals.
- Preserve all existing route paths and callback outcomes.
- Preserve current sync startup, cleanup, and remote-update reload behavior.

### Out of scope

- No UX or visual redesign.
- No changes to Zustand persisted schemas or storage keys.
- No changes to IndexedDB implementation.
- No Google Drive synchronization policy changes.
- No replacement of modal booleans with a state machine or discriminated-union redesign.
- No broad cleanup of feature views such as Home, Growth, Timeline, Expenses, or Profile.
- No broad snapshot-test suite.

## Proposed Architecture

### `hooks/useAutoSyncLifecycle.ts`

Responsibilities:

- Call `startAutoSync()` when mounted.
- Keep the existing disposed-before-start-completes behavior.
- Stop auto-sync when unmounted.
- Register the existing `babygrowth:remote-updated` listener.
- Reload the page on a remote update.
- Preserve the existing behavior of swallowing `startAutoSync()` startup rejection in this shell layer.

Non-responsibilities:

- It must not implement synchronization policy.
- It must not manage Google authentication.
- It must not interpret or rewrite sync-state errors.

The existing `googleDriveSync.ts` service remains the owner of sync behavior and state.

### `hooks/useAppModals.ts`

Responsibilities:

- Own existing ephemeral modal booleans.
- Own `aiChatInitialQuestion`.
- Own `presetPostTagType`.
- Own lightbox source/video state if keeping those controls together produces the smallest and clearest shell API.
- Expose explicit open/close helpers used by the app shell and route callbacks.
- Preserve the current quick-action mapping exactly.

The quick-action mapping must retain current behavior:

- `growth` opens Add Growth.
- `feeding` opens Add Post with `feeding` preset.
- `pumping` opens Add Pumping.
- `smart-expense` and `expense` open Add Expense.
- `sleep`, `diaper`, `vaccine`, `medicine`, and `mood` keep their existing toast behavior.
- `moment`, `diary`, and unknown/default actions open Add Post with `milestone` preset.

`useAppModals` may accept an `addToast` callback so the quick-action mapping remains close to modal orchestration without taking ownership of the toast system.

### `components/app/AppRoutes.tsx`

Responsibilities:

- Own the `<Routes>` tree.
- Keep existing route paths unchanged:
  - `/`
  - `/timeline`
  - `/growth`
  - `/expenses`
  - `/profile`
  - fallback redirect to `/`
- Preserve the current Home score-detail subview behavior.
- Receive callbacks and state through props rather than importing modal internals.
- Keep route surfaces lazy-loaded where they are currently lazy-loaded.

`AppRoutes` is a wiring layer, not a state container.

### `components/app/AppModals.tsx`

Responsibilities:

- Own lazy imports for modal surfaces.
- Own the modal `<Suspense>` fallback.
- Render only modals that are currently open.
- Receive all visibility state and callbacks through props.
- Preserve existing modal props and close/success behavior.

### `App.tsx`

After refactoring, `App.tsx` remains responsible only for top-level composition:

- deriving page-level shell conditions from location
- scroll-to-top-on-navigation behavior
- invoking `useAutoSyncLifecycle`
- invoking `useToast`
- invoking `useAppModals`
- rendering Header, PWA prompt, routes, version badge, BottomNav, lightbox, modals, and PWA update badge
- wiring callbacks between those shell pieces

It should no longer contain the full modal implementation list, quick-action switch, or raw sync lifecycle effect.

## State and Data Flow

### Persisted UI state

`useUIStore` remains unchanged and continues to own persisted UI state such as `currentTab` and `profileMode`. The refactor must not alter its persistence configuration or stored key names.

### Ephemeral shell state

Modal and lightbox state remain non-persisted. Extracting them into a hook changes code location only, not lifecycle semantics.

### Toast flow

The existing `useToast` hook remains the toast owner. Its `addToast` callback is passed into shell orchestration and route components as needed.

### Route flow

Route components continue to receive action callbacks from the shell. They should not be changed to import shell-specific state directly.

### Sync flow

`useAutoSyncLifecycle` delegates all actual synchronization behavior to `startAutoSync()` and only handles React lifecycle integration.

## Error Handling

This is a behavior-preserving refactor. No new user-facing error model is introduced.

For auto-sync startup:

- retain the current asynchronous start behavior
- retain cleanup when a component unmounts before startup resolves
- retain rejection swallowing at the shell lifecycle boundary
- retain the current remote-update full-page reload behavior

The sync service remains responsible for publishing user-facing sync state and errors.

## Testing Strategy

Add these development dependencies:

- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event` if interaction tests benefit from it
- `jsdom`

Add a test script to `package.json`, preferably `vitest run`, plus any minimal Vitest setup/config required for Vite/TypeScript aliases and jsdom.

### `useAutoSyncLifecycle` tests

Verify:

- `startAutoSync()` is called once on mount.
- returned cleanup is called on unmount.
- if unmounted before startup resolves, the eventual stop function is invoked.
- `babygrowth:remote-updated` triggers page reload through a testable wrapper or safely mockable boundary.
- the event listener is removed on unmount.

If direct mocking of `window.location.reload` is brittle in jsdom, introduce the smallest testable helper rather than changing user-visible behavior.

### `useAppModals` tests

Verify representative state transitions and the complete quick-action mapping, especially cases that differ in outcome:

- growth modal
- feeding post preset
- pumping modal
- expense alias handling
- toast-only actions
- default/milestone post behavior
- closing resets any transient state that the current implementation resets

### `AppRoutes` tests

Use mocked feature components to verify:

- key route selection
- fallback redirect behavior
- score-detail versus Home rendering
- route callbacks call the supplied shell handlers

Avoid testing feature-component internals here.

### `AppModals` tests

Use mocked modal components to verify:

- closed modals are not rendered
- open modals receive expected props
- close and success callbacks are passed through correctly
- AI chat initial question and post preset are preserved

### `App` smoke test

Add one lightweight composition-level render test with dependencies mocked enough to catch broken shell wiring. Do not duplicate route or modal tests at this level.

## Validation

Before considering implementation complete, run:

```bash
npm test
npm run lint
npm run build
```

All three must pass.

## Expected Result

The final implementation should make `App.tsx` substantially smaller and easier to scan. Each extracted unit should have one clear responsibility and be independently testable, while the application behaves identically from the user's perspective.
