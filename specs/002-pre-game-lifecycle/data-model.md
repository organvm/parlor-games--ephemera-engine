# Data Model: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Database**: PostgreSQL (Supabase)
**Depends on**: 001-auth-and-sessions (users, sessions, session_participations tables)

---

## Entity Relationship Diagram

```
users (from 001)              sessions (from 001)
  │                              │
  │ 1:N                          │ 1:N
  ▼                              ▼
push_tokens                  invitation_tokens
                                 │
session_participations           │ 1:1 (optional)
(from 001)                       ▼
  │                          session_participations (from 001)
  │ 1:N
  ▼
contributions
  │
  │ N:1
  ▼
sessions

notification_queue ───▶ users (recipient)
                  ───▶ sessions (context)

content_packs
  │
  │ N:N
  ▼
user_content_packs ◀── users

character_preferences ──▶ session_participations
```

---

## Table Definitions

### invitation_tokens

Stores deep link tokens for session invitations.

```sql
CREATE TABLE invitation_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    token           VARCHAR(22) NOT NULL UNIQUE,
    participant_id  UUID REFERENCES session_participations(id) ON DELETE SET NULL,
    is_shared       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    redeemed_at     TIMESTAMPTZ,
    redeemed_by     UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT token_format CHECK (token ~ '^[A-Za-z0-9]{22}$')
);

COMMENT ON TABLE invitation_tokens IS 'Deep link tokens for session invitations. One shared token per session, or individual tokens per invitee.';
COMMENT ON COLUMN invitation_tokens.token IS '22-character base62-encoded 128-bit cryptographically random token.';
COMMENT ON COLUMN invitation_tokens.is_shared IS 'True if the token is a shared link (any recipient); false if it is tied to a specific invitee.';
COMMENT ON COLUMN invitation_tokens.participant_id IS 'If not shared, the specific invitee this token was generated for.';
```

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_invitation_tokens_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_session ON invitation_tokens(session_id);
CREATE INDEX idx_invitation_tokens_session_shared ON invitation_tokens(session_id) WHERE is_shared = true;
```

**RLS Policies**:
```sql
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Host can manage invitation tokens for their sessions
CREATE POLICY invitation_tokens_host_all ON invitation_tokens
    FOR ALL
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );

-- Anyone can read a token by value (for deep link resolution)
CREATE POLICY invitation_tokens_read_by_token ON invitation_tokens
    FOR SELECT
    USING (true);

-- Note: The read policy is intentionally broad because token resolution
-- must work for unauthenticated users (web players). The token itself
-- acts as a capability token. No sensitive data is in this table.
```

---

### contributions

Stores all pre-game contributions from players.

```sql
CREATE TABLE contributions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES session_participations(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    content         JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    photo_urls      TEXT[] DEFAULT '{}',
    submitted_at    TIMESTAMPTZ,
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    flagged         BOOLEAN NOT NULL DEFAULT false,
    flag_reason     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'reviewed', 'excused')),
    CONSTRAINT valid_type CHECK (type IN (
        -- Confession Album
        'contribution_description',
        -- Murder Mystery
        'character_preparation', 'cocktail_description', 'dish_description',
        'character_preference',
        -- Whose Memory
        'story_submission',
        -- Exquisite Corpse
        'fragment_submission'
    )),
    CONSTRAINT submitted_at_required CHECK (
        (status = 'draft') OR (submitted_at IS NOT NULL)
    )
);

COMMENT ON TABLE contributions IS 'Pre-game contributions from players. Stores structured content as JSONB for flexibility across game types.';
COMMENT ON COLUMN contributions.type IS 'Game-specific contribution type. Determines which form fields are expected in the content JSON.';
COMMENT ON COLUMN contributions.content IS 'Structured contribution data. Schema varies by type. Examples: {text: "...", word_count: 42} or {alibi: "...", motive: "...", last_words: "..."}.';
COMMENT ON COLUMN contributions.status IS 'draft = work in progress (saved locally and/or server-side); submitted = player has finalized; reviewed = host has read; excused = host marked player as not submitting.';
COMMENT ON COLUMN contributions.photo_urls IS 'Array of Supabase Storage URLs for uploaded photos.';
```

**Content JSON schemas by type**:
```
contribution_description:
  { text: string, photo_description?: string }

character_preparation:
  { alibi: string, motive: string, last_words: string }

cocktail_description:
  { name: string, description: string, ingredients?: string[] }

dish_description:
  { name: string, description: string }

character_preference:
  { rankings: [{ archetype_id: string, rank: number }] }

story_submission:
  { title: string, text: string, word_count: number }

