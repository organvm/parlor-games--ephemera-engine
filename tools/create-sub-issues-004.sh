# Sourced by create-sub-issues.sh — no shebang, no set flags
# Spec 004: Murder Mystery (66 tasks -> 4 epics)
# Epic #21: Setup & Claude API Seeds (T001-T018, Phases 1-3)
# Epic #22: Character Delivery & Dashboard (T019-T034, Phases 4-5)
# Epic #23: Accusations, Awards & Artifacts (T035-T049, Phases 6-8)
# Epic #24: Sealed Envelope, Society Page & Polish (T050-T066, Phases 9-11)

# ============================================================
# Phase 1: Setup (P0 -> Epic #21)
# ============================================================

create_issue \
  "T001: Create Murder Mystery feature module directory structure" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Low

## Description
Create feature module directory structure at `src/features/murder-mystery/` with `screens/`, `components/`, `hooks/`, `services/`, `types/`, `utils/` subdirectories.

## Deliverables
- Create `src/features/murder-mystery/screens/`
- Create `src/features/murder-mystery/components/`
- Create `src/features/murder-mystery/hooks/`
- Create `src/features/murder-mystery/services/`
- Create `src/features/murder-mystery/types/`
- Create `src/features/murder-mystery/utils/`

## Files
- `src/features/murder-mystery/` (directory tree)

## Dependencies
None
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T002: Create TypeScript interfaces for Murder Mystery entities" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Medium

## Description
Create TypeScript interfaces for all Murder Mystery entities in `src/features/murder-mystery/types/murder-mystery.ts` (MurderMysteryData, SettingSeed, Character, Crime, Clue, GameNightState, Accusation, Award, SealedEnvelope).

## Deliverables
- `MurderMysteryData` interface (top-level session config shape)
- `SettingSeed` interface (era, location, milieu, tension axes + generated scenario)
- `Character` interface (name, occupation, bio, secrets, relationships, mugshot)
- `Crime` interface (victim, weapon, motive, timeline)
- `Clue` interface (id, title, type, tier, description, found_by)
- `GameNightState` interface (current act, phase, timestamps, clue distribution)
- `Accusation` interface (accuser, target, method, motive, sealed state)
- `Award` interface (category, votes, winner)
- `SealedEnvelope` interface (character, epilogue text, delivery date, status)

## Files
- `src/features/murder-mystery/types/murder-mystery.ts`

## Dependencies
None (can run parallel with T001)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T003: Install and configure Murder Mystery dependencies" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Low

## Description
Install and configure dependencies: `@anthropic-ai/sdk` (Edge Function only), `@nozbe/watermelondb` (if adopted), `react-native-reanimated`, `expo-keep-awake`, `expo-brightness`.

## Deliverables
- Add `@anthropic-ai/sdk` to Edge Function dependencies
- Add `@nozbe/watermelondb` (or confirm Expo SQLite adoption)
- Add `react-native-reanimated` for sealed envelope animation
- Add `expo-keep-awake` for ambient mode wake lock
- Add `expo-brightness` for ambient mode brightness control
- Update `package.json` and lock file

## Files
- `package.json`
- `supabase/functions/generate-seed/package.json`

## Dependencies
None (can run parallel with T001)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T004: Create Supabase migration for murder_mystery_config" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Low

## Description
Create Supabase migration `supabase/migrations/004_murder_mystery_config.sql` with JSONB check constraint and GIN index on sessions.config.

## Deliverables
- JSONB check constraint ensuring valid Murder Mystery config shape
- GIN index on `sessions.config` for efficient querying
- Migration rollback support

## Files
- `supabase/migrations/004_murder_mystery_config.sql`

## Dependencies
None (can run parallel with T001)
BODY
)" \
  "spec:004-mystery,P0" \
  21

# ============================================================
# Phase 2: Foundational (P0 -> Epic #21)
# ============================================================

create_issue \
  "T005: Create local database schema for Murder Mystery" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Medium

## Description
Create local database schema for Murder Mystery in `src/shared/db/local/murder-mystery-schema.ts` (tables: mm_sessions, mm_game_night_events, mm_accusations, mm_award_votes).

## Deliverables
- `mm_sessions` table (local mirror of session + murder mystery config)
- `mm_game_night_events` table (act transitions, clue distributions, timestamps)
- `mm_accusations` table (accuser, target, method, motive, sealed flag)
- `mm_award_votes` table (voter, category, nominee, timestamp)
- TypeScript types for all local entities
- Database initialization function

## Files
- `src/shared/db/local/murder-mystery-schema.ts`

## Dependencies
Phase 1 complete (T001-T004)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T006: Create seed_generation_log table via Supabase migration" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Low

## Description
Create seed_generation_log table via Supabase migration: `supabase/migrations/004b_seed_generation_log.sql`.

## Deliverables
- `seed_generation_log` table with columns: id, session_id, axes_input, raw_response, validated_response, model, latency_ms, retry_count, created_at
- Indexes on session_id and created_at
- RLS policies (host read-only, system write)

## Files
- `supabase/migrations/004b_seed_generation_log.sql`

## Dependencies
Phase 1 complete (can run parallel with T005)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T007: Implement offline sync service for Murder Mystery" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Medium

## Description
Implement offline sync service for Murder Mystery data in `src/shared/services/offlineSync.ts` — pre-cache on ACTIVE transition, queue writes, sync on reconnect.

## Deliverables
- Pre-cache all Murder Mystery session data to local DB on ACTIVE transition
- Queue local writes (accusations, awards, game night events) when offline
- Sync queued writes to Supabase on reconnect
- Exponential backoff on sync failure
- Sync status indicator for host dashboard

## Files
- `src/shared/services/offlineSync.ts`

## Dependencies
Phase 1 complete (can run parallel with T005)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T008: Create scenario validation utility" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Medium

## Description
Create scenario validation utility in `src/features/murder-mystery/utils/scenarioValidation.ts` — validate character ID references, crime structure consistency, relationship graph connectivity, timeline ordering.

