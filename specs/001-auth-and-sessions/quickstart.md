# 001 — Quickstart: Key Validation Scenarios

Critical scenarios to validate before considering this spec implementation complete. Each scenario maps to acceptance criteria in `spec.md` and should be testable with the defined stack (Vitest for unit/integration, Maestro/Detox for E2E).

---

## Scenario 1: Full Auth Round-Trip

**Goal**: Verify that a new user can sign up, sign out, and sign back in with all three auth providers.

**Steps**:
1. Launch app fresh (no existing account)
2. Sign up with email: `test@example.com`, password: `testpass1`, display name: `Eleanor` <!-- allow-secret -->
3. Verify: user profile created in `public.users` with `auth_provider = 'email'`
4. Verify: `is_host = false` (no sessions created yet)
5. Sign out
6. Sign back in with email credentials
7. Verify: same user profile loaded, `last_active_at` updated
8. Repeat steps 2-7 with Apple Sign-In (mock identity token in test)
9. Repeat steps 2-7 with Google Sign-In (mock identity token in test)

**Validates**: US-001 (Scenarios 1a-1d), FR-001 through FR-010

**Test type**: E2E (Maestro) + integration (Vitest with Supabase local)

---

## Scenario 2: Session Creation and State Machine Walk-Through

**Goal**: Walk a session through every valid state from DRAFT to ARCHIVED.

**Steps**:
1. As authenticated host, create a Confession Album session with name, date, default config
2. Verify: session in DRAFT state, `host_id` matches current user
3. Verify: `is_host` flag is now `true` on user profile
4. Transition: DRAFT -> INVITING (send invitations)
5. Verify: `invite_code` generated, state log entry recorded
6. Transition: INVITING -> PREPARING
7. Verify: state log entry with `from_state = INVITING`, `to_state = PREPARING`
8. Transition: PREPARING -> ACTIVE
9. Verify: session data available in local SQLite cache
10. Transition: ACTIVE -> COMPLETE
11. Verify: local state synced to server
12. Transition: COMPLETE -> ARCHIVED
13. Verify: session in ARCHIVED state, full state log has 5 entries

**Validates**: US-002 (Scenarios 2a-2g), US-003 (Scenario 3a-3c), FR-021 through FR-033

**Test type**: Integration (Vitest with Supabase local)

---

## Scenario 3: Invalid State Transitions Rejected

**Goal**: Confirm that the state machine rejects all invalid transitions at both client and database level.

**Steps**:
1. Create session in DRAFT state
2. Attempt: DRAFT -> ACTIVE (skip INVITING and PREPARING)
3. Verify: client-side validation rejects with descriptive error
4. Attempt via direct database update: `UPDATE sessions SET state = 'ACTIVE' WHERE id = ...`
5. Verify: PostgreSQL trigger raises `check_violation` exception
6. Attempt: COMPLETE -> DRAFT (backwards transition)
7. Verify: rejected at both client and database
8. Attempt: ARCHIVED -> anything
9. Verify: ARCHIVED is a terminal state, all transitions rejected
10. Attempt: CANCELED -> anything
11. Verify: CANCELED is a terminal state, all transitions rejected

**Validates**: US-003 (Scenario 3a), FR-027, FR-028

**Test type**: Unit (Vitest for client validation) + integration (Vitest with Supabase local for trigger)

---

## Scenario 4: Web Player Guest Join Flow

**Goal**: Verify that a web player can join, RSVP, and receive session identity without creating an account.

**Steps**:
1. As host, create a session and transition to INVITING
2. Copy the invitation deep link: `https://ephemera.app/join/{invite_code}`
3. Open the link in a mobile browser (no app installed)
4. Verify: web join page loads with session details (name, date, host name, atmosphere)
5. Verify: no app install prompt is displayed
6. Enter display name: `Guest Player`
7. Tap "Accept"
8. Verify: anonymous Supabase auth session created
9. Verify: session cookie set with anonymous session ID
10. Verify: `session_participations` record created with `role = 'web_player'`, `user_id` set to anonymous user ID
11. Close browser
12. Reopen browser, navigate back to session page
13. Verify: session identity persisted via cookie, no re-entry required
14. Enter email address when prompted
15. Verify: email stored in `session_participations.email` for this session only

