# Data Model: 006 Artifact Generation Pipeline

Entity definitions, Supabase PostgreSQL schema, Row Level Security policies, and storage bucket configuration for the artifact pipeline.

---

## 1. Entity Relationship Diagram

```
Session (from spec 001)
├── has_many: Artifact
│   ├── has_many: ArtifactDelivery
│   └── has_one: ArtifactWritingPrompt (for host-written delayed artifacts)
└── has_many: SessionParticipation (from spec 001)
    └── has_many: ArtifactDelivery

User (from spec 001)
└── can access: Artifact (via SessionParticipation)
```

---

## 2. Tables

### 2.1 `artifacts`

Stores metadata for each generated artifact. One row per artifact instance (shared artifacts have one row; personalized artifacts have one row per player).

```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  catalog_id TEXT NOT NULL,                    -- A01, A02, A03, A04, A05, A06, A07
  template_name TEXT NOT NULL,                 -- maps to TEMPLATE_MAP in render.ts
  name TEXT NOT NULL,                          -- human-readable: "The Album", "Proust's Answer"
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'generating', 'ready', 'delivered', 'failed')),
  delivery_type TEXT NOT NULL DEFAULT 'immediate'
    CHECK (delivery_type IN ('immediate', 'delayed')),

  -- File storage
  file_url TEXT,                               -- CDN URL after upload
  file_path TEXT,                              -- storage bucket path
  file_size INTEGER,                           -- bytes
  page_count INTEGER,                          -- estimated page count

  -- Personalization
  personalized_for UUID REFERENCES session_participations(id),  -- null = shared artifact

  -- Delayed delivery
  scheduled_delivery_at TIMESTAMPTZ,           -- when to deliver (null = immediate)

  -- Host-written content (for Sealed Envelope, Afterword)
  host_content TEXT,
  host_content_submitted_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,                    -- when all deliveries completed

  -- Constraints
  CONSTRAINT valid_file_url CHECK (
    (status IN ('queued', 'generating', 'failed')) OR (file_url IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_artifacts_session_id ON artifacts(session_id);
CREATE INDEX idx_artifacts_status ON artifacts(status);
CREATE INDEX idx_artifacts_scheduled_delivery ON artifacts(scheduled_delivery_at)
  WHERE status = 'queued' AND delivery_type = 'delayed';
CREATE INDEX idx_artifacts_personalized_for ON artifacts(personalized_for)
  WHERE personalized_for IS NOT NULL;
```

### 2.2 `artifact_deliveries`

Tracks per-recipient delivery of each artifact. One row per (artifact, participant) pair.

```sql
CREATE TABLE artifact_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participations(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed')),

  -- Delivery details
  download_url TEXT,                           -- participant-specific signed URL
  download_url_expires_at TIMESTAMPTZ,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One delivery record per artifact per participant
  CONSTRAINT unique_delivery UNIQUE (artifact_id, participant_id)
);

-- Indexes
CREATE INDEX idx_deliveries_artifact_id ON artifact_deliveries(artifact_id);
CREATE INDEX idx_deliveries_participant_id ON artifact_deliveries(participant_id);
CREATE INDEX idx_deliveries_status ON artifact_deliveries(status)
  WHERE status IN ('pending', 'sent', 'failed');
```

### 2.3 `artifact_writing_prompts`

Stores host writing prompts for delayed artifacts that include host-authored content (Sealed Envelope, Afterword).

```sql
CREATE TABLE artifact_writing_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('sealed_envelope', 'afterword')),
  prompt_text TEXT NOT NULL,                   -- the prompt displayed to the host
  target_participant_id UUID REFERENCES session_participations(id),  -- null for general prompts

  -- Host response
  submitted_content TEXT,
  submitted_at TIMESTAMPTZ,

  -- Notification tracking
  notified_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_writing_prompts_artifact_id ON artifact_writing_prompts(artifact_id);
CREATE INDEX idx_writing_prompts_host_id ON artifact_writing_prompts(host_id);
CREATE INDEX idx_writing_prompts_pending ON artifact_writing_prompts(host_id)
  WHERE submitted_at IS NULL;
```

---

## 3. Enums and Catalog Reference

### 3.1 Artifact Catalog

The `catalog_id` field maps to the PRD artifact catalog (section 5.5):

| catalog_id | Game | Name | template_name | delivery_type | personalized |
|------------|------|------|---------------|---------------|--------------|
| A01 | confession_album | The Album | the-album | immediate | false |
| A02 | confession_album | Contributions Table | contributions-table | immediate | false |
| A03 | confession_album | Proust's Answer | prousts-answer | delayed | true |
| A04 | murder_mystery | The Dossier | the-dossier | immediate | false |
| A05 | murder_mystery | Menu of the Damned | menu-of-the-damned | immediate | false |
| A06 | murder_mystery | Society Page Photo | (client-side) | immediate | false |
| A07 | murder_mystery | The Sealed Envelope | the-sealed-envelope | delayed | true |

### 3.2 Status State Machine

```
queued -> generating -> ready -> delivered
  |          |
  v          v
failed     failed
  |          |
  v          v
queued     queued    (via retry, max 3)
```

Valid transitions:
- `queued` -> `generating` (render service picks up)
- `generating` -> `ready` (PDF produced and uploaded)
- `generating` -> `failed` (render error)
- `ready` -> `delivered` (all deliveries confirmed)
- `failed` -> `queued` (retry)

---

## 4. Row Level Security (RLS)

### 4.1 `artifacts` RLS

