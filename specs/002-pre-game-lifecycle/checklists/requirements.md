# Requirements Checklist: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Purpose**: Quality validation checklist for verifying all requirements before marking the spec as complete.

---

## Constitution Gates

Every item must pass. A single failure is a blocker.

| # | Gate | Check | Status |
|---|------|-------|--------|
| G1 | Simplicity | Edge Function count <= 3 (currently: send-notification, process-iap-receipt = 2) | [ ] |
| G2 | Simplicity | No unnecessary abstraction layers; direct Supabase client where possible | [ ] |
| G3 | Offline | Contribution drafts save and recover offline (MMKV/SQLite) | [ ] |
| G4 | Offline | RSVP queues offline and syncs on reconnect | [ ] |
| G5 | Offline | Content library works fully from local cache | [ ] |
| G6 | Privacy | No invitation open-tracking (host cannot see who viewed link without RSVPing) | [ ] |
| G7 | Privacy | Contribution content encrypted at rest in PostgreSQL | [ ] |
| G8 | Privacy | No public profiles, no social features, no discoverability | [ ] |
| G9 | Privacy | Notification preferences are user-controlled per category | [ ] |
| G10 | Analog | Invitation shared via existing messaging apps (no in-app social graph) | [ ] |
| G11 | Analog | Contribution brief is narratively framed, not a generic form | [ ] |
| G12 | Analog | Pre-game builds anticipation for in-person play, not digital engagement | [ ] |

---

## Functional Requirements — Invitations

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F1 | Deep link generation produces 22-char base62 tokens | FR-201 | 1 | [ ] |
| F2 | Tokens are 128-bit cryptographically random | FR-201 | 1 | [ ] |
| F3 | Universal Links (iOS) resolve to app when installed | FR-202 | 1 | [ ] |
| F4 | App Links (Android) resolve to app when installed | FR-202 | 1 | [ ] |
| F5 | Deep link falls back to web join page when app not installed | FR-203 | 1 | [ ] |
| F6 | Invitation URL contains no PII | FR-204 | 1 | [ ] |
| F7 | Host can generate shared link or per-invitee links | FR-205 | 1 | [ ] |
| F8 | Invitation links expire on ARCHIVED/CANCELED state | FR-206 | 1 | [ ] |
| F9 | AASA file served correctly at `/.well-known/apple-app-site-association` | FR-202 | 1 | [ ] |
| F10 | assetlinks.json served correctly at `/.well-known/assetlinks.json` | FR-202 | 1 | [ ] |

---

## Functional Requirements — RSVP

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F11 | Players can RSVP as Accept, Decline, or Maybe | FR-210 | 1 | [ ] |
| F12 | RSVP updates visible to host within 5 seconds | FR-211 | 1 | [ ] |
| F13 | Players can change RSVP before ACTIVE state | FR-212 | 1 | [ ] |
| F14 | Host can send reminders to non-responders only | FR-213 | 1 | [ ] |
| F15 | Host can manually add a guest with new invitation link | FR-214 | 1 | [ ] |
| F16 | RSVP dashboard shows Accepted/Declined/Maybe/Pending counts | FR-211 | 1 | [ ] |
| F17 | Web player can RSVP with display name only (no account) | FR-210 | 1 | [ ] |

---

## Functional Requirements — Contributions

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F18 | Contribution brief displayed with narrative framing | FR-220 | 2 | [ ] |
| F19 | Forms support text fields and optional photo upload | FR-221 | 2 | [ ] |
| F20 | Auto-save every 30 seconds | FR-222 | 2 | [ ] |
| F21 | Players can edit until host locks contributions | FR-223 | 2 | [ ] |
| F22 | Host sees contribution matrix (guest x type x status) | FR-224 | 2 | [ ] |
| F23 | Host can review submissions, flag, and mark excused | FR-225 | 2 | [ ] |
| F24 | Web player contribution flow identical to app | FR-226 | 2 | [ ] |
| F25 | Photos compressed client-side to <2MB before upload | FR-227 | 2 | [ ] |
| F26 | Contribution matrix updates in real-time via Supabase Realtime | FR-224 | 2 | [ ] |
| F27 | One contribution per type per participant per session (unique constraint) | FR-221 | 2 | [ ] |

