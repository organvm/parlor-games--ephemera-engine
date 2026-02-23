# Data Model: 003-confession-album

**Spec**: [spec.md](./spec.md)
**Last Updated**: 2026-02-23
**Source**: PRD §3.1.12, PRD §5.2, PRD §5.6

---

## 1. Entity Overview

The Confession Album data model extends the shared platform entities (User, Session, SessionParticipation, Contribution, Artifact) defined in 001-auth-and-sessions. This document defines the game-specific entities.

```
ConfessionAlbumData (1:1 with Session)
├── question_set: QuestionItem[]
├── player_order: PlayerId[]
├── contributions: ContributionItem[]
├── chain: ChainEntry[]
├── the_return: ReturnEntry[] (optional)
└── config: ConfessionAlbumConfig
```

---

## 2. Entity Definitions

### 2.1 QuestionItem

Represents a single question on the board. Questions are drawn from the content library and copied into the session's question set during pre-game curation.

```typescript
interface QuestionItem {
  /** Unique identifier within the session */
  id: string;

  /** The question text as displayed on the board */
  text: string;

  /**
   * Which tradition this question comes from.
   * Classic Proust: the 1886/1892 confession albums.
   * Vanity Fair: the magazine's back-page feature.
   * Pivot/Lipton: rapid-fire theatrical questions.
   * Thematic Remix: original to the Ephemera Engine.
   */
  lineage: 'classic-proust' | 'vanity-fair' | 'pivot-lipton' | 'thematic-remix';

  /**
   * Emotional depth register.
   * Light: preferences, favorites, easy disclosures.
   * Medium: values, relationships, gentle introspection.
   * Deep: mortality, fear, identity, vulnerability.
   */
  register: 'light' | 'medium' | 'deep';

  /**
   * Thematic domain the question touches.
   * Drawn from DESIGN.md §IV replayability section.
   */
  domain:
    | 'virtue'
    | 'appetite'
    | 'memory'
    | 'imagination'
    | 'mortality'
    | 'relationship'
    | 'aesthetics'
    | 'identity';

  /**
   * Proust's response from the 1886 confession album (age 13).
   * Null if Proust was never asked this question.
   */
  proust_response_1886: string | null;

  /**
   * Proust's response from the 1892 confession album (age 20).
   * Null if not present in the 1892 album.
   */
  proust_response_1892: string | null;

  /**
   * For non-Proust questions: the ID of an adjacent Proust question
   * whose answer can be paired for the Proust's Answer artifact.
   * Null for Classic Proust questions (which have direct responses).
   */
  proust_adjacent_question_id: string | null;

  /**
   * Position on the board (0-indexed). Set during pre-game curation.
   * Determines display order in grid/list layouts.
   */
  board_position: number;

  /**
   * Current status of this question during game night.
   * 'on-board': available for selection.
   * 'removed': selected and removed during the chain.
   */
  status: 'on-board' | 'removed';
}
```

### 2.2 ChainEntry

Records a single turn in The Chain mechanic. Each turn produces one entry. The chain is the core data structure that feeds artifact generation.

```typescript
interface ChainEntry {
  /** Auto-generated unique ID */
  id: string;

  /** Session this entry belongs to */
  session_id: string;

  /**
   * Turn number in the chain (1-indexed).
   * Turn 1 is the first player's turn (no inheritance).
   * The warm-up question answered by the host is NOT a chain entry.
   */
  turn_number: number;

  /** The player who took this turn */
  player_id: string;

  /**
   * The question inherited from the previous player's choice.
   * Null for turn 1 (first player has no inheritance).
   */
  inherited_question_id: string | null;

  /**
   * The player's answer to the inherited question.
   * Recorded by the host (typed summary) or submitted by the player.
   * May be empty if the player passed (accessibility: skip mechanic).
   */
  inherited_answer: string;

  /**
   * The question this player chose from the board.
   * This question will be inherited by the next player.
   */
  chosen_question_id: string;

  /**
   * The player's answer to their chosen question.
   * Same capture mechanism as inherited_answer.
   */
  chosen_answer: string;

  /**
   * Whether the host bookmarked this pairing as notable.
   * Bookmarked pairs are highlighted during The Portrait
   * and in The Album artifact.
   */
  bookmarked: boolean;

  /** Timestamp when this entry was created */
  created_at: string; // ISO 8601
}
```

