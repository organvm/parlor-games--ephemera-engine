# Requirements Checklist: 006 Artifact Generation Pipeline

Traceability matrix mapping functional requirements to user stories, tasks, and validation scenarios.

---

## Generation Pipeline

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-001 | Wrap existing `render.ts` into server-callable HTTP service | P0 | US-001 | T014, T015, T016 | Quickstart 1 |
| FR-002 | Accept generation request with session_id, template_name, data payload | P0 | US-001 | T016, T022 | Quickstart 1 |
| FR-003 | Assemble template data from session records | P0 | US-001 | T019, T020, T021 | Quickstart 1, 2 |
| FR-004 | Render HTML using existing Nunjucks environment with all filters | P0 | US-001 | T015 (imports render.ts) | T027, T028 |
| FR-005 | Inline CSS from design system using existing `inlineCSS()` | P0 | US-001 | T015 (imports render.ts) | T027, T028 |
| FR-006 | Render PDF via Puppeteer with existing configuration | P0 | US-001 | T015 (imports render.ts) | T027, T028 |
| FR-007 | Complete generation in <30 seconds per artifact | P0 | US-001 | T015, T016 | Quickstart 1 |
| FR-008 | Produce print-ready PDFs with correct typography | P0 | US-001 | T018 (fonts in Docker) | Quickstart 1 |
| FR-009 | Limit file size to <5MB per artifact | P0 | US-001 | T015 (size check) | T027, T028 |
| FR-010 | Support batch generation (multiple artifacts per request) | P0 | US-001 | T022, T024 | Quickstart 1 |

## Storage

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-011 | Upload PDFs to Supabase Storage with CDN URLs | P0 | US-001 | T012, T014 | Quickstart 1 |
| FR-012 | Generate time-limited download URLs (30 days) | P0 | US-002 | T036, T069 | Quickstart 1 |
| FR-013 | Enforce per-session storage quotas (50MB) | P1 | US-001 | T079 | -- |
| FR-014 | Clean up storage for archived sessions >90 days | P1 | US-005 | T079 | -- |

## Delivery

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-015 | Deliver to app players via push notification | P0 | US-002 | T035, T038 | Quickstart 1 |
| FR-016 | Deliver to web players via email | P0 | US-002 | T036, T037, T038 | Quickstart 1 |
| FR-017 | Track delivery status per recipient | P0 | US-002 | T039 | Quickstart 1 |
| FR-018 | Retry failed deliveries (3 retries, exponential backoff) | P0 | US-002 | T040, T041 | Quickstart 6 |
| FR-019 | Deliver within 5 minutes of generation completing | P0 | US-002 | T035, T036 | Quickstart 1 |

## Delayed Delivery

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-020 | Schedule delayed delivery (default 7d, range 3-14d) | P0 | US-003 | T045 | Quickstart 3 |
| FR-021 | Deliver at 10 AM in recipient's local time zone | P0 | US-003 | T050 | Quickstart 3 |
| FR-022 | Deliver within 1 hour of scheduled time | P0 | US-003 | T046, T049 | Quickstart 3 |
| FR-023 | Generate personalized delayed artifacts per player | P0 | US-003 | T047, T048 | Quickstart 3 |
| FR-024 | Send host writing prompt 2 days post-game | P0 | US-004 | T055, T056 | Quickstart 4 |
| FR-025 | Postpone delivery if host content missing (max 2x) | P0 | US-004 | T060 | T066 |
| FR-026 | Generate with default message if host never writes | P0 | US-004 | T061 | T066 |

## Preview and Library

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-027 | Display PDFs in-app with scroll and pinch-to-zoom | P0 | US-002 | T031, T032 | Quickstart 1 |
| FR-028 | Load PDF viewer within 3 seconds | P0 | US-002 | T031 | T042 |
| FR-029 | Maintain personal artifact library per user | P0 | US-005 | T067, T070 | Quickstart 5 |
| FR-030 | Support filtering library by game type | P1 | US-005 | T068, T071 | T075 |
| FR-031 | Support download/share via system share sheet | P0 | US-005 | T072 | Quickstart 5 |
| FR-032 | Link web player artifacts on account creation | P1 | US-005 | T073 | T076 |

## Artifact Catalog (V1)

| ID | Requirement | Priority | User Story | Tasks | Validated By |
|----|-------------|----------|------------|-------|-------------|
| FR-033 | Support A01 (The Album) | P0 | US-001 | T020, T027 | Quickstart 1 |
| FR-034 | Support A02 (Contributions Table), auto with A01 | P0 | US-001 | T020, T024 | Quickstart 1 |
| FR-035 | Support A03 (Proust's Answer), delayed, personalized | P0 | US-003 | T047 | Quickstart 3 |
| FR-036 | Support A04 (The Dossier) | P0 | US-001 | T021, T028 | Quickstart 2 |
| FR-037 | Support A05 (Menu of the Damned), auto with A04 | P0 | US-001 | T021, T024 | Quickstart 2 |
| FR-038 | Support A07 (The Sealed Envelope), delayed, personalized | P0 | US-003 | T048, T055 | Quickstart 4 |
| FR-039 | Support A06 (Society Page Photo), client-side | P1 | -- | -- | -- |

---

## Constitution Compliance

| Gate | Status | Notes |
|------|--------|-------|
| Simplicity Gate | PASS | One Cloud Run service + one Edge Function = 1 of 3 allowed services. No premature abstractions. Direct Supabase client calls. |
| Offline Gate | PASS (N/A) | Artifact pipeline operates post-game only. No game night dependencies. |
| Privacy Gate | PASS | Artifacts scoped to session participants via RLS. Personalized artifacts restricted to individual. 90-day retention. No cross-session aggregation. |
| Analog Gate | PASS (N/A) | All artifact features are post-game. No game night UI. |

---

## Coverage Summary

| Category | Total | P0 | P1 | Covered by Tasks | Covered by Tests |
|----------|-------|----|----|-----------------|-----------------|
| Generation Pipeline | 10 | 10 | 0 | 10/10 | 10/10 |
| Storage | 4 | 2 | 2 | 4/4 | 2/4 |
| Delivery | 5 | 5 | 0 | 5/5 | 5/5 |
| Delayed Delivery | 7 | 7 | 0 | 7/7 | 7/7 |
| Preview and Library | 6 | 4 | 2 | 6/6 | 6/6 |
| Artifact Catalog | 7 | 6 | 1 | 6/7 | 6/7 |
| **Total** | **39** | **34** | **5** | **38/39** | **36/39** |

Uncovered: FR-013 (storage quotas), FR-014 (storage cleanup) -- P1, deferred to Phase 8 polish. FR-039 (Society Page Photo) -- client-side camera feature, separate from server pipeline.
