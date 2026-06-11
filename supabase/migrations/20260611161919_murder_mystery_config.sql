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
