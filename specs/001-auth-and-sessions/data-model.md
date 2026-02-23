# 001 — Data Model: Authentication & Session Management

Full entity definitions with Supabase/PostgreSQL types, RLS policies, indexes, constraints, and triggers.

---

## 1. Enumerations

```sql
-- Authentication providers
CREATE TYPE auth_provider AS ENUM ('email', 'apple', 'google');

-- Game types
CREATE TYPE game_type AS ENUM (
  'confession_album',
  'murder_mystery',
  'whose_memory',
  'exquisite_corpse'
);

-- Session lifecycle states
CREATE TYPE session_state AS ENUM (
  'DRAFT',
  'INVITING',
  'PREPARING',
  'ACTIVE',
  'COMPLETE',
  'ARCHIVED',
  'CANCELED'
);

-- Participant roles
CREATE TYPE participant_role AS ENUM ('host', 'app_player', 'web_player');

-- RSVP statuses
CREATE TYPE rsvp_status AS ENUM ('pending', 'accepted', 'declined', 'maybe');
```

---

## 2. Tables

### 2.1 users

Extends Supabase's `auth.users` with application-specific profile data. The `id` references `auth.users.id`.

```sql
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  email           TEXT NOT NULL,
  auth_provider   auth_provider NOT NULL DEFAULT 'email',
  avatar_url      TEXT,
  is_host         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Preferences (JSONB for flexibility; avoids schema migrations for new settings)
  notification_preferences JSONB NOT NULL DEFAULT '{
    "invitations": true,
    "contribution_reminders": true,
    "game_night": true,
    "artifacts": true,
    "delayed_artifacts": true,
    "email_notifications": true,
    "quiet_hours": {"enabled": true, "start": "22:00", "end": "08:00"}
  }'::jsonb,

  accessibility_preferences JSONB NOT NULL DEFAULT '{
    "text_size": "system",
    "high_contrast": false,
    "reduce_motion": "system",
    "screen_reader": "auto",
    "written_answer_mode": false,
    "theme": "system"
  }'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Application user profiles. Extends auth.users with display info and preferences.';
COMMENT ON COLUMN public.users.is_host IS 'Activated automatically on first session creation. No separate role system.';
COMMENT ON COLUMN public.users.notification_preferences IS 'Per-category notification toggles and quiet hours configuration.';
COMMENT ON COLUMN public.users.accessibility_preferences IS 'Text size, contrast, motion, screen reader, theme preferences.';
```

### 2.2 sessions

```sql
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
```

### 2.3 session_participations

```sql
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
```

### 2.4 session_state_log

```sql
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
```

---

## 3. Indexes

```sql
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
```

---

## 4. Triggers

### 4.1 Session State Transition Validation

```sql
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
```

### 4.2 Session State Transition Logging

```sql
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
```

### 4.3 Auto-Activate Host Flag

```sql
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
```

### 4.4 Updated_at Timestamp

```sql
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
```

---

## 5. Row-Level Security Policies

### 5.1 users

```sql
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
```

### 5.2 sessions

```sql
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
```

### 5.3 session_participations

```sql
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
```

### 5.4 session_state_log

```sql
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
```

---

## 6. Constraints Summary

| Table | Constraint | Type | Purpose |
|-------|-----------|------|---------|
| users | `display_name` length 1-100 | CHECK | Prevent empty or excessively long names |
| users | `id` references `auth.users` | FK (CASCADE) | Tie profile to auth identity |
| sessions | `name` length 1-200 | CHECK | Prevent empty or excessively long names |
| sessions | `invite_code` unique | UNIQUE | One code per session |
| sessions | `host_id` references `users` | FK (CASCADE) | Session belongs to host |
| sessions | `state` validated by trigger | TRIGGER | Enforce state machine transitions |
| session_participations | `(session_id, user_id)` unique | UNIQUE | One participation per user per session |
| session_participations | `session_id` references `sessions` | FK (CASCADE) | Participation belongs to session |
| session_participations | `user_id` references `users` | FK (SET NULL) | Nullable for web players; SET NULL on delete |
| session_participations | `display_name` length 1-100 | CHECK | Prevent empty names |
| session_state_log | `session_id` references `sessions` | FK (CASCADE) | Log belongs to session |

---

## 7. Data Retention

Per PRD section 4.2.2:

| Data | Retention | Implementation |
|------|-----------|---------------|
| Account data (users) | Until account deletion | Standard delete cascade |
| Session + participations | ARCHIVED + 90 days | Scheduled Supabase cron job |
| Session state log | ARCHIVED + 90 days | Cascade with session deletion |
| Generated artifacts | Until user deletes | Separate table (spec 006) |
| Anonymous user records | 30 days after last activity | Supabase cron cleanup |

Retention cleanup implemented as a scheduled PostgreSQL function (via `pg_cron` extension in Supabase):

```sql
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
```