### 2.3 ReturnEntry

Records a re-ask during The Return variant (optional). Tracking is informal -- the host may or may not log these.

```typescript
interface ReturnEntry {
  /** Auto-generated unique ID */
  id: string;

  /** Session this entry belongs to */
  session_id: string;

  /** The player who re-asked the question */
  asker_id: string;

  /** The player who was asked */
  target_id: string;

  /** The question that was re-asked (from the original board) */
  question_id: string;

  /** Optional: the target player's answer */
  answer: string | null;

  /** Timestamp */
  created_at: string; // ISO 8601
}
```

### 2.4 ContributionItem

Represents a guest's contribution archetype assignment and what they brought. Extends the shared Contribution entity from 002-pre-game-lifecycle.

```typescript
interface ContributionItem {
  /** Auto-generated unique ID */
  id: string;

  /** Session this contribution belongs to */
  session_id: string;

  /** The player assigned this archetype */
  player_id: string;

  /**
   * The contribution archetype from DESIGN.md §IV.
   */
  archetype:
    | 'happiness'    // "Your idea of happiness" — bring a drink
    | 'food'         // "Your favorite food" — bring it or its story
    | 'possession'   // "Your most treasured possession" — bring the object
    | 'word'         // "Your favorite word" — write it on a card
    | 'quality';     // "The quality you most admire" — bring music

  /**
   * Human-readable archetype label.
   * e.g., "Your idea of happiness"
   */
  archetype_label: string;

  /**
   * Evocative instruction for the guest.
   * e.g., "Bring a drink that embodies it"
   */
  archetype_instruction: string;

  /**
   * Guest's description of what they are bringing.
   * Optional -- submitted via the Contribution Brief.
   * e.g., "A thermos of my grandmother's Turkish coffee"
   */
  description: string;

  /** Whether the guest has submitted a description */
  submitted: boolean;

  /** Timestamp of submission */
  submitted_at: string | null; // ISO 8601
}
```

### 2.5 ConfessionAlbumConfig

Session-level configuration for the Confession Album game module.

```typescript
interface ConfessionAlbumConfig {
  /**
   * How the question board will be displayed during game night.
   * Digital: on host's device.
   * Physical: host prints cards.
   * Hybrid: digital + printed backup.
   */
  board_format: 'digital' | 'physical' | 'hybrid';

  /**
   * Layout of the digital board.
   * Grid: uniform grid (default).
   * List: single-column scrollable list.
   * Scattered: artistic random positioning (P3).
   */
  board_layout: 'grid' | 'list' | 'scattered';

  /** Background style for the digital board */
  board_background: 'warm-neutral' | 'dark' | 'custom';

  /** Custom background color (hex), used when board_background is 'custom' */
  board_background_color: string | null;

  /** Font size mode for the digital board */
  board_font_size: 'auto' | 'manual';

  /** Manual font size in points, used when board_font_size is 'manual' */
  board_font_size_value: number | null;

  /** Whether The Return variant is enabled */
  return_enabled: boolean;

  /** Whether a turn timer is enabled (not default -- accessibility) */
  timer_enabled: boolean;

  /** Timer duration in seconds, if timer_enabled */
  timer_duration: number | null;

  /**
   * How contribution archetypes are assigned to guests.
   */
  archetype_assignment: 'auto-assign' | 'manual' | 'player-choice';

  /**
   * Delay for Proust's Answer delivery, in days.
   * Default: 7. Configurable: 3-14.
   */
  prousts_answer_delay_days: number;
}
```

### 2.6 PlayerOrder

The ordered list of player IDs for The Chain. Stored as a JSON array on the session config.

```typescript
type PlayerOrder = string[]; // Array of player_id values, ordered
```

