# Tracking Data Reset Design

## Goal

Add a destructive “Đặt lại dữ liệu theo dõi” action that returns the app to a clean post-onboarding state. The reset keeps the family profile, Mom profile fields entered during onboarding, birth measurements, Google Drive connection/sync configuration, and the initialized flag. It removes all tracking data created after onboarding and replaces the Google Drive backup with the reset state.

## Preserved Data

- Baby profile fields collected during onboarding: name, full name, birth date/time, gender, avatar, blood type, hospital, and birth measurement strings.
- Mom identity fields collected during onboarding: name and avatar.
- The baby's birth growth record and the corresponding birth values in the active growth chart.
- The age-appropriate stage derived from the preserved birth date.
- `familyData.isInitialized`, so onboarding does not reopen.
- Google Drive device identity, sync metadata, remote file identity, and auto-sync preference.

## Removed Data

- Baby and Mom activity records.
- Growth measurements after the preserved birth record.
- Daily tracking values and completion state.
- Timeline entries, likes, filters, and calendar selection created after onboarding.
- Pumping history and other Mom tracking metrics while retaining Mom identity.
- Expense records and user-defined monthly budget.
- Reminders, occurrence states, and notification preference.
- AI chat history.
- Transient UI navigation and search state.
- Seed/demo tracking content. The resulting state must be empty rather than restored to sample data.

## Architecture

Create a single reset coordinator service. It is the only public entry point for this operation and owns the sequence across all persisted stores.

Each participating store exposes a narrowly scoped reset action that returns that store to its clean post-onboarding state. The baby store accepts or internally preserves the onboarding snapshot so it can rebuild only the birth record. The Mom store preserves identity fields while clearing tracking metrics. Other stores reset to empty/default operational state.

The coordinator performs these steps:

1. Capture the onboarding fields and birth measurements from the hydrated stores.
2. Reset every tracking store in memory, allowing Zustand persistence to write the new values to IndexedDB.
3. Preserve Google Drive sync metadata rather than deleting the sync record.
4. Request an interactive Google Drive sync so the reset snapshot replaces the existing remote backup.
5. Return a structured result that distinguishes full success from “local reset succeeded, cloud sync failed.”

The coordinator must not delete the IndexedDB database or persisted keys wholesale. Doing so would risk losing setup and sync metadata and would introduce hydration races.

## User Interface

Add a danger-zone section at the bottom of the Profile screen with a “Đặt lại dữ liệu theo dõi” button.

Opening the action shows a confirmation dialog that states:

- Tracking history, expenses, reminders, and chat will be permanently removed.
- The Baby/Mom profile and birth measurements will remain.
- The reset state will replace the Google Drive backup.

The destructive button is disabled while reset and sync are running, preventing duplicate submissions. Cancel closes the dialog without changing data.

After a full success, close the dialog, navigate to Home, and show a success toast. If the local reset succeeds but Drive sync fails, still navigate Home and show a warning that the local data was reset but Google Drive must be synced again. If local reset itself fails, keep the dialog open and show an error without attempting cloud sync.

## Google Drive Behavior

Reset is an intentional local change and must become the authoritative remote state. After persistence completes, the coordinator triggers an interactive sync using the existing Google connection. The sync must upload the reset snapshot rather than restore or merge the older remote tracking data.

Because the normal sync algorithm can report a conflict when both local and remote fingerprints changed, the reset flow needs an explicit “replace remote with current local snapshot” operation. This operation reuses the existing remote file and sync metadata, uploads the local reset snapshot, then updates the last-synced fingerprint and timestamp.

No remote file is deleted. If authorization has expired, the normal Google consent flow may be requested. A failed upload does not roll back the local reset.

## Data Integrity and Error Handling

- Build fresh state objects and arrays so reset state does not share mutable references with seed constants or pre-reset values.
- Identify the preserved birth measurement by its onboarding birth-record semantics, not merely by list position. If no birth record exists, rebuild one from the preserved birth measurement fields when values are valid.
- Wait for all persisted store writes before beginning the Drive upload so the remote snapshot cannot contain a mixture of old and reset records.
- Prevent autosync from racing the explicit remote replacement while reset is in progress.
- Make a second reset idempotent: it produces the same post-onboarding state and does not recreate demo content.

## Testing

Use test-driven development with behavior-level tests:

- The baby-store reset preserves onboarding profile fields, initialization, and exactly one birth record while removing later growth, expenses, habit completion, milestone progress, and budget customizations.
- The Mom-store reset preserves identity and clears pumping/tracking history.
- Activity, timeline, reminder, chat, and UI stores return to their defined clean states.
- The coordinator waits for local persistence, then uploads the reset snapshot through the explicit remote-replacement path.
- A Drive failure returns a partial-success result without restoring deleted local data.
- Repeating reset is idempotent.
- The Profile confirmation can be cancelled, prevents duplicate confirmation while running, and reports full success versus cloud warning correctly.

## Out of Scope

- Undo or trash recovery.
- Multiple family profiles.
- Deleting the Google Drive AppData file or disconnecting Google.
- Changing onboarding or Google authentication behavior.
- Revisiting the PWA splash-screen change.
