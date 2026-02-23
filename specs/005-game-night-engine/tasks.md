# 005 — Task List: Game Night Engine

Dependency-ordered implementation tasks. Each task includes priority marker, story reference, estimated complexity, and exact file paths.

**Legend**:
- `[P0]` — Launch requirement
- `[P]` — Can run in parallel (different files, no dependencies)
- `[Story: US-XXX]` — Maps to user story in spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Local database, ambient mode foundation, core types.

### Task 1: Local SQLite Schema and Database Module
`[P0]` `[Story: US-005]`

**Description**: Create the local SQLite database schema and database access module. This is the foundation for all game night data.

**Deliverables**:
- Create all 6 local SQLite tables per data-model.md section 1
- Database initialization function (create tables if not exist)
- TypeScript types for all local entities
- Database open/close lifecycle management

**Files**:
- `src/features/game-night/db/schema.ts`
- `src/features/game-night/db/queries.ts`
- `src/features/game-night/db/mutations.ts`
- `src/features/game-night/types/game-night.ts`

**Depends on**: Spec 001 Task 1 (Expo project initialized)
**Estimated complexity**: Medium

---

### Task 2: [P] Ambient Mode Constants and Theme
`[P0]` `[Story: US-001]`

**Description**: Define the ambient mode theme constants: colors, typography sizes, spacing, touch target minimums.

**Deliverables**:
- Ambient color palette (OLED black, warm amber, gold accents)
- Typography scale (18sp body, 24sp heading, 28sp phase name)
- Touch target constants (48dp minimum)
- Timing constants (30s auto-save, 30s undo window, animation durations)

**Files**:
- `src/constants/ambient-theme.ts`

**Depends on**: Nothing
**Estimated complexity**: Low

---

### Task 3: [P] Game Plugin Interface Definition
`[P0]` `[Story: All]`

**Description**: Define the TypeScript interface contract that game-specific modules implement. This is the contract between the dashboard shell and game plugins.

**Deliverables**:
- `GamePlugin` interface with phases, reference tabs, dashboard panel, callbacks
- `PhaseDefinition`, `ReferenceTabDefinition`, `GamePanelProps`, `ReferenceTabProps` types
- `PlayerAction` type union
- Plugin registry (static map: game_type -> GamePlugin)

**Files**:
- `src/features/game-night/types/game-plugin.ts`
- `src/features/game-night/types/phase.ts`
- `src/features/game-night/types/sync.ts`

**Depends on**: Nothing
**Estimated complexity**: Low

---

### Task 4: Server-Side Schema Migration
`[P0]` `[Story: US-008]`

**Description**: Create the server-side Supabase PostgreSQL tables for receiving synced game night data.

**Deliverables**:
- Create tables: `game_night_logs`, `game_night_summaries`, `written_answers`
- Create indexes per data-model.md section 3
- Enable RLS and create policies per data-model.md section 4

**Files**:
- `supabase/migrations/010_create_game_night_logs.sql`
- `supabase/migrations/011_create_game_night_summaries.sql`
- `supabase/migrations/012_create_written_answers.sql`
- `supabase/migrations/013_create_game_night_indexes.sql`
- `supabase/migrations/014_create_game_night_rls.sql`

**Depends on**: Spec 001 Task 3 (base schema exists)
**Estimated complexity**: Medium

---

## Phase 2: Dashboard Shell (Core UI)

**Purpose**: The ambient mode container and core dashboard components.

**Checkpoint**: After this phase, the dashboard shell renders with ambient mode, phase display, and player roster — but no interaction yet.

### Task 5: Ambient Mode Container Component
`[P0]` `[Story: US-001]`

**Description**: Create the ambient mode wrapper component that handles wake lock, brightness reduction, and dark theme application.

**Deliverables**:
- `AmbientContainer` component: wraps all dashboard content
- Wake lock activation/deactivation (expo-keep-awake)
- Brightness reduction on mount, restore on unmount (expo-brightness)
- OLED dark theme application
- Handles background/foreground transitions (re-engage wake lock on foreground)

