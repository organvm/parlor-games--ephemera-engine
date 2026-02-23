# 005 — Data Model: Game Night Engine

Entity definitions for the game night engine. Defines both the local SQLite schema (device-side, source of truth during ACTIVE state) and the server-side Supabase/PostgreSQL schema (receives synced data after game night).

---

## 1. Local SQLite Schema (Device)

These tables exist only on the host's device. They are created when the database is opened and seeded from Supabase when the session transitions to ACTIVE. They are the source of truth during game night.

### 1.1 local_sessions

Cached copy of the server session, frozen at the moment game night starts.

```sql
CREATE TABLE IF NOT EXISTS local_sessions (
  id              TEXT PRIMARY KEY,          -- UUID from server
  game_type       TEXT NOT NULL,             -- 'confession_album' | 'murder_mystery'
  name            TEXT NOT NULL,
  date_time       TEXT NOT NULL,             -- ISO 8601
  state           TEXT NOT NULL DEFAULT 'ACTIVE',
  host_id         TEXT NOT NULL,
  config          TEXT NOT NULL DEFAULT '{}', -- JSON: game-specific configuration
  cached_at       TEXT NOT NULL              -- ISO 8601: when this was cached
);
```

### 1.2 local_participants

Cached copy of session participants, frozen at game night start.

```sql
CREATE TABLE IF NOT EXISTS local_participants (
  id              TEXT PRIMARY KEY,          -- UUID from server
  session_id      TEXT NOT NULL REFERENCES local_sessions(id),
  user_id         TEXT,                      -- NULL for web players
  display_name    TEXT NOT NULL,
  role            TEXT NOT NULL,             -- 'host' | 'app_player' | 'web_player'
  character_id    TEXT,                      -- Murder Mystery character assignment
  character_name  TEXT,                      -- Denormalized for quick display
  contribution_summary TEXT DEFAULT '{}',    -- JSON: what they brought/submitted
  cached_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_participants_session
  ON local_participants(session_id);
```

### 1.3 local_game_data

Cached game-specific data (questions for Confession Album, characters/clues for Murder Mystery).

```sql
CREATE TABLE IF NOT EXISTS local_game_data (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES local_sessions(id),
  data_type       TEXT NOT NULL,             -- 'questions' | 'characters' | 'clues' | 'timeline' | 'solution'
  data            TEXT NOT NULL,             -- JSON: game-specific content
  cached_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_game_data_session
  ON local_game_data(session_id);
CREATE INDEX IF NOT EXISTS idx_local_game_data_type
  ON local_game_data(session_id, data_type);
```

### 1.4 game_night_local_state

The live working state of the dashboard. Updated on every user action. Auto-saved every 30 seconds.

```sql
CREATE TABLE IF NOT EXISTS game_night_local_state (
  session_id            TEXT PRIMARY KEY REFERENCES local_sessions(id),
  current_phase_index   INTEGER NOT NULL DEFAULT 0,
  turn_position         INTEGER NOT NULL DEFAULT 0,
  player_order          TEXT NOT NULL DEFAULT '[]',    -- JSON array of participant IDs
  player_status         TEXT NOT NULL DEFAULT '{}',    -- JSON: {participant_id: 'active'|'dropped'|'added'}
  timer_state           TEXT,                          -- JSON: {running, remaining_ms, total_ms} or null
  undo_available_until  TEXT,                          -- ISO 8601 or null
  game_specific_state   TEXT NOT NULL DEFAULT '{}',    -- JSON: passed to/from game plugin
  updated_at            TEXT NOT NULL                  -- ISO 8601: last update timestamp
);
```

### 1.5 game_night_log

Append-only log of all game night events. Each action is a new row. This is the data synced to the server for artifact generation.

```sql
CREATE TABLE IF NOT EXISTS game_night_log (
  id              TEXT PRIMARY KEY,          -- UUID generated locally
  session_id      TEXT NOT NULL REFERENCES local_sessions(id),
  event_type      TEXT NOT NULL,             -- See event types below
  actor_id        TEXT,                      -- participant ID who triggered the event (null for system events)
  payload         TEXT NOT NULL DEFAULT '{}', -- JSON: event-specific data
  timestamp       TEXT NOT NULL              -- ISO 8601: when the event occurred
);

CREATE INDEX IF NOT EXISTS idx_game_night_log_session
  ON game_night_log(session_id);
CREATE INDEX IF NOT EXISTS idx_game_night_log_timestamp
  ON game_night_log(session_id, timestamp);
```

**Event types**:

