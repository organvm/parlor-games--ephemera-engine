# 001 — Authentication & Session Management

Feature specification for user authentication, guest mode, host profile activation, session CRUD, session state machine, and settings/preferences.

**Spec ID**: 001-auth-and-sessions
**Priority**: P0 (Launch Requirement)
**Status**: Draft
**Depends On**: None (foundational spec)
**Depended On By**: 002-pre-game-lifecycle, 005-game-night-engine, 006-artifact-pipeline

**PRD Sections**: 2.1 (Authentication & Profiles), 2.2 (Session Management), 2.9 (Settings & Preferences)

---

## 1. User Stories

### US-001: Host Creates Account and First Session (P1)

**As** a first-time host,
**I want** to create an account and start configuring my first game session,
**so that** I can begin preparing an evening for my friends.

#### Acceptance Scenarios

**Scenario 1a: Sign up with Apple**
```
Given I have launched the app for the first time
When I tap "Continue with Apple" on the sign-up screen
And I complete the Apple Sign-In native flow
Then my account is created with my Apple ID display name
And I land on the Home screen within 60 seconds of initiating sign-up
And my auth token is securely stored on device
```

**Scenario 1b: Sign up with Google**
```
Given I have launched the app for the first time
When I tap "Continue with Google" on the sign-up screen
And I complete the Google Sign-In native flow
Then my account is created with my Google display name
And I land on the Home screen within 60 seconds of initiating sign-up
```

**Scenario 1c: Sign up with email**
```
Given I have launched the app for the first time
When I tap "Sign up with email"
And I enter a valid email address, password (≥8 characters), and display name
And I submit the form
Then a verification email is sent to my address
And I see a "Check your email" confirmation screen
And upon clicking the verification link, my account is activated
And I land on the Home screen within 90 seconds of initiating sign-up (excluding verification)
```

**Scenario 1d: Sign in to existing account**
```
Given I have a verified account
When I tap "Sign In" and enter my credentials (email/password or social auth)
Then I am authenticated and land on the Home screen
And my previous session history and artifacts are available
```

**Scenario 1e: Host profile auto-activation**
```
Given I am an authenticated user who has never hosted
When I create my first session (see US-002)
Then host capabilities are automatically activated on my profile
And I see my session history, content library, and hosting preferences
And no separate "become a host" flow or paywall is presented
```

**Scenario 1f: Invalid sign-up attempt**
```
Given I am on the sign-up screen
When I enter an email already registered, or a password shorter than 8 characters
Then I see a clear, specific error message
And my entered data is preserved so I can correct only the error
```

---

### US-002: Session CRUD and State Machine (P1)

**As** a host,
**I want** to create, edit, and manage game sessions through their full lifecycle,
**so that** I can prepare, host, and archive each evening's experience.

#### Acceptance Scenarios

**Scenario 2a: Create session**
```
Given I am an authenticated user on the Home screen
When I tap "Create Session" and select a game type
And I enter session name, date/time, and expected guest count
And I confirm the session
Then a new session is created in DRAFT state
And it appears on my Home screen under "Upcoming"
And session creation completes in <5 minutes for default settings
```

**Scenario 2b: Edit draft session**
```
Given I have a session in DRAFT state
When I tap into the session and modify any configuration field
Then my changes are saved immediately (auto-save)
And I can close and reopen the session without data loss
```

**Scenario 2c: DRAFT to INVITING transition**
```
Given I have a session in DRAFT state with valid configuration
When I tap "Send Invitations"
Then the session transitions to INVITING state
And a unique deep link is generated for the session
And the transition is logged with timestamp
And I cannot revert to DRAFT state
```

**Scenario 2d: INVITING to PREPARING transition**
```
Given I have a session in INVITING state
When I manually trigger "Close RSVPs" OR the RSVP deadline passes
Then the session transitions to PREPARING state
And all pending RSVPs are resolved (treated as no-response)
And contribution forms become available to accepted players
```

**Scenario 2e: PREPARING to ACTIVE transition**
```
Given I have a session in PREPARING state
When I tap "Start Game Night"
And I confirm the action
Then the session transitions to ACTIVE state
And all session data is synced to local database for offline use
And the Game Night Dashboard launches in ambient mode
```

**Scenario 2f: ACTIVE to COMPLETE transition**
```
Given I have a session in ACTIVE state
When I tap "End Game Night" and confirm
Then the session transitions to COMPLETE state
And artifact generation becomes available
And local game night data syncs to server when connectivity resumes
```

**Scenario 2g: COMPLETE to ARCHIVED transition**
```
Given I have a session in COMPLETE state
When all artifacts (including delayed) have been delivered
Then the session auto-transitions to ARCHIVED state
OR I can manually archive the session at any time
And the session moves to my session history
And session data is retained for 90 days per retention policy
```

