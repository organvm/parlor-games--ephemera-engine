# 001 — Implementation Plan: Authentication & Session Management

Implementation plan with technology context, constitution compliance, project structure, and complexity tracking.

**Spec**: 001-auth-and-sessions
**Stack**: TypeScript 5.x, React Native + Expo, Supabase, PostgreSQL
**Last Updated**: 2026-02-23

---

## 1. Constitution Compliance

### Simplicity Gate

- [x] **Total server-side services <=3?** Yes. This spec uses only Supabase Auth and Supabase Database. No Edge Functions required for auth/sessions. (Edge Function budget: 0/3 consumed.)
- [x] **No speculative "might need" features?** Yes. No role-based access control beyond host/player, no admin panel, no social features. Host capability is a boolean flag, not a role system.
- [x] **Using framework primitives directly?** Yes. Supabase Auth client (`@supabase/supabase-js`) for auth. Expo SecureStore for token storage. React Navigation for session flows. No auth wrapper libraries.
- [x] **No premature abstractions or repository patterns?** Yes. Direct Supabase client calls from React hooks. No repository layer, no service layer, no dependency injection for this spec.
- [x] **Single database schema (Supabase PostgreSQL)?** Yes. All entities (User, Session, SessionParticipation, SessionStateLog) in a single PostgreSQL database with Supabase RLS policies.

### Offline Gate

- [x] **All game night features work without network connectivity?** N/A for this spec (game night features are in spec 005). However, session state cached locally before entering ACTIVE.
- [x] **Local database holds complete session state during ACTIVE?** Yes. Session data synced to local SQLite before PREPARING -> ACTIVE transition.
- [x] **No network requests required during game night phase?** N/A for this spec directly, but session state reads will be from local DB during ACTIVE.
- [x] **Sync is eventual and non-blocking?** Yes. State transitions queued locally if offline, synced when connectivity resumes.
- [x] **Dashboard operates entirely from local data?** N/A (spec 005).

### Privacy Gate

- [x] **No data leaves the session boundary without explicit consent?** Yes. Session participation data is scoped by session_id. RLS policies enforce session-level isolation.
- [x] **No cross-session data sharing or aggregation?** Yes. No queries or views aggregate data across sessions. Host session history shows only metadata (name, date, state), not participant data from other sessions.
- [x] **No public profiles or social features?** Yes. No public user profiles. No user search. No friend lists. Identity exists only within sessions.
- [x] **Player contributions scoped to session participants only?** Yes. RLS policies ensure only session participants can read session data.
- [x] **Minimal data retention policy enforced?** Yes. 90-day retention after ARCHIVED state. Account deletion propagates correctly.

### Analog Gate

- [x] **No feature replaces in-room human interaction?** Yes. Auth and session management are pre-game activities. No in-room interaction is digitized.
- [x] **Game night UI is ambient and glanceable?** N/A for this spec (spec 005).
- [x] **Screen-dark principle respected?** N/A for this spec directly. Session state transitions during game night are initiated by host only (one-tap).
- [x] **All game-night player interactions happen in the room?** N/A for this spec.
- [x] **Timer is optional, never forced?** N/A for this spec.

**Result**: All four gates PASS.

---

## 2. Technology Decisions

### Authentication Provider: Supabase Auth

**Decision**: Use Supabase Auth for all authentication flows.

**Rationale**:
- Built-in support for email/password, Apple, and Google OAuth
- JWT-based sessions with automatic refresh token handling
- RLS integration — `auth.uid()` available in all PostgreSQL policies
- React Native SDK (`@supabase/supabase-js` + `@supabase/auth-helpers-react`) well-maintained
- No additional auth service needed (stays within Simplicity Gate)

**Trade-offs**:
- Supabase Auth ties us to Supabase ecosystem (acceptable — Supabase is our entire backend)
- Custom claims require Edge Function (not needed for this spec — host flag is a DB column)

### Token Storage: Expo SecureStore

**Decision**: Store Supabase auth tokens in Expo SecureStore.

**Rationale**:
- Encrypted storage backed by iOS Keychain and Android Keystore
- Expo-native API, no additional dependencies
- Survives app restart but not app uninstall (correct behavior for auth tokens)

**Alternative considered**: AsyncStorage — rejected because it stores data in plaintext.

### Session State Machine: PostgreSQL Check Constraint + Application Layer

**Decision**: Implement state machine with a PostgreSQL CHECK constraint defining valid states, a database trigger enforcing valid transitions, and application-level transition logic in React hooks.

**Rationale**:
- Database-level validation prevents invalid states regardless of client behavior
- Trigger-based transition validation catches bugs in any client (mobile, web, future admin)
- Application layer manages side effects (notifications, feature toggling)
- No external state machine library needed (Simplicity Gate)

### Web Player Guest Mode: Supabase Anonymous Auth + Cookie

**Decision**: Use Supabase anonymous auth for web players, with a session-scoped cookie storing the anonymous session ID.

**Rationale**:
- Supabase anonymous auth creates a temporary user with `auth.uid()`, enabling RLS policies to work uniformly
- Cookie persistence across browser sessions (httpOnly, SameSite=Strict, 30-day expiry)
- Anonymous users can later be linked to a full account if the web player installs the app
- No separate guest identity system needed

### Local Database: Expo SQLite

