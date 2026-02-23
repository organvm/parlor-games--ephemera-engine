# Task List: 003-confession-album

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Last Updated**: 2026-02-23

---

## Dependency Order

Tasks are ordered by dependency. Later tasks depend on earlier ones completing. Tasks within the same phase can be parallelized where noted.

---

## Phase 1: Data Layer + Content Library

### T01: Define TypeScript types for Confession Album entities
- **[P0] [US-001, US-002, US-003]**
- Create `src/features/confession-album/types/confession-album.ts`
- Define interfaces: `QuestionItem`, `ChainEntry`, `ReturnEntry`, `ContributionItem`, `ConfessionAlbumConfig`, `PlayerOrder`
- Define content library type: `ContentQuestion`
- Define template data shapes: `AlbumTemplateData`, `ProustsAnswerTemplateData`
- Include all enums: lineage, register, domain, archetype, board_format, board_layout, status
- Reference: [data-model.md](./data-model.md) for full type definitions
- **Depends on**: None
- **Estimate**: 2 hours

### T02: Create WatermelonDB models and schema migration
- **[P0] [US-002]**
- Create WatermelonDB models: `src/db/models/QuestionItem.ts`, `ChainEntry.ts`, `ReturnEntry.ts`, `ContributionItem.ts`
- Define schema with indexed columns (session_id, question_id, turn_number)
- Write migration for v1 of the confession album schema
- Reference: [research.md](./research.md) §2 for WatermelonDB schema
- **Depends on**: T01
- **Estimate**: 3 hours

### T03: Create Supabase database migration
- **[P0] [US-001, US-002, US-003]**
- Write SQL migration for: `confession_album_question_items`, `confession_album_chain_entries`, `confession_album_return_entries`, `confession_album_contributions`, `content_questions`
- Define indexes, constraints, and CHECK constraints
- Configure Row-Level Security policies (session participants can read, host can write)
- Reference: [data-model.md](./data-model.md) §4 for full SQL
- **Depends on**: T01
- **Parallelizable with**: T02

- **Estimate**: 3 hours

### T04: Seed content library with base questions
- **[P0] [US-001]**
- Create seed script to populate `content_questions` table
- Include 35 Classic Proust questions with proust_response_1886 and proust_response_1892 fields
- Include 10 Vanity Fair questions, 10 Pivot/Lipton questions, 20 Thematic Remix questions
- Set lineage, register, domain, proust_adjacent, lineage_context, and tags for all questions
- Seed both Supabase and local WatermelonDB (bundled content)
- Reference: PRD §2.8.1 for content quantities, PRD §5.6 for content pack YAML format
- **Depends on**: T03
- **Estimate**: 6 hours (content authoring + scripting)

---

## Phase 2: Pre-Game Screens

### T05: Build Question Lineage Selector screen
- **[P0] [US-001]**
- Create `src/features/confession-album/screens/QuestionLineageSelector.tsx` (PRD Screen 11)
- Display 4 lineage options: Classic Proust, Vanity Fair, Pivot/Lipton, Thematic Remix
- Include "Surprise me" option (selects balanced mix via `questionFilters.ts`)
- Each lineage shows: name, question count, register range, brief description
- On selection, navigate to Board Preview with selected lineage pre-loaded
- Create `src/features/confession-album/components/LineagePicker.tsx`
- **Depends on**: T04
- **Estimate**: 4 hours

### T06: Build Board Preview and Question Curation screen
- **[P0] [US-001]**
- Create `src/features/confession-album/screens/BoardPreview.tsx` (PRD Screen 12)
- Display all questions from selected lineage in scrollable list
- Each question card shows: text, register badge, domain tag, lineage badge, Proust indicator
- Tap to toggle inclusion (selected/deselected)
- Long-press and drag to reorder (via `react-native-gesture-handler`)
- Running count bar: "13 / 13 suggested"
- Warning when count < guest_count or > guest_count + 10
- "Add from other lineages" button opens search/browse sheet
- Create utility: `src/features/confession-album/utils/questionFilters.ts`
- Create utility: `src/features/confession-album/utils/targetCountCalculator.ts`
- Create store: `src/features/confession-album/stores/questionSetStore.ts`
- Create hook: `src/features/confession-album/hooks/useQuestionSet.ts`
- Create components: `QuestionCard.tsx`, `RegisterBadge.tsx`
- Write tests: `questionFilters.test.ts`, `targetCountCalculator.test.ts`
- FR covered: FR-001 through FR-010
- **Depends on**: T05
- **Estimate**: 8 hours

