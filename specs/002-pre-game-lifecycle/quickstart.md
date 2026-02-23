# Quickstart: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Purpose**: Key validation scenarios to verify the pre-game lifecycle works end-to-end.

---

## Scenario 1: Complete Invitation-to-RSVP Flow

**Goal**: Verify that a host can generate an invitation link and a player can RSVP through it.

**Steps**:

1. **Host creates invitation token**
   ```bash
   # As host (authenticated)
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID", "is_shared": true}' \
     "$SUPABASE_URL/rest/v1/invitation_tokens"
   ```
   Expected: 201 with token value (e.g., `"token": "7kX9mPqR2sT4vW6yA8bC"`)

2. **Construct deep link**
   ```
   https://ephemera.app/invite/7kX9mPqR2sT4vW6yA8bC
   ```

3. **Resolve token (as unauthenticated user)**
   ```bash
   curl "$SUPABASE_URL/rest/v1/invitation_tokens/resolve?token=7kX9mPqR2sT4vW6yA8bC" # allow-secret
   ```
   Expected: 200 with session details (game_type, session_name, date_time, host_name, atmosphere_text)

4. **Submit RSVP**
   ```bash
   # As app player (authenticated)
   curl -X POST \
     -H "Authorization: Bearer $PLAYER_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID", "token": "7kX9mPqR2sT4vW6yA8bC", "status": "accepted"}' \
     "$SUPABASE_URL/rest/v1/rpc/submit_rsvp"
   ```
   Expected: 200 with session_participation record

5. **Verify host dashboard updates**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID"}' \
     "$SUPABASE_URL/rest/v1/rpc/get_rsvp_dashboard"
   ```
   Expected: 200 with counts showing 1 accepted

**Validation criteria**:
- Token generation returns a 22-character alphanumeric string
- Token resolution works without authentication
- RSVP creates a session_participation record
- Host dashboard reflects the RSVP within 5 seconds
- Host receives a push notification (check notification_queue table)

---

## Scenario 2: Contribution Draft and Submit

**Goal**: Verify that a player can save a draft, auto-save works, and submission is tracked on the host dashboard.

**Steps**:

1. **Create contribution (draft)**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $PLAYER_JWT" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "SESSION_UUID",
       "participant_id": "PARTICIPANT_UUID",
       "type": "contribution_description",
       "content": {"text": "A thermos of my grandmother'\''s Turkish coffee"}
     }' \
     "$SUPABASE_URL/rest/v1/contributions"
   ```
   Expected: 201 with status "draft"

2. **Update draft (simulating auto-save)**
   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer $PLAYER_JWT" \
     -H "Content-Type: application/json" \
     -d '{"content": {"text": "A thermos of my grandmother'\''s Turkish coffee, brewed in her original ibrik"}}' \
     "$SUPABASE_URL/rest/v1/contributions/$CONTRIBUTION_ID"
   ```
   Expected: 200, updated content, status still "draft"

3. **Submit contribution**
   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer $PLAYER_JWT" \
     -H "Content-Type: application/json" \
     -d '{"status": "submitted"}' \
     "$SUPABASE_URL/rest/v1/contributions/$CONTRIBUTION_ID"
   ```
   Expected: 200, status "submitted", submitted_at populated

4. **Check host contribution dashboard**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID"}' \
     "$SUPABASE_URL/rest/v1/rpc/get_contribution_dashboard"
   ```
   Expected: 200 with matrix showing participant's contribution_description as "submitted"

**Validation criteria**:
- Draft saves preserve content between updates
- Status transitions from draft to submitted correctly
- submitted_at timestamp is set on submission
- Host dashboard shows the submitted contribution
- Notification inserted into notification_queue (N07, batched)

---

## Scenario 3: Web Player RSVP and Contribute

**Goal**: Verify the complete web player flow without an app account.

**Steps**:

1. **Resolve invitation token (no auth)**
   ```bash
   curl "$SUPABASE_URL/rest/v1/invitation_tokens/resolve?token=7kX9mPqR2sT4vW6yA8bC" # allow-secret
   ```
   Expected: 200 with session details

2. **Submit web player RSVP (with display name and email)**
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "SESSION_UUID",
       "token": "7kX9mPqR2sT4vW6yA8bC",
       "status": "accepted",
       "display_name": "Alex",
       "email": "alex@example.com"
     }' \
     "$SUPABASE_URL/rest/v1/rpc/submit_rsvp"
   ```
   Expected: 200 with session_participation (role: "web_player", user_id: null)