## Deliverables
- Validate all character ID references resolve to existing characters
- Validate crime structure (victim exists, weapon defined, motive present)
- Validate relationship graph connectivity (no orphaned characters)
- Validate timeline ordering (events are chronologically consistent)
- Validate victim != murderer constraint
- Return structured validation result with error messages

## Files
- `src/features/murder-mystery/utils/scenarioValidation.ts`

## Dependencies
Phase 1 complete (T002 for type definitions)
BODY
)" \
  "spec:004-mystery,P0" \
  21

create_issue \
  "T009: Seed curated scenarios into Supabase" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P0 | **Estimate**: Medium

## Description
Seed curated scenarios into Supabase: `supabase/seed/curated-seeds.sql` — at least 5 pre-authored Murder Mystery scenarios conforming to MurderMysteryData schema.

## Deliverables
- SQL seed file with at least 5 curated Murder Mystery scenarios
- Each scenario includes: setting, characters (6-10), crime, clues, timeline, solution
- Scenarios conform to MurderMysteryData TypeScript interface
- Scenarios sourced from `content/murder-mystery-seeds/curated-seeds.yaml`
- Validate all scenarios pass scenarioValidation utility

## Files
- `supabase/seed/curated-seeds.sql`

## Dependencies
Phase 1 complete (can run parallel with T005)
BODY
)" \
  "spec:004-mystery,P0" \
  21

# ============================================================
# Phase 3: User Story 1 — Setting Seed Selection/Generation (P1 -> Epic #21)
# ============================================================

create_issue \
  "T010: Create generate-seed Supabase Edge Function" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: High

## Description
Create Supabase Edge Function `supabase/functions/generate-seed/index.ts`: accept 4-axis input + session_id + player_count, system prompt with JSON schema, consistency rules, and 1-2 few-shot examples, call Claude API (Sonnet model), validate response against schema and consistency rules, auto-retry up to 3 times on validation failure, log to seed_generation_log, rate limit: 10/session, 5s cooldown.

## Deliverables
- Edge Function accepting 4-axis input (era, location, milieu, tension) + session_id + player_count
- System prompt with JSON schema, consistency rules, and 1-2 few-shot examples
- Claude API call (Sonnet model) with structured output
- Response validation against MurderMysteryData schema and consistency rules
- Auto-retry up to 3 times on validation failure
- Logging to seed_generation_log table
- Rate limiting: 10 generations per session, 5-second cooldown between requests

## Files
- `supabase/functions/generate-seed/index.ts`

## Dependencies
Phase 2 complete (T006 for seed_generation_log, T008 for validation)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T011: Create seed generation client service" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create seed generation service in `src/features/murder-mystery/services/seedGenerationService.ts` — client-side wrapper for Edge Function calls, loading state management, error handling.

## Deliverables
- Client-side wrapper for generate-seed Edge Function
- Loading state management (idle, generating, validating, complete, error)
- Error handling with user-friendly messages
- Retry logic coordination with Edge Function
- Curated seed fallback on generation failure

## Files
- `src/features/murder-mystery/services/seedGenerationService.ts`

## Dependencies
Phase 2 complete (can run parallel with T010)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T012: Create useSettingSeed hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `useSettingSeed` hook in `src/features/murder-mystery/hooks/useSettingSeed.ts` — seed CRUD, generation trigger, curated seed fetching, regeneration.

## Deliverables
- Fetch curated seeds from Supabase
- Trigger seed generation via seedGenerationService
- Select/deselect seed for session
- Confirm seed selection (write to session.config)
- Regeneration support (clear current, trigger new generation)
- Loading and error states

## Files
- `src/features/murder-mystery/hooks/useSettingSeed.ts`

## Dependencies
Phase 2 complete (can run parallel with T010, T011)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T013: Create SettingSeedBrowserScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create SettingSeedBrowserScreen in `src/features/murder-mystery/screens/SettingSeedBrowserScreen.tsx` — grid/list of curated seeds with era, location, milieu, tension previews; tap to view full details; confirm selection.

## Deliverables
- Grid/list layout of curated seeds
- Each seed shows era, location, milieu, tension axis values
- Tap seed to view full details (modal or navigation)
- "Select This Seed" confirmation button
- Loading state while fetching seeds
- Empty state if no seeds available

## Files
- `src/features/murder-mystery/screens/SettingSeedBrowserScreen.tsx`

## Dependencies
T012 (useSettingSeed hook)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T014: Create SettingSeedCard component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create SettingSeedCard component in `src/features/murder-mystery/components/SettingSeedCard.tsx` — preview card for curated seeds.

## Deliverables
- Preview card showing seed title, era badge, location, milieu, tension
- Brief setting description (truncated)
- Character count indicator
- Visual distinction for selected vs. unselected state
- Touch target >= 48dp

## Files
- `src/features/murder-mystery/components/SettingSeedCard.tsx`

## Dependencies
Phase 2 complete (can run parallel with T012, T013)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T015: Create SettingSeedGeneratorScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create SettingSeedGeneratorScreen in `src/features/murder-mystery/screens/SettingSeedGeneratorScreen.tsx` — 4-axis selector dropdowns/pickers, "Generate" button, "Full Random" button, loading state, result display.

## Deliverables
- 4-axis selector (era, location, milieu, tension) with dropdown/picker UI
- "Generate" button (uses selected axes)
- "Full Random" button (randomizes all 4 axes before generating)
- Loading state with progress indication during Claude API call
- Result display showing generated scenario preview
- Error state with retry option

## Files
- `src/features/murder-mystery/screens/SettingSeedGeneratorScreen.tsx`

## Dependencies
T013 (navigation flow from browser to generator)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T016: Create ScenarioReviewScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create ScenarioReviewScreen in `src/features/murder-mystery/screens/ScenarioReviewScreen.tsx` — display generated/curated scenario with setting description, character roster, crime structure, timeline; edit individual fields; "Regenerate" and "Confirm" buttons.

