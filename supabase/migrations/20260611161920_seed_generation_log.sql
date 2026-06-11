CREATE TABLE seed_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  input_axes JSONB NOT NULL,
  response_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Enable RLS
ALTER TABLE seed_generation_log ENABLE ROW LEVEL SECURITY;
