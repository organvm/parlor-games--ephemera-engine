# 001 — Requirements Checklist: Authentication & Session Management

Quality validation checklist for the auth and session management specification. Check each item during implementation and before marking the spec as complete.

---

## Specification Quality

- [ ] All user stories have Given/When/Then acceptance scenarios
- [ ] All functional requirements have a priority (P0/P1)
- [ ] Success criteria are measurable (specific numbers, not subjective)
- [ ] Edge cases documented (expired sessions, concurrent limits, account deletion)
- [ ] Entity definitions match PRD section 5.2
- [ ] No contradictions between spec.md and PRD

## Constitution Compliance

### Simplicity Gate
- [ ] Total Edge Functions consumed by this spec: 0/3
- [ ] No external services beyond Supabase
- [ ] No premature abstractions (no repository pattern, no service layer, no DI)
- [ ] Using Supabase Auth directly (no auth wrapper library)
- [ ] State machine implemented as pure functions + database trigger (no XState)
- [ ] Single PostgreSQL database for all entities

### Offline Gate
- [ ] Session data cached to local SQLite before ACTIVE state transition
- [ ] No network requests required during ACTIVE state (for this spec's scope)
- [ ] State transitions queued locally if offline, synced when connectivity resumes
- [ ] Auth token refresh works when coming back online

### Privacy Gate
- [ ] RLS enabled on all four tables
- [ ] Session data only visible to participants (verified by test)
- [ ] No public user profiles or user search
- [ ] No cross-session data aggregation
- [ ] Web player email used only for artifact delivery within the session
- [ ] Host profile is private (not visible to non-participants)
- [ ] 90-day data retention policy documented and implementable

### Analog Gate
- [ ] No features in this spec replace in-room interaction
- [ ] Session management is pre-game activity (before the evening)
- [ ] Settings are configured outside of game night

## Data Model

- [ ] All tables defined with correct PostgreSQL types
- [ ] All foreign key relationships with appropriate ON DELETE behavior
- [ ] Indexes created for all query patterns (host lookup, state filter, invite code, user sessions)
- [ ] RLS policies cover: SELECT, INSERT, UPDATE for each table
- [ ] State transition trigger prevents all invalid transitions
- [ ] State transition logging captures every state change
- [ ] Host auto-activation trigger fires on first session creation
- [ ] JSONB defaults for preferences are valid JSON
- [ ] Enums match the spec (session_state has all 7 values)
- [ ] Unique constraints: invite_code, (session_id, user_id)

## API Contract

- [ ] OpenAPI 3.0 spec is syntactically valid (run through linter)
- [ ] All auth endpoints documented (sign-up, sign-in, social, anonymous, refresh, sign-out, reset)
- [ ] Session CRUD endpoints documented (create, read, update, list)
- [ ] State transition RPC endpoint documented
- [ ] Participant join/RSVP endpoint documented
- [ ] Settings update endpoint documented
- [ ] Error responses defined for all failure modes (401, 403, 404, 409, 422)
- [ ] Request/response schemas match data-model.md types

## Authentication

- [ ] Email sign-up with verification works end-to-end
- [ ] Apple Sign-In uses native flow (not WebView)
- [ ] Google Sign-In uses native flow (not WebView)
- [ ] Tokens stored in Expo SecureStore (encrypted)
- [ ] Auto token refresh before expiry
- [ ] Password reset via email works
- [ ] Minimum 8-character password enforced
- [ ] Social auth account linking works (same email, different providers)
- [ ] Sign-out clears all local auth state
- [ ] Invalid credentials show clear error messages

## Session Management

- [ ] Sessions created in DRAFT state
- [ ] Session configuration auto-saves
- [ ] Session list filterable by state
- [ ] Host can edit session in DRAFT and INVITING states
- [ ] Invite code generated on DRAFT -> INVITING
- [ ] Deep link resolves to correct session
- [ ] Session cancellation notifies all participants
- [ ] Concurrent session limit enforced (5 non-terminal, 1 ACTIVE)
- [ ] Past-date sessions prompt host for action

## State Machine

- [ ] All 8 valid transitions work: DRAFT->INVITING, DRAFT->CANCELED, INVITING->PREPARING, INVITING->CANCELED, PREPARING->ACTIVE, PREPARING->CANCELED, ACTIVE->COMPLETE, COMPLETE->ARCHIVED
- [ ] All invalid transitions rejected (client-side)
- [ ] All invalid transitions rejected (database trigger)
- [ ] State log records every transition with timestamp and actor
- [ ] Concurrent transitions handled (second request rejected or serialized)
- [ ] ARCHIVED and CANCELED are terminal states (no outgoing transitions)
- [ ] Notifications dispatched on appropriate transitions

## Guest Mode

- [ ] Web player can RSVP in <30 seconds from link tap
- [ ] No app install prompt shown to web players
- [ ] Anonymous Supabase auth creates valid user for RLS
- [ ] Session cookie persists across browser close/reopen
- [ ] Web player can submit contributions through mobile browser
- [ ] Email collected for artifact delivery
- [ ] Cookie scoped to specific session
- [ ] Anonymous user can later link to full account

## Settings

- [ ] Notification preferences: all 6 categories independently toggleable
- [ ] Quiet hours: configurable start/end, default 10PM-8AM
- [ ] Quiet hours: critical notifications bypass quiet hours
- [ ] Accessibility: text size applies across all screens
- [ ] Accessibility: high contrast mode works
- [ ] Accessibility: reduce motion respects system setting
- [ ] Theme: Warm, Dark, and System modes work
- [ ] Settings persist across app restart
- [ ] Settings sync to server (available on new device)

## Testing

- [ ] Unit tests: state machine validation (all valid + invalid transitions)
- [ ] Integration tests: auth round-trip (all 3 providers)
- [ ] Integration tests: session CRUD with RLS verification
- [ ] Integration tests: state machine with database trigger
- [ ] Integration tests: concurrent state transitions
- [ ] Integration tests: RLS isolation (non-participant cannot see session)
- [ ] Integration tests: guest mode (anonymous auth, cookie, RSVP)
- [ ] Integration tests: settings persistence
- [ ] E2E tests: full auth flow (sign-up through Home screen)
- [ ] E2E tests: session creation through state transitions
- [ ] All quickstart.md scenarios covered by tests

## Performance

- [ ] Social auth sign-up: <60 seconds
- [ ] Email auth sign-up: <90 seconds (excluding verification)
- [ ] Web player RSVP: <30 seconds from link tap
- [ ] Session creation (defaults): <5 minutes
- [ ] State transition: <500ms
- [ ] Deep link resolution: <3 seconds
- [ ] Settings screen load: <300ms

## Security

- [ ] No secrets in source code or version control
- [ ] Auth tokens in SecureStore, not AsyncStorage
- [ ] RLS policies prevent privilege escalation
- [ ] Invite codes are not sequential or predictable
- [ ] Password reset tokens are single-use and time-limited
- [ ] Session cookies are httpOnly and SameSite=Strict
- [ ] No user enumeration via sign-up or password reset (consistent response times)
- [ ] Anonymous user cleanup scheduled (30-day abandoned sessions)

## Documentation

- [ ] All 8 spec files complete and consistent with each other
- [ ] Data model matches OpenAPI schemas
- [ ] Task list covers all functional requirements
- [ ] Quickstart scenarios cover all critical paths
- [ ] Research.md documents all technology decisions with rationale