**Scenario 2h: Cancel session**
```
Given I have a session in DRAFT, INVITING, or PREPARING state
When I tap "Cancel Session" and confirm
Then the session transitions to CANCELED state
And all participants receive a cancellation notification
And the session is removed from active views
```

**Scenario 2i: Invalid state transition**
```
Given I have a session in COMPLETE state
When I attempt to transition directly to DRAFT or ACTIVE
Then the transition is rejected
And an error is logged (but not shown to the user as a disruptive modal)
And the session remains in its current valid state
```

---

### US-003: Session State Machine Integrity (P1)

**As** the system,
**I want** to enforce valid state transitions and log all state changes,
**so that** sessions always have consistent, auditable lifecycle data.

#### Acceptance Scenarios

**Scenario 3a: Valid transitions are enforced**
```
Given the session state machine defines these valid transitions:
  DRAFT → INVITING
  DRAFT → CANCELED
  INVITING → PREPARING
  INVITING → CANCELED
  PREPARING → ACTIVE
  PREPARING → CANCELED
  ACTIVE → COMPLETE
  COMPLETE → ARCHIVED
When any state transition is attempted
Then only valid transitions succeed
And invalid transitions are rejected with a descriptive error code
```

**Scenario 3b: State transitions are atomic**
```
Given a session state transition is in progress
When the transition completes
Then both the state change and any side effects (notifications, feature toggles) are committed atomically
And if any part fails, the entire transition rolls back
```

**Scenario 3c: State transitions trigger notifications**
```
Given a valid state transition occurs
Then appropriate notifications are dispatched to relevant participants:
  DRAFT → INVITING: invitation notifications to invitees
  INVITING → PREPARING: "contributions now open" to accepted players
  PREPARING → ACTIVE: "game night is starting" to all participants
  ACTIVE → COMPLETE: "game night has ended, artifacts coming" to all
  COMPLETE → ARCHIVED: no notification (silent)
  Any → CANCELED: "session canceled" to all participants
```

**Scenario 3d: Concurrent transition prevention**
```
Given a state transition is being processed
When a second transition request arrives for the same session
Then the second request is rejected with a conflict error
And the first transition completes normally
```

---

### US-004: Web Player Guest Mode (P2)

**As** a dinner party guest who does not want to install an app,
**I want** to RSVP and contribute via mobile browser without creating an account,
**so that** I can participate fully without friction.

#### Acceptance Scenarios

**Scenario 4a: Join via invitation link**
```
Given I received an invitation link via text or email
When I tap the link on my mobile device
And the app is not installed
Then a mobile web page opens showing the session invitation
And I see: game name, date, host name, and atmosphere description
And I am NOT prompted to install the app or create an account
```

**Scenario 4b: RSVP as guest**
```
Given I am viewing the web invitation page
When I enter my display name only
And I tap Accept / Decline / Maybe
Then my RSVP is recorded
And a session cookie is set to maintain my identity
And the entire RSVP flow completes in <30 seconds from link tap
```

**Scenario 4c: Submit contributions as guest**
```
Given I RSVPed "Accept" as a web player
When I navigate to the contribution form (via web session page)
Then I can view my contribution brief and submit all required contributions
And the contribution form is identical in capability to the app version
And my drafts auto-save to browser local storage
```

**Scenario 4d: Receive artifacts as guest**
```
Given I am a web player who participated in a session
And the session has reached COMPLETE state
When artifacts are generated
Then I receive an email with PDF attachments or download links
And I can view artifacts without logging in or installing the app
```

**Scenario 4e: Session cookie persistence**
```
Given I have RSVPed as a web player via session cookie
When I close and reopen my browser
Then my session identity persists (cookie-based, not account-based)
And I can continue contributing without re-entering my name
And the cookie is scoped to this specific session only
```

**Scenario 4f: Guest email collection**
```
Given I am a web player who has RSVPed
When I submit my first contribution OR at artifact delivery time
Then I am prompted to enter my email address (for artifact delivery)
And the email is stored only within this session's participation record
And it is not used for marketing or cross-session communication
```

---

### US-005: Notification Preferences and Settings (P3)

**As** a user,
**I want** to control which notifications I receive and configure accessibility settings,
**so that** the app respects my preferences and needs.

#### Acceptance Scenarios

**Scenario 5a: Notification category toggles**
```
Given I am on the Settings screen
When I navigate to Notification Preferences
Then I see per-category toggles:
  - Invitation notifications (default: On)
  - Contribution reminders (default: On)
  - Game night notifications (default: On)
  - Artifact notifications (default: On)
  - Delayed artifact notifications (default: On)
  - Email notifications for web sessions (default: On)
And toggling any category immediately updates my preference
```

