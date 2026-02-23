# Tasks: 006 Artifact Generation Pipeline

**Input**: Design documents from `specs/006-artifact-pipeline/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Organization**: Tasks grouped by user story. Phase 1 wraps existing `render.ts` into a callable service with minimal changes. The rendering code is NOT rewritten.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure, database schema, storage configuration

- [ ] T001 Create `services/artifact-generator/` directory structure per plan.md
- [ ] T002 [P] Initialize `services/artifact-generator/package.json` with dependencies: nunjucks, puppeteer, @supabase/supabase-js, fastify (HTTP server)
- [ ] T003 [P] Create `services/artifact-generator/tsconfig.json` extending the existing `artifacts/tsconfig.json` compiler options
- [ ] T004 [P] Create `services/artifact-generator/Dockerfile` using `ghcr.io/puppeteer/puppeteer` base image, copying `artifacts/` templates and design system into the image
- [ ] T005 [P] Create `supabase/functions/generate-artifacts/` Edge Function directory with `index.ts` stub and `types.ts`

**Checkpoint**: Project scaffolding complete, Docker image builds, Edge Function deploys

---

## Phase 2: Database & Storage (Blocking Prerequisites)

**Purpose**: Schema, RLS, storage bucket -- all user stories depend on this

- [ ] T006 Create migration `supabase/migrations/YYYYMMDD_create_artifacts.sql` with the `artifacts` table, indexes, and CHECK constraints from data-model.md
- [ ] T007 [P] Create migration `supabase/migrations/YYYYMMDD_create_artifact_deliveries.sql` with the `artifact_deliveries` table, unique constraint, and indexes
- [ ] T008 [P] Create migration `supabase/migrations/YYYYMMDD_create_artifact_writing_prompts.sql` with the `artifact_writing_prompts` table and indexes
- [ ] T009 Apply RLS policies for `artifacts` table: host write access, participant read access, personalized artifact scoping (from data-model.md section 4.1)
- [ ] T010 [P] Apply RLS policies for `artifact_deliveries` table: host read all, participant read own (from data-model.md section 4.2)
- [ ] T011 [P] Apply RLS policies for `artifact_writing_prompts` table: host-only access (from data-model.md section 4.3)
- [ ] T012 Create Supabase Storage bucket `artifacts` with 5MB file limit, PDF-only MIME type, and private access
- [ ] T013 Apply Storage RLS policies: host upload, participant download (from data-model.md section 5.2)

**Checkpoint**: Database schema applied, RLS enforced, storage bucket accessible via service role

---

## Phase 3: User Story 1 -- Host Triggers Artifact Generation (P1, MVP)

**Goal**: Host taps "Generate Artifacts", server renders PDFs using existing pipeline, uploads to storage, returns URLs within 30 seconds.

**Independent Test**: Trigger generation with fixture data via API call, verify PDF in storage.

### Cloud Run Rendering Service

- [ ] T014 Create `services/artifact-generator/src/storage.ts`: Supabase Storage upload helper that accepts a PDF buffer and storage path, uploads via `supabase.storage.from('artifacts').upload()`, and returns the public URL
- [ ] T015 [P] Create `services/artifact-generator/src/generate.ts`: orchestrator module that imports `renderPDF` from the existing `artifacts/src/render.ts`, calls it with template name + data, reads the output PDF, uploads via storage.ts, and returns `{ fileUrl, filePath, fileSize, pageCount }`
- [ ] T016 Create `services/artifact-generator/src/server.ts`: Fastify HTTP server with a single `POST /render` endpoint that accepts `{ template_name, data, storage_path }`, calls generate.ts, and returns the result (matching the internal `/render` OpenAPI contract)
- [ ] T017 Add health check endpoint `GET /health` to server.ts that verifies Puppeteer can launch and Nunjucks env loads
- [ ] T018 Write Dockerfile build steps: install dependencies, copy `artifacts/` directory (templates, design-system, src/render.ts), build TypeScript, set entrypoint to `node dist/server.js`

### Data Assembly

- [ ] T019 Create `supabase/functions/generate-artifacts/assembler.ts`: functions to query session data and assemble template payloads for each artifact type (matching the data shapes in fixtures/confession-album.json and fixtures/murder-mystery.json)
- [ ] T020 Implement Confession Album data assembly: session metadata, players, questions, answers, questionSet, completionMatrix (query pattern from data-model.md section 6.1)
- [ ] T021 [P] Implement Murder Mystery data assembly: session metadata, setting, characters, clues, accusations, reveal, votes, recipes

### Edge Function Orchestration

- [ ] T022 Implement `supabase/functions/generate-artifacts/index.ts` handler for `POST /generate-artifacts`: validate request (session in COMPLETE state, caller is host), determine applicable artifact types for the session's game type, create Artifact records in DB with status "queued"
- [ ] T023 Implement generation dispatch: for each queued artifact, call the Cloud Run `/render` endpoint with assembled data, update artifact record with file_url/file_size/page_count and status "ready" on success, or status "failed" with error_message on failure
- [ ] T024 Implement auto-companion generation: when A01 is requested, automatically include A02; when A04 is requested, automatically include A05
- [ ] T025 Implement `GET /generate-artifacts/status/{session_id}`: query artifacts table, return statuses with overall_status computed from individual statuses
- [ ] T026 Implement `POST /generate-artifacts/retry/{artifact_id}`: validate artifact is in "failed" status and retry_count < 3, reset to "queued", increment retry_count, re-dispatch

### Tests

- [ ] T027 [P] Write test: generate `the-album` PDF from `fixtures/confession-album.json`, verify PDF file created, >0 bytes, <5MB
- [ ] T028 [P] Write test: generate `the-dossier` PDF from `fixtures/murder-mystery.json`, verify noir theme applied, correct page structure
- [ ] T029 Write test: trigger full generation flow via Edge Function mock, verify artifact records created with correct statuses
- [ ] T030 Write test: retry failed artifact, verify status reset and retry_count incremented

**Checkpoint**: Host can trigger generation, PDFs are produced and stored, status polling works

---

## Phase 4: User Story 2 -- Artifact Preview and Distribution (P1)

**Goal**: Host previews PDFs in-app, distributes to participants via push and email, delivery tracked.

**Independent Test**: View a generated PDF in the app, trigger distribution, verify push + email received.

### Mobile Client

- [ ] T031 Create `app/components/PdfViewer.tsx`: wrapper around `react-native-pdf` with loading indicator, error state, pinch-to-zoom, page count display
- [ ] T032 Create `app/screens/ArtifactPreview.tsx`: screen that receives an artifact ID via navigation params, fetches the download URL, displays the PDF via PdfViewer component
- [ ] T033 [P] Create `app/services/artifactService.ts`: API client functions for all artifact endpoints (triggerGeneration, getStatus, getDownloadUrl, getLibrary, distribute)
- [ ] T034 Create `app/screens/DistributionStatus.tsx`: screen showing per-player delivery matrix (name, channel, status, timestamp) with resend button for failed deliveries

### Delivery (Push + Email)

- [ ] T035 Implement push notification dispatch in Edge Function: for each app player, send Expo push notification with artifact ID in data payload, create ArtifactDelivery record with channel "push"
- [ ] T036 [P] Implement email delivery: for each web player, generate presigned download URL (30 days), send email via Resend with PDF download link, create ArtifactDelivery record with channel "email"
- [ ] T037 Create email template for artifact delivery: game-appropriate styling, session name, artifact name, download button, expiry notice
- [ ] T038 Implement `POST /generate-artifacts/distribute/{session_id}`: validate caller is host, create delivery records for all participants, dispatch push + email

### Delivery Tracking

- [ ] T039 Implement `GET /generate-artifacts/deliveries/{session_id}`: join artifact_deliveries with session_participations, return per-player delivery matrix
- [ ] T040 Implement `POST /generate-artifacts/deliveries/{delivery_id}/resend`: validate delivery is "failed", reset to "pending", re-dispatch
- [ ] T041 Implement push receipt checking: query Expo push receipts to update delivery status from "sent" to "delivered" or "failed"

### Tests

- [ ] T042 [P] Write test: PdfViewer loads a remote PDF URL and renders the first page
- [ ] T043 [P] Write test: distribution creates correct delivery records for mixed app/web player session
- [ ] T044 Write test: resend failed delivery creates new push/email attempt

**Checkpoint**: Host can preview PDFs, distribute to all players, and track delivery status

---

## Phase 5: User Story 3 -- Delayed Artifact Delivery (P2)

**Goal**: Proust's Answer and Sealed Envelope generate and deliver on schedule, personalized per player.

**Independent Test**: Schedule a delayed artifact, process the delivery queue, verify personalized PDF delivered.

### Delayed Scheduling

- [ ] T045 Extend T022 (generation trigger): when creating delayed artifacts (A03, A07), set `scheduled_delivery_at` = session date + configured delay days, status = "queued", delivery_type = "delayed"
- [ ] T046 Create `supabase/migrations/YYYYMMDD_schedule_delivery_queue.sql`: pg_cron job that runs every 5 minutes, calls the Edge Function delivery queue processor for artifacts where `scheduled_delivery_at <= now()` and status = "queued" and delivery_type = "delayed"

### Personalized Generation

- [ ] T047 Implement per-player Proust's Answer generation in the assembler: for each player who answered at least one question, assemble data matching `prousts-answer.njk` template shape (player, question, playerAnswer, proustAnswer, questionLineage, sessionDate)
- [ ] T048 [P] Implement per-player Sealed Envelope generation in the assembler: for each player, assemble data matching `the-sealed-envelope.njk` template shape, including host reflection content if submitted

### Queue Processor

- [ ] T049 Implement Edge Function handler for delivery queue processing: query artifacts with `scheduled_delivery_at <= now()` and status = "queued" and delivery_type = "delayed", generate each (calling Cloud Run), update status, dispatch deliveries
- [ ] T050 Implement time zone handling: deliver at 10 AM in each player's local time zone (derived from participation record or session location)
- [ ] T051 Implement retry logic for delayed delivery: if generation fails, retry up to 5 times over 24 hours with exponential backoff

### Tests

- [ ] T052 Write test: delayed artifact creation sets correct scheduled_delivery_at
- [ ] T053 [P] Write test: queue processor generates personalized Proust's Answer for each player with correct data pairing
- [ ] T054 Write test: queue processor skips artifacts whose scheduled_delivery_at is in the future

**Checkpoint**: Delayed artifacts generate and deliver on schedule with correct personalization

---

## Phase 6: User Story 4 -- Host Writing Prompts (P2)

**Goal**: Host receives writing prompt notification, submits content, content appears in delayed artifact.

**Independent Test**: Receive prompt notification, submit content, verify content in generated PDF.

### Writing Prompt System

- [ ] T055 Extend delayed artifact creation (T045): for host-written artifact types (A07 Sealed Envelope), create ArtifactWritingPrompt records with prompt text and target participant
- [ ] T056 Implement writing prompt notification: schedule push notification for 2 days post-game night, linking to writing prompt screen
- [ ] T057 Implement `GET /generate-artifacts/writing-prompts`: query pending prompts for the authenticated host
- [ ] T058 Implement `PUT /generate-artifacts/writing-prompts/{prompt_id}`: save host content, set submitted_at, validate host identity and edit window (>24 hours before delivery)

### Host Content Integration

- [ ] T059 Modify Sealed Envelope data assembly (T048): if host content submitted, include it; if not, check postponement logic
- [ ] T060 Implement delivery postponement: if host content missing at delivery time, postpone by 2 days (max 2 times), send reminder notification to host
- [ ] T061 Implement fallback: after 2 postponements with no content, generate with default message

### Mobile Client

- [ ] T062 Create `app/screens/WritingPrompt.tsx`: screen displaying prompt text with text input area, character count, save button, and deadline countdown
- [ ] T063 Handle deep link from writing prompt notification: navigate directly to WritingPrompt screen with the prompt ID

### Tests

- [ ] T064 Write test: writing prompt created when A07 delayed artifact is queued
- [ ] T065 [P] Write test: submitted content appears in generated Sealed Envelope PDF
- [ ] T066 Write test: delivery postponed when host content missing, up to 2 times

**Checkpoint**: Host can write content that appears in delayed artifacts, with postponement logic working

---

## Phase 7: User Story 5 -- Personal Artifact Library (P3)

**Goal**: Players browse their collected artifacts, filter by game type, download/share.

**Independent Test**: View library with artifacts from multiple sessions, filter works, download works.

### Library Endpoint

- [ ] T067 Implement `GET /generate-artifacts/library`: query artifact_deliveries joined with artifacts and sessions for the authenticated user, return LibraryEntry objects sorted by received_at descending, with pagination (limit/offset)
- [ ] T068 Add game_type filter parameter: join sessions table to filter by game_type column

### Download

- [ ] T069 Implement `GET /generate-artifacts/download/{artifact_id}`: validate user is a participant, generate presigned URL (30-day expiry), return URL and expiry timestamp

### Mobile Client

- [ ] T070 Create `app/screens/ArtifactLibrary.tsx`: screen with flat list of LibraryEntry cards, each showing artifact name, session name, game type badge, date, and thumbnail (first-page preview or icon)
- [ ] T071 Add game type filter chips at top of library screen (All, Confession Album, Murder Mystery)
- [ ] T072 Add share button to ArtifactPreview screen: download PDF to temp file, open system share sheet

### Web Player Account Linking

- [ ] T073 When a user creates an account, query artifact_deliveries for web player participations with matching email, update participant's user_id to link artifacts to the new account

### Tests

- [ ] T074 Write test: library returns artifacts from multiple sessions for a user
- [ ] T075 [P] Write test: game_type filter returns only matching artifacts
- [ ] T076 Write test: web player artifacts linked after account creation

**Checkpoint**: Players have a browsable, filterable artifact library with download support

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, monitoring, performance, and cleanup

- [ ] T077 [P] Add structured logging to Cloud Run service: log template name, generation duration, file size, errors
- [ ] T078 [P] Add error handling middleware to Edge Function: catch and format all errors with consistent Error schema
- [ ] T079 Implement storage cleanup job: pg_cron weekly job to delete files for sessions archived >90 days
- [ ] T080 Add generation metrics: track p50/p95 generation times per template type
- [ ] T081 [P] Add rate limiting to generation endpoint: max 1 concurrent generation per session (prevent duplicate triggers)
- [ ] T082 Verify all fixtures render correctly: run `npx ts-node src/cli.ts --all` in the Cloud Run container to validate template rendering before deployment
- [ ] T083 Run quickstart.md validation scenarios end-to-end
- [ ] T084 Documentation: update `CLAUDE.md` with artifact pipeline architecture and deployment instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies -- start immediately
- **Phase 2 (Database)**: Depends on Phase 1 -- BLOCKS all user stories
- **Phase 3 (US1 - Generation)**: Depends on Phase 2 -- MVP, must complete first
- **Phase 4 (US2 - Preview/Distribution)**: Depends on Phase 3 (needs generated artifacts)
- **Phase 5 (US3 - Delayed Delivery)**: Depends on Phase 3 (needs generation pipeline)
- **Phase 6 (US4 - Writing Prompts)**: Depends on Phase 5 (extends delayed delivery)
- **Phase 7 (US5 - Library)**: Depends on Phase 4 (needs delivery records)
- **Phase 8 (Polish)**: Depends on all user stories

### Parallel Opportunities

- Phase 5 (Delayed) and Phase 4 (Distribution) can run in parallel after Phase 3
- Phase 7 (Library) can start after Phase 4
- Within each phase, tasks marked [P] can run in parallel

### Implementation Strategy

1. Complete Phases 1-3: generation pipeline works end-to-end (MVP)
2. Complete Phase 4: artifacts reach players (full value loop)
3. Complete Phases 5-6: delayed delivery with host content (emotional payoff)
4. Complete Phase 7: library for returning players (retention)
5. Complete Phase 8: polish and monitoring

---

## Notes

- The existing `artifacts/src/render.ts` is imported into the Cloud Run service, NOT rewritten. Any render.ts bugs should be fixed in the original file, not forked.
- All templates and design system files are bundled into the Docker image at build time. Template changes require a new Docker build and Cloud Run deployment.
- The pg_cron delivery queue processor is a safety net. In normal operation, delayed artifacts queue and fire on schedule. The 5-minute polling interval means delivery is within 5 minutes of the scheduled time.
- For local development, the Cloud Run service can be run with `docker compose` alongside a local Supabase instance.
