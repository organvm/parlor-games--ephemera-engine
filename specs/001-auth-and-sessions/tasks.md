# 001 — Task List: Authentication & Session Management

Dependency-ordered implementation tasks. Each task includes priority marker, story reference, estimated complexity, and exact file paths.

**Legend**:
- `[P0]` — Launch requirement
- `[P1]` — Post-launch
- `[Story: US-XXX]` — Maps to user story in spec.md

---

## Phase 1: Project Setup

### Task 1: Initialize Expo Project and Core Dependencies
`[P0]` `[Story: All]`

**Description**: Bootstrap the React Native + Expo project with TypeScript strict mode, install core dependencies, and configure the development environment.

**Deliverables**:
- Initialize Expo project with TypeScript template
- Install dependencies:
  - `@supabase/supabase-js` (Supabase client)
  - `expo-secure-store` (token storage)
  - `expo-linking` (deep links)
  - `expo-apple-authentication` (Apple Sign-In)
  - `@react-native-google-signin/google-signin` (Google Sign-In)
  - `zustand` (state management)
  - `expo-sqlite` (local database)
- Configure `tsconfig.json` with strict mode
- Configure `app.json` with URL scheme, bundle ID, deep link associations

**Files**:
- `package.json`
- `tsconfig.json`
- `app.json`
- `.env.example` (Supabase URL, anon key — no secrets)

**Depends on**: Nothing
**Estimated complexity**: Low

---

### Task 2: Supabase Project Configuration
`[P0]` `[Story: All]`

**Description**: Set up the Supabase project with auth providers, database schema, and RLS policies.

**Deliverables**:
- Enable email/password, Apple, and Google auth providers in Supabase dashboard
- Configure Apple Sign-In (client ID, redirect URL)
- Configure Google Sign-In (client ID, client secret)
- Enable anonymous auth for web players
- Configure JWT expiry (1 hour access, 30 day refresh)
- Set up email templates (verification, password reset)

**Files**:
- `supabase/config.toml` (Supabase CLI config)

**Depends on**: Nothing (can run parallel with Task 1)
**Estimated complexity**: Low

---

### Task 3: Database Schema Migration
`[P0]` `[Story: US-001, US-002, US-003]`

**Description**: Create the database schema as defined in `data-model.md`. Apply via Supabase migration.

**Deliverables**:
- Create enum types: `auth_provider`, `game_type`, `session_state`, `participant_role`, `rsvp_status`
- Create tables: `users`, `sessions`, `session_participations`, `session_state_log`
- Create indexes per `data-model.md` section 3
- Create triggers: state transition validation, state transition logging, host auto-activation, updated_at
- Enable RLS on all tables
- Create RLS policies per `data-model.md` section 5
- Create `transition_session_state` RPC function for atomic state transitions

**Files**:
- `supabase/migrations/001_create_enums.sql`
- `supabase/migrations/002_create_users_table.sql`
- `supabase/migrations/003_create_sessions_table.sql`
- `supabase/migrations/004_create_session_participations_table.sql`
- `supabase/migrations/005_create_session_state_log_table.sql`
- `supabase/migrations/006_create_indexes.sql`
- `supabase/migrations/007_create_triggers.sql`
- `supabase/migrations/008_create_rls_policies.sql`
- `supabase/migrations/009_create_rpc_functions.sql`

**Depends on**: Task 2
**Estimated complexity**: Medium

---

## Phase 2: Core Authentication

### Task 4: Supabase Client and Token Storage
`[P0]` `[Story: US-001]`

**Description**: Initialize the Supabase client with Expo SecureStore adapter for persistent, encrypted token storage.

**Deliverables**:
- Create Supabase client singleton with SecureStore storage adapter
- Configure `autoRefreshToken`, `persistSession`, `detectSessionInUrl`
- Create typed wrapper for SecureStore operations
- Add environment variable loading for Supabase URL and anon key

**Files**:
- `src/lib/supabase.ts`
- `src/lib/secure-store.ts`
- `src/types/database.ts` (generated types from Supabase CLI)

**Depends on**: Task 1, Task 3
**Estimated complexity**: Low

---

### Task 5: Auth Screens and Flows
`[P0]` `[Story: US-001]`

**Description**: Implement sign-up, sign-in, and profile creation screens with all three auth providers.

