# Implementation Plan: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Status**: Draft
**Stack**: TypeScript 5.x, React Native + Expo, Supabase, PostgreSQL
**Depends on**: 001-auth-and-sessions (User, Session, SessionParticipation tables and auth flows)

> **Split Notice (2026-02-23)**: Content store and IAP functionality have been extracted to spec `002b-monetization` (deferred to V1.1). This spec now covers: invitations, RSVPs, contributions, notifications, role assignment, and bundled content library only. The `process-iap-receipt` Edge Function and content store UI are in 002b.

---

## Constitution Gate Check

Every implementation decision must pass all four gates. Failures are blockers.

| Gate | Principle | This Spec's Compliance |
|------|-----------|----------------------|
| **Simplicity** | <=5 Edge Functions | This spec uses 1 Edge Function: `send-notification`. IAP receipt processing (`process-iap-receipt`) deferred to spec 002b (V1.1). Deadline scheduling handled by pg_cron, not an Edge Function. |
| **Offline** | Core flows work without connectivity | Contribution drafts saved locally (Expo SQLite/MMKV). RSVP queued offline, synced on reconnect. Content library cached locally. |
| **Privacy** | No tracking, no social, minimal data | No invitation open-tracking. Contribution content encrypted at rest. No public profiles. Notification preferences per-user. |
| **Analog** | Screen supports, doesn't replace | Invitation is a link shared via existing messaging. Contribution brief is narratively framed. Pre-game builds anticipation for in-person play. |

---

## Project Structure

```
src/
├── features/
│   ├── invitations/
│   │   ├── components/
│   │   │   ├── InvitationComposer.tsx       # Host: generate and share link
│   │   │   ├── SessionInvitation.tsx         # Player: view invitation + RSVP
│   │   │   └── RsvpDashboard.tsx            # Host: RSVP tracking matrix
│   │   ├── hooks/
│   │   │   ├── useDeepLink.ts               # Deep link resolution
│   │   │   ├── useInvitationToken.ts        # Token generation/validation
│   │   │   └── useRsvpStatus.ts             # Real-time RSVP subscription
│   │   ├── services/
│   │   │   ├── invitation.service.ts        # Invitation CRUD
│   │   │   └── deeplink.service.ts          # Universal Links / App Links config
│   │   └── types.ts
│   │
│   ├── contributions/
│   │   ├── components/
│   │   │   ├── ContributionBrief.tsx         # Player: view brief
│   │   │   ├── ContributionForm.tsx          # Player: structured form
│   │   │   ├── ContributionDashboard.tsx     # Host: matrix view
│   │   │   └── PhotoUpload.tsx              # Image picker + compression
│   │   ├── hooks/
│   │   │   ├── useContribution.ts           # CRUD + draft management
│   │   │   ├── useContributionMatrix.ts     # Real-time matrix subscription
│   │   │   └── useAutoSave.ts              # 30-second draft auto-save
│   │   ├── services/
│   │   │   └── contribution.service.ts      # Contribution CRUD + photo upload
│   │   └── types.ts
│   │
│   ├── notifications/
│   │   ├── components/
│   │   │   └── NotificationPreferences.tsx  # User settings
│   │   ├── hooks/
│   │   │   ├── usePushRegistration.ts       # Expo push token registration
│   │   │   └── useNotificationHandler.ts    # Foreground/background handlers
│   │   ├── services/
│   │   │   ├── notification.service.ts      # Client-side notification logic
│   │   │   └── push-token.service.ts        # Token management
│   │   └── types.ts
│   │
│   ├── content-store/
│   │   ├── components/
│   │   │   ├── StoreHome.tsx                # Browse packs by game
│   │   │   ├── PackDetail.tsx               # Pack description + preview + buy
│   │   │   └── PurchaseButton.tsx           # IAP trigger
│   │   ├── hooks/
│   │   │   ├── useContentPacks.ts           # Pack listing + ownership
│   │   │   ├── useIAP.ts                   # In-app purchase flow
│   │   │   └── useContentLibrary.ts         # Local content management
│   │   ├── services/
│   │   │   ├── store.service.ts             # Pack catalog fetch
│   │   │   └── iap.service.ts              # IAP receipt validation
│   │   └── types.ts
│   │
│   └── role-assignment/
│       ├── components/
│       │   ├── CharacterAssignment.tsx       # Host: assign characters to guests
│       │   ├── CharacterRoster.tsx           # Host: view character summaries
│       │   ├── PreferenceForm.tsx            # Player: archetype preferences
│       │   └── CharacterPacket.tsx           # Player: character sheet view
│       ├── hooks/
│       │   ├── useCharacterAssignment.ts    # Assignment logic
│       │   └── usePreferences.ts            # Preference collection
│       ├── services/
│       │   └── role-assignment.service.ts   # Assignment algorithms
│       └── types.ts
│
├── shared/
│   ├── services/
│   │   └── supabase.ts                      # Supabase client singleton
│   ├── hooks/
│   │   ├── useRealtimeSubscription.ts       # Generic Supabase Realtime hook
│   │   └── useOfflineQueue.ts               # Offline action queue
│   └── utils/
│       ├── crypto.ts                        # Token generation
│       └── timezone.ts                      # Local timezone utilities
│
supabase/
├── migrations/
│   ├── 002_invitation_tokens.sql
│   ├── 003_contributions.sql
│   ├── 004_notification_queue.sql
│   ├── 005_content_packs.sql
│   └── 006_role_assignments.sql
├── functions/
│   ├── send-notification/
│   │   └── index.ts                         # Edge Function: push + email dispatch
│   └── process-iap-receipt/
│       └── index.ts                         # Edge Function: IAP receipt validation
└── seed/
    └── bundled-content.sql                  # Base content library seed data
```

