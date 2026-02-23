# Implementation Plan: 006 Artifact Generation Pipeline

**Branch**: `006-artifact-pipeline` | **Date**: 2026-02-23 | **Spec**: `specs/006-artifact-pipeline/spec.md`
**Input**: Feature specification from `specs/006-artifact-pipeline/spec.md`

## Summary

Wrap the existing `artifacts/src/render.ts` Nunjucks + Puppeteer rendering pipeline into a server-side HTTP service, add Supabase Storage for generated PDFs, implement immediate and delayed delivery flows (push + email), host writing prompts for delayed artifacts, in-app PDF viewing, delivery tracking, and a personal artifact library. The key architectural decision is how to run Puppeteer server-side, since Supabase Edge Functions run on Deno and cannot spawn headless Chrome.

## Technical Context

**Language/Version**: TypeScript 5.x (existing), Node.js 22+ (existing pipeline)
**Primary Dependencies**: Nunjucks 3.2.x (existing), Puppeteer 23.x (existing), Supabase JS SDK, Resend (email), Expo Notifications (push), react-native-pdf (viewer), Inngest or pg_cron (scheduler)
**Storage**: Supabase PostgreSQL (metadata), Supabase Storage (PDF files, S3-compatible)
**Testing**: Vitest (unit + integration), fixture-driven rendering tests against existing `artifacts/fixtures/`
**Target Platform**: Cloud Run (generation service), React Native + Expo (mobile client), Supabase (backend)
**Project Type**: Service + Mobile integration
**Performance Goals**: <30 seconds per artifact generation, <3 seconds PDF viewer load
**Constraints**: Puppeteer requires headless Chrome (cannot run on Deno/Edge Functions); one of the 3 allowed Edge Functions budget; 16GB memory constraint on dev machine
**Scale/Scope**: ~100 sessions/week at launch, 7 artifact types (6 server-rendered, 1 client-side)

## Constitution Check

### Simplicity Gate

- [x] Total server-side services <=3? YES -- Artifact generation is one of the 3 Edge Functions/services. Implemented as a single Cloud Run service wrapping existing render.ts. Supabase Edge Function acts as a thin proxy/trigger.
- [x] No speculative "might need" features? YES -- Only implementing A01-A07 (P0 artifacts for the two launch games). No print-on-demand, no artifact versioning, no A06 Society Page camera composite (client-side, separate concern).
- [x] Using framework primitives directly? YES -- Supabase Storage API directly, Expo Notifications directly, no abstraction layers over Puppeteer.
- [x] No premature abstractions or repository patterns? YES -- The render.ts functions are called directly. No ORM, no repository layer. Direct Supabase client calls.
- [x] Single database schema (Supabase PostgreSQL)? YES -- All metadata in Supabase. Storage in Supabase Storage buckets.

### Offline Gate

- [x] All game night features work without network connectivity? N/A -- Artifact generation is post-game (COMPLETE state), which requires connectivity.
- [x] Local database holds complete session state during ACTIVE? N/A -- This spec operates post-ACTIVE.
- [x] No network requests during game night phase? YES -- No artifact operations during game night.
- [x] Sync is eventual and non-blocking? YES -- Artifact delivery is async. If player is offline, push notification queues.
- [x] Dashboard operates entirely from local data? N/A -- Post-game screens, not game night dashboard.

### Privacy Gate

- [x] No data leaves the session boundary without explicit consent? YES -- Artifacts are scoped to session participants via RLS. Download URLs are time-limited and session-scoped.
- [x] No cross-session data sharing or aggregation? YES -- Each artifact belongs to exactly one session. The library view reads artifacts per-user but never aggregates across users.
- [x] No public profiles or social features? YES -- Artifact library is private per user.
- [x] Player contributions scoped to session participants only? YES -- Template data drawn from session records, accessible only to participants.
- [x] Minimal data retention policy enforced? YES -- Artifacts cleaned after 90 days post-archive.

### Analog Gate

- [x] No feature replaces in-room human interaction? YES -- Artifacts are post-game only.
- [x] Game night UI is ambient and glanceable? N/A -- Post-game screens.
- [x] Screen-dark principle respected? N/A -- Post-game.
- [x] All game-night player interactions happen in the room? N/A -- Post-game.
- [x] Timer is optional, never forced? N/A -- Post-game.

## Key Architecture Decision: Puppeteer Server-Side

**Problem**: Supabase Edge Functions run on Deno Deploy and cannot execute Puppeteer (no headless Chrome available). The existing `render.ts` pipeline requires Node.js + Puppeteer.

**Decision**: Deploy a lightweight Node.js service on Google Cloud Run that wraps `render.ts`.