fragment_submission:
  { text: string }
```

**Indexes**:
```sql
CREATE INDEX idx_contributions_session ON contributions(session_id);
CREATE INDEX idx_contributions_participant ON contributions(participant_id);
CREATE INDEX idx_contributions_session_status ON contributions(session_id, status);
CREATE INDEX idx_contributions_session_type ON contributions(session_id, type);
CREATE UNIQUE INDEX idx_contributions_unique_per_type ON contributions(session_id, participant_id, type);
```

**Trigger for updated_at**:
```sql
CREATE OR REPLACE FUNCTION update_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contributions_updated_at
    BEFORE UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_contributions_updated_at();
```

**RLS Policies**:
```sql
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Players can read and write their own contributions
CREATE POLICY contributions_player_select ON contributions
    FOR SELECT
    USING (
        participant_id IN (
            SELECT id FROM session_participations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY contributions_player_insert ON contributions
    FOR INSERT
    WITH CHECK (
        participant_id IN (
            SELECT id FROM session_participations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY contributions_player_update ON contributions
    FOR UPDATE
    USING (
        participant_id IN (
            SELECT id FROM session_participations
            WHERE user_id = auth.uid()
        )
        AND status IN ('draft', 'submitted')
    );

-- Host can read all contributions for their sessions
CREATE POLICY contributions_host_select ON contributions
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );

-- Host can update contribution status (review, flag, excuse)
CREATE POLICY contributions_host_update ON contributions
    FOR UPDATE
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );
```

---

### notification_queue

Server-side notification queue for all notification types.

```sql
CREATE TABLE notification_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
    recipient_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    category        VARCHAR(10) NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    data            JSONB DEFAULT '{}',
    channel         VARCHAR(20) NOT NULL DEFAULT 'push',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    scheduled_for   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    batch_key       VARCHAR(100),
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    error           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_category CHECK (category IN (
        'N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08',
        'N09', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16'
    )),
    CONSTRAINT valid_channel CHECK (channel IN ('push', 'email', 'push_email')),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'scheduled', 'ready', 'sending', 'sent',
        'delivered', 'failed', 'suppressed'
    )),
    CONSTRAINT recipient_required CHECK (
        recipient_id IS NOT NULL OR recipient_email IS NOT NULL
    )
);

COMMENT ON TABLE notification_queue IS 'Server-side notification queue. All notifications pass through this table for scheduling, deduplication, quiet hours, and delivery tracking.';
COMMENT ON COLUMN notification_queue.category IS 'Notification type ID from PRD 5.4 (N01-N16).';
COMMENT ON COLUMN notification_queue.channel IS 'Delivery channel: push (app players), email (web players), push_email (both).';
COMMENT ON COLUMN notification_queue.batch_key IS 'Key for batching notifications. Notifications with the same batch_key for the same recipient are grouped (e.g., host contribution notifications).';
COMMENT ON COLUMN notification_queue.scheduled_for IS 'When the notification should be sent. For immediate notifications, this is NOW(). For scheduled reminders, this is the future time.';
COMMENT ON COLUMN notification_queue.status IS 'pending = just created; scheduled = will fire at scheduled_for; ready = processed by scheduler, awaiting dispatch; sending = being sent; sent = confirmed sent to provider; delivered = confirmed received; failed = error; suppressed = deduplicated or quiet hours.';
```

**Indexes**:
```sql
CREATE INDEX idx_notification_queue_status_scheduled ON notification_queue(status, scheduled_for)
    WHERE status IN ('pending', 'scheduled');
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_id);
CREATE INDEX idx_notification_queue_session ON notification_queue(session_id);
CREATE INDEX idx_notification_queue_batch ON notification_queue(batch_key, recipient_id, created_at)
    WHERE batch_key IS NOT NULL;
CREATE INDEX idx_notification_queue_dedup ON notification_queue(recipient_id, category, session_id, created_at);
```

**RLS Policies**:
```sql
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY notification_queue_user_select ON notification_queue
    FOR SELECT
    USING (recipient_id = auth.uid());

-- Hosts can read notifications for their sessions
CREATE POLICY notification_queue_host_select ON notification_queue
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );

-- Only server (service role) can insert/update notifications
-- Client-side inserts go through RPC functions that use the service role internally
```

**Deduplication function**:
```sql
CREATE OR REPLACE FUNCTION should_suppress_notification(
    p_recipient_id UUID,
    p_category VARCHAR(10),
    p_session_id UUID,
    p_window_hours INTEGER DEFAULT 12
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notification_queue
        WHERE recipient_id = p_recipient_id
          AND category = p_category
          AND session_id = p_session_id
          AND status NOT IN ('failed', 'suppressed')
          AND created_at > NOW() - (p_window_hours || ' hours')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Batch check function**:
```sql
CREATE OR REPLACE FUNCTION should_batch_notification(
    p_batch_key VARCHAR(100),
    p_recipient_id UUID,
    p_batch_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notification_queue
        WHERE batch_key = p_batch_key
          AND recipient_id = p_recipient_id
          AND status IN ('sent', 'delivered', 'sending')
          AND created_at > NOW() - (p_batch_window_minutes || ' minutes')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### push_tokens

Stores Expo push tokens for registered devices.

```sql
CREATE TABLE push_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL,
    platform    VARCHAR(10) NOT NULL,
    device_id   VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_platform CHECK (platform IN ('ios', 'android')),
    CONSTRAINT token_not_empty CHECK (LENGTH(token) > 0)
);

COMMENT ON TABLE push_tokens IS 'Expo push tokens for registered devices. A user can have multiple tokens (multiple devices).';
COMMENT ON COLUMN push_tokens.token IS 'Expo push token format: ExponentPushToken[xxxxxxxxxxxx]';
COMMENT ON COLUMN push_tokens.is_active IS 'Set to false when Expo reports DeviceNotRegistered for this token.';
```

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_push_tokens_user_token ON push_tokens(user_id, token);
CREATE INDEX idx_push_tokens_user_active ON push_tokens(user_id) WHERE is_active = true;
```

**RLS Policies**:
```sql
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY push_tokens_user_all ON push_tokens
    FOR ALL
    USING (user_id = auth.uid());
```

---

### content_packs

Catalog of available content packs (both bundled and purchasable).

```sql
CREATE TABLE content_packs (
    id              VARCHAR(100) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    game_type       VARCHAR(30) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    price_tier      VARCHAR(20) NOT NULL DEFAULT 'free',
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    description     VARCHAR(200) NOT NULL,
    long_description TEXT,
    preview_items   INTEGER NOT NULL DEFAULT 3,
    author          VARCHAR(100) NOT NULL DEFAULT 'Ephemera Engine',
    tags            TEXT[] DEFAULT '{}',
    item_count      INTEGER NOT NULL DEFAULT 0,
    items           JSONB NOT NULL DEFAULT '[]',
    is_bundled      BOOLEAN NOT NULL DEFAULT false,
    platform_sku_ios     VARCHAR(100),
    platform_sku_android VARCHAR(100),
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_game_type CHECK (game_type IN (
        'confession-album', 'murder-mystery', 'whose-memory', 'exquisite-corpse'
    )),
    CONSTRAINT valid_pack_type CHECK (type IN (
        'question-lineage', 'setting-seed', 'era-packet',
        'theme', 'template', 'game-unlock'
    )),
    CONSTRAINT valid_price_tier CHECK (price_tier IN ('free', 'standard', 'premium')),
    CONSTRAINT version_semver CHECK (version ~ '^\d+\.\d+\.\d+$')
);

COMMENT ON TABLE content_packs IS 'Catalog of content packs. Bundled packs ship with the app; purchasable packs are downloaded after IAP.';
COMMENT ON COLUMN content_packs.id IS 'Globally unique pack ID matching the YAML schema (e.g., confession-album-mortality-v1).';
COMMENT ON COLUMN content_packs.items IS 'Array of content items in the pack. Schema varies by type, matching PRD 5.6 format.';
COMMENT ON COLUMN content_packs.is_bundled IS 'True for packs that ship with the app binary and are available without purchase.';
COMMENT ON COLUMN content_packs.platform_sku_ios IS 'Apple App Store product ID for IAP.';
COMMENT ON COLUMN content_packs.platform_sku_android IS 'Google Play product ID for IAP.';
```

**Indexes**:
```sql
CREATE INDEX idx_content_packs_game ON content_packs(game_type);
CREATE INDEX idx_content_packs_type ON content_packs(type);
CREATE INDEX idx_content_packs_published ON content_packs(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_content_packs_bundled ON content_packs(is_bundled) WHERE is_bundled = true;
```

**RLS Policies**:
```sql
ALTER TABLE content_packs ENABLE ROW LEVEL SECURITY;

-- Everyone can read published packs (store browsing works without auth)
CREATE POLICY content_packs_public_read ON content_packs
    FOR SELECT
    USING (published_at IS NOT NULL OR is_bundled = true);

-- Only server (service role) can insert/update packs
```

---

### user_content_packs

Junction table tracking which users own which content packs.

