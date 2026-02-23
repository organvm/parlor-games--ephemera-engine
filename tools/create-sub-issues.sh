#!/usr/bin/env bash
set -euo pipefail

# Create sub-issues for all 226 tasks across 24 epics
# Usage: ./tools/create-sub-issues.sh [spec]
# Where [spec] is one of: 001 002 003 004 005 006 all
# Default: all

REPO="organvm-iii-ergon/parlor-games--ephemera-engine"
SPEC="${1:-all}"
CREATED=0
FAILED=0
LOG_FILE="tools/sub-issues-log.txt"

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local parent_epic="$4"

  echo "Creating: $title (parent: #$parent_epic)"

  # Create the issue
  local issue_url
  issue_url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels" 2>&1) || {
    echo "  FAILED to create: $title" | tee -a "$LOG_FILE"
    FAILED=$((FAILED + 1))
    return 1
  }

  # Extract issue number from URL
  local issue_num
  issue_num=$(echo "$issue_url" | grep -o '[0-9]*$')
  echo "  Created #$issue_num" | tee -a "$LOG_FILE"

  # Get the REST API issue ID (required by sub-issues API, different from number)
  local issue_id
  issue_id=$(gh api "repos/$REPO/issues/$issue_num" --jq '.id' 2>/dev/null) || {
    echo "  WARNING: Created #$issue_num but failed to get issue ID for linking" | tee -a "$LOG_FILE"
    CREATED=$((CREATED + 1))
    sleep 1
    return 0
  }

  # Link as sub-issue (API requires integer ID, not issue number; -F sends as integer)
  gh api \
    --method POST \
    "repos/$REPO/issues/$parent_epic/sub_issues" \
    -F "sub_issue_id=$issue_id" > /dev/null 2>&1 || {
    echo "  WARNING: Created #$issue_num but failed to link to #$parent_epic" | tee -a "$LOG_FILE"
  }

  CREATED=$((CREATED + 1))
  sleep 1  # Rate limit courtesy
}

# ============================================================
# SPEC 001: Auth & Sessions (12 tasks → 4 epics)
# ============================================================
create_spec_001() {
  echo "=== SPEC 001: Auth & Sessions (12 tasks) ==="

  # Epic #1: Project Setup & DB Schema (Phase 1: T1-T3)
  create_issue \
    "T001: Initialize Expo Project and Core Dependencies" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Low

## Description
Bootstrap the React Native + Expo project with TypeScript strict mode, install core dependencies, and configure the development environment.

## Deliverables
- Initialize Expo project with TypeScript template
- Install dependencies: `@supabase/supabase-js`, `expo-secure-store`, `expo-linking`, `expo-apple-authentication`, `@react-native-google-signin/google-signin`, `zustand`, `expo-sqlite`
- Configure `tsconfig.json` with strict mode
- Configure `app.json` with URL scheme, bundle ID, deep link associations

## Files
- `package.json`
- `tsconfig.json`
- `app.json`
- `.env.example`

## Dependencies
None
BODY
)" \
    "spec:001-auth,P0" \
    1

  create_issue \
    "T002: Supabase Project Configuration" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Low

## Description
Set up the Supabase project with auth providers, database schema, and RLS policies.

## Deliverables
- Enable email/password, Apple, and Google auth providers in Supabase dashboard
- Configure Apple Sign-In (client ID, redirect URL)
- Configure Google Sign-In (client ID, client secret)
- Enable anonymous auth for web players
- Configure JWT expiry (1 hour access, 30 day refresh)
- Set up email templates (verification, password reset)

## Files
- `supabase/config.toml`

## Dependencies
None (can run parallel with T001)
BODY
)" \
    "spec:001-auth,P0" \
    1

  create_issue \
    "T003: Database Schema Migration" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the database schema as defined in `data-model.md`. Apply via Supabase migration.

## Deliverables
- Create enum types: `auth_provider`, `game_type`, `session_state`, `participant_role`, `rsvp_status`
- Create tables: `users`, `sessions`, `session_participations`, `session_state_log`
- Create indexes per `data-model.md` section 3
- Create triggers: state transition validation, state transition logging, host auto-activation, updated_at
- Enable RLS on all tables
- Create RLS policies per `data-model.md` section 5
- Create `transition_session_state` RPC function for atomic state transitions

## Files
- `supabase/migrations/001_create_enums.sql`
- `supabase/migrations/002_create_users_table.sql`
- `supabase/migrations/003_create_sessions_table.sql`
- `supabase/migrations/004_create_session_participations_table.sql`
- `supabase/migrations/005_create_session_state_log_table.sql`
- `supabase/migrations/006_create_indexes.sql`
- `supabase/migrations/007_create_triggers.sql`
- `supabase/migrations/008_create_rls_policies.sql`
- `supabase/migrations/009_create_rpc_functions.sql`

## Dependencies
T002
BODY
)" \
    "spec:001-auth,P0" \
    1

  # Epic #2: Core Authentication Flows (Phase 2: T4-T6)
  create_issue \
    "T004: Supabase Client and Token Storage" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Low

## Description
Initialize the Supabase client with Expo SecureStore adapter for persistent, encrypted token storage.

## Deliverables
- Create Supabase client singleton with SecureStore storage adapter
- Configure `autoRefreshToken`, `persistSession`, `detectSessionInUrl`
- Create typed wrapper for SecureStore operations
- Add environment variable loading for Supabase URL and anon key

## Files
- `src/lib/supabase.ts`
- `src/lib/secure-store.ts`
- `src/types/database.ts`

## Dependencies
T001, T003
BODY
)" \
    "spec:001-auth,P0" \
    2

  create_issue \
    "T005: Auth Screens and Flows" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement sign-up, sign-in, and profile creation screens with all three auth providers.

## Deliverables
- Welcome screen (3-step walkthrough, skippable)
- Sign-up screen: email form, Apple button, Google button
- Sign-in screen: email form, social auth buttons
- Email verification prompt screen
- Profile setup screen (display name, optional avatar)
- Auth error handling with user-friendly messages
- Password reset flow (request + confirmation)