**Scenario 5b: Quiet hours**
```
Given I have configured quiet hours (default: 10 PM - 8 AM)
When a notification is triggered during quiet hours
Then it is queued and delivered at the end of the quiet period
And critical notifications (session cancellation) are still delivered immediately
```

**Scenario 5c: Accessibility settings**
```
Given I am on the Settings screen
When I navigate to Accessibility Settings
Then I can configure:
  - Text size: System / Large / Extra Large
  - High contrast mode: On / Off
  - Reduce motion: On / Off (respects system setting)
  - Screen reader optimization: Auto (VoiceOver/TalkBack)
  - Written answer mode: Enable / Disable
And changes apply immediately across the entire app
```

**Scenario 5d: Theme selection**
```
Given I am on the Settings screen
When I select a theme (Warm / Dark / System)
Then the app theme updates immediately
And both warm and dark modes use the design language specified:
  Warm: cream/amber palette
  Dark: charcoal with gold accents (not pure black)
```

**Scenario 5e: Settings persistence across sessions**
```
Given I have configured my notification and accessibility preferences
When I close and reopen the app, or log in on a new device
Then all my settings are restored to their configured values
```

---

## 2. Functional Requirements

### Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | System shall support email/password authentication with email verification | P0 |
| FR-002 | System shall support Apple Sign-In using the native iOS flow | P0 |
| FR-003 | System shall support Google Sign-In using the native platform flow | P0 |
| FR-004 | System shall store auth tokens securely on device (not in plain storage) | P0 |
| FR-005 | System shall automatically refresh expired auth tokens without user intervention | P0 |
| FR-006 | System shall support sign-out, clearing all local auth state | P0 |
| FR-007 | System shall support password reset via email link | P0 |
| FR-008 | System shall enforce minimum password length of 8 characters | P0 |
| FR-009 | Social auth shall use platform-native flows, not embedded WebViews | P0 |
| FR-010 | System shall create a user profile with display_name, optional avatar, and unique ID upon sign-up | P0 |

### Guest Mode

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011 | Web players shall be able to RSVP without creating an account | P0 |
| FR-012 | Web player identity shall be maintained via session-scoped cookie | P0 |
| FR-013 | Web player shall be able to submit all contribution types through mobile browser | P0 |
| FR-014 | Web player email shall be collected for artifact delivery only, not marketing | P0 |
| FR-015 | No app install prompt shall be shown to web players during the join flow | P0 |
| FR-016 | Session cookie shall persist across browser close/reopen for the session duration | P0 |

### Host Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017 | Host capabilities shall activate automatically on first session creation | P0 |
| FR-018 | No separate role selection, paywall, or "become a host" flow shall exist | P0 |
| FR-019 | Host profile shall include: session history, content library, artifact library, hosting preferences | P0 |
| FR-020 | Host profile shall be private — not visible to other users | P0 |

### Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021 | System shall support creating sessions with: game_type, name, date_time, guest count, and game-specific config (JSON) | P0 |
| FR-022 | New sessions shall be created in DRAFT state | P0 |
| FR-023 | Session configuration shall be editable in DRAFT and INVITING states; limited editing in PREPARING | P0 |
| FR-024 | Sessions shall auto-save during configuration (no explicit save button required) | P0 |
| FR-025 | Session deep links shall be generated on DRAFT → INVITING transition | P0 |
| FR-026 | Host shall be able to cancel any session in a pre-ACTIVE state | P0 |

### State Machine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-027 | System shall enforce the defined state machine: DRAFT → INVITING → PREPARING → ACTIVE → COMPLETE → ARCHIVED, plus CANCELED from any pre-ACTIVE state | P0 |
| FR-028 | Invalid state transitions shall be rejected at both client and server | P0 |
| FR-029 | State transitions shall be atomic — no partial transitions | P0 |
| FR-030 | All state transitions shall be logged with timestamp, actor, and previous state | P0 |
| FR-031 | Concurrent transition attempts on the same session shall be serialized or rejected | P0 |
| FR-032 | State transitions shall trigger appropriate notifications to relevant participants | P0 |
| FR-033 | COMPLETE → ARCHIVED shall auto-trigger when all artifacts (including delayed) are delivered | P0 |

### Settings & Preferences

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-034 | Users shall be able to toggle notification categories independently | P0 |
| FR-035 | Quiet hours shall queue non-critical notifications for morning delivery | P0 |
| FR-036 | Critical notifications (cancellation) shall bypass quiet hours | P0 |
| FR-037 | Accessibility settings shall apply immediately across all app screens | P0 |
| FR-038 | Settings shall sync across devices via user profile | P1 |
| FR-039 | App theme shall support Warm, Dark, and System modes | P1 |
| FR-040 | Reduce motion setting shall respect the platform system-level setting by default | P0 |

