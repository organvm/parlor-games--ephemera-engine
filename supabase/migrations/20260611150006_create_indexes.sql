-- users: lookup by email for account linking
CREATE INDEX idx_users_email ON public.users(email);

-- sessions: host lookup (dashboard, session list)
CREATE INDEX idx_sessions_host_id ON public.sessions(host_id);

-- sessions: state filtering (active sessions, archived sessions)
CREATE INDEX idx_sessions_state ON public.sessions(state);

-- sessions: invite code lookup (deep link resolution)
CREATE UNIQUE INDEX idx_sessions_invite_code ON public.sessions(invite_code) WHERE invite_code IS NOT NULL;

-- sessions: upcoming sessions ordered by date
CREATE INDEX idx_sessions_date_time ON public.sessions(date_time);

-- session_participations: user's sessions (RLS policy performance)
CREATE INDEX idx_session_participations_user_id ON public.session_participations(user_id);

-- session_participations: session roster
CREATE INDEX idx_session_participations_session_id ON public.session_participations(session_id);

-- session_participations: email lookup for web player account linking
CREATE INDEX idx_session_participations_email ON public.session_participations(email) WHERE email IS NOT NULL;

-- session_state_log: session history
CREATE INDEX idx_session_state_log_session_id ON public.session_state_log(session_id);

-- session_state_log: chronological ordering
CREATE INDEX idx_session_state_log_timestamp ON public.session_state_log(timestamp);
