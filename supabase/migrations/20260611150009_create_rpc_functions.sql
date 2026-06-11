
CREATE OR REPLACE FUNCTION transition_session_state(
  p_session_id UUID,
  p_new_state session_state,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate the user has access (host or system)
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE id = p_session_id AND host_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to transition session state';
  END IF;

  UPDATE public.sessions
  SET state = p_new_state
  WHERE id = p_session_id;

  -- The triggers (validate_session_state_transition and log_session_state_transition)
  -- will handle the validation and logging.
  
  -- If metadata is provided, we can update the log entry that was just created by the trigger.
  IF p_metadata IS NOT NULL THEN
    UPDATE public.session_state_log
    SET metadata = p_metadata
    WHERE session_id = p_session_id
    AND to_state = p_new_state
    AND id = (
      SELECT id FROM public.session_state_log
      WHERE session_id = p_session_id AND to_state = p_new_state
      ORDER BY timestamp DESC LIMIT 1
    );
  END IF;
END;
$$;

