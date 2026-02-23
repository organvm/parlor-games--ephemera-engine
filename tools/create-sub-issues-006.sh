# Spec 006: Artifact Generation Pipeline — 84 tasks across 4 epics
# Sourced by create-sub-issues.sh — no shebang, no set flags

# ============================================================
# Epic #9: Pipeline Setup & Cloud Run (Phases 1–2: T001–T013)
# ============================================================

# --- Phase 1: Setup (P0) ---

create_issue \
  "T001: Create artifact-generator directory structure" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create `services/artifact-generator/` directory structure per plan.md. This is the Cloud Run rendering service that wraps the existing `artifacts/` pipeline.

## Deliverables
- Create `services/artifact-generator/` directory
- Create `services/artifact-generator/src/` subdirectory
- Establish directory layout per plan.md

## Files
- `services/artifact-generator/`
- `services/artifact-generator/src/`

## Dependencies
None
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T002: Initialize artifact-generator package.json" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Initialize `services/artifact-generator/package.json` with all required dependencies for the Cloud Run rendering service.

## Deliverables
- Create `package.json` with dependencies: nunjucks, puppeteer, @supabase/supabase-js, fastify
- Include dev dependencies for TypeScript compilation
- Configure build and start scripts

## Files
- `services/artifact-generator/package.json`

## Dependencies
None
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T003: Create artifact-generator tsconfig.json" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create `services/artifact-generator/tsconfig.json` extending the existing `artifacts/tsconfig.json` compiler options.

## Deliverables
- Create `tsconfig.json` that extends `../../artifacts/tsconfig.json`
- Configure output directory for compiled JavaScript
- Include source files and exclude node_modules

## Files
- `services/artifact-generator/tsconfig.json`

## Dependencies
None
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T004: Create artifact-generator Dockerfile" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create `services/artifact-generator/Dockerfile` using `ghcr.io/puppeteer/puppeteer` base image, copying `artifacts/` templates and design system into the image.

## Deliverables
- Create Dockerfile with `ghcr.io/puppeteer/puppeteer` base image
- Copy `artifacts/` directory (templates, design-system, src/render.ts) into the image
- Install dependencies and build TypeScript
- Set entrypoint to the compiled server

## Files
- `services/artifact-generator/Dockerfile`

## Dependencies
None
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T005: Create generate-artifacts Edge Function directory" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create `supabase/functions/generate-artifacts/` Edge Function directory with `index.ts` stub and `types.ts`.

## Deliverables
- Create `supabase/functions/generate-artifacts/` directory
- Create `index.ts` stub with Deno serve handler
- Create `types.ts` with request/response type definitions

## Files
- `supabase/functions/generate-artifacts/index.ts`
- `supabase/functions/generate-artifacts/types.ts`

## Dependencies
None
BODY
)" \
  "spec:006-artifacts,P0" \
  9

# --- Phase 2: Database & Storage (P0) ---

create_issue \
  "T006: Create artifacts table migration" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create migration `supabase/migrations/YYYYMMDD_create_artifacts.sql` with the `artifacts` table, indexes, and CHECK constraints from data-model.md.

## Deliverables
- Create `artifacts` table with all columns from data-model.md
- Add indexes for session_id, artifact_type, status
- Add CHECK constraints for status values, file_size limits
- Include created_at and updated_at timestamps

## Files
- `supabase/migrations/YYYYMMDD_create_artifacts.sql`

## Dependencies
Phase 1 (T001-T005)
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T007: Create artifact_deliveries table migration" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create migration `supabase/migrations/YYYYMMDD_create_artifact_deliveries.sql` with the `artifact_deliveries` table, unique constraint, and indexes.

## Deliverables
- Create `artifact_deliveries` table with all columns from data-model.md
- Add unique constraint on (artifact_id, user_id, channel)
- Add indexes for artifact_id, user_id, status
- Include delivery tracking columns (sent_at, delivered_at, failed_at)

## Files
- `supabase/migrations/YYYYMMDD_create_artifact_deliveries.sql`

## Dependencies
Phase 1 (T001-T005)
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T008: Create artifact_writing_prompts table migration" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create migration `supabase/migrations/YYYYMMDD_create_artifact_writing_prompts.sql` with the `artifact_writing_prompts` table and indexes.

## Deliverables
- Create `artifact_writing_prompts` table with all columns from data-model.md
- Add indexes for artifact_id, host_id, status
- Include prompt_text, content, submitted_at, deadline columns

## Files
- `supabase/migrations/YYYYMMDD_create_artifact_writing_prompts.sql`

## Dependencies
Phase 1 (T001-T005)
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T009: Apply RLS policies for artifacts table" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Apply Row-Level Security policies for the `artifacts` table: host write access, participant read access, personalized artifact scoping (from data-model.md section 4.1).

## Deliverables
- Enable RLS on `artifacts` table
- Host can INSERT and UPDATE artifacts for their sessions
- Participants can SELECT artifacts for sessions they belong to
- Personalized artifacts scoped to the target participant only
- Service role bypasses RLS for background jobs

## Files
- `supabase/migrations/YYYYMMDD_artifacts_rls.sql`

## Dependencies
T006
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T010: Apply RLS policies for artifact_deliveries table" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Apply Row-Level Security policies for the `artifact_deliveries` table: host read all, participant read own (from data-model.md section 4.2).