## Deliverables
- Full scenario display: setting description, character roster, crime structure, timeline
- Edit individual fields (inline editing)
- "Regenerate" button (triggers new generation with same axes)
- "Confirm" button (saves scenario to session.config)
- Section-by-section layout with collapsible panels
- Character roster with names, occupations, and relationship previews

## Files
- `src/features/murder-mystery/screens/ScenarioReviewScreen.tsx`

## Dependencies
T015 (navigation flow from generator to review)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T017: Write unit tests for scenario validation" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Write unit tests in `tests/unit/scenarioValidation.test.ts` — test validation rules (ID references, circular relationships, missing fields, victim=murderer contradiction).

## Deliverables
- Test valid scenario passes all checks
- Test invalid character ID references are caught
- Test circular relationship detection
- Test missing required fields are caught
- Test victim=murderer contradiction is caught
- Test empty character roster fails
- Test timeline ordering violations are caught

## Files
- `tests/unit/scenarioValidation.test.ts`

## Dependencies
T008 (scenarioValidation utility)
BODY
)" \
  "spec:004-mystery,P1" \
  21

create_issue \
  "T018: Write integration test for seed generation" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Write integration test in `tests/integration/seedGeneration.test.ts` — mock Claude API response, verify Edge Function validation, rate limiting, and session.config persistence.

## Deliverables
- Mock Claude API response with valid scenario JSON
- Verify Edge Function validates response against schema
- Verify rate limiting (10/session, 5s cooldown)
- Verify validated scenario is persisted to session.config
- Verify seed_generation_log entry is created
- Test retry behavior on validation failure
- Test error handling for API timeouts

## Files
- `tests/integration/seedGeneration.test.ts`

## Dependencies
T010 (generate-seed Edge Function)
BODY
)" \
  "spec:004-mystery,P1" \
  21

# ============================================================
# Phase 4: User Story 2 — Character Delivery (P1 -> Epic #22)
# ============================================================

create_issue \
  "T019: Create useCharacters hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `useCharacters` hook in `src/features/murder-mystery/hooks/useCharacters.ts` — character assignment (auto/manual/preference), delivery trigger, assignment state.

## Deliverables
- Character assignment modes: auto (round-robin), manual (host drag-drop), preference-based
- Delivery trigger function (initiates packet delivery to all assigned guests)
- Assignment state tracking (unassigned, assigned, delivered)
- Character roster data for host dashboard
- Error handling for insufficient characters or guests

## Files
- `src/features/murder-mystery/hooks/useCharacters.ts`

## Dependencies
Phase 2 complete (can run parallel with Phase 3)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T020: Create CharacterEntry component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create CharacterEntry component in `src/features/murder-mystery/components/CharacterEntry.tsx` — character display card with mugshot initials, name, occupation, bio; used in roster and assignment screens.

## Deliverables
- Character display card with mugshot initials (styled circle with character initials)
- Character name and occupation prominently displayed
- Bio text (truncated with expand option)
- Visual states: unassigned, assigned (shows guest name), delivered (checkmark)
- Touch target >= 48dp

## Files
- `src/features/murder-mystery/components/CharacterEntry.tsx`

## Dependencies
Phase 2 complete (can run parallel with T019)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T021: Create CharacterCustomizationScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create CharacterCustomizationScreen in `src/features/murder-mystery/screens/CharacterCustomizationScreen.tsx` — edit character names, secrets, briefs, prompts; drag-and-drop assignment to guests (manual mode).

## Deliverables
- Editable fields: character name, secrets, contribution brief, preparation prompts
- Drag-and-drop interface for manual character-to-guest assignment
- Auto-assign button for automatic round-robin assignment
- Validation (all characters assigned before proceeding)
- Save progress with auto-save

## Files
- `src/features/murder-mystery/screens/CharacterCustomizationScreen.tsx`

## Dependencies
T019 (useCharacters hook), T020 (CharacterEntry component)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T022: Create CharacterPacketScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create CharacterPacketScreen in `src/features/murder-mystery/screens/CharacterPacketScreen.tsx` — sealed envelope animation (react-native-reanimated), tap-to-open, progressive reveal (character sheet -> contribution brief -> preparation prompts), offline cached.

## Deliverables
- Sealed envelope animation using react-native-reanimated
- Tap-to-open interaction with satisfying animation
- Progressive reveal: character sheet first, then contribution brief, then preparation prompts
- All content cached locally for offline access
- Reduce motion fallback (instant reveal, no animation)
- Print-friendly layout option

## Files
- `src/features/murder-mystery/screens/CharacterPacketScreen.tsx`

## Dependencies
T021 (CharacterCustomizationScreen — assignment must exist)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T023: Implement character assignment API" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement character assignment API call: POST `/sessions/{id}/characters/assign` with auto/manual mode support.

## Deliverables
- POST endpoint for character assignment
- Auto mode: round-robin assignment algorithm
- Manual mode: accept explicit character-to-guest mapping
- Preference mode: use guest preferences to optimize assignment
- Validation: all characters assigned, no duplicate assignments
- Update session_participations with character_data

## Files
- API endpoint implementation

## Dependencies
T019 (useCharacters hook)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T024: Implement character delivery API" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement character delivery API call: POST `/sessions/{id}/characters/deliver` — trigger push notifications (app players) and email (web players).

## Deliverables
- POST endpoint for character delivery
- Push notification to app players with deep link to CharacterPacketScreen
- Email to web players with character sheet content
- Delivery status tracking per guest (pending, delivered, opened)
- Host dashboard delivery progress indicator
- Retry mechanism for failed deliveries

## Files
- API endpoint implementation

## Dependencies
T023 (character assignment must be complete before delivery)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T025: Write integration test for character delivery" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Write integration test in `tests/integration/characterDelivery.test.ts` — verify packet content completeness, offline caching, host dashboard tracking.