## Files
- `src/app/(auth)/welcome.tsx`
- `src/app/(auth)/sign-up.tsx`
- `src/app/(auth)/sign-in.tsx`
- `src/app/(auth)/verify-email.tsx`
- `src/app/(auth)/reset-password.tsx`
- `src/lib/auth.ts`

## Dependencies
T004
BODY
)" \
    "spec:001-auth,P0" \
    2

  create_issue \
    "T006: Auth State Management and Route Guard" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement Zustand auth store, auth state hook, and route guard that redirects unauthenticated users to auth screens.

## Deliverables
- Zustand auth store: user object, session, loading state, auth methods
- `useAuth` hook: provides auth state and actions to components
- Root layout with auth guard: redirects to `(auth)` group when not authenticated
- Auto-refresh token on app foreground
- Profile creation trigger: on first sign-up, insert into `public.users`
- Host auto-activation detection: listen for `is_host` changes

## Files
- `src/stores/auth-store.ts`
- `src/hooks/use-auth.ts`
- `src/app/_layout.tsx`
- `src/types/auth.ts`

## Dependencies
T005
BODY
)" \
    "spec:001-auth,P0" \
    2

  # Epic #3: Session State Machine (Phase 3: T7-T9)
  create_issue \
    "T007: Session CRUD Operations" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement session creation, reading, updating, and listing with proper RLS enforcement.

## Deliverables
- `useSession` hook: create, read, update, list operations via Supabase client
- Session creation flow: game type picker, session basics form (name, date, guest count), config
- Session list on Home screen: filtered by state (upcoming, active, completed, archived)
- Session detail screen: shows config, state, participant count
- Auto-save during configuration (debounced updates)
- Concurrent session limit enforcement (max 5 non-terminal)

## Files
- `src/hooks/use-session.ts`
- `src/app/(tabs)/index.tsx`
- `src/app/session/create.tsx`
- `src/app/session/[id]/index.tsx`
- `src/app/session/[id]/edit.tsx`
- `src/types/session.ts`

## Dependencies
T006
BODY
)" \
    "spec:001-auth,P0" \
    3

  create_issue \
    "T008: Session State Machine (Client + Server)" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement the session state machine with client-side validation, server-side RPC function, and state transition logging.

## Deliverables
- Pure TypeScript state machine: `VALID_TRANSITIONS` map, `canTransition()` function
- `useSessionState` hook: validates transition client-side, calls `transition_session_state` RPC
- State transition RPC function in PostgreSQL: validates, updates, logs atomically
- Optimistic locking: `WHERE state = $expected_state` pattern
- Notification dispatch stubs for each transition
- UI: state badge on session cards, transition buttons on session detail

## Files
- `src/utils/session-state-machine.ts`
- `src/hooks/use-session-state.ts`
- `src/constants/session-states.ts`
- `supabase/migrations/009_create_rpc_functions.sql`

## Dependencies
T007
BODY
)" \
    "spec:001-auth,P0" \
    3

  create_issue \
    "T009: Deep Link Generation and Invite Code" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Low

## Description
Generate unique invite codes on DRAFT -> INVITING transition and configure deep link resolution.

## Deliverables
- Invite code generator: 8-character alphanumeric, collision-resistant
- Deep link URL format: `https://ephemera.app/join/{invite_code}`
- Expo Linking configuration for Universal Links (iOS) and App Links (Android)
- Deep link handler: resolve invite code to session, navigate to invitation screen
- Share sheet integration: host can share invite link via system share dialog

## Files
- `src/utils/deep-link.ts`
- `src/app/session/[id]/invite.tsx`
- `app.json`
- `public/.well-known/apple-app-site-association`
- `public/.well-known/assetlinks.json`

## Dependencies
T008
BODY
)" \
    "spec:001-auth,P0" \
    3

  # Epic #4: Guest Mode & Settings (Phase 4: T10-T12)
  create_issue \
    "T010: Web Player Join Flow" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement the web player guest mode: anonymous auth, session cookie, RSVP, and email collection.

## Deliverables
- Web join page: loads session by invite code, displays invitation details
- Anonymous Supabase auth: `signInAnonymously()` on page load
- Session cookie management: store anonymous session ID, 30-day expiry, httpOnly, SameSite=Strict
- RSVP form: display name entry, Accept/Decline/Maybe buttons
- Email collection prompt: shown after RSVP acceptance or before artifact delivery
- Create `session_participations` record with `role = 'web_player'`

## Files
- `web/join/[invite-code].tsx`
- `web/contribute/[session-id].tsx`
- `web/lib/guest-auth.ts`

## Dependencies
T009
BODY
)" \
    "spec:001-auth,P0" \
    4

  create_issue \
    "T011: Settings Screen" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Low

## Description
Implement the settings screen with notification preferences, accessibility settings, and theme selection.

## Deliverables
- Settings screen layout: sections for notifications, accessibility, theme, account
- Notification preferences: per-category toggles, quiet hours configuration
- Accessibility settings: text size, high contrast, reduce motion, written answer mode
- Theme selection: Warm / Dark / System
- Settings persistence: Zustand store with server sync on change
- `useSettings` hook: provides current preferences and update methods
- Account section: sign out, delete account (with confirmation)

## Files
- `src/app/(tabs)/settings.tsx`
- `src/stores/settings-store.ts`
- `src/hooks/use-settings.ts`
- `src/constants/notification-categories.ts`

## Dependencies
T006
BODY
)" \
    "spec:001-auth,P0" \
    4

  create_issue \
    "T012: Integration Tests" \
    "$(cat <<'BODY'
**Spec**: 001 | **Priority**: P0 | **Estimate**: Medium

## Description
Write integration tests for all critical paths defined in `quickstart.md`.

