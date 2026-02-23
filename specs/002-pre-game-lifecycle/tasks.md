# Tasks: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Total tasks**: 19
**Dependency chain**: Tasks are ordered so each task's dependencies are completed before it begins.

**Legend**:
- `[P0]` / `[P1]` / `[P2]` — Priority tier
- `[Story N]` — Maps to user story in spec.md
- `[ ]` — Not started
- `[x]` — Complete
- `[~]` — In progress

---

## Phase 1: Database Foundation

### Task 1: Create invitation_tokens migration
`[P0]` `[Story 1]`
- [ ] Write `supabase/migrations/002_invitation_tokens.sql`
- [ ] Create `invitation_tokens` table with all columns and constraints
- [ ] Add indexes (token unique, session_id, session_shared)
- [ ] Add RLS policies (host management, public read by token)
- [ ] Write rollback migration
- [ ] Test: token CRUD, RLS enforcement, constraint validation
- **Depends on**: 001 sessions table exists
- **Estimate**: 2 hours

### Task 2: Create contributions migration
`[P0]` `[Story 2]`
- [ ] Write `supabase/migrations/003_contributions.sql`
- [ ] Create `contributions` table with all columns, constraints, and JSONB content
- [ ] Add `updated_at` trigger function
- [ ] Add indexes (session, participant, session+status, session+type, unique per type)
- [ ] Add RLS policies (player own CRUD, host read+update)
- [ ] Write rollback migration
- [ ] Test: contribution CRUD, draft/submitted/reviewed transitions, RLS for player vs host
- **Depends on**: 001 sessions, session_participations tables exist
- **Estimate**: 3 hours

### Task 3: Create notification infrastructure migration
`[P0]` `[Story 3]`
- [ ] Write `supabase/migrations/004_notification_queue.sql`
- [ ] Create `notification_queue` table with constraints
- [ ] Create `push_tokens` table
- [ ] Create `notification_preferences` table
- [ ] Create helper functions: `should_suppress_notification`, `should_batch_notification`, `notification_category_group`
- [ ] Create `enqueue_notification` function with dedup/batch/preference logic
- [ ] Create `process_pending_notifications` function for pg_cron
- [ ] Schedule pg_cron job (every 15 minutes)
- [ ] Add all indexes and RLS policies
- [ ] Write rollback migration
- [ ] Test: enqueue, dedup suppression, batch suppression, preference suppression, scheduled processing
- **Depends on**: 001 users table exists
- **Estimate**: 4 hours

### Task 4: Create content_packs and user_content_packs migration
`[P1]` `[Story 4]`
- [ ] Write `supabase/migrations/005_content_packs.sql`
- [ ] Create `content_packs` table with YAML-schema-aligned columns
- [ ] Create `user_content_packs` junction table
- [ ] Add indexes and RLS policies (public read for catalog, user read for owned)
- [ ] Write rollback migration
- [ ] Test: pack CRUD, ownership recording, public browsing RLS
- **Depends on**: 001 users table exists
- **Estimate**: 2 hours

### Task 5: Create role assignment migration
`[P2]` `[Story 5]`
- [ ] Write `supabase/migrations/006_role_assignments.sql`
- [ ] Add `character_data`, `character_assigned_at`, `contribution_deadline`, `timezone` columns to `session_participations`
- [ ] Add `contribution_deadline` column to `sessions`
- [ ] Create `character_preferences` table
- [ ] Add indexes and RLS policies
- [ ] Write rollback migration
- [ ] Test: character data storage, preference CRUD, RLS for player vs host
- **Depends on**: 001 session_participations table exists
- **Estimate**: 2 hours

### Task 6: Seed bundled content data
`[P0]` `[Story 4]`
- [ ] Write `supabase/seed/bundled-content.sql`
- [ ] Insert bundled content packs (Confession Album questions, Murder Mystery seeds/eras/archetypes)
- [ ] Validate item counts match PRD 2.8.1 (35 Classic Proust, 20 Thematic Remix, 10 Vanity Fair, 10 Pivot/Lipton, 5 Setting Seeds, 10 Eras, 30 Archetypes, 10 Crime Mechanics)
- [ ] Mark all bundled packs with `is_bundled = true`
- [ ] Test: bundled content loads correctly, item_count matches actual items array length
- **Depends on**: Task 4
- **Estimate**: 4 hours

---

## Phase 2: Backend Services

### Task 7: Implement send-notification Edge Function
`[P0]` `[Story 3]`
- [ ] Create `supabase/functions/send-notification/index.ts`
- [ ] Listen for `dispatch_notification` pg_notify events
- [ ] Read pending/ready notifications from queue
- [ ] Resolve recipient push tokens from `push_tokens` table
- [ ] Apply quiet hours logic (check recipient timezone, reschedule if needed)
- [ ] Send push via Expo Push API (batch up to 100)
- [ ] Send email via transactional email API (Resend/Postmark) for web players
- [ ] Update notification_queue status (sent/failed) and delivery timestamps
- [ ] Handle Expo Push API errors (DeviceNotRegistered -> deactivate token)
- [ ] Test: push dispatch, email dispatch, quiet hours rescheduling, error handling, token deactivation
- **Depends on**: Task 3
- **Estimate**: 6 hours