**Deliverables**:
- Welcome screen (3-step walkthrough, skippable)
- Sign-up screen: email form, Apple button, Google button
- Sign-in screen: email form, social auth buttons
- Email verification prompt screen
- Profile setup screen (display name, optional avatar)
- Auth error handling with user-friendly messages
- Password reset flow (request + confirmation)

**Files**:
- `src/app/(auth)/welcome.tsx`
- `src/app/(auth)/sign-up.tsx`
- `src/app/(auth)/sign-in.tsx`
- `src/app/(auth)/verify-email.tsx`
- `src/app/(auth)/reset-password.tsx`
- `src/lib/auth.ts` (sign-up, sign-in, sign-out, social auth helpers)

**Depends on**: Task 4
**Estimated complexity**: Medium

---

### Task 6: Auth State Management and Route Guard
`[P0]` `[Story: US-001]`

**Description**: Implement Zustand auth store, auth state hook, and route guard that redirects unauthenticated users to auth screens.

**Deliverables**:
- Zustand auth store: user object, session, loading state, auth methods
- `useAuth` hook: provides auth state and actions to components
- Root layout with auth guard: redirects to `(auth)` group when not authenticated
- Auto-refresh token on app foreground
- Profile creation trigger: on first sign-up, insert into `public.users`
- Host auto-activation detection: listen for `is_host` changes

**Files**:
- `src/stores/auth-store.ts`
- `src/hooks/use-auth.ts`
- `src/app/_layout.tsx`
- `src/types/auth.ts`

**Depends on**: Task 5
**Estimated complexity**: Medium

---

## Phase 3: Session Management

### Task 7: Session CRUD Operations
`[P0]` `[Story: US-002]`

**Description**: Implement session creation, reading, updating, and listing with proper RLS enforcement.

**Deliverables**:
- `useSession` hook: create, read, update, list operations via Supabase client
- Session creation flow: game type picker, session basics form (name, date, guest count), config
- Session list on Home screen: filtered by state (upcoming, active, completed, archived)
- Session detail screen: shows config, state, participant count
- Auto-save during configuration (debounced updates)
- Concurrent session limit enforcement (max 5 non-terminal)

**Files**:
- `src/hooks/use-session.ts`
- `src/app/(tabs)/index.tsx` (Home screen with session list)
- `src/app/session/create.tsx`
- `src/app/session/[id]/index.tsx`
- `src/app/session/[id]/edit.tsx`
- `src/types/session.ts`

**Depends on**: Task 6
**Estimated complexity**: Medium

---

### Task 8: Session State Machine (Client + Server)
`[P0]` `[Story: US-002, US-003]`

**Description**: Implement the session state machine with client-side validation, server-side RPC function, and state transition logging.

**Deliverables**:
- Pure TypeScript state machine: `VALID_TRANSITIONS` map, `canTransition()` function
- `useSessionState` hook: validates transition client-side, calls `transition_session_state` RPC
- State transition RPC function in PostgreSQL: validates, updates, logs atomically
- Optimistic locking: `WHERE state = $expected_state` pattern
- Notification dispatch stubs for each transition (actual notification sending in spec 002/005)
- UI: state badge on session cards, transition buttons on session detail

**Files**:
- `src/utils/session-state-machine.ts`
- `src/hooks/use-session-state.ts`
- `src/constants/session-states.ts`
- `supabase/migrations/009_create_rpc_functions.sql` (extends Task 3)

**Depends on**: Task 7
**Estimated complexity**: Medium

---

### Task 9: Deep Link Generation and Invite Code
`[P0]` `[Story: US-002]`

**Description**: Generate unique invite codes on DRAFT -> INVITING transition and configure deep link resolution.

**Deliverables**:
- Invite code generator: 8-character alphanumeric, collision-resistant
- Deep link URL format: `https://ephemera.app/join/{invite_code}`
- Expo Linking configuration for Universal Links (iOS) and App Links (Android)
- Deep link handler: resolve invite code to session, navigate to invitation screen
- Share sheet integration: host can share invite link via system share dialog

**Files**:
- `src/utils/deep-link.ts`
- `src/app/session/[id]/invite.tsx`
- `app.json` (URL scheme, associated domains)
- `public/.well-known/apple-app-site-association` (iOS Universal Links)
- `public/.well-known/assetlinks.json` (Android App Links)

