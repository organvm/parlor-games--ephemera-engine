# Data Model: Murder Mystery Game Module

**Spec**: 004-murder-mystery | **Date**: 2026-02-23

Entity definitions for the Murder Mystery game module. Defines Supabase PostgreSQL schema, WatermelonDB local schema, and Row-Level Security (RLS) policies.

---

## 1. Supabase Schema (PostgreSQL)

The Murder Mystery module stores game-specific data as JSONB within the shared `Session.config` column. This avoids schema proliferation while supporting the deeply nested, hierarchical nature of murder mystery data (characters, clues, crime graphs, timelines).

### 1.1 Session Table Extension

The core `sessions` table is defined in spec 001. Murder Mystery sessions use `game_type = 'murder_mystery'` and store all game data in the `config` JSONB column.

```sql
-- No new table needed. Murder Mystery data lives in sessions.config.
-- This migration adds a check constraint and GIN index for JSONB queries.

-- Ensure murder_mystery sessions have required config keys
ALTER TABLE sessions ADD CONSTRAINT chk_murder_mystery_config
  CHECK (
    game_type != 'murder_mystery'
    OR (
      config ? 'setting_seed'
      AND config ? 'characters'
      AND config ? 'crime'
    )
  );

-- GIN index for JSONB queries on config
CREATE INDEX IF NOT EXISTS idx_sessions_config_gin
  ON sessions USING GIN (config);
```

### 1.2 MurderMysteryData JSONB Schema

The `config` column for `game_type = 'murder_mystery'` conforms to this TypeScript interface (enforced by application code, documented here as the canonical schema):

```typescript
interface MurderMysteryData {
  setting_seed: SettingSeed;
  characters: Character[];
  crime: Crime;
  clues: Clue[];
  game_night: GameNightState;
  awards: Award[];
  sealed_envelopes: SealedEnvelope[];
}

interface SettingSeed {
  source: 'curated' | 'generated' | 'random';
  era: string;
  location: string;
  milieu: string;
  tension: string;
  setting_description: string;
  crime_scene: string;
  generated_by: 'human' | 'llm' | 'hybrid';
  curated_seed_id?: string; // FK to content pack if curated
}

interface Character {
  id: string;                    // e.g., "c1", "c2"
  name: string;                  // Full character name
  occupation: string;
  personality: string;           // 2–3 sentence sketch
  secret: string;                // One secret relevant to the crime — allow-secret
  relationship: {
    target_character_id: string;
    description: string;         // e.g., "You owe a great debt to the art dealer"
  };
  is_murderer: boolean;
  is_victim: boolean;
  contribution_brief: {
    food: string;                // Narratively motivated food/drink suggestion
    dress: string;               // Color palette, silhouette, accessory
    prop: string;                // One object the character would carry
  };
  preparation_prompts: string[]; // 2–3 questions
  assigned_to: string | null;    // SessionParticipation.id
}

interface Crime {
  victim_id: string;             // FK to Character.id
  murderer_id: string;           // FK to Character.id
  weapon: string;
  motive: string;
  red_herrings: RedHerring[];
  timeline: TimelineEvent[];
}

interface RedHerring {
  character_id: string;          // FK to Character.id
  description: string;
}

interface TimelineEvent {
  order: number;
  description: string;
  act: 1 | 2 | 3;
}

interface Clue {
  id: string;                    // Exhibit label: "A", "B", "C"...
  title: string;
  type: 'PHYSICAL' | 'DOCUMENT' | 'FINANCIAL' | 'PERSONAL';
  description: string;
  found_by: string;              // Character name who discovers it
  tier?: 1 | 2 | 3;             // Suggested distribution timing
}

interface GameNightState {
  act_timestamps: ActTimestamp[];
  clues_distributed: string[];   // Clue IDs marked as distributed
  evidence_reveals: EvidenceReveal[];
  accusations: Accusation[];
}

interface ActTimestamp {
  act: number;
  started_at: string;            // ISO 8601 timestamp
}

interface EvidenceReveal {
  timestamp: string;
  description: string;
}

interface Accusation {
  player_id: string;             // SessionParticipation.id
  accused_character_id: string;  // Character.id
  method: string;                // Free text: how
  motive: string;                // Free text: why
}

interface Award {
  category: string;              // e.g., "Best Performance"
  winner_id: string;             // SessionParticipation.id
  votes: number;
}

interface SealedEnvelope {
  character_id: string;          // Character.id
  player_id: string;             // SessionParticipation.id
  text: string;                  // Host-written epilogue
  delivered: boolean;
}
```

