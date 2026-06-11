CREATE OR REPLACE FUNCTION validate_session_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow no-op updates (state unchanged)
  IF OLD.state = NEW.state THEN
    RETURN NEW;
  END IF;

  -- Validate transition
  IF NOT (
    (OLD.state = 'DRAFT'     AND NEW.state IN ('INVITING', 'CANCELED')) OR
    (OLD.state = 'INVITING'  AND NEW.state IN ('PREPARING', 'CANCELED')) OR
    (OLD.state = 'PREPARING' AND NEW.state IN ('ACTIVE', 'CANCELED')) OR
    (OLD.state = 'ACTIVE'    AND NEW.state = 'COMPLETE') OR
    (OLD.state = 'COMPLETE'  AND NEW.state = 'ARCHIVED')
  ) THEN
    RAISE EXCEPTION 'Invalid session state transition: % -> %', OLD.state, NEW.state
      USING ERRCODE = 'check_violation';
  END IF;

  -- Update the updated_at timestamp
  NEW.updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_session_state
  BEFORE UPDATE OF state ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_session_state_transition();

CREATE OR REPLACE FUNCTION log_session_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state != NEW.state THEN
    INSERT INTO public.session_state_log (session_id, from_state, to_state, triggered_by)
    VALUES (NEW.id, OLD.state, NEW.state, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_session_state
  AFTER UPDATE OF state ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_state_transition();

CREATE OR REPLACE FUNCTION activate_host_on_first_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET is_host = TRUE
  WHERE id = NEW.host_id AND is_host = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_activate_host
  AFTER INSERT ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION activate_host_on_first_session();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
