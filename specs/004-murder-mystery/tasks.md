# Tasks: Murder Mystery Game Module

**Input**: Design documents from `specs/004-murder-mystery/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Murder Mystery module structure

- [ ] T001 Create feature module directory structure at `src/features/murder-mystery/` with `screens/`, `components/`, `hooks/`, `services/`, `types/`, `utils/` subdirectories
- [ ] T002 [P] Create TypeScript interfaces for all Murder Mystery entities in `src/features/murder-mystery/types/murder-mystery.ts` (MurderMysteryData, SettingSeed, Character, Crime, Clue, GameNightState, Accusation, Award, SealedEnvelope)
- [ ] T003 [P] Install and configure dependencies: `@anthropic-ai/sdk` (Edge Function only), `@nozbe/watermelondb` (if adopted), `react-native-reanimated`, `expo-keep-awake`, `expo-brightness`
- [ ] T004 [P] Create Supabase migration `supabase/migrations/004_murder_mystery_config.sql` with JSONB check constraint and GIN index on sessions.config

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create local database schema for Murder Mystery in `src/shared/db/local/murder-mystery-schema.ts` (tables: mm_sessions, mm_game_night_events, mm_accusations, mm_award_votes)
- [ ] T006 [P] Create seed_generation_log table via Supabase migration: `supabase/migrations/004b_seed_generation_log.sql`
- [ ] T007 [P] Implement offline sync service for Murder Mystery data in `src/shared/services/offlineSync.ts` — pre-cache on ACTIVE transition, queue writes, sync on reconnect
- [ ] T008 Create scenario validation utility in `src/features/murder-mystery/utils/scenarioValidation.ts` — validate character ID references, crime structure consistency, relationship graph connectivity, timeline ordering
- [ ] T009 [P] Seed curated scenarios into Supabase: `supabase/seed/curated-seeds.sql` — at least 5 pre-authored Murder Mystery scenarios conforming to MurderMysteryData schema

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Setting Seed Selection/Generation (Priority: P1)

**Goal**: Host can browse curated seeds or generate unique scenarios via Claude API

**Independent Test**: Create session, select axes, generate seed, verify scenario is consistent and saved

### Implementation

- [x] T010 [P] [US1] Create Supabase Edge Function `supabase/functions/generate-seed/index.ts`:
  - Accept 4-axis input + session_id + player_count
  - System prompt with JSON schema, consistency rules, and 1–2 few-shot examples
  - Call Claude API (Sonnet model)
  - Validate response against schema and consistency rules
  - Auto-retry up to 3 times on validation failure
  - Log to seed_generation_log
  - Rate limit: 10/session, 5s cooldown
- [x] T011 [P] [US1] Create seed generation service in `src/features/murder-mystery/services/seedGenerationService.ts` — client-side wrapper for Edge Function calls, loading state management, error handling
- [x] T012 [P] [US1] Create `useSettingSeed` hook in `src/features/murder-mystery/hooks/useSettingSeed.ts` — seed CRUD, generation trigger, curated seed fetching, regeneration
- [x] T013 [US1] Create SettingSeedBrowserScreen in `src/features/murder-mystery/screens/SettingSeedBrowserScreen.tsx` — grid/list of curated seeds with era, location, milieu, tension previews; tap to view full details; confirm selection
- [x] T014 [P] [US1] Create SettingSeedCard component in `src/features/murder-mystery/components/SettingSeedCard.tsx` — preview card for curated seeds
- [x] T015 [US1] Create SettingSeedGeneratorScreen in `src/features/murder-mystery/screens/SettingSeedGeneratorScreen.tsx` — 4-axis selector dropdowns/pickers, "Generate" button, "Full Random" button, loading state, result display
- [x] T016 [US1] Create ScenarioReviewScreen in `src/features/murder-mystery/screens/ScenarioReviewScreen.tsx` — display generated/curated scenario with setting description, character roster, crime structure, timeline; edit individual fields; "Regenerate" and "Confirm" buttons
- [x] T017 [US1] Write unit tests in `tests/unit/scenarioValidation.test.ts` — test validation rules (ID references, circular relationships, missing fields, victim=murderer contradiction)
- [x] T018 [US1] Write integration test in `tests/integration/seedGeneration.test.ts` — mock Claude API response, verify Edge Function validation, rate limiting, and session.config persistence

**Checkpoint**: Host can select curated seeds or generate unique scenarios via Claude API

---

## Phase 4: User Story 2 — Character Sheet Delivery and Contribution Briefs (Priority: P1)

**Goal**: Guests receive personalized character packets with character sheet, contribution brief, and preparation prompts

**Independent Test**: Assign character to guest, deliver packet, verify packet content and offline access

### Implementation

- [x] T019 [P] [US2] Create `useCharacters` hook in `src/features/murder-mystery/hooks/useCharacters.ts` — character assignment (auto/manual/preference), delivery trigger, assignment state
- [x] T020 [P] [US2] Create CharacterEntry component in `src/features/murder-mystery/components/CharacterEntry.tsx` — reusable card showing character name, occupation, personality, secret (if revealed/host), and current assigneent screens
- [x] T021 [US2] Create CharacterCustomizationScreen in `src/features/murder-mystery/screens/CharacterCustomizationScreen.tsx` — edit character names, secrets, briefs, prompts; drag-and-drop assignment to guests (manual mode)
- [x] T022 [US2] Create CharacterPacketScreen in `src/features/murder-mystery/screens/CharacterPacketScreen.tsx` — sealed envelope animation (react-native-reanimated), tap-to-open, progressive reveal (character sheet → contribution brief → preparation prompts), offline cached
- [x] T023 [US2] Implement character assignment API call: POST `/sessions/{id}/characters/assign` with auto/manual mode support
- [x] T024 [US2] Implement character delivery API call: POST `/sessions/{id}/characters/deliver` — trigger push notifications (app players) and email (web players)
- [x] T025 [US2] Write integration test in `tests/integration/characterDelivery.test.ts` — verify packet content completeness, offline caching, host dashboard tracking

**Checkpoint**: Guests receive and can view character packets; host tracks delivery and contributions

---

## Phase 5: User Story 3 — Three-Act Game Night Dashboard (Priority: P1)

**Goal**: Host runs the entire game night offline with phase controls, clue tracker, and emergency reference

**Independent Test**: Launch game night in airplane mode, walk through all three acts, verify all data persists

### Implementation

- [x] T026 [P] [US3] Create `useGameNight` hook in `src/features/murder-mystery/hooks/useGameNight.ts` — act state, phase progression, timestamp logging, offline-first writes to local DB
- [x] T027 [P] [US3] Create `useClues` hook in `src/features/murder-mystery/hooks/useClues.ts` — clue distribution state, check/uncheck, character knowledge panel data
- [x] T028 [P] [US3] Create ActProgressIndicator component in `src/features/murder-mystery/components/ActProgressIndicator.tsx` — horizontal 3-segment bar, active/completed/future states, tap-safe
- [x] T029 [P] [US3] Create ClueChecklistItem component in `src/features/murder-mystery/components/ClueChecklistItem.tsx` — clue card with title, type badge, checkbox, "found by" attribution
- [x] T030 [US3] Create ThreeActDashboardScreen in `src/features/murder-mystery/screens/ThreeActDashboardScreen.tsx`:
  - Ambient mode (dark bg, warm accents, wake lock via expo-keep-awake, brightness dim via expo-brightness)
  - Act I view: character introduction checklist, player roster, "Begin Act II" hold-to-confirm button
  - Act II view: "Reveal the Crime" button, clue distribution tracker, character knowledge panel, optional interrogation timer, "New Evidence" button
  - Act III view: "Begin Accusations" button, submission count, "The Reveal" button, awards voting trigger
  - Emergency reference overlay (full-screen, read-only, all session data)
  - 30-second undo toast for accidental phase advances
- [ ] T031 [US3] Create ClueDistributionScreen (tab/overlay) in `src/features/murder-mystery/screens/ClueDistributionScreen.tsx` — full clue list with tier recommendations, reorder support, distributed/pending sections
- [ ] T032 [US3] Create RevealScreen in `src/features/murder-mystery/screens/RevealScreen.tsx` — full solution display: culprit, weapon, motive, complete timeline, red herring explanations, "who was closest"
- [ ] T033 [US3] Write integration test in `tests/integration/gameNightDashboard.test.ts` — offline operation, act transitions, clue distribution, data persistence across app backgrounding
- [ ] T034 [US3] Write E2E test in `tests/e2e/offlineGameNight.test.ts` — Maestro/Detox test: airplane mode, full 3-act walkthrough, reconnect, verify sync

**Checkpoint**: Host can run a complete game night offline with all phase controls

---

## Phase 6: User Story 4 — Accusation Submission and Awards Voting (Priority: P2)

**Goal**: Players submit digital accusations and vote on awards during Act III

**Independent Test**: Activate accusations, submit on player device, verify sealed state, trigger voting, verify results

### Implementation

- [ ] T035 [P] [US4] Create `useAccusations` hook in `src/features/murder-mystery/hooks/useAccusations.ts` — submit accusation (offline-first), sealed state, reveal trigger, accusation list retrieval
- [ ] T036 [P] [US4] Create `useAwards` hook in `src/features/murder-mystery/hooks/useAwards.ts` — vote submission (offline-first), self-vote prevention, results aggregation
- [ ] T037 [P] [US4] Create AccusationBlock component in `src/features/murder-mystery/components/AccusationBlock.tsx` — accusation display card with accuser, target, reasoning (used in reveal and Dossier)
- [ ] T038 [P] [US4] Create AwardCategoryCard component in `src/features/murder-mystery/components/AwardCategoryCard.tsx` — voting card per category with nominee list, single-select
- [ ] T039 [US4] Create AccusationFormScreen in `src/features/murder-mystery/screens/AccusationFormScreen.tsx` — character selector dropdown, method text input, motive text input, submit button, "sealed" confirmation
- [ ] T040 [US4] Create AwardsVotingScreen in `src/features/murder-mystery/screens/AwardsVotingScreen.tsx` — 5 award categories, nominee list per category (excludes self), submit all votes
- [ ] T041 [US4] Implement API endpoints: POST `/sessions/{id}/accusations`, POST `/sessions/{id}/awards/vote`, GET `/sessions/{id}/awards/results`

**Checkpoint**: Players can submit accusations and vote; host sees results on dashboard

---

## Phase 7: User Story 5 — The Dossier Artifact (Priority: P1)

**Goal**: Generate The Dossier PDF from session data using the existing Nunjucks template

**Independent Test**: Trigger generation with a complete session dataset, verify PDF content and quality

### Implementation

- [ ] T042 [P] [US5] Create murder mystery artifact data assembly service in `src/features/murder-mystery/services/murderMysteryArtifactService.ts` — transforms app entity data (sessions, participations, contributions, game_night) into the fixture-compatible JSON shape for template rendering
- [ ] T043 [US5] Extend the shared `render-artifact` Edge Function (`supabase/functions/render-artifact/index.ts`) to handle `mm_dossier` artifact type — call assembly service, render `the-dossier.njk`, upload PDF to Supabase Storage
- [ ] T044 [US5] Wire artifact generation trigger from post-game screen — "Generate Artifacts" button calls render-artifact Edge Function for `mm_dossier` and `mm_menu`
- [ ] T045 [US5] Implement artifact distribution: push notification (app players) + email with PDF attachment (web players)
- [ ] T046 [US5] Write integration test in `tests/integration/artifactGeneration.test.ts` — verify Dossier PDF contains all sections, correct character data, all clues, all accusations, correct reveal, and matches fixture shape

**Checkpoint**: The Dossier is generated as a beautiful PDF and distributed to all participants

---

## Phase 8: User Story 6 — Menu of the Damned Artifact (Priority: P2)

**Goal**: Generate the Menu of the Damned PDF from food/drink contribution data

**Independent Test**: Provide recipe data, generate PDF, verify all recipes present with correct layout

### Implementation

- [ ] T047 [P] [US6] Extend artifact assembly service (`murderMysteryArtifactService.ts`) to assemble recipe data from contributions table into the `recipes[]` shape expected by `menu-of-the-damned.njk`
- [ ] T048 [US6] Extend render-artifact Edge Function to handle `mm_menu` artifact type — auto-triggered alongside `mm_dossier`
- [ ] T049 [US6] Handle edge case: skip Menu generation if fewer than 2 recipes submitted; prompt host to add their own

**Checkpoint**: Menu of the Damned is generated alongside The Dossier with all submitted recipes

---

## Phase 9: User Story 7 — The Sealed Envelope (Priority: P2)

**Goal**: Host writes character epilogues, system delivers personalized PDFs on a scheduled delay

**Independent Test**: Write epilogues, verify scheduled delivery, confirm each player receives only their own

### Implementation

- [ ] T050 [P] [US7] Create EpilogueWritingScreen in `src/features/murder-mystery/screens/EpilogueWritingScreen.tsx` — list of characters with narrative writing prompts, text fields for 2–4 sentences each, save button, delivery date configuration (3–14 days, default 7)
- [ ] T051 [US7] Implement epilogue save API: PUT `/sessions/{id}/sealed-envelopes` — saves epilogue text, schedules artifact rendering and delivery
- [ ] T052 [US7] Extend render-artifact Edge Function to handle `mm_sealed_envelope` artifact type — personalized rendering (one PDF per player), uses `the-sealed-envelope.njk` template
- [ ] T053 [US7] Implement scheduled delivery: Supabase cron job or pg_cron that checks for due sealed_envelopes and triggers delivery at 10 AM local time
- [ ] T054 [US7] Implement host writing prompt notification: scheduled 2 days post-game (N14 from notification catalog)
- [ ] T055 [US7] Implement weekly reminder flow: if epilogues not written, remind weekly for 4 weeks

**Checkpoint**: Sealed Envelopes are personalized, scheduled, and delivered to each player

---

## Phase 10: User Story 8 — Society Page Photo (Priority: P3)

**Goal**: Camera overlay with era-specific frame for a group photo in character

**Independent Test**: Open camera, verify overlay renders, take photo, verify composited result

### Implementation

- [ ] T056 [P] [US8] Create era-specific overlay assets (frames, filters) for 3–5 eras in `assets/overlays/murder-mystery/`
- [ ] T057 [US8] Create SocietyPageCameraScreen in `src/features/murder-mystery/screens/SocietyPageCameraScreen.tsx` — camera view with period overlay (Expo Camera + react-native-skia or SVG overlay), character name captions, fictional date
- [ ] T058 [US8] Implement photo compositing: merge camera output with overlay, save high-resolution result to device camera roll and artifact library

**Checkpoint**: Players can take an in-character group photo with period-appropriate framing

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T059 [P] Clue distribution utility in `src/features/murder-mystery/utils/clueDistribution.ts` — tier-based sorting, suggested distribution timing
- [ ] T060 [P] Add navigation routes for all Murder Mystery screens to the app navigator
- [ ] T061 Error handling: graceful fallbacks for Claude API failures (show curated seeds), artifact rendering failures (retry with simplified template), offline sync failures (exponential backoff)
- [ ] T062 [P] Accessibility: ensure all dashboard touch targets >=48dp, ambient mode respects system font size, VoiceOver labels for all interactive elements
- [ ] T063 Performance optimization: lazy-load ScenarioReview and EpilogueWriting screens, optimize local DB queries for game night dashboard
- [ ] T064 Run all quickstart.md validation scenarios end-to-end
- [ ] T065 [P] Write unit tests for clue distribution utility in `tests/unit/clueDistribution.test.ts`
- [ ] T066 Write E2E test for full Murder Mystery flow in `tests/e2e/murderMysteryFlow.test.ts` — Maestro/Detox: session creation → seed generation → character delivery → game night → artifacts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user stories
- **US1 Setting Seed (Phase 3)**: Depends on Phase 2
- **US2 Character Delivery (Phase 4)**: Depends on Phase 2; can run parallel with US1
- **US3 Game Night Dashboard (Phase 5)**: Depends on Phase 2; can run parallel with US1/US2
- **US4 Accusations & Voting (Phase 6)**: Depends on US3 (dashboard must exist); can run parallel with US5
- **US5 Dossier Artifact (Phase 7)**: Depends on Phase 2; can run parallel with US3/US4
- **US6 Menu Artifact (Phase 8)**: Depends on US5 (shared artifact infrastructure)
- **US7 Sealed Envelope (Phase 9)**: Depends on US5 (shared artifact infrastructure)
- **US8 Society Page (Phase 10)**: Independent of other user stories (P3, defer if needed)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### Parallel Opportunities

```
After Phase 2 (Foundational) completes:
├── US1 (Setting Seed)      ─── can start immediately
├── US2 (Character Delivery) ─── can start immediately, parallel with US1
├── US3 (Dashboard)          ─── can start immediately, parallel with US1/US2
└── US5 (Dossier)            ─── can start immediately, parallel with above