### 1.3 Contributions Table Usage

Murder Mystery contributions use the shared `contributions` table (spec 002):

```sql
-- Murder Mystery contribution types stored in contributions.type:
-- 'mm_preparation_prompt'  — character preparation answers
-- 'mm_food_drink'          — food/drink contribution description
-- 'mm_recipe'              — full recipe with ingredients and steps

-- contributions.content (JSONB) shapes:

-- For mm_preparation_prompt:
-- { "prompt": "What is your character's alibi?", "answer": "..." }

-- For mm_food_drink:
-- { "name": "Coq au Vin Noir", "description": "..." }

-- For mm_recipe:
-- { "name": "...", "type": "Main Course", "ingredients": [...], "steps": [...] }
```

### 1.4 Artifacts Table Usage

Murder Mystery artifacts use the shared `artifacts` table (spec 006):

```sql
-- Murder Mystery artifact types stored in artifacts.type:
-- 'mm_dossier'          — The Dossier (A04), shared
-- 'mm_menu'             — Menu of the Damned (A05), shared
-- 'mm_society_page'     — Society Page Photo (A06), shared
-- 'mm_sealed_envelope'  — The Sealed Envelope (A07), personalized

-- For personalized artifacts: artifacts.personalized_for = session_participation.id
-- For delayed artifacts: artifacts.scheduled_delivery = timestamp
```

### 1.5 Seed Generation Rate Limiting

```sql
CREATE TABLE IF NOT EXISTS seed_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  input_axes JSONB NOT NULL,           -- { era, location, milieu, tension }
  response_status TEXT NOT NULL,       -- 'success' | 'validation_failed' | 'api_error'
  tokens_used INTEGER,
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX idx_seed_gen_session ON seed_generation_log(session_id, requested_at);
```

---

## 2. WatermelonDB Local Schema

The local schema mirrors the JSONB structure for offline game night operation. Data is pre-cached when the session transitions to ACTIVE.

```typescript
// murder-mystery-schema.ts

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const murderMysteryLocalSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'mm_sessions',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'setting_seed', type: 'string' },    // JSON string
        { name: 'characters', type: 'string' },       // JSON string
        { name: 'crime', type: 'string' },            // JSON string
        { name: 'clues', type: 'string' },            // JSON string
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'mm_game_night_events',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'event_type', type: 'string' },       // 'act_start' | 'clue_distributed' | 'evidence_reveal' | 'accusation' | 'award_vote'
        { name: 'event_data', type: 'string' },       // JSON string
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'mm_accusations',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'player_id', type: 'string' },
        { name: 'accused_character_id', type: 'string' },
        { name: 'method', type: 'string' },
        { name: 'motive', type: 'string' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'mm_award_votes',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'voter_id', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'nominee_id', type: 'string' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});
```

### Sync Protocol

```
PREPARING → ACTIVE transition:
  1. Fetch session.config (MurderMysteryData) from Supabase
  2. Write to mm_sessions table (local)
  3. Verify local data matches remote (hash check)
  4. Mark session as offline-ready

During ACTIVE (offline):
  1. All reads from mm_sessions + mm_game_night_events
  2. Writes: INSERT into mm_game_night_events with synced=false
  3. Accusations: INSERT into mm_accusations with synced=false
  4. Votes: INSERT into mm_award_votes with synced=false

ACTIVE → COMPLETE transition (or when online):
  1. Query all records where synced=false
  2. Batch upsert to Supabase (session.config JSONB merge)
  3. Mark synced=true on success
  4. Retry on failure (exponential backoff, max 5 retries)
```

---

## 3. Row-Level Security (RLS) Policies

### sessions table (Murder Mystery-specific additions)

```sql
-- Host can read/write their own session config
CREATE POLICY "hosts_manage_mm_config" ON sessions
  FOR ALL
  USING (
    auth.uid() = host_id
    AND game_type = 'murder_mystery'
  )
  WITH CHECK (
    auth.uid() = host_id
    AND game_type = 'murder_mystery'
  );

-- Participants can read limited session data (no crime solution during ACTIVE)
CREATE POLICY "participants_read_mm_session" ON sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participations sp
      WHERE sp.session_id = sessions.id
      AND sp.user_id = auth.uid()
      AND sp.rsvp_status = 'accepted'
    )
    AND game_type = 'murder_mystery'
  );
```