**Files**:
- `src/features/game-night/components/AmbientContainer.tsx`
- `src/features/game-night/hooks/use-wake-lock.ts`
- `src/features/game-night/hooks/use-ambient-mode.ts`

**Depends on**: Task 2 (ambient theme constants)
**Estimated complexity**: Medium

---

### Task 6: [P] Pre-Cache Engine (Seed Local Database)
`[P0]` `[Story: US-005]`

**Description**: Implement the pre-cache engine that syncs session data from Supabase to local SQLite when the session transitions to ACTIVE.

**Deliverables**:
- Fetch session, participants, contributions, and game-specific data from Supabase
- Write all data to local SQLite tables
- Handle network failure gracefully (use previously cached data if available)
- Validate that critical data is present before allowing dashboard launch
- Report missing data (non-blocking warning)

**Files**:
- `src/features/game-night/db/seed.ts`

**Depends on**: Task 1 (local schema), Task 4 (server schema — for reading)
**Estimated complexity**: Medium

---

### Task 7: Zustand Dashboard Store
`[P0]` `[Story: US-001, US-002]`

**Description**: Create the Zustand store that holds the dashboard's reactive state, backed by SQLite for persistence.

**Deliverables**:
- Store state: current phase, turn position, player order, player status, timer state, undo state, game-specific state
- Actions: advance phase, undo phase, skip player, pass, add player, drop player, start/stop timer
- Write-through to SQLite on every state mutation
- Load initial state from SQLite on dashboard launch
- Auto-save subscription (30-second interval writes to game_night_log)

**Files**:
- `src/features/game-night/stores/game-night-store.ts`
- `src/features/game-night/hooks/use-game-night.ts`
- `src/features/game-night/hooks/use-auto-save.ts`

**Depends on**: Task 1 (local DB), Task 3 (types)
**Estimated complexity**: High

---

### Task 8: [P] Phase Timeline Component
`[P0]` `[Story: US-002]`

**Description**: Create the visual phase progression timeline — showing completed phases (checkmarks), current phase (highlighted), and upcoming phases (dimmed).

**Deliverables**:
- Horizontal timeline component with phase nodes
- Phase node states: completed (checkmark + gold), current (highlighted + amber), upcoming (dimmed)
- Current phase name displayed prominently (28sp)
- Reduce motion support (no transitions if system setting enabled)

**Files**:
- `src/features/game-night/components/PhaseTimeline.tsx`

**Depends on**: Task 2 (ambient theme), Task 3 (PhaseDefinition type)
**Estimated complexity**: Low

---

### Task 9: [P] Player Roster Component
`[P0]` `[Story: US-001, US-007]`

**Description**: Create the player roster showing all participants with turn indicator, status (active/dropped), and action controls for the host.

**Deliverables**:
- Player list with names, turn indicator (arrow or highlight), status badge
- Tap player name -> action menu: Skip Turn, Mark as Dropped, Reinstate (if dropped)
- "Add Player" button at bottom of roster
- Dropped players dimmed
- All touch targets >=48dp

**Files**:
- `src/features/game-night/components/PlayerRoster.tsx`

**Depends on**: Task 2 (ambient theme), Task 3 (types)
**Estimated complexity**: Medium

---

### Task 10: Phase Transition Dialog and Undo
`[P0]` `[Story: US-002]`

**Description**: Implement the phase transition confirmation dialog and the 30-second undo mechanism.

**Deliverables**:
- `PhaseTransitionDialog`: modal showing next phase name, description, confirm/cancel
- "Next Phase" button on dashboard (large, bottom of screen)
- `UndoBar`: appears after transition, disappears after 30 seconds
- Undo reverts phase, logs reversal
- 1-second cooldown between transitions (prevent accidental double-tap)

**Files**:
- `src/features/game-night/components/PhaseTransitionDialog.tsx`
- `src/features/game-night/components/UndoBar.tsx`