| event_type | payload | Description |
|------------|---------|-------------|
| `phase_advance` | `{from_phase: int, to_phase: int, phase_name: string}` | Host advanced to next phase |
| `phase_undo` | `{from_phase: int, to_phase: int}` | Host undid a phase transition |
| `player_turn` | `{player_id: string, phase: int}` | Turn advanced to this player |
| `player_skip` | `{player_id: string, reason: 'host_skip'\|'dropped'}` | Player's turn was skipped |
| `player_pass` | `{player_id: string, question_id?: string}` | Player passed on a question/prompt |
| `player_drop` | `{player_id: string}` | Player marked as dropped |
| `player_add` | `{player_id: string, display_name: string}` | Player added mid-game |
| `player_reinstate` | `{player_id: string}` | Dropped player reinstated |
| `timer_start` | `{duration_ms: number, phase: int}` | Timer started |
| `timer_pause` | `{remaining_ms: number}` | Timer paused |
| `timer_extend` | `{added_ms: number, new_remaining_ms: number}` | Timer extended |
| `timer_dismiss` | `{remaining_ms: number}` | Timer dismissed by host |
| `timer_expire` | `{phase: int}` | Timer reached zero |
| `written_answer` | `{player_id: string, question_id?: string, answer_text: string}` | Player submitted written answer |
| `game_specific` | `{action: string, ...}` | Game plugin-defined event |
| `auto_save` | `{state_snapshot: object}` | Periodic auto-save checkpoint |
| `session_end` | `{final_phase: int, total_duration_ms: number}` | Host ended game night |

### 1.6 sync_queue

Queue of local data pending sync to the server.

```sql
CREATE TABLE IF NOT EXISTS sync_queue (
  id              TEXT PRIMARY KEY,          -- UUID generated locally
  session_id      TEXT NOT NULL,
  operation       TEXT NOT NULL,             -- 'game_night_log' | 'session_complete' | 'written_answers'
  payload         TEXT NOT NULL,             -- JSON: data to sync
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'failed'
  retry_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL,             -- ISO 8601
  last_attempt_at TEXT                       -- ISO 8601 or null
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status
  ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_session
  ON sync_queue(session_id);
```

---

## 2. Server-Side Schema (Supabase PostgreSQL)

These tables extend the schema from spec 001. They receive synced data from the local database after game night.

### 2.1 game_night_logs

Server-side storage of game night event logs, synced from the host's device.

```sql
CREATE TABLE public.game_night_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  actor_id        UUID REFERENCES public.session_participations(id),
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp       TIMESTAMPTZ NOT NULL,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_night_logs IS 'Game night events synced from host device. Source data for artifact generation.';
COMMENT ON COLUMN public.game_night_logs.actor_id IS 'References session_participations (not users) because web players may not have user accounts.';
COMMENT ON COLUMN public.game_night_logs.synced_at IS 'When this row was received from the host device. May differ significantly from timestamp if sync was delayed.';
```

### 2.2 game_night_summaries

Aggregated summary of a game night, computed on sync completion. Used by the artifact pipeline.

```sql
CREATE TABLE public.game_night_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  total_duration_ms BIGINT,                         -- Total game night duration
  phases_completed  INTEGER NOT NULL DEFAULT 0,
  total_turns       INTEGER NOT NULL DEFAULT 0,
  passes            INTEGER NOT NULL DEFAULT 0,
  skips             INTEGER NOT NULL DEFAULT 0,
  players_dropped   INTEGER NOT NULL DEFAULT 0,
  players_added     INTEGER NOT NULL DEFAULT 0,
  timer_used        BOOLEAN NOT NULL DEFAULT FALSE,
  written_answers   INTEGER NOT NULL DEFAULT 0,
  game_specific     JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Game-plugin-defined summary
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_night_summaries IS 'Aggregated game night summary. Computed by the sync Edge Function on receipt of game night data.';
```

### 2.3 written_answers

Stored separately for potential use in artifact generation (e.g., including typed answers in The Album).

```sql
CREATE TABLE public.written_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES public.session_participations(id),
  question_id     TEXT,                              -- Game-specific question identifier
  answer_text     TEXT NOT NULL,
  timestamp       TIMESTAMPTZ NOT NULL,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.written_answers IS 'Written answers from players using written answer mode. Used for artifact generation.';
```

---

## 3. Indexes (Server-Side)

```sql
-- game_night_logs: session lookup (artifact pipeline reads all events for a session)
CREATE INDEX idx_game_night_logs_session
  ON public.game_night_logs(session_id);

-- game_night_logs: chronological event ordering
CREATE INDEX idx_game_night_logs_timestamp
  ON public.game_night_logs(session_id, timestamp);

-- game_night_logs: event type filtering (artifact pipeline queries specific event types)
CREATE INDEX idx_game_night_logs_event_type
  ON public.game_night_logs(session_id, event_type);

-- game_night_summaries: session lookup
CREATE UNIQUE INDEX idx_game_night_summaries_session
  ON public.game_night_summaries(session_id);

-- written_answers: session lookup
CREATE INDEX idx_written_answers_session
  ON public.written_answers(session_id);

-- written_answers: participant lookup
CREATE INDEX idx_written_answers_participant
  ON public.written_answers(participant_id);
```

---

## 4. Row-Level Security (Server-Side)

### 4.1 game_night_logs

