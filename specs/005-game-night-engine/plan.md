# 005 — Implementation Plan: Game Night Engine

Implementation plan with technology context, constitution compliance, project structure, plugin architecture, and data flow.

**Spec**: 005-game-night-engine
**Stack**: TypeScript 5.x, React Native + Expo, Supabase, Expo SQLite, Zustand, React Native Reanimated
**Last Updated**: 2026-02-23

---

## 1. Constitution Compliance

### Simplicity Gate

- [x] **Total server-side services <=3?** Yes. This spec uses 1 Supabase Edge Function for game night sync (push local changes to server). Edge Function budget: 1/3 consumed (0 from spec 001 + 1 from this spec).
- [x] **No speculative "might need" features?** Yes. No real-time multiplayer sync. No WebSocket connections during game night. No cloud-based timer service. Player devices are independent local readers.
- [x] **Using framework primitives directly?** Yes. Expo ScreenOrientation for wake lock. Expo Brightness for ambient mode. Expo SQLite for local database. React Native Reanimated for animations. No custom wake lock library, no custom database ORM.
- [x] **No premature abstractions or repository patterns?** Yes. Direct Expo SQLite queries from React hooks. Game plugin interface is a simple TypeScript type contract, not a framework.
- [x] **Single database schema (Supabase PostgreSQL)?** Yes. Server-side tables extend the schema from spec 001. Local SQLite mirrors the relevant subset.

### Offline Gate

- [x] **All game night features work without network connectivity?** Yes. This is the spec's primary concern. Every feature operates from local SQLite. Zero network calls during ACTIVE state.
- [x] **Local database holds complete session state during ACTIVE?** Yes. Full session data (config, players, game-specific data, contributions) pre-cached on PREPARING -> ACTIVE transition.
- [x] **No network requests required during game night phase?** Yes. Enforced architecturally — the dashboard hook reads only from local DB. Network module is not imported by dashboard components.
- [x] **Sync is eventual and non-blocking?** Yes. SyncQueue accumulates changes locally. Background sync runs when connectivity is available, with exponential backoff on failure.
- [x] **Dashboard operates entirely from local data?** Yes. This is the foundational architecture.

### Privacy Gate

- [x] **No data leaves the session boundary without explicit consent?** Yes. Written answers and player actions are scoped to the session. Sync sends data only to the session's server record.
- [x] **No cross-session data sharing or aggregation?** Yes. Local database is scoped per session. No analytics on game night behavior.
- [x] **No public profiles or social features?** Yes. Player devices show only session-scoped data.
- [x] **Player contributions scoped to session participants only?** Yes. Written answers visible only to host (and only if host enables display).
- [x] **Minimal data retention policy enforced?** Yes. Local game night data deleted after successful sync + 7 days.

### Analog Gate

- [x] **No feature replaces in-room human interaction?** Yes. Dashboard is the host's reference tool. Players interact in the room. Written answer mode is an accessibility accommodation, not a replacement for speaking.
- [x] **Game night UI is ambient and glanceable, not attention-demanding?** Yes. Dark background, warm accents, large type, minimal information density. "The phone is a candle on the table, not a flashlight in the face."
- [x] **Screen-dark principle respected?** Yes. Ambient mode reduces brightness. OLED-friendly pure black. Minimal text. Host glances at the phone; they don't stare at it.
- [x] **All game-night player interactions happen in the room, not through the app?** Yes. Even written answer mode requires the player to read their answer aloud (or have the host read it). The app is input, not interaction.
- [x] **Timer is optional, never forced?** Yes. FR-015: timer is off by default. FR-019: timer never automatically advances phases.

**Result**: All four gates PASS. This spec is critical for the Analog Gate and Offline Gate.

---

## 2. Technology Decisions

### Local Database: Expo SQLite (not WatermelonDB)

**Decision**: Use Expo SQLite directly for all local game night state.

**Rationale**:
- Expo SQLite is built into Expo — zero additional dependencies
- The sync requirement is simple: one-directional push from local to server after game night
- No multi-device real-time sync needed during game night (only host writes)
- WatermelonDB adds: Rx.js dependency, model layer, migration system, sync protocol — all unnecessary complexity
- Expo SQLite handles the actual needs: pre-cache data, read during game, write actions, push to server after

