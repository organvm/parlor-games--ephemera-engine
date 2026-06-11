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

CREATE INDEX idx_contributions_session ON contributions(session_id);
CREATE INDEX idx_contributions_participant ON contributions(participant_id);
CREATE INDEX idx_contributions_session_status ON contributions(session_id, status);
CREATE INDEX idx_contributions_session_type ON contributions(session_id, type);
CREATE UNIQUE INDEX idx_contributions_unique_per_type ON contributions(session_id, participant_id, type);

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