## Deliverables
- Enable RLS on `artifact_deliveries` table
- Host can SELECT all deliveries for their sessions
- Participants can SELECT only their own delivery records
- Service role bypasses RLS for delivery dispatch

## Files
- `supabase/migrations/YYYYMMDD_artifact_deliveries_rls.sql`

## Dependencies
T007
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T011: Apply RLS policies for artifact_writing_prompts table" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Apply Row-Level Security policies for the `artifact_writing_prompts` table: host-only access (from data-model.md section 4.3).

## Deliverables
- Enable RLS on `artifact_writing_prompts` table
- Only the host can SELECT, INSERT, and UPDATE their own writing prompts
- Service role bypasses RLS for scheduled notifications

## Files
- `supabase/migrations/YYYYMMDD_artifact_writing_prompts_rls.sql`

## Dependencies
T008
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T012: Create Supabase Storage bucket for artifacts" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Create Supabase Storage bucket `artifacts` with 5MB file limit, PDF-only MIME type, and private access.

## Deliverables
- Create `artifacts` storage bucket via migration or seed
- Set 5MB file size limit
- Restrict to PDF-only MIME type (application/pdf)
- Configure as private (no public access)

## Files
- `supabase/migrations/YYYYMMDD_create_artifacts_bucket.sql`

## Dependencies
Phase 1 (T001-T005)
BODY
)" \
  "spec:006-artifacts,P0" \
  9

create_issue \
  "T013: Apply Storage RLS policies" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P0 | **Estimate**: Medium

## Description
Apply Storage RLS policies for the artifacts bucket: host upload, participant download (from data-model.md section 5.2).

## Deliverables
- Host can upload files to the artifacts bucket
- Participants can download files for sessions they belong to
- Service role bypasses RLS for background generation jobs

## Files
- `supabase/migrations/YYYYMMDD_artifacts_storage_rls.sql`

## Dependencies
T012
BODY
)" \
  "spec:006-artifacts,P0" \
  9

# ============================================================
# Epic #10: Generation Trigger & Distribution (Phases 3–4: T014–T044)
# ============================================================

# --- Phase 3: US1 — Host Triggers Generation (P1) ---

create_issue \
  "T014: Create storage upload helper" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `services/artifact-generator/src/storage.ts`: Supabase Storage upload helper that accepts a PDF buffer and storage path, uploads via `supabase.storage.from('artifacts').upload()`, and returns the public URL.

## Deliverables
- Create storage upload helper function
- Accept PDF buffer and storage path parameters
- Upload via Supabase Storage client
- Return the public URL for the uploaded file
- Handle upload errors with descriptive messages

## Files
- `services/artifact-generator/src/storage.ts`

## Dependencies
Phase 2 (T006-T013)
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T015: Create generate orchestrator module" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `services/artifact-generator/src/generate.ts`: orchestrator module that imports `renderPDF` from the existing `artifacts/src/render.ts`, calls it with template name + data, reads the output PDF, uploads via storage.ts, and returns `{ fileUrl, filePath, fileSize, pageCount }`.

## Deliverables
- Import `renderPDF` from existing `artifacts/src/render.ts`
- Call renderPDF with template name and data
- Read the output PDF buffer
- Upload via storage.ts helper
- Return `{ fileUrl, filePath, fileSize, pageCount }`

## Files
- `services/artifact-generator/src/generate.ts`

## Dependencies
Phase 2 (T006-T013)
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T016: Create Fastify HTTP server" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `services/artifact-generator/src/server.ts`: Fastify HTTP server with a single `POST /render` endpoint that accepts `{ template_name, data, storage_path }`, calls generate.ts, and returns the result (matching the internal `/render` OpenAPI contract).

## Deliverables
- Create Fastify server with `POST /render` endpoint
- Accept `{ template_name, data, storage_path }` request body
- Call generate.ts orchestrator
- Return render result matching OpenAPI contract
- Configure CORS and request validation

## Files
- `services/artifact-generator/src/server.ts`

## Dependencies
T014, T015
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T017: Add health check endpoint" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Add health check endpoint `GET /health` to server.ts that verifies Puppeteer can launch and Nunjucks env loads.

## Deliverables
- Add `GET /health` endpoint to Fastify server
- Verify Puppeteer can launch a browser instance
- Verify Nunjucks environment loads templates
- Return health status with component checks

## Files
- `services/artifact-generator/src/server.ts`

## Dependencies
T016
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T018: Write Dockerfile build steps" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write Dockerfile build steps: install dependencies, copy `artifacts/` directory (templates, design-system, src/render.ts), build TypeScript, set entrypoint to `node dist/server.js`.

## Deliverables
- Multi-stage build: install deps, copy artifacts/, build TS
- Copy templates and design system files from `artifacts/`
- Compile TypeScript to JavaScript
- Set entrypoint to `node dist/server.js`
- Optimize image size with .dockerignore

## Files
- `services/artifact-generator/Dockerfile`
- `services/artifact-generator/.dockerignore`

## Dependencies
T016
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T019: Create data assembler module" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `supabase/functions/generate-artifacts/assembler.ts`: functions to query session data and assemble template payloads for each artifact type (matching the data shapes in fixtures/confession-album.json and fixtures/murder-mystery.json).

## Deliverables
- Create assembler module with game-type dispatch
- Define `assembleTemplateData(sessionId, artifactType)` entry point
- Query session data from Supabase
- Return data shapes matching existing fixture files

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
Phase 2 (T006-T013)
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T020: Implement Confession Album data assembly" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement Confession Album data assembly: session metadata, players, questions, answers, questionSet, completionMatrix (query pattern from data-model.md section 6.1).