**Trade-offs**:
- Manual SQL queries (no ORM) — acceptable for ~6 tables with simple schemas
- Manual sync implementation — acceptable because sync is one-directional (local -> server) and host-authoritative

**When to reconsider**: If future specs require real-time multi-device sync during game night (e.g., all players voting simultaneously from their devices), WatermelonDB's sync engine would be justified.

### Wake Lock: expo-keep-awake

**Decision**: Use `expo-keep-awake` (Expo's built-in wake lock API).

**Rationale**:
- `activateKeepAwakeAsync()` / `deactivateKeepAwake()` — two functions, zero configuration
- Works on both iOS and Android
- Integrates with Expo's managed workflow (no native module linking)
- Automatically deactivates when the app backgrounds

### Screen Brightness: expo-brightness

**Decision**: Use `expo-brightness` to reduce screen brightness during ambient mode.

**Rationale**:
- `setBrightnessAsync(0.3)` reduces brightness to 30% — enough to read in a dim room
- Saves battery during extended game nights
- Permission required on Android (prompted once on first game night)
- Restores original brightness when dashboard exits

### Animations: React Native Reanimated

**Decision**: Use React Native Reanimated for dashboard animations (phase transitions, timer arc, undo indicator).

**Rationale**:
- Runs on the UI thread — 60fps animations even when JS thread is busy
- Handles the timer circular arc animation efficiently
- Supports `reduceMotion` flag natively (respects system accessibility setting)
- Already a common dependency in Expo projects

### State Management: Zustand (dashboard-specific store)

**Decision**: Zustand store for in-memory dashboard state, backed by Expo SQLite for persistence.

**Rationale**:
- Dashboard state needs to be reactive (phase changes update UI immediately)
- Zustand provides reactivity; SQLite provides persistence
- On launch: load from SQLite into Zustand. On state change: write-through to SQLite.
- No additional state management library needed

### Plugin Architecture: TypeScript Interface Contract

**Decision**: Game-specific behavior defined via a TypeScript interface that each game module implements. No plugin framework, no dynamic loading, no registry.

**Rationale**:
- Only 2 games at V1 (Confession Album, Murder Mystery). 4 total games planned.
- A simple interface contract is sufficient: `GamePlugin { phases, referenceTabsm, gameSpecificUI, onPhaseTransition }`
- Games are statically imported (not dynamically loaded) — tree-shaking works, no runtime overhead
- If we reach 10+ games, a dynamic registry could be justified. YAGNI for now.

---

## 3. Project Structure

### Source Code

```
src/
├── app/
│   └── session/
│       └── [id]/
│           └── game-night/
│               ├── index.tsx              # Game Night Dashboard (main screen)
│               ├── _layout.tsx            # Game night layout (ambient mode wrapper)
│               └── reference.tsx          # Emergency reference overlay (modal)
│
├── features/
│   └── game-night/
│       ├── components/
│       │   ├── AmbientContainer.tsx       # Dark theme, brightness, wake lock wrapper
│       │   ├── PhaseTimeline.tsx           # Visual phase progression (checkmarks, current, upcoming)
│       │   ├── PhaseTransitionDialog.tsx   # Confirmation dialog for phase advance
│       │   ├── PlayerRoster.tsx            # Player list with turn indicator, skip/drop controls
│       │   ├── TimerRing.tsx              # Circular timer arc (Reanimated)
│       │   ├── TimerControls.tsx          # Pause, extend, dismiss
│       │   ├── UndoBar.tsx               # 30-second undo indicator
│       │   ├── WrittenAnswerInput.tsx     # Text input for written answer mode (player device)
│       │   ├── WrittenAnswerDisplay.tsx   # Written answer display (host dashboard)
│       │   ├── GamePluginSlot.tsx         # Renders game-specific UI from plugin
│       │   └── SyncIndicator.tsx          # Subtle sync status (post-game only)
│       │
│       ├── hooks/
│       │   ├── use-game-night.ts          # Main dashboard hook (phase, players, state)
│       │   ├── use-local-db.ts            # Expo SQLite read/write operations
│       │   ├── use-wake-lock.ts           # expo-keep-awake lifecycle
│       │   ├── use-ambient-mode.ts        # Brightness control lifecycle
│       │   ├── use-timer.ts               # Timer state and controls
│       │   ├── use-sync-engine.ts         # Background sync queue processor
│       │   └── use-auto-save.ts           # 30-second auto-save interval
│       │
│       ├── stores/
│       │   └── game-night-store.ts        # Zustand store for dashboard state
│       │
│       ├── db/
│       │   ├── schema.ts                  # Local SQLite table definitions
│       │   ├── seed.ts                    # Pre-cache session data from Supabase to SQLite
│       │   ├── queries.ts                 # Read queries (phases, players, game state)
│       │   └── mutations.ts              # Write operations (log actions, save state)
│       │
│       ├── sync/
│       │   ├── sync-engine.ts             # Queue processor: local -> server
│       │   ├── sync-queue.ts              # Queue management (add, retry, complete)
│       │   └── conflict-resolver.ts       # Last-write-wins resolution
│       │
│       └── types/
│           ├── game-plugin.ts             # GamePlugin interface contract
│           ├── game-night.ts              # Dashboard state types
│           ├── phase.ts                   # Phase definitions
│           └── sync.ts                    # Sync queue types
│
├── plugins/
│   ├── confession-album/
│   │   └── plugin.ts                      # Implements GamePlugin for Confession Album
│   └── murder-mystery/
│       └── plugin.ts                      # Implements GamePlugin for Murder Mystery
│
└── constants/
    └── ambient-theme.ts                   # Ambient mode colors, sizes, timing
```

### Documentation (this feature)

```
specs/005-game-night-engine/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology research
├── data-model.md        # Entity definitions (local + server)
├── quickstart.md        # Key validation scenarios
├── tasks.md             # Implementation task list
├── contracts/
│   └── openapi.yaml     # API contracts for sync endpoints
└── checklists/
    └── requirements.md  # Requirements checklist
```

**Structure Decision**: Mobile application structure. Game night features are a feature module under `src/features/game-night/`. Game-specific plugins under `src/plugins/`. Expo Router file-based routing under `src/app/`.

---

## 4. Data Flow

### Pre-Cache Flow (PREPARING -> ACTIVE)

```
┌─────────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Supabase DB    │──────>│  seed.ts     │──────>│  Local SQLite   │
│  (server)       │ fetch │  (pre-cache) │ write │  (device)       │
└─────────────────┘       └──────────────┘       └─────────────────┘
         │                                               │
         │  Tables cached:                               │
         │  - sessions (config, state)                   │
         │  - session_participations (roster)             │
         │  - contributions (player submissions)          │
         │  - game-specific data (questions/characters)   │
         │                                               │
         └───────── network required ────────────────────┘
```

### Game Night Flow (ACTIVE state — offline)

```
┌──────────────┐     read     ┌─────────────────┐
│  Zustand     │<────────────│  Local SQLite   │
│  Store       │             │  (source of     │
│  (reactive)  │────────────>│   truth)        │
└──────┬───────┘    write    └────────┬────────┘
       │                              │
       │  UI reads from store         │  Auto-save every 30s
       │  Store writes through        │  Writes: phase transitions,
       │  to SQLite on mutation       │  player actions, timer events,
       │                              │  written answers
       │                              │
  ┌────▼────────────────┐    ┌───────▼────────────┐
  │  Dashboard UI       │    │  SyncQueue         │
  │  (ambient mode)     │    │  (local, pending)  │
  └─────────────────────┘    └────────────────────┘
                                      │
                              NO network during
                              ACTIVE state
```

### Post-Game Sync Flow (COMPLETE state)

```
  ┌────────────────────┐       ┌──────────────────┐      ┌──────────────┐
  │  SyncQueue         │──────>│  sync-engine.ts  │─────>│  Supabase    │
  │  (local, pending)  │ read  │  (background)    │ push │  Edge Fn     │
  └────────────────────┘       └──────────────────┘      └──────┬───────┘
                                       │                        │
                                  retry on failure         ┌────▼───────┐
                                  exponential backoff      │  Supabase  │
                                  max 60s                  │  DB        │
                                                           │  (server)  │
                                                           └────────────┘
```

### Game Plugin Architecture

```
┌─────────────────────────────────────────────────────┐
│  Game Night Dashboard (shell)                       │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Phase       │  │ Player       │  │ Timer     │ │
│  │ Timeline    │  │ Roster       │  │ Ring      │ │
│  └─────────────┘  └──────────────┘  └───────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │  GamePluginSlot (game-specific UI)              ││
│  │                                                 ││
│  │  Confession Album:        Murder Mystery:       ││
│  │  - Board status          - Clue tracker         ││
│  │  - Chain position        - Act progress         ││
│  │  - Question display      - Evidence reveals     ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │  Emergency Reference (overlay)                  ││
│  │  Tabs defined by GamePlugin.referenceTabs       ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘

GamePlugin interface:
{
  phases: PhaseDefinition[]
  referenceTabs: ReferenceTab[]
  dashboardPanel: React.ComponentType<GamePanelProps>
  onPhaseTransition: (from, to, state) => GameSpecificState
  onPlayerAction: (action, state) => GameSpecificState
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Tasks 1-4)
- Local SQLite schema setup and migration
- Pre-cache engine (seed Supabase data to local SQLite)
- Ambient mode container (wake lock, brightness, dark theme)
- Zustand dashboard store with SQLite write-through

### Phase 2: Dashboard Shell (Tasks 5-8)
- Phase timeline component
- Phase progression with confirmation and undo
- Player roster with turn tracking
- Dashboard main screen assembly

### Phase 3: Timer & Reference (Tasks 9-12)
- Timer ring animation (Reanimated)
- Timer controls (pause, extend, dismiss)
- Emergency reference overlay
- Reference search

### Phase 4: Accessibility & Player Management (Tasks 13-15)
- Written answer mode (input + display)
- Pass/skip mechanics
- Mid-game player add/drop

### Phase 5: Sync & Plugin Interface (Tasks 16-19)
- Sync queue and engine
- Background sync with retry
- Game plugin interface definition
- Plugin stubs for Confession Album and Murder Mystery

---

## 6. Complexity Tracking

| Decision | Complexity Added | Justification |
|----------|-----------------|---------------|
| Expo SQLite (manual queries) | Low | Framework primitive. ~6 tables, simple schemas. No ORM needed. |
| Sync queue with retry | Medium | Required for offline-first. One-directional sync (local -> server). Exponential backoff is standard pattern. |
| React Native Reanimated | Low | Already in Expo ecosystem. Required for 60fps timer animation. |
| Game plugin interface | Low | TypeScript interface only. No framework, no registry, no dynamic loading. 2-4 implementations total. |
| Auto-save interval | Low | 30-second setInterval writing to SQLite. Standard pattern. |
| Supabase Edge Function for sync | Medium | 1 Edge Function to receive game night data. Validates and inserts into server DB. Simplest possible server-side endpoint. |

**Total Edge Functions consumed by this spec**: 1/3 (cumulative: 0 from spec 001 + 1 from this spec)
**Total external services added**: 0 (Expo SQLite is local; sync goes to existing Supabase)

---

## 7. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Wake lock fails on specific Android devices | High | Medium | Test on 5+ Android devices. Fallback: user-facing "keep screen on" setting toggle. Expo's implementation is well-tested. |
| Expo SQLite performance with large game logs | Low | Low | Game night data is small (KB, not MB). SQLite handles this trivially. Index on session_id. |
| Brightness API permission denied on Android | Medium | Low | Graceful degradation: dashboard works at normal brightness. Show one-time permission rationale. |
| Sync data loss if app is uninstalled before sync | Medium | Low | Sync attempts immediately on ACTIVE -> COMPLETE. Pending sync indicator visible to host. |
| Timer animation jank on low-end devices | Low | Medium | Reanimated runs on UI thread. Use `reduceMotion` to disable animation on low-end. Fallback to static progress bar. |
| Multiple players open app simultaneously (unexpected state) | Low | Medium | Player devices are read-only for game state. No write conflicts. Player devices show spectator view only. |

---

## 8. Dependencies on Other Specs

This spec (005) depends on:
- **001-auth-and-sessions**: Session entity, PREPARING -> ACTIVE state transition, host identity, local SQLite setup (Expo SQLite already chosen in 001).

This spec is depended on by:
- **003-confession-album**: Implements `GamePlugin` interface for Confession Album. Uses dashboard shell, phase progression, player roster, emergency reference, pass/skip.
- **004-murder-mystery**: Implements `GamePlugin` interface for Murder Mystery. Uses dashboard shell, phase progression, emergency reference (full solution), timer (interrogation rounds).
- **006-artifact-pipeline**: Reads `GameNightLog` (synced to server) for artifact generation. Depends on sync completing before artifacts can be generated.