## Deliverables
- Test setup: Supabase local (Docker) + Vitest configuration
- Auth tests: sign-up (all providers), sign-in, sign-out, token refresh, invalid credentials
- Session CRUD tests: create, read, update, list, RLS isolation
- State machine tests: all valid transitions, all invalid transitions, concurrent transitions
- Guest mode tests: anonymous auth, cookie persistence, RSVP, email collection
- Settings tests: save, restore, sync across devices
- RLS policy tests: participant isolation, host-only writes, invite code lookup

## Files
- `tests/setup.ts`
- `tests/auth.test.ts`
- `tests/session-crud.test.ts`
- `tests/session-state-machine.test.ts`
- `tests/guest-mode.test.ts`
- `tests/settings.test.ts`
- `tests/rls-policies.test.ts`
- `vitest.config.ts`

## Dependencies
T003–T011 (tests validate all prior work)
BODY
)" \
    "spec:001-auth,P0" \
    4

  echo "=== SPEC 001 complete: $CREATED created, $FAILED failed ==="
}

# ============================================================
# SPEC 002: Pre-Game Lifecycle (19 tasks → 4 epics)
# ============================================================
create_spec_002() {
  echo "=== SPEC 002: Pre-Game Lifecycle (19 tasks) ==="

  # Epic #5: Pre-Game Database Foundation (Phase 1: T1-T6)
  create_issue \
    "T001: Create invitation_tokens migration" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 2 hours

## Description
Write the invitation_tokens database migration with all columns, constraints, indexes, and RLS policies.

## Deliverables
- Write `supabase/migrations/002_invitation_tokens.sql`
- Create `invitation_tokens` table with all columns and constraints
- Add indexes (token unique, session_id, session_shared)
- Add RLS policies (host management, public read by token)
- Write rollback migration
- Test: token CRUD, RLS enforcement, constraint validation

## Files
- `supabase/migrations/002_invitation_tokens.sql`

## Dependencies
001 sessions table exists
BODY
)" \
    "spec:002-pregame,P0" \
    5

  create_issue \
    "T002: Create contributions migration" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 3 hours

## Description
Write the contributions database migration with JSONB content, triggers, indexes, and RLS policies.

## Deliverables
- Write `supabase/migrations/003_contributions.sql`
- Create `contributions` table with all columns, constraints, and JSONB content
- Add `updated_at` trigger function
- Add indexes (session, participant, session+status, session+type, unique per type)
- Add RLS policies (player own CRUD, host read+update)
- Write rollback migration
- Test: contribution CRUD, draft/submitted/reviewed transitions, RLS for player vs host

## Files
- `supabase/migrations/003_contributions.sql`

## Dependencies
001 sessions, session_participations tables exist
BODY
)" \
    "spec:002-pregame,P0" \
    5

  create_issue \
    "T003: Create notification infrastructure migration" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Create the notification queue, push tokens, and notification preferences tables with helper functions and pg_cron job.

## Deliverables
- Write `supabase/migrations/004_notification_queue.sql`
- Create `notification_queue`, `push_tokens`, `notification_preferences` tables
- Create helper functions: `should_suppress_notification`, `should_batch_notification`, `notification_category_group`
- Create `enqueue_notification` function with dedup/batch/preference logic
- Create `process_pending_notifications` function for pg_cron
- Schedule pg_cron job (every 15 minutes)
- Add all indexes and RLS policies

## Files
- `supabase/migrations/004_notification_queue.sql`

## Dependencies
001 users table exists
BODY
)" \
    "spec:002-pregame,P0" \
    5

  create_issue \
    "T004: Create content_packs and user_content_packs migration" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P1 | **Estimate**: 2 hours

## Description
Create the content_packs and user_content_packs tables for the content store.

## Deliverables
- Write `supabase/migrations/005_content_packs.sql`
- Create `content_packs` table with YAML-schema-aligned columns
- Create `user_content_packs` junction table
- Add indexes and RLS policies (public read for catalog, user read for owned)
- Write rollback migration
- Test: pack CRUD, ownership recording, public browsing RLS

## Files
- `supabase/migrations/005_content_packs.sql`

## Dependencies
001 users table exists
BODY
)" \
    "spec:002-pregame,P1" \
    5

  create_issue \
    "T005: Create role assignment migration" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P2 | **Estimate**: 2 hours

## Description
Create the role assignment schema additions for character assignment and preferences.

## Deliverables
- Write `supabase/migrations/006_role_assignments.sql`
- Add `character_data`, `character_assigned_at`, `contribution_deadline`, `timezone` columns to `session_participations`
- Add `contribution_deadline` column to `sessions`
- Create `character_preferences` table
- Add indexes and RLS policies

## Files
- `supabase/migrations/006_role_assignments.sql`

## Dependencies
001 session_participations table exists
BODY
)" \
    "spec:002-pregame,P2" \
    5

  create_issue \
    "T006: Seed bundled content data" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Seed the bundled content packs into the database with correct item counts matching PRD requirements.

## Deliverables
- Write `supabase/seed/bundled-content.sql`
- Insert bundled content packs (Confession Album questions, Murder Mystery seeds/eras/archetypes)
- Validate item counts match PRD 2.8.1 (35 Classic Proust, 20 Thematic Remix, 10 Vanity Fair, 10 Pivot/Lipton, 5 Setting Seeds, 10 Eras, 30 Archetypes, 10 Crime Mechanics)
- Mark all bundled packs with `is_bundled = true`
- Test: bundled content loads correctly, item_count matches actual items array length

## Files
- `supabase/seed/bundled-content.sql`

## Dependencies
T004
BODY
)" \
    "spec:002-pregame,P0" \
    5

  # Epic #6: Pre-Game Backend Services (Phase 2: T7-T9)
  create_issue \
    "T007: Implement send-notification Edge Function" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Implement the Edge Function that dispatches push and email notifications from the queue.

## Deliverables
- Create `supabase/functions/send-notification/index.ts`
- Listen for `dispatch_notification` pg_notify events
- Read pending/ready notifications from queue
- Resolve recipient push tokens from `push_tokens` table
- Apply quiet hours logic (check recipient timezone, reschedule if needed)
- Send push via Expo Push API (batch up to 100)
- Send email via transactional email API (Resend/Postmark) for web players
- Update notification_queue status (sent/failed) and delivery timestamps
- Handle Expo Push API errors (DeviceNotRegistered -> deactivate token)