---

## Technical Architecture

### 1. Deep Linking

**Platform**: Expo Linking + expo-router deep link handling

**Universal Links (iOS)**:
- `apple-app-site-association` file hosted at `https://ephemera.app/.well-known/apple-app-site-association`
- Path pattern: `/invite/:token`
- Associated domain registered in Expo app config (`expo.ios.associatedDomains`)

**App Links (Android)**:
- `assetlinks.json` hosted at `https://ephemera.app/.well-known/assetlinks.json`
- Intent filter for `https://ephemera.app/invite/*`
- SHA-256 fingerprint of signing key registered

**Fallback**:
- If app not installed, the URL resolves to a web page hosted on the same domain
- Web page renders session invitation with RSVP functionality
- Web page includes smart banner for app install (non-blocking)

**Token structure**:
```
https://ephemera.app/invite/{session_token}
```
- `session_token`: 22-character base62-encoded 128-bit random value
- Token maps to session_id in the `invitation_tokens` table
- Tokens are single-session-scoped; optionally single-invitee-scoped

### 2. Push Notifications

**Stack**: Expo Notifications (client) + Firebase Cloud Messaging (transport) + Supabase Edge Function (dispatch)

**Registration flow**:
1. App launch triggers `Notifications.getExpoPushTokenAsync()`
2. Token stored in `push_tokens` table linked to user_id
3. Token refreshed on each app launch

**Dispatch flow**:
1. Trigger event occurs (RSVP, contribution, deadline)
2. Application logic inserts row into `notification_queue` table
3. pg_notify triggers Edge Function `send-notification`
4. Edge Function reads queue, resolves recipients, applies quiet hours, deduplicates
5. Sends via Expo Push API (app players) or email API (web players)
6. Updates delivery status in `notification_queue`

**Scheduled notifications** (reminders, delayed artifacts):
- pg_cron job runs every 15 minutes
- Queries `notification_queue` for pending scheduled notifications where `scheduled_for <= NOW()`
- Moves them to "ready" status, triggering the dispatch flow

**Quiet hours**:
- Player timezone stored in their profile (detected on registration, user-configurable)
- Dispatch function checks: if `scheduled_for` falls in 22:00-08:00 local, reschedule to 08:00

**Batching** (host contribution notifications):
- `notification_queue` has a `batch_key` column
- Dispatch function groups by batch_key, only sends if last batch for same key was >1 hour ago
- Batch notification aggregates: "[N] new contributions received"

### 3. Email Notifications

**Provider**: Supabase Edge Function calls a transactional email API (Resend or Postmark)