## Deliverables
- Implement `assembleConfessionAlbumData()` function
- Query session metadata, players, questions, answers
- Build questionSet and completionMatrix
- Return data matching `fixtures/confession-album.json` shape
- Handle edge cases: incomplete answers, missing players

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
T019
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T021: Implement Murder Mystery data assembly" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement Murder Mystery data assembly: session metadata, setting, characters, clues, accusations, reveal, votes, recipes.

## Deliverables
- Implement `assembleMurderMysteryData()` function
- Query session metadata, setting, characters, clues
- Build accusations, reveal, votes, and recipes data
- Return data matching `fixtures/murder-mystery.json` shape
- Handle edge cases: missing votes, incomplete accusations

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
T019
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T022: Implement POST /generate-artifacts handler" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `supabase/functions/generate-artifacts/index.ts` handler for `POST /generate-artifacts`: validate request (session in COMPLETE state, caller is host), determine applicable artifact types for the session's game type, create Artifact records in DB with status "queued".

## Deliverables
- Implement POST handler in Edge Function
- Validate session is in COMPLETE state
- Validate caller is the session host
- Determine applicable artifact types for the game type
- Create Artifact records with status "queued"
- Return artifact IDs and initial statuses

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T019
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T023: Implement generation dispatch" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement generation dispatch: for each queued artifact, call the Cloud Run `/render` endpoint with assembled data, update artifact record with file_url/file_size/page_count and status "ready" on success, or status "failed" with error_message on failure.

## Deliverables
- For each queued artifact, call Cloud Run `/render` endpoint
- Pass assembled template data from assembler
- On success: update record with file_url, file_size, page_count, status "ready"
- On failure: update record with error_message, status "failed"
- Handle timeout (30s) and network errors

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T022
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T024: Implement auto-companion generation" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement auto-companion generation: when A01 (The Album) is requested, automatically include A02 (Contributions Table); when A04 (The Dossier) is requested, automatically include A05 (Menu of the Damned).