## Files
- `supabase/functions/send-notification/index.ts`

## Dependencies
T003
BODY
)" \
    "spec:002-pregame,P0" \
    6

  create_issue \
    "T008: Implement process-iap-receipt Edge Function" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P1 | **Estimate**: 5 hours

## Description
Implement the Edge Function for validating in-app purchase receipts from Apple and Google.

## Deliverables
- Create `supabase/functions/process-iap-receipt/index.ts`
- Validate Apple receipts via App Store Server API v2 (JWS verification)
- Validate Google receipts via Google Play Developer API
- On valid receipt: insert into `user_content_packs`, generate signed download URL
- On invalid receipt: return 400 with error details
- Store validated receipt data for audit

## Files
- `supabase/functions/process-iap-receipt/index.ts`

## Dependencies
T004
BODY
)" \
    "spec:002-pregame,P1" \
    6

  create_issue \
    "T009: Create Supabase Storage buckets and policies" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 2 hours

## Description
Create storage buckets for contribution photos and content packs with RLS policies.

## Deliverables
- Create `contribution-photos` bucket (2MB limit, image types only)
- Create `content-packs` bucket (5MB limit, JSON only)
- Write RLS policies for contribution-photos (contributor upload, contributor+host read)
- Write RLS policies for content-packs (owner download only)
- Test: upload as contributor, read as host, deny read as other player, download owned pack

## Files
- Supabase Storage configuration

## Dependencies
T002, T004
BODY
)" \
    "spec:002-pregame,P0" \
    6

  # Epic #7: Pre-Game Client Infrastructure (Phase 3: T10-T15)
  create_issue \
    "T010: Implement deep link configuration and resolution" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 5 hours

## Description
Configure deep links for iOS/Android and implement the deep link resolution handler.

## Deliverables
- Configure `expo.ios.associatedDomains` and `expo.android.intentFilters` in app config
- Create `apple-app-site-association` and `assetlinks.json` files for the web domain
- Implement `useDeepLink` hook using expo-router's `useLocalSearchParams`
- Create `app/invite/[token].tsx` route that resolves token and renders invitation
- Implement `deeplink.service.ts` with token validation against backend
- Handle edge cases: expired token, invalid token, already-RSVPed user

## Files
- `app/invite/[token].tsx`
- `src/services/deeplink.service.ts`
- `src/hooks/useDeepLink.ts`

## Dependencies
T001
BODY
)" \
    "spec:002-pregame,P0" \
    7

  create_issue \
    "T011: Build invitation and RSVP UI components" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Build the host invitation composer and player RSVP components with real-time dashboard.

## Deliverables
- Create `InvitationComposer.tsx` (host: generate link, share via system share sheet)
- Create `SessionInvitation.tsx` (player: view invitation details, RSVP buttons)
- Create `RsvpDashboard.tsx` (host: real-time RSVP matrix with counts)
- Implement `useRsvpStatus` hook with Supabase Realtime subscription
- Implement `useInvitationToken` hook for token generation
- Style invitation screen to match "atmosphere, not rules document" principle

## Files
- `src/components/InvitationComposer.tsx`
- `src/components/SessionInvitation.tsx`
- `src/components/RsvpDashboard.tsx`
- `src/hooks/useRsvpStatus.ts`
- `src/hooks/useInvitationToken.ts`

## Dependencies
T010
BODY
)" \
    "spec:002-pregame,P0" \
    7

  create_issue \
    "T012: Build contribution form and dashboard" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 8 hours

## Description
Build the schema-driven contribution form with auto-save, photo upload, and host dashboard.

## Deliverables
- Create `ContributionBrief.tsx` (player: narratively-framed brief display)
- Create `ContributionForm.tsx` (schema-driven form with React Hook Form + Zod)
- Create `PhotoUpload.tsx` (expo-image-picker + expo-image-manipulator compression)
- Implement `useAutoSave` hook (30-second interval, save to MMKV, sync on submit)
- Create `ContributionDashboard.tsx` (host: matrix with submitted/pending/overdue cells)
- Implement `useContribution` hook (CRUD, draft management, status transitions)
- Implement `useContributionMatrix` hook (Supabase Realtime subscription for host)
- Style brief and form to be narratively motivated, not generic

## Files
- `src/components/ContributionBrief.tsx`
- `src/components/ContributionForm.tsx`
- `src/components/PhotoUpload.tsx`
- `src/components/ContributionDashboard.tsx`
- `src/hooks/useAutoSave.ts`
- `src/hooks/useContribution.ts`
- `src/hooks/useContributionMatrix.ts`

## Dependencies
T002, T009
BODY
)" \
    "spec:002-pregame,P0" \
    7

  create_issue \
    "T013: Implement push notification client" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 5 hours

## Description
Implement the client-side push notification registration, handling, and preferences.

## Deliverables
- Implement `usePushRegistration` hook (request permission, get Expo push token, store in DB)
- Implement `useNotificationHandler` hook (foreground display, background handling, tap routing)
- Register notification categories for iOS (invitation RSVP actions)
- Create `NotificationPreferences.tsx` settings screen
- Handle token refresh on app launch

## Files
- `src/hooks/usePushRegistration.ts`
- `src/hooks/useNotificationHandler.ts`
- `src/components/NotificationPreferences.tsx`

## Dependencies
T003, T007
BODY
)" \
    "spec:002-pregame,P0" \
    7

  create_issue \
    "T014: Build content store UI" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P1 | **Estimate**: 7 hours

## Description
Build the content store for browsing, purchasing, and managing content packs.

## Deliverables
- Create `StoreHome.tsx` (browse packs by game type, grid/list layout)
- Create `PackDetail.tsx` (description, preview items, purchase button)
- Create `PurchaseButton.tsx` (triggers native IAP dialog)
- Implement `useContentPacks` hook (fetch catalog, track ownership)
- Implement `useIAP` hook (react-native-iap integration: products, purchase, restore)
- Implement `useContentLibrary` hook (local content management, merge on download)
- Handle purchase restoration flow

