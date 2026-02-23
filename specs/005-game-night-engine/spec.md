# 005 — Game Night Engine

Feature specification for the Game Night Dashboard shell: ambient mode, wake lock, phase progression, timer, emergency reference overlay, offline-first local database, sync protocol, written answer mode, pass/skip mechanics, and the plugin architecture that game-specific UI plugs into.

**Spec ID**: 005-game-night-engine
**Priority**: P0 (Launch Requirement)
**Status**: Draft
**Depends On**: 001-auth-and-sessions (ACTIVE state transition, local session caching, host/player identity)
**Depended On By**: 003-confession-album (game-specific dashboard panels), 004-murder-mystery (game-specific dashboard panels), 006-artifact-pipeline (COMPLETE state, game night data)

**PRD Sections**: 2.6 (Game Night Dashboard), 4.1 (Accessibility), 4.3 (Offline & Connectivity), 4.4 (Performance), 4.5 (Error Handling)

**Constitution Gates**: Analog Gate (critical), Offline Gate (critical), Simplicity Gate, Privacy Gate

---

## 1. User Stories

### US-001: Host Launches Game Night Dashboard (P1)

**As** a host who has completed pre-game preparation,
**I want** to launch the Game Night Dashboard in ambient mode,
**so that** I can orchestrate the evening from my phone without the screen demanding attention from the room.

**Why this priority**: The dashboard shell is the foundation. Without it, no game night can be facilitated through the app. This is the MVP of the entire spec.

**Independent Test**: Launch the dashboard, verify ambient mode (dark background, warm accents, large touch targets), wake lock active, screen brightness reduced. Confirm all UI is readable at arm's length.

#### Acceptance Scenarios

**Scenario 1a: Dashboard launch from session**
```
Given I am the host of a session in PREPARING state
When I tap "Start Game Night" and confirm
Then the session transitions to ACTIVE state
And the Game Night Dashboard launches in ambient mode
And all session data is available from local storage (no network required)
And the transition completes in <1 second
```

**Scenario 1b: Ambient mode activation**
```
Given the Game Night Dashboard has launched
Then the screen uses a dark background with warm amber/gold accent colors
And all text uses large, readable sizes (minimum 18sp body, 24sp headings)
And all touch targets are >=48dp
And the system brightness is reduced (prompt user for permission if needed)
And a wake lock prevents the screen from auto-sleeping
And OLED-friendly pure black is used for background areas
```

**Scenario 1c: Dashboard layout**
```
Given the Game Night Dashboard is active
Then I see the current phase name prominently displayed
And I see the player roster with names visible
And I see a "Next Phase" button (large, bottom-of-screen)
And I see a "Reference" icon (corner, unobtrusive)
And I see an "End Game Night" button (small, requires deliberate tap)
And the entire layout is operable with one hand
```

**Scenario 1d: Resume after backgrounding**
```
Given the Game Night Dashboard was active
When I switch away from the app and return
Then the dashboard resumes from its current state instantly (<500ms)
And the wake lock re-engages
And no data has been lost
```

---

### US-002: Host Progresses Through Game Phases (P1)

**As** a host orchestrating the evening,
**I want** to advance through game phases at my own pace,
**so that** I can read the room and transition when the moment is right — not when a timer forces me.

**Why this priority**: Phase progression is how the host structures the evening. Without it, the dashboard is a static display.

**Independent Test**: Walk through all phases for a game, verifying transitions, confirmations, undo capability, and phase history.

#### Acceptance Scenarios

**Scenario 2a: Advance to next phase**
```
Given I am on the Game Night Dashboard in Act I
When I tap "Next Phase"
Then I see a confirmation dialog: "Ready to move to Act II: [Phase Name]?"
And the dialog shows what changes in the next phase
When I confirm
Then the phase transitions with a subtle animation (<500ms)
And the dashboard updates to show the new phase
And the previous phase appears as completed (checkmark)
And the phase transition is logged locally with timestamp
```

**Scenario 2b: Accidental transition undo**
```
Given I just confirmed a phase transition within the last 30 seconds
When I tap the "Undo" indicator that appears after transition
Then the phase reverts to the previous state
And the transition log records the reversal
And after 30 seconds, the undo option disappears
```

**Scenario 2c: Phase completion tracking**
```
Given I have progressed through multiple phases
Then I see a visual timeline showing completed phases (checkmarks), current phase (highlighted), and upcoming phases (dimmed)
And the timeline is glanceable — visible at a glance without scrolling
```