**Validates**: US-004 (Scenarios 4a-4f), FR-011 through FR-016

**Test type**: E2E (browser automation) + integration (Vitest with Supabase local)

---

## Scenario 5: RLS Policy Isolation

**Goal**: Confirm that session data is invisible to non-participants.

**Steps**:
1. As User A (host), create a session and add User B as participant
2. As User C (not a participant), attempt to query the session by ID
3. Verify: User C receives empty result (not 403, just no rows — RLS returns empty set)
4. As User C, attempt to query `session_participations` for the session
5. Verify: empty result
6. As User B (participant), query the session
7. Verify: session data returned including participant list
8. As User B, attempt to update the session (change name)
9. Verify: update rejected (only host can write)
10. As User A (host), update the session name
11. Verify: update succeeds

**Validates**: FR-020, Privacy Gate, data-model.md RLS policies

**Test type**: Integration (Vitest with Supabase local, multiple auth contexts)

---

## Scenario 6: Concurrent State Transition

**Goal**: Verify that concurrent state transition attempts are handled safely.

**Steps**:
1. Create session, transition to PREPARING state
2. Simultaneously send two PREPARING -> ACTIVE transition requests
3. Verify: exactly one succeeds, the other fails with conflict error
4. Verify: session is in ACTIVE state (not corrupted)
5. Verify: exactly one state log entry for the transition

**Validates**: US-003 (Scenario 3d), FR-031

**Test type**: Integration (Vitest with concurrent async calls against Supabase local)

---

## Scenario 7: Settings Persistence

**Goal**: Verify that notification and accessibility preferences persist across app restart and device switch.

**Steps**:
1. Sign in as authenticated user
2. Navigate to Settings -> Notification Preferences
3. Toggle off "Contribution reminders" and set quiet hours to 11 PM - 7 AM
4. Navigate to Accessibility Settings
5. Set text size to "Large" and enable high contrast
6. Force-close app
7. Relaunch app
8. Verify: all settings preserved (contribution reminders off, quiet hours 11PM-7AM, text size large, high contrast on)
9. Sign out
10. Sign in on a different device (or clear local storage and sign back in)
11. Verify: settings synced from server, all preferences match

**Validates**: US-005 (Scenarios 5a-5e), FR-034 through FR-040

**Test type**: E2E (Maestro) + integration (Vitest with Supabase local)

---

## Scenario 8: Host Concurrent Session Limits

**Goal**: Verify enforcement of concurrent session limits.

**Steps**:
1. As host, create 5 sessions in DRAFT state
2. Attempt to create a 6th session
3. Verify: creation rejected with message about concurrent session limit
4. Cancel one of the 5 sessions
5. Verify: can now create a new session (4 active + 1 new = 5)
6. Transition one session to ACTIVE
7. Attempt to transition a second session to ACTIVE
8. Verify: rejected — only 1 ACTIVE session at a time

**Validates**: Edge case 5.2, application-level business rules

**Test type**: Integration (Vitest with Supabase local)

---

## Smoke Test Checklist

For rapid validation during development:

- [ ] Email sign-up creates user in both `auth.users` and `public.users`
- [ ] Social auth (Apple/Google) creates linked account
- [ ] Auth tokens stored in SecureStore (not AsyncStorage)
- [ ] Token refresh happens silently before expiry
- [ ] Session CRUD works (create, read, update)
- [ ] State machine rejects invalid transitions
- [ ] State log records all transitions
- [ ] First session creation sets `is_host = true`
- [ ] Invite code generated on DRAFT -> INVITING
- [ ] RLS blocks cross-user session access
- [ ] Web player anonymous auth creates participation record
- [ ] Settings save and restore correctly
- [ ] Quiet hours queue notifications appropriately
