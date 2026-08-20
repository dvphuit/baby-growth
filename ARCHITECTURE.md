# BabyGrowth architecture

## Source layout

BabyGrowth uses feature ownership for product code and a small shared layer for reusable code.

```text
src/
├── app/
├── features/
│   ├── activities/
│   ├── home/
│   ├── timeline/
│   ├── growth/
│   ├── expenses/
│   ├── reminders/
│   ├── profile/
│   └── sync/
├── shared/
│   ├── ui/
│   ├── motion/
│   ├── hooks/
│   ├── lib/
│   └── styles/
└── data/
```

The refactor moves existing code into this layout in dependency order. Do not move files only to make the tree match the target. Move a feature when its imports and ownership are clear.

## Dependency direction

`app` may import feature public entry points and shared code.

A feature may import shared code and domain-independent data. A feature must not import another feature's private component, hook, selector, or store file.

`shared` must not import feature code.

## Activity data

Baby and mother activities use the same persisted activity store. `ActivityRecord` is a discriminated union of `BabyActivity` and `MomActivity`.

Persist activity facts such as occurrence time, amount, duration, side, symptoms, and notes. Calculate daily totals through selectors. Do not persist a second daily total when the same value can be calculated from activity records.

The activity registry may hold stable metadata such as labels and icons. Forms and feature-specific presentation stay explicit React code.

## Snapshot contract

`features/sync/appSnapshot.ts` is the application data boundary for backup and restore.

`AppSnapshot` generation 2 has these semantic sections:

- `profile`
- `activities`
- `growth`
- `timeline`
- `expenses`
- `reminders`

The snapshot does not expose Zustand storage keys. `applyAppSnapshot` writes semantic data into the current stores.

The current growth store still contains some historical derived fields inside `StageData`. Those fields remain in the snapshot until the growth feature is split into raw measurements and calculated selectors. New code must not add another derived field to persistence.

## Local persistence

`services/localDb.ts` maps Zustand store names to the current physical namespace, `babygrowth_v4_*`.

The adapter does not read v2 or v3 store records. The app has no migration step for those generations.

Media blobs use a separate IndexedDB object store and are not encoded into the Zustand JSON records.

## Google Drive sync

`features/sync/googleDriveSync.ts` wraps `AppSnapshot` in `SyncSnapshot` schema version 2. The envelope adds conflict-detection metadata:

- `updatedAt`
- `deviceId`
- `fingerprint`

Google Drive sync never reads or writes individual Zustand records. Auto-sync subscribes to domain store changes and exports a new application snapshot when needed.

Schema-1 Drive backups are incompatible with the current generation and are rejected at the parser boundary.

Timeline media uses separate private files in `appDataFolder`. Snapshot data stores Drive file identifiers on timeline media records.

## State rules

Persist raw domain facts. Use selectors for values that can be calculated from those facts.

Examples of derived values include:

- current age
- daily milk total
- daily sleep total
- diaper count
- pumping total
- expense summaries
- growth chart series

UI state such as a selected tab, dialog state, and search text does not belong in the Drive snapshot.

## Component rules

Shared UI components contain reusable interaction and presentation only. Feature components own domain behavior.

Split a large component when one part can have a clear responsibility such as form state, a selector-backed view model, media interaction, or a reusable presentation component. Do not split a file only to reduce its line count.

## Motion and CSS

Motion owns enter, exit, transform, opacity, and gesture animation state.

CSS owns layout, typography, spacing, colors, borders, and static visual state. Shared design tokens belong in `shared/styles`. Feature-specific selectors belong with the feature that uses them.

## Verification

Every architecture wave must pass:

```bash
npm test
npm run lint
npm run build
```

Before removing a component, style, asset, or export, verify that no production consumer remains.