## Deliverables
- When A01 is queued, auto-create A02 artifact record
- When A04 is queued, auto-create A05 artifact record
- Companion artifacts share the same generation trigger
- Companion status tracked independently

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T022
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T025: Implement GET /generate-artifacts/status/{session_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `GET /generate-artifacts/status/{session_id}`: query artifacts table, return statuses with overall_status computed from individual statuses.

## Deliverables
- Query artifacts table for the given session_id
- Return per-artifact status (queued, generating, ready, failed)
- Compute overall_status: "ready" if all ready, "failed" if any failed, "generating" otherwise
- Include file_url for ready artifacts

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T022
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T026: Implement POST /generate-artifacts/retry/{artifact_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `POST /generate-artifacts/retry/{artifact_id}`: validate artifact is in "failed" status and retry_count < 3, reset to "queued", increment retry_count, re-dispatch.

## Deliverables
- Validate artifact is in "failed" status
- Validate retry_count < 3 (return 409 if exceeded)
- Reset status to "queued"
- Increment retry_count
- Re-dispatch generation

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T023
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T027: Write test: generate the-album PDF" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: generate `the-album` PDF from `fixtures/confession-album.json`, verify PDF file created, >0 bytes, <5MB.

## Deliverables
- Test that the-album template renders from fixture data
- Verify PDF file is created
- Verify file size > 0 bytes
- Verify file size < 5MB (storage limit)
- Verify PDF is valid (parseable)

## Files
- `services/artifact-generator/tests/generate-album.test.ts`

## Dependencies
T016
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T028: Write test: generate the-dossier PDF" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: generate `the-dossier` PDF from `fixtures/murder-mystery.json`, verify noir theme applied, correct page structure.

## Deliverables
- Test that the-dossier template renders from fixture data
- Verify PDF file is created with noir theme
- Verify correct page structure
- Verify file size within limits

## Files
- `services/artifact-generator/tests/generate-dossier.test.ts`

## Dependencies
T016
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T029: Write test: full generation flow via Edge Function mock" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: trigger full generation flow via Edge Function mock, verify artifact records created with correct statuses.

## Deliverables
- Mock Edge Function POST /generate-artifacts endpoint
- Trigger generation for a complete session
- Verify artifact records created in DB
- Verify statuses progress from queued to ready
- Verify companion artifacts auto-created

## Files
- `supabase/functions/generate-artifacts/tests/generation-flow.test.ts`

## Dependencies
T023
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T030: Write test: retry failed artifact" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: retry failed artifact, verify status reset and retry_count incremented.

## Deliverables
- Create an artifact record with status "failed"
- Call retry endpoint
- Verify status reset to "queued"
- Verify retry_count incremented
- Verify 409 returned when retry_count >= 3

## Files
- `supabase/functions/generate-artifacts/tests/retry.test.ts`

## Dependencies
T026
BODY
)" \
  "spec:006-artifacts,P1" \
  10

# --- Phase 4: US2 — Preview and Distribution (P1) ---

create_issue \
  "T031: Create PdfViewer component" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `app/components/PdfViewer.tsx`: wrapper around `react-native-pdf` with loading indicator, error state, pinch-to-zoom, page count display.

## Deliverables
- Create PdfViewer component wrapping `react-native-pdf`
- Loading indicator while PDF loads
- Error state with retry button
- Pinch-to-zoom gesture support
- Page count display (e.g., "Page 1 of 5")

## Files
- `app/components/PdfViewer.tsx`

## Dependencies
Phase 3 (T014-T030)
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T032: Create ArtifactPreview screen" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `app/screens/ArtifactPreview.tsx`: screen that receives an artifact ID via navigation params, fetches the download URL, displays the PDF via PdfViewer component.

## Deliverables
- Create ArtifactPreview screen
- Receive artifact ID via navigation params
- Fetch download URL from artifact service
- Display PDF via PdfViewer component
- Show artifact metadata (name, session, date)

## Files
- `app/screens/ArtifactPreview.tsx`

## Dependencies
T031
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T033: Create artifact API client service" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `app/services/artifactService.ts`: API client functions for all artifact endpoints (triggerGeneration, getStatus, getDownloadUrl, getLibrary, distribute).

## Deliverables
- `triggerGeneration(sessionId)` — POST /generate-artifacts
- `getStatus(sessionId)` — GET /generate-artifacts/status/{session_id}
- `getDownloadUrl(artifactId)` — GET /generate-artifacts/download/{artifact_id}
- `getLibrary(filters)` — GET /generate-artifacts/library
- `distribute(sessionId)` — POST /generate-artifacts/distribute/{session_id}
- Typed request/response interfaces

## Files
- `app/services/artifactService.ts`

## Dependencies
Phase 3 (T014-T030)
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T034: Create DistributionStatus screen" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `app/screens/DistributionStatus.tsx`: screen showing per-player delivery matrix (name, channel, status, timestamp) with resend button for failed deliveries.

## Deliverables
- Create DistributionStatus screen
- Display per-player delivery matrix
- Show name, delivery channel (push/email), status, timestamp
- Resend button for failed deliveries
- Auto-refresh delivery statuses

## Files
- `app/screens/DistributionStatus.tsx`

## Dependencies
T033
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T035: Implement push notification dispatch" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement push notification dispatch in Edge Function: for each app player, send Expo push notification with artifact ID in data payload, create ArtifactDelivery record with channel "push".

## Deliverables
- Send Expo push notification for each app player
- Include artifact ID in notification data payload
- Create ArtifactDelivery record with channel "push" and status "sent"
- Handle push token errors gracefully
- Batch notifications for efficiency

## Files
- `supabase/functions/generate-artifacts/delivery.ts`

## Dependencies
T023
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T036: Implement email delivery" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement email delivery: for each web player, generate presigned download URL (30 days), send email via Resend with PDF download link, create ArtifactDelivery record with channel "email".

## Deliverables
- Generate presigned download URL with 30-day expiry
- Send email via Resend API
- Create ArtifactDelivery record with channel "email" and status "sent"
- Handle email delivery errors
- Include expiry date in delivery record

## Files
- `supabase/functions/generate-artifacts/delivery.ts`

## Dependencies
T023
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T037: Create email template for artifact delivery" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Create email template for artifact delivery: game-appropriate styling, session name, artifact name, download button, expiry notice.

## Deliverables
- Create HTML email template for artifact delivery
- Game-appropriate styling (Confession Album vs Murder Mystery)
- Include session name and artifact name
- Prominent download button with presigned URL
- Expiry notice (30 days)
- Mobile-responsive layout

## Files
- `supabase/functions/generate-artifacts/templates/delivery-email.html`

## Dependencies
T036
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T038: Implement POST /generate-artifacts/distribute/{session_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `POST /generate-artifacts/distribute/{session_id}`: validate caller is host, create delivery records for all participants, dispatch push + email.

## Deliverables
- Validate caller is the session host
- Create delivery records for all participants
- Dispatch push notifications for app players
- Dispatch emails for web players
- Return delivery summary with per-player status

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T035, T036
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T039: Implement GET /generate-artifacts/deliveries/{session_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `GET /generate-artifacts/deliveries/{session_id}`: join artifact_deliveries with session_participations, return per-player delivery matrix.

## Deliverables
- Join artifact_deliveries with session_participations
- Return per-player delivery matrix
- Include player name, channel, status, timestamps
- Group by player with all their delivery records

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T038
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T040: Implement POST /generate-artifacts/deliveries/{delivery_id}/resend" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement `POST /generate-artifacts/deliveries/{delivery_id}/resend`: validate delivery is "failed", reset to "pending", re-dispatch.

## Deliverables
- Validate delivery record is in "failed" status
- Reset status to "pending"
- Re-dispatch via appropriate channel (push or email)
- Update sent_at timestamp
- Return updated delivery record

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T038
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T041: Implement push receipt checking" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement push receipt checking: query Expo push receipts to update delivery status from "sent" to "delivered" or "failed".

## Deliverables
- Query Expo push receipts API for sent notifications
- Update delivery status to "delivered" on success
- Update delivery status to "failed" on error
- Store receipt error details for debugging
- Run as background check after dispatch

## Files
- `supabase/functions/generate-artifacts/delivery.ts`

## Dependencies
T035
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T042: Write test: PdfViewer loads remote PDF" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: PdfViewer loads a remote PDF URL and renders the first page.

## Deliverables
- Test PdfViewer component with a remote PDF URL
- Verify first page renders without error
- Verify loading state shown initially
- Verify page count displayed correctly

## Files
- `app/components/__tests__/PdfViewer.test.tsx`

## Dependencies
T031
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T043: Write test: distribution creates correct delivery records" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: distribution creates correct delivery records for mixed app/web player session.

## Deliverables
- Create a session with mixed app and web players
- Trigger distribution
- Verify push delivery records created for app players
- Verify email delivery records created for web players
- Verify all participants have delivery records

## Files
- `supabase/functions/generate-artifacts/tests/distribution.test.ts`

## Dependencies
T038
BODY
)" \
  "spec:006-artifacts,P1" \
  10

create_issue \
  "T044: Write test: resend failed delivery" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Write test: resend failed delivery creates new push/email attempt.

## Deliverables
- Create a delivery record with status "failed"
- Call resend endpoint
- Verify status reset to "pending"
- Verify new push or email attempt dispatched
- Verify sent_at timestamp updated

## Files
- `supabase/functions/generate-artifacts/tests/resend.test.ts`

## Dependencies
T040
BODY
)" \
  "spec:006-artifacts,P1" \
  10

# ============================================================
# Epic #11: Delayed Delivery & Writing Prompts (Phases 5–6: T045–T066)
# ============================================================

# --- Phase 5: US3 — Delayed Delivery (P2) ---

create_issue \
  "T045: Extend generation trigger for delayed artifacts" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Extend T022 (generation trigger): when creating delayed artifacts (A03, A07), set `scheduled_delivery_at` = session date + configured delay days, status = "queued", delivery_type = "delayed".

## Deliverables
- Detect delayed artifact types (A03 Proust's Answer, A07 Sealed Envelope)
- Set `scheduled_delivery_at` based on session date + delay configuration
- Set status to "queued" and delivery_type to "delayed"
- Skip immediate generation dispatch for delayed artifacts

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T022
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T046: Create delivery queue migration" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Create `supabase/migrations/YYYYMMDD_schedule_delivery_queue.sql`: pg_cron job that runs every 5 minutes, calls the Edge Function delivery queue processor for artifacts where `scheduled_delivery_at <= now()` and status = "queued" and delivery_type = "delayed".

## Deliverables
- Create pg_cron job running every 5 minutes
- Query artifacts with `scheduled_delivery_at <= now()`, status "queued", delivery_type "delayed"
- Call Edge Function delivery queue processor
- Include error handling for failed cron invocations

## Files
- `supabase/migrations/YYYYMMDD_schedule_delivery_queue.sql`

## Dependencies
T045
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T047: Implement per-player Proust's Answer generation" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement per-player Proust's Answer generation in the assembler: for each player who answered at least one question, assemble data matching `prousts-answer.njk` template shape (player, question, playerAnswer, proustAnswer, questionLineage, sessionDate).

## Deliverables
- Query all players who answered at least one question
- For each (player, question) pair, assemble template data
- Use proust_response_1886/1892 for direct pairing
- Use proust_adjacent_question_id for adjacent response + bridge text
- Return data matching `prousts-answer.njk` fixture shape

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
T019
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T048: Implement per-player Sealed Envelope generation" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement per-player Sealed Envelope generation in the assembler: for each player, assemble data matching `the-sealed-envelope.njk` template shape, including host reflection content if submitted.

## Deliverables
- For each player, assemble Sealed Envelope template data
- Include host reflection content if submitted
- Match `the-sealed-envelope.njk` data shape
- Handle missing host content gracefully

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
T019
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T049: Implement delivery queue processor" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement Edge Function handler for delivery queue processing: query artifacts with `scheduled_delivery_at <= now()` and status = "queued" and delivery_type = "delayed", generate each (calling Cloud Run), update status, dispatch deliveries.

## Deliverables
- Query due delayed artifacts from database
- Generate each artifact by calling Cloud Run `/render`
- Update artifact status to "ready" or "failed"
- Dispatch deliveries (push + email) for ready artifacts
- Handle partial failures gracefully

## Files
- `supabase/functions/generate-artifacts/queue-processor.ts`

## Dependencies
T046
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T050: Implement time zone handling" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement time zone handling: deliver at 10 AM in each player's local time zone (derived from participation record or session location).

## Deliverables
- Determine player's local time zone from participation record or session location
- Calculate `scheduled_delivery_at` as 10 AM in player's local time zone
- Handle time zone edge cases (DST transitions, unknown zones)
- Fall back to session location time zone if player zone unknown

## Files
- `supabase/functions/generate-artifacts/queue-processor.ts`

## Dependencies
T049
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T051: Implement retry logic for delayed delivery" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement retry logic for delayed delivery: if generation fails, retry up to 5 times over 24 hours with exponential backoff.

## Deliverables
- Retry failed delayed artifact generation up to 5 times
- Exponential backoff: 5min, 15min, 1hr, 4hr, 12hr
- Update retry_count and next_retry_at on each attempt
- Mark as permanently failed after 5 retries
- Log each retry attempt

## Files
- `supabase/functions/generate-artifacts/queue-processor.ts`

## Dependencies
T049
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T052: Write test: delayed artifact sets correct scheduled_delivery_at" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: delayed artifact creation sets correct scheduled_delivery_at.

## Deliverables
- Create a delayed artifact (A03 or A07)
- Verify scheduled_delivery_at = session date + configured delay days
- Verify delivery_type is "delayed"
- Verify status is "queued" (not immediately dispatched)

## Files
- `supabase/functions/generate-artifacts/tests/delayed-delivery.test.ts`

## Dependencies
T045
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T053: Write test: queue processor generates personalized Proust's Answer" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: queue processor generates personalized Proust's Answer for each player with correct data pairing.

## Deliverables
- Set up delayed Proust's Answer artifacts for multiple players
- Run queue processor
- Verify each player receives personalized PDF
- Verify correct question-answer pairing per player
- Verify Proust's original response included

## Files
- `supabase/functions/generate-artifacts/tests/delayed-delivery.test.ts`

## Dependencies
T049
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T054: Write test: queue processor skips future artifacts" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: queue processor skips artifacts whose scheduled_delivery_at is in the future.

## Deliverables
- Create delayed artifacts with future scheduled_delivery_at
- Run queue processor
- Verify future artifacts are not processed
- Verify only due artifacts are generated and dispatched

## Files
- `supabase/functions/generate-artifacts/tests/delayed-delivery.test.ts`

## Dependencies
T049
BODY
)" \
  "spec:006-artifacts,P2" \
  11

# --- Phase 6: US4 — Host Writing Prompts (P2) ---

create_issue \
  "T055: Extend delayed artifact creation for writing prompts" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Extend delayed artifact creation (T045): for host-written artifact types (A07 Sealed Envelope), create ArtifactWritingPrompt records with prompt text and target participant.

## Deliverables
- Detect host-written artifact types (A07 Sealed Envelope)
- Create ArtifactWritingPrompt record per target participant
- Set prompt text based on artifact type
- Link prompt to the delayed artifact record
- Set deadline based on delivery schedule

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T045
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T056: Implement writing prompt notification" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement writing prompt notification: schedule push notification for 2 days post-game night, linking to writing prompt screen.

## Deliverables
- Schedule push notification for host 2 days after game night
- Include deep link to WritingPrompt screen with prompt ID
- Notification text: prompt to write reflections for players
- Handle notification scheduling via pg_cron or delayed dispatch

## Files
- `supabase/functions/generate-artifacts/delivery.ts`

## Dependencies
T055
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T057: Implement GET /generate-artifacts/writing-prompts" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement `GET /generate-artifacts/writing-prompts`: query pending prompts for the authenticated host.

## Deliverables
- Query artifact_writing_prompts for the authenticated user
- Return pending prompts with prompt_text, target participant name, deadline
- Sort by deadline ascending (most urgent first)
- Include artifact and session metadata

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T055
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T058: Implement PUT /generate-artifacts/writing-prompts/{prompt_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement `PUT /generate-artifacts/writing-prompts/{prompt_id}`: save host content, set submitted_at, validate host identity and edit window (>24 hours before delivery).

## Deliverables
- Validate caller is the prompt's host
- Validate edit window: >24 hours before scheduled delivery
- Save host content text
- Set submitted_at timestamp
- Return 403 if not host, 409 if past edit window

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T057
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T059: Modify Sealed Envelope data assembly for host content" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Modify Sealed Envelope data assembly (T048): if host content submitted, include it; if not, check postponement logic.

## Deliverables
- Check if ArtifactWritingPrompt has submitted content
- If submitted: include host content in template data
- If not submitted: trigger postponement logic
- Pass content to `the-sealed-envelope.njk` template shape

## Files
- `supabase/functions/generate-artifacts/assembler.ts`

## Dependencies
T048, T058
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T060: Implement delivery postponement" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement delivery postponement: if host content missing at delivery time, postpone by 2 days (max 2 times), send reminder notification to host.

## Deliverables
- Check for missing host content at delivery time
- Postpone scheduled_delivery_at by 2 days
- Track postponement count (max 2)
- Send reminder push notification to host
- Reminder includes prompt deep link

## Files
- `supabase/functions/generate-artifacts/queue-processor.ts`

## Dependencies
T059
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T061: Implement fallback for missing content" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement fallback: after 2 postponements with no content, generate with default message.

## Deliverables
- After 2 postponements, stop waiting for host content
- Generate Sealed Envelope with default message template
- Default message acknowledges the game night without personal reflection
- Mark writing prompt as "expired"
- Proceed with normal delivery

## Files
- `supabase/functions/generate-artifacts/queue-processor.ts`

## Dependencies
T060
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T062: Create WritingPrompt screen" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Create `app/screens/WritingPrompt.tsx`: screen displaying prompt text with text input area, character count, save button, and deadline countdown.

## Deliverables
- Display prompt text and target participant name
- Multi-line text input area for host content
- Live character count display
- Save button (calls PUT /writing-prompts/{prompt_id})
- Deadline countdown timer
- Unsaved changes warning on back navigation

## Files
- `app/screens/WritingPrompt.tsx`

## Dependencies
T057
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T063: Handle deep link from writing prompt notification" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Handle deep link from writing prompt notification: navigate directly to WritingPrompt screen with the prompt ID.

## Deliverables
- Register deep link handler for writing prompt notifications
- Extract prompt ID from notification data payload
- Navigate to WritingPrompt screen with prompt ID parameter
- Handle cold start (app not running) deep link

## Files
- `app/navigation/deepLinkHandler.ts`

## Dependencies
T062
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T064: Write test: writing prompt created for A07" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: writing prompt created when A07 delayed artifact is queued.

## Deliverables
- Trigger generation for a Murder Mystery session
- Verify ArtifactWritingPrompt records created for A07
- Verify one prompt per target participant
- Verify prompt text and deadline set correctly

## Files
- `supabase/functions/generate-artifacts/tests/writing-prompts.test.ts`

## Dependencies
T055
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T065: Write test: submitted content appears in Sealed Envelope PDF" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: submitted content appears in generated Sealed Envelope PDF.

## Deliverables
- Submit host content via PUT /writing-prompts/{prompt_id}
- Trigger Sealed Envelope generation
- Verify submitted content included in template data
- Verify PDF generated with host reflection content

## Files
- `supabase/functions/generate-artifacts/tests/writing-prompts.test.ts`

## Dependencies
T059
BODY
)" \
  "spec:006-artifacts,P2" \
  11

create_issue \
  "T066: Write test: delivery postponed when host content missing" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P2 | **Estimate**: Medium

## Description
Write test: delivery postponed when host content missing, up to 2 times.

## Deliverables
- Create A07 artifact with no host content submitted
- Run queue processor at scheduled delivery time
- Verify delivery postponed by 2 days
- Verify reminder notification sent to host
- Verify max 2 postponements, then fallback triggers

## Files
- `supabase/functions/generate-artifacts/tests/writing-prompts.test.ts`

## Dependencies
T060
BODY
)" \
  "spec:006-artifacts,P2" \
  11