**Scenario 2d: Game-specific phase names**
```
Given I am hosting a Confession Album session
Then the phases are: "The Board & The Tradition", "The Chain", "The Return" (if enabled), "The Portrait"

Given I am hosting a Murder Mystery session
Then the phases are: "Arrival & Establishment", "The Crime", "Accusation & Reveal"
```

---

### US-003: Host Uses Optional Timer (P2)

**As** a host who wants gentle time guidance,
**I want** to set an optional timer for specific phases,
**so that** I have a visual cue without the timer controlling the room.

**Why this priority**: Timer is enhancement, not foundation. The design principle is "no timer" by default. This adds optional scaffolding for hosts who want pacing assistance.

**Independent Test**: Enable timer, verify visual countdown, pause, extend, dismiss. Confirm timer never forces a transition.

#### Acceptance Scenarios

**Scenario 3a: Timer is off by default**
```
Given I launch the Game Night Dashboard
Then no timer is visible
And no countdown is running
And no time pressure is communicated to the room
```

**Scenario 3b: Enable timer for a phase**
```
Given I am on the dashboard during a phase
When I tap the timer icon
Then a timer configuration appears: preset durations (15, 30, 45, 60 min) and custom
When I select a duration
Then a visual countdown begins — a circular progress arc, not a digital clock
And the countdown uses warm colors (amber dimming to soft red in final minutes)
And there is no audible alarm
```

**Scenario 3c: Timer expiration**
```
Given a timer is running and reaches zero
Then the timer visual pulses gently (no alarm, no vibration by default)
And a "Time's up — move on?" suggestion appears
And the host can dismiss it and continue the current phase
And the timer NEVER automatically advances to the next phase
```

**Scenario 3d: Timer controls**
```
Given a timer is running
When I tap the timer
Then I see: Pause, +5 minutes, +15 minutes, Dismiss
And pausing freezes the countdown
And extending adds time to the remaining duration
And dismissing removes the timer entirely
```

---

### US-004: Host Accesses Emergency Reference (P2)

**As** a host who needs to check a detail mid-game,
**I want** quick access to the full game state without leaving the dashboard,
**so that** I can resolve questions or check secrets without disrupting flow.

**Why this priority**: Emergency reference prevents the host from needing to exit the dashboard or scroll through configuration screens. Important for confidence, but the game can technically proceed without it.

**Independent Test**: Open reference overlay, navigate tabs, search, dismiss. Verify all data is present and read-only. Confirm it works offline.

#### Acceptance Scenarios

**Scenario 4a: Open reference overlay**
```
Given I am on the Game Night Dashboard
When I tap the "Reference" icon
Then a full-screen overlay slides up over the dashboard
And the overlay opens in <300ms
And the dashboard ambient mode remains visible beneath (subtle blur)
```

**Scenario 4b: Reference content — Confession Album**
```
Given the reference overlay is open for a Confession Album session
Then I see tabs for:
  - Player Roster (names, turn order, contribution archetypes)
  - The Board (remaining questions, removed questions with who chose them)
  - Game State (current phase, chain position, passes/skips)
  - Contributions (what each guest brought)
```

**Scenario 4c: Reference content — Murder Mystery**
```
Given the reference overlay is open for a Murder Mystery session
Then I see tabs for:
  - Player Roster (names, character names, character secrets)
  - Game State (current act, clues distributed, clues remaining)
  - Full Solution (murderer, motive, weapon, timeline, red herrings)
  - Contributions (food/drink, dress, props per character)
```

**Scenario 4d: Reference is searchable**
```
Given the reference overlay is open
When I type in the search bar at the top
Then results filter across all tabs (player names, character names, question text, clue text)
And search operates on local data with <100ms response time
```

**Scenario 4e: Reference is read-only**
```
Given the reference overlay is open
Then there are no edit controls, no toggles, no configuration options
And tapping any content does nothing (no accidental modifications)
And swiping down or tapping outside dismisses the overlay
```

---

### US-005: Game Night Operates Fully Offline (P1)

**As** a host at a dinner party with unreliable WiFi,
**I want** the entire Game Night Dashboard to work without internet,
**so that** a dropped connection never interrupts the evening.

**Why this priority**: Offline capability is a constitutional requirement (Offline Gate). The game lives in the room, not on a server. This is co-equal with US-001.

