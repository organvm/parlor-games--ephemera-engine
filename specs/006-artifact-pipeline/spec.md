# 006 — Artifact Generation Pipeline

Feature specification for server-side artifact generation, storage, delivery (immediate and delayed), host writing prompts, in-app preview, distribution tracking, and the personal artifact library.

**Spec ID**: 006-artifact-pipeline
**Priority**: P0 (Launch Requirement)
**Status**: Draft
**Depends On**: 001-auth-and-sessions (session state machine, user identity), 002-pre-game-lifecycle (contribution data), 005-game-night-engine (game outcomes, COMPLETE state transition)
**Depended On By**: None (terminal spec in the dependency graph)

**PRD Sections**: 2.7 (Artifact Generation Engine), 5.5 (Artifact Catalog A01-A15)

**Existing Code**: `artifacts/` directory contains a working Nunjucks + Puppeteer rendering pipeline (`render.ts`, `cli.ts`, 6 templates, design system). This spec wraps that code into a server-callable service; it does not rewrite the rendering logic.

---

## 1. User Stories

### US-001: Host Triggers Artifact Generation (Priority: P1)

As a host whose game night has just ended, I want to trigger artifact generation and receive beautiful PDF documents within seconds, so that the evening's memories are preserved before the feeling fades.

**Why this priority**: This is the core pipeline. Without generation, no artifacts exist. Every other story depends on this one.

**Independent Test**: Can be fully tested by triggering generation with fixture data and verifying a PDF is produced, stored, and downloadable within 30 seconds.

**Acceptance Scenarios**:

**Scenario 1a: Trigger generation for immediate artifacts**
```
Given I am a host with a session in COMPLETE state
When I tap "Generate Artifacts" and confirm
Then the server assembles session data (players, contributions, game outcomes)
And renders artifact PDFs using the existing template pipeline (Nunjucks + Puppeteer)
And uploads the PDFs to storage with CDN-backed URLs
And I receive a notification within 30 seconds: "Artifacts ready for review"
And the artifact status transitions: queued -> generating -> ready
```

**Scenario 1b: Generation failure and retry**
```
Given I have triggered artifact generation
When the rendering pipeline encounters an error (Puppeteer crash, timeout, etc.)
Then the artifact status transitions to "failed"
And I see an error message: "Generation failed. Tap to retry."
And I can retry generation up to 3 times
And if all retries fail, a support ticket is suggested
```

**Scenario 1c: Automatic companion artifact generation**
```
Given I have triggered generation of The Album (A01) for a Confession Album session
When The Album is generated successfully
Then the Contributions Table (A02) is automatically generated in the same batch
And both artifacts appear together in the artifact preview
```

**Scenario 1d: Generation for Murder Mystery session**
```
Given I am a host with a completed Murder Mystery session
When I tap "Generate Artifacts"
Then The Dossier (A04) and Menu of the Damned (A05) are generated
And both use the murder-mystery theme (noir palette, texture-noir CSS)
And the Dossier includes: cast of characters, crime scene, evidence log, accusations, and reveal
And the Menu includes all contributed recipes rendered as individual recipe cards
```

---

### US-002: Artifact Preview and Distribution (Priority: P1)

As a host who has generated artifacts, I want to preview them in-app and distribute them to all participants, so that everyone receives a keepsake from the evening.

**Why this priority**: Generation without delivery is useless. This completes the core value loop.

**Independent Test**: Can be tested by viewing a generated PDF in-app, then triggering distribution and verifying that app players receive a push notification and web players receive an email.

**Acceptance Scenarios**:

**Scenario 2a: In-app PDF preview**
```
Given artifacts have been generated and are in "ready" status
When I tap on an artifact in the post-game screen
Then the PDF is displayed in an in-app viewer (react-native-pdf)
And I can scroll through all pages
And I can pinch-to-zoom for detail
And the viewer loads within 3 seconds
```

**Scenario 2b: Distribute to app players**
```
Given I have reviewed the artifact previews
When I tap "Send to Players"
Then each app player receives a push notification: "Your [Artifact Name] from [Session Name] is ready"
And tapping the notification opens the artifact in the in-app viewer
And the artifact is saved to their personal artifact library
And each delivery is tracked (delivered_at timestamp per recipient)
```

**Scenario 2c: Distribute to web players**
```
Given the session includes web players with collected email addresses
When I tap "Send to Players"
Then each web player receives an email with a time-limited download link
And the email uses the session's aesthetic (game-appropriate colors in the email template)
And clicking the link downloads the PDF without requiring login
And the download link expires after 30 days
```

