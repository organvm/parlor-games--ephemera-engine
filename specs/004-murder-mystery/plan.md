# Implementation Plan: Murder Mystery Game Module

**Branch**: `004-murder-mystery` | **Date**: 2026-02-23 | **Spec**: `specs/004-murder-mystery/spec.md`
**Input**: Feature specification from `specs/004-murder-mystery/spec.md`

## Summary

Implement the Murder Mystery game module: server-side setting seed generation via Claude API, character sheet delivery with contribution briefs, offline-capable three-act game night dashboard, digital accusation and awards voting, and four post-game artifact types (The Dossier, Menu of the Damned, Society Page, The Sealed Envelope). The module extends the shared session/contribution/artifact infrastructure from specs 001, 002, 005, and 006.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React Native + Expo (mobile), Supabase (auth, realtime, storage, edge functions), Nunjucks + Puppeteer (artifact rendering), Claude API (Anthropic SDK)
**Storage**: PostgreSQL (Supabase), WatermelonDB or Expo SQLite (local offline), Supabase Storage (artifact PDFs)
**Testing**: Vitest (unit/integration), Maestro or Detox (E2E mobile)
**Target Platform**: iOS + Android (React Native), Mobile Web (web players)
**Project Type**: Mobile + API (Edge Functions)
**Performance Goals**: Seed generation <15s, artifact generation <30s, dashboard load <1s
**Constraints**: Offline game night (zero network during ACTIVE), <5MB per artifact PDF, ≤3 Supabase Edge Functions total (constitution), no data leaks across sessions
**Scale/Scope**: 6–12 players per session, ~15 screens (Murder Mystery-specific), 4 artifact templates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Simplicity Gate

- [x] Total server-side services ≤3? — Yes. Uses 2 Edge Functions: (1) `generate-seed` (Claude API proxy), (2) `render-artifact` (shared with all games). The third slot is reserved for the shared notification function from spec 002.
- [x] No speculative "might need" features? — Yes. Society Page Photo is deferred to P1. No multi-device host, no real-time player sync during game night.
- [x] Using framework primitives directly (not wrapped)? — Yes. Supabase client used directly; Expo APIs (notifications, camera, filesystem) used without abstraction layers.
- [x] No premature abstractions or repository patterns? — Yes. Direct Supabase queries from React hooks; no ORM or repository pattern.
- [x] Single database schema (Supabase PostgreSQL)? — Yes. MurderMysteryData stored as JSONB in the Session.config column.

### Offline Gate

- [x] All game night features work without network connectivity? — Yes. Dashboard, clue tracker, accusation form, voting all operate from local DB.
- [x] Local database holds complete session state during ACTIVE? — Yes. Full session data (characters, clues, crime, settings) synced to local DB on PREPARING → ACTIVE transition.
- [x] No network requests required during game night phase? — Yes. All reads from local DB; writes queued for eventual sync.
- [x] Sync is eventual and non-blocking? — Yes. Local changes sync to Supabase when connectivity resumes post-game.
- [x] Dashboard operates entirely from local data? — Yes. Emergency reference, phase controls, checklists all local.

### Privacy Gate

- [x] No data leaves the session boundary without explicit consent? — Yes. All character data, accusations, and contributions scoped to session participants.
- [x] No cross-session data sharing or aggregation? — Yes. Each Murder Mystery scenario is an isolated session.
- [x] No public profiles or social features? — Yes. No social sharing, no public profiles.
- [x] Player contributions scoped to session participants only? — Yes. Preparation answers, accusations, and votes visible only to session members.
- [x] Minimal data retention policy enforced? — Yes. Session data retained for 90 days post-archive, then purged.

### Analog Gate

- [x] No feature replaces in-room human interaction? — Yes. The dashboard is a host tool; players interact in the room, not through the app.
- [x] Game night UI is ambient and glanceable, not attention-demanding? — Yes. Dark ambient mode, large touch targets, minimal text.
- [x] Screen-dark principle respected? — Yes. Only the host uses the dashboard; players use phones only for optional accusation/voting.
- [x] All game-night player interactions happen in the room, not through the app? — Yes. Investigation, interrogation, and discussion are analog. Digital accusation is optional.
- [x] Timer is optional, never forced? — Yes. Interrogation timer is off by default; host opts in.

