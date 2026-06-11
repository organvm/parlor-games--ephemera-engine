ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Participants can read co-participants' display_name and avatar
-- (for session roster display)
CREATE POLICY "users_select_co_participants"
  ON public.users FOR SELECT
  USING (
    id IN (
      SELECT sp2.user_id
      FROM public.session_participations sp1
      JOIN public.session_participations sp2 ON sp1.session_id = sp2.session_id
      WHERE sp1.user_id = auth.uid()
      AND sp2.user_id IS NOT NULL
    )
  );

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Host can read all their hosted sessions
CREATE POLICY "sessions_select_host"
  ON public.sessions FOR SELECT
  USING (host_id = auth.uid());

-- Participants can read sessions they belong to
CREATE POLICY "sessions_select_participant"
  ON public.sessions FOR SELECT
  USING (
    id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Anyone can read a session by invite_code (for join flow)
CREATE POLICY "sessions_select_by_invite"
  ON public.sessions FOR SELECT
  USING (invite_code IS NOT NULL AND state IN ('INVITING', 'PREPARING'));

-- Host can create sessions
CREATE POLICY "sessions_insert_host"
  ON public.sessions FOR INSERT
  WITH CHECK (host_id = auth.uid());

-- Host can update their sessions
CREATE POLICY "sessions_update_host"
  ON public.sessions FOR UPDATE
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

ALTER TABLE public.session_participations ENABLE ROW LEVEL SECURITY;

-- Host can manage all participations for their sessions
CREATE POLICY "participations_all_host"
  ON public.session_participations FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );

-- Participants can read co-participants
CREATE POLICY "participations_select_participant"
  ON public.session_participations FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own participation (RSVP)
CREATE POLICY "participations_insert_self"
  ON public.session_participations FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their own participation (RSVP status change)
CREATE POLICY "participations_update_self"
  ON public.session_participations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE public.session_state_log ENABLE ROW LEVEL SECURITY;

-- Host can read state log for their sessions
CREATE POLICY "state_log_select_host"
  ON public.session_state_log FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );

-- Insert handled by trigger (SECURITY DEFINER), not by direct client writes
-- No INSERT policy for regular users — log is append-only via trigger

-- Run daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-archived-sessions',
  '0 3 * * *',
  $$
    DELETE FROM public.sessions
    WHERE state = 'ARCHIVED'
    AND updated_at < now() - INTERVAL '90 days';
  $$
);

-- Cleanup abandoned anonymous users
SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 4 * * *',
  $$
    DELETE FROM auth.users
    WHERE is_anonymous = true
    AND last_sign_in_at < now() - INTERVAL '30 days';
  $$
);
