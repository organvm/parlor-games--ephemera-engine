CREATE TABLE public.sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type     game_type NOT NULL,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  date_time     TIMESTAMPTZ NOT NULL,
  state         session_state NOT NULL DEFAULT 'DRAFT',
  host_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  invite_code   TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sessions IS 'Game sessions from creation to archival. Each session belongs to one host.';
COMMENT ON COLUMN public.sessions.config IS 'Game-specific configuration. Schema varies by game_type.';
COMMENT ON COLUMN public.sessions.invite_code IS 'Unique 8-character alphanumeric code for invitation deep links. Generated on DRAFT->INVITING.';
COMMENT ON COLUMN public.sessions.state IS 'Lifecycle state. Transitions enforced by validate_session_state_transition trigger.';