---

## 3. Content Library Question Schema

Questions in the content library (bundled and from content packs) use a superset of the QuestionItem fields. These are the source records from which session-specific QuestionItems are copied.

```typescript
interface ContentQuestion {
  /** Globally unique ID (e.g., "cp-001", "vf-003", "tr-012") */
  id: string;

  /** Full question text */
  text: string;

  /** Lineage classification */
  lineage: 'classic-proust' | 'vanity-fair' | 'pivot-lipton' | 'thematic-remix';

  /** Register classification */
  register: 'light' | 'medium' | 'deep';

  /** Domain classification */
  domain: string;

  /** Proust's 1886 response (null if not applicable) */
  proust_response_1886: string | null;

  /** Proust's 1892 response (null if not applicable) */
  proust_response_1892: string | null;

  /**
   * For non-Proust questions: reference to a Proust question
   * whose answer can serve as a companion in the Proust's Answer artifact.
   */
  proust_adjacent: string | null;

  /**
   * Contextual note about the question's history and lineage.
   * Used in the Proust's Answer artifact's postscript.
   */
  lineage_context: string | null;

  /** Content pack ID this question belongs to (null for bundled) */
  content_pack_id: string | null;

  /** Whether this question is part of the base (free) library */
  is_bundled: boolean;

  /** Tags for search and filtering */
  tags: string[];
}
```

**Reference**: The content pack YAML format (PRD §5.6) maps to this schema:
```yaml
# From PRD §5.6 — Question type
- id: "ca-mort-001"
  type: "question"
  text: "What do you want said at your funeral that probably won't be true?"
  lineage: "thematic-remix"
  register: "deep"
  domain: "mortality"
  proust_adjacent: "What is your idea of perfect happiness?"
  proust_response_1886: "To live close to all those I love..."
  proust_response_1892: null
```

---

## 4. Supabase Database Schema

### Tables

```sql
-- Game-specific data for Confession Album sessions
-- Extends the shared Session table via session_id FK

CREATE TABLE confession_album_question_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,          -- Source content question ID
  text TEXT NOT NULL,
  lineage TEXT NOT NULL CHECK (lineage IN ('classic-proust', 'vanity-fair', 'pivot-lipton', 'thematic-remix')),
  register TEXT NOT NULL CHECK (register IN ('light', 'medium', 'deep')),
  domain TEXT NOT NULL,
  proust_response_1886 TEXT,
  proust_response_1892 TEXT,
  proust_adjacent_question_id TEXT,
  board_position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'on-board' CHECK (status IN ('on-board', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

CREATE INDEX idx_ca_questions_session ON confession_album_question_items(session_id);

CREATE TABLE confession_album_chain_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  player_id UUID NOT NULL REFERENCES session_participations(id),
  inherited_question_id UUID REFERENCES confession_album_question_items(id),
  inherited_answer TEXT DEFAULT '',
  chosen_question_id UUID NOT NULL REFERENCES confession_album_question_items(id),
  chosen_answer TEXT DEFAULT '',
  bookmarked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, turn_number)
);

CREATE INDEX idx_ca_chain_session ON confession_album_chain_entries(session_id);

CREATE TABLE confession_album_return_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  asker_id UUID NOT NULL REFERENCES session_participations(id),
  target_id UUID NOT NULL REFERENCES session_participations(id),
  question_id UUID NOT NULL REFERENCES confession_album_question_items(id),
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ca_return_session ON confession_album_return_entries(session_id);

CREATE TABLE confession_album_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES session_participations(id),
  archetype TEXT NOT NULL CHECK (archetype IN ('happiness', 'food', 'possession', 'word', 'quality')),
  archetype_label TEXT NOT NULL,
  archetype_instruction TEXT NOT NULL,
  description TEXT DEFAULT '',
  submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, player_id)
);

CREATE INDEX idx_ca_contributions_session ON confession_album_contributions(session_id);

-- Content library (bundled + purchased questions)
CREATE TABLE content_questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  lineage TEXT NOT NULL CHECK (lineage IN ('classic-proust', 'vanity-fair', 'pivot-lipton', 'thematic-remix')),
  register TEXT NOT NULL CHECK (register IN ('light', 'medium', 'deep')),
  domain TEXT NOT NULL,
  proust_response_1886 TEXT,
  proust_response_1892 TEXT,
  proust_adjacent TEXT,
  lineage_context TEXT,
  content_pack_id TEXT,
  is_bundled BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_questions_lineage ON content_questions(lineage);
CREATE INDEX idx_content_questions_register ON content_questions(register);
CREATE INDEX idx_content_questions_domain ON content_questions(domain);
```

