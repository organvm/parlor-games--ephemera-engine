# 005 — Requirements Checklist: Game Night Engine

Quality validation checklist for the game night engine specification. Check each item during implementation and before marking the spec as complete.

---

## Specification Quality

- [ ] All user stories have Given/When/Then acceptance scenarios
- [ ] All functional requirements have a priority (P0/P1)
- [ ] Success criteria are measurable (specific numbers, not subjective)
- [ ] Edge cases documented (host crash, player drop, mid-game addition, rapid transitions, long sessions)
- [ ] Entity definitions cover both local SQLite and server-side PostgreSQL
- [ ] No contradictions between spec.md and PRD sections 2.6, 4.1, 4.3, 4.5
- [ ] Game plugin interface documented with TypeScript types

## Constitution Compliance

### Simplicity Gate
- [ ] Total Edge Functions consumed by this spec: 1/3
- [ ] No external services beyond Supabase + Expo built-ins
- [ ] No premature abstractions (no ORM, no repository layer, no state machine library)
- [ ] Using Expo SQLite directly (not WatermelonDB)
- [ ] Using expo-keep-awake directly (not custom native module)
- [ ] Using expo-brightness directly (not custom native module)
- [ ] Game plugin interface is a TypeScript type, not a framework
- [ ] Single PostgreSQL database for server-side tables

### Offline Gate
- [ ] ALL game night features work with zero network connectivity
- [ ] Local SQLite holds complete session state before dashboard launch
- [ ] Dashboard makes ZERO network requests during ACTIVE state
- [ ] Network module is not imported by dashboard components
- [ ] No loading spinners during ACTIVE state
- [ ] No connectivity warnings during ACTIVE state
- [ ] No network error toasts during ACTIVE state
- [ ] Auto-save writes to local SQLite every 30 seconds
- [ ] Dashboard resumes from auto-save on app restart
- [ ] Sync is one-directional (local -> server) and non-blocking
- [ ] Sync uses exponential backoff with max 60s retry
- [ ] Pending sync data persists across app restart

### Privacy Gate
- [ ] Game night data scoped to session participants only
- [ ] Written answers visible only to host (when enabled)
- [ ] No cross-session data sharing
- [ ] RLS policies on all server-side tables
- [ ] Local data cleaned up 7 days after successful sync
- [ ] Server data follows 90-day retention after ARCHIVED

### Analog Gate
- [ ] Dashboard is ambient and glanceable (dark background, warm accents, large text)
- [ ] Screen brightness reduced during game night
- [ ] Wake lock prevents screen sleep (phone stays on as a reference)
- [ ] NO features replace in-room human interaction
- [ ] Timer is OFF by default
- [ ] Timer NEVER forces a phase transition
- [ ] Timer has no audible alarm by default
- [ ] Written answer mode is an accessibility accommodation, not a replacement for speaking
- [ ] All game-night player interactions happen in the room
- [ ] Dashboard is "a candle on the table, not a flashlight in the face"

## Dashboard Shell