**Independent Test**: Enable airplane mode. Launch game night. Progress through all phases. Confirm zero errors, zero loading spinners, zero network-related UI.

#### Acceptance Scenarios

**Scenario 5a: Pre-cache on ACTIVE transition**
```
Given a session is in PREPARING state
When the host taps "Start Game Night"
Then ALL session data is synced to the local database before the dashboard launches
And the sync includes: session config, player roster, game-specific data (questions, characters, clues), contributions
And if the sync fails (no network), the transition still proceeds using whatever data was previously cached
And a warning is shown only if critical data is missing
```

**Scenario 5b: Zero network requests during ACTIVE**
```
Given the session is in ACTIVE state
Then the dashboard makes zero network requests
And all reads come from the local SQLite database
And all writes (phase transitions, bookmarks, annotations) go to the local database
And no loading spinners, no "connecting..." messages, no network error toasts appear
```

**Scenario 5c: Local state persistence**
```
Given the Game Night Dashboard is active
Then the local database auto-saves state every 30 seconds
And the auto-save includes: current phase, turn position, timer state, player status, annotations
And if the app crashes, restarting resumes from the last auto-save
```

**Scenario 5d: Sync on reconnect**
```
Given the session was active offline
When the device regains network connectivity (either during or after game night)
Then local changes are pushed to the server in the background
And the sync uses last-write-wins for simple fields (host device is authoritative)
And the sync is non-blocking (no UI interruption)
And if sync fails, changes remain queued for the next attempt
```

**Scenario 5e: Session recovery on different device**
```
Given the host's device fails during game night
When the host logs in on a different device
Then the most recent server-synced state is loaded
And the host sees a "Resume Game Night" option
And any un-synced local state from the failed device is lost (server state is used)
```

---

### US-006: Written Answer Mode (P2)

**As** a player who finds spontaneous verbal performance difficult,
**I want** to type my answers on my phone instead of speaking aloud,
**so that** I can participate at my comfort level without the group noticing a different mode.

**Why this priority**: Accessibility is a design principle, not an afterthought. Written answer mode enables participation for neurodivergent players, non-native speakers, and shy guests.

**Independent Test**: Enable written answer mode in settings. During a game night, type an answer. Verify it appears on the host dashboard (if enabled) or is available for the player to read aloud.

#### Acceptance Scenarios

**Scenario 6a: Player enables written answer mode**
```
Given I am a player with the app installed
When I enable "Written Answer Mode" in Settings -> Accessibility
Then during game night, my phone shows a text input field when it is my turn
And the text input uses the ambient mode styling (dark background, warm accents)
And a "Submit" button sends my written response
```

**Scenario 6b: Written answer display on host dashboard**
```
Given a player has submitted a written answer
And the host has "Show Written Answers" enabled in session config
Then the host dashboard displays the written answer with the player's name
And the host can choose to read it aloud or let the player read it themselves
```

**Scenario 6c: Written answer mode is invisible to other players**
```
Given a player is using written answer mode
Then other players' devices show no indication that the answering player typed rather than spoke
And the mode is not announced or highlighted in any game UI
```

---

### US-007: Host Manages Player Turns — Pass/Skip (P2)

**As** a host managing the flow of the evening,
**I want** to skip a player's turn or let a player pass,
**so that** the game adapts to the room's dynamics without anyone feeling singled out.

**Why this priority**: Pass/skip enables graceful handling of player drops, shy guests, and timing. Important for a polished experience but the core game loop works without it.

**Independent Test**: During a game, skip a player. During a game, a player passes. Verify the chain continues correctly in both cases. Verify the pass is recorded for artifact generation but not announced.

#### Acceptance Scenarios

**Scenario 7a: Host skips a player**
```
Given I am the host and it is Player X's turn
When I tap the "Skip" option next to Player X's name
Then the turn passes to the next player in order
And the skip is logged locally (for artifact generation to handle gracefully)
And no announcement or notification is sent to the group
```

**Scenario 7b: Player passes on a question (Confession Album)**
```
Given it is my turn to answer the inherited question
When I indicate a pass (via the host, or via my own device if written answer mode is active)
Then the chain continues — the inherited question is answered only by the chooser
And the pass is logged for the host's reference
And the pass is not visibly announced or highlighted
```

**Scenario 7c: Mid-game player addition**
```
Given a game night is in progress
When the host taps "Add Player" on the dashboard
And enters the new player's name
Then the player is added to the end of the current turn order
And they can participate from the next round
And they have no contribution archetype (just a name in the roster)
```