---

## Functional Requirements — Notifications

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F28 | All 16 notification types (N01-N16) implemented | FR-230 | 3 | [ ] |
| F29 | Push notifications delivered within 30 seconds of trigger | FR-231 | 3 | [ ] |
| F30 | Automated reminders at 3 days and 1 day before deadline | FR-232 | 3 | [ ] |
| F31 | No duplicate notifications within 12-hour window | FR-233 | 3 | [ ] |
| F32 | Quiet hours (10 PM - 8 AM local) respected | FR-234 | 3 | [ ] |
| F33 | Host contribution notifications batched (max 1/hour) | FR-235 | 3 | [ ] |
| F34 | Web players receive all notifications via email | FR-236 | 3 | [ ] |
| F35 | Notification preferences per category (user-configurable) | FR-237 | 3 | [ ] |
| F36 | Emails include SPF/DKIM/DMARC configuration | FR-238 | 3 | [ ] |
| F37 | Emails include unsubscribe link (RFC 8058) | FR-238 | 3 | [ ] |
| F38 | Push token registration on first app launch | FR-231 | 3 | [ ] |
| F39 | Push token refresh on each app launch | FR-231 | 3 | [ ] |
| F40 | DeviceNotRegistered errors deactivate tokens | FR-231 | 3 | [ ] |

---

## Functional Requirements — Content Store

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F41 | Store displays packs organized by game type | FR-240 | 4 | [ ] |
| F42 | Each pack shows name, description, count, price, preview | FR-241 | 4 | [ ] |
| F43 | Purchase uses native platform IAP (Apple/Google) | FR-242 | 4 | [ ] |
| F44 | Server-side receipt validation (never trust client) | FR-242 | 4 | [ ] |
| F45 | Purchased content downloads and merges into local library | FR-243 | 4 | [ ] |
| F46 | Purchases persist across reinstalls (tied to account) | FR-244 | 4 | [ ] |
| F47 | Content packs follow YAML schema (PRD 5.6) | FR-245 | 4 | [ ] |
| F48 | Bundled content supports >=5 unique sessions per game | FR-246 | 4 | [ ] |
| F49 | Content catalog browsable without authentication | FR-240 | 4 | [ ] |
| F50 | Purchase restoration flow works on new device/reinstall | FR-244 | 4 | [ ] |

---

## Functional Requirements — Role Assignment

| # | Requirement | FR | Story | Status |
|---|-------------|-----|-------|--------|
| F51 | Auto-assign, manual, and preference-based assignment modes | FR-250 | 5 | [ ] |
| F52 | Character packets delivered via push notification | FR-251 | 5 | [ ] |
| F53 | Host can reassign characters after initial delivery | FR-252 | 5 | [ ] |
| F54 | Preference-based mode collects archetype rankings (<2 min each) | FR-253 | 5 | [ ] |
| F55 | Host reviews all assignments before delivery | FR-250 | 5 | [ ] |

---

## Non-Functional Requirements

| # | Requirement | NFR | Status |
|---|-------------|-----|--------|
| N1 | Deep link resolution <1 second on 4G | NFR-201 | [ ] |
| N2 | Web join page loads <3 seconds on 3G | NFR-202 | [ ] |
| N3 | Contribution form loads <2 seconds | NFR-203 | [ ] |
| N4 | Host dashboard loads <1 second | NFR-204 | [ ] |
| N5 | Content store loads <2 seconds | NFR-205 | [ ] |
| N6 | Invitation tokens are 128-bit cryptographically random | NFR-206 | [ ] |
| N7 | Contribution content encrypted at rest | NFR-207 | [ ] |
| N8 | No recipient open-tracking on invitation links | NFR-208 | [ ] |
| N9 | RSVP and contribution forms work offline with sync | NFR-209 | [ ] |
| N10 | Email deliverability >95% | NFR-210 | [ ] |
| N11 | Push registration succeeds on first launch | NFR-211 | [ ] |
| N12 | Notification copy follows DESIGN.md tone guidelines | NFR-212 | [ ] |

---

## Data Model Validation