# ============================================================
# Epic #12: Artifact Library & Polish (Phases 7–8: T067–T084)
# ============================================================

# --- Phase 7: US5 — Personal Artifact Library (P3) ---

create_issue \
  "T067: Implement GET /generate-artifacts/library" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Implement `GET /generate-artifacts/library`: query artifact_deliveries joined with artifacts and sessions for the authenticated user, return LibraryEntry objects sorted by received_at descending, with pagination (limit/offset).

## Deliverables
- Join artifact_deliveries with artifacts and sessions tables
- Filter by authenticated user's deliveries
- Return LibraryEntry objects: artifact name, session name, game type, date, thumbnail indicator
- Sort by received_at descending
- Pagination via limit/offset query params

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
Phase 4 (T031-T044)
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T068: Add game_type filter parameter" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Add game_type filter parameter to the library endpoint: join sessions table to filter by game_type column.

## Deliverables
- Add optional `game_type` query parameter to GET /library
- Join sessions table to filter by game_type
- Support values: "confession_album", "murder_mystery"
- Return all types when parameter omitted

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T067
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T069: Implement GET /generate-artifacts/download/{artifact_id}" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Implement `GET /generate-artifacts/download/{artifact_id}`: validate user is a participant, generate presigned URL (30-day expiry), return URL and expiry timestamp.