**Templates**: Pre-built HTML email templates matching the app's visual identity, stored as Edge Function assets.

**Configuration**:
- SPF record for sending domain
- DKIM signing via email provider
- DMARC policy set to quarantine
- Unsubscribe header (RFC 8058) in every email
- List-Unsubscribe-Post support for one-click unsubscribe

### 4. In-App Purchases

**Library**: `react-native-iap` (or `expo-in-app-purchases`)

**Flow**:
1. Client requests content pack catalog from Supabase (public table, no auth required for listing)
2. Client displays packs with prices from the platform store (fetched via IAP API at runtime)
3. User initiates purchase through platform IAP dialog
4. Client receives purchase receipt
5. Client sends receipt to Edge Function `process-iap-receipt`
6. Edge Function validates receipt with Apple/Google servers
7. On valid: records purchase in `user_content_packs` junction table
8. Client downloads pack content from Supabase Storage
9. Content merged into local SQLite/MMKV content library

**Receipt validation**:
- Apple: App Store Server API v2 (JWT-based)
- Google: Google Play Developer API (server-to-server)
- Edge Function stores validated receipts for audit

**Restoration**:
- On app launch, client queries `user_content_packs` for owned packs
- Any owned packs not present locally are re-downloaded
- Platform-level restore purchases triggers re-validation flow

### 5. Contribution Pipeline

**Storage**:
- Text contributions stored as JSONB in the `contributions` table
- Photos uploaded to Supabase Storage bucket `contribution-photos`
- Photos compressed client-side to <2MB using `expo-image-manipulator`
- Storage bucket has RLS: only the contributor and the session host can access

**Draft management**:
- Drafts stored locally in Expo SQLite (offline-first)
- Auto-save every 30 seconds writes to local store
- On submit, local draft synced to Supabase
- Conflict resolution: last-write-wins with timestamp comparison

**Real-time updates**:
- Host contribution dashboard subscribes to Supabase Realtime on the `contributions` table
- Filter: `session_id = current_session`
- Dashboard updates instantly when a contribution is inserted or updated

### 6. Role Assignment (Murder Mystery)

**Auto-assignment algorithm**:
- Simple round-robin for V1: characters assigned in roster order to guest list order
- No personality matching in V1 (preference-based is the upgrade path)

**Preference-based algorithm**:
- Guests receive archetype descriptions (e.g., "The Artist," "The Merchant," "The Socialite")
- Each guest ranks top 3 preferences
- Hungarian algorithm (or greedy stable-matching) optimizes assignments
- Host reviews and can override any assignment

**Character packet delivery**:
- On assignment confirmation, system creates per-player contribution briefs
- Push notification triggers packet availability
- Character data stored in `session_participation.character_data` JSONB column

### 7. Content Library

**Bundled content**:
- Shipped as JSON files in the app binary (`assets/content/`)
- Loaded into local SQLite on first launch
- Version-tagged; app updates can include new bundled content

**Purchased content**:
- Downloaded as JSON from Supabase Storage on purchase
- Merged into local SQLite content library
- Tagged with pack_id for filtering and display

**Content schema validation**:
- All content packs validated against the YAML schema (PRD 5.6) at authoring time
- Runtime validation on download ensures integrity
- Schema version compatibility checked before merge

---

## Data Flow Diagrams

### Invitation Flow

```
Host                    App/Server                 Player
 │                         │                         │
 ├─ "Send Invitations" ──▶│                         │
 │                         ├─ Generate token         │
 │                         ├─ Store in DB            │
 │  ◀── Deep link URL ────┤                         │
 │                         │                         │
 ├─ Share via messaging ──────────────────────────▶ │
 │                         │                         │
 │                         │  ◀── Tap deep link ─────┤
 │                         │                         │
 │                         ├─ Resolve token          │
 │                         ├─ Fetch session details   │
 │                         │                         │
 │                         │  ──▶ Invitation screen ─┤
 │                         │                         │
 │                         │  ◀── RSVP (Accept) ─────┤
 │                         │                         │
 │                         ├─ Update participation    │
 │                         ├─ Notify host (push)     │
 │                         │                         │
 │  ◀── Dashboard update ─┤                         │
 │                         │                         │
```