| # | Check | Status |
|---|-------|--------|
| D1 | `invitation_tokens` table created with all columns and constraints | [ ] |
| D2 | `contributions` table created with JSONB content and all constraints | [ ] |
| D3 | `notification_queue` table created with scheduling and batching support | [ ] |
| D4 | `push_tokens` table created with user/token/platform | [ ] |
| D5 | `notification_preferences` table created | [ ] |
| D6 | `content_packs` table created with YAML-schema-aligned columns | [ ] |
| D7 | `user_content_packs` junction table created | [ ] |
| D8 | `character_preferences` table created | [ ] |
| D9 | `session_participations` extended with character_data, timezone, deadline columns | [ ] |
| D10 | `sessions` extended with contribution_deadline column | [ ] |
| D11 | All RLS policies enforced and tested | [ ] |
| D12 | All indexes created for performance-critical queries | [ ] |
| D13 | `enqueue_notification` function handles dedup, batch, and preferences | [ ] |
| D14 | `process_pending_notifications` function scheduled via pg_cron | [ ] |
| D15 | Storage buckets created (contribution-photos, content-packs) with RLS | [ ] |

---

## API Contract Validation

| # | Check | Status |
|---|-------|--------|
| A1 | `POST /invitation_tokens` creates token (host only) | [ ] |
| A2 | `GET /invitation_tokens/resolve` resolves token without auth | [ ] |
| A3 | `POST /rpc/submit_rsvp` records RSVP for app and web players | [ ] |
| A4 | `POST /rpc/get_rsvp_dashboard` returns counts and participant list | [ ] |
| A5 | `GET /contributions` returns contributions (RLS-filtered) | [ ] |
| A6 | `POST /contributions` creates draft contribution | [ ] |
| A7 | `PATCH /contributions/{id}` updates content and status | [ ] |
| A8 | `POST /rpc/get_contribution_dashboard` returns matrix | [ ] |
| A9 | `POST /push_tokens` registers push token | [ ] |
| A10 | `PUT /notification_preferences` updates preferences | [ ] |
| A11 | `POST /rpc/send_manual_reminder` sends host reminder | [ ] |
| A12 | `GET /content_packs` lists published packs (no auth required) | [ ] |
| A13 | `POST /functions/v1/process-iap-receipt` validates receipt | [ ] |
| A14 | `POST /rpc/assign_characters` assigns characters | [ ] |
| A15 | `POST /character_preferences` submits preferences | [ ] |
| A16 | `POST /rpc/deliver_character_packets` triggers delivery | [ ] |

---

## Testing Validation

| # | Check | Status |
|---|-------|--------|
| T1 | Unit tests: token generation, assignment algorithms, quiet hours logic, dedup | [ ] |
| T2 | Component tests: invitation screen, RSVP dashboard, contribution form, store UI | [ ] |
| T3 | Integration tests: deep link resolution, contribution CRUD, notification dispatch, RLS | [ ] |
| T4 | E2E test: complete invitation-to-contribution flow (app player) | [ ] |
| T5 | E2E test: complete web player flow (RSVP + contribution) | [ ] |
| T6 | E2E test: notification delivery with dedup and quiet hours | [ ] |
| T7 | E2E test: content pack purchase and download | [ ] |
| T8 | E2E test: Murder Mystery role assignment | [ ] |
| T9 | Performance test: dashboard load times (p95 <1 second) | [ ] |
| T10 | Performance test: deep link resolution (<1 second on 4G) | [ ] |

---

## Cross-Spec Dependencies

| # | Check | Status |
|---|-------|--------|
| X1 | Spec 001 tables (users, sessions, session_participations) exist before migration | [ ] |
| X2 | Spec 003 (Confession Album) can read contributions and content from this spec's tables | [ ] |
| X3 | Spec 004 (Murder Mystery) can read character_data and contributions from this spec's tables | [ ] |
| X4 | Notification infrastructure reusable by specs 003-006 (game night + post-game notifications) | [ ] |
| X5 | Content library API reusable for game-specific content queries in specs 003-004 | [ ] |

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Spec Author | | | [ ] |
| Technical Review | | | [ ] |
| Constitution Review | | | [ ] |
| Integration Review (cross-spec) | | | [ ] |