**Depends on**: Task 8
**Estimated complexity**: Low

---

## Phase 4: Guest Mode and Settings

### Task 10: Web Player Join Flow
`[P0]` `[Story: US-004]`

**Description**: Implement the web player guest mode: anonymous auth, session cookie, RSVP, and email collection.

**Deliverables**:
- Web join page: loads session by invite code, displays invitation details
- Anonymous Supabase auth: `signInAnonymously()` on page load
- Session cookie management: store anonymous session ID, 30-day expiry, httpOnly, SameSite=Strict
- RSVP form: display name entry, Accept/Decline/Maybe buttons
- Email collection prompt: shown after RSVP acceptance or before artifact delivery
- Create `session_participations` record with `role = 'web_player'`

**Files**:
- `web/join/[invite-code].tsx` (or Supabase Edge Function serving HTML)
- `web/contribute/[session-id].tsx`
- `web/lib/guest-auth.ts`

**Depends on**: Task 9
**Estimated complexity**: Medium

---

### Task 11: Settings Screen
`[P0]` `[Story: US-005]`

**Description**: Implement the settings screen with notification preferences, accessibility settings, and theme selection.

**Deliverables**:
- Settings screen layout: sections for notifications, accessibility, theme, account
- Notification preferences: per-category toggles, quiet hours configuration
- Accessibility settings: text size, high contrast, reduce motion, written answer mode
- Theme selection: Warm / Dark / System
- Settings persistence: Zustand store with server sync on change
- `useSettings` hook: provides current preferences and update methods
- Account section: sign out, delete account (with confirmation)

**Files**:
- `src/app/(tabs)/settings.tsx`
- `src/stores/settings-store.ts`
- `src/hooks/use-settings.ts`
- `src/constants/notification-categories.ts`

**Depends on**: Task 6
**Estimated complexity**: Low

---

### Task 12: Integration Tests
`[P0]` `[Story: All]`

**Description**: Write integration tests for all critical paths defined in `quickstart.md`.

**Deliverables**:
- Test setup: Supabase local (Docker) + Vitest configuration
- Auth tests: sign-up (all providers), sign-in, sign-out, token refresh, invalid credentials
- Session CRUD tests: create, read, update, list, RLS isolation
- State machine tests: all valid transitions, all invalid transitions, concurrent transitions
- Guest mode tests: anonymous auth, cookie persistence, RSVP, email collection
- Settings tests: save, restore, sync across devices
- RLS policy tests: participant isolation, host-only writes, invite code lookup

**Files**:
- `tests/setup.ts` (Supabase local client, test helpers)
- `tests/auth.test.ts`
- `tests/session-crud.test.ts`
- `tests/session-state-machine.test.ts`
- `tests/guest-mode.test.ts`
- `tests/settings.test.ts`
- `tests/rls-policies.test.ts`
- `vitest.config.ts`

**Depends on**: Tasks 3-11 (tests validate all prior work)
**Estimated complexity**: Medium

---

## Dependency Graph

```
Task 1 (Expo init) ──┐
                      ├── Task 4 (Supabase client) ── Task 5 (Auth screens) ── Task 6 (Auth state)
Task 2 (Supabase) ───┤                                                            │
                      └── Task 3 (DB schema) ────────────────────────────────────────┤
                                                                                     │
                                                      Task 7 (Session CRUD) ─────────┘
                                                            │
                                                      Task 8 (State machine)
                                                            │
                                                      Task 9 (Deep links)
                                                            │
                                                      Task 10 (Web player)

                      Task 6 ── Task 11 (Settings)

                      Tasks 3-11 ── Task 12 (Tests)
```

---

## Estimated Timeline

| Phase | Tasks | Estimated Effort |
|-------|-------|-----------------|
| Phase 1: Setup | Tasks 1-3 | 2-3 days |
| Phase 2: Core Auth | Tasks 4-6 | 3-4 days |
| Phase 3: Sessions | Tasks 7-9 | 3-4 days |
| Phase 4: Guest + Settings | Tasks 10-12 | 3-4 days |
| **Total** | **12 tasks** | **11-15 days** |

Tasks 1 and 2 can run in parallel. Task 11 can start as soon as Task 6 is complete (parallel with Phase 3).