### Row-Level Security (RLS)

```sql
-- Question items: visible only to session participants
ALTER TABLE confession_album_question_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view question items"
  ON confession_album_question_items
  FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM session_participations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Host can manage question items"
  ON confession_album_question_items
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE host_id = auth.uid()
    )
  );

-- Chain entries: same pattern
ALTER TABLE confession_album_chain_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view chain entries"
  ON confession_album_chain_entries
  FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM session_participations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Host can manage chain entries"
  ON confession_album_chain_entries
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE host_id = auth.uid()
    )
  );

-- Content questions: visible to all authenticated users
ALTER TABLE content_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bundled content"
  ON content_questions
  FOR SELECT
  USING (is_bundled = true OR auth.uid() IS NOT NULL);
```

---

## 5. Fixture Schema Reference

The existing fixture at `artifacts/fixtures/confession-album.json` defines the sample data shape used by the artifact rendering pipeline. The current schema is:

```json
{
  "session": { "id", "title", "date", "host", "location" },
  "questionSet": "string (lineage label)",
  "players": [{ "id", "name" }],
  "questions": [{ "id", "text" }],
  "answers": [{ "playerId", "questionId", "text" }],
  "completionMatrix": { "playerId": ["questionId", ...] },
  "player": { "id", "name" },              // For Proust's Answer
  "question": { "id", "text" },            // For Proust's Answer
  "playerAnswer": "string",                // For Proust's Answer
  "proustAnswer": "string",                // For Proust's Answer
  "questionLineage": "string"              // For Proust's Answer
}
```

**Evolution needed**: The fixture should be extended with chain-specific data to support the-album.njk with chooser/inheritor attribution:

```json
{
  "chain": [
    {
      "turnNumber": 1,
      "questionId": "q1",
      "questionText": "What is your idea of perfect happiness?",
      "chooser": { "name": "Eleanor Voss", "answer": "A long afternoon..." },
      "inheritor": { "name": "James Harrington", "answer": "Being useful..." },
      "bookmarked": true
    }
  ],
  "contributions": [
    {
      "playerName": "Eleanor Voss",
      "archetype": "happiness",
      "archetypeLabel": "Your idea of happiness",
      "description": "A thermos of my grandmother's Turkish coffee"
    }
  ]
}
```

---

## 6. Entity Relationships Diagram

```
ContentQuestion (library)
       │
       │ copied into session
       ▼
QuestionItem ◄──── board_position, status
       │
       ├── referenced by ChainEntry.chosen_question_id
       ├── referenced by ChainEntry.inherited_question_id
       └── referenced by ReturnEntry.question_id

Session (from 001)
       │
       ├── has many: QuestionItem
       ├── has many: ChainEntry
       ├── has many: ReturnEntry
       ├── has many: ContributionItem
       ├── has one: ConfessionAlbumConfig (stored as JSON in session.config)
       └── has one: PlayerOrder (stored as JSON array in session.config)

SessionParticipation (from 001)
       │
       ├── referenced by ChainEntry.player_id
       ├── referenced by ReturnEntry.asker_id / target_id
       └── referenced by ContributionItem.player_id

Artifact (from 001)
       │
       ├── A01: The Album (session-wide, personalized_for = null)
       ├── A02: Contributions Table (within A01)
       └── A03: Proust's Answer (per-player, personalized_for = player_id)
```