**Depends on**: Task 7 (store actions for phase transition), Task 8 (timeline updates)
**Estimated complexity**: Medium

---

### Task 11: Dashboard Main Screen Assembly
`[P0]` `[Story: US-001]`

**Description**: Assemble the complete dashboard screen: ambient container, phase timeline, player roster, game plugin slot, action buttons.

**Deliverables**:
- Dashboard screen layout: phase timeline (top), game plugin slot (middle), player roster (scrollable), action bar (bottom)
- "Next Phase" button (bottom, large)
- "Reference" icon (top-right corner, unobtrusive)
- "End Game Night" button (small, accessible but not prominent)
- Game plugin slot renders the active game's dashboard panel
- One-hand operation: all primary controls in bottom 60%

**Files**:
- `src/app/session/[id]/game-night/index.tsx`
- `src/app/session/[id]/game-night/_layout.tsx`
- `src/features/game-night/components/GamePluginSlot.tsx`

**Depends on**: Tasks 5, 7, 8, 9, 10 (all core components)
**Estimated complexity**: Medium

---

## Phase 3: Timer & Emergency Reference

**Purpose**: Optional timer and emergency reference overlay.

**Checkpoint**: After this phase, the dashboard is fully functional with timer and reference. Game-specific plugins are stubs.

### Task 12: Timer Ring Animation
`[P0]` `[Story: US-003]`

**Description**: Create the circular timer arc using React Native Reanimated. Visual countdown with warm amber-to-red color transition.

**Deliverables**:
- Circular arc animation (Reanimated animated SVG path or Canvas)
- Color transitions: amber (start) -> soft red (final minutes)
- Reduce motion fallback: static progress bar
- Gentle pulse animation on expiration (no alarm, no vibration)
- "Time's up" suggestion overlay (dismissable)

**Files**:
- `src/features/game-night/components/TimerRing.tsx`
- `src/features/game-night/hooks/use-timer.ts`

**Depends on**: Task 2 (theme), Task 7 (store for timer state)
**Estimated complexity**: High

---

### Task 13: [P] Timer Controls
`[P0]` `[Story: US-003]`

**Description**: Implement timer control panel: duration presets, pause, extend, dismiss.

**Deliverables**:
- Timer activation: tap timer icon -> preset selection (15/30/45/60/custom)
- Tap running timer -> control panel: Pause, +5 min, +15 min, Dismiss
- Timer auto-dismiss on phase transition
- Timer events logged to game_night_log

**Files**:
- `src/features/game-night/components/TimerControls.tsx`

**Depends on**: Task 12 (TimerRing), Task 7 (store actions for timer)
**Estimated complexity**: Medium

---

### Task 14: Emergency Reference Overlay
`[P0]` `[Story: US-004]`

**Description**: Create the full-screen reference overlay with game-specific tabs, search, and read-only display.

**Deliverables**:
- Full-screen modal overlay (slide up animation)
- Tab bar at top with game-specific tabs (from plugin.referenceTabs)
- Search bar filtering across all tabs
- Read-only display (no edit controls)
- Dismiss: swipe down or tap outside
- All data from local SQLite (zero network)

**Files**:
- `src/app/session/[id]/game-night/reference.tsx`

**Depends on**: Task 1 (local DB queries), Task 3 (ReferenceTabDefinition), Task 7 (store)
**Estimated complexity**: Medium

---

## Phase 4: Accessibility & Player Management

**Purpose**: Written answer mode, pass/skip, and mid-game player management.

**Checkpoint**: After this phase, all accessibility and player management features are complete.

### Task 15: Written Answer Mode — Player Input
`[P0]` `[Story: US-006]`

**Description**: Create the text input interface for players using written answer mode on their own device.

