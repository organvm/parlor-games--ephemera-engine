ALTER TABLE session_participations
    ADD COLUMN IF NOT EXISTS character_data JSONB,
    ADD COLUMN IF NOT EXISTS character_assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS contribution_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

COMMENT ON COLUMN session_participations.character_data IS 'Murder Mystery: assigned character sheet data (name, occupation, personality, secret, relationships, contribution brief).';
COMMENT ON COLUMN session_participations.character_assigned_at IS 'Timestamp when the character was assigned and packet delivered.';
COMMENT ON COLUMN session_participations.contribution_deadline IS 'Per-participant contribution deadline. Defaults to session-level deadline but can be extended by host.';
COMMENT ON COLUMN session_participations.timezone IS 'Player timezone for quiet hours calculation. Detected on registration, user-configurable.';

ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS contribution_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS invitation_token_shared UUID REFERENCES invitation_tokens(id);

COMMENT ON COLUMN sessions.contribution_deadline IS 'Default contribution deadline for all participants. Individual deadlines in session_participations override this.';

CREATE TABLE character_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id      UUID NOT NULL REFERENCES session_participations(id) ON DELETE CASCADE,
    rankings            JSONB NOT NULL DEFAULT '[]',
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_session_participant UNIQUE (session_id, participant_id)
);

COMMENT ON TABLE character_preferences IS 'Player archetype preference rankings for Murder Mystery preference-based role assignment.';
COMMENT ON COLUMN character_preferences.rankings IS 'Ordered array of archetype IDs: [{"archetype_id": "the-artist", "rank": 1}, {"archetype_id": "the-merchant", "rank": 2}].';

CREATE INDEX idx_character_preferences_session ON character_preferences(session_id);

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
