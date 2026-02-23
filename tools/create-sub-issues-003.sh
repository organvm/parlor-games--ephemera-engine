# Spec 003: Confession Album — 18 tasks across 4 epics
# Sourced by create-sub-issues.sh — no shebang, no set flags

# ============================================================
# Epic #17: Data Layer & Content Library (Phase 1: T01-T04)
# ============================================================

create_issue \
  "T01: Define TypeScript types for Confession Album entities" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 2 hours

## Description
Create the TypeScript type definitions for all Confession Album entities. Define interfaces for game objects, content library types, template data shapes, and all associated enums.

## Deliverables
- Define interfaces: `QuestionItem`, `ChainEntry`, `ReturnEntry`, `ContributionItem`, `ConfessionAlbumConfig`, `PlayerOrder`
- Define content library type: `ContentQuestion`
- Define template data shapes: `AlbumTemplateData`, `ProustsAnswerTemplateData`
- Include all enums: lineage, register, domain, archetype, board_format, board_layout, status

## Files
- `src/features/confession-album/types/confession-album.ts`

## Dependencies
None
BODY
)" \
  "spec:003-album,P0" \
  17

create_issue \
  "T02: Create WatermelonDB models and schema migration" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 3 hours

## Description
Create WatermelonDB models for all Confession Album entities with indexed columns and a v1 schema migration.

## Deliverables
- Create WatermelonDB models: `QuestionItem.ts`, `ChainEntry.ts`, `ReturnEntry.ts`, `ContributionItem.ts`
- Define schema with indexed columns (session_id, question_id, turn_number)
- Write migration for v1 of the confession album schema

## Files
- `src/db/models/QuestionItem.ts`
- `src/db/models/ChainEntry.ts`
- `src/db/models/ReturnEntry.ts`
- `src/db/models/ContributionItem.ts`

## Dependencies
T01
BODY
)" \
  "spec:003-album,P0" \
  17

create_issue \
  "T03: Create Supabase database migration" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 3 hours

## Description
Write the SQL migration for all Confession Album tables with indexes, constraints, CHECK constraints, and Row-Level Security policies.

## Deliverables
- Write SQL migration for: `confession_album_question_items`, `confession_album_chain_entries`, `confession_album_return_entries`, `confession_album_contributions`, `content_questions`
- Define indexes, constraints, and CHECK constraints
- Configure RLS policies (session participants can read, host can write)

## Files
- `supabase/migrations/XXX_confession_album_tables.sql`

## Dependencies
T01 (parallelizable with T02)
BODY
)" \
  "spec:003-album,P0" \
  17

create_issue \
  "T04: Seed content library with base questions" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Create a seed script to populate the content_questions table with all four question lineages. Seed both Supabase and local WatermelonDB (bundled content).

## Deliverables
- Create seed script to populate `content_questions` table
- Include 35 Classic Proust questions with proust_response_1886 and proust_response_1892 fields
- Include 10 Vanity Fair questions, 10 Pivot/Lipton questions, 20 Thematic Remix questions
- Set lineage, register, domain, proust_adjacent, lineage_context, and tags for all questions
- Seed both Supabase and local WatermelonDB (bundled content)

## Files
- `supabase/seed/confession-album-questions.sql`
- `src/features/confession-album/data/bundled-questions.ts`

## Dependencies
T03
BODY
)" \
  "spec:003-album,P0" \
  17

# ============================================================
# Epic #18: Pre-Game Screens (Phase 2: T05-T08)
# ============================================================

create_issue \
  "T05: Build Question Lineage Selector screen" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Build the Question Lineage Selector screen (PRD Screen 11) displaying the four lineage options with a "Surprise me" balanced-mix option.

## Deliverables
- Create `QuestionLineageSelector.tsx` (PRD Screen 11)
- Display 4 lineage options: Classic Proust, Vanity Fair, Pivot/Lipton, Thematic Remix
- Include "Surprise me" option (selects balanced mix via `questionFilters.ts`)
- Each lineage shows: name, question count, register range, brief description
- On selection, navigate to Board Preview with selected lineage pre-loaded
- Create `LineagePicker.tsx` component

## Files
- `src/features/confession-album/screens/QuestionLineageSelector.tsx`
- `src/features/confession-album/components/LineagePicker.tsx`

## Dependencies
T04
BODY
)" \
  "spec:003-album,P0" \
  18

create_issue \
  "T06: Build Board Preview and Question Curation screen" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 8 hours

## Description
Build the Board Preview screen (PRD Screen 12) with scrollable question list, toggle inclusion, drag-and-drop reorder, running count bar, and cross-lineage browsing. Covers FR-001 through FR-010.