**Deliverables**:
- Text input field in ambient mode styling (player's device)
- "Submit" button sends answer to local log (and eventually to host via sync)
- Input visible only when it's the player's turn
- Works offline (answer stored locally, synced later)
- Uses the accessibility_preferences.written_answer_mode flag

**Files**:
- `src/features/game-night/components/WrittenAnswerInput.tsx`

**Depends on**: Task 7 (store), Task 2 (ambient theme)
**Estimated complexity**: Medium

---

### Task 16: [P] Written Answer Mode — Host Display
`[P0]` `[Story: US-006]`

**Description**: Display written answers on the host dashboard when "Show Written Answers" is enabled.

**Deliverables**:
- `WrittenAnswerDisplay` component: shows answer text with player name
- Appears inline in the dashboard when an answer is submitted
- Configured via session config: `show_written_answers` boolean
- Subtle notification for late answers (submitted after turn has passed)

**Files**:
- `src/features/game-night/components/WrittenAnswerDisplay.tsx`

**Depends on**: Task 7 (store), Task 11 (dashboard assembly)
**Estimated complexity**: Low

---

### Task 17: Pass/Skip Mechanics Implementation
`[P0]` `[Story: US-007]`

**Description**: Implement the pass (player-initiated) and skip (host-initiated) mechanics, including logging for artifact generation.

**Deliverables**:
- Host skip: via player roster action menu (Task 9 UI, this task adds logic)
- Player pass: via written answer mode interface or host proxy
- Both logged as events in game_night_log
- Neither announced to the room or highlighted in UI
- Chain continuation logic: next active player receives the turn

**Files**:
- Updates to `src/features/game-night/stores/game-night-store.ts` (skip/pass actions)
- Updates to `src/features/game-night/components/PlayerRoster.tsx` (action menu logic)

**Depends on**: Task 7 (store), Task 9 (roster)
**Estimated complexity**: Medium

---

### Task 18: Mid-Game Player Add/Drop
`[P0]` `[Story: US-007]`

**Description**: Implement adding a new player mid-game and marking a player as dropped.

**Deliverables**:
- "Add Player" form: name input only, appended to turn order
- "Mark as Dropped": player dimmed, turns auto-skipped
- "Reinstate": player restored to active, turns resume
- Murder Mystery: dropped character secrets visible in emergency reference
- All actions logged to game_night_log

**Files**:
- Updates to `src/features/game-night/stores/game-night-store.ts` (add/drop/reinstate)
- Updates to `src/features/game-night/components/PlayerRoster.tsx` (UI for add/drop)

**Depends on**: Task 7 (store), Task 9 (roster), Task 17 (skip mechanics — dropped players auto-skip)
**Estimated complexity**: Medium

---

## Phase 5: Sync Engine & Plugin Stubs

**Purpose**: Background sync after game night and game plugin stubs.

**Checkpoint**: After this phase, the full game night engine is complete. Game-specific plugins will be implemented in specs 003 and 004.

### Task 19: Sync Queue and Engine
`[P0]` `[Story: US-008]`

**Description**: Implement the sync queue that stores pending changes and the background engine that pushes them to the server.

**Deliverables**:
- Sync queue: add entries on game night actions, persist to sync_queue SQLite table
- Sync engine: process queue in background when connectivity available
- Exponential backoff on failure (1s, 2s, 4s... max 60s)
- Entry state management: pending -> in_progress -> completed/failed
- Pending sync indicator (subtle, host-visible)
- Queue survives app restart (persisted in SQLite)

**Files**:
- `src/features/game-night/sync/sync-queue.ts`
- `src/features/game-night/sync/sync-engine.ts`
- `src/features/game-night/hooks/use-sync-engine.ts`
- `src/features/game-night/components/SyncIndicator.tsx`

**Depends on**: Task 1 (sync_queue table), Task 7 (store)
**Estimated complexity**: High

---

### Task 20: [P] Supabase Edge Function: sync-game-night
`[P0]` `[Story: US-008]`

**Description**: Create the server-side Edge Function that receives game night data from the sync engine.

**Deliverables**:
- Validate request: auth, host ownership, session state
- Deduplicate events (by event ID)
- Insert events into game_night_logs
- Compute and insert/update game_night_summaries
- Insert written_answers
- Return sync status (synced, partial)

**Files**:
- `supabase/functions/sync-game-night/index.ts`

**Depends on**: Task 4 (server schema)
**Estimated complexity**: Medium

---

### Task 21: [P] Conflict Resolver
`[P0]` `[Story: US-008]`

**Description**: Implement the last-write-wins conflict resolver for sync.

**Deliverables**:
- Compare local and server timestamps
- Host device always wins for game night data
- Conflict log for debugging (written to local SQLite, not user-visible)
- Handle edge case: session resumed on different device (server state is base)

**Files**:
- `src/features/game-night/sync/conflict-resolver.ts`

**Depends on**: Task 19 (sync engine)
**Estimated complexity**: Low

---

### Task 22: [P] Confession Album Plugin Stub
`[P0]` `[Story: All]`

**Description**: Create a minimal Confession Album plugin that implements the GamePlugin interface with placeholder UI. Full implementation is in spec 003.

**Deliverables**:
- Implements `GamePlugin` interface
- Phase definitions: "The Board & The Tradition", "The Chain", "The Return", "The Portrait"
- Reference tabs: Player Roster, The Board, Game State, Contributions
- Dashboard panel: placeholder component showing phase-appropriate info
- Required data types: questions, board_state, contribution_archetypes

**Files**:
- `src/plugins/confession-album/plugin.ts`

**Depends on**: Task 3 (plugin interface)
**Estimated complexity**: Low

---

### Task 23: [P] Murder Mystery Plugin Stub
`[P0]` `[Story: All]`

**Description**: Create a minimal Murder Mystery plugin that implements the GamePlugin interface with placeholder UI. Full implementation is in spec 004.

**Deliverables**:
- Implements `GamePlugin` interface
- Phase definitions: "Arrival & Establishment", "The Crime", "Accusation & Reveal"
- Reference tabs: Player Roster, Game State, Full Solution, Contributions
- Dashboard panel: placeholder component showing act-appropriate info
- Required data types: characters, clues, timeline, solution, relationships

**Files**:
- `src/plugins/murder-mystery/plugin.ts`

**Depends on**: Task 3 (plugin interface)
**Estimated complexity**: Low

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Accessibility, performance, edge case handling, and testing.

### Task 24: [P] VoiceOver / TalkBack Accessibility Pass
`[P0]` `[Story: US-001]`

**Description**: Add accessibility labels, roles, and hints to all dashboard components.

**Deliverables**:
- `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on all interactive elements
- Correct reading order for phase timeline, player roster, action buttons
- Live region announcements for phase transitions and timer events
- Reduce motion support (Reanimated `useReducedMotion()`)

**Files**:
- Updates to all components in `src/features/game-night/components/`

**Depends on**: Tasks 5-18 (all components exist)
**Estimated complexity**: Medium

---

### Task 25: [P] Local Data Cleanup
`[P0]` `[Story: US-008]`

**Description**: Implement local database cleanup for sessions that have been synced.

**Deliverables**:
- On app launch: check for local data older than 7 days with completed sync
- Delete local SQLite data for those sessions
- Clean up sync_queue entries with "completed" status older than 24 hours

**Files**:
- Updates to `src/features/game-night/db/schema.ts` (cleanup function)

**Depends on**: Task 19 (sync engine)
**Estimated complexity**: Low

---

### Task 26: Expo OTA Update Deferral
`[P0]` `[Story: US-001]`

**Description**: Ensure Expo OTA updates are never applied during an active game night.

**Deliverables**:
- Check for ACTIVE session before allowing OTA update
- Defer update application to next cold launch when no session is ACTIVE
- Configure expo-updates to use manual update checking (not automatic)

**Files**:
- Updates to `src/app/_layout.tsx` (OTA update check logic)

**Depends on**: Task 7 (store — knows if session is ACTIVE)
**Estimated complexity**: Low

---

### Task 27: Integration Tests
`[P0]` `[Story: All]`

**Description**: Write integration tests for all critical paths defined in `quickstart.md`.

**Deliverables**:
- Test setup: local SQLite in-memory database + Supabase local (Docker)
- Dashboard launch tests: ambient mode activation, wake lock, brightness
- Phase progression tests: advance, undo, cooldown, phase completion
- Timer tests: start, pause, extend, dismiss, expiration, no auto-advance
- Offline tests: zero network calls during ACTIVE, auto-save, crash recovery
- Sync tests: queue processing, retry logic, deduplication, conflict resolution
- Player management tests: skip, pass, add, drop, reinstate
- Written answer tests: submit, display, logging
- Plugin tests: Confession Album and Murder Mystery stubs render phases correctly

**Files**:
- `tests/game-night/setup.ts`
- `tests/game-night/dashboard.test.ts`
- `tests/game-night/phases.test.ts`
- `tests/game-night/timer.test.ts`
- `tests/game-night/offline.test.ts`
- `tests/game-night/sync.test.ts`
- `tests/game-night/player-management.test.ts`
- `tests/game-night/written-answers.test.ts`
- `tests/game-night/plugins.test.ts`

**Depends on**: Tasks 1-26 (tests validate all prior work)
**Estimated complexity**: High

---

## Dependency Graph

```
Task 1 (SQLite schema) ──────┬── Task 6 (Pre-cache) ─────────┐
                              │                                 │
Task 2 (Ambient theme) ──────┼── Task 5 (Ambient container) ──┤
                              │                                 │
Task 3 (Plugin interface) ────┼── Task 8 (Phase timeline) ─────┤
                              │                                 │
                              ├── Task 9 (Player roster) ──────┤
                              │                                 │
                              └── Task 7 (Zustand store) ──────┤
                                      │                        │
                                      ├── Task 10 (Phase dialog/undo)
                                      │        │
                                      │        └── Task 11 (Dashboard assembly) ──┐
                                      │                                            │
                                      ├── Task 12 (Timer ring) ── Task 13 (Timer controls)
                                      │                                            │
                                      ├── Task 14 (Emergency reference)            │
                                      │                                            │
                                      ├── Task 15 (Written input)                  │
                                      ├── Task 16 (Written display) ───────────────┤
                                      │                                            │
                                      ├── Task 17 (Pass/skip) ── Task 18 (Add/drop)
                                      │                                            │
                                      └── Task 19 (Sync engine) ── Task 21 (Conflict resolver)
                                              │                            │
Task 4 (Server schema) ── Task 20 (Edge Fn) ──┘                           │
                                                                           │
Task 3 ── Task 22 (CA plugin stub) ───────────────────────────────────────┤
Task 3 ── Task 23 (MM plugin stub) ───────────────────────────────────────┤
                                                                           │
                                         Task 24 (A11y pass) ─────────────┤
                                         Task 25 (Cleanup) ───────────────┤
                                         Task 26 (OTA deferral) ──────────┤
                                                                           │
                                         Task 27 (Integration tests) ─────┘
```

---

## Estimated Timeline

| Phase | Tasks | Estimated Effort |
|-------|-------|-----------------|
| Phase 1: Setup | Tasks 1-4 | 3-4 days |
| Phase 2: Dashboard Shell | Tasks 5-11 | 5-7 days |
| Phase 3: Timer & Reference | Tasks 12-14 | 3-4 days |
| Phase 4: Accessibility | Tasks 15-18 | 3-4 days |
| Phase 5: Sync & Plugins | Tasks 19-23 | 4-5 days |
| Phase 6: Polish | Tasks 24-27 | 3-4 days |
| **Total** | **27 tasks** | **21-28 days** |

**Parallel opportunities**: Tasks 2, 3 can run parallel with Task 1. Tasks 8, 9 parallel with each other. Tasks 15, 16 parallel. Tasks 20, 21, 22, 23 all parallel. Tasks 24, 25, 26 all parallel.