### T07: Build Board Configuration screen
- **[P0] [US-006]**
- Create `src/features/confession-album/screens/BoardConfiguration.tsx` (PRD Screen 13)
- Board format selection: digital / physical / hybrid
- For digital: layout (grid/list), background, font size mode
- For physical: trigger printable card PDF generation
- Store: `src/features/confession-album/stores/boardConfigStore.ts`
- Save config to session via `ConfessionAlbumConfig` update
- FR covered: FR-046 through FR-050
- **Depends on**: T06
- **Parallelizable with**: T08

- **Estimate**: 4 hours

### T08: Build Contribution Archetype Assignment
- **[P0] [US-001]**
- Create `src/features/confession-album/components/ArchetypeAssigner.tsx`
- Three modes: auto-assign, manual, player-choice
- Auto-assign algorithm: `src/features/confession-album/utils/archetypeDistributor.ts`
  - Distribute 5 archetypes evenly across N players
  - Constraint: no archetype exceeds ceil(N/5) assignments
- Manual mode: host drags archetypes to player names
- Player-choice mode: players select from available archetypes (first-come)
- Hook: `src/features/confession-album/hooks/useContributionArchetypes.ts`
- Write test: `archetypeDistributor.test.ts`
- FR covered: FR-051 through FR-055
- **Depends on**: T04 (content library for archetype labels/instructions)
- **Parallelizable with**: T07
- **Estimate**: 4 hours

---

## Phase 3: Game Night Core

### T09: Build Digital Board display
- **[P0] [US-002]**
- Create `src/features/confession-album/screens/DigitalBoard.tsx` (PRD Screen 29)
- Grid layout (`BoardGrid.tsx`) as default. List layout (`BoardList.tsx`) as option.
- Each question displayed as `QuestionCardAnimated.tsx` with tap-to-select
- Question removal animation: 300ms fade + collapse via React Native Reanimated
- Gap preservation: removed cards remain as transparent placeholders
- Font scaling: `useBoard.ts` hook calculates font size based on remaining count
- Remaining count badge always visible
- Board operates entirely from WatermelonDB (reactive queries)
- FR covered: FR-011, FR-013, FR-014, FR-015, FR-020
- **Depends on**: T02, T07
- **Estimate**: 8 hours

### T10: Build Chain Tracker with turn state management
- **[P0] [US-002]**
- Create `src/features/confession-album/screens/ChainTracker.tsx` (PRD Screen 30)
- Display current player, inheritance step, choice step
- Integrate with Digital Board: tapping a question on the board records the choice
- "Remove" button to confirm and write ChainEntry to local DB
- Turn advancement logic in `chainStore.ts`
- Hook: `src/features/confession-album/hooks/useChain.ts`
- Dashboard layout: turn state indicator at top, board below, player order bar at bottom
- FR covered: FR-012, FR-016, FR-017, FR-018, FR-022
- Write test: `chainStore.test.ts`
- **Depends on**: T09
- **Estimate**: 6 hours

### T11: Implement bookmark, undo, and chain persistence
- **[P0] [US-002]**
- Bookmark toggle: `BookmarkButton.tsx`, one tap to bookmark a ChainEntry
- Undo mechanism: 10-second window managed in `chainStore.ts`
  - On "Remove": write ChainEntry, start 10s timer
  - On "Undo" within window: delete ChainEntry, revert question status
  - After 10s: undo option expires
- Auto-save: chain state written to WatermelonDB on every turn completion
- Background save: periodic save every 30 seconds via `setInterval`
- App lifecycle: save on `AppState` change to 'background'
- Recovery: `chainStore.ts` rehydrates from WatermelonDB on mount
- Validator: `src/features/confession-album/utils/chainValidator.ts` checks chain integrity (no gaps, no duplicate questions)
- Write test: `chainValidator.test.ts`
- FR covered: FR-019, FR-021
- **Depends on**: T10
- **Estimate**: 4 hours

### T12: Build Player Order configuration and turn order bar
- **[P0] [US-002]**
- Player order configuration in pre-game: seating / random / manual (drag-and-drop)
- `PlayerOrderBar.tsx`: horizontal bar at bottom of game night dashboard
- Shows all players in order. Current player highlighted. Completed turns grayed.
- Host excluded from order (shown separately as warm-up).
- Runtime reorder: host can reorder remaining players during game night
- FR covered: FR-056 through FR-059
- **Depends on**: T10
- **Parallelizable with**: T11
- **Estimate**: 4 hours

---

## Phase 4: Post-Game + Artifacts

### T13: Build The Portrait screen
- **[P2] [US-004]**
- Create `src/features/confession-album/screens/ThePortrait.tsx` (PRD Screen 31)
- Display all answer pairings from ChainEntry data
- Bookmarked pairs at top with gold accent highlight
- `AnswerPairCard.tsx`: shows question, chooser name + answer, inheritor name + answer
- Swipe navigation between pairs (horizontal `FlatList` with snap)
- Ambient mode: large text, warm cream background, minimal chrome
- "End Game Night" button transitions session to COMPLETE
- Hook: `src/features/confession-album/hooks/usePortrait.ts`
- FR covered: FR-034 through FR-038
- **Depends on**: T11
- **Estimate**: 5 hours