### Ambient Mode
- [ ] Dark background (#000000 pure black for OLED)
- [ ] Warm amber/gold accent colors
- [ ] Body text minimum 18sp
- [ ] Heading text minimum 24sp
- [ ] Phase name text minimum 28sp
- [ ] All touch targets >=48dp
- [ ] Wake lock activates on dashboard launch
- [ ] Wake lock persists through background/foreground transitions
- [ ] Brightness reduced to ~30% on launch
- [ ] Original brightness restored on dashboard exit
- [ ] Dashboard loads in <1 second
- [ ] Dashboard resumes from background in <500ms

### Phase Progression
- [ ] Phase advancement requires confirmation dialog
- [ ] Confirmation shows next phase name and description
- [ ] Phase transition completes in <500ms with animation
- [ ] 30-second undo window after each transition
- [ ] Undo reverts phase and logs reversal
- [ ] Undo indicator disappears after 30 seconds
- [ ] 1-second cooldown between transitions (prevent double-tap)
- [ ] Phase history displays completed checkmarks
- [ ] Current phase highlighted, upcoming phases dimmed
- [ ] Phase names are game-specific (from plugin)
- [ ] All transitions logged locally with timestamp

### Timer
- [ ] Timer is off by default (no timer visible on launch)
- [ ] Timer activates via tap on timer icon
- [ ] Presets: 15, 30, 45, 60 minutes, custom
- [ ] Timer displays as circular arc (not digital clock)
- [ ] Color transitions: amber -> soft red near expiration
- [ ] Timer controls: pause, +5 min, +15 min, dismiss
- [ ] Timer never automatically advances phase
- [ ] Timer expiration: gentle pulse, "Time's up" suggestion
- [ ] Timer auto-dismisses on phase transition
- [ ] All timer events logged to game_night_log
- [ ] Reduce motion: static progress bar instead of animated arc

### Emergency Reference
- [ ] Reference overlay opens in <300ms
- [ ] Full-screen overlay with blur over dashboard
- [ ] Tabs defined by game plugin (game-specific content)
- [ ] Search bar filters across all tabs
- [ ] Search response time <100ms (local data)
- [ ] All content is read-only (no edit controls)
- [ ] Dismissable by swipe-down or tap-outside
- [ ] All data served from local SQLite (zero network)

## Offline & Sync

### Pre-Cache
- [ ] All session data cached to SQLite on PREPARING -> ACTIVE transition
- [ ] Cached data includes: session config, participants, contributions, game-specific data
- [ ] Network failure during cache: proceed with previously cached data + warning if critical data missing
- [ ] Cache completes before dashboard launches

### Auto-Save
- [ ] Auto-save writes every 30 seconds
- [ ] Saves: phase, turn position, player status, timer state, game-specific state
- [ ] On app crash: resume from last auto-save (max 30s data loss)
- [ ] "Resume Game Night" prompt on app restart during ACTIVE session

### Sync Engine
- [ ] Sync queue persisted in SQLite (survives app restart)
- [ ] Sync processes after ACTIVE -> COMPLETE transition
- [ ] Sync also processes when connectivity resumes (if offline during transition)
- [ ] Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s cap
- [ ] Entry states: pending -> in_progress -> completed/failed
- [ ] Deduplication: duplicate events (by ID) ignored on server
- [ ] Conflict resolution: host device data always wins
- [ ] Sync is non-blocking (no UI interruption)
- [ ] Subtle pending sync indicator for host
- [ ] Sync completes in <30 seconds when connectivity available

### Server-Side
- [ ] Edge Function validates: auth, host ownership, session state
- [ ] Events inserted into game_night_logs
- [ ] Summary computed and inserted into game_night_summaries
- [ ] Written answers inserted into written_answers table
- [ ] RLS policies on all three tables
- [ ] Idempotent: re-syncing the same data produces no duplicates

## Accessibility

### Written Answer Mode
- [ ] Toggle in Settings -> Accessibility
- [ ] Text input appears on player device during their turn
- [ ] Input uses ambient mode styling
- [ ] "Submit" button sends answer
- [ ] Answer appears on host dashboard (if "Show Written Answers" enabled)
- [ ] Other players' devices show no indication of written answer mode
- [ ] Late answers (after turn passes) recorded in log with notification to host
- [ ] Written answers stored for artifact generation

### Pass/Skip
- [ ] Host can skip any player's turn via roster menu
- [ ] Player can pass on any question (via host or own device)
- [ ] Skip/pass continues the chain to next active player
- [ ] Skip/pass logged for artifact generation
- [ ] Skip/pass NOT announced or highlighted to the group
- [ ] Confession Album: passed inherited question answered only by chooser
- [ ] Murder Mystery: skip applicable for any investigation round

### Player Management
- [ ] Mid-game player addition: name only, appended to turn order
- [ ] Added players have no contribution archetype
- [ ] Dropped players: dimmed in roster, turns auto-skipped
- [ ] Dropped Murder Mystery characters: secrets accessible in reference
- [ ] Dropped players can be reinstated
- [ ] All player changes logged to game_night_log

### Screen Reader
- [ ] All interactive elements have accessibilityRole
- [ ] All interactive elements have accessibilityLabel
- [ ] Complex elements have accessibilityHint
- [ ] Correct reading order (top-to-bottom, left-to-right)
- [ ] Phase transitions announced as live region updates
- [ ] Timer events announced as live region updates

### Visual Accessibility
- [ ] No flashing animations
- [ ] Reduce motion setting respected (system + app-level)
- [ ] High contrast mode supported
- [ ] Font scaling respected with enforced minimums

## Plugin Architecture

- [ ] GamePlugin TypeScript interface defined
- [ ] Plugin provides: phases, referenceTabs, dashboardPanel, callbacks
- [ ] Dashboard renders game-specific UI in designated slot
- [ ] Emergency reference shows game-specific tabs
- [ ] Phase names come from plugin
- [ ] Plugin stubs exist for Confession Album and Murder Mystery
- [ ] Plugin interface is stable (specs 003 and 004 can implement against it)

## Performance

- [ ] Dashboard load: <1 second
- [ ] Phase transition: <500ms
- [ ] Reference overlay open: <300ms
- [ ] Background resume: <500ms
- [ ] Search within reference: <100ms
- [ ] Auto-save write: <100ms
- [ ] Timer animation: 60fps (or static fallback with reduce motion)
- [ ] Written answer delivery: <2 seconds
- [ ] Sync completion: <30 seconds (when connectivity available)
- [ ] Crash recovery: <5 seconds (app restart to dashboard resumed)

## Edge Cases

- [ ] Host device crash: resumes from auto-save on restart
- [ ] Host disconnect: no impact on dashboard operation
- [ ] Player drops: handled via roster menu, turns auto-skipped
- [ ] Mid-game player addition: name entry, appended to order
- [ ] Phase transition during timer: timer auto-dismissed
- [ ] Rapid phase transitions: confirmation + cooldown prevents accidents
- [ ] Written answer after turn passes: recorded with late notification
- [ ] Multiple devices in session: player devices are read-only spectators
- [ ] Very long game night (4+ hours): wake lock persists, battery warning at 15%
- [ ] App update during game night: OTA deferred until no ACTIVE session
- [ ] Session recovery on different device: uses server-synced state

## Data Model

- [ ] All 6 local SQLite tables created with correct types
- [ ] All 3 server-side PostgreSQL tables created
- [ ] Indexes on session_id for all tables
- [ ] RLS policies on all server-side tables
- [ ] Event types enum covers all game night actions
- [ ] Sync queue table persists through app restarts
- [ ] Local data cleanup after sync + 7 days
- [ ] Server data follows session ARCHIVED + 90 day retention

## API Contract

- [ ] OpenAPI spec is syntactically valid
- [ ] sync-game-night endpoint documented with request/response schemas
- [ ] resume-game-night endpoint documented
- [ ] recover-game-night endpoint documented
- [ ] Error responses defined (401, 403, 404, 422)
- [ ] Request schemas match data-model.md types
- [ ] Deduplication behavior documented (207 partial success)

## Testing

- [ ] Unit tests: phase progression logic (advance, undo, cooldown)
- [ ] Unit tests: timer logic (start, pause, extend, dismiss, expire)
- [ ] Unit tests: sync queue management (add, retry, complete, backoff)
- [ ] Unit tests: conflict resolution (last-write-wins)
- [ ] Unit tests: player management (skip, pass, add, drop, reinstate)
- [ ] Integration tests: SQLite read/write operations
- [ ] Integration tests: pre-cache engine (Supabase -> SQLite)
- [ ] Integration tests: sync engine (SQLite -> Supabase Edge Function)
- [ ] Integration tests: dashboard state persistence (save/resume)
- [ ] Integration tests: offline operation (zero network calls)
- [ ] E2E tests: full game night walk-through (Maestro)
- [ ] E2E tests: crash recovery (force kill + restart)
- [ ] E2E tests: ambient mode visual verification
- [ ] All quickstart.md scenarios covered by tests

## Documentation

- [ ] All 8 spec files complete and consistent with each other
- [ ] Data model matches OpenAPI schemas
- [ ] Task list covers all functional requirements
- [ ] Quickstart scenarios cover all critical paths
- [ ] Research.md documents all technology decisions with rationale
- [ ] Plugin interface documented for specs 003 and 004 to implement against