### Task 8: Implement process-iap-receipt Edge Function
`[P1]` `[Story 4]`
- [ ] Create `supabase/functions/process-iap-receipt/index.ts`
- [ ] Validate Apple receipts via App Store Server API v2 (JWS verification)
- [ ] Validate Google receipts via Google Play Developer API
- [ ] On valid receipt: insert into `user_content_packs`, generate signed download URL
- [ ] On invalid receipt: return 400 with error details
- [ ] Store validated receipt data for audit
- [ ] Test: valid Apple receipt, valid Google receipt, tampered receipt rejection, duplicate purchase handling
- **Depends on**: Task 4
- **Estimate**: 5 hours

### Task 9: Create Supabase Storage buckets and policies
`[P0]` `[Story 2, Story 4]`
- [ ] Create `contribution-photos` bucket (2MB limit, image types only)
- [ ] Create `content-packs` bucket (5MB limit, JSON only)
- [ ] Write RLS policies for contribution-photos (contributor upload, contributor+host read)
- [ ] Write RLS policies for content-packs (owner download only)
- [ ] Test: upload as contributor, read as host, deny read as other player, download owned pack
- **Depends on**: Task 2, Task 4
- **Estimate**: 2 hours

---

## Phase 3: Client Infrastructure

### Task 10: Implement deep link configuration and resolution
`[P0]` `[Story 1]`
- [ ] Configure `expo.ios.associatedDomains` and `expo.android.intentFilters` in app config
- [ ] Create `apple-app-site-association` and `assetlinks.json` files for the web domain
- [ ] Implement `useDeepLink` hook using expo-router's `useLocalSearchParams`
- [ ] Create `app/invite/[token].tsx` route that resolves token and renders invitation
- [ ] Implement `deeplink.service.ts` with token validation against backend
- [ ] Handle edge cases: expired token, invalid token, already-RSVPed user
- [ ] Test: deep link resolution on iOS, deep link resolution on Android, web fallback, error states
- **Depends on**: Task 1
- **Estimate**: 5 hours

### Task 11: Build invitation and RSVP UI components
`[P0]` `[Story 1]`
- [ ] Create `InvitationComposer.tsx` (host: generate link, share via system share sheet)
- [ ] Create `SessionInvitation.tsx` (player: view invitation details, RSVP buttons)
- [ ] Create `RsvpDashboard.tsx` (host: real-time RSVP matrix with counts)
- [ ] Implement `useRsvpStatus` hook with Supabase Realtime subscription
- [ ] Implement `useInvitationToken` hook for token generation
- [ ] Style invitation screen to match "atmosphere, not rules document" principle
- [ ] Test: component rendering, RSVP state transitions, real-time dashboard updates
- **Depends on**: Task 10
- **Estimate**: 6 hours

### Task 12: Build contribution form and dashboard
`[P0]` `[Story 2]`
- [ ] Create `ContributionBrief.tsx` (player: narratively-framed brief display)
- [ ] Create `ContributionForm.tsx` (schema-driven form with React Hook Form + Zod)
- [ ] Create `PhotoUpload.tsx` (expo-image-picker + expo-image-manipulator compression)
- [ ] Implement `useAutoSave` hook (30-second interval, save to MMKV, sync on submit)
- [ ] Create `ContributionDashboard.tsx` (host: matrix with submitted/pending/overdue cells)
- [ ] Implement `useContribution` hook (CRUD, draft management, status transitions)
- [ ] Implement `useContributionMatrix` hook (Supabase Realtime subscription for host)
- [ ] Style brief and form to be narratively motivated, not generic
- [ ] Test: form rendering per game type, auto-save, photo upload and compression, dashboard matrix, real-time updates
- **Depends on**: Task 2, Task 9
- **Estimate**: 8 hours

### Task 13: Implement push notification client
`[P0]` `[Story 3]`
- [ ] Implement `usePushRegistration` hook (request permission, get Expo push token, store in DB)
- [ ] Implement `useNotificationHandler` hook (foreground display, background handling, tap routing)
- [ ] Register notification categories for iOS (invitation RSVP actions)
- [ ] Create `NotificationPreferences.tsx` settings screen
- [ ] Handle token refresh on app launch
- [ ] Test: permission request flow, token registration, foreground notification, background notification, tap navigation, preference updates
- **Depends on**: Task 3, Task 7
- **Estimate**: 5 hours

