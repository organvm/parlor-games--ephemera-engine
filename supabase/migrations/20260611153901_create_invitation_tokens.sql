-- Create invitation_tokens table
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

-- Add indexes
CREATE UNIQUE INDEX idx_invitation_tokens_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_session ON invitation_tokens(session_id);
CREATE INDEX idx_invitation_tokens_session_shared ON invitation_tokens(session_id) WHERE is_shared = true;

-- Add RLS Policies
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

-- Add references to sessions table
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS invitation_token_shared UUID REFERENCES invitation_tokens(id);

COMMENT ON COLUMN sessions.invitation_token_shared IS 'Reference to the primary shared invitation token for this session.';