## Deliverables
- Create `BoardPreview.tsx` (PRD Screen 12)
- Question cards with toggle, reorder (drag-and-drop via react-native-gesture-handler), running count
- Warning when count < guest_count or > guest_count + 10
- "Add from other lineages" button opens search/browse sheet
- Create utilities: `questionFilters.ts`, `targetCountCalculator.ts`
- Create store: `questionSetStore.ts`
- Create hook: `useQuestionSet.ts`
- Create components: `QuestionCard.tsx`, `RegisterBadge.tsx`
- Write tests: `questionFilters.test.ts`, `targetCountCalculator.test.ts`

## Files
- `src/features/confession-album/screens/BoardPreview.tsx`
- `src/features/confession-album/utils/questionFilters.ts`
- `src/features/confession-album/utils/targetCountCalculator.ts`
- `src/features/confession-album/stores/questionSetStore.ts`
- `src/features/confession-album/hooks/useQuestionSet.ts`
- `src/features/confession-album/components/QuestionCard.tsx`
- `src/features/confession-album/components/RegisterBadge.tsx`
- `tests/confession-album/questionFilters.test.ts`
- `tests/confession-album/targetCountCalculator.test.ts`

## Dependencies
T05
BODY
)" \
  "spec:003-album,P0" \
  18

create_issue \
  "T07: Build Board Configuration screen" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Build the Board Configuration screen (PRD Screen 13) for selecting board format (digital/physical/hybrid) and configuring layout, background, and font size. Covers FR-046 through FR-050.

## Deliverables
- Create `BoardConfiguration.tsx` (PRD Screen 13)
- Board format selection: digital / physical / hybrid
- For digital: layout (grid/list), background, font size mode
- For physical: trigger printable card PDF generation
- Save config to session via `ConfessionAlbumConfig` update
- Create store: `boardConfigStore.ts`

## Files
- `src/features/confession-album/screens/BoardConfiguration.tsx`
- `src/features/confession-album/stores/boardConfigStore.ts`

## Dependencies
T06 (parallelizable with T08)
BODY
)" \
  "spec:003-album,P0" \
  18

create_issue \
  "T08: Build Contribution Archetype Assignment" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Build the Contribution Archetype Assignment component with three assignment modes and an even-distribution algorithm. Covers FR-051 through FR-055.

## Deliverables
- Create `ArchetypeAssigner.tsx` with three modes: auto-assign, manual, player-choice
- Auto-assign algorithm in `archetypeDistributor.ts` (distribute 5 archetypes evenly across N players; no archetype exceeds ceil(N/5) assignments)
- Manual mode: host drags archetypes to player names
- Player-choice mode: players select from available archetypes (first-come)
- Create hook: `useContributionArchetypes.ts`
- Write test: `archetypeDistributor.test.ts`

## Files
- `src/features/confession-album/components/ArchetypeAssigner.tsx`
- `src/features/confession-album/utils/archetypeDistributor.ts`
- `src/features/confession-album/hooks/useContributionArchetypes.ts`
- `tests/confession-album/archetypeDistributor.test.ts`

## Dependencies
T04 (content library for archetype labels/instructions; parallelizable with T07)
BODY
)" \
  "spec:003-album,P0" \
  18

# ============================================================
# Epic #19: Game Night Core (Phase 3: T09-T12)
# ============================================================

create_issue \
  "T09: Build Digital Board display" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 8 hours

## Description
Build the Digital Board screen (PRD Screen 29) with grid and list layouts, tap-to-select, removal animation, gap preservation, and font scaling. Operates entirely from WatermelonDB reactive queries. Covers FR-011, FR-013-015, FR-020.

## Deliverables
- Create `DigitalBoard.tsx` (PRD Screen 29)
- Grid layout (`BoardGrid.tsx`) as default, List layout (`BoardList.tsx`) as option
- Each question displayed as `QuestionCardAnimated.tsx` with tap-to-select
- Question removal animation: 300ms fade + collapse via React Native Reanimated
- Gap preservation: removed cards remain as transparent placeholders
- Font scaling: `useBoard.ts` hook calculates font size based on remaining count
- Remaining count badge always visible
- Board operates entirely from WatermelonDB (reactive queries)

## Files
- `src/features/confession-album/screens/DigitalBoard.tsx`
- `src/features/confession-album/components/BoardGrid.tsx`
- `src/features/confession-album/components/BoardList.tsx`
- `src/features/confession-album/components/QuestionCardAnimated.tsx`
- `src/features/confession-album/hooks/useBoard.ts`

## Dependencies
T02, T07
BODY
)" \
  "spec:003-album,P0" \
  19

create_issue \
  "T10: Build Chain Tracker with turn state management" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Build the Chain Tracker screen (PRD Screen 30) displaying current player, inheritance/choice steps, and turn advancement logic. Integrates with Digital Board for question selection. Covers FR-012, FR-016-018, FR-022.

