# BabyGrowth Simplification & Local Reminder Design

Date: 2026-08-16
Status: Approved design, pending implementation plan
Repository: `dvphuit/baby-growth`

## 1. Goal

Refocus BabyGrowth from a broad demo-heavy dashboard into a reliable, local-first tracker for baby and mother care. The product should prioritize fast logging, trustworthy daily summaries, real history, growth tracking, expenses, profile information, and reminders.

The redesign must preserve existing useful local-first behavior and avoid adding a backend.

## 2. Product Principles

1. Real user records are the source of truth.
2. No success UI for data that was not actually persisted.
3. No demo/static health values should appear as if they were live user data.
4. Timeline should derive from domain records rather than duplicate them into social-style posts.
5. Reminders are opt-in and configurable by the user.
6. System notification delivery is best effort because the product remains backend-free.
7. Zodiac is retained as profile/entertainment information only and must not influence health guidance.
8. Expenses remain a first-class product area.

## 3. Product Scope

### 3.1 Keep

- Baby tracking: feeding, sleep, diaper, medicine/vitamin, temperature/basic health notes.
- Baby growth: weight, height, head circumference, WHO chart, measurement history, simple milestones.
- Mother tracking: pumping, sleep, mood, recovery notes.
- Timeline/history generated from real persisted records.
- Expenses.
- Profile information.
- Zodiac in profile.
- Google Drive backup/sync.
- PWA/local-first architecture.
- In-app reminders and best-effort system notifications.

### 3.2 Remove or simplify from MVP

- Mock AI Doctor/chat and AI authority-style health advice.
- Growth Score and Wellness Score surfaces.
- Social mechanics: likes, comments, social-post treatment of records.
- AI-generated labels on timeline entries.
- Hard-coded Time Capsule content.
- Hard-coded mood history and health values.
- Hard-coded notification center entries.
- Pro badge.
- Fake PDF export until a real export exists.
- Static/fake vaccination summaries until backed by real records.
- Static skill stars and hard-coded AI/doctor milestone feedback.

## 4. Navigation

Primary bottom navigation:

1. Hôm nay
2. Nhật ký
3. `+` Quick Log
4. Tăng trưởng
5. Chi tiêu

Profile remains accessible from the avatar/header rather than taking a bottom-navigation slot.

## 5. Home / Hôm nay

Home remains split between Baby and Mom modes.

### 5.1 Baby Home

Show only high-value blocks:

- Today summary calculated from real records.
- Quick Log entry points.
- Next reminder(s).
- Recent records.

Suggested calculated fields include:

- Total feeding amount or feeding count today where applicable.
- Diaper count today.
- Total sleep today.
- Last feeding time.
- Next enabled reminder.

If there is no data, show an explicit empty state such as `Chưa ghi nhận` with a relevant log action. Do not substitute seed/demo numbers.

### 5.2 Mom Home

Show:

- Pumping today.
- Sleep recorded today.
- Mood/recovery data if entered.
- Next reminder(s).
- Recent records.

Remove static frozen-milk quantities and hard-coded wellness interpretations unless they are backed by actual user-entered data.

EPDS should not be presented as a score/status unless the full validated questionnaire and scoring flow is implemented.

## 6. Data Architecture

Domain records become the source of truth.

### 6.1 BabyActivity

Supported record kinds:

- `feeding`
- `sleep`
- `diaper`
- `medicine`
- `temperature`
- `health_note`

Representative fields:

- `id`
- `type`
- `occurredAt`
- `createdAt`
- type-specific payload
- optional `note`

Feeding payload may include amount, duration, method, and side when applicable.
Sleep payload may include start/end or duration.
Diaper payload should distinguish wet, dirty, or both.
Medicine payload should include name, dose and time.

### 6.2 MomActivity

Supported record kinds:

- `pumping`
- `sleep`
- `mood`
- `recovery_note`

Pumping keeps amount and side information.

### 6.3 Growth

Keep real growth measurement records for:

- weight
- height
- head circumference

WHO charts and summaries read from these records. Remove fabricated percentile labels or static health conclusions where they are not calculated from actual reference data.

### 6.4 Expenses

Expenses remain in a dedicated store/domain with:

- amount
- category
- date/time
- note
- optional metadata

Support add/edit/delete, period totals, category breakdown, and simple charts where useful.

Expenses do not need to become timeline items by default. A user setting may opt them into the Timeline.

### 6.5 Reminder

Recommended model:

- `id`
- `type`
- `title`
- `enabled`
- `triggerAt`
- `repeat`
- `basedOnLastLog`
- `intervalMinutes`
- `snoozedUntil`
- `status`
- `quickLogAction`
- `createdAt`
- `updatedAt`
- `completedAt`
- optional `note`

Reminder types:

- `feeding`
- `pumping`
- `medicine`
- `vaccination`
- `appointment`
- `custom`