**Scenario 7d: Player drop handling**
```
Given a player leaves or their device crashes during game night
When the host taps the player's name and selects "Mark as Dropped"
Then the player is visually dimmed in the roster
And their turns are automatically skipped for the remainder
And for Murder Mystery: their character secrets appear in the host's emergency reference
```

---

### US-008: Game Night Data Syncs After Session Ends (P3)

**As** the system,
**I want** to sync all local game night data to the server when the session completes,
**so that** the artifact pipeline has complete data for generation.

**Why this priority**: Sync is necessary for artifact generation but happens after the critical game night experience. Lower priority because the game night itself works without it.

**Independent Test**: Complete a game night offline. Restore connectivity. Verify all local data syncs to the server. Verify the artifact pipeline can access complete session data.

#### Acceptance Scenarios

**Scenario 8a: Sync on session completion**
```
Given the host taps "End Game Night"
And the session transitions to COMPLETE state
Then the sync engine pushes all local game night data to the server
And the sync includes: phase transition log, player actions, timer usage, passes/skips, written answers, annotations
And sync progress is shown subtly (not blocking the UI)
```

**Scenario 8b: Sync retry on failure**
```
Given sync fails due to network issues
Then the sync engine retries with exponential backoff (1s, 2s, 4s, 8s, max 60s)
And pending sync data is persisted to local storage (survives app restart)
And the host sees a small indicator: "Game night data pending sync"
And sync completes automatically when connectivity resumes
```

**Scenario 8c: Conflict resolution**
```
Given the host's local data and server data diverge
Then the host device's data always wins (host is authoritative for game night)
And server data is overwritten with local data
And a conflict log is created for debugging (not user-visible)
```

---

## 2. Functional Requirements

### Dashboard Shell

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Dashboard SHALL launch in ambient mode: dark background, warm amber/gold accents, OLED-friendly | P0 |
| FR-002 | Dashboard SHALL activate a wake lock preventing screen auto-sleep during ACTIVE state | P0 |
| FR-003 | Dashboard SHALL request reduced screen brightness on launch (respecting user override) | P0 |
| FR-004 | All touch targets on the dashboard SHALL be >=48dp | P0 |
| FR-005 | Dashboard SHALL be operable with one hand (all primary controls reachable in bottom 60% of screen) | P0 |
| FR-006 | Dashboard SHALL display current phase name, phase progress timeline, and player roster | P0 |
| FR-007 | Dashboard SHALL load in <1 second from ACTIVE state transition | P0 |
| FR-008 | Dashboard SHALL resume from background in <500ms with no data loss | P0 |

### Phase Progression

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009 | Host SHALL advance phases via a confirmation dialog ("Ready to move to [Phase Name]?") | P0 |
| FR-010 | Phase transitions SHALL complete in <500ms with a subtle animation | P0 |
| FR-011 | Host SHALL be able to undo a phase transition within 30 seconds | P0 |
| FR-012 | Phase history SHALL display as completed checkmarks in a visual timeline | P0 |
| FR-013 | Phase names SHALL be game-specific (defined by the game plugin) | P0 |
| FR-014 | All phase transitions SHALL be logged locally with timestamp | P0 |

### Timer

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | Timer SHALL be off by default — no timer visible unless the host enables it | P0 |
| FR-016 | Timer SHALL display as a visual arc/ring, not a digital clock | P0 |
| FR-017 | Timer SHALL support pause, extend (+5/+15 min), and dismiss controls | P0 |
| FR-018 | Timer expiration SHALL pulse gently with no audible alarm by default | P0 |
| FR-019 | Timer SHALL NEVER automatically advance to the next phase | P0 |
| FR-020 | Timer preset durations SHALL include 15, 30, 45, 60 minutes and custom | P1 |

### Emergency Reference

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021 | Reference overlay SHALL open in <300ms as a full-screen sheet over the dashboard | P0 |
| FR-022 | Reference overlay SHALL contain game-specific tabs (defined by game plugin) | P0 |
| FR-023 | Reference overlay SHALL include a search bar filtering across all tabs | P0 |
| FR-024 | Reference overlay SHALL be read-only — no edit controls | P0 |
| FR-025 | Reference overlay SHALL operate entirely from local data | P0 |
| FR-026 | Reference overlay SHALL be dismissable by swipe-down or tap-outside | P0 |