## Files
- `src/screens/StoreHome.tsx`
- `src/screens/PackDetail.tsx`
- `src/components/PurchaseButton.tsx`
- `src/hooks/useContentPacks.ts`
- `src/hooks/useIAP.ts`
- `src/hooks/useContentLibrary.ts`

## Dependencies
T004, T008
BODY
)" \
    "spec:002-pregame,P1" \
    7

  create_issue \
    "T015: Build role assignment UI" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P2 | **Estimate**: 6 hours

## Description
Build the character/role assignment interface with auto, manual, and preference-based modes.

## Deliverables
- Create `CharacterAssignment.tsx` (host: drag-drop or tap-to-assign interface)
- Create `CharacterRoster.tsx` (host: character summaries with assignment status)
- Create `PreferenceForm.tsx` (player: ranked archetype selection)
- Create `CharacterPacket.tsx` (player: character sheet + brief + prompts)
- Implement `useCharacterAssignment` hook (auto/manual/preference modes)
- Implement `usePreferences` hook (preference collection and submission)
- Implement assignment algorithms (round-robin for auto, Hungarian for preference-based)

## Files
- `src/components/CharacterAssignment.tsx`
- `src/components/CharacterRoster.tsx`
- `src/components/PreferenceForm.tsx`
- `src/components/CharacterPacket.tsx`
- `src/hooks/useCharacterAssignment.ts`
- `src/hooks/usePreferences.ts`

## Dependencies
T005
BODY
)" \
    "spec:002-pregame,P2" \
    7

  # Epic #8: Pre-Game Integration & Polish (Phase 4: T16-T19)
  create_issue \
    "T016: Implement email notification templates" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Design and implement HTML email templates for all notification categories.

## Deliverables
- Design HTML email templates matching app visual identity
- Create templates for each notification category (invitation, reminder, artifact ready, cancellation)
- Include deep link URLs back to web session pages
- Configure SPF/DKIM/DMARC for sending domain
- Add RFC 8058 unsubscribe header and one-click unsubscribe support

## Files
- Email template files

## Dependencies
T007
BODY
)" \
    "spec:002-pregame,P0" \
    8

  create_issue \
    "T017: Implement offline support for contributions" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Implement offline-first contribution support with MMKV storage and sync.

## Deliverables
- Set up MMKV storage for contribution drafts
- Implement offline queue for RSVP submissions
- Create sync logic: on reconnect, push queued actions to Supabase
- Handle conflict resolution (last-write-wins with timestamp)
- Ensure contribution form works without network (save to local, submit when online)

## Files
- Offline storage and sync modules

## Dependencies
T012
BODY
)" \
    "spec:002-pregame,P0" \
    8

  create_issue \
    "T018: Web player pages" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Create web-accessible pages for web players to RSVP and contribute without the app.

## Deliverables
- Create web join page at `https://ephemera.app/invite/:token`
- Implement web RSVP flow (display name + email, no account required)
- Implement web contribution form (matching app functionality)
- Generate session-scoped JWT for web player API access
- Include smart app banner for app install (non-blocking)
- Serve AASA and assetlinks.json from `.well-known/`

## Files
- Web player pages and API

## Dependencies
T010, T011, T012
BODY
)" \
    "spec:002-pregame,P0" \
    8

  create_issue \
    "T019: End-to-end integration tests" \
    "$(cat <<'BODY'
**Spec**: 002 | **Priority**: P0 | **Estimate**: 8 hours

## Description
Write comprehensive E2E tests for all pre-game lifecycle flows.

## Deliverables
- E2E test: host creates session -> sends invitation -> player RSVPs -> player contributes -> host reviews
- E2E test: web player RSVP and contribution flow
- E2E test: notification delivery (push + email) with dedup and quiet hours
- E2E test: content pack browse -> purchase -> download -> use in session config
- E2E test: Murder Mystery role assignment (auto + preference-based)
- E2E test: deadline reminder automation (3d + 1d + grace period)
- Verify all RLS policies in integration context
- Performance test: dashboard load times, deep link resolution latency

## Files
- `tests/e2e/` directory

## Dependencies
T010–T018
BODY
)" \
    "spec:002-pregame,P0" \
    8

  echo "=== SPEC 002 complete ==="
}