## Project Structure

### Documentation (this feature)

```
specs/004-murder-mystery/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology research
├── data-model.md        # Entity definitions and schema
├── quickstart.md        # Key validation scenarios
├── tasks.md             # Implementation task list
├── contracts/
│   └── openapi.yaml     # API contracts
└── checklists/
    └── requirements.md  # Requirements checklist
```

### Source Code (repository root)

```
src/
├── features/
│   └── murder-mystery/
│       ├── screens/
│       │   ├── SettingSeedBrowserScreen.tsx    # Curated seed browsing
│       │   ├── SettingSeedGeneratorScreen.tsx  # 4-axis generation UI
│       │   ├── ScenarioReviewScreen.tsx        # Generated scenario review/edit
│       │   ├── CharacterCustomizationScreen.tsx # Edit characters
│       │   ├── CharacterPacketScreen.tsx       # Player: sealed envelope character reveal
│       │   ├── ThreeActDashboardScreen.tsx     # Host: game night dashboard
│       │   ├── ClueDistributionScreen.tsx      # Host: clue tracker (overlay/tab)
│       │   ├── AccusationFormScreen.tsx        # Player: submit accusation
│       │   ├── RevealScreen.tsx                # Host: solution display
│       │   ├── AwardsVotingScreen.tsx          # Player: vote on awards
│       │   ├── EpilogueWritingScreen.tsx       # Host: write Sealed Envelope content
│       │   └── SocietyPageCameraScreen.tsx     # Player: photo overlay (P1)
│       ├── components/
│       │   ├── SettingSeedCard.tsx             # Curated seed preview card
│       │   ├── CharacterEntry.tsx             # Character display in roster
│       │   ├── ClueChecklistItem.tsx          # Clue distribution checkbox
│       │   ├── AccusationBlock.tsx            # Accusation display for reveal
│       │   ├── ActProgressIndicator.tsx       # Three-act progress bar
│       │   └── AwardCategoryCard.tsx          # Voting card for each award
│       ├── hooks/
│       │   ├── useSettingSeed.ts              # Seed CRUD and generation
│       │   ├── useCharacters.ts              # Character management
│       │   ├── useGameNight.ts               # Dashboard state and act progression
│       │   ├── useClues.ts                   # Clue distribution state
│       │   ├── useAccusations.ts             # Accusation submission and retrieval
│       │   └── useAwards.ts                  # Voting state
│       ├── services/
│       │   ├── seedGenerationService.ts      # Claude API call via Edge Function
│       │   └── murderMysteryArtifactService.ts # Artifact data assembly
│       ├── types/
│       │   └── murder-mystery.ts             # TypeScript interfaces
│       └── utils/
│           ├── scenarioValidation.ts         # Validate generated scenario consistency
│           └── clueDistribution.ts           # Clue ordering helpers
├── shared/
│   ├── db/
│   │   └── local/
│   │       └── murder-mystery-schema.ts      # WatermelonDB/SQLite local schema
│   └── services/
│       └── offlineSync.ts                    # Offline queue and sync (shared)

supabase/
├── functions/
│   ├── generate-seed/
│   │   └── index.ts                          # Claude API proxy Edge Function
│   └── render-artifact/
│       └── index.ts                          # Shared artifact rendering (from spec 006)
├── migrations/
│   └── 004_murder_mystery_config.sql         # Supabase schema additions (if needed beyond JSONB)
└── seed/
    └── curated-seeds.sql                     # 5+ bundled curated scenarios

artifacts/
├── templates/
│   └── murder-mystery/
│       ├── the-dossier.njk                   # Existing template
│       ├── menu-of-the-damned.njk            # Existing template
│       └── the-sealed-envelope.njk           # Existing template
├── fixtures/
│   └── murder-mystery.json                   # Existing fixture data
└── src/
    └── render.ts                             # Existing render pipeline

tests/
├── unit/
│   ├── scenarioValidation.test.ts
│   ├── clueDistribution.test.ts
│   └── murderMysteryTypes.test.ts
├── integration/
│   ├── seedGeneration.test.ts
│   ├── characterDelivery.test.ts
│   ├── gameNightDashboard.test.ts
│   └── artifactGeneration.test.ts
└── e2e/
    ├── murderMysteryFlow.test.ts             # Maestro/Detox full flow
    └── offlineGameNight.test.ts              # Offline mode validation
```