## Deliverables
- Test character packet contains all required sections (sheet, brief, prompts)
- Test offline caching (packet available without network)
- Test host dashboard shows delivery progress
- Test all assignment modes (auto, manual, preference)
- Test delivery to both app and web players
- Test retry on delivery failure

## Files
- `tests/integration/characterDelivery.test.ts`

## Dependencies
T022 (CharacterPacketScreen), T024 (character delivery API)
BODY
)" \
  "spec:004-mystery,P1" \
  22

# ============================================================
# Phase 5: User Story 3 — Three-Act Dashboard (P1 -> Epic #22)
# ============================================================

create_issue \
  "T026: Create useGameNight hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `useGameNight` hook in `src/features/murder-mystery/hooks/useGameNight.ts` — act state, phase progression, timestamp logging, offline-first writes to local DB.

## Deliverables
- Act state management (Act I, Act II, Act III, Complete)
- Phase progression within each act
- Timestamp logging for all transitions
- All writes go to local SQLite first (offline-first)
- State recovery on app restart
- Hold-to-confirm for act transitions (prevent accidental advances)

## Files
- `src/features/murder-mystery/hooks/useGameNight.ts`

## Dependencies
Phase 2 complete (can run parallel with Phases 3-4)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T027: Create useClues hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create `useClues` hook in `src/features/murder-mystery/hooks/useClues.ts` — clue distribution state, check/uncheck, character knowledge panel data.

## Deliverables
- Clue distribution state (pending, distributed, found)
- Check/uncheck clue as distributed
- Character knowledge panel data (which character knows what)
- Tier-based clue ordering (tier 1 first, tier 3 last)
- Undo clue distribution (within 30s window)
- All state persisted to local DB

## Files
- `src/features/murder-mystery/hooks/useClues.ts`

## Dependencies
Phase 2 complete (can run parallel with T026)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T028: Create ActProgressIndicator component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create ActProgressIndicator component in `src/features/murder-mystery/components/ActProgressIndicator.tsx` — horizontal 3-segment bar, active/completed/future states, tap-safe.

## Deliverables
- Horizontal 3-segment progress bar (Act I, Act II, Act III)
- Visual states: completed (gold), active (amber, highlighted), future (dimmed)
- Tap-safe (no accidental act transitions from tapping indicator)
- Current act label displayed prominently
- Reduce motion support

## Files
- `src/features/murder-mystery/components/ActProgressIndicator.tsx`

## Dependencies
Phase 2 complete (can run parallel with T026, T027)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T029: Create ClueChecklistItem component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create ClueChecklistItem component in `src/features/murder-mystery/components/ClueChecklistItem.tsx` — clue card with title, type badge, checkbox, "found by" attribution.

## Deliverables
- Clue card with title and brief description
- Type badge (physical evidence, testimony, document, etc.)
- Checkbox for marking as distributed
- "Found by" attribution (which character found this clue)
- Tier indicator (visual weight based on clue importance)
- Touch target >= 48dp

## Files
- `src/features/murder-mystery/components/ClueChecklistItem.tsx`

## Dependencies
Phase 2 complete (can run parallel with T026-T028)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T030: Create ThreeActDashboardScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: High

## Description
Create ThreeActDashboardScreen in `src/features/murder-mystery/screens/ThreeActDashboardScreen.tsx` with ambient mode (dark bg, warm accents, wake lock via expo-keep-awake, brightness dim via expo-brightness), Act I view (character introduction checklist, player roster, "Begin Act II" hold-to-confirm button), Act II view ("Reveal the Crime" button, clue distribution tracker, character knowledge panel, optional interrogation timer, "New Evidence" button), Act III view ("Begin Accusations" button, submission count, "The Reveal" button, awards voting trigger), emergency reference overlay (full-screen, read-only, all session data), and 30-second undo toast for accidental phase advances.

## Deliverables
- Ambient mode: OLED black background, warm accents, wake lock, brightness dimming
- Act I view: character introduction checklist, player roster, "Begin Act II" hold-to-confirm
- Act II view: crime reveal button, clue distribution tracker, knowledge panel, timer, "New Evidence"
- Act III view: accusations button, submission count, "The Reveal" button, awards trigger
- Emergency reference overlay: full-screen, read-only, all session data
- 30-second undo toast for accidental phase advances
- One-hand operation: primary controls in bottom 60% of screen

## Files
- `src/features/murder-mystery/screens/ThreeActDashboardScreen.tsx`

## Dependencies
T026 (useGameNight), T027 (useClues), T028 (ActProgressIndicator), T029 (ClueChecklistItem)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T031: Create ClueDistributionScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create ClueDistributionScreen (tab/overlay) in `src/features/murder-mystery/screens/ClueDistributionScreen.tsx` — full clue list with tier recommendations, reorder support, distributed/pending sections.

## Deliverables
- Full clue list organized by tier (tier 1 -> tier 3)
- Tier-based distribution timing recommendations
- Drag-to-reorder support for custom distribution order
- Sections: distributed (checked off) and pending (unchecked)
- "Distribute Next" quick action button
- Character assignment for each clue

## Files
- `src/features/murder-mystery/screens/ClueDistributionScreen.tsx`

## Dependencies
T030 (ThreeActDashboardScreen — navigation target)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T032: Create RevealScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create RevealScreen in `src/features/murder-mystery/screens/RevealScreen.tsx` — full solution display: culprit, weapon, motive, complete timeline, red herring explanations, "who was closest".

## Deliverables
- Full solution reveal: culprit identity, weapon, motive
- Complete timeline of events
- Red herring explanations (why each was misleading)
- "Who was closest" — compare accusations to actual solution
- Dramatic reveal animation (progressive sections)
- Reduce motion fallback (instant display)

## Files
- `src/features/murder-mystery/screens/RevealScreen.tsx`

## Dependencies
T030 (ThreeActDashboardScreen — navigation from Act III)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T033: Write integration test for game night dashboard" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Write integration test in `tests/integration/gameNightDashboard.test.ts` — offline operation, act transitions, clue distribution, data persistence across app backgrounding.