# ============================================================
# SPEC 005: Game Night Engine (27 tasks → 4 epics)
# ============================================================
create_spec_005() {
  echo "=== SPEC 005: Game Night Engine (27 tasks) ==="

  # Epic #13: Dashboard Setup & Shell (Phase 1-2: T1-T11)
  create_issue \
    "T001: Local SQLite Schema and Database Module" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the local SQLite database schema and database access module. This is the foundation for all game night data.

## Deliverables
- Create all 6 local SQLite tables per data-model.md section 1
- Database initialization function (create tables if not exist)
- TypeScript types for all local entities
- Database open/close lifecycle management

## Files
- `src/features/game-night/db/schema.ts`
- `src/features/game-night/db/queries.ts`
- `src/features/game-night/db/mutations.ts`
- `src/features/game-night/types/game-night.ts`

## Dependencies
Spec 001 Task 1 (Expo project initialized)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T002: Ambient Mode Constants and Theme" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Define the ambient mode theme constants: colors, typography sizes, spacing, touch target minimums.

## Deliverables
- Ambient color palette (OLED black, warm amber, gold accents)
- Typography scale (18sp body, 24sp heading, 28sp phase name)
- Touch target constants (48dp minimum)
- Timing constants (30s auto-save, 30s undo window, animation durations)

## Files
- `src/constants/ambient-theme.ts`

## Dependencies
None
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T003: Game Plugin Interface Definition" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Define the TypeScript interface contract that game-specific modules implement. This is the contract between the dashboard shell and game plugins.

## Deliverables
- `GamePlugin` interface with phases, reference tabs, dashboard panel, callbacks
- `PhaseDefinition`, `ReferenceTabDefinition`, `GamePanelProps`, `ReferenceTabProps` types
- `PlayerAction` type union
- Plugin registry (static map: game_type -> GamePlugin)

## Files
- `src/features/game-night/types/game-plugin.ts`
- `src/features/game-night/types/phase.ts`
- `src/features/game-night/types/sync.ts`

## Dependencies
None
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T004: Server-Side Schema Migration" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the server-side Supabase PostgreSQL tables for receiving synced game night data.

## Deliverables
- Create tables: `game_night_logs`, `game_night_summaries`, `written_answers`
- Create indexes per data-model.md section 3
- Enable RLS and create policies per data-model.md section 4

## Files
- `supabase/migrations/010_create_game_night_logs.sql`
- `supabase/migrations/011_create_game_night_summaries.sql`
- `supabase/migrations/012_create_written_answers.sql`
- `supabase/migrations/013_create_game_night_indexes.sql`
- `supabase/migrations/014_create_game_night_rls.sql`

## Dependencies
Spec 001 Task 3 (base schema exists)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T005: Ambient Mode Container Component" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the ambient mode wrapper component that handles wake lock, brightness reduction, and dark theme application.

## Deliverables
- `AmbientContainer` component: wraps all dashboard content
- Wake lock activation/deactivation (expo-keep-awake)
- Brightness reduction on mount, restore on unmount (expo-brightness)
- OLED dark theme application
- Handles background/foreground transitions (re-engage wake lock on foreground)

## Files
- `src/features/game-night/components/AmbientContainer.tsx`
- `src/features/game-night/hooks/use-wake-lock.ts`
- `src/features/game-night/hooks/use-ambient-mode.ts`

## Dependencies
T002 (ambient theme constants)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T006: Pre-Cache Engine (Seed Local Database)" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement the pre-cache engine that syncs session data from Supabase to local SQLite when the session transitions to ACTIVE.

## Deliverables
- Fetch session, participants, contributions, and game-specific data from Supabase
- Write all data to local SQLite tables
- Handle network failure gracefully (use previously cached data if available)
- Validate that critical data is present before allowing dashboard launch
- Report missing data (non-blocking warning)

## Files
- `src/features/game-night/db/seed.ts`

## Dependencies
T001 (local schema), T004 (server schema)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T007: Zustand Dashboard Store" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: High

## Description
Create the Zustand store that holds the dashboard's reactive state, backed by SQLite for persistence.

## Deliverables
- Store state: current phase, turn position, player order, player status, timer state, undo state, game-specific state
- Actions: advance phase, undo phase, skip player, pass, add player, drop player, start/stop timer
- Write-through to SQLite on every state mutation
- Load initial state from SQLite on dashboard launch
- Auto-save subscription (30-second interval writes to game_night_log)

## Files
- `src/features/game-night/stores/game-night-store.ts`
- `src/features/game-night/hooks/use-game-night.ts`
- `src/features/game-night/hooks/use-auto-save.ts`

## Dependencies
T001 (local DB), T003 (types)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T008: Phase Timeline Component" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Create the visual phase progression timeline showing completed, current, and upcoming phases.

## Deliverables
- Horizontal timeline component with phase nodes
- Phase node states: completed (checkmark + gold), current (highlighted + amber), upcoming (dimmed)
- Current phase name displayed prominently (28sp)
- Reduce motion support (no transitions if system setting enabled)

## Files
- `src/features/game-night/components/PhaseTimeline.tsx`

## Dependencies
T002 (ambient theme), T003 (PhaseDefinition type)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T009: Player Roster Component" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the player roster showing all participants with turn indicator, status, and action controls for the host.

## Deliverables
- Player list with names, turn indicator (arrow or highlight), status badge
- Tap player name -> action menu: Skip Turn, Mark as Dropped, Reinstate (if dropped)
- "Add Player" button at bottom of roster
- Dropped players dimmed
- All touch targets >=48dp

## Files
- `src/features/game-night/components/PlayerRoster.tsx`

## Dependencies
T002 (ambient theme), T003 (types)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T010: Phase Transition Dialog and Undo" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement the phase transition confirmation dialog and the 30-second undo mechanism.

## Deliverables
- `PhaseTransitionDialog`: modal showing next phase name, description, confirm/cancel
- "Next Phase" button on dashboard (large, bottom of screen)
- `UndoBar`: appears after transition, disappears after 30 seconds
- Undo reverts phase, logs reversal
- 1-second cooldown between transitions (prevent accidental double-tap)

## Files
- `src/features/game-night/components/PhaseTransitionDialog.tsx`
- `src/features/game-night/components/UndoBar.tsx`

## Dependencies
T007 (store actions for phase transition), T008 (timeline updates)
BODY
)" \
    "spec:005-engine,P0" \
    13

  create_issue \
    "T011: Dashboard Main Screen Assembly" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Assemble the complete dashboard screen: ambient container, phase timeline, player roster, game plugin slot, action buttons.

## Deliverables
- Dashboard screen layout: phase timeline (top), game plugin slot (middle), player roster (scrollable), action bar (bottom)
- "Next Phase" button (bottom, large)
- "Reference" icon (top-right corner, unobtrusive)
- "End Game Night" button (small, accessible but not prominent)
- Game plugin slot renders the active game's dashboard panel
- One-hand operation: all primary controls in bottom 60%

## Files
- `src/app/session/[id]/game-night/index.tsx`
- `src/app/session/[id]/game-night/_layout.tsx`
- `src/features/game-night/components/GamePluginSlot.tsx`

## Dependencies
T005, T007, T008, T009, T010
BODY
)" \
    "spec:005-engine,P0" \
    13

  # Epic #14: Timer & Emergency Reference (Phase 3: T12-T14)
  create_issue \
    "T012: Timer Ring Animation" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: High

## Description
Create the circular timer arc using React Native Reanimated with warm amber-to-red color transition.