```sql
-- Enable RLS
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Hosts can read/write artifacts for their sessions
CREATE POLICY "Hosts manage their session artifacts"
  ON artifacts
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE host_id = auth.uid()
    )
  );

-- Participants can read artifacts for their sessions
CREATE POLICY "Participants read their session artifacts"
  ON artifacts
  FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Personalized artifacts visible only to the specific participant
CREATE POLICY "Personalized artifacts for specific participant"
  ON artifacts
  FOR SELECT
  USING (
    personalized_for IS NULL  -- shared artifacts visible to all participants
    OR personalized_for IN (
      SELECT id FROM session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Service role bypasses RLS for generation service
-- (Cloud Run uses service role key)
```

### 4.2 `artifact_deliveries` RLS

```sql
ALTER TABLE artifact_deliveries ENABLE ROW LEVEL SECURITY;

-- Hosts can read all deliveries for their session artifacts
CREATE POLICY "Hosts read delivery status"
  ON artifact_deliveries
  FOR SELECT
  USING (
    artifact_id IN (
      SELECT a.id FROM artifacts a
      JOIN sessions s ON a.session_id = s.id
      WHERE s.host_id = auth.uid()
    )
  );

-- Participants can read their own delivery records
CREATE POLICY "Participants read own deliveries"
  ON artifact_deliveries
  FOR SELECT
  USING (
    participant_id IN (
      SELECT id FROM session_participations
      WHERE user_id = auth.uid()
    )
  );
```

### 4.3 `artifact_writing_prompts` RLS

```sql
ALTER TABLE artifact_writing_prompts ENABLE ROW LEVEL SECURITY;

-- Only the host can read/write their own writing prompts
CREATE POLICY "Hosts manage writing prompts"
  ON artifact_writing_prompts
  FOR ALL
  USING (host_id = auth.uid());
```

---

## 5. Storage Bucket Configuration

### 5.1 Bucket: `artifacts`

```sql
-- Create the artifacts bucket (via Supabase Dashboard or SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artifacts',
  'artifacts',
  false,                     -- private bucket (access via signed URLs)
  5242880,                   -- 5MB max file size
  ARRAY['application/pdf']   -- only PDFs
);
```

### 5.2 Storage RLS Policies

```sql
-- Hosts can upload artifacts for their sessions
CREATE POLICY "Hosts upload artifacts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'artifacts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM sessions WHERE host_id = auth.uid()
    )
  );

-- Session participants can download artifacts
CREATE POLICY "Participants download artifacts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'artifacts'
    AND (storage.foldername(name))[1] IN (
      SELECT session_id::text FROM session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Service role has full access (for Cloud Run uploads)
-- Handled automatically by using the service role key
```

### 5.3 File Path Convention

```
artifacts/{session_id}/{template_name}.pdf                          -- shared artifacts
artifacts/{session_id}/{template_name}/{participant_id}.pdf         -- personalized artifacts
```

Examples:
```
artifacts/sess-ca-001/the-album.pdf
artifacts/sess-ca-001/contributions-table.pdf
artifacts/sess-ca-001/prousts-answer/p3.pdf
artifacts/sess-mm-001/the-dossier.pdf
artifacts/sess-mm-001/menu-of-the-damned.pdf
artifacts/sess-mm-001/the-sealed-envelope/p1.pdf
```

---

## 6. Data Assembly Queries

### 6.1 Assemble Confession Album Data

Query to assemble the data shape expected by `the-album.njk`:

```sql
SELECT jsonb_build_object(
  'session', jsonb_build_object(
    'id', s.id,
    'title', s.name,
    'date', s.date_time::date,
    'host', (SELECT display_name FROM session_participations WHERE session_id = s.id AND role = 'host'),
    'location', s.config->>'location'
  ),
  'questionSet', s.config->'confession_album'->>'question_set',
  'players', (
    SELECT jsonb_agg(jsonb_build_object('id', sp.id, 'name', sp.display_name))
    FROM session_participations sp WHERE sp.session_id = s.id AND sp.rsvp_status = 'accepted'
  ),
  'questions', s.config->'confession_album'->'questions',
  'answers', (
    SELECT jsonb_agg(jsonb_build_object(
      'playerId', c.participant_id,
      'questionId', c.content->>'questionId',
      'text', c.content->>'text'
    ))
    FROM contributions c WHERE c.session_id = s.id AND c.type = 'answer'
  )
) AS template_data
FROM sessions s
WHERE s.id = $1;
```

### 6.2 Assemble Proust's Answer Data (Per Player)

```sql
SELECT jsonb_build_object(
  'player', jsonb_build_object('id', sp.id, 'name', sp.display_name),
  'question', q.value,
  'playerAnswer', c.content->>'text',
  'proustAnswer', q.value->>'proustResponse',
  'questionLineage', q.value->>'lineage',
  'sessionDate', s.date_time::date
) AS template_data
FROM session_participations sp
JOIN sessions s ON sp.session_id = s.id
JOIN contributions c ON c.participant_id = sp.id AND c.type = 'answer'
CROSS JOIN LATERAL jsonb_array_elements(s.config->'confession_album'->'questions') AS q(value)
WHERE sp.id = $1
  AND q.value->>'id' = c.content->>'questionId';
```

---

## 7. Migration Notes

- All tables use UUIDs as primary keys, consistent with spec 001.
- Foreign keys reference tables from spec 001 (`sessions`, `session_participations`, `auth.users`).
- The `artifacts.status` field uses a CHECK constraint rather than a PostgreSQL enum type, for easier future extension.
- Indexes are designed for the primary query patterns: lookup by session, filter by status, and scheduled delivery queue processing.
- The `CONSTRAINT valid_file_url` ensures that artifacts in `ready` or `delivered` status always have a file URL.