## Deliverables
- Test dashboard operates fully offline (zero network calls)
- Test act transitions (I -> II -> III -> Complete)
- Test clue distribution tracking (check/uncheck, persistence)
- Test data persistence across app backgrounding
- Test undo mechanism (30-second window)
- Test ambient mode activation (wake lock, brightness)

## Files
- `tests/integration/gameNightDashboard.test.ts`

## Dependencies
T030 (ThreeActDashboardScreen)
BODY
)" \
  "spec:004-mystery,P1" \
  22

create_issue \
  "T034: Write E2E test for offline game night" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: High

## Description
Write E2E test in `tests/e2e/offlineGameNight.test.ts` — Maestro/Detox test: airplane mode, full 3-act walkthrough, reconnect, verify sync.

## Deliverables
- Enable airplane mode before test
- Launch game night dashboard
- Walk through Act I (character introductions)
- Walk through Act II (crime reveal, clue distribution)
- Walk through Act III (accusations, reveal)
- Disable airplane mode
- Verify all data syncs to server
- Verify sync indicator clears

## Files
- `tests/e2e/offlineGameNight.test.ts`

## Dependencies
T033 (integration tests pass first)
BODY
)" \
  "spec:004-mystery,P1" \
  22

# ============================================================
# Phase 6: User Story 4 — Accusations & Awards (P2 -> Epic #23)
# ============================================================

create_issue \
  "T035: Create useAccusations hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Create `useAccusations` hook in `src/features/murder-mystery/hooks/useAccusations.ts` — submit accusation (offline-first), sealed state, reveal trigger, accusation list retrieval.

## Deliverables
- Submit accusation (accuser, target, method, motive) — offline-first to local DB
- Sealed state management (accusations hidden until reveal)
- Reveal trigger (host unseals all accusations)
- Accusation list retrieval for display
- Duplicate prevention (one accusation per player)
- Undo submission within 30-second window

## Files
- `src/features/murder-mystery/hooks/useAccusations.ts`

## Dependencies
Phase 5 complete (dashboard must exist for accusation flow)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T036: Create useAwards hook" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Create `useAwards` hook in `src/features/murder-mystery/hooks/useAwards.ts` — vote submission (offline-first), self-vote prevention, results aggregation.

## Deliverables
- Vote submission for each award category (offline-first to local DB)
- Self-vote prevention (voter cannot nominate themselves)
- Results aggregation (tally votes, determine winners)
- 5 award categories support
- Vote change allowed before final submission
- Results sealed until host triggers reveal

## Files
- `src/features/murder-mystery/hooks/useAwards.ts`

## Dependencies
Phase 5 complete (can run parallel with T035)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T037: Create AccusationBlock component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Create AccusationBlock component in `src/features/murder-mystery/components/AccusationBlock.tsx` — accusation display card with accuser, target, reasoning (used in reveal and Dossier).

## Deliverables
- Accusation display card with accuser name, target name, method, motive
- "Sealed" visual state (content hidden, envelope icon)
- "Revealed" visual state (content visible, styled card)
- Reusable in both RevealScreen and Dossier artifact
- Touch target >= 48dp

## Files
- `src/features/murder-mystery/components/AccusationBlock.tsx`

## Dependencies
Phase 5 complete (can run parallel with T035, T036)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T038: Create AwardCategoryCard component" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Create AwardCategoryCard component in `src/features/murder-mystery/components/AwardCategoryCard.tsx` — voting card per category with nominee list, single-select.

## Deliverables
- Voting card for a single award category
- Category name and description
- Nominee list (all players except self)
- Single-select radio/tap interaction
- Visual feedback on selection
- Touch target >= 48dp per nominee

## Files
- `src/features/murder-mystery/components/AwardCategoryCard.tsx`

## Dependencies
Phase 5 complete (can run parallel with T035-T037)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T039: Create AccusationFormScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Create AccusationFormScreen in `src/features/murder-mystery/screens/AccusationFormScreen.tsx` — character selector dropdown, method text input, motive text input, submit button, "sealed" confirmation.

## Deliverables
- Character selector dropdown (list of all characters as accusation targets)
- Method text input (free text, how the crime was committed)
- Motive text input (free text, why the crime was committed)
- Submit button with "sealed" confirmation dialog
- Preview of accusation before sealing
- Offline submission support

## Files
- `src/features/murder-mystery/screens/AccusationFormScreen.tsx`

## Dependencies
T035 (useAccusations hook), T037 (AccusationBlock component)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T040: Create AwardsVotingScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Create AwardsVotingScreen in `src/features/murder-mystery/screens/AwardsVotingScreen.tsx` — 5 award categories, nominee list per category (excludes self), submit all votes.

## Deliverables
- 5 award categories displayed as scrollable cards
- Nominee list per category (excludes the voting player)
- Single selection per category
- "Submit All Votes" button (only active when all categories voted)
- Confirmation dialog before final submission
- Offline submission support

## Files
- `src/features/murder-mystery/screens/AwardsVotingScreen.tsx`

## Dependencies
T036 (useAwards hook), T038 (AwardCategoryCard component)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T041: Implement Accusation and Awards API endpoints" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement API endpoints: POST `/sessions/{id}/accusations`, POST `/sessions/{id}/awards/vote`, GET `/sessions/{id}/awards/results`.

## Deliverables
- POST `/sessions/{id}/accusations` — submit accusation, validate session state, prevent duplicates
- POST `/sessions/{id}/awards/vote` — submit votes for all 5 categories, validate self-vote prevention
- GET `/sessions/{id}/awards/results` — return aggregated results (only after host triggers reveal)
- All endpoints respect RLS policies
- Offline queue integration (sync queued submissions on reconnect)

## Files
- API endpoint implementations

## Dependencies
T039 (AccusationFormScreen), T040 (AwardsVotingScreen)
BODY
)" \
  "spec:004-mystery,P2" \
  23