### Notification Dispatch Flow

```
Trigger Event ──▶ Insert notification_queue row
                        │
                  pg_notify('new_notification')
                        │
                  Edge Function: send-notification
                        │
                  ┌─────┴──────┐
                  │ Check:      │
                  │ - Quiet hrs │
                  │ - Dedup     │
                  │ - Batch     │
                  │ - Prefs     │
                  └─────┬──────┘
                        │
                  ┌─────┴──────┐
            ┌─────┤             ├─────┐
            │     │             │     │
       Push API   │        Email API  │
     (Expo Push)  │      (Resend)     │
            │     │             │     │
            ▼     │             ▼     │
       App Player │        Web Player │
                  │                   │
            Update delivery_status    │
                  │                   │
```

---

## Implementation Phases

**Total estimated effort**: 19 tasks, ~22–28 working days (solo developer)

> **Note (2026-02-23)**: This spec is recommended for splitting into 002a (core: invitations, contributions, notifications, role assignment — ~14 tasks, ~16-20 days) and 002b (monetization: content store, IAP — ~5 tasks, deferred to V1.1). See evaluation report R6.

### Phase 1: Database Foundation (Tasks 1-6) — ~6 days
- Migrations: invitation_tokens, contributions, notification_queue, content_packs, role_assignments
- Seed bundled content data

### Phase 2: Server Functions (Tasks 7-9) — ~5 days
- send-notification Edge Function
- process-iap-receipt Edge Function (V1.1 — defer)
- Supabase Storage bucket setup

### Phase 3: Client UI (Tasks 10-15) — ~8 days
- Deep link configuration and resolution
- Invitation and RSVP UI
- Contribution form and dashboard
- Push notification client
- Content store UI (V1.1 — defer)
- Role assignment UI

### Phase 4: Integration (Tasks 16-19) — ~5 days
- Email notification templates
- Offline contribution support
- Web player pages
- E2E integration tests

---

## Migration Strategy

This spec adds tables that reference `users` and `sessions` from spec 001. Migrations are numbered to run after 001's migrations.

**Migration order**:
1. `002_invitation_tokens.sql` -- invitation tokens table + indexes
2. `003_contributions.sql` -- contributions table + RLS + indexes
3. `004_notification_queue.sql` -- notification queue + push tokens + pg_cron job
4. `005_content_packs.sql` -- content packs + user ownership + bundled seed data
5. `006_role_assignments.sql` -- character_data column on session_participation + preference tables

All migrations are idempotent (use `IF NOT EXISTS`). Rollback scripts provided as `down_` counterparts.

---

## Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Vitest | Service functions, token generation, assignment algorithms, quiet hours logic |
| Component | React Native Testing Library | Form rendering, RSVP flow, dashboard matrix, store UI |
| Integration | Vitest + Supabase local | Deep link resolution, contribution CRUD, notification dispatch, RLS policies |
| E2E | Detox or Maestro | Full invitation flow, contribution submission, IAP mock flow |

**Key test scenarios**:
- Deep link resolves correctly on iOS and Android
- Deep link falls back to web when app not installed
- RSVP updates propagate to host dashboard in real-time
- Contribution draft auto-saves and recovers after crash
- Notification deduplication prevents double-sends
- Quiet hours queuing works across timezone boundaries
- IAP receipt validation rejects tampered receipts
- Content pack download and merge preserves existing library
- Role assignment handles edge cases (fewer guests than characters, late RSVP)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Deep link misconfiguration per platform | Medium | High | Automated CI check of AASA/assetlinks files; Expo deep link testing on both platforms |
| Push notification delivery failures | Medium | Medium | Fallback to email for critical notifications; delivery monitoring dashboard |
| IAP receipt fraud | Low | High | Server-side validation only; never trust client-reported purchases |
| Content pack schema drift | Medium | Medium | Schema version in pack metadata; runtime validation before merge |
| Notification spam from buggy batching | Low | High | Rate limiting at Edge Function level; dedup by (recipient, type, session) composite key |
| Timezone detection errors affecting quiet hours | Medium | Low | Fallback to UTC if timezone unavailable; user-configurable override |