### Offline & Sync

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-027 | ALL game night features SHALL work with zero network connectivity | P0 |
| FR-028 | All session data SHALL be synced to local SQLite before dashboard launch | P0 |
| FR-029 | Dashboard SHALL make zero network requests during ACTIVE state | P0 |
| FR-030 | Local database SHALL auto-save state every 30 seconds | P0 |
| FR-031 | On app restart during ACTIVE state, dashboard SHALL resume from last auto-save | P0 |
| FR-032 | Sync engine SHALL push local changes to server when connectivity resumes | P0 |
| FR-033 | Sync SHALL use last-write-wins with host device as authoritative | P0 |
| FR-034 | Sync SHALL be non-blocking (no UI interruption) | P0 |
| FR-035 | Failed sync attempts SHALL retry with exponential backoff (max 60s) | P0 |
| FR-036 | Pending sync data SHALL persist to local storage (survive app restart) | P0 |

### Accessibility

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-037 | Written answer mode SHALL allow players to type responses on their own device | P0 |
| FR-038 | Written answers SHALL appear on host dashboard when "Show Written Answers" is enabled | P0 |
| FR-039 | Written answer mode SHALL be invisible to other players | P0 |
| FR-040 | Host SHALL be able to skip any player's turn without announcement | P0 |
| FR-041 | Players SHALL be able to pass on any question without stigma or announcement | P0 |
| FR-042 | Passes/skips SHALL be logged for artifact generation but not visibly highlighted | P0 |
| FR-043 | Dashboard SHALL support VoiceOver (iOS) and TalkBack (Android) | P0 |
| FR-044 | No flashing animations or rapid visual changes on the dashboard | P0 |
| FR-045 | Reduce motion setting SHALL be respected for all dashboard animations | P0 |

### Player Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-046 | Host SHALL be able to add a player mid-game (appended to turn order) | P0 |
| FR-047 | Host SHALL be able to mark a player as dropped (turns auto-skipped) | P0 |
| FR-048 | Dropped player's game data SHALL remain accessible in emergency reference | P0 |
| FR-049 | Player roster SHALL display current turn indicator and turn order | P0 |

### Plugin Architecture

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-050 | Dashboard SHALL accept game-specific phase definitions via a plugin interface | P0 |
| FR-051 | Dashboard SHALL render game-specific UI panels within designated slots | P0 |
| FR-052 | Dashboard SHALL pass game state to plugins and receive game-specific actions | P0 |
| FR-053 | Emergency reference tabs SHALL be defined by the game plugin | P0 |

---

## 3. Key Entities

These entities define the data boundary for this spec. Full schema in `data-model.md`.

### GameNightLog

The primary local entity tracking all game night activity.

- `id` (UUID) — unique log identifier
- `session_id` (UUID, FK) — references Session
- `phase_transitions` (JSON array) — [{phase, timestamp, source: 'advance'|'undo'}]
- `player_actions` (JSON array) — [{player_id, action: 'pass'|'skip'|'answer'|'drop'|'add', timestamp, metadata}]
- `timer_events` (JSON array) — [{action: 'start'|'pause'|'extend'|'dismiss'|'expire', duration, timestamp}]
- `written_answers` (JSON array) — [{player_id, question_id, answer_text, timestamp}]
- `auto_save_at` (timestamptz) — last auto-save timestamp
- `sync_status` (enum) — pending, syncing, synced, failed
- `created_at` (timestamptz)

### GameNightLocalState

The local-only working state of the dashboard.

- `session_id` (UUID) — the active session
- `current_phase_index` (integer) — index into the phase list
- `turn_position` (integer) — current player index in turn order
- `player_order` (UUID array) — ordered list of participant IDs
- `player_status` (JSON object) — {player_id: 'active'|'dropped'|'added'}
- `timer_state` (JSON) — {running, remaining_ms, total_ms} or null
- `undo_available_until` (timestamptz, nullable) — undo window expiry
- `game_specific_state` (JSON) — passed to/from game plugin

### SyncQueue

Local queue of changes pending server sync.

- `id` (UUID) — queue entry identifier
- `session_id` (UUID) — which session this belongs to
- `operation` (enum) — 'game_night_log'|'phase_transition'|'session_complete'
- `payload` (JSON) — the data to sync
- `status` (enum) — pending, in_progress, completed, failed
- `retry_count` (integer) — number of sync attempts
- `created_at` (timestamptz)
- `last_attempt_at` (timestamptz, nullable)