# ============================================================
# Phase 7: User Story 5 — The Dossier (P1 -> Epic #23)
# ============================================================

create_issue \
  "T042: Create murder mystery artifact data assembly service" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Create murder mystery artifact data assembly service in `src/features/murder-mystery/services/murderMysteryArtifactService.ts` — transforms app entity data (sessions, participations, contributions, game_night) into the fixture-compatible JSON shape for template rendering.

## Deliverables
- Transform session data into Dossier fixture shape
- Assemble character roster with bios, secrets, relationships
- Assemble crime structure (victim, weapon, motive, timeline)
- Assemble clue list with distribution history
- Assemble accusations list
- Assemble awards results
- Output matches the JSON shape expected by `the-dossier.njk`

## Files
- `src/features/murder-mystery/services/murderMysteryArtifactService.ts`

## Dependencies
Phase 2 complete (can run parallel with other user stories)
BODY
)" \
  "spec:004-mystery,P1" \
  23

create_issue \
  "T043: Extend render-artifact Edge Function for mm_dossier" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Extend the shared `render-artifact` Edge Function (`supabase/functions/render-artifact/index.ts`) to handle `mm_dossier` artifact type — call assembly service, render `the-dossier.njk`, upload PDF to Supabase Storage.

## Deliverables
- Handle `mm_dossier` artifact type in render-artifact Edge Function
- Call murderMysteryArtifactService to assemble fixture data
- Render using `the-dossier.njk` Nunjucks template
- Generate PDF via Puppeteer
- Upload PDF to Supabase Storage
- Return signed download URL

## Files
- `supabase/functions/render-artifact/index.ts`

## Dependencies
T042 (artifact data assembly service)
BODY
)" \
  "spec:004-mystery,P1" \
  23

create_issue \
  "T044: Wire artifact generation from post-game screen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Wire artifact generation trigger from post-game screen — "Generate Artifacts" button calls render-artifact Edge Function for `mm_dossier` and `mm_menu`.

## Deliverables
- "Generate Artifacts" button on post-game screen
- Calls render-artifact for `mm_dossier` artifact type
- Calls render-artifact for `mm_menu` artifact type (if recipes available)
- Loading state with progress indication
- Success state with download links
- Error state with retry option

## Files
- Post-game screen updates

## Dependencies
T043 (render-artifact supports mm_dossier)
BODY
)" \
  "spec:004-mystery,P1" \
  23

create_issue \
  "T045: Implement artifact distribution" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Implement artifact distribution: push notification (app players) + email with PDF attachment (web players).

## Deliverables
- Push notification to app players with deep link to artifact viewer
- Email to web players with PDF attachment or download link
- Distribution triggered after artifact generation completes
- Delivery tracking per participant
- Retry mechanism for failed deliveries

## Files
- Distribution service implementation

## Dependencies
T044 (artifact generation wiring)
BODY
)" \
  "spec:004-mystery,P1" \
  23

create_issue \
  "T046: Write integration test for artifact generation" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Write integration test in `tests/integration/artifactGeneration.test.ts` — verify Dossier PDF contains all sections, correct character data, all clues, all accusations, correct reveal, and matches fixture shape.

## Deliverables
- Test Dossier PDF contains all required sections
- Test character data is correct and complete
- Test all clues are included with distribution history
- Test all accusations are included
- Test reveal section matches actual solution
- Test output matches fixture shape expected by template
- Test PDF generation succeeds with valid data

## Files
- `tests/integration/artifactGeneration.test.ts`

## Dependencies
T044 (artifact generation wiring)
BODY
)" \
  "spec:004-mystery,P1" \
  23

# ============================================================
# Phase 8: User Story 6 — Menu of the Damned (P2 -> Epic #23)
# ============================================================

create_issue \
  "T047: Extend artifact assembly for recipe data" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Extend artifact assembly service (`murderMysteryArtifactService.ts`) to assemble recipe data from contributions table into the `recipes[]` shape expected by `menu-of-the-damned.njk`.

## Deliverables
- Assemble recipe data from contributions table
- Transform into `recipes[]` array shape for template
- Include recipe name, ingredients, instructions, contributor attribution
- Include character-themed recipe descriptions
- Output matches JSON shape expected by `menu-of-the-damned.njk`

## Files
- `src/features/murder-mystery/services/murderMysteryArtifactService.ts` (update)

## Dependencies
T042 (artifact assembly service exists)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T048: Extend render-artifact for mm_menu artifact type" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Extend render-artifact Edge Function to handle `mm_menu` artifact type — auto-triggered alongside `mm_dossier`.

## Deliverables
- Handle `mm_menu` artifact type in render-artifact Edge Function
- Call assembly service for recipe data
- Render using `menu-of-the-damned.njk` template
- Generate PDF via Puppeteer
- Upload PDF to Supabase Storage
- Auto-triggered alongside `mm_dossier` in artifact generation flow

## Files
- `supabase/functions/render-artifact/index.ts` (update)

## Dependencies
T043 (render-artifact infrastructure), T047 (recipe data assembly)
BODY
)" \
  "spec:004-mystery,P2" \
  23

create_issue \
  "T049: Handle edge case for insufficient recipes" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Handle edge case: skip Menu generation if fewer than 2 recipes submitted; prompt host to add their own.

## Deliverables
- Check recipe count before triggering mm_menu generation
- If fewer than 2 recipes: skip Menu generation silently
- Prompt host with option to add their own recipes
- Display message explaining Menu requires at least 2 recipes
- If host adds recipes, allow manual Menu generation trigger

## Files
- Post-game screen updates
- `src/features/murder-mystery/services/murderMysteryArtifactService.ts` (update)

## Dependencies
T048 (mm_menu rendering exists)
BODY
)" \
  "spec:004-mystery,P2" \
  23

# ============================================================
# Phase 9: User Story 7 — Sealed Envelope (P2 -> Epic #24)
# ============================================================