## 7. Quick Log

Every Quick Log action must persist a real record before showing success.

Required first-pass actions:

- Feeding
- Baby sleep
- Diaper
- Pumping
- Mom mood
- Medicine/vitamin
- Growth measurement
- Expense
- Diary/health note where retained

Current toast-only actions must be replaced by persisted records or removed until implemented.

Persistence flow:

1. User submits.
2. Validate.
3. Persist to IndexedDB.
4. Update derived UI selectors/state.
5. Show success only after persistence succeeds.
6. On failure, keep the form state and show an actionable error.

## 8. Timeline / Nhật ký

Timeline becomes a derived chronological view rather than a second copy of user data.

Sources:

- BabyActivity
- MomActivity
- Growth
- Expenses when the user has enabled expense visibility

The timeline selector normalizes these records into display entries and sorts them by event time.

Remove:

- likes
- comments
- `userLiked`
- AI labels
- hard-coded mood-history entries
- Time Capsule demo
- fallback that displays unrelated seed records when a date has no data

Empty dates should show a genuine empty state.

## 9. Growth

Keep:

- current measurements
- WHO charts
- measurement history
- simple milestone tracking

Simplify or remove:

- Growth Score
- score-detail page
- hard-coded score history
- skill star matrix
- AI evaluation text
- doctor-style exercise recommendations unless sourced from a properly designed content system

Stage/age should be derived from date of birth where possible rather than manually maintained as a separate source of truth.

## 10. Expenses

Expenses are explicitly retained.

Scope:

- add/edit/delete expense
- category
- date
- note
- daily/monthly totals
- category breakdown
- simple charting

Expense data should remain isolated from baby/mom health stores.

## 11. Profile

Keep:

- Baby/Mom identity and essential profile data.
- Date of birth and derived age.
- Growth basics where applicable.
- Relevant medical/profile fields entered by the user.
- Google Drive sync.
- Zodiac.
- Reminder/notification settings entry point.

Zodiac is derived from date of birth and treated as entertainment/profile metadata only. It must not feed health scoring, reminders, milestones, or care recommendations.

Remove or hide until real:

- Pro badge
- mock AI Doctor profile card
- fake health PDF export
- static vaccination completion counts
- fake scores

## 12. Reminder & Notification Design

### 12.1 Constraints

The app remains local-only with no Firebase Cloud Messaging, Cloud Functions, or other notification backend.

This means:

- In-app reminders can be reliable when the app is opened/resumed.
- System notifications are best effort using the PWA/service worker.
- The product must not promise exact-time delivery when the browser/PWA is fully closed and the OS does not wake it.

### 12.2 Reminder modes

Support both:

1. Fixed schedule reminders.
2. Relative reminders derived from the most recent relevant log.

Examples:

- Vitamin at 20:00.
- Vaccination/appointment on a specific date.
- Feeding reminder three hours after the latest feeding record.
- Pumping reminder four hours after the latest pumping record.

### 12.3 Defaults

No automatic reminder is enabled by default.

When a user enables a reminder, the app may offer suggested values, but the user must confirm and may edit them.

Suggested values are UI defaults, not medical recommendations and must be worded accordingly.

### 12.4 First release reminder types

- Feeding
- Pumping
- Vitamin/medicine
- Vaccination/appointment
- Custom reminder

### 12.5 User actions

Each due reminder supports:

- `Đã xong`
- `Nhắc lại sau`
- `Ghi nhanh`

`Ghi nhanh` maps to the relevant action/form:

- feeding -> feeding log
- pumping -> Add Pumping
- medicine -> medicine/vitamin log
- vaccination/appointment -> reminder/detail or journal flow
- custom -> reminder detail

### 12.6 Hybrid local architecture

React application responsibilities:

- Reminder CRUD.
- Reminder settings UI.
- Compute due reminders on launch/resume and while active.
- Store reminder state in IndexedDB.
- Render in-app Notification Center.
- Route Quick Log actions.

Service worker responsibilities:

- Display system notifications when requested by the app/runtime.
- Handle notification click/action events supported by the browser.
- Focus/open the app and route the requested action.

IndexedDB is the source of truth for reminders and completion/snooze state.

### 12.7 Permission behavior

- Do not request notification permission on initial app load.
- Request it only after the user deliberately enables a reminder/system-notification feature.
- If denied, keep in-app reminders operational.
- Show a passive status explaining that system notifications are disabled.
- Do not repeatedly re-prompt after denial.

### 12.8 Duplicate prevention

A reminder must have enough state to avoid duplicate delivery on repeated app resume/reload.

At minimum, track the logical scheduled occurrence and whether it has already been surfaced/completed/snoozed.

For recurring reminders, completing one occurrence advances to the next occurrence rather than mutating history ambiguously.

### 12.9 Overdue behavior

When the app resumes:

- detect due and overdue enabled reminders;
- surface overdue items in the in-app center;
- avoid sending multiple duplicate system notifications for the same occurrence;
- preserve the original due time for history/debugging.

## 13. In-App Notification Center

Replace the current hard-coded alert array with real reminder-derived entries.

Show:

- due now
- overdue
- upcoming
- completed/recent history as appropriate

Each entry should expose the same core actions where relevant: complete, snooze, quick log.

The Notification Center must read from Reminder records, not static component constants.

## 14. Stage and Age

Prefer date of birth as the source of truth.

Derived age/stage should drive labels and relevant UI. Avoid a manually selected stage diverging from date-of-birth-derived age unless there is a specific product requirement for overriding it.

## 15. Google Drive Sync

Keep the existing Google Drive appDataFolder sync.

New persisted domains introduced by this refactor must be included in the sync/restore contract so valid activity and reminder records are not omitted.

Sync must preserve local-first behavior: core tracking continues to work without Google authentication or network access.

## 16. Migration

Migration principles:

- Preserve valid user-created Baby/Mom/Growth/Expense/Profile data.
- Preserve existing real pumping and growth records where structurally usable.
- Do not migrate purely hard-coded/demo UI content as if it were user history.
- Create new activity/reminder stores with explicit schema versions.
- Migration must be idempotent so reopening/upgrading does not duplicate records.
- Existing timeline records should only be migrated when they can be confidently mapped to a real domain record; otherwise they may remain legacy/read-only or be omitted from the new derived timeline based on implementation assessment.

No destructive migration should run without a tested backup/restore path.

## 17. Error Handling

### Persistence

- Never show saved/success state before IndexedDB write succeeds.
- On write failure, keep user-entered form data and provide retry.

### Notification API

- Unsupported browser: keep in-app reminders and explain system notifications are unavailable.
- Permission denied: same fallback.
- Service worker unavailable: keep reminder records and in-app behavior.

### Invalid reminder configuration

- Reject impossible/invalid dates or negative intervals.
- Require a valid target/action for reminder types that offer Quick Log.

## 18. Testing Strategy

Automated tests should cover the highest-risk flows.

### Domain and persistence

- Feeding Quick Log creates a persisted feeding record.
- Sleep Quick Log creates a persisted sleep record.
- Diaper Quick Log creates a persisted diaper record.
- Mood Quick Log creates a persisted mom activity.
- Medicine/vitamin creates a real record.
- Failed persistence does not emit a false success state.

### Derived UI

- Home metrics calculate correctly from records.
- Empty states do not use demo values.
- Timeline merges and sorts domain records correctly.
- Timeline does not display unrelated fallback records.

### Reminders

- Fixed reminder becomes due at the configured time.
- Relative feeding reminder uses the latest feeding record.
- Relative pumping reminder uses the latest pumping record.
- Disabled reminders do not fire.
- Complete closes the current occurrence.
- Snooze moves only the current occurrence.
- Quick Log routes to the correct form.
- Resume/reload does not duplicate an already surfaced occurrence.
- Permission denial leaves in-app reminder behavior intact.

### Expenses

- Expense CRUD remains functional.
- Expense summaries remain correct.
- Expense inclusion/exclusion in Timeline follows the setting.

### Profile

- Zodiac calculation is correct on sign boundaries.
- Zodiac has no dependency path into health/reminder logic.

### Migration

- Valid existing user data survives upgrade.
- Demo/static content does not become real history.
- Re-running migration is idempotent.

## 19. Implementation Boundaries

This refactor should improve boundaries only where required by the scope above.

Recommended units:

- activity domain types/store
- reminder domain/store
- reminder scheduler/service
- timeline selector/adapter
- notification service worker adapter
- feature forms/components

Avoid unrelated broad rewrites of styling, routing, or sync infrastructure.

## 20. Success Criteria

The refactor is successful when:

1. Every visible daily metric is derived from persisted user data or clearly displays an empty state.
2. Feeding, sleep, diaper, pumping, mood, medicine/vitamin, growth, and expense Quick Logs persist real data.
3. Timeline contains actual records instead of demo/social content.
4. Expenses and Zodiac remain available.
5. In-app reminders work for fixed and relative schedules.
6. System notifications work where browser/PWA support permits, without promising background exactness.
7. Reminder types are opt-in and configurable.
8. Complete, snooze, and quick-log actions work from reminders.
9. No mock AI Doctor, fake health scores, fake notification entries, or fake health metrics remain in the primary product experience.
10. Existing valid local data and Google Drive sync remain usable through migration.

## 21. Explicit Non-Goals

- Backend notification service.
- FCM or Cloud Functions.
- Guaranteed exact-time notification delivery when the app/browser is fully closed.
- Medical diagnosis or autonomous medical recommendations.
- Social network features.
- Premium/Pro entitlement system.
- Rebuilding the entire UI design system.