### Task 14: Build content store UI
`[P1]` `[Story 4]`
- [ ] Create `StoreHome.tsx` (browse packs by game type, grid/list layout)
- [ ] Create `PackDetail.tsx` (description, preview items, purchase button)
- [ ] Create `PurchaseButton.tsx` (triggers native IAP dialog)
- [ ] Implement `useContentPacks` hook (fetch catalog, track ownership)
- [ ] Implement `useIAP` hook (react-native-iap integration: products, purchase, restore)
- [ ] Implement `useContentLibrary` hook (local content management, merge on download)
- [ ] Handle purchase restoration flow
- [ ] Test: store listing, pack preview, mock purchase flow, content merge, restore
- **Depends on**: Task 4, Task 8
- **Estimate**: 7 hours

### Task 15: Build role assignment UI
`[P2]` `[Story 5]`
- [ ] Create `CharacterAssignment.tsx` (host: drag-drop or tap-to-assign interface)
- [ ] Create `CharacterRoster.tsx` (host: character summaries with assignment status)
- [ ] Create `PreferenceForm.tsx` (player: ranked archetype selection)
- [ ] Create `CharacterPacket.tsx` (player: character sheet + brief + prompts)
- [ ] Implement `useCharacterAssignment` hook (auto/manual/preference modes)
- [ ] Implement `usePreferences` hook (preference collection and submission)
- [ ] Implement assignment algorithms (round-robin for auto, Hungarian for preference-based)
- [ ] Test: auto-assignment, manual assignment, preference collection, preference-based optimization, packet display
- **Depends on**: Task 5
- **Estimate**: 6 hours

---

## Phase 4: Integration and Polish

### Task 16: Implement email notification templates
`[P0]` `[Story 3]`
- [ ] Design HTML email templates matching app visual identity
- [ ] Create templates for each notification category (invitation, reminder, artifact ready, cancellation)
- [ ] Include deep link URLs back to web session pages
- [ ] Configure SPF/DKIM/DMARC for sending domain
- [ ] Add RFC 8058 unsubscribe header and one-click unsubscribe support
- [ ] Test: email rendering across clients (Gmail, Apple Mail, Outlook), link functionality, unsubscribe
- **Depends on**: Task 7
- **Estimate**: 4 hours

### Task 17: Implement offline support for contributions
`[P0]` `[Story 2]`
- [ ] Set up MMKV storage for contribution drafts
- [ ] Implement offline queue for RSVP submissions
- [ ] Create sync logic: on reconnect, push queued actions to Supabase
- [ ] Handle conflict resolution (last-write-wins with timestamp)
- [ ] Ensure contribution form works without network (save to local, submit when online)
- [ ] Test: offline draft save, offline RSVP queue, reconnect sync, conflict resolution
- **Depends on**: Task 12
- **Estimate**: 4 hours

### Task 18: Web player pages
`[P0]` `[Story 1, Story 2]`
- [ ] Create web join page at `https://ephemera.app/invite/:token`
- [ ] Implement web RSVP flow (display name + email, no account required)
- [ ] Implement web contribution form (matching app functionality)
- [ ] Generate session-scoped JWT for web player API access
- [ ] Include smart app banner for app install (non-blocking)
- [ ] Serve AASA and assetlinks.json from `.well-known/`
- [ ] Test: web RSVP flow, web contribution form, mobile browser rendering, JWT generation
- **Depends on**: Task 10, Task 11, Task 12
- **Estimate**: 6 hours

### Task 19: End-to-end integration tests
`[P0]` `[All Stories]`
- [ ] Write E2E test: host creates session -> sends invitation -> player RSVPs -> player contributes -> host reviews
- [ ] Write E2E test: web player RSVP and contribution flow
- [ ] Write E2E test: notification delivery (push + email) with dedup and quiet hours
- [ ] Write E2E test: content pack browse -> purchase -> download -> use in session config
- [ ] Write E2E test: Murder Mystery role assignment (auto + preference-based)
- [ ] Write E2E test: deadline reminder automation (3d + 1d + grace period)
- [ ] Verify all RLS policies in integration context
- [ ] Performance test: dashboard load times, deep link resolution latency
- **Depends on**: Tasks 10-18
- **Estimate**: 8 hours

---

## Summary

| Phase | Tasks | Priority | Total Estimate |
|-------|-------|----------|---------------|
| 1. Database Foundation | 1-6 | P0/P1/P2 | 17 hours |
| 2. Backend Services | 7-9 | P0/P1 | 13 hours |
| 3. Client Infrastructure | 10-15 | P0/P1/P2 | 37 hours |
| 4. Integration and Polish | 16-19 | P0 | 22 hours |
| **Total** | **19** | | **89 hours** |

### Critical Path (P0 only)

```
Task 1 → Task 10 → Task 11 → Task 18
Task 2 → Task 9 → Task 12 → Task 17 → Task 18
Task 3 → Task 7 → Task 13 → Task 16
All → Task 19
```

Minimum P0 path: Tasks 1, 2, 3, 6, 7, 9, 10, 11, 12, 13, 16, 17, 18, 19 = 67 hours
