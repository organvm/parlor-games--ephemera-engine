CREATE TABLE public.session_state_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  from_state    session_state NOT NULL,
  to_state      session_state NOT NULL,
  triggered_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata      JSONB
);

COMMENT ON TABLE public.session_state_log IS 'Audit log of all session state transitions. Immutable (append-only).';
COMMENT ON COLUMN public.session_state_log.triggered_by IS 'The user who initiated the transition. NULL for system-triggered transitions.';
COMMENT ON COLUMN public.session_state_log.metadata IS 'Additional context: reason for cancellation, auto-archive trigger, etc.';