## Deliverables
- Validate authenticated user is a session participant
- Generate presigned download URL via Supabase Storage
- Set 30-day expiry on presigned URL
- Return URL and expiry timestamp
- Return 403 if user is not a participant

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T067
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T070: Create ArtifactLibrary screen" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Create `app/screens/ArtifactLibrary.tsx`: screen with flat list of LibraryEntry cards, each showing artifact name, session name, game type badge, date, and thumbnail (first-page preview or icon).

## Deliverables
- Create ArtifactLibrary screen with FlatList
- LibraryEntry cards showing: artifact name, session name, game type badge, date
- Thumbnail display (first-page preview or game type icon)
- Tap card to navigate to ArtifactPreview
- Pull-to-refresh and infinite scroll pagination
- Empty state for no artifacts

## Files
- `app/screens/ArtifactLibrary.tsx`

## Dependencies
T067
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T071: Add game type filter chips" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Add game type filter chips at top of library screen (All, Confession Album, Murder Mystery).

## Deliverables
- Add horizontal chip row at top of ArtifactLibrary screen
- Filter options: All, Confession Album, Murder Mystery
- Active chip visually highlighted
- Selecting a chip re-fetches library with game_type filter
- Maintain scroll position when switching filters

## Files
- `app/screens/ArtifactLibrary.tsx`