## Deliverables
- Circular arc animation (Reanimated animated SVG path or Canvas)
- Color transitions: amber (start) -> soft red (final minutes)
- Reduce motion fallback: static progress bar
- Gentle pulse animation on expiration (no alarm, no vibration)
- "Time's up" suggestion overlay (dismissable)

## Files
- `src/features/game-night/components/TimerRing.tsx`
- `src/features/game-night/hooks/use-timer.ts`

## Dependencies
T002 (theme), T007 (store for timer state)
BODY
)" \
    "spec:005-engine,P0" \
    14

  create_issue \
    "T013: Timer Controls" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement timer control panel: duration presets, pause, extend, dismiss.

## Deliverables
- Timer activation: tap timer icon -> preset selection (15/30/45/60/custom)
- Tap running timer -> control panel: Pause, +5 min, +15 min, Dismiss
- Timer auto-dismiss on phase transition
- Timer events logged to game_night_log

## Files
- `src/features/game-night/components/TimerControls.tsx`

## Dependencies
T012 (TimerRing), T007 (store actions for timer)
BODY
)" \
    "spec:005-engine,P0" \
    14

  create_issue \
    "T014: Emergency Reference Overlay" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the full-screen reference overlay with game-specific tabs, search, and read-only display.

## Deliverables
- Full-screen modal overlay (slide up animation)
- Tab bar at top with game-specific tabs (from plugin.referenceTabs)
- Search bar filtering across all tabs
- Read-only display (no edit controls)
- Dismiss: swipe down or tap outside
- All data from local SQLite (zero network)

## Files
- `src/app/session/[id]/game-night/reference.tsx`

## Dependencies
T001 (local DB queries), T003 (ReferenceTabDefinition), T007 (store)
BODY
)" \
    "spec:005-engine,P0" \
    14

  # Epic #15: Accessibility & Player Management (Phase 4: T15-T18)
  create_issue \
    "T015: Written Answer Mode — Player Input" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the text input interface for players using written answer mode on their own device.

## Deliverables
- Text input field in ambient mode styling (player's device)
- "Submit" button sends answer to local log (and eventually to host via sync)
- Input visible only when it's the player's turn
- Works offline (answer stored locally, synced later)
- Uses the accessibility_preferences.written_answer_mode flag

## Files
- `src/features/game-night/components/WrittenAnswerInput.tsx`

## Dependencies
T007 (store), T002 (ambient theme)
BODY
)" \
    "spec:005-engine,P0" \
    15

  create_issue \
    "T016: Written Answer Mode — Host Display" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Display written answers on the host dashboard when "Show Written Answers" is enabled.

## Deliverables
- `WrittenAnswerDisplay` component: shows answer text with player name
- Appears inline in the dashboard when an answer is submitted
- Configured via session config: `show_written_answers` boolean
- Subtle notification for late answers (submitted after turn has passed)

## Files
- `src/features/game-night/components/WrittenAnswerDisplay.tsx`

## Dependencies
T007 (store), T011 (dashboard assembly)
BODY
)" \
    "spec:005-engine,P0" \
    15

  create_issue \
    "T017: Pass/Skip Mechanics Implementation" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement the pass (player-initiated) and skip (host-initiated) mechanics, including logging for artifact generation.

## Deliverables
- Host skip: via player roster action menu (Task 9 UI, this task adds logic)
- Player pass: via written answer mode interface or host proxy
- Both logged as events in game_night_log
- Neither announced to the room or highlighted in UI
- Chain continuation logic: next active player receives the turn

## Files
- Updates to `src/features/game-night/stores/game-night-store.ts`
- Updates to `src/features/game-night/components/PlayerRoster.tsx`

## Dependencies
T007 (store), T009 (roster)
BODY
)" \
    "spec:005-engine,P0" \
    15

  create_issue \
    "T018: Mid-Game Player Add/Drop" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement adding a new player mid-game and marking a player as dropped.

## Deliverables
- "Add Player" form: name input only, appended to turn order
- "Mark as Dropped": player dimmed, turns auto-skipped
- "Reinstate": player restored to active, turns resume
- Murder Mystery: dropped character secrets visible in emergency reference
- All actions logged to game_night_log

## Files
- Updates to `src/features/game-night/stores/game-night-store.ts`
- Updates to `src/features/game-night/components/PlayerRoster.tsx`

## Dependencies
T007 (store), T009 (roster), T017 (skip mechanics)
BODY
)" \
    "spec:005-engine,P0" \
    15

  # Epic #16: Sync Engine, Plugins & Polish (Phase 5-6: T19-T27)
  create_issue \
    "T019: Sync Queue and Engine" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: High

## Description
Implement the sync queue that stores pending changes and the background engine that pushes them to the server.

## Deliverables
- Sync queue: add entries on game night actions, persist to sync_queue SQLite table
- Sync engine: process queue in background when connectivity available
- Exponential backoff on failure (1s, 2s, 4s... max 60s)
- Entry state management: pending -> in_progress -> completed/failed
- Pending sync indicator (subtle, host-visible)
- Queue survives app restart (persisted in SQLite)

## Files
- `src/features/game-night/sync/sync-queue.ts`
- `src/features/game-night/sync/sync-engine.ts`
- `src/features/game-night/hooks/use-sync-engine.ts`
- `src/features/game-night/components/SyncIndicator.tsx`

## Dependencies
T001 (sync_queue table), T007 (store)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T020: Supabase Edge Function: sync-game-night" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Create the server-side Edge Function that receives game night data from the sync engine.

## Deliverables
- Validate request: auth, host ownership, session state
- Deduplicate events (by event ID)
- Insert events into game_night_logs
- Compute and insert/update game_night_summaries
- Insert written_answers
- Return sync status (synced, partial)

## Files
- `supabase/functions/sync-game-night/index.ts`

## Dependencies
T004 (server schema)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T021: Conflict Resolver" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Implement the last-write-wins conflict resolver for sync.

## Deliverables
- Compare local and server timestamps
- Host device always wins for game night data
- Conflict log for debugging (written to local SQLite, not user-visible)
- Handle edge case: session resumed on different device (server state is base)