### T14: Build The Return variant screen
- **[P2] [US-004]**
- Activate via "Begin The Return" button (visible only when return_enabled and board is empty)
- Open-floor mode: simplified dashboard showing all questions that were asked
- Optional tracking: host can log ReturnEntry (asker, target, question) but is not required to
- "End The Return" transitions to Portrait mode
- FR covered: FR-034, FR-035
- **Depends on**: T11
- **Parallelizable with**: T13
- **Estimate**: 3 hours

### T15: Build artifact data assembler and template integration
- **[P0] [US-003]**
- Create `src/services/confession-album/artifactDataAssembler.ts`
- `assembleAlbumData()`: transforms ChainEntry[] + QuestionItem[] + ContributionItem[] into `AlbumTemplateData`
- `assembleProustsAnswerData()`: transforms per-player data into `ProustsAnswerTemplateData`
- Extend `artifacts/fixtures/confession-album.json` with chain and contributions data
- Update `artifacts/templates/confession-album/the-album.njk` to iterate `chain[]` instead of flat `answers[]`
  - Each question page shows chooser name + answer and inheritor name + answer
  - Bookmarked pairs get gold accent border
- Update `artifacts/templates/confession-album/contributions-table.njk` to show archetype, label, and description (not just completion matrix)
- Verify rendering: `npx ts-node artifacts/src/cli.ts the-album --data <updated-fixture>`
- FR covered: FR-023 through FR-033
- **Depends on**: T11 (chain data), T04 (content library)
- **Estimate**: 6 hours

### T16: Integrate artifact generation trigger with 006-artifact-pipeline
- **[P0] [US-003]**
- Wire "Generate Artifacts" button on post-game screen to call `generate-artifact` Edge Function
- Pass session_id and artifact_type='the-album'
- Implement polling for artifact status (pending -> generating -> ready)
- On ready: show preview in-app PDF viewer
- Implement distribution: push notification for app players, email for web players
- Reference: [contracts/openapi.yaml](./contracts/openapi.yaml) for API contracts
- FR covered: FR-029 through FR-033
- **Depends on**: T15, 006-artifact-pipeline
- **Estimate**: 4 hours

### T17: Implement Proust's Answer scheduled generation
- **[P2] [US-005]**
- Create scheduled job (Supabase pg_cron or external scheduler)
- At game_night_date + prousts_answer_delay_days:
  - Query all ChainEntries for the session
  - For each (player, question) pair:
    - If question has proust_response_1886 or proust_response_1892: direct pairing
    - If not: use proust_adjacent_question_id to find adjacent response + bridge text
  - Render prousts-answer.njk per player per question
  - Upload PDFs, create personalized Artifact records
  - Trigger push notification at 10 AM local: "A letter from the past has arrived"
  - Send email for web players
- FR covered: FR-039 through FR-045
- **Depends on**: T15 (assembler), T16 (artifact pipeline)
- **Estimate**: 6 hours

---

## Phase 5: Polish + Testing

### T18: End-to-end tests and constitution gate audit
- **[P0] [US-001, US-002, US-003]**
- Write integration tests for all 7 quickstart scenarios (see [quickstart.md](./quickstart.md)):
  - Full question set curation
  - Chain mechanic full game night
  - Offline game night resilience
  - Album artifact generation
  - Proust's Answer delayed delivery
  - Contribution archetype assignment
  - Player order and edge cases
- Run Vitest unit tests for all utilities and stores
- Run constitution gate audit checklist (see [checklists/requirements.md](./checklists/requirements.md))
- Performance profiling: Board Preview load < 1s, removal animation 300ms, album generation < 30s
- Accessibility audit: VoiceOver/TalkBack for all screens, reduce motion respect
- **Depends on**: All previous tasks
- **Estimate**: 8 hours

---

## Summary

| Phase | Tasks | Total Estimate | Priority Mix |
|-------|-------|---------------|-------------|
| Phase 1: Data Layer | T01-T04 | 14 hours | All P0 |
| Phase 2: Pre-Game | T05-T08 | 20 hours | P0 + P3 |
| Phase 3: Game Night | T09-T12 | 22 hours | All P0 |
| Phase 4: Post-Game | T13-T17 | 24 hours | P0 + P2 |
| Phase 5: Polish | T18 | 8 hours | P0 |
| **Total** | **18 tasks** | **88 hours** | |

### Critical Path

T01 -> T02 -> T09 -> T10 -> T11 -> T15 -> T16

This critical path covers: types -> local DB -> digital board -> chain tracker -> persistence -> artifact assembly -> artifact trigger. Everything else can be parallelized around it.