**Important**: The RLS policy allows participants to SELECT the full session row, but the application layer MUST filter sensitive fields before returning to non-host players. Specifically:
- Players MUST NOT see `config.crime.murderer_id` until the reveal phase
- Players MUST NOT see other players' character secrets
- Players MUST NOT see other players' accusations until the reveal

This is enforced at the API/Edge Function level, not at the RLS level (RLS operates on rows, not JSON fields within a column).

### seed_generation_log table

```sql
-- Only the host of the session can view/create generation logs
CREATE POLICY "hosts_manage_seed_log" ON seed_generation_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = seed_generation_log.session_id
      AND s.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = seed_generation_log.session_id
      AND s.host_id = auth.uid()
    )
  );
```

### contributions table (Murder Mystery-specific)

```sql
-- Players can submit their own MM contributions
CREATE POLICY "players_submit_mm_contributions" ON contributions
  FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT sp.user_id FROM session_participations sp
      WHERE sp.id = contributions.participant_id
    )
    AND type IN ('mm_preparation_prompt', 'mm_food_drink', 'mm_recipe')
  );

-- Host can read all MM contributions for their session
CREATE POLICY "hosts_read_mm_contributions" ON contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = contributions.session_id
      AND s.host_id = auth.uid()
    )
    AND type IN ('mm_preparation_prompt', 'mm_food_drink', 'mm_recipe')
  );
```

---

## 4. Entity Relationship Diagram

```
┌──────────────┐     ┌────────────────────────┐     ┌──────────────┐
│   sessions   │────<│  session_participations │     │   artifacts  │
│              │     │                        │     │              │
│  id          │     │  id                    │     │  id          │
│  game_type   │     │  session_id (FK)       │     │  session_id  │
│  config      │     │  user_id (FK, nullable)│     │  type        │
│  (JSONB:     │     │  display_name          │     │  file_url    │
│   Murder     │     │  rsvp_status           │     │  personalized│
│   Mystery    │     │  character_id           │     │  _for (FK)   │
│   Data)      │     │                        │     │  scheduled_  │
│  host_id(FK) │     └────────────────────────┘     │  delivery    │
└──────────────┘                                     └──────────────┘
       │                                                    │
       │         ┌────────────────────┐                     │
       │────────<│  contributions     │                     │
       │         │                    │                     │
       │         │  id                │                     │
       │         │  session_id (FK)   │                     │
       │         │  participant_id(FK)│                     │
       │         │  type              │                     │
       │         │  content (JSONB)   │                     │
       │         └────────────────────┘                     │
       │                                                    │
       │         ┌────────────────────┐                     │
       └────────<│ seed_generation_log│                     │
                 │                    │                     │
                 │  id                │                     │
                 │  session_id (FK)   │                     │
                 │  input_axes (JSONB)│                     │
                 │  response_status   │                     │
                 └────────────────────┘
```

---

## 5. Data Shape Reference

The canonical data shape for artifact rendering is defined by the existing fixture at `artifacts/fixtures/murder-mystery.json`. The application must produce data in this exact shape when assembling artifact payloads. Key top-level keys:

| Fixture Key | Schema Source | Notes |
|-------------|-------------|-------|
| `session` | sessions table (id, title, date, host, location, caseNumber) | caseNumber = `YYYY-MMDD` |
| `setting` | sessions.config.setting_seed (era, location, description, crimeScene) | |
| `characters[]` | sessions.config.characters joined with participation (playedBy) | |
| `clues[]` | sessions.config.clues | Static from seed; distribution status separate |
| `accusations[]` | sessions.config.game_night.accusations | Formatted as `{accuser, target, reasoning}` |
| `reveal` | sessions.config.crime | Formatted as `{culprit, explanation}` |
| `votes[]` | sessions.config.awards | Formatted as `{character, count}` |
| `host` | sessions.host_id → users | `{id, name}` |
| `reflection` | sessions.config.sealed_envelopes (host-written) | |
| `stats` | Computed from game_night data | accuracy, mostSuspected, biggestSurprise, totalClues, totalPlayers |
| `recipes[]` | contributions where type='mm_recipe' | `{contributor, name, type, ingredients, steps}` |