## Deliverables
- Create `ChainTracker.tsx` (PRD Screen 30)
- Display current player, inheritance step, choice step
- Integrate with Digital Board: tapping a question on the board records the choice
- "Remove" button to confirm and write ChainEntry to local DB
- Turn advancement logic in `chainStore.ts`
- Dashboard layout: turn state indicator at top, board below, player order bar at bottom
- Create hook: `useChain.ts`
- Create store: `chainStore.ts`
- Write test: `chainStore.test.ts`

## Files
- `src/features/confession-album/screens/ChainTracker.tsx`
- `src/features/confession-album/hooks/useChain.ts`
- `src/features/confession-album/stores/chainStore.ts`
- `tests/confession-album/chainStore.test.ts`

## Dependencies
T09
BODY
)" \
  "spec:003-album,P0" \
  19

create_issue \
  "T11: Implement bookmark, undo, and chain persistence" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Implement bookmark toggle, 10-second undo window, auto-save, background save, app lifecycle save, and chain recovery from WatermelonDB. Covers FR-019, FR-021.

## Deliverables
- Bookmark toggle: `BookmarkButton.tsx`, one tap to bookmark a ChainEntry
- Undo mechanism: 10-second window managed in `chainStore.ts` (on "Remove": write ChainEntry + start 10s timer; on "Undo": delete ChainEntry + revert question status; after 10s: undo option expires)
- Auto-save: chain state written to WatermelonDB on every turn completion
- Background save: periodic save every 30 seconds via `setInterval`
- App lifecycle: save on `AppState` change to 'background'
- Recovery: `chainStore.ts` rehydrates from WatermelonDB on mount
- Validator: `chainValidator.ts` checks chain integrity (no gaps, no duplicate questions)
- Write test: `chainValidator.test.ts`

## Files
- `src/features/confession-album/components/BookmarkButton.tsx`
- `src/features/confession-album/utils/chainValidator.ts`
- `tests/confession-album/chainValidator.test.ts`

## Dependencies
T10
BODY
)" \
  "spec:003-album,P0" \
  19

create_issue \
  "T12: Build Player Order configuration and turn order bar" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Build the Player Order configuration (seating/random/manual with drag-and-drop) and the PlayerOrderBar horizontal bar component for the game night dashboard. Covers FR-056 through FR-059.

## Deliverables
- Player order configuration in pre-game: seating / random / manual (drag-and-drop)
- `PlayerOrderBar.tsx`: horizontal bar at bottom of game night dashboard
- Shows all players in order, current player highlighted, completed turns grayed
- Host excluded from order (shown separately as warm-up)
- Runtime reorder: host can reorder remaining players during game night

## Files
- `src/features/confession-album/components/PlayerOrderBar.tsx`
- `src/features/confession-album/components/PlayerOrderConfig.tsx`

## Dependencies
T10 (parallelizable with T11)
BODY
)" \
  "spec:003-album,P0" \
  19

# ============================================================
# Epic #20: Post-Game & Artifacts (Phases 4-5: T13-T18)
# ============================================================

create_issue \
  "T13: Build The Portrait screen" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P2 | **Estimate**: 5 hours

## Description
Build The Portrait screen (PRD Screen 31) displaying all answer pairings from ChainEntry data with bookmarked pairs highlighted, swipe navigation, and ambient mode. Covers FR-034 through FR-038.

## Deliverables
- Create `ThePortrait.tsx` (PRD Screen 31)
- Display all answer pairings from ChainEntry data
- Bookmarked pairs at top with gold accent highlight
- `AnswerPairCard.tsx`: shows question, chooser name + answer, inheritor name + answer
- Swipe navigation between pairs (horizontal `FlatList` with snap)
- Ambient mode: large text, warm cream background, minimal chrome
- "End Game Night" button transitions session to COMPLETE
- Create hook: `usePortrait.ts`

## Files
- `src/features/confession-album/screens/ThePortrait.tsx`
- `src/features/confession-album/components/AnswerPairCard.tsx`
- `src/features/confession-album/hooks/usePortrait.ts`

## Dependencies
T11
BODY
)" \
  "spec:003-album,P2" \
  20

create_issue \
  "T14: Build The Return variant screen" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P2 | **Estimate**: 3 hours

## Description
Build The Return variant screen with open-floor mode, optional tracking, and transition to Portrait. Covers FR-034, FR-035.

## Deliverables
- Activate via "Begin The Return" button (visible only when return_enabled and board is empty)
- Open-floor mode: simplified dashboard showing all questions that were asked
- Optional tracking: host can log ReturnEntry (asker, target, question) but is not required to
- "End The Return" transitions to Portrait mode

## Files
- `src/features/confession-album/screens/TheReturn.tsx`

## Dependencies
T11 (parallelizable with T13)
BODY
)" \
  "spec:003-album,P2" \
  20