## Dependencies
T070
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T072: Add share button to ArtifactPreview" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Add share button to ArtifactPreview screen: download PDF to temp file, open system share sheet.

## Deliverables
- Add share button to ArtifactPreview header
- Download PDF to temporary file location
- Open system share sheet via React Native Share API
- Handle download errors with user feedback
- Clean up temp file after sharing

## Files
- `app/screens/ArtifactPreview.tsx`

## Dependencies
T032
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T073: Web player account linking" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
When a user creates an account, query artifact_deliveries for web player participations with matching email, update participant's user_id to link artifacts to the new account.

## Deliverables
- On account creation, query artifact_deliveries by email
- Update matching delivery records with new user_id
- Link previously-delivered artifacts to the new account
- Handle multiple sessions with same email
- Run as post-signup hook or trigger

## Files
- `supabase/functions/generate-artifacts/account-linking.ts`

## Dependencies
T067
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T074: Write test: library returns artifacts from multiple sessions" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Write test: library returns artifacts from multiple sessions for a user.

## Deliverables
- Create delivery records across multiple sessions for one user
- Call GET /library
- Verify all artifacts returned sorted by received_at descending
- Verify pagination works correctly

## Files
- `supabase/functions/generate-artifacts/tests/library.test.ts`

## Dependencies
T067
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T075: Write test: game_type filter works" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Write test: game_type filter returns only matching artifacts.