```sql
ALTER TABLE public.game_night_logs ENABLE ROW LEVEL SECURITY;

-- Host can read logs for their sessions
CREATE POLICY "game_night_logs_select_host"
  ON public.game_night_logs FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );

-- Participants can read logs for sessions they belong to
CREATE POLICY "game_night_logs_select_participant"
  ON public.game_night_logs FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Insert handled by Edge Function (service role key) — no client INSERT policy
```

### 4.2 game_night_summaries

```sql
ALTER TABLE public.game_night_summaries ENABLE ROW LEVEL SECURITY;

-- Host can read summaries for their sessions
CREATE POLICY "game_night_summaries_select_host"
  ON public.game_night_summaries FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );

-- Participants can read summaries
CREATE POLICY "game_night_summaries_select_participant"
  ON public.game_night_summaries FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Insert handled by Edge Function (service role key)
```

### 4.3 written_answers

```sql
ALTER TABLE public.written_answers ENABLE ROW LEVEL SECURITY;

-- Host can read all written answers for their sessions
CREATE POLICY "written_answers_select_host"
  ON public.written_answers FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );

-- Players can read their own written answers
CREATE POLICY "written_answers_select_own"
  ON public.written_answers FOR SELECT
  USING (
    participant_id IN (
      SELECT id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Insert handled by Edge Function (service role key)
```

---

## 5. Game Plugin Data Contract

Each game plugin defines what data it needs cached locally and what game-specific events it produces. The dashboard shell does not interpret this data — it passes it through.

### 5.1 GamePlugin Interface

```typescript
interface GamePlugin {
  /** Game identifier */
  gameType: 'confession_album' | 'murder_mystery';

  /** Phase definitions for this game */
  phases: PhaseDefinition[];

  /** Tabs for the emergency reference overlay */
  referenceTabs: ReferenceTabDefinition[];

  /** React component rendered in the game-specific slot on the dashboard */
  dashboardPanel: React.ComponentType<GamePanelProps>;

  /** Called when host advances a phase. Returns updated game-specific state. */
  onPhaseTransition: (
    fromPhase: number,
    toPhase: number,
    currentState: Record<string, unknown>
  ) => Record<string, unknown>;

  /** Called when a player action occurs. Returns updated game-specific state. */
  onPlayerAction: (
    action: PlayerAction,
    currentState: Record<string, unknown>
  ) => Record<string, unknown>;

  /** Defines what data_types to pre-cache from server for this game */
  requiredDataTypes: string[];

  /** Computes game-specific summary for game_night_summaries.game_specific */
  computeSummary: (logs: GameNightLogEntry[]) => Record<string, unknown>;
}

interface PhaseDefinition {
  name: string;           // "The Board & The Tradition"
  description: string;    // Brief description shown in confirmation dialog
  defaultTimerMinutes?: number;  // Suggested timer (null = no suggestion)
}

interface ReferenceTabDefinition {
  id: string;
  label: string;          // "Player Roster", "The Board", "Full Solution"
  component: React.ComponentType<ReferenceTabProps>;
}

interface GamePanelProps {
  sessionId: string;
  currentPhase: number;
  gameState: Record<string, unknown>;
  onGameEvent: (event: { action: string; [key: string]: unknown }) => void;
}

interface ReferenceTabProps {
  sessionId: string;
  gameData: Record<string, unknown>;
  searchQuery: string;
}
```

### 5.2 Confession Album Data Types

```
requiredDataTypes: ['questions', 'board_state', 'contribution_archetypes']
```

- **questions**: Full question set with lineage, register, text
- **board_state**: Which questions are on the board, which have been removed (and by whom)
- **contribution_archetypes**: Player-to-archetype assignments

### 5.3 Murder Mystery Data Types

```
requiredDataTypes: ['characters', 'clues', 'timeline', 'solution', 'relationships']
```

- **characters**: Character sheets (name, occupation, secret, relationships)
- **clues**: Physical and character-knowledge clues with distribution tracking
- **timeline**: Dramatic beats and their sequence
- **solution**: Full whodunit (murderer, motive, weapon, red herrings)
- **relationships**: Character relationship web

---

## 6. Data Retention

| Data | Location | Retention | Implementation |
|------|----------|-----------|---------------|
| Local SQLite database | Device | Until sync completed + 7 days | Cleanup on app launch |
| game_night_logs (server) | Supabase | Session ARCHIVED + 90 days | pg_cron cleanup (from spec 001) |
| game_night_summaries (server) | Supabase | Session ARCHIVED + 90 days | Cascade with session deletion |
| written_answers (server) | Supabase | Session ARCHIVED + 90 days | Cascade with session deletion |
| sync_queue (local) | Device | Until all entries completed + 24 hours | Cleanup on sync completion |

Local database cleanup on app launch:
```sql
-- Delete local data for sessions that synced more than 7 days ago
DELETE FROM game_night_log WHERE session_id IN (
  SELECT session_id FROM sync_queue
  WHERE status = 'completed'
  AND created_at < datetime('now', '-7 days')
);
-- Cascade to other local tables via session_id
```