**Why Cloud Run**:
1. Runs arbitrary Docker containers (Node.js + Chromium is well-supported)
2. Scales to zero when not in use (pay only for generation time)
3. Cold start ~2-5 seconds (acceptable for post-game, non-real-time use)
4. Memory/CPU configurable (Puppeteer needs ~512MB-1GB)
5. Direct integration with Supabase Storage via service account
6. Existing Docker images for Puppeteer on Cloud Run (e.g., `ghcr.io/puppeteer/puppeteer`)

**Flow**:
```
Mobile App                Supabase Edge Function         Cloud Run Service
    |                            |                            |
    |-- POST /generate -------->|                            |
    |                            |-- validate + enqueue ----->|
    |                            |                            |-- renderPDF()
    |                            |                            |-- upload to Storage
    |                            |<--- status: ready ---------|
    |<-- push notification ------|                            |
```

**Alternatives rejected**:
- Browserless.io: External dependency, usage-based pricing, network latency for PDF upload. Overkill for our scale.
- Railway/Render: Similar to Cloud Run but less GCP integration. Cloud Run's scale-to-zero is better for bursty workloads.
- Client-side generation (react-native-html-to-pdf): Poor typography control, inconsistent rendering, large app binary.

## Integration Plan with Existing Code

The `artifacts/` directory contains production-quality rendering code. The integration strategy is to **import, not rewrite**.

1. **Package `artifacts/` as a library**: Add an `index.ts` that exports `renderPDF`, `renderHTML`, `getTemplateInfo`, `getAllTemplateNames` from `render.ts`. No code changes to render.ts itself.

2. **Cloud Run service**: A thin HTTP handler that:
   - Receives `{ templateName, data }` payloads
   - Calls `renderPDF()` from the imported library
   - Uploads the resulting PDF to Supabase Storage
   - Returns `{ fileUrl, pageCount, sizeBytes }`

3. **Supabase Edge Function** (thin trigger): Validates the request, creates the Artifact record in the database, calls the Cloud Run service, updates the record on completion, and dispatches notifications. This counts as one of the 3 allowed Edge Functions.

4. **Templates and design system**: Bundled into the Cloud Run Docker image alongside the service code. No changes to templates or CSS.

## Project Structure

### Documentation (this feature)

```
specs/006-artifact-pipeline/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology research
├── data-model.md        # Entity definitions + Supabase schema
├── contracts/
│   └── openapi.yaml     # API contracts
├── quickstart.md        # Validation scenarios
├── tasks.md             # Implementation task list
└── checklists/
    └── requirements.md  # Requirements checklist
```

### Source Code

```
# Cloud Run artifact generation service
services/artifact-generator/
├── Dockerfile               # Node.js + Chromium image
├── package.json             # Dependencies (inherits from artifacts/)
├── tsconfig.json
├── src/
│   ├── server.ts            # HTTP handler (Fastify or Express)
│   ├── generate.ts          # Orchestrator: assemble data -> render -> upload
│   └── storage.ts           # Supabase Storage upload helper
├── tests/
│   ├── generate.test.ts     # Generation pipeline tests
│   └── fixtures/            # Symlink to artifacts/fixtures/
└── artifacts/               # Git subtree or symlink to artifacts/ directory
    ├── src/render.ts         # EXISTING — imported, not modified
    ├── templates/            # EXISTING — bundled into Docker image
    └── design-system/        # EXISTING — bundled into Docker image

# Supabase Edge Function (trigger + orchestration)
supabase/functions/generate-artifacts/
├── index.ts                 # Deno handler: validate, enqueue, notify
└── types.ts                 # Shared types

# Mobile client additions
app/
├── screens/
│   ├── ArtifactPreview.tsx   # PDF viewer screen
│   ├── ArtifactLibrary.tsx   # Personal collection view
│   ├── DistributionStatus.tsx # Delivery tracking
│   └── WritingPrompt.tsx     # Host writing prompt screen
├── services/
│   ├── artifactService.ts    # API calls to generate/list/download artifacts
│   └── deliveryService.ts    # Push notification + email delivery orchestration
└── components/
    └── PdfViewer.tsx          # Wrapper around react-native-pdf

# Database migrations
supabase/migrations/
├── YYYYMMDD_create_artifacts.sql
├── YYYYMMDD_create_artifact_deliveries.sql
└── YYYYMMDD_create_artifact_writing_prompts.sql
```

**Structure Decision**: The three-tier architecture (Cloud Run service + Supabase Edge Function + mobile client) is necessary because Puppeteer cannot run on Deno. The Cloud Run service is a stateless renderer; the Edge Function is the coordinator; the mobile client is the consumer. This uses one of the 3 allowed server-side services per the Simplicity Gate.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| External Cloud Run service (not just Supabase Edge Function) | Puppeteer requires Node.js + headless Chrome, which cannot run in Deno-based Edge Functions | Client-side PDF generation has poor typography; Browserless adds external dependency and cost; there is no way to run Puppeteer in Deno |