---

## 3. Key Entities

These entities define the data boundary for this spec. Full schema in `data-model.md`.

### User
- `id` (UUID) — unique identifier
- `display_name` (text) — user-chosen display name
- `email` (text) — authentication email
- `auth_provider` (enum) — email, apple, google
- `avatar_url` (text, nullable) — optional profile photo
- `is_host` (boolean) — activated on first session creation
- `notification_preferences` (JSONB) — per-category toggles and quiet hours
- `accessibility_preferences` (JSONB) — text size, contrast, motion, theme
- `created_at` (timestamptz) — account creation
- `last_active_at` (timestamptz) — last app interaction

### Session
- `id` (UUID) — unique identifier
- `game_type` (enum) — confession_album, murder_mystery, whose_memory, exquisite_corpse
- `name` (text) — host-chosen or auto-generated name
- `date_time` (timestamptz) — scheduled game night date and time
- `state` (enum) — DRAFT, INVITING, PREPARING, ACTIVE, COMPLETE, ARCHIVED, CANCELED
- `host_id` (UUID, FK) — references User
- `config` (JSONB) — game-specific configuration
- `invite_code` (text, unique) — deep link code for invitation
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### SessionParticipation
- `id` (UUID) — unique identifier
- `session_id` (UUID, FK) — references Session
- `user_id` (UUID, nullable, FK) — references User; null for web players
- `display_name` (text) — participant name (from account or entered by web player)
- `email` (text, nullable) — for web player artifact delivery
- `role` (enum) — host, app_player, web_player
- `rsvp_status` (enum) — pending, accepted, declined, maybe
- `character_id` (UUID, nullable) — Murder Mystery character assignment
- `joined_at` (timestamptz)

### SessionStateLog
- `id` (UUID) — unique identifier
- `session_id` (UUID, FK) — references Session
- `from_state` (enum) — previous state
- `to_state` (enum) — new state
- `triggered_by` (UUID, FK) — user who triggered the transition
- `timestamp` (timestamptz)
- `metadata` (JSONB, nullable) — additional context

---

## 4. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Social auth sign-up time | <60 seconds | Timer from first tap to Home screen |
| Email auth sign-up time | <90 seconds | Timer from first tap to Home screen (excluding verification wait) |
| Web player RSVP time | <30 seconds | Timer from link tap to RSVP confirmation |
| Session creation time (defaults) | <5 minutes | Timer from "Create Session" to session saved |
| State transition latency | <500ms | Time from trigger to confirmed state change |
| State transition atomicity | 100% | No partial transitions in production |
| Notification delivery | <30 seconds | From trigger event to device receipt |
| Settings persistence | 100% | Settings survive app restart and device switch |
| Deep link resolution | <3 seconds | From link tap to app/web content display |

---

## 5. Edge Cases

### 5.1 Expired Sessions
- Sessions in DRAFT state for >30 days without activity are flagged for cleanup
- Sessions with date_time in the past that are still in DRAFT or INVITING state: host receives a "Your session date has passed" prompt with options to update the date or cancel
- ACTIVE sessions that are not ended within 24 hours: system sends host a reminder; no auto-transition (the host controls pacing)

### 5.2 Concurrent Session Limits
- A host may have up to 5 sessions in non-terminal states (DRAFT through COMPLETE) simultaneously
- A host may have only 1 session in ACTIVE state at a time
- No limit on ARCHIVED or CANCELED sessions
- A player may participate in unlimited sessions concurrently

### 5.3 Account Deletion
- User may request account deletion from Settings
- Deletion removes: user profile, auth credentials, notification preferences, accessibility settings
- Deletion preserves: artifacts already delivered to the user (stored locally), session history for other participants (display_name retained, user_id nullified)
- Sessions hosted by a deleted user: if DRAFT/INVITING/PREPARING, auto-canceled; if COMPLETE, auto-archived; if ACTIVE, transition to COMPLETE first
- Deletion is irreversible and completes within 30 days (per data retention policy)
- Web player data is not affected by account deletion (web players have no account)

### 5.4 Auth Token Expiration
- Access tokens expire after 1 hour; refresh tokens after 30 days
- Expired access tokens are silently refreshed using the refresh token
- If the refresh token is also expired, the user is prompted to sign in again
- All local session data is preserved during re-authentication

### 5.5 Duplicate Account Prevention
- If a user signs up with email and later tries to sign in with a social provider using the same email, the system links the accounts
- If a user has a social auth account and attempts email sign-up with the same address, they are prompted to sign in with their existing social provider

### 5.6 Web Player Returning to App
- A web player who later installs the app and creates an account can claim their past web participations by matching their email address
- Claimed participations link to the new user_id; artifacts become available in the app's artifact library
