# Quickstart: 006 Artifact Generation Pipeline

Key validation scenarios that prove the artifact pipeline works end-to-end. These are the critical paths to test before considering the feature complete.

---

## Scenario 1: End-to-End Immediate Generation (Critical Path)

**Goal**: Verify the complete pipeline from trigger to delivery for a Confession Album session.

### Prerequisites

- A session in COMPLETE state with fixture data matching `artifacts/fixtures/confession-album.json`
- Cloud Run service deployed and accessible
- Supabase Storage bucket `artifacts` created
- At least one app player with push token and one web player with email

### Steps

1. **Trigger generation**
   ```bash
   curl -X POST https://{project}.supabase.co/functions/v1/generate-artifacts \
     -H "Authorization: Bearer {host_jwt}" \
     -H "Content-Type: application/json" \
     -d '{ "session_id": "sess-ca-001" }'
   ```
   Expected: 202 response with artifact IDs for A01 (The Album), A02 (Contributions Table), and A03 (Proust's Answer, queued as delayed).

2. **Poll for completion**
   ```bash
   curl https://{project}.supabase.co/functions/v1/generate-artifacts/status/sess-ca-001 \
     -H "Authorization: Bearer {host_jwt}"
   ```
   Expected within 30 seconds: A01 and A02 status = "ready", A03 status = "queued" (delayed).

3. **Verify PDF in storage**
   ```bash
   # Check Supabase Storage bucket
   curl https://{project}.supabase.co/storage/v1/object/list/artifacts/sess-ca-001 \
     -H "Authorization: Bearer {service_role_key}"
   ```
   Expected: `the-album.pdf` and `contributions-table.pdf` present, each <5MB.

4. **Download and verify PDF quality**
   - Open the PDF URL in a browser
   - Verify: Playfair Display headings, Lora body text, JetBrains Mono metadata
   - Verify: parchment texture visible, cover page centered, questions/answers formatted
   - Verify: all 8 questions and 26 answers from fixture data present
   - Verify: colophon page with session metadata

5. **Distribute to participants**
   ```bash
   curl -X POST https://{project}.supabase.co/functions/v1/generate-artifacts/distribute/sess-ca-001 \
     -H "Authorization: Bearer {host_jwt}"
   ```
   Expected: push notification sent to app players, email sent to web players.

6. **Verify delivery tracking**
   ```bash
   curl https://{project}.supabase.co/functions/v1/generate-artifacts/deliveries/sess-ca-001 \
     -H "Authorization: Bearer {host_jwt}"
   ```
   Expected: delivery records for each participant with status "sent" or "delivered".

### Success Criteria

- [ ] Generation request returns 202 within 2 seconds
- [ ] Both PDFs generated and uploaded within 30 seconds
- [ ] PDFs render correctly with all design system typography and textures
- [ ] Push notification received by app player within 5 minutes
- [ ] Email received by web player within 5 minutes
- [ ] Delivery status tracked for all recipients

---

## Scenario 2: Murder Mystery Generation

**Goal**: Verify The Dossier and Menu of the Damned for a Murder Mystery session.

### Steps

1. Trigger generation for a session with fixture data matching `artifacts/fixtures/murder-mystery.json`
2. Verify A04 (The Dossier) renders with:
   - Noir theme (dark background, crimson accents)
   - CLASSIFIED stamp on cover
   - Cast of characters with mugshot initials
   - Crime scene summary
   - Evidence log with exhibit labels
   - Accusation results
   - The reveal (culprit name and explanation)
   - Vote tally statistics
3. Verify A05 (Menu of the Damned) renders with:
   - Recipe card format (127x178mm)
   - All 3 recipes from fixture data
   - Double border decoration on cards
   - Ingredients and steps formatted correctly

### Success Criteria

- [ ] Dossier PDF uses murder-mystery theme (dark palette)
- [ ] All 6 characters, 7 clues, 6 accusations, and reveal present
- [ ] Menu renders 3 recipe cards, each on its own page
- [ ] Both PDFs <5MB

---

## Scenario 3: Delayed Delivery (Proust's Answer)

**Goal**: Verify scheduled generation and personalized delivery of Proust's Answer.

### Steps

1. After Scenario 1, verify A03 is in `queued` status with `scheduled_delivery_at` = game night + 7 days
2. Simulate scheduled time arriving (in test: manually trigger the delivery queue processor)
3. Verify per-player generation:
   - For player "Suki Nakamura" (p3): letter pairs her answer to Q1 with Proust's response
   - Uses `prousts-answer.njk` with personal-letter theme
   - Letterhead shows player name and session date
   - Question text, player answer, and Proust's answer all present
4. Verify delivery: push notification for app players, email for web players
5. Verify artifact appears in the player's library

### Success Criteria

- [ ] One Proust's Answer PDF generated per player who answered at least one question
- [ ] Each PDF personalized with correct player name, answer, and Proust pairing
- [ ] Delivery occurs within 1 hour of scheduled time
- [ ] Each player's artifact appears in their library

---

## Scenario 4: Host Writing Prompt (Sealed Envelope)

**Goal**: Verify the host can write content that appears in a delayed artifact.

### Steps

1. Complete a Murder Mystery session
2. Verify A07 (The Sealed Envelope) is queued with delayed delivery
3. After 2 days, verify host receives writing prompt notification
4. Submit host reflection content:
   ```bash
   curl -X PUT https://{project}.supabase.co/functions/v1/generate-artifacts/writing-prompts/{prompt_id} \
     -H "Authorization: Bearer {host_jwt}" \
     -H "Content-Type: application/json" \
     -d '{ "content": "What surprised me most was how quickly the table fractured..." }'
   ```
5. When delivery date arrives, verify the Sealed Envelope PDF includes:
   - Wax seal graphic
   - "For the Host's Eyes Only" heading
   - The host's submitted reflection text
   - Session statistics (accuracy, most suspected, biggest surprise)
   - Era-appropriate sign-off

### Success Criteria

- [ ] Writing prompt notification arrives 2 days post-game
- [ ] Host content saved and editable until 24 hours before delivery
- [ ] Generated Sealed Envelope includes host content verbatim
- [ ] Statistics section accurate

---

## Scenario 5: Artifact Library Browsing

**Goal**: Verify a player can browse their collected artifacts across sessions.

### Steps

1. Ensure the test user has received artifacts from at least 2 different sessions (1 Confession Album, 1 Murder Mystery)
2. Navigate to the library endpoint:
   ```bash
   curl https://{project}.supabase.co/functions/v1/generate-artifacts/library \
     -H "Authorization: Bearer {player_jwt}"
   ```
3. Verify all received artifacts listed with session name, game type, date, and page count
4. Filter by game type:
   ```bash
   curl "https://{project}.supabase.co/functions/v1/generate-artifacts/library?game_type=confession_album" \
     -H "Authorization: Bearer {player_jwt}"
   ```
5. Get download URL for a specific artifact and verify the PDF opens correctly

### Success Criteria

- [ ] Library lists all received artifacts (immediate + delayed)
- [ ] Artifacts sorted by most recent first
- [ ] Filtering by game type works correctly
- [ ] Download URLs valid and PDFs accessible

---

## Scenario 6: Error Recovery

**Goal**: Verify the pipeline handles failures gracefully.

### Steps

1. **Simulate render failure**: Send a request with an invalid template name
   - Expected: 400 error with descriptive message
2. **Simulate storage upload failure**: Disconnect Supabase Storage (or use invalid credentials)
   - Expected: artifact status transitions to "failed" with error message
3. **Retry a failed artifact**:
   ```bash
   curl -X POST https://{project}.supabase.co/functions/v1/generate-artifacts/retry/{artifact_id} \
     -H "Authorization: Bearer {host_jwt}"
   ```
   - Expected: artifact re-queued, retry_count incremented
4. **Exceed max retries**: Fail 3 times
   - Expected: artifact remains in "failed" status, retry returns 400

### Success Criteria

- [ ] Invalid template name returns 400 with valid template list
- [ ] Storage failure sets status to "failed" with error message
- [ ] Retry resets status to "queued" and increments retry_count
- [ ] After 3 failures, further retries are rejected