create_issue \
  "T050: Create EpilogueWritingScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Create EpilogueWritingScreen in `src/features/murder-mystery/screens/EpilogueWritingScreen.tsx` — list of characters with narrative writing prompts, text fields for 2-4 sentences each, save button, delivery date configuration (3-14 days, default 7).

## Deliverables
- List of all characters with narrative writing prompts
- Text field per character for epilogue (2-4 sentences)
- Writing prompts tailored to each character's arc
- Save button with auto-save support
- Delivery date configuration slider (3-14 days, default 7)
- Progress indicator (X of Y epilogues written)

## Files
- `src/features/murder-mystery/screens/EpilogueWritingScreen.tsx`

## Dependencies
Phase 5 complete (can run parallel with Phase 6)
BODY
)" \
  "spec:004-mystery,P2" \
  24

create_issue \
  "T051: Implement epilogue save API" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement epilogue save API: PUT `/sessions/{id}/sealed-envelopes` — saves epilogue text, schedules artifact rendering and delivery.

## Deliverables
- PUT endpoint for saving epilogue text per character
- Schedule artifact rendering for each player's sealed envelope
- Schedule delivery based on configured delay (3-14 days)
- Store delivery schedule in database
- Validate epilogue text length (minimum/maximum)
- Update session sealed_envelope status

## Files
- API endpoint implementation

## Dependencies
T050 (EpilogueWritingScreen)
BODY
)" \
  "spec:004-mystery,P2" \
  24

create_issue \
  "T052: Extend render-artifact for mm_sealed_envelope" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Extend render-artifact Edge Function to handle `mm_sealed_envelope` artifact type — personalized rendering (one PDF per player), uses `the-sealed-envelope.njk` template.

## Deliverables
- Handle `mm_sealed_envelope` artifact type in render-artifact
- Personalized rendering: one unique PDF per player
- Each PDF contains only that player's character epilogue
- Uses `the-sealed-envelope.njk` Nunjucks template
- Upload all personalized PDFs to Supabase Storage
- Return signed download URLs per player

## Files
- `supabase/functions/render-artifact/index.ts` (update)

## Dependencies
T051 (epilogue save API — data must exist)
BODY
)" \
  "spec:004-mystery,P2" \
  24

create_issue \
  "T053: Implement scheduled delivery" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Medium

## Description
Implement scheduled delivery: Supabase cron job or pg_cron that checks for due sealed_envelopes and triggers delivery at 10 AM local time.

## Deliverables
- Supabase cron job (pg_cron) that runs daily
- Check for sealed envelopes with delivery_date <= today
- Trigger delivery at 10 AM in recipient's local timezone
- Push notification to app players with deep link
- Email to web players with PDF attachment
- Mark as delivered after successful send
- Retry failed deliveries on next cron run

## Files
- Supabase cron job configuration
- Delivery trigger function

## Dependencies
T052 (sealed envelope rendering)
BODY
)" \
  "spec:004-mystery,P2" \
  24

create_issue \
  "T054: Implement host writing prompt notification" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Implement host writing prompt notification: scheduled 2 days post-game (N14 from notification catalog).

## Deliverables
- Schedule notification N14 for 2 days after game completion
- Notification content: reminder to write epilogues for Sealed Envelopes
- Deep link to EpilogueWritingScreen
- Respect notification preferences and quiet hours
- Only send if epilogues have not been started

## Files
- Notification scheduling implementation

## Dependencies
T050 (EpilogueWritingScreen exists as deep link target)
BODY
)" \
  "spec:004-mystery,P2" \
  24

create_issue \
  "T055: Implement weekly reminder flow" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P2 | **Estimate**: Low

## Description
Implement weekly reminder flow: if epilogues not written, remind weekly for 4 weeks.

## Deliverables
- Weekly reminder notification if epilogues not yet written
- Maximum 4 reminders (then stop)
- Deep link to EpilogueWritingScreen
- Respect notification preferences and quiet hours
- Stop reminders once epilogues are submitted
- Escalating urgency in reminder text (gentle -> encouraging -> final)

## Files
- Notification scheduling implementation

## Dependencies
T054 (initial writing prompt notification)
BODY
)" \
  "spec:004-mystery,P2" \
  24

# ============================================================
# Phase 10: User Story 8 — Society Page Photo (P3 -> Epic #24)
# ============================================================

create_issue \
  "T056: Create era-specific overlay assets" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P3 | **Estimate**: Medium

## Description
Create era-specific overlay assets (frames, filters) for 3-5 eras in `assets/overlays/murder-mystery/`.

## Deliverables
- Overlay frames for 3-5 eras (e.g., Victorian, Art Deco, 1970s, Modern Noir, Sci-Fi)
- Each overlay includes: decorative border frame, era-appropriate texture/filter, caption area styling
- PNG format with transparency
- Multiple resolution variants for different device screens
- Design consistent with organ-aesthetic.yaml

## Files
- `assets/overlays/murder-mystery/` (directory with overlay assets)

## Dependencies
Phase 2 complete (can run parallel with other user stories)
BODY
)" \
  "spec:004-mystery,P3" \
  24

create_issue \
  "T057: Create SocietyPageCameraScreen" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P3 | **Estimate**: High

## Description
Create SocietyPageCameraScreen in `src/features/murder-mystery/screens/SocietyPageCameraScreen.tsx` — camera view with period overlay (Expo Camera + react-native-skia or SVG overlay), character name captions, fictional date.

## Deliverables
- Camera view using Expo Camera
- Period-appropriate overlay (selected based on scenario era)
- Character name captions positioned on overlay
- Fictional date in era-appropriate format
- Front/back camera toggle
- Capture button with shutter animation
- Preview with retake/save options

## Files
- `src/features/murder-mystery/screens/SocietyPageCameraScreen.tsx`

## Dependencies
T056 (overlay assets must exist)
BODY
)" \
  "spec:004-mystery,P3" \
  24

create_issue \
  "T058: Implement photo compositing" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P3 | **Estimate**: Medium