## Deliverables
- Create delivery records for both Confession Album and Murder Mystery sessions
- Call GET /library?game_type=confession_album
- Verify only Confession Album artifacts returned
- Call GET /library?game_type=murder_mystery
- Verify only Murder Mystery artifacts returned

## Files
- `supabase/functions/generate-artifacts/tests/library.test.ts`

## Dependencies
T068
BODY
)" \
  "spec:006-artifacts,P3" \
  12

create_issue \
  "T076: Write test: web player artifacts linked after account creation" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P3 | **Estimate**: Medium

## Description
Write test: web player artifacts linked after account creation.

## Deliverables
- Create delivery records for a web player email
- Create a new account with that email
- Verify delivery records updated with new user_id
- Verify artifacts appear in new user's library

## Files
- `supabase/functions/generate-artifacts/tests/library.test.ts`

## Dependencies
T073
BODY
)" \
  "spec:006-artifacts,P3" \
  12

# --- Phase 8: Polish (P1) ---

create_issue \
  "T077: Add structured logging to Cloud Run service" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Add structured logging to Cloud Run service: log template name, generation duration, file size, errors.

## Deliverables
- Add structured JSON logging to all render operations
- Log: template name, generation duration (ms), file size (bytes), page count
- Log errors with stack traces and context
- Use Cloud Run-compatible log format (severity, timestamp, message)
- Log request ID for tracing

## Files
- `services/artifact-generator/src/logger.ts`
- `services/artifact-generator/src/server.ts`

## Dependencies
All user stories (T001-T076)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T078: Add error handling middleware to Edge Function" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Add error handling middleware to Edge Function: catch and format all errors with consistent Error schema.

## Deliverables
- Create error handling middleware for all Edge Function routes
- Consistent Error schema: `{ error: { code, message, details } }`
- Map known errors to appropriate HTTP status codes
- Catch unhandled errors with 500 response
- Include request ID in error responses

## Files
- `supabase/functions/generate-artifacts/middleware.ts`
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
All user stories (T001-T076)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T079: Implement storage cleanup job" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement storage cleanup job: pg_cron weekly job to delete files for sessions archived >90 days.

## Deliverables
- Create pg_cron weekly job (e.g., Sundays at 3 AM UTC)
- Query artifacts for sessions archived more than 90 days ago
- Delete corresponding files from Supabase Storage
- Update artifact records (clear file_url, set status to "expired")
- Log cleanup results (files deleted, space reclaimed)

## Files
- `supabase/migrations/YYYYMMDD_storage_cleanup_cron.sql`

## Dependencies
All user stories (T001-T076)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T080: Add generation metrics" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Add generation metrics: track p50/p95 generation times per template type.

## Deliverables
- Record generation duration for each render operation
- Calculate p50 and p95 generation times per template type
- Store metrics in database or structured logs
- Expose metrics via GET /health endpoint
- Alert if p95 exceeds 30s threshold

## Files
- `services/artifact-generator/src/metrics.ts`
- `services/artifact-generator/src/server.ts`

## Dependencies
All user stories (T001-T076)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T081: Add rate limiting to generation endpoint" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Add rate limiting to generation endpoint: max 1 concurrent generation per session (prevent duplicate triggers).

## Deliverables
- Check for existing "queued" or "generating" artifacts for the session
- Reject duplicate generation requests with 409 Conflict
- Use database advisory lock or status check
- Return existing artifact statuses when generation already in progress

## Files
- `supabase/functions/generate-artifacts/index.ts`

## Dependencies
T022
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T082: Verify all fixtures render correctly" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Verify all fixtures render correctly: run `npx ts-node src/cli.ts --all` in the Cloud Run container to validate template rendering before deployment.

## Deliverables
- Run `npx ts-node src/cli.ts --all` in Cloud Run container
- Verify all 6 P0 templates render without errors
- Verify output PDFs are valid and within size limits
- Add as CI check or pre-deployment validation step
- Document any template-specific rendering requirements

## Files
- `services/artifact-generator/scripts/validate-templates.sh`

## Dependencies
All user stories (T001-T076)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T083: Run quickstart.md validation scenarios end-to-end" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Run quickstart.md validation scenarios end-to-end to verify the complete artifact pipeline works as documented.

## Deliverables
- Execute all quickstart.md validation scenarios
- Verify: trigger generation, check status, preview PDF, distribute, check deliveries
- Verify delayed delivery flow end-to-end
- Verify writing prompt flow end-to-end
- Verify library browsing and filtering
- Document any deviations or issues

## Files
- `specs/006-artifact-pipeline/quickstart.md` (validation reference)

## Dependencies
All prior tasks (T001-T082)
BODY
)" \
  "spec:006-artifacts,P1" \
  12

create_issue \
  "T084: Update CLAUDE.md with artifact pipeline docs" \
  "$(cat <<'BODY'
**Spec**: 006 | **Priority**: P1 | **Estimate**: Medium

## Description
Update `CLAUDE.md` with artifact pipeline architecture and deployment instructions.

## Deliverables
- Document Cloud Run service architecture and endpoints
- Document Edge Function routes and handlers
- Document database schema and RLS policies
- Add deployment instructions (Docker build, Cloud Run deploy, Supabase migrations)
- Add local development setup (docker compose with local Supabase)
- Document the generation flow from trigger to delivery

## Files
- `CLAUDE.md`

## Dependencies
All prior tasks (T001-T083)
BODY
)" \
  "spec:006-artifacts,P1" \
  12