**Structure Decision**: Mobile + API pattern. Feature code in `src/features/murder-mystery/` following feature-module organization. Supabase Edge Functions in `supabase/functions/`. Existing artifact templates in `artifacts/templates/murder-mystery/` are consumed by the shared rendering pipeline.

## Data Flow Diagrams

### Setting Seed Generation

```
┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌───────────┐
│   Host   │───>│  Seed Gen    │───>│  Supabase Edge   │───>│  Claude   │
│  Device  │    │  Screen      │    │  Function         │    │  API      │
│          │<───│  (React)     │<───│  generate-seed    │<───│           │
└──────────┘    └──────────────┘    └──────────────────┘    └───────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Supabase    │
              │  Session     │
              │  (config     │
              │   JSONB)     │
              └──────────────┘
```

### Game Night Offline Architecture

```
┌─────────────────────────────────────────────────────┐
│                    HOST DEVICE                       │
│                                                     │
│  ┌───────────────┐    ┌──────────────────────┐     │
│  │  Three-Act    │───>│  Local DB            │     │
│  │  Dashboard    │<───│  (WatermelonDB/      │     │
│  │               │    │   SQLite)            │     │
│  └───────────────┘    │                      │     │
│                       │  - characters[]      │     │
│  ┌───────────────┐    │  - clues[]           │     │
│  │  Emergency    │───>│  - crime             │     │
│  │  Reference    │    │  - act_timestamps[]  │     │
│  └───────────────┘    │  - accusations[]     │     │
│                       │  - awards[]          │     │
│                       └──────────┬───────────┘     │
│                                  │                  │
└──────────────────────────────────│──────────────────┘
                                   │ (when online)
                                   ▼
                           ┌──────────────┐
                           │  Supabase    │
                           │  PostgreSQL  │
                           └──────────────┘
```

### Artifact Generation Pipeline

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐     ┌───────────┐
│  Host    │────>│  "Generate   │────>│  Supabase Edge   │────>│  Supabase │
│  taps    │     │  Artifacts"  │     │  render-artifact  │     │  Storage  │
│  button  │     │  (client)    │     │                  │     │  (CDN)    │
│          │<────│              │<────│  1. Assemble data│     │           │
└──────────┘     └──────────────┘     │  2. Nunjucks     │     └───────────┘
                                      │     render       │
                                      │  3. Puppeteer    │
                                      │     HTML→PDF     │
                                      │  4. Upload to    │
                                      │     storage      │
                                      └──────────────────┘
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Claude API generates inconsistent scenarios | High — breaks game | Medium | Server-side validation rules; auto-retry up to 3 times; structured prompts with examples |
| Claude API latency exceeds 15s | Medium — poor UX | Low | Loading UI with progress; timeout at 30s with retry option; fallback to curated seeds |
| Claude API outage | Medium — blocks seed generation only | Low | Curated seeds always available locally; clear messaging to host |
| Offline data loss during game night | Critical | Low | Local DB persistence; auto-save on every state change; battery warning prompt |
| Artifact rendering fails (Puppeteer timeout) | High — no artifacts | Low | Retry logic; fallback to simplified template; async queue with retry |
| Host doesn't write Sealed Envelope | Medium — delayed artifact never delivered | Medium | Weekly reminders for 4 weeks; graceful handling if never written |
| Player count changes after character generation | Medium — orphaned characters | Medium | NPC mode for dropped players; "Add Character" for late additions |

## Complexity Tracking

No constitution violations. All four gates pass.

| Consideration | Decision | Rationale |
|---------------|----------|-----------|
| Claude API as server-side dependency | Accepted (Edge Function #1 of 3) | Required by PRD §3.2.1; no alternative for procedural generation quality |
| JSONB for MurderMysteryData | Accepted | Flexible schema for nested game data; avoids complex relational joins for deeply hierarchical data |
| Existing Nunjucks templates | Reused as-is | `the-dossier.njk`, `menu-of-the-damned.njk`, `the-sealed-envelope.njk` already exist and match the fixture data shape |