## Description
Implement photo compositing: merge camera output with overlay, save high-resolution result to device camera roll and artifact library.

## Deliverables
- Merge camera capture with era overlay frame
- Composite character name captions and fictional date
- Save high-resolution result to device camera roll
- Save to artifact library (Supabase Storage)
- Share sheet integration for immediate sharing
- Multiple photo support (take multiple group photos)

## Files
- Photo compositing implementation

## Dependencies
T057 (SocietyPageCameraScreen)
BODY
)" \
  "spec:004-mystery,P3" \
  24

# ============================================================
# Phase 11: Polish (P1 -> Epic #24)
# ============================================================

create_issue \
  "T059: Create clue distribution utility" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Create clue distribution utility in `src/features/murder-mystery/utils/clueDistribution.ts` — tier-based sorting, suggested distribution timing.

## Deliverables
- Tier-based clue sorting (tier 1 = early/critical, tier 3 = late/supplementary)
- Suggested distribution timing per tier (Act I: tier 1, Act II early: tier 2, Act II late: tier 3)
- Distribution order recommendation based on player count and game pacing
- Utility functions: `sortByTier()`, `suggestTiming()`, `nextClueToDistribute()`
- Pure functions with no side effects

## Files
- `src/features/murder-mystery/utils/clueDistribution.ts`

## Dependencies
All user stories complete (can run parallel with T060)
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T060: Add navigation routes for all Murder Mystery screens" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Add navigation routes for all Murder Mystery screens to the app navigator.

## Deliverables
- Route definitions for all Murder Mystery screens
- Navigation flow: seed selection -> scenario review -> character assignment -> game night -> post-game
- Deep link support for character packet and artifact viewing
- Back navigation handling (confirm on dashboard exit)
- Type-safe navigation params

## Files
- App navigator configuration

## Dependencies
All screens complete (can run parallel with T059)
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T061: Error handling for Claude API, artifact, and sync failures" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Error handling: graceful fallbacks for Claude API failures (show curated seeds), artifact rendering failures (retry with simplified template), offline sync failures (exponential backoff).

## Deliverables
- Claude API failure: show curated seeds as fallback, display helpful error message
- Artifact rendering failure: retry with simplified template, queue for later retry
- Offline sync failure: exponential backoff (1s, 2s, 4s... max 60s)
- User-facing error messages that are helpful and non-technical
- Error logging for debugging (not user-visible)
- Network connectivity detection and proactive messaging

## Files
- Error handling updates across all services

## Dependencies
All user stories complete
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T062: Accessibility audit" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Accessibility: ensure all dashboard touch targets >= 48dp, ambient mode respects system font size, VoiceOver labels for all interactive elements.

## Deliverables
- Audit all touch targets (minimum 48dp)
- Ambient mode font scaling respects system text size setting
- VoiceOver/TalkBack labels on all interactive elements
- Correct reading order for screen readers
- Live region announcements for act transitions and timer events
- Reduce motion support (disable animations when system setting enabled)
- Color contrast validation in ambient mode

## Files
- Accessibility updates across all Murder Mystery components

## Dependencies
All screens complete (can run parallel with T059-T061)
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T063: Performance optimization" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Performance optimization: lazy-load ScenarioReview and EpilogueWriting screens, optimize local DB queries for game night dashboard.

## Deliverables
- Lazy-load ScenarioReviewScreen (not needed until seed confirmed)
- Lazy-load EpilogueWritingScreen (not needed until post-game)
- Optimize local SQLite queries for game night dashboard (index usage, query batching)
- Reduce re-renders in dashboard components (React.memo, useMemo where appropriate)
- Profile and fix any jank in ambient mode animations
- Memory usage audit for game night session

## Files
- Performance optimizations across Murder Mystery module

## Dependencies
All user stories complete
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T064: Run all quickstart.md validation scenarios" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Medium

## Description
Run all quickstart.md validation scenarios end-to-end.

## Deliverables
- Execute all validation scenarios from specs/004-murder-mystery/quickstart.md
- Document pass/fail for each scenario
- Fix any failures discovered during validation
- Verify: seed selection, character delivery, game night, accusations, artifacts, sealed envelopes
- Verify offline operation for all game night scenarios
- Verify cross-device sync after game night

## Files
- Validation results documentation

## Dependencies
All prior tasks complete
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T065: Write unit tests for clue distribution utility" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: Low

## Description
Write unit tests for clue distribution utility in `tests/unit/clueDistribution.test.ts`.

## Deliverables
- Test tier-based sorting (tier 1 before tier 2 before tier 3)
- Test suggested timing matches act structure
- Test distribution recommendations scale with player count
- Test edge cases: zero clues, single clue, all same tier
- Test `nextClueToDistribute()` returns correct clue
- Test pure function behavior (no side effects)

## Files
- `tests/unit/clueDistribution.test.ts`

## Dependencies
T059 (clue distribution utility, can run parallel)
BODY
)" \
  "spec:004-mystery,P1" \
  24

create_issue \
  "T066: Write E2E test for full Murder Mystery flow" \
  "$(cat <<'BODY'
**Spec**: 004 | **Priority**: P1 | **Estimate**: High

## Description
Write E2E test for full Murder Mystery flow in `tests/e2e/murderMysteryFlow.test.ts` — Maestro/Detox: session creation -> seed generation -> character delivery -> game night -> artifacts.

## Deliverables
- E2E test covering complete Murder Mystery lifecycle
- Session creation with Murder Mystery game type
- Seed selection (curated) or generation (mocked Claude API)
- Character assignment and delivery
- Full game night: Act I -> Act II -> Act III -> Reveal
- Accusation submission and awards voting
- Artifact generation (Dossier + Menu)
- Sealed envelope writing and scheduled delivery verification
- Test runs in CI with Maestro or Detox

## Files
- `tests/e2e/murderMysteryFlow.test.ts`

## Dependencies
All prior tasks complete
BODY
)" \
  "spec:004-mystery,P1" \
  24