```sql
CREATE TABLE user_content_packs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id         VARCHAR(100) NOT NULL REFERENCES content_packs(id) ON DELETE CASCADE,
    purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    receipt_data    JSONB,
    platform        VARCHAR(10) NOT NULL,
    downloaded_at   TIMESTAMPTZ,

    CONSTRAINT valid_platform CHECK (platform IN ('ios', 'android', 'bundled')),
    CONSTRAINT unique_user_pack UNIQUE (user_id, pack_id)
);

COMMENT ON TABLE user_content_packs IS 'Junction table for user-owned content packs. Includes purchase receipt data for audit.';
COMMENT ON COLUMN user_content_packs.receipt_data IS 'Validated purchase receipt from Apple/Google. Stored for audit and dispute resolution.';
COMMENT ON COLUMN user_content_packs.downloaded_at IS 'When the pack content was successfully downloaded to the device. Null if not yet downloaded.';
```

**Indexes**:
```sql
CREATE INDEX idx_user_content_packs_user ON user_content_packs(user_id);
CREATE INDEX idx_user_content_packs_pack ON user_content_packs(pack_id);
```

**RLS Policies**:
```sql
ALTER TABLE user_content_packs ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY user_content_packs_user_select ON user_content_packs
    FOR SELECT
    USING (user_id = auth.uid());

-- Only server (service role) can insert purchases (after receipt validation)
```

---

### notification_preferences

User notification preferences per category.

```sql
CREATE TABLE notification_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        VARCHAR(30) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT true,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_pref_category CHECK (category IN (
        'invitations', 'contribution_reminders', 'game_night',
        'artifacts', 'delayed_artifacts', 'email'
    )),
    CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

COMMENT ON TABLE notification_preferences IS 'Per-user notification preferences. Categories group multiple notification types (N01-N16). Missing rows default to enabled.';
```

**Indexes**:
```sql
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
```

**RLS Policies**:
```sql
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY notification_preferences_user_all ON notification_preferences
    FOR ALL
    USING (user_id = auth.uid());
```

---

### character_preferences (Murder Mystery)

Stores player archetype preference rankings for preference-based role assignment.

```sql
CREATE TABLE character_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id      UUID NOT NULL REFERENCES session_participations(id) ON DELETE CASCADE,
    rankings            JSONB NOT NULL DEFAULT '[]',
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_session_participant UNIQUE (session_id, participant_id)
);

COMMENT ON TABLE character_preferences IS 'Player archetype preference rankings for Murder Mystery preference-based role assignment.';
COMMENT ON COLUMN character_preferences.rankings IS 'Ordered array of archetype IDs: [{archetype_id: "the-artist", rank: 1}, {archetype_id: "the-merchant", rank: 2}, ...].';
```

**Indexes**:
```sql
CREATE INDEX idx_character_preferences_session ON character_preferences(session_id);
```

**RLS Policies**:
```sql
ALTER TABLE character_preferences ENABLE ROW LEVEL SECURITY;

-- Players can manage their own preferences
CREATE POLICY character_preferences_player_all ON character_preferences
    FOR ALL
    USING (
        participant_id IN (
            SELECT id FROM session_participations WHERE user_id = auth.uid()
        )
    );

-- Host can read all preferences for their sessions
CREATE POLICY character_preferences_host_select ON character_preferences
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );
```

---

## Modifications to Existing Tables (from 001)

### session_participations -- Add columns

```sql
ALTER TABLE session_participations
    ADD COLUMN IF NOT EXISTS character_data JSONB,
    ADD COLUMN IF NOT EXISTS character_assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS contribution_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

COMMENT ON COLUMN session_participations.character_data IS 'Murder Mystery: assigned character sheet data (name, occupation, personality, secret, relationships, contribution brief).';
COMMENT ON COLUMN session_participations.character_assigned_at IS 'Timestamp when the character was assigned and packet delivered.';
COMMENT ON COLUMN session_participations.contribution_deadline IS 'Per-participant contribution deadline. Defaults to session-level deadline but can be extended by host.';
COMMENT ON COLUMN session_participations.timezone IS 'Player timezone for quiet hours calculation. Detected on registration, user-configurable.';
```

### sessions -- Add columns

```sql
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS contribution_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS invitation_token_shared UUID REFERENCES invitation_tokens(id);

COMMENT ON COLUMN sessions.contribution_deadline IS 'Default contribution deadline for all participants. Individual deadlines in session_participations override this.';
```

---

## Database Functions

### enqueue_notification

Server-side function to add notifications to the queue with deduplication and preference checks.