**Scenario 2d: Distribution tracking**
```
Given I have distributed artifacts
When I view the distribution status screen
Then I see a per-player delivery matrix:
  - Player name
  - Delivery channel (push / email)
  - Delivery status (sent / delivered / opened / failed)
  - Timestamp
And I can resend to any player whose delivery failed
```

---

### US-003: Delayed Artifact Delivery (Priority: P2)

As a player, I want to receive a personalized artifact days after game night, so that the evening re-surfaces in my memory when I least expect it.

**Why this priority**: Delayed delivery is a designed feature that deepens the emotional impact, but the product is viable with immediate artifacts alone.

**Independent Test**: Can be tested by scheduling a delayed artifact, advancing time in a test environment, and verifying it generates and delivers on schedule.

**Acceptance Scenarios**:

**Scenario 3a: Schedule delayed artifacts on session completion**
```
Given a session has moved to COMPLETE state
And the game type has delayed artifacts defined (Proust's Answer for CA, Sealed Envelope for MM)
When immediate artifacts are generated
Then delayed artifacts are queued with their scheduled delivery dates
And the default delay is 7 days post-game-night (configurable 3-14 days during session setup)
And the host sees the delayed artifact schedule on the post-game dashboard
```

**Scenario 3b: Auto-generated delayed artifact (Proust's Answer)**
```
Given it is the scheduled delivery date for Proust's Answer (A03)
When the scheduler fires at 10 AM in each player's local time zone
Then for each player who answered at least one question:
  - One Proust's Answer letter is generated per question answered
  - The letter pairs the player's answer with Proust's historical response
  - The prousts-answer.njk template is used with the personal-letter theme
  - The letter is uploaded to storage and a delivery record created
And each player receives a push notification: "A letter from the past has arrived"
And web players receive an email with a download link
```

**Scenario 3c: Delivery tolerance window**
```
Given a delayed artifact is scheduled for 10 AM on a specific date
When the scheduler processes the delivery queue
Then the artifact is delivered within 1 hour of the scheduled time
And if the generation service is unavailable, delivery retries up to 5 times over 24 hours
```

---

### US-004: Host Writing Prompts (Priority: P2)

As a host, I want to write a personal reflection for my guests' delayed artifacts, so that the evening includes my voice alongside the game's data.

**Why this priority**: Host-written content (Sealed Envelope, Afterword) is a premium feature that deepens the host's creative investment, but auto-generated delayed artifacts work without it.

**Independent Test**: Can be tested by receiving a writing prompt notification, submitting content, and verifying it appears in the generated delayed artifact.

**Acceptance Scenarios**:

**Scenario 4a: Host receives writing prompt**
```
Given a session is in COMPLETE state with host-written delayed artifacts pending
When 2 days have passed since game night
Then the host receives a push notification: "Your guests' Sealed Envelope awaits your words"
And tapping the notification opens the writing prompt screen
And the screen displays per-character prompts (for Sealed Envelope) or a general reflection prompt (for Afterword)
```

**Scenario 4b: Host submits reflection content**
```
Given I am on the writing prompt screen
When I write my reflection and tap "Save"
Then the content is saved to the session record
And the delayed artifact generation uses my content when its delivery date arrives
And I can edit my submission until 24 hours before the scheduled delivery
```

**Scenario 4c: Host does not write by delivery date**
```
Given the scheduled delivery date has arrived
And the host has not submitted their writing prompt content
Then delivery is postponed by 2 days
And the host receives a reminder: "Your guests are waiting for the Sealed Envelope"
And if still no content after 2 postponements, the artifact generates with a default message:
  "The host's words are still being composed. Some things take time."
```

---

### US-005: Personal Artifact Library (Priority: P3)

As a player who has participated in multiple games, I want to browse all my received artifacts in one place, so that I can revisit my collection of evening memories.

**Why this priority**: The library is a retention feature that gains value over time but is not essential for the first session experience.

**Independent Test**: Can be tested by generating and delivering artifacts across multiple sessions, then verifying they all appear in a chronological library view.

**Acceptance Scenarios**:

**Scenario 5a: View artifact library**
```
Given I have received artifacts from one or more sessions
When I navigate to "My Library" from the Home screen
Then I see all received artifacts organized by session (most recent first)
And each entry shows: artifact name, game type, session date, and a thumbnail
And I can tap any artifact to view it in the PDF viewer
```

**Scenario 5b: Artifact library filtering**
```
Given I have artifacts from multiple game types
When I filter by game type (e.g., "Confession Album")
Then only artifacts from that game type are displayed
And the filter state persists until I change it
```

**Scenario 5c: Download artifact to device**
```
Given I am viewing an artifact in the in-app viewer
When I tap the download/share button
Then the PDF is saved to my device's files or shared via the system share sheet
And the PDF opens correctly in any standard PDF reader
```

**Scenario 5d: Web player claims past artifacts**
```
Given I previously participated as a web player and received artifacts via email
When I install the app and create an account with the same email
Then my past artifacts from web player sessions are linked to my account
And they appear in my artifact library
```

---

### Edge Cases

- **Empty session data**: If a session completes with no contributions or game outcomes (e.g., host started game night but nobody answered questions), generation should produce a "commemorative" artifact with session metadata only, not fail.
- **Very large sessions**: Sessions with 15+ players and 20+ questions may produce PDFs exceeding 50 pages. The pipeline must handle this within the 30-second SLA by streaming page rendering.
- **Concurrent generation requests**: If the host taps "Generate" multiple times rapidly, the system deduplicates and returns the existing generation job.
- **Storage quota**: Each session's artifacts consume storage. Artifacts for ARCHIVED sessions older than 90 days are eligible for cleanup per the data retention policy.
- **Time zone handling for delayed delivery**: The 10 AM delivery time must respect each player's local time zone, derived from their device locale or session location.
- **Template not found**: If a session references a template not in the TEMPLATE_MAP (e.g., future game templates not yet built), the pipeline fails gracefully with a descriptive error rather than crashing.
- **Puppeteer unavailable**: If the headless browser instance is not available (cold start, crash), the service must handle this with appropriate retry and timeout logic.

---

## 2. Functional Requirements

### Generation Pipeline

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | System shall wrap the existing `artifacts/src/render.ts` pipeline (Nunjucks + Puppeteer) into a server-callable service with an HTTP API | P0 |
| FR-002 | System shall accept a generation request with session_id, template_name, and data payload, and return the artifact status and file URL | P0 |
| FR-003 | System shall assemble template data from session records (players, contributions, game outcomes, session metadata) | P0 |
| FR-004 | System shall render HTML using the existing Nunjucks environment with all registered filters (dateFormat, truncate, ordinal, initials, markdown) | P0 |
| FR-005 | System shall inline CSS from the design system (reset.css, tokens.css, typography.css, layout.css, textures.css) using the existing `inlineCSS()` function | P0 |
| FR-006 | System shall render PDF using Puppeteer with the existing configuration: headless, preferCSSPageSize, printBackground, no header/footer | P0 |
| FR-007 | System shall complete generation in <30 seconds per artifact | P0 |
| FR-008 | System shall produce PDFs at print-ready quality (300 DPI equivalent, correct typography, web fonts loaded) | P0 |
| FR-009 | System shall limit individual artifact file size to <5MB | P0 |
| FR-010 | System shall support batch generation (multiple artifact types per session in a single request) | P0 |

### Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011 | System shall upload generated PDFs to Supabase Storage (or S3-compatible) with CDN-backed URLs | P0 |
| FR-012 | System shall generate time-limited download URLs (30-day expiry) scoped to session participants | P0 |
| FR-013 | System shall enforce per-session storage quotas (max 50MB per session across all artifacts) | P1 |
| FR-014 | System shall clean up artifact storage for sessions archived >90 days (per retention policy) | P1 |

### Delivery

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | System shall deliver artifacts to app players via push notification with in-app download link | P0 |
| FR-016 | System shall deliver artifacts to web players via email with time-limited download link | P0 |
| FR-017 | System shall track delivery status per recipient: sent, delivered, opened, failed | P0 |
| FR-018 | System shall support retry for failed deliveries (up to 3 retries with exponential backoff) | P0 |
| FR-019 | System shall deliver immediate artifacts within 5 minutes of generation completing | P0 |

### Delayed Delivery

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020 | System shall schedule delayed artifact generation and delivery based on configurable delay (default 7 days, range 3-14 days) | P0 |
| FR-021 | System shall deliver delayed artifacts at 10 AM in the recipient's local time zone | P0 |
| FR-022 | System shall deliver delayed artifacts within 1 hour of the scheduled time | P0 |
| FR-023 | System shall generate personalized delayed artifacts (one per player per question answered, for Proust's Answer) | P0 |
| FR-024 | System shall send host writing prompt notifications 2 days after game night | P0 |
| FR-025 | System shall postpone host-written delayed artifact delivery if host content is missing (max 2 postponements of 2 days each) | P0 |
| FR-026 | System shall generate delayed artifacts with a default message if host content is never submitted | P0 |

### Preview and Library

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-027 | System shall display generated PDFs in an in-app viewer with scroll and pinch-to-zoom | P0 |
| FR-028 | System shall load the PDF viewer within 3 seconds of user tap | P0 |
| FR-029 | System shall maintain a personal artifact library listing all received artifacts per user | P0 |
| FR-030 | System shall support filtering the artifact library by game type | P1 |
| FR-031 | System shall support downloading/sharing artifacts via the system share sheet | P0 |
| FR-032 | System shall link web player artifacts to their account when they later create one (email matching) | P1 |

### Artifact Catalog (V1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-033 | System shall support artifact A01 (The Album) using template `the-album.njk` | P0 |
| FR-034 | System shall support artifact A02 (Contributions Table) using template `contributions-table.njk`, auto-generated with A01 | P0 |
| FR-035 | System shall support artifact A03 (Proust's Answer) using template `prousts-answer.njk`, delayed delivery, personalized per player | P0 |
| FR-036 | System shall support artifact A04 (The Dossier) using template `the-dossier.njk` | P0 |
| FR-037 | System shall support artifact A05 (Menu of the Damned) using template `menu-of-the-damned.njk`, auto-generated with A04 | P0 |
| FR-038 | System shall support artifact A07 (The Sealed Envelope) using template `the-sealed-envelope.njk`, delayed delivery, personalized per player | P0 |
| FR-039 | System shall support artifact A06 (Society Page Photo) as a client-side camera composite (not part of server pipeline) | P1 |

---

## 3. Key Entities

These entities define the data boundary for this spec. Full schema in `data-model.md`.

### Artifact
- `id` (UUID) -- unique identifier
- `session_id` (UUID, FK) -- references Session
- `catalog_id` (text) -- references artifact catalog (A01-A15)
- `template_name` (text) -- maps to TEMPLATE_MAP key in render.ts
- `name` (text) -- human-readable name (e.g., "The Album")
- `status` (enum) -- queued, generating, ready, delivered, failed
- `file_url` (text, nullable) -- CDN-backed download URL
- `file_size` (integer, nullable) -- bytes
- `page_count` (integer, nullable) -- estimated
- `personalized_for` (UUID, nullable, FK) -- references SessionParticipation; null for shared artifacts
- `delivery_type` (enum) -- immediate, delayed
- `scheduled_delivery_at` (timestamptz, nullable) -- for delayed artifacts
- `host_content` (text, nullable) -- host-written content for Sealed Envelope / Afterword
- `host_content_submitted_at` (timestamptz, nullable)
- `error_message` (text, nullable) -- if status is "failed"
- `retry_count` (integer) -- default 0
- `created_at` (timestamptz)
- `generated_at` (timestamptz, nullable)

### ArtifactDelivery
- `id` (UUID) -- unique identifier
- `artifact_id` (UUID, FK) -- references Artifact
- `participant_id` (UUID, FK) -- references SessionParticipation
- `channel` (enum) -- push, email
- `status` (enum) -- pending, sent, delivered, opened, failed
- `sent_at` (timestamptz, nullable)
- `delivered_at` (timestamptz, nullable)
- `opened_at` (timestamptz, nullable)
- `download_url` (text, nullable) -- participant-specific time-limited URL
- `download_url_expires_at` (timestamptz, nullable)
- `error_message` (text, nullable)
- `retry_count` (integer) -- default 0

### ArtifactWritingPrompt
- `id` (UUID) -- unique identifier
- `artifact_id` (UUID, FK) -- references Artifact (the delayed artifact this prompt feeds)
- `host_id` (UUID, FK) -- references User
- `prompt_type` (enum) -- sealed_envelope, afterword
- `prompt_text` (text) -- the writing prompt displayed to the host
- `target_participant_id` (UUID, nullable, FK) -- for per-character prompts
- `notified_at` (timestamptz, nullable)
- `submitted_content` (text, nullable)
- `submitted_at` (timestamptz, nullable)

---

## 4. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Artifact generation time | <30 seconds per artifact | Timer from request receipt to "ready" status |
| PDF quality | Print-ready, correct typography (Playfair Display, Lora, JetBrains Mono loaded) | Visual QA against fixture renders |
| Artifact file size | <5MB per artifact | File size check on upload |
| Immediate delivery time | <5 minutes from generation to player notification | Timer from "ready" status to notification receipt |
| Delayed delivery accuracy | Within 1 hour of scheduled time | Deviation from 10 AM local time |
| PDF viewer load time | <3 seconds from tap to first page visible | Client-side timer |
| Host writing prompt delivery | 2 days post-game (+/- 6 hours) | Scheduler accuracy measurement |
| Delivery tracking completeness | 100% of deliveries tracked | Count of deliveries with status vs. total expected |
| Personalized artifact accuracy | 100% correct player-answer pairings | Data integrity check against session records |
| Pipeline availability | 99.5% uptime during post-game hours (6 PM - 2 AM, weekends) | Uptime monitoring |