## Files
- `src/features/game-night/sync/conflict-resolver.ts`

## Dependencies
T019 (sync engine)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T022: Confession Album Plugin Stub" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Create a minimal Confession Album plugin that implements the GamePlugin interface with placeholder UI. Full implementation is in spec 003.

## Deliverables
- Implements `GamePlugin` interface
- Phase definitions: "The Board & The Tradition", "The Chain", "The Return", "The Portrait"
- Reference tabs: Player Roster, The Board, Game State, Contributions
- Dashboard panel: placeholder component showing phase-appropriate info
- Required data types: questions, board_state, contribution_archetypes

## Files
- `src/plugins/confession-album/plugin.ts`

## Dependencies
T003 (plugin interface)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T023: Murder Mystery Plugin Stub" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Create a minimal Murder Mystery plugin that implements the GamePlugin interface with placeholder UI. Full implementation is in spec 004.

## Deliverables
- Implements `GamePlugin` interface
- Phase definitions: "Arrival & Establishment", "The Crime", "Accusation & Reveal"
- Reference tabs: Player Roster, Game State, Full Solution, Contributions
- Dashboard panel: placeholder component showing act-appropriate info
- Required data types: characters, clues, timeline, solution, relationships

## Files
- `src/plugins/murder-mystery/plugin.ts`

## Dependencies
T003 (plugin interface)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T024: VoiceOver / TalkBack Accessibility Pass" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Medium

## Description
Add accessibility labels, roles, and hints to all dashboard components.

## Deliverables
- `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on all interactive elements
- Correct reading order for phase timeline, player roster, action buttons
- Live region announcements for phase transitions and timer events
- Reduce motion support (Reanimated `useReducedMotion()`)

## Files
- Updates to all components in `src/features/game-night/components/`

## Dependencies
T005–T018 (all components exist)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T025: Local Data Cleanup" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Implement local database cleanup for sessions that have been synced.

## Deliverables
- On app launch: check for local data older than 7 days with completed sync
- Delete local SQLite data for those sessions
- Clean up sync_queue entries with "completed" status older than 24 hours

## Files
- Updates to `src/features/game-night/db/schema.ts`

## Dependencies
T019 (sync engine)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T026: Expo OTA Update Deferral" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: Low

## Description
Ensure Expo OTA updates are never applied during an active game night.

## Deliverables
- Check for ACTIVE session before allowing OTA update
- Defer update application to next cold launch when no session is ACTIVE
- Configure expo-updates to use manual update checking (not automatic)

## Files
- Updates to `src/app/_layout.tsx`

## Dependencies
T007 (store — knows if session is ACTIVE)
BODY
)" \
    "spec:005-engine,P0" \
    16

  create_issue \
    "T027: Integration Tests" \
    "$(cat <<'BODY'
**Spec**: 005 | **Priority**: P0 | **Estimate**: High

## Description
Write integration tests for all critical paths defined in `quickstart.md`.

## Deliverables
- Test setup: local SQLite in-memory database + Supabase local (Docker)
- Dashboard launch tests: ambient mode activation, wake lock, brightness
- Phase progression tests: advance, undo, cooldown, phase completion
- Timer tests: start, pause, extend, dismiss, expiration, no auto-advance
- Offline tests: zero network calls during ACTIVE, auto-save, crash recovery
- Sync tests: queue processing, retry logic, deduplication, conflict resolution
- Player management tests: skip, pass, add, drop, reinstate
- Written answer tests: submit, display, logging
- Plugin tests: Confession Album and Murder Mystery stubs render phases correctly

## Files
- `tests/game-night/setup.ts`
- `tests/game-night/dashboard.test.ts`
- `tests/game-night/phases.test.ts`
- `tests/game-night/timer.test.ts`
- `tests/game-night/offline.test.ts`
- `tests/game-night/sync.test.ts`
- `tests/game-night/player-management.test.ts`
- `tests/game-night/written-answers.test.ts`
- `tests/game-night/plugins.test.ts`

## Dependencies
T001–T026 (tests validate all prior work)
BODY
)" \
    "spec:005-engine,P0" \
    16

  echo "=== SPEC 005 complete ==="
}

# ============================================================
# SPEC 006: Artifact Pipeline (84 tasks → 4 epics)
# ============================================================
create_spec_006() {
  echo "=== SPEC 006: Artifact Pipeline (84 tasks) ==="

  # I'll source from a separate file for the 84 tasks
  source "$(dirname "$0")/create-sub-issues-006.sh"

  echo "=== SPEC 006 complete ==="
}

# ============================================================
# SPEC 003: Confession Album (18 tasks → 4 epics)
# ============================================================
create_spec_003() {
  echo "=== SPEC 003: Confession Album (18 tasks) ==="

  source "$(dirname "$0")/create-sub-issues-003.sh"

  echo "=== SPEC 003 complete ==="
}

# ============================================================
# SPEC 004: Murder Mystery (66 tasks → 4 epics)
# ============================================================
create_spec_004() {
  echo "=== SPEC 004: Murder Mystery (66 tasks) ==="

  source "$(dirname "$0")/create-sub-issues-004.sh"

  echo "=== SPEC 004 complete ==="
}

# ============================================================
# Main
# ============================================================
echo "Starting sub-issue creation for: $SPEC"
echo "Repo: $REPO"
echo "---"
> "$LOG_FILE"

case "$SPEC" in
  001) create_spec_001 ;;
  002) create_spec_002 ;;
  005) create_spec_005 ;;
  006) create_spec_006 ;;
  003) create_spec_003 ;;
  004) create_spec_004 ;;
  all)
    create_spec_001
    create_spec_002
    create_spec_005
    create_spec_006
    create_spec_003
    create_spec_004
    ;;
  *) echo "Unknown spec: $SPEC. Use 001, 002, 003, 004, 005, 006, or all." ; exit 1 ;;
esac

echo ""
echo "=== SUMMARY ==="
echo "Created: $CREATED"
echo "Failed: $FAILED"
echo "Log: $LOG_FILE"