3. **Submit web player contribution (using session-scoped JWT)**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $WEB_PLAYER_JWT" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "SESSION_UUID",
       "participant_id": "WEB_PARTICIPANT_UUID",
       "type": "contribution_description",
       "content": {"text": "My favorite vinyl record from 1972"}
     }' \
     "$SUPABASE_URL/rest/v1/contributions"
   ```
   Expected: 201

4. **Verify web player appears on host dashboards**
   - RSVP dashboard: web player listed with "web_player" role
   - Contribution dashboard: web player's submission visible

**Validation criteria**:
- Web player RSVP works without standard Supabase auth
- Web player receives a session-scoped JWT for subsequent requests
- Email address captured for email notifications
- Web player contribution appears identically to app player contributions

---

## Scenario 4: Notification Deduplication and Quiet Hours

**Goal**: Verify that the notification system respects deduplication rules and quiet hours.

**Steps**:

1. **Insert a reminder notification**
   ```sql
   SELECT enqueue_notification(
     'SESSION_UUID',
     'PLAYER_UUID',
     NULL,
     'N05',
     'Reminder',
     'Your contribution for Test Session is due in 3 days.',
     '{}',
     'push',
     NOW()
   );
   ```
   Expected: Returns notification ID, status "pending"

2. **Attempt duplicate within 12 hours**
   ```sql
   SELECT enqueue_notification(
     'SESSION_UUID',
     'PLAYER_UUID',
     NULL,
     'N05',
     'Reminder',
     'Your contribution for Test Session is due in 3 days.',
     '{}',
     'push',
     NOW()
   );
   ```
   Expected: Returns notification ID, but status "suppressed"

3. **Schedule notification during quiet hours**
   ```sql
   -- Player timezone is America/New_York, scheduled for 11 PM ET
   SELECT enqueue_notification(
     'SESSION_UUID',
     'PLAYER_UUID',
     NULL,
     'N06',
     'Deadline tomorrow',
     'Tomorrow is the deadline for Test Session.',
     '{}',
     'push',
     '2026-03-15 03:00:00+00'  -- 11 PM ET = 3 AM UTC
   );
   ```
   Expected: Notification queued with scheduled_for adjusted to 8 AM ET (1 PM UTC)

**Validation criteria**:
- Second identical notification within 12 hours is suppressed
- Quiet hours notification is rescheduled to 8 AM local time
- Suppressed notifications are logged (status "suppressed") for audit

---

## Scenario 5: Content Pack Purchase Flow

**Goal**: Verify IAP receipt validation and content delivery.

**Steps**:

1. **Browse store catalog**
   ```bash
   curl "$SUPABASE_URL/rest/v1/content_packs?game_type=eq.confession-album&select=id,name,price_tier,item_count"
   ```
   Expected: 200 with list of published packs

2. **View pack detail with preview**
   ```bash
   curl "$SUPABASE_URL/rest/v1/content_packs?id=eq.confession-album-mortality-v1"
   ```
   Expected: 200 with full pack details including preview_content

3. **Submit IAP receipt for validation**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{
       "pack_id": "confession-album-mortality-v1",
       "platform": "ios",
       "receipt_data": {"signedTransaction": "APPLE_JWS_TOKEN"}
     }' \
     "$SUPABASE_URL/functions/v1/process-iap-receipt"
   ```
   Expected: 200 with `{"valid": true, "download_url": "https://..."}`

4. **Verify ownership recorded**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     "$SUPABASE_URL/rest/v1/rpc/get_owned_packs"
   ```
   Expected: 200 with confession-album-mortality-v1 in the list

**Validation criteria**:
- Store catalog is browsable without authentication
- IAP receipt is validated server-side (not trusted from client)
- Ownership recorded in user_content_packs table
- Download URL is a signed, time-limited Supabase Storage URL
- Invalid receipt returns 400

---

## Scenario 6: Role Assignment (Murder Mystery)

**Goal**: Verify character assignment and packet delivery.

**Steps**:

1. **Auto-assign characters**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID", "mode": "auto"}' \
     "$SUPABASE_URL/rest/v1/rpc/assign_characters"
   ```
   Expected: 200 with array of participant-to-character mappings

2. **Deliver character packets**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $HOST_JWT" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "SESSION_UUID"}' \
     "$SUPABASE_URL/rest/v1/rpc/deliver_character_packets"
   ```
   Expected: 200 with delivered_count matching number of assigned participants

3. **Verify character data on participation record**
   ```bash
   curl -H "Authorization: Bearer $PLAYER_JWT" \
     "$SUPABASE_URL/rest/v1/session_participations?session_id=eq.SESSION_UUID&user_id=eq.PLAYER_UUID&select=character_data,character_assigned_at"
   ```
   Expected: 200 with populated character_data and character_assigned_at

4. **Verify notification sent**
   ```sql
   SELECT * FROM notification_queue
   WHERE session_id = 'SESSION_UUID' AND category = 'N04';
   ```
   Expected: One N04 notification per assigned participant

**Validation criteria**:
- Auto-assign produces a valid 1:1 mapping of characters to guests
- Character data is stored on the session_participation record
- Push notification (N04) queued for each assigned guest
- Player can read their own character data via RLS