After US3 completes:
└── US4 (Accusations/Voting) ─── depends on dashboard

After US5 completes:
├── US6 (Menu)               ─── extends artifact pipeline
└── US7 (Sealed Envelope)    ─── extends artifact pipeline

US8 (Society Page) can start any time after Phase 2 (independent)
```

### Within Each User Story

- Models/types before hooks
- Hooks before screens
- Components can be built in parallel with hooks
- Screens depend on hooks and components
- Integration tests after screen implementation
- E2E tests after all components are wired

---

## Implementation Strategy

### MVP First (US1 + US3 + US5)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Setting Seed Generation
4. Complete Phase 5: US3 — Game Night Dashboard
5. Complete Phase 7: US5 — The Dossier
6. **STOP and VALIDATE**: A host can create a murder mystery, run game night, and generate the case file artifact

### Incremental Delivery

1. Setup + Foundational → Module ready
2. US1 (Seeds) → Host can create unique scenarios
3. US2 (Characters) → Guests receive packets
4. US3 (Dashboard) → Host runs game night offline
5. US4 (Accusations) → Digital accusations and voting
6. US5 (Dossier) → Primary artifact generated
7. US6 (Menu) → Second artifact
8. US7 (Sealed Envelope) → Delayed delivery coda
9. US8 (Society Page) → Camera overlay (stretch)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Existing templates (`the-dossier.njk`, `menu-of-the-damned.njk`, `the-sealed-envelope.njk`) require no modification — the service layer bridges app data to template shape
- The `render-artifact` Edge Function is shared across all games (spec 006); Murder Mystery extends it with game-specific data assembly
- All game night writes are local-first; sync happens post-game