```sql
CREATE OR REPLACE FUNCTION enqueue_notification(
    p_session_id UUID,
    p_recipient_id UUID,
    p_recipient_email VARCHAR,
    p_category VARCHAR(10),
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}',
    p_channel VARCHAR(20) DEFAULT 'push',
    p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    p_batch_key VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_suppressed BOOLEAN;
    v_preference_enabled BOOLEAN;
BEGIN
    -- Check deduplication
    v_suppressed := should_suppress_notification(p_recipient_id, p_category, p_session_id);
    IF v_suppressed THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Check user preferences (missing preference = enabled)
    SELECT COALESCE(
        (SELECT enabled FROM notification_preferences
         WHERE user_id = p_recipient_id
           AND category = notification_category_group(p_category)),
        true
    ) INTO v_preference_enabled;

    IF NOT v_preference_enabled THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Check batching
    IF p_batch_key IS NOT NULL AND should_batch_notification(p_batch_key, p_recipient_id) THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Insert as pending/scheduled
    INSERT INTO notification_queue (
        session_id, recipient_id, recipient_email, category,
        title, body, data, channel, status, scheduled_for, batch_key
    ) VALUES (
        p_session_id, p_recipient_id, p_recipient_email, p_category,
        p_title, p_body, p_data, p_channel,
        CASE WHEN p_scheduled_for > NOW() THEN 'scheduled' ELSE 'pending' END,
        p_scheduled_for, p_batch_key
    ) RETURNING id INTO v_notification_id;

    -- For immediate notifications, trigger dispatch
    IF p_scheduled_for <= NOW() THEN
        PERFORM pg_notify('dispatch_notification', v_notification_id::TEXT);
    END IF;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### notification_category_group

Maps individual notification categories (N01-N16) to user preference categories.

```sql
CREATE OR REPLACE FUNCTION notification_category_group(p_category VARCHAR(10))
RETURNS VARCHAR(30) AS $$
BEGIN
    RETURN CASE p_category
        WHEN 'N01' THEN 'invitations'
        WHEN 'N02' THEN 'invitations'
        WHEN 'N03' THEN 'invitations'
        WHEN 'N04' THEN 'invitations'
        WHEN 'N05' THEN 'contribution_reminders'
        WHEN 'N06' THEN 'contribution_reminders'
        WHEN 'N07' THEN 'contribution_reminders'
        WHEN 'N08' THEN 'contribution_reminders'
        WHEN 'N09' THEN 'game_night'
        WHEN 'N10' THEN 'game_night'
        WHEN 'N11' THEN 'artifacts'
        WHEN 'N12' THEN 'delayed_artifacts'
        WHEN 'N13' THEN 'delayed_artifacts'
        WHEN 'N14' THEN 'contribution_reminders'
        WHEN 'N15' THEN 'invitations'
        WHEN 'N16' THEN 'contribution_reminders'
        ELSE 'invitations'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### process_pending_notifications

Called by pg_cron to move scheduled notifications to ready status.

```sql
CREATE OR REPLACE FUNCTION process_pending_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH ready_notifications AS (
        UPDATE notification_queue
        SET status = 'ready'
        WHERE status = 'scheduled'
          AND scheduled_for <= NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_count FROM ready_notifications;

    -- Notify the Edge Function for each batch
    IF v_count > 0 THEN
        PERFORM pg_notify('dispatch_notification', 'batch');
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**pg_cron schedule**:
```sql
SELECT cron.schedule(
    'process-notifications',
    '*/15 * * * *',
    $$SELECT process_pending_notifications()$$
);
```

---

## Storage Buckets

### contribution-photos

```sql
-- Supabase Storage bucket for contribution photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contribution-photos',
    'contribution-photos',
    false,
    2097152,  -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS: contributor can upload to their own path
CREATE POLICY contribution_photos_upload ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'contribution-photos'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- RLS: contributor and session host can read
CREATE POLICY contribution_photos_read ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'contribution-photos'
        AND (
            (storage.foldername(name))[1] = auth.uid()::TEXT
            OR EXISTS (
                SELECT 1 FROM sessions s
                JOIN contributions c ON c.session_id = s.id
                WHERE s.host_id = auth.uid()
                AND c.photo_urls @> ARRAY[name]
            )
        )
    );
```

### content-packs

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'content-packs',
    'content-packs',
    false,
    5242880,  -- 5MB limit per pack
    ARRAY['application/json']
);

-- RLS: only users who own the pack can download
CREATE POLICY content_packs_download ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'content-packs'
        AND EXISTS (
            SELECT 1 FROM user_content_packs
            WHERE user_id = auth.uid()
            AND pack_id = (storage.foldername(name))[1]
        )
    );
```
