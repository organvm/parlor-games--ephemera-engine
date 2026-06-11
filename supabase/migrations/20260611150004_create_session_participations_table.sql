CREATE TABLE public.session_participations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  display_name  TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  email         TEXT,
  role          participant_role NOT NULL,
  rsvp_status   rsvp_status NOT NULL DEFAULT 'pending',
  character_id  UUID,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A user can participate in a session only once
  UNIQUE (session_id, user_id)
);

COMMENT ON TABLE public.session_participations IS 'Links users to sessions. user_id is nullable for web players (cookie-based identity).';
COMMENT ON COLUMN public.session_participations.user_id IS 'NULL for web players who join via anonymous auth. Can be linked later if they create an account.';
COMMENT ON COLUMN public.session_participations.email IS 'Collected from web players for artifact delivery. Not used for marketing.';
COMMENT ON COLUMN public.session_participations.character_id IS 'References a character in the game-specific data. Used by Murder Mystery only.';