**Decision**: Use Expo SQLite for local session state caching.

**Rationale**:
- Built into Expo (no additional dependency)
- Sufficient for caching session state before game night
- WatermelonDB adds complexity not justified at this stage (Simplicity Gate)
- Can migrate to WatermelonDB later if sync complexity warrants it

### State Management: Zustand

**Decision**: Zustand for client-side state management.

**Rationale**:
- Lightweight, TypeScript-native, minimal boilerplate
- Middleware for persistence (to Expo SecureStore or AsyncStorage)
- No provider wrapper needed (simpler component tree)

---

## 3. Project Structure

```
src/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── welcome.tsx           # Onboarding walkthrough
│   │   ├── sign-in.tsx           # Sign-in screen
│   │   ├── sign-up.tsx           # Sign-up screen
│   │   └── verify-email.tsx      # Email verification prompt
│   ├── (tabs)/                   # Authenticated tab group
│   │   ├── index.tsx             # Home screen (sessions list)
│   │   ├── settings.tsx          # Settings & preferences
│   │   └── profile.tsx           # Host profile (session history, content, artifacts)
│   ├── session/
│   │   ├── create.tsx            # Session creation flow
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Session detail/dashboard
│   │   │   ├── edit.tsx          # Session configuration editor
│   │   │   └── invite.tsx        # Invitation management
│   └── _layout.tsx               # Root layout with auth guard
│
├── lib/
│   ├── supabase.ts               # Supabase client initialization
│   ├── auth.ts                   # Auth helper functions
│   └── secure-store.ts           # Expo SecureStore adapter for Supabase
│
├── hooks/
│   ├── use-auth.ts               # Auth state hook (session, user, loading)
│   ├── use-session.ts            # Session CRUD hook
│   ├── use-session-state.ts      # Session state machine transitions
│   └── use-settings.ts           # User preferences hook
│
├── stores/
│   ├── auth-store.ts             # Zustand auth state
│   └── settings-store.ts         # Zustand settings state (with persistence)
│
├── types/
│   ├── auth.ts                   # Auth-related TypeScript types
│   ├── session.ts                # Session, state enum, config types
│   └── database.ts               # Supabase generated types
│
├── utils/
│   ├── session-state-machine.ts  # State transition validation (pure functions)
│   └── deep-link.ts              # Deep link generation and parsing
│
└── constants/
    ├── session-states.ts         # State enum and transition map
    └── notification-categories.ts # Notification preference categories
```

### Web Player Routes (Supabase Edge Function or separate web app)

```
web/
├── join/[invite-code].tsx        # Web join / RSVP page
├── contribute/[session-id].tsx   # Web contribution form
└── artifacts/[session-id].tsx    # Web artifact download page
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Tasks 1-3)
- Supabase project setup and configuration
- Database schema: users, sessions, session_participations, session_state_log
- RLS policies for all tables
- Supabase Auth configuration (email, Apple, Google providers)

### Phase 2: Core Auth (Tasks 4-6)
- React Native auth flows (sign-up, sign-in, sign-out)
- Expo SecureStore token persistence
- Auth guard (protected routes)
- Profile creation and auto-host activation

### Phase 3: Session Management (Tasks 7-9)
- Session CRUD operations
- State machine implementation (client + server validation)
- State transition logging
- Deep link generation

### Phase 4: Guest Mode + Settings (Tasks 10-12)
- Web player join flow (anonymous auth + cookie)
- Settings screen (notification preferences, accessibility)
- Settings persistence and sync

---

## 5. Complexity Tracking

| Decision | Complexity Added | Justification |
|----------|-----------------|---------------|
| PostgreSQL trigger for state machine | Low | Prevents invalid state transitions at database level; ~20 lines of PL/pgSQL |
| Supabase anonymous auth for web players | Low | Reuses existing auth infrastructure; avoids building separate guest identity system |
| Expo SQLite for local caching | Low | Built into Expo; only used for pre-caching session state before game night |
| Zustand for state management | Low | Lightweight; replaces React Context for auth/settings state |
| Session-scoped cookies for web players | Low | Standard browser mechanism; no custom session management |

**Total Edge Functions consumed by this spec**: 0/3
**Total external services added**: 0 (Supabase Auth is part of the existing Supabase stack)

---

## 6. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Apple Sign-In review rejection | High | Low | Follow Apple HIG exactly; test on TestFlight before submission |
| Supabase anonymous auth limitations | Medium | Low | Validate that anonymous users can participate in RLS-protected queries; test account linking flow |
| Session state desync between devices | Medium | Medium | Database trigger is source of truth; client refreshes state on app foreground |
| Web player cookie expiration | Low | Medium | 30-day cookie; re-entry via invitation link regenerates identity |
| Token storage on Android fragmentation | Low | Medium | Expo SecureStore handles platform differences; test on Android 10+ |

---

## 7. Dependencies on Other Specs

This spec (001) is depended on by:

- **002-pre-game-lifecycle**: Depends on Session entity, state machine (INVITING, PREPARING states), and SessionParticipation for invitations and contributions.
- **005-game-night-engine**: Depends on ACTIVE state transition, local session caching, and host/player identity.
- **006-artifact-pipeline**: Depends on COMPLETE state transition and SessionParticipation for artifact delivery routing.

This spec depends on no other spec. It is the foundation.