---

## 4. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard load time | <1 second | From "Start Game Night" tap to dashboard visible |
| Phase transition speed | <500ms | From confirmation tap to new phase displayed |
| Reference overlay open | <300ms | From tap to overlay fully visible |
| Wake lock reliability | 100% | Screen never auto-sleeps during ACTIVE state |
| Touch target size | >=48dp | All interactive elements measured |
| Offline operation | 100% | Zero network requests during ACTIVE state |
| Auto-save frequency | Every 30 seconds | Verified by local DB timestamps |
| Crash recovery | <5 seconds | From app restart to dashboard resumed |
| Sync completion | <30 seconds | From connectivity restored to data synced |
| Background resume | <500ms | From app foreground to dashboard interactive |
| Timer never forces transition | 100% | Timer expiration never triggers phase change |
| Written answer delivery | <2 seconds | From player submit to host dashboard display |

---

## 5. Edge Cases

### 5.1 Host Device Crash

The host's phone crashes, runs out of battery, or the app is force-killed during game night.

**Handling**:
- Local state auto-saved every 30 seconds
- On app restart: detect session in ACTIVE state, show "Resume Game Night" prompt
- Dashboard resumes from last auto-save — maximum 30 seconds of lost actions
- Wake lock re-engages on resume
- No data loss for any action completed more than 30 seconds ago

### 5.2 Host Disconnects Mid-Game

Network connectivity drops during game night (common at dinner parties).

**Handling**:
- No impact on dashboard operation — dashboard reads only from local DB
- Sync queue accumulates changes silently
- No error messages, no loading indicators, no connectivity warnings during ACTIVE state
- When connectivity resumes (possibly hours later), sync happens in background

### 5.3 Player Drops Mid-Game

A player leaves the room, their phone dies, or they need to step away.

**Handling**:
- Host taps player name -> "Mark as Dropped"
- Player dimmed in roster, turns auto-skipped
- For Confession Album: chain passes over dropped player (inheritance goes to next active player)
- For Murder Mystery: dropped character becomes host-controlled NPC; secrets visible in emergency reference
- Dropped player can be "reinstated" if they return

### 5.4 Mid-Game Player Addition

An unexpected guest arrives during game night.

**Handling**:
- Host taps "Add Player" on roster
- Enters name only (no account, no contribution archetype)
- Player added to end of turn order
- For Confession Album: joins the chain from their insertion point
- For Murder Mystery: host assigns a "late arrival" character from emergency reference

### 5.5 Phase Transition During Timer

Host advances phase while a timer is still running.

**Handling**:
- Timer is automatically dismissed on phase transition
- No warning — the host's phase decision overrides the timer
- Timer state is logged (so artifact pipeline knows how timing played out)

### 5.6 Rapid Phase Transitions

Host accidentally double-taps "Next Phase" or transitions too quickly.

**Handling**:
- Confirmation dialog prevents single-tap accidents
- 30-second undo window catches double-tap accidents
- Minimum 1-second cooldown between phase transitions (button disabled briefly)

### 5.7 Written Answer Arrives After Turn Passes

A player using written answer mode submits their answer after the host has already moved on.

**Handling**:
- Answer is still recorded in the log (for artifact generation)
- Host sees a subtle notification: "[Player] submitted a written answer for the previous turn"
- The game flow is not interrupted or rewound

### 5.8 Multiple Devices in Session

Multiple players have the app open during game night (not just the host).

**Handling**:
- Player devices show a minimal "spectator" view: current phase, whose turn it is
- Written answer input appears on player devices when it's their turn (if enabled)
- Player devices are read-only for game state (cannot advance phases)
- Player devices operate from their own local cache (synced at session start)

### 5.9 Very Long Game Night

A game night extends beyond 4 hours (e.g., large Murder Mystery with dinner courses).

**Handling**:
- Wake lock persists indefinitely (no timeout)
- Local database handles arbitrarily long logs
- Battery warning: if device reaches 15%, a subtle warning appears (but does not interrupt)
- Auto-save continues at 30-second intervals throughout

### 5.10 App Update During Game Night

The app store pushes an update while game night is in progress.

**Handling**:
- Expo OTA updates are deferred during ACTIVE state (never applied mid-game)
- Updates check and apply only on next cold launch when no session is ACTIVE