create_issue \
  "T15: Build artifact data assembler and template integration" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 6 hours

## Description
Build the artifact data assembler that transforms game data into template-ready structures, and update the existing Nunjucks templates to consume chain and contribution data. Covers FR-023 through FR-033.

## Deliverables
- Create `artifactDataAssembler.ts` with `assembleAlbumData()` and `assembleProustsAnswerData()`
- `assembleAlbumData()`: transforms ChainEntry[] + QuestionItem[] + ContributionItem[] into `AlbumTemplateData`
- `assembleProustsAnswerData()`: transforms per-player data into `ProustsAnswerTemplateData`
- Extend `artifacts/fixtures/confession-album.json` with chain and contributions data
- Update `artifacts/templates/confession-album/the-album.njk` to iterate `chain[]` instead of flat `answers[]` (each question page shows chooser + inheritor answer pairs; bookmarked pairs get gold accent border)
- Update `artifacts/templates/confession-album/contributions-table.njk` to show archetype, label, and description
- Verify rendering: `npx ts-node artifacts/src/cli.ts the-album --data <updated-fixture>`

## Files
- `src/services/confession-album/artifactDataAssembler.ts`
- `artifacts/fixtures/confession-album.json` (updated)
- `artifacts/templates/confession-album/the-album.njk` (updated)
- `artifacts/templates/confession-album/contributions-table.njk` (updated)

## Dependencies
T11 (chain data), T04 (content library)
BODY
)" \
  "spec:003-album,P0" \
  20

create_issue \
  "T16: Integrate artifact generation trigger with 006-artifact-pipeline" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 4 hours

## Description
Wire the "Generate Artifacts" button on the post-game screen to call the `generate-artifact` Edge Function, implement polling for artifact status, and set up distribution via push and email.

## Deliverables
- Wire "Generate Artifacts" button to call `generate-artifact` Edge Function
- Pass session_id and artifact_type='the-album'
- Implement polling for artifact status (pending -> generating -> ready)
- On ready: show preview in-app PDF viewer
- Implement distribution: push notification for app players, email for web players

## Files
- `src/features/confession-album/screens/ArtifactGeneration.tsx`
- `src/features/confession-album/hooks/useArtifactStatus.ts`

## Dependencies
T15, spec 006-artifact-pipeline
BODY
)" \
  "spec:003-album,P0" \
  20

create_issue \
  "T17: Implement Proust's Answer scheduled generation" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P2 | **Estimate**: 6 hours

## Description
Implement the scheduled job that generates per-player Proust's Answer artifacts at a configured delay after game night, with push and email delivery.

## Deliverables
- Create scheduled job (Supabase pg_cron or external scheduler)
- At game_night_date + prousts_answer_delay_days: query all ChainEntries for the session
- For each (player, question) pair: if question has proust_response_1886/1892 use direct pairing; otherwise use proust_adjacent_question_id for adjacent response + bridge text
- Render prousts-answer.njk per player per question
- Upload PDFs, create personalized Artifact records
- Trigger push notification at 10 AM local: "A letter from the past has arrived"
- Send email for web players

## Files
- `supabase/functions/generate-prousts-answer/index.ts`
- `supabase/migrations/XXX_prousts_answer_cron.sql`

## Dependencies
T15 (assembler), T16 (artifact pipeline)
BODY
)" \
  "spec:003-album,P2" \
  20

create_issue \
  "T18: End-to-end tests and constitution gate audit" \
  "$(cat <<'BODY'
**Spec**: 003 | **Priority**: P0 | **Estimate**: 8 hours

## Description
Write integration tests for all 7 quickstart scenarios, run unit tests for all utilities and stores, perform a constitution gate audit, profile performance, and audit accessibility.

## Deliverables
- Integration tests for all 7 quickstart scenarios: full question set curation, chain mechanic full game night, offline game night resilience, album artifact generation, Proust's Answer delayed delivery, contribution archetype assignment, player order and edge cases
- Run Vitest unit tests for all utilities and stores
- Run constitution gate audit checklist (see checklists/requirements.md)
- Performance profiling: Board Preview load < 1s, removal animation 300ms, album generation < 30s
- Accessibility audit: VoiceOver/TalkBack for all screens, reduce motion respect

## Files
- `tests/confession-album/e2e/question-curation.test.ts`
- `tests/confession-album/e2e/chain-game-night.test.ts`
- `tests/confession-album/e2e/offline-resilience.test.ts`
- `tests/confession-album/e2e/album-artifact.test.ts`
- `tests/confession-album/e2e/prousts-answer.test.ts`
- `tests/confession-album/e2e/archetype-assignment.test.ts`
- `tests/confession-album/e2e/player-order.test.ts`

## Dependencies
All previous tasks (T01-T17)
BODY
)" \
  "spec:003-album,P0" \
  20
